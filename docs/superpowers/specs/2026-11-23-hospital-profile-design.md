# Hospital Profile — redesign with Text Only and rich text

Date: 2026-11-23 · Status: approved by Sara ("go")

## Intent

Production has a Hospital Profile that a developer built directly (Manage Profile →
Profile Categories table + Profile page with a tab per category; each category has an
English and Arabic description and one content type: Image, Stream link, External link
or PDF upload). It was never designed in this demo. Bring it into the demo, redesign the
UI/UX, and add Sara's requirements: category reordering, edit/delete inside the category
view, a safe delete, and a **Text only** type with a restricted rich-text editor and a
patient-screen preview. Patient screen: About Us — dark page, left category menu, white
rounded panel with the category title and its content.

## Goals

- Everything production has: categories (EN/AR names, terminal visibility), per-category
  EN/AR text, and an attachment of type Image, Video stream, External link or PDF.
- Text only (no attachment) with rich text.
- Drag to reorder categories (patient menu order).
- Edit / delete / visibility from the category's own view, not only the table.
- Delete warns what is lost (text, attachment) and needs explicit confirmation.
- Content editor with live patient preview (EN/AR, tablet/TV sizes).
- Data persists (localStorage service, same pattern as CareSuite; `TODO(backend)`).

## Non-goals / anti-goals

- No free HTML/CSS, no custom fonts, no raw colour or pixel values in stored content.
- No change to other Content Manager pages.
- Failure even if it "works": formatting that renders differently or clips on the patient
  screen, or Arabic that does not mirror.

## Decisions

- **Model.** Each category has one content record: `bodyEn` / `bodyAr` (rich text) plus
  optional `attachment` = `{ kind: 'image' | 'stream' | 'link' | 'pdf', en, ar? }`
  (`ar` optional override; shared by both languages otherwise). "Text only" = no
  attachment. Production's plain descriptions become rich text bodies.
- **Editor:** TipTap 3.32.2 (pinned), only the listed features enabled; loaded lazily with
  the editor. Approaches considered: TipTap (picked), home-made contentEditable (deprecated
  execCommand, RTL bugs), block editor without inline marks (too limited).
- **Stored format:** TipTap JSON restricted to: paragraph, bulletList, orderedList,
  listItem, hardBreak, text; marks bold, italic, underline, `size`, `tone`; block attrs
  `align` (start|center|end), `lineHeight` (tight|normal|relaxed), `spacing`
  (none|sm|md|lg). Presets, not values: size sm|md|lg|xl, tone text|muted|brand|alert|success.
  The patient app maps presets to real values (brand from Identity Settings). A sanitizer
  drops anything else (also on paste).
- **Direction:** EN body `ltr`, AR body `rtl`; alignment is logical (start/end).
- **Preview:** mirrors the patient About Us panel; EN/AR switch; Tablet (1280×800) and
  TV (1920×1080) frames scaled to fit; text wraps, never clips.
- **Delete:** dialog lists what will be removed and needs "I understand this can't be
  undone" ticked.
- **Layout:** Categories tab (table: drag order, checkboxes + Quick Actions, visibility,
  sortable columns per the table rule) and Content tab (category list left, category view
  right with Edit / Delete / Visibility / Edit content).

## Left to the builder

Exact preset values for the dashboard preview; toolbar layout; seed content.
