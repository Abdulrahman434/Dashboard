# CareSuite Manager — Items & Categories

Sprint review notes · branch `sara` · 2026-11-22
Design: [specs/2026-11-22-caresuite-manager-tabs-design.md](superpowers/specs/2026-11-22-caresuite-manager-tabs-design.md) ·
Plan: [plans/2026-11-22-caresuite-manager-tabs.md](superpowers/plans/2026-11-22-caresuite-manager-tabs.md)

## What changed for admins

CareSuite Manager is now one page with two tabs (same layout as Channels). The sidebar
entries **Items Manager** and **Categories Manager** open the matching tab.

| Before | Now |
|---|---|
| CareSuite Manager → Library | **Items Manager** tab — category list on the left (All items, each category in patient order, Uncategorized); search, Type / Group / Status filters, group by, bulk Quick Actions (Edit, Activate, Deactivate, Delete) |
| Control Panel → Team Categories | **Categories Manager** tab (the Control Panel entry is gone; its old link opens this tab) |
| No ordering | Drag categories to set their order on the patient screen (saved on drop) |
| — | Pick a category on the left to see its items in patient order; drag rows to reorder, then **Save order** or **Cancel**. Group by Type or Group works inside a category too. "Manage Items" in Categories Manager opens Items Manager on that category. |
| — | Category **Active** toggle |
| Delete blocked while in use | Delete dialog with three options (below) |

### Categories: one record, two names

The same category is used for team routing and for the patient screen — there is no second
category structure.

- **Name** — internal. Shown in Team Assignment, Items Manager and admin screens.
- **Display Name (EN / AR)** — shown to patients. English falls back to Name when empty.

A team can cover several categories and several teams can cover the same category (for
example, Patient Experience covering all three). That is unchanged.

### What never changes when you reorder or switch Active

Reordering categories or items, and turning a category off or on, only changes what the
patient screen shows and in which order. Item categories, item types (Service Request /
Issue), team assignments, request routing, requests and their history are not touched.
Turning a category back on restores its items in their saved order.

### Deleting a category

The dialog shows how many items and teams are linked, warns that teams lose the
association, and enables **Delete category** only after a choice:

1. **Delete category and its items** — items disappear from Items Manager and the patient
   screen. They are *archived*, not erased, so existing requests still show their item name.
2. **Move items to another category** — items keep all their settings and go to the end of
   the chosen category.
3. **Keep items uncategorized** — items stay in Items Manager as "Uncategorized" and are
   hidden from patients until reassigned.

In every case the category is removed from all teams; requests are never modified.

## For the patient-facing app (separate project)

The patient app must show exactly what this dashboard saved. Everything it needs is in the
CareSuite store, and one function computes the patient view:

```ts
careSuiteService.listPatientMenu(): {
  id: string;
  displayNameEn: string;   // Display Name (EN), falls back to the internal Name
  displayNameAr: string;   // Display Name (AR), '' when not set
  tone: 'primary' | 'alert';   // colour: client brand primary, or alert red
  cardStyle: 'image' | 'icon'; // photo cards (item.image) or icon cards (item.icon)
  allowMultiple: boolean;      // several items in one request, or tap = send
  icon: string;                // menu icon, lucide name ('' = none)
  subheadingEn: string; subheadingAr: string; // line under the heading, '' when not set
                                              // (the heading is always displayNameEn / displayNameAr)
  iconSvg: string;             // uploaded single-colour SVG (data URL), '' if none; wins over `icon`
  items: LibraryItem[];    // active, non-archived items, in saved order
}[]                        // active categories only, in saved order
```

Rules it applies (the patient app should apply the same if it reads raw data):

- **Category order**: ascending `order`; a category without `order` sorts by its stored position.
- **Category visible**: `active !== false`.
- **Item visible**: `categoryId` points to a visible category, `active === true`, `archived !== true`.
  Uncategorized items (`categoryId: null`) are never shown.
- **Item order**: ascending `order` within its category; missing `order` falls back to stored position.
- Items show `nameEn` / `nameAr` and, by the category's card style, `image` or the icon
  (`iconSvg` if set, else `icon`, a lucide name).
- `type` is `Amenity` (brought to the patient) or `Service` (done for them: cleaning,
  repairs). Data saved before this change says `Service Request` / `Issue`; read those as
  Amenity / Service (`listPatientMenu()` already does). Whether something is a problem is
  shown by its category (e.g. Report an Issue, alert red), not by its type.
- `groups` lists the patient groups that see the item (`Kids`, `Adults`, `VIP`); an empty
  list means every group. Older data has a single `group` (`All` = every group).
- An active category with no visible items is still returned (with `items: []`); the patient
  app decides whether to hide it.
- Stored records written before this change have none of the new fields until an admin edits
  them, so read through these rules (or `listPatientMenu()`), not the raw fields alone.

Storage today (localStorage, `// TODO(backend)` in `src/services/careSuiteService.ts`):
`careinn_caresuite_categories`, `careinn_caresuite_library`. Changes fire the
`careinn:caresuite-changed` window event.

### New fields (all optional, defaulted at read time — no migration)

| Record | Field | Default when missing |
|---|---|---|
| Category | `displayNameEn`, `displayNameAr` | `nameEn` / legacy `nameAr` |
| Category | `active` | `true` |
| Category | `order` | stored array position |
| Item | `order` (within its category) | stored array position |
| Item | `archived` | not archived |
| Category | `tone` | `primary` |
| Category | `cardStyle` | `image` |
| Category | `allowMultiple` | `false` |
| Category | `icon`, `subheadingEn/Ar` | none |
| Item | `icon`, `iconSvg` | none |
| Item | `groups` | from legacy `group`; empty = every group |
| Item | `type` | `Service Request` → `Amenity`, `Issue` → `Service` |
| Category | `iconSvg` | none |

### Drawing categories on the patient screen

- **Colour.** `tone: 'primary'` means the client's brand primary from Identity Settings
  (`careinn-identity-settings` → `primaryColor`). Never store or hard-code the hex per
  category: a rebrand must not need category edits. `alert` is a fixed red (`#E5484D` in
  the dashboard previews).
- **Icons** are lucide names in kebab-case (`air-vent`, `shower-head`, …,
  https://lucide.dev/icons/). Admins pick from a suggested set or search the whole library
  (~1,500 icons). Use the same lucide version as the dashboard (`lucide-react` 0.487) so
  every saved name exists. Unknown or empty names fall back to a neutral icon (`circle-help`).
- **Uploaded icons** (`iconSvg`) cover anything lucide lacks (e.g. slippers, wheelchair):
  a single-colour SVG, 20 KB max, rejected if it contains scripts, event handlers or external
  content. Draw it as a **mask filled with the tone colour** (CSS `mask`, or the platform's
  equivalent), never by inserting the SVG markup, so it gets the same colour and shading as
  library icons.
- **Missing icons** are flagged in the dashboard (Items Manager "No icon" and "N items need
  an icon", Categories Manager "N need an icon", and in the category form). The app should
  still show a neutral placeholder rather than an empty card.
- **Shading is drawn by the app, not baked into icons.** Icon cards: the icon in the tone
  colour, inside a circle filled with the tone colour at ~12% opacity (with a faint ~6%
  ring), on a card top washed with the tone colour at ~10% → 4%. The selected menu row uses
  the solid tone colour. One plain icon then serves every client, both tones and dark mode.
- **Photo cards** show `item.image` as uploaded. Ask admins for product shots on a plain
  light or transparent background; the app supplies the card frame and title.
- **Several items** (`allowMultiple`): the patient selects items, then sends once. Off:
  tapping an item sends immediately. How a multi-item request is stored is still open (see
  below).
## Remaining integration work

1. **Backend persistence and API.** The dashboard still saves to the browser's localStorage,
   so the separate patient app cannot read it yet. A backend needs to store the fields above
   and expose an endpoint equivalent to `listPatientMenu()` (or the raw categories + items).
   Every write in `careSuiteService.ts` is marked `TODO(backend)`.
2. **Patient app**: read that endpoint, show categories and items in the saved order with
   the display names, and hide inactive categories, inactive / archived / uncategorized items.
3. **Multi-item requests (not built yet, agreed for later).** Today one request holds one
   `libraryItemId`. For categories with `allowMultiple`, the recommendation is one request
   carrying a list of item ids, so the team handles them together; the Admin / team
   dashboards and the Nurse Station would then need to show several items per request.
4. **Request creation (patient app)**: keep sending `libraryItemId`; routing to teams is by
   the item's category exactly as today, so no change is needed there.
5. **Archived items in the backend**: keep archived item records (or snapshot the item name
   onto requests) so request history stays readable after an item or category is deleted.
   Consider an admin "restore archived item" screen.
6. **Live refresh**: the patient app should pick up order / Active changes without a
   reinstall (poll or push), since admins change them at any time.
7. **Out of scope this round** (agreed): Team Members and team Active fields on the team form.

## Behaviour to be aware of

- **Types are Amenity / Service.** Existing Service Request items read as Amenity and Issue
  items as Service; switch any that are really tasks (e.g. Room cleaning) with Quick Actions →
  Set as Service. The CareSuite Admin dashboard's Type filter uses the new names.
- **Deleting an item now archives it** — in Items Manager (single or bulk) and the category
  "delete items" option alike. It disappears everywhere admins and patients look, but
  existing requests keep showing its name. There is no restore screen yet.
- **Users linked to a category** (Control Panel → Users, "Team Category") are counted in
  the delete dialog and lose that link when the category is deleted.
- Categories now appear in their patient-facing order in the Team Assignment and Users
  dropdowns. Names and ids are unchanged, so routing is unaffected.
- Existing installs keep their current category names (e.g. Housekeeping / Maintenance /
  IT Support). Rename them and set display names in Categories Manager. Only fresh installs
  get the new demo categories (I Need Something / Room Care / Report an Issue).

## How it was tested

- `npm test` (Node 22.18+) — 40 unit tests on the store rules: legacy data defaults,
  category and item ordering scoped per category, moving items between categories, Active
  hide/restore, the patient menu, item archiving, and all three delete options (teams and
  users updated, requests byte-identical, archived items still resolvable).
- Independent code review of the whole branch: no critical issues; the two important
  findings (item delete erasing request history, users linked to a deleted category) are
  fixed with tests. Smaller polish items are listed below.

## Polish items deferred from review

- Delete dialog: radio options not keyboard-operable; "1 items moved" toast wording; inactive
  categories not flagged in the "move to" list; no error message if the target category was
  deleted in another tab meanwhile.
- Category form: a legacy Arabic name can't be cleared (it falls back to the old value).
- Category delete writes items, teams, users and categories separately (no rollback; moot
  once a backend does it in one transaction).
- A few extra "nothing else changed" assertions would strengthen the tests.
- Production build passes.
- Driven in headless Chrome against the dev server: tab routing and sidebar, archived items
  hidden, category drag + reload, Active toggle, add / duplicate-name check, Teams page still
  shows internal names, reordering a category's items with Save / Cancel, each
  delete option, and the Admin dashboard still naming requests after items were archived.
