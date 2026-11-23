/**
 * Renders a stored rich-text doc (no editor code — cheap to use anywhere).
 * Only the allowed nodes/marks/presets exist after sanitizeDoc, so this is the
 * complete rendering contract. Text wraps and long words break; nothing clips.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { BlockAttrs, RichBlock, RichDoc, RichInline } from '../../../services/hospitalProfileService';
import { LINE_HEIGHT, SIZE_EM, SPACING_EM, toneColor } from './presets';

function inline(nodes: RichInline[] | undefined, brand: string): ReactNode[] {
  return (nodes ?? []).map((n, i) => {
    if (n.type === 'hardBreak') return <br key={i} />;
    let el: ReactNode = n.text;
    const style: CSSProperties = {};
    for (const m of n.marks ?? []) {
      if (m.type === 'bold') el = <strong>{el}</strong>;
      else if (m.type === 'italic') el = <em>{el}</em>;
      else if (m.type === 'underline') el = <u>{el}</u>;
      else if (m.type === 'size') style.fontSize = SIZE_EM[m.attrs.size];
      else if (m.type === 'tone') style.color = toneColor(m.attrs.tone, brand);
    }
    return (
      <span key={i} style={Object.keys(style).length ? style : undefined}>
        {el}
      </span>
    );
  });
}

const blockStyle = (a: BlockAttrs | undefined, last: boolean): CSSProperties => ({
  textAlign: a?.align ?? 'start',
  lineHeight: LINE_HEIGHT[a?.lineHeight ?? 'normal'],
  margin: 0,
  marginBlockEnd: last ? 0 : SPACING_EM[a?.spacing ?? 'md'],
});

function blocks(list: RichBlock[] | undefined, brand: string, nested = false): ReactNode[] {
  const all = list ?? [];
  return all.map((b, i) => {
    const last = i === all.length - 1;
    if (b.type === 'paragraph') {
      const content = inline(b.content, brand);
      return (
        <p key={i} style={blockStyle(b.attrs, last || nested)}>
          {content.length ? content : <br />}
        </p>
      );
    }
    const Tag = b.type === 'orderedList' ? 'ol' : 'ul';
    return (
      <Tag
        key={i}
        start={b.type === 'orderedList' ? b.attrs?.start : undefined}
        style={{ ...blockStyle(b.attrs, last), paddingInlineStart: '1.4em', listStyleType: b.type === 'orderedList' ? 'decimal' : 'disc' }}
      >
        {b.content.map((li, j) => (
          <li key={j} style={{ marginBlockEnd: '0.25em' }}>
            {blocks(li.content, brand, true)}
          </li>
        ))}
      </Tag>
    );
  });
}

export default function RichTextView({
  doc,
  dir,
  brand,
  className,
  style,
}: {
  doc: RichDoc;
  dir: 'ltr' | 'rtl';
  brand: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div dir={dir} className={className} style={{ color: '#16274D', overflowWrap: 'anywhere', wordBreak: 'break-word', ...style }}>
      {blocks(doc.content, brand)}
    </div>
  );
}
