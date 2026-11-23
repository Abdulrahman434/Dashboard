/**
 * TipTap schema for profile text: StarterKit minus everything not allowed, plus
 * preset-only marks (size, tone) and block attributes (align, line height,
 * spacing). Only data-* attributes are parsed, so pasted inline styles, fonts
 * and colours from Word or the web are dropped by the schema itself.
 */
import { Extension, Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { ALIGNS, LINE_HEIGHTS, SIZES, SPACINGS, TONES } from '../../../services/hospitalProfileService';

const pick = (list: readonly string[], v: string | null) => (v && list.includes(v) ? v : null);

const presetMark = (name: 'size' | 'tone', list: readonly string[]) =>
  Mark.create({
    name,
    addAttributes() {
      return {
        [name]: {
          default: null,
          parseHTML: (el: HTMLElement) => pick(list, el.getAttribute(`data-${name}`)),
          renderHTML: (attrs: Record<string, string | null>) => (attrs[name] ? { [`data-${name}`]: attrs[name] } : {}),
        },
      };
    },
    parseHTML() {
      return [{ tag: `span[data-${name}]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', HTMLAttributes, 0];
    },
  });

export const SizeMark = presetMark('size', SIZES);
export const ToneMark = presetMark('tone', TONES);

const blockAttr = (name: string, list: readonly string[]) => ({
  default: null,
  parseHTML: (el: HTMLElement) => pick(list, el.getAttribute(`data-${name}`)),
  renderHTML: (attrs: Record<string, string | null>) => (attrs[name] ? { [`data-${name}`]: attrs[name] } : {}),
});

export const BlockStyle = Extension.create({
  name: 'blockStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'bulletList', 'orderedList'],
        attributes: {
          align: blockAttr('align', ALIGNS),
          lineHeight: blockAttr('lineHeight', LINE_HEIGHTS),
          spacing: blockAttr('spacing', SPACINGS),
        },
      },
    ];
  },
});

export const profileExtensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    strike: false,
    horizontalRule: false,
    link: false,
  }),
  SizeMark,
  ToneMark,
  BlockStyle,
];
