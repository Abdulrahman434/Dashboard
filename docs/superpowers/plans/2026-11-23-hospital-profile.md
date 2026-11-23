# Hospital Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Redesigned Hospital Profile with persistent categories/content, drag reorder, in-view edit/delete, safe delete, and a Text only type with a restricted rich-text editor and patient preview.

**Architecture:** `hospitalProfileService.ts` (localStorage, tested with `node --test`) owns categories, order, content and the rich-text sanitizer. UI: `src/components/hospital-profile/` — page shell with PillTabs, categories table, content view, content editor (TipTap, lazy), patient preview, dialogs.

**Tech Stack:** React 18, Vite 6, Tailwind 4, @dnd-kit (existing), TipTap 3.32.2 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-text-align`), Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-23-hospital-profile-design.md`

## Global Constraints

- Stored rich text = restricted TipTap JSON only (nodes/marks/attrs listed in the spec); everything else is stripped by `sanitizeDoc`.
- Presets, never raw values: size `sm|md|lg|xl`, tone `text|muted|brand|alert|success`, align `start|center|end`, lineHeight `tight|normal|relaxed`, spacing `none|sm|md|lg`.
- AR body renders `dir="rtl"`, EN `dir="ltr"`.
- Every sortable table column is sortable (repo rule); dragging is off while sorted.
- Delete requires the acknowledgement checkbox.
- TipTap versions pinned exactly to 3.32.2; the editor chunk is loaded lazily.

## Review Focus

1. Pasted content from Word/web keeps only allowed formatting (sanitizer).
2. Existing prototype data (none persisted) and empty bodies render a sensible empty state.
3. Arabic list bullets / numbers and alignment mirror in the preview.
4. Long words / long lists wrap without horizontal overflow in the preview at both sizes.
5. Deleting the selected category in the Content tab moves selection to a neighbour.

---

### Task 1: Service + sanitizer (TDD)
Files: `src/services/hospitalProfileService.ts`, `.test.ts`.
Produces: `ProfileCategory {id,nameEn,nameAr,order,active,visibleTerminals}`, `ProfileContent {categoryId,bodyEn,bodyAr,attachment|null,updatedAt}`, `RichDoc`; `listCategories()`, `createCategory`, `updateCategory`, `setCategoryOrder(ids)`, `deleteCategory(id)` (removes content), `getContent(id)`, `saveContent(id, patch)`, `contentSummary(id)` (what delete removes), `sanitizeDoc(doc)`, `isDocEmpty(doc)`, `docToPlainText(doc)`; seed = production's categories (Vision, Mission, Values, Rights & Responsibilities, Evacuation map, Hotlines) with sample text.
Tests: order/reorder, delete removes content only for that id, sanitizer drops unknown nodes/marks/attrs and invalid preset values, keeps allowed ones, empty detection.

### Task 2: Install TipTap, editor extensions, renderer
Files: `package.json`, `src/components/hospital-profile/richText/*` (extensions for size/tone marks and block attrs, `RichTextEditor`, `RichTextView` renderer from JSON, preset maps).
Verify: build; editor round-trips JSON through sanitizer.

### Task 3: Page shell + Categories tab
Files: `HospitalProfilePage.tsx` (replace), `hospital-profile/CategoriesTab.tsx`, `CategoryFormModal.tsx`, `DeleteCategoryDialog.tsx`; keep the existing terminal VisibilityModal (extract).
Table: drag handle, checkbox, Order, Name EN, Name AR, Content type, Updated, Visibility, Active, Actions; sortable; Quick Actions (Edit, Activate, Deactivate, Visibility, Delete).

### Task 4: Content tab
Files: `hospital-profile/ContentTab.tsx`, `ContentEditor.tsx`, `PatientPreview.tsx`, `AttachmentField.tsx`.
Category list left (drag reorder too); view right: header (name, active, Edit, Visibility, Delete), EN | AR cards with rendered body + attachment, "Edit content" → full editor with EN/AR tabs, type chooser, toolbar, live preview (EN/AR, Tablet/TV).

### Task 5: Verify, docs, review
Browser drive (headless Chrome): reorder, edit in view, delete flow, text formatting incl. Arabic, paste sanitizing, preview sizes. Update docs, final independent review, fixes.
