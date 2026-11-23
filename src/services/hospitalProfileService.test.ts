/** Unit tests for hospitalProfileService — run with `npm test`. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
(globalThis as any).window = globalThis;
(globalThis as any).dispatchEvent = () => true;
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import { profileService as ps, sanitizeDoc, isDocEmpty, docToPlainText, ProfileStorageError, type RichDoc } from './hospitalProfileService.ts';

const K = { seeded: 'careinn_profile_seeded_v1', categories: 'careinn_profile_categories', content: 'careinn_profile_content' };
const put = (k: string, v: unknown) => store.set(k, JSON.stringify(v));
const ids = (rows: { id: string }[]) => rows.map((r) => r.id);
const para = (text: string, extra: Record<string, unknown> = {}) => ({ type: 'paragraph', ...extra, content: [{ type: 'text', text }] });
const doc = (...content: unknown[]): RichDoc => ({ type: 'doc', content } as RichDoc);

beforeEach(() => {
  store.clear();
  store.set(K.seeded, '1');
  put(K.categories, [
    { id: 'v', nameEn: 'Vision', nameAr: 'الرؤية', order: 0, active: true, visibleTerminals: [] },
    { id: 'm', nameEn: 'Mission', nameAr: 'الرسالة', order: 1, active: true, visibleTerminals: [] },
    { id: 'h', nameEn: 'Hotlines', nameAr: 'خطوط عاجلة', order: 2, active: true, visibleTerminals: [] },
  ]);
  put(K.content, [
    { categoryId: 'v', bodyEn: doc(para('Vision text')), bodyAr: doc(para('نص')), attachment: { kind: 'pdf', en: { url: 'https://x/v.pdf', name: 'v.pdf' } }, updatedAt: 1 },
    { categoryId: 'm', bodyEn: doc(para('Mission text')), bodyAr: doc(), attachment: null, updatedAt: 1 },
  ]);
});

// ---- categories ---------------------------------------------------------------------

test('categories list in saved order', () => {
  assert.deepEqual(ids(ps.listCategories()), ['v', 'm', 'h']);
});

test('setCategoryOrder reorders and renumbers', () => {
  ps.setCategoryOrder(['h', 'v', 'm']);
  assert.deepEqual(ids(ps.listCategories()), ['h', 'v', 'm']);
  assert.deepEqual(ps.listCategories().map((c) => c.order), [0, 1, 2]);
});

test('createCategory appends at the end, active by default', () => {
  const c = ps.createCategory({ nameEn: 'Values', nameAr: 'القيم' });
  assert.equal(ps.listCategories().at(-1)!.id, c.id);
  assert.equal(c.active, true);
});

test('deleteCategory removes the category and only its content', () => {
  ps.deleteCategory('v');
  assert.deepEqual(ids(ps.listCategories()), ['m', 'h']);
  assert.equal(ps.getContent('v'), null);
  assert.ok(ps.getContent('m'));
});

test('contentSummary says what a delete would remove', () => {
  assert.deepEqual(ps.contentSummary('v'), { hasText: true, attachment: 'pdf' });
  assert.deepEqual(ps.contentSummary('m'), { hasText: true, attachment: null });
  assert.deepEqual(ps.contentSummary('h'), { hasText: false, attachment: null });
});

test('saveContent creates or updates and sanitizes bodies', () => {
  ps.saveContent('h', { bodyEn: doc(para('Call 997'), { type: 'heading', content: [{ type: 'text', text: 'Big' }] }), attachment: null });
  const c = ps.getContent('h')!;
  assert.equal(docToPlainText(c.bodyEn), 'Call 997\nBig');
  assert.ok(c.bodyEn.content.every((n) => n.type === 'paragraph'));
  assert.ok(c.updatedAt > 0);
});

// ---- sanitizer ------------------------------------------------------------------------

test('sanitizer keeps allowed marks and preset attrs', () => {
  const d = sanitizeDoc(
    doc({
      type: 'paragraph',
      attrs: { align: 'center', lineHeight: 'relaxed', spacing: 'lg' },
      content: [{ type: 'text', text: 'Hi', marks: [{ type: 'bold' }, { type: 'size', attrs: { size: 'lg' } }, { type: 'tone', attrs: { tone: 'brand' } }] }],
    }),
  );
  assert.deepEqual(d.content[0], {
    type: 'paragraph',
    attrs: { align: 'center', lineHeight: 'relaxed', spacing: 'lg' },
    content: [{ type: 'text', text: 'Hi', marks: [{ type: 'bold' }, { type: 'size', attrs: { size: 'lg' } }, { type: 'tone', attrs: { tone: 'brand' } }] }],
  });
});

test('sanitizer drops unknown marks, raw values and bad presets', () => {
  const d = sanitizeDoc(
    doc({
      type: 'paragraph',
      attrs: { align: 'justify', style: 'color:red', lineHeight: '3' },
      content: [
        {
          type: 'text',
          text: 'x',
          marks: [{ type: 'link', attrs: { href: 'javascript:1' } }, { type: 'size', attrs: { size: '72px' } }, { type: 'tone', attrs: { tone: '#ff0000' } }, { type: 'italic' }],
        },
      ],
    }),
  );
  assert.deepEqual(d.content[0], { type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'italic' }] }] });
});

test('sanitizer flattens unknown blocks and keeps lists', () => {
  const d = sanitizeDoc(
    doc(
      { type: 'blockquote', content: [para('quoted')] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [para('one')] }, { type: 'image', attrs: { src: 'x' } }] },
      { type: 'orderedList', attrs: { start: 3, spacing: 'sm' }, content: [{ type: 'listItem', content: [para('three')] }] },
    ),
  );
  assert.deepEqual(d.content.map((n) => n.type), ['paragraph', 'bulletList', 'orderedList']);
  assert.equal((d.content[1] as any).content.length, 1);
  assert.deepEqual((d.content[2] as any).attrs, { start: 3, spacing: 'sm' });
});

test('sanitizer tolerates junk input', () => {
  for (const junk of [null, undefined, 'text', 42, { type: 'nope' }, { type: 'doc', content: 'x' }]) {
    const d = sanitizeDoc(junk as any);
    assert.equal(d.type, 'doc');
    assert.ok(isDocEmpty(d));
  }
});

test('isDocEmpty ignores whitespace and hard breaks', () => {
  assert.ok(isDocEmpty(doc(para('   '), { type: 'paragraph', content: [{ type: 'hardBreak' }] })));
  assert.ok(!isDocEmpty(doc(para(' a '))));
});

test('fresh install seeds the production categories', () => {
  store.clear();
  assert.deepEqual(
    ps.listCategories().map((c) => c.nameEn),
    ['Vision', 'Mission', 'Values', 'Rights & Responsibilities', 'Evacuation map', 'Hotlines'],
  );
});

test('default presets are not stored (md size, text tone, start align, normal line height, md spacing)', () => {
  const d = sanitizeDoc(
    doc({
      type: 'paragraph',
      attrs: { align: 'start', lineHeight: 'normal', spacing: 'md' },
      content: [{ type: 'text', text: 'x', marks: [{ type: 'size', attrs: { size: 'md' } }, { type: 'tone', attrs: { tone: 'text' } }] }],
    }),
  );
  assert.deepEqual(d.content[0], { type: 'paragraph', content: [{ type: 'text', text: 'x' }] });
  const none = sanitizeDoc(doc({ type: 'paragraph', attrs: { spacing: 'none' }, content: [{ type: 'text', text: 'y' }] }));
  assert.deepEqual((none.content[0] as any).attrs, { spacing: 'none' });
});

// ---- review fixes ------------------------------------------------------------------------

test('trailing empty paragraphs are trimmed (a doc ending in a list stays a list)', () => {
  const d = sanitizeDoc(doc({ type: 'bulletList', content: [{ type: 'listItem', content: [para('a')] }] }, { type: 'paragraph' }, { type: 'paragraph', content: [{ type: 'hardBreak' }] }));
  assert.deepEqual(d.content.map((n) => n.type), ['bulletList']);
  assert.deepEqual(sanitizeDoc(doc({ type: 'paragraph' })).content, [{ type: 'paragraph' }]); // never empty
});

test('paragraphs inside list items never carry spacing (spacing belongs to the list)', () => {
  const d = sanitizeDoc(doc({ type: 'bulletList', attrs: { spacing: 'lg' }, content: [{ type: 'listItem', content: [para('a', { attrs: { spacing: 'lg', align: 'center' } })] }] }));
  const list = d.content[0] as any;
  assert.deepEqual(list.attrs, { spacing: 'lg' });
  assert.deepEqual(list.content[0].content[0].attrs, { align: 'center' });
});

const failingStorage = (failKey: string) => {
  const real = (globalThis as any).localStorage.setItem;
  (globalThis as any).localStorage.setItem = (k: string, v: string) => {
    if (k === failKey) throw Object.assign(new Error('QuotaExceededError'), { name: 'QuotaExceededError' });
    real(k, v);
  };
  return () => ((globalThis as any).localStorage.setItem = real);
};

test('a failed write raises ProfileStorageError', () => {
  const restore = failingStorage(K.categories);
  try {
    assert.throws(() => ps.createCategory({ nameEn: 'X', nameAr: 'س' }), (e: any) => e instanceof ProfileStorageError);
  } finally {
    restore();
  }
});

test('deleteCategory removes content first, so a failure leaves a retryable category', () => {
  const restore = failingStorage(K.categories);
  try {
    assert.throws(() => ps.deleteCategory('v'));
  } finally {
    restore();
  }
  assert.ok(ps.listCategories().some((c) => c.id === 'v'));
  ps.deleteCategory('v');
  assert.ok(!ps.listCategories().some((c) => c.id === 'v'));
});

test('updateCategories applies a bulk change in one write', () => {
  let writes = 0;
  const real = (globalThis as any).localStorage.setItem;
  (globalThis as any).localStorage.setItem = (k: string, v: string) => { if (k === K.categories) writes++; real(k, v); };
  try {
    ps.updateCategories(['v', 'h'], { active: false });
  } finally {
    (globalThis as any).localStorage.setItem = real;
  }
  assert.equal(writes, 1);
  assert.deepEqual(ps.listCategories().map((c) => c.active), [false, true, false]);
});

test('seeding never throws even if storage is full', () => {
  store.clear();
  const restore = failingStorage(K.categories);
  try {
    assert.doesNotThrow(() => ps.listCategories());
  } finally {
    restore();
  }
});
