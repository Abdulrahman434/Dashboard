# CareSuite Manager — Items & Categories tabs

Date: 2026-11-22 · Status: approved design (UI structure approved; clarifications from Sara folded in)

## Intent

Admins manage what patients can request in CareSuite. Today that is one
"Library" page plus a separate Control Panel → Team Categories page, with no
way to control the order patients see things in. This change puts both under
one CareSuite Manager page with two tabs, and adds ordering and an Active
switch for categories, so the admin controls what the patient-facing screen
shows and in what order — without touching how requests are routed to teams.

## Goals

- One page, two tabs (Channels layout, `PillTabs`): **Items Manager** and **Categories Manager**.
- Items Manager = today's Library, renamed, functionality unchanged.
- Categories Manager = today's Team Categories management, moved here, plus:
  drag-and-drop category order, Active toggle, Manage Items, Edit, Delete.
- Manage Items: the selected category's items only, drag-and-drop reorder with Save / Cancel.
- Category deletion with a three-way choice instead of a hard block.
- The saved order and Active state are what the patient-facing screen reads.

## Non-goals / anti-goals

- No new category structure, no separate "patient" vs "team" categories.
- No new item types. Service Request / Issue and their logic stay as they are.
- No change to request logic, workflow, Team Assignment, request routing, or dashboards.
- No Team Members / team Active fields on the team form (later round).
- Failure even if it "works": reordering or deactivating anything changes a
  team's categories, an item's category, or any request record.

## Data model (reuse `careinn_caresuite_categories` / `careinn_caresuite_library`)

One category record serves both purposes:

| Field | Meaning | Notes |
|---|---|---|
| `nameEn` | **Name** — internal, shown in Team Assignment dropdowns and the Items Manager Category column | existing field, unchanged meaning |
| `displayNameEn` | **Display Name (EN)** — patient-facing | new; falls back to `nameEn` when absent |
| `displayNameAr` | **Display Name (AR)** — patient-facing | new; falls back to legacy `nameAr` when absent |
| `active` | shown on the patient screen | new; absent ⇒ `true` |
| `order` | position on the patient screen | new; absent ⇒ current array index |

Items gain `order` (position **within their own category**; absent ⇒ array
index) and `archived` (see Deletion). `categoryId`, `type`, `priority`,
`group`, `active` keep their meaning.

Teams keep `categoryIds` (many-to-many: a team covers several categories,
several teams can cover one category — e.g. Patient Experience covers all three).

Old records need no migration step: every new field has a read-time default.
The demo seed (fresh installs only) is renamed to I Need Something / Room Care /
Report an Issue; existing stored data is never overwritten.

## Behaviour

**Ordering.** Category order and item order are separate. Item order is scoped
to one category: the Manage Items list contains only that category's items, and
saving writes `order` on those items only. Neither touches `categoryId`,
`categoryIds`, or requests. An item moved to another category is appended to
the end of that category's order.

**Active toggle (category).** Off ⇒ the category and its items are hidden from
the patient screen. Items are not deleted or deactivated, team assignments and
requests are untouched. On ⇒ items reappear in their saved order (order is
never cleared).

**Patient-facing read.** `careSuiteService.listPatientMenu()` returns active
categories in `order`, each with its active, non-archived items in `order`.
Uncategorized items and inactive categories are excluded. *(Builder note: no
patient-facing screen consumes CareSuite in this repo yet; this function is the
contract it should read.)*

**Deletion.** Confirmation dialog states how many items and teams are
affected, warns that team associations to this category will be removed, and
offers:

1. **Delete category and its items** — items are archived.
2. **Move items to another category** — pick a target; only `categoryId` and `order` change.
3. **Keep items uncategorized** — `categoryId = null`; still in Items Manager, hidden from patients.

Explicit confirmation (button disabled until a choice is made, and a target for
option 2). In every case the category id is removed from every team's
`categoryIds`; requests are never modified.

*My call:* "delete items" **archives** them (`archived: true`) instead of
removing the records, because every dashboard resolves a request's item name
by `libraryItemId`; erasing the record would blank out request history.
Archived items are hidden from Items Manager, Manage Items and the patient
screen but still resolve for request history.

## UI

- Sidebar CareSuite Manager: "Library" → **Items Manager**, plus **Categories
  Manager**; both open the same page on the matching tab. Control Panel → Team
  Categories is removed; its route opens the Categories tab.
- Page header "CareSuite Manager" + subtitle; primary button is Add Item or
  Add Category depending on the tab.
- Categories table: drag handle · Order · Name · Display Name (EN) · Display
  Name (AR) · Items · Active toggle · Manage Items · Edit / Delete.
  Add/Edit category form: Name, Display Name (EN), Display Name (AR), Active.
- Manage Items view: back arrow, category name + Active state; left list of
  categories (switch between them); right table of that category's items with
  Reorder Items → drag → Save / Cancel.

## Calls left to the builder / made by me

- Category drag-and-drop saves immediately on drop (the mockup has no Save on
  that tab); item reorder uses Save / Cancel as requested.
- Drag-and-drop via `@dnd-kit` (already a dependency).
- Existing single-item delete in Items Manager keeps its current behaviour
  (unchanged functionality); only the category-deletion path archives.
