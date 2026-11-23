/**
 * Restricted rich-text editor (TipTap). Loaded lazily — import via
 * React.lazy(() => import('./RichTextEditor')). Emits sanitized RichDoc JSON.
 */
import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, RemoveFormatting,
} from 'lucide-react';
import { sanitizeDoc, SIZES, TONES, LINE_HEIGHTS, SPACINGS, type RichDoc, type Size, type Tone, type LineHeight, type Spacing, type Align } from '../../../services/hospitalProfileService';
import { profileExtensions } from './extensions';
import { LINE_HEIGHT, LINE_HEIGHT_LABEL, SIZE_EM, SIZE_LABEL, SPACING_EM, SPACING_LABEL, TONE_LABEL, toneColor } from './presets';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/** Editor-only CSS so formatting shows while typing (Tailwind's reset removes list styles). */
function editorCss(scope: string, brand: string) {
  const r: string[] = [
    `${scope} .ProseMirror{outline:none;min-height:180px;color:#16274D;overflow-wrap:anywhere;line-height:${LINE_HEIGHT.normal}}`,
    `${scope} .ProseMirror p{margin:0 0 ${SPACING_EM.md}}`,
    `${scope} .ProseMirror ul{list-style:disc;padding-inline-start:1.4em;margin:0 0 ${SPACING_EM.md}}`,
    `${scope} .ProseMirror ol{list-style:decimal;padding-inline-start:1.4em;margin:0 0 ${SPACING_EM.md}}`,
    `${scope} .ProseMirror li{margin-bottom:0.25em}`,
    `${scope} .ProseMirror li p{margin:0}`,
  ];
  SIZES.forEach((s) => r.push(`${scope} [data-size="${s}"]{font-size:${SIZE_EM[s]}}`));
  TONES.forEach((t) => r.push(`${scope} [data-tone="${t}"]{color:${toneColor(t, brand)}}`));
  (['start', 'center', 'end'] as const).forEach((a) => r.push(`${scope} [data-align="${a}"]{text-align:${a}}`));
  LINE_HEIGHTS.forEach((l) => r.push(`${scope} [data-line-height="${l}"],${scope} [data-lineheight="${l}"]{line-height:${LINE_HEIGHT[l]}}`));
  // spacing applies to top-level paragraphs and lists only (never to paragraphs inside list items)
  SPACINGS.forEach((s) => r.push(`${scope} .ProseMirror > [data-spacing="${s}"]{margin-bottom:${SPACING_EM[s]}}`));
  return r.join('\n');
}

function Btn({ on, onClick, title, children, disabled }: { on?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={cx(
        'w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        on ? 'bg-[#16274D] text-white' : 'text-[#16274D] hover:bg-[#eef1f7]',
      )}
    >
      {children}
    </button>
  );
}

function Select<T extends string>({ value, options, labels, onChange, title, width }: { value: T; options: readonly T[]; labels: Record<T, string>; onChange: (v: T) => void; title: string; width: number }) {
  return (
    <select
      title={title}
      aria-label={title}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{ width }}
      className="h-8 px-2 rounded-md border border-[#e2e6ee] bg-white text-[12.5px] text-[#16274D] cursor-pointer outline-none focus:border-[#4EBEE3]"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {labels[o]}
        </option>
      ))}
    </select>
  );
}

const Sep = () => <span className="w-px h-6 bg-[#e2e6ee] mx-0.5" aria-hidden />;

function Toolbar({ editor, dir, brand }: { editor: Editor; dir: 'ltr' | 'rtl'; brand: string }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      size: (e.getAttributes('size').size as Size) || 'md',
      tone: (e.getAttributes('tone').tone as Tone) || 'text',
      align: (e.getAttributes('paragraph').align as Align) || 'start',
      lineHeight: (e.getAttributes('paragraph').lineHeight as LineHeight) || 'normal',
      spacing: ((e.isActive('orderedList') ? e.getAttributes('orderedList') : e.isActive('bulletList') ? e.getAttributes('bulletList') : e.getAttributes('paragraph')).spacing as Spacing) || 'md',
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const setPreset = (mark: 'size' | 'tone', value: string, fallback: string) =>
    value === fallback ? chain().unsetMark(mark).run() : chain().setMark(mark, { [mark]: value }).run();
  const setBlock = (attr: 'align' | 'lineHeight' | 'spacing', value: string | null) => {
    if (attr !== 'spacing') return chain().updateAttributes('paragraph', { [attr]: value }).run();
    // space after a list is set on the list; elsewhere on the paragraph
    const list = editor.isActive('orderedList') ? 'orderedList' : editor.isActive('bulletList') ? 'bulletList' : null;
    return chain().updateAttributes(list ?? 'paragraph', { spacing: value }).run();
  };

  // logical alignment: in Arabic "start" is the right edge
  const StartIcon = dir === 'rtl' ? AlignRight : AlignLeft;
  const EndIcon = dir === 'rtl' ? AlignLeft : AlignRight;

  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[#e2e6ee] bg-[#f8fafc] rounded-t-[10px]" dir="ltr" role="toolbar" aria-label="Formatting">
      <Select title="Text size" value={s.size} options={SIZES} labels={SIZE_LABEL} onChange={(v) => setPreset('size', v, 'md')} width={84} />
      <div className="flex items-center gap-0.5 ml-1" role="radiogroup" aria-label="Text colour">
        {TONES.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={s.tone === t}
            title={TONE_LABEL[t]}
            aria-label={TONE_LABEL[t]}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setPreset('tone', t, 'text')}
            className={cx('w-6 h-6 rounded-full inline-flex items-center justify-center cursor-pointer', s.tone === t && 'ring-2 ring-offset-1 ring-[#4EBEE3]')}
          >
            <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: toneColor(t, brand) }} />
          </button>
        ))}
      </div>
      <Sep />
      <Btn title="Bold" on={s.bold} onClick={() => chain().toggleBold().run()}>
        <Bold size={16} />
      </Btn>
      <Btn title="Italic" on={s.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic size={16} />
      </Btn>
      <Btn title="Underline" on={s.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline size={16} />
      </Btn>
      <Sep />
      <Btn title="Align to start" on={s.align === 'start'} onClick={() => setBlock('align', null)}>
        <StartIcon size={16} />
      </Btn>
      <Btn title="Centre" on={s.align === 'center'} onClick={() => setBlock('align', 'center')}>
        <AlignCenter size={16} />
      </Btn>
      <Btn title="Align to end" on={s.align === 'end'} onClick={() => setBlock('align', 'end')}>
        <EndIcon size={16} />
      </Btn>
      <Sep />
      <Btn title="Bulleted list" on={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <List size={16} />
      </Btn>
      <Btn title="Numbered list" on={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered size={16} />
      </Btn>
      <Sep />
      <Select title="Line spacing" value={s.lineHeight} options={LINE_HEIGHTS} labels={LINE_HEIGHT_LABEL} onChange={(v) => setBlock('lineHeight', v === 'normal' ? null : v)} width={88} />
      <Select title="Space after paragraph" value={s.spacing} options={SPACINGS} labels={SPACING_LABEL} onChange={(v) => setBlock('spacing', v === 'md' ? null : v)} width={86} />
      <Sep />
      <Btn title="Clear formatting" onClick={() => chain().unsetAllMarks().updateAttributes('paragraph', { align: null, lineHeight: null, spacing: null }).updateAttributes('bulletList', { spacing: null }).updateAttributes('orderedList', { spacing: null }).run()}>
        <RemoveFormatting size={16} />
      </Btn>
      <Btn title="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 size={16} />
      </Btn>
      <Btn title="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 size={16} />
      </Btn>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  dir,
  brand,
  placeholder,
  id,
}: {
  value: RichDoc;
  onChange: (doc: RichDoc) => void;
  dir: 'ltr' | 'rtl';
  brand: string;
  placeholder?: string;
  id: string;
}) {
  const editor = useEditor({
    extensions: profileExtensions,
    content: value,
    editorProps: {
      attributes: { dir, 'aria-label': placeholder || 'Text', class: 'px-4 py-3 text-[15px]' },
      // plain-text paste fallback keeps line breaks; HTML paste is filtered by the schema
    },
    onUpdate: ({ editor: e }) => onChange(sanitizeDoc(e.getJSON())),
  });

  // keep the direction attribute in sync if the language switches
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { dir, 'aria-label': placeholder || 'Text', class: 'px-4 py-3 text-[15px]' } } });
  }, [editor, dir, placeholder]);

  const isEmpty = useEditorState({ editor, selector: ({ editor: e }) => e?.isEmpty ?? true });

  if (!editor) return null;
  const scope = `.rte-${id}`;
  return (
    <div className={`rte-${id} relative border border-[#d6dae6] rounded-[10px] bg-white focus-within:border-[#4EBEE3] transition-colors`}>
      <style>{editorCss(scope, brand)}</style>
      <Toolbar editor={editor} dir={dir} brand={brand} />
      <div className="relative">
        {isEmpty && placeholder && (
          <div className="absolute top-3 px-4 text-[15px] text-gray-400 pointer-events-none w-full" dir={dir} style={{ textAlign: 'start' }}>
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
