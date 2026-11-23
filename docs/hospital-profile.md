# Hospital Profile (About Us)

Branch `sara` · 2026-11-23 · Design: [specs/2026-11-23-hospital-profile-design.md](superpowers/specs/2026-11-23-hospital-profile-design.md)

## What admins get

Content Manager → **Hospital Profile**, two tabs:

- **Categories**: the About Us menu in patient order. Drag to reorder; tick rows for Quick
  Actions (Edit content, Rename, Activate, Deactivate, Set visibility, Delete); every column
  sorts (dragging pauses while sorted); per-row Edit content, Rename, Visibility, Delete.
- **Content**: categories on the left (drag to reorder), the selected category on the right
  with its English and Arabic content side by side and **Rename / Visibility / Delete /
  Edit content** right there.
- **Edit content**: choose the type: **Text only**, Image, Video stream, External link or
  PDF. Write the English and Arabic text with the formatting toolbar, and see a live
  **patient preview** (EN/AR, Tablet 1280×800 or TV 1920×1080). The preview warns when
  text is longer than the panel, so patients will need to scroll.
- **Delete** lists what will be lost (text, PDF, …) and needs "I understand this can't be
  undone" ticked.

Every category has English and Arabic text; the type adds one optional attachment.
"Text only" has none. An attachment is shared by both languages unless "Use a different …
for Arabic" is ticked.

## For the patient app

Read per category (`src/services/hospitalProfileService.ts`):

```ts
ProfileCategory { id, nameEn, nameAr, order, active, visibleTerminals: string[] /* [] = all */ }
ProfileContent  { categoryId, bodyEn: RichDoc, bodyAr: RichDoc,
                  attachment: null | { kind: 'image'|'stream'|'link'|'pdf',
                                       en: { url, name? }, ar?: { url, name? } },
                  updatedAt }
```

Show active categories in `order`, filtered by the terminal's id when `visibleTerminals`
is not empty. Title = `nameEn` / `nameAr`.

### Rich text (`RichDoc`)

A TipTap/ProseMirror JSON document restricted to:

| Kind | Allowed |
|---|---|
| Blocks | `paragraph`, `bulletList`, `orderedList` (attr `start`), `listItem` |
| Inline | `text`, `hardBreak` |
| Marks | `bold`, `italic`, `underline`, `size` (`sm` `lg` `xl`; none = normal), `tone` (`muted` `brand` `alert` `success`; none = text colour) |
| Block attrs | `align` (`center` `end`; none = start), `lineHeight` (`tight` `relaxed`; none = normal), `spacing` after the block (`none` `sm` `lg`; none = medium) |

Nothing else is ever stored. `sanitizeDoc()` enforces it on every save, and the editor's
schema already drops pasted fonts, colours, links and images.

Render with **relative** values so it scales with the screen's base font size. The
dashboard preview uses these (a renderer: `hospital-profile/richText/RichTextView.tsx`):

| Preset | Value |
|---|---|
| size sm / md / lg / xl | 0.875em / 1em / 1.25em / 1.6em |
| tone text / muted / brand / alert / success | #16274D / #6B7280 / Identity Settings primary / #E5484D / #1F9E75 |
| lineHeight tight / normal / relaxed | 1.3 / 1.6 / 1.9 |
| spacing none / sm / md / lg | 0 / 0.4em / 0.9em / 1.5em |

- `bodyAr` is right-to-left (`dir="rtl"`), `bodyEn` left-to-right. `align` is logical
  (start/end), so it mirrors automatically; lists indent on the start side.
- Wrap long words (`overflow-wrap: anywhere`); let the panel scroll vertically rather than
  clip.
- One font family: the patient app's own. The dashboard does not store fonts.

### Attachments

- `image`: show below the text, contained, never cropped.
- `stream`: video player for `url` (`https`, `rtsp` or `rtmp`).
- `link`: a button that opens `url` (`https`).
- `pdf`: a "view PDF" card that opens the document.
- In Arabic use `ar` when present, else `en`.

## Remaining integration work

1. **Backend storage and API** for categories, content and files. The demo keeps
   everything in browser localStorage (`TODO(backend)`), which limits uploads to 1.5 MB
   images and 2 MB PDFs. A backend should store files and return URLs instead of data URLs.
2. **Patient app**: render `RichDoc` with the presets above (or reuse `RichTextView`'s
   logic), apply terminal visibility, and play/open attachments.
3. **Terminals**: the visibility dialogs still use sample terminals; wire them to the
   Device Manager list.
4. **Migration from production**: production's plain descriptions become one paragraph per
   line in `bodyEn` / `bodyAr`; its content type maps to `attachment.kind` (Image → image,
   Stream link → stream, External link → link, PDF upload → pdf).

## Tests

`npm test`: 13 tests on the service: ordering, delete removes only that category's
content, delete summary, save sanitizes, the sanitizer keeps allowed presets and drops
unknown nodes, marks, raw values and junk, empty detection, and seeding.
Checked in headless Chrome: reorder in both tabs (persists), formatting and Arabic RTL,
paste sanitizing, link validation, PDF upload, TV preview, and safe delete.
