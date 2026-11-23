/**
 * hospitalProfileService
 * --------------------------------------------------------------------------
 * Hospital Profile (patient "About Us"): categories in patient order, each with
 * one content record — English / Arabic rich text plus an optional attachment
 * (image, video stream, external link or PDF). No attachment = "Text only".
 *
 * Rich text is stored as a restricted TipTap JSON document. Formatting is kept
 * as named presets (size, tone, alignment, spacing) — never raw CSS values —
 * and sanitizeDoc() strips anything else, so the patient app can render it
 * consistently on every screen and brand.
 *
 * INTERIM PERSISTENCE: localStorage, like careSuiteService. // TODO(backend)
 */

const CATEGORIES_KEY = 'careinn_profile_categories';
const CONTENT_KEY = 'careinn_profile_content';
const SEEDED_KEY = 'careinn_profile_seeded_v1';
export const PROFILE_EVENT = 'careinn:profile-changed';

// ---- rich text ------------------------------------------------------------------------

export const SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export const TONES = ['text', 'muted', 'brand', 'alert', 'success'] as const;
export const ALIGNS = ['start', 'center', 'end'] as const;
export const LINE_HEIGHTS = ['tight', 'normal', 'relaxed'] as const;
export const SPACINGS = ['none', 'sm', 'md', 'lg'] as const;
export type Size = (typeof SIZES)[number];
export type Tone = (typeof TONES)[number];
export type Align = (typeof ALIGNS)[number];
export type LineHeight = (typeof LINE_HEIGHTS)[number];
export type Spacing = (typeof SPACINGS)[number];

export type RichMark =
  | { type: 'bold' | 'italic' | 'underline' }
  | { type: 'size'; attrs: { size: Size } }
  | { type: 'tone'; attrs: { tone: Tone } };
export type RichInline = { type: 'text'; text: string; marks?: RichMark[] } | { type: 'hardBreak' };
export interface BlockAttrs {
  align?: Align;
  lineHeight?: LineHeight;
  spacing?: Spacing;
}
export type RichBlock =
  | { type: 'paragraph'; attrs?: BlockAttrs; content?: RichInline[] }
  | { type: 'bulletList'; attrs?: BlockAttrs; content: RichListItem[] }
  | { type: 'orderedList'; attrs?: BlockAttrs & { start?: number }; content: RichListItem[] };
export interface RichListItem {
  type: 'listItem';
  content: RichBlock[];
}
export interface RichDoc {
  type: 'doc';
  content: RichBlock[];
}

export const emptyDoc = (): RichDoc => ({ type: 'doc', content: [{ type: 'paragraph' }] });

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === 'string' && (list as readonly string[]).includes(v);
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

function cleanBlockAttrs(a: unknown, list = false): (BlockAttrs & { start?: number }) | undefined {
  if (!isObj(a)) return undefined;
  const out: BlockAttrs & { start?: number } = {};
  if (list && Number.isInteger(a.start) && a.start > 1) out.start = a.start;
  if (oneOf(ALIGNS, a.align)) out.align = a.align;
  if (oneOf(LINE_HEIGHTS, a.lineHeight)) out.lineHeight = a.lineHeight;
  if (oneOf(SPACINGS, a.spacing)) out.spacing = a.spacing;
  // defaults are not stored
  if (out.align === 'start') delete out.align;
  if (out.lineHeight === 'normal') delete out.lineHeight;
  if (out.spacing === 'md') delete out.spacing;
  return Object.keys(out).length ? out : undefined;
}

function cleanMarks(marks: unknown): RichMark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: RichMark[] = [];
  const seen = new Set<string>();
  for (const m of marks) {
    if (!isObj(m) || seen.has(m.type)) continue;
    if (m.type === 'bold' || m.type === 'italic' || m.type === 'underline') out.push({ type: m.type });
    else if (m.type === 'size' && oneOf(SIZES, m.attrs?.size) && m.attrs.size !== 'md') out.push({ type: 'size', attrs: { size: m.attrs.size } });
    else if (m.type === 'tone' && oneOf(TONES, m.attrs?.tone) && m.attrs.tone !== 'text') out.push({ type: 'tone', attrs: { tone: m.attrs.tone } });
    else continue;
    seen.add(m.type);
  }
  return out.length ? out : undefined;
}

function cleanInline(nodes: unknown): RichInline[] {
  if (!Array.isArray(nodes)) return [];
  const out: RichInline[] = [];
  for (const n of nodes) {
    if (!isObj(n)) continue;
    if (n.type === 'hardBreak') out.push({ type: 'hardBreak' });
    else if (n.type === 'text' && typeof n.text === 'string' && n.text.length) {
      const marks = cleanMarks(n.marks);
      out.push(marks ? { type: 'text', text: n.text, marks } : { type: 'text', text: n.text });
    } else if (Array.isArray(n.content)) out.push(...cleanInline(n.content)); // unknown inline wrapper: keep its text
  }
  return out;
}

const INLINE_TYPES = new Set(['text', 'hardBreak']);

function cleanBlocks(nodes: unknown): RichBlock[] {
  if (!Array.isArray(nodes)) return [];
  const out: RichBlock[] = [];
  for (const n of nodes) {
    if (!isObj(n)) continue;
    if (n.type === 'paragraph') {
      const attrs = cleanBlockAttrs(n.attrs);
      const content = cleanInline(n.content);
      out.push({ type: 'paragraph', ...(attrs ? { attrs } : {}), ...(content.length ? { content } : {}) });
    } else if (n.type === 'bulletList' || n.type === 'orderedList') {
      const items = (Array.isArray(n.content) ? n.content : [])
        .filter((li: unknown) => isObj(li) && li.type === 'listItem')
        .map((li: any): RichListItem => {
          const inner = cleanBlocks(li.content);
          return { type: 'listItem', content: inner.length ? inner : [{ type: 'paragraph' }] };
        });
      if (!items.length) continue;
      const attrs = cleanBlockAttrs(n.attrs, n.type === 'orderedList');
      out.push({ type: n.type, ...(attrs ? { attrs } : {}), content: items } as RichBlock);
    } else if (Array.isArray(n.content)) {
      // unknown block (heading, blockquote, …): keep its text, drop its formatting
      const inlineOnly = n.content.every((c: any) => isObj(c) && INLINE_TYPES.has(c.type));
      if (inlineOnly) {
        const content = cleanInline(n.content);
        if (content.length) out.push({ type: 'paragraph', content });
      } else out.push(...cleanBlocks(n.content));
    }
  }
  return out;
}

/** Keep only the allowed nodes, marks and preset attributes. Always returns a valid doc. */
export function sanitizeDoc(input: unknown): RichDoc {
  const blocks = isObj(input) && input.type === 'doc' ? cleanBlocks(input.content) : [];
  return { type: 'doc', content: blocks.length ? blocks : [{ type: 'paragraph' }] };
}

/** Text of a doc, one line per paragraph (lists: one line per item). */
export function docToPlainText(d: RichDoc | null | undefined): string {
  const lines: string[] = [];
  const walk = (blocks: RichBlock[] | undefined) => {
    for (const b of blocks ?? []) {
      if (b.type === 'paragraph') lines.push((b.content ?? []).map((i) => (i.type === 'text' ? i.text : '\n')).join(''));
      else for (const li of b.content) walk(li.content);
    }
  };
  walk(d?.content);
  return lines.join('\n').trim();
}

export const isDocEmpty = (d: RichDoc | null | undefined) => docToPlainText(d).trim().length === 0;

// ---- model ----------------------------------------------------------------------------

export type AttachmentKind = 'image' | 'stream' | 'link' | 'pdf';
export interface AttachmentRef {
  url: string; // https URL, or a data URL for uploaded images / PDFs
  name?: string;
}
export interface Attachment {
  kind: AttachmentKind;
  en: AttachmentRef;
  /** Arabic-specific file/link; when absent the English one is used for both. */
  ar?: AttachmentRef;
}

export interface ProfileCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  order: number;
  active: boolean;
  /** terminal ids that show this category; empty = every terminal */
  visibleTerminals: string[];
}

export interface ProfileContent {
  categoryId: string;
  bodyEn: RichDoc;
  bodyAr: RichDoc;
  /** null = Text only */
  attachment: Attachment | null;
  updatedAt: number;
}

export const ATTACHMENT_LABEL: Record<AttachmentKind, string> = {
  image: 'Image',
  stream: 'Video stream',
  link: 'External link',
  pdf: 'PDF',
};

// ---- storage ---------------------------------------------------------------------------

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  // TODO(backend): replace with the appropriate POST/PUT/DELETE call
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT));
}

let idCounter = 0;
const makeId = () => `pc-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const p = (text: string): RichBlock => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const pDoc = (...blocks: RichBlock[]): RichDoc => ({ type: 'doc', content: blocks });

function seedIfEmpty(): void {
  if (typeof window === 'undefined' || localStorage.getItem(SEEDED_KEY)) return;
  const cats: [string, string, string][] = [
    ['prof-vision', 'Vision', 'الرؤية'],
    ['prof-mission', 'Mission', 'الرسالة'],
    ['prof-values', 'Values', 'القيم'],
    ['prof-rights', 'Rights & Responsibilities', 'حقوق وواجبات المريض'],
    ['prof-evac', 'Evacuation map', 'خريطة الإخلاء'],
    ['prof-hotlines', 'Hotlines', 'خطوط عاجلة'],
  ];
  const categories: ProfileCategory[] = cats.map(([id, nameEn, nameAr], order) => ({ id, nameEn, nameAr, order, active: true, visibleTerminals: [] }));
  const now = Date.now();
  const content: ProfileContent[] = [
    {
      categoryId: 'prof-vision',
      bodyEn: pDoc(p('To empower healthcare providers with technology that boosts efficiency and prioritizes patient experience and well-being.')),
      bodyAr: pDoc(p('تمكين مقدمي الرعاية الصحية بالتقنيات التي تعزز الكفاءة وتضع تجربة المريض وراحته في المقام الأول.')),
      attachment: null,
      updatedAt: now,
    },
    {
      categoryId: 'prof-values',
      bodyEn: pDoc({
        type: 'bulletList',
        content: ['Compassion', 'Respect', 'Safety', 'Excellence'].map((t) => ({ type: 'listItem', content: [p(t)] })),
      }),
      bodyAr: pDoc({
        type: 'bulletList',
        content: ['الرحمة', 'الاحترام', 'السلامة', 'التميز'].map((t) => ({ type: 'listItem', content: [p(t)] })),
      }),
      attachment: null,
      updatedAt: now,
    },
    {
      categoryId: 'prof-hotlines',
      bodyEn: pDoc(
        { type: 'paragraph', content: [{ type: 'text', text: 'Emergency: 997', marks: [{ type: 'bold' }, { type: 'tone', attrs: { tone: 'alert' } }] }] },
        p('Patient relations: 920000000'),
      ),
      bodyAr: pDoc(
        { type: 'paragraph', content: [{ type: 'text', text: 'الطوارئ: 997', marks: [{ type: 'bold' }, { type: 'tone', attrs: { tone: 'alert' } }] }] },
        p('علاقات المرضى: 920000000'),
      ),
      attachment: null,
      updatedAt: now,
    },
  ];
  write(CATEGORIES_KEY, categories);
  write(CONTENT_KEY, content);
  localStorage.setItem(SEEDED_KEY, '1');
}

export const profileService = {
  listCategories(): ProfileCategory[] {
    seedIfEmpty();
    return read<ProfileCategory[]>(CATEGORIES_KEY, [])
      .map((c, i) => ({ ...c, order: c.order ?? i, active: c.active ?? true, visibleTerminals: c.visibleTerminals ?? [] }))
      .sort((a, b) => a.order - b.order);
  },
  createCategory(input: { nameEn: string; nameAr: string; active?: boolean; visibleTerminals?: string[] }): ProfileCategory {
    const cats = this.listCategories();
    const cat: ProfileCategory = {
      id: makeId(),
      nameEn: input.nameEn.trim(),
      nameAr: input.nameAr.trim(),
      order: cats.length ? Math.max(...cats.map((c) => c.order)) + 1 : 0,
      active: input.active ?? true,
      visibleTerminals: input.visibleTerminals ?? [],
    };
    write(CATEGORIES_KEY, [...cats, cat]);
    return cat;
  },
  updateCategory(id: string, patch: Partial<Omit<ProfileCategory, 'id' | 'order'>>): void {
    write(CATEGORIES_KEY, this.listCategories().map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },
  isNameTaken(nameEn: string, excludeId?: string): boolean {
    const n = nameEn.trim().toLowerCase();
    return this.listCategories().some((c) => c.id !== excludeId && c.nameEn.trim().toLowerCase() === n);
  },
  /** Patient menu order. Ids not listed keep their relative order after the listed ones. */
  setCategoryOrder(orderedIds: string[]): void {
    const pos = new Map(orderedIds.map((id, i) => [id, i]));
    const cats = this.listCategories();
    const sorted = cats
      .map((c, i) => ({ c, k: pos.has(c.id) ? pos.get(c.id)! : orderedIds.length + i }))
      .sort((a, b) => a.k - b.k)
      .map(({ c }, order) => ({ ...c, order }));
    write(CATEGORIES_KEY, sorted);
  },
  /** Deletes the category and its content. */
  deleteCategory(id: string): void {
    write(CATEGORIES_KEY, this.listCategories().filter((c) => c.id !== id));
    write(CONTENT_KEY, read<ProfileContent[]>(CONTENT_KEY, []).filter((c) => c.categoryId !== id));
  },

  getContent(categoryId: string): ProfileContent | null {
    seedIfEmpty();
    const c = read<ProfileContent[]>(CONTENT_KEY, []).find((x) => x.categoryId === categoryId);
    return c ? { ...c, bodyEn: sanitizeDoc(c.bodyEn), bodyAr: sanitizeDoc(c.bodyAr), attachment: c.attachment ?? null } : null;
  },
  saveContent(categoryId: string, patch: Partial<Pick<ProfileContent, 'bodyEn' | 'bodyAr' | 'attachment'>>): void {
    const all = read<ProfileContent[]>(CONTENT_KEY, []);
    const prev = all.find((x) => x.categoryId === categoryId);
    const next: ProfileContent = {
      categoryId,
      bodyEn: sanitizeDoc(patch.bodyEn ?? prev?.bodyEn),
      bodyAr: sanitizeDoc(patch.bodyAr ?? prev?.bodyAr),
      attachment: patch.attachment !== undefined ? patch.attachment : prev?.attachment ?? null,
      updatedAt: Date.now(),
    };
    write(CONTENT_KEY, [...all.filter((x) => x.categoryId !== categoryId), next]);
  },
  /** What deleting this category would remove. */
  contentSummary(categoryId: string): { hasText: boolean; attachment: AttachmentKind | null } {
    const c = this.getContent(categoryId);
    return {
      hasText: !!c && (!isDocEmpty(c.bodyEn) || !isDocEmpty(c.bodyAr)),
      attachment: c?.attachment?.kind ?? null,
    };
  },
};
