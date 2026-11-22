# CareSuite Manager Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CareSuite Library page and Control Panel → Team Categories with one CareSuite Manager page (Items Manager / Categories Manager tabs) that adds category order, category Active toggle, per-category item order, and a three-way category delete.

**Architecture:** All rules live in `careSuiteService.ts` (localStorage store, unit-tested with `node --test`). The UI is a thin page shell with `PillTabs` and four focused components that call the service. The existing category store is reused; new fields have read-time defaults so stored data needs no migration.

**Tech Stack:** React 18 + Vite 6 + Tailwind 4, `@dnd-kit/core` + `@dnd-kit/sortable` (already installed), Node 24 built-in test runner (native TS type stripping, no new dependency).

**Spec:** `docs/superpowers/specs/2026-11-22-caresuite-manager-tabs-design.md`

## Global Constraints

- Never modify request records (`careinn_caresuite_requests`) in any new code path.
- Ordering and Active changes never touch an item's `categoryId`, a team's `categoryIds`, or request routing.
- No new item types; Service Request / Issue stay as they are.
- No new dependencies. Drag-and-drop uses `@dnd-kit`; tests use `node --test`.
- `careSuiteService.ts` must stay erasable-TS only (no enums / parameter properties) so Node can strip types.
- Tables follow the `dashboard-table` skill tokens (`thLeft`, `tdCls`, `checkboxCls`, actions column, empty state inside the card).
- Copy: tab labels "Items Manager" and "Categories Manager"; page title "CareSuite Manager"; column labels "Name", "Display Name (EN)", "Display Name (AR)".

## Review Focus

1. Existing users' stored categories/items with none of the new fields → load with `active: true`, order = stored array position, display names falling back to `nameEn` / `nameAr`. (Task 1 test)
2. An item edited in Items Manager into another category → lands at the end of the new category; the old category's remaining order is unchanged. (Task 1 test)
3. Deleting a category in any mode → requests are byte-identical and every request's `libraryItemId` still resolves via `listLibrary()`. (Task 2 test)
4. Archived items never appear in Items Manager, Manage Items, or the patient menu. (Task 1 test + Task 3 manual check)
5. Cancel in reorder mode, or switching category mid-reorder, discards the draft with no write. (Task 5 manual check)

---

### Task 1: Service — category fields, ordering, Active, patient menu

**Files:**
- Modify: `src/services/careSuiteService.ts`
- Create: `src/services/careSuiteService.test.ts`
- Modify: `package.json` (add `"test": "node --test \"src/**/*.test.ts\""` — quoted so Node expands the glob, not `sh`)

**Interfaces:**
- Produces:
  - `TeamCategory` gains `displayNameEn?: string; displayNameAr?: string; active?: boolean; order?: number`
  - `LibraryItem` gains `order?: number; archived?: boolean`
  - `categoryDisplayEn(c: TeamCategory): string` (= `displayNameEn || nameEn`), `categoryDisplayAr(c: TeamCategory): string` (= `displayNameAr || nameAr || ''`)
  - `listCategories(): TeamCategory[]` — sorted by `order`, every record normalised (`active` defaults `true`, `order` defaults stored index)
  - `createCategory(input: { nameEn: string; displayNameEn?: string; displayNameAr?: string; active?: boolean }): TeamCategory` — `order` = last + 1
  - `updateCategory(id, patch: Partial<Pick<TeamCategory, 'nameEn' | 'nameAr' | 'displayNameEn' | 'displayNameAr' | 'active'>>): void`
  - `setCategoryOrder(orderedIds: string[]): void`
  - `listCategoryItems(categoryId: string): LibraryItem[]` — that category's non-archived items sorted by `order`
  - `setCategoryItemOrder(categoryId: string, orderedItemIds: string[]): void` — writes `order` only; ids not in that category are ignored
  - `categoryUsage(id: string): { items: number; teams: number }` (non-archived items)
  - `listPatientMenu(): { id: string; displayNameEn: string; displayNameAr: string; items: LibraryItem[] }[]` — active categories in order, each with active, non-archived items in order
  - `createLibraryItem` sets `order` to the end of its category; `updateLibraryItem` re-sets `order` to the end of the new category only when `categoryId` changes
  - `listLibrary()` still returns archived items (dashboards resolve request history through it)
  - Seed categories renamed: `I Need Something` / `أحتاج إلى شيء`, `Room Care` / `العناية بالغرفة`, `Report an Issue` / `أبلغ عن مشكلة`; seed items re-pointed to them. Do **not** bump `SEEDED_KEY`.

- [ ] **Step 1: Write the failing tests** in `careSuiteService.test.ts`. Shim before importing: `globalThis.window = globalThis`, a Map-backed `globalThis.localStorage`, and set `careinn_caresuite_seeded_v5` so the seed doesn't run; `beforeEach` clears the store. Import from `./careSuiteService.ts`. Tests:
  - `legacy categories load with defaults` — store `[{id:'a',nameEn:'A',nameAr:'أ'},{id:'b',nameEn:'B'}]`; expect `listCategories()` ids `['a','b']`, both `active === true`, `categoryDisplayEn(b) === 'B'`, `categoryDisplayAr(a) === 'أ'`.
  - `setCategoryOrder reorders without touching teams` — teams `categoryIds` deep-equal before/after; `listCategories()` ids follow the new order.
  - `item order is scoped per category` — items x1,x2 in A and y1 in B; `setCategoryItemOrder('A',['x2','x1','y1'])` → `listCategoryItems('A')` ids `['x2','x1']`, `listCategoryItems('B')` ids `['y1']`, every item's `categoryId` unchanged.
  - `moving an item appends it to the new category` — `updateLibraryItem('x1',{categoryId:'B'})` → `listCategoryItems('B')` ids `['y1','x1']`, `listCategoryItems('A')` ids `['x2']`.
  - `inactive category hidden from patient menu and restored in order` — set A order `['x2','x1']`, `updateCategory('A',{active:false})` → menu has no `A`; reactivate → A's items `['x2','x1']`.
  - `patient menu excludes uncategorized, archived and inactive items`.
  - `listCategoryItems excludes archived items`.

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (`categoryDisplayEn` / `setCategoryOrder` not exported).

- [ ] **Step 3: Implement** the Interfaces above in `careSuiteService.ts`. Writes go through the existing `write()` so `CARESUITE_EVENT` fires.

- [ ] **Step 4: Run** `npm test` — Expected: all pass. Run `npx vite build` — Expected: build succeeds.

- [ ] **Step 5: Commit** — `feat(caresuite): category order, active flag and per-category item order`

### Task 2: Service — category deletion modes

**Files:**
- Modify: `src/services/careSuiteService.ts`, `src/services/careSuiteService.test.ts`

**Interfaces:**
- Consumes: Task 1 `listCategoryItems`, `listCategories`.
- Produces: `type DeleteCategoryMode = { mode: 'delete-items' } | { mode: 'move-items'; targetCategoryId: string } | { mode: 'uncategorize' }` and `deleteCategory(id: string, opts: DeleteCategoryMode): void`. Replaces `removeCategory` (remove it).
  - every mode: remove the category record and strip `id` from every team's `categoryIds`
  - `delete-items`: its items get `archived: true` (records kept)
  - `move-items`: items get `categoryId = targetCategoryId`, appended after the target's items in their current relative order; throws if the target is missing or equals `id`
  - `uncategorize`: items get `categoryId: null`

- [ ] **Step 1: Write failing tests:**
  - `deleteCategory strips team associations` (all three modes) — team with `['A','B']` → `['B']`.
  - `delete-items archives but keeps records` — `listLibrary()` still finds x1 with `archived === true`; `listCategoryItems` has no x1.
  - `move-items appends to target and keeps other fields` — `type`, `priority`, `active`, `nameEn` unchanged; B ids `['y1','x2','x1']` when A's order was `['x2','x1']`.
  - `move-items rejects missing or same target` — `assert.throws`.
  - `uncategorize sets categoryId null and hides from patient menu`.
  - `requests untouched in every mode` — snapshot `localStorage.getItem('careinn_caresuite_requests')` equal before/after.

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (`deleteCategory` not defined).
- [ ] **Step 3: Implement** `deleteCategory`; remove `removeCategory`.
- [ ] **Step 4: Run** `npm test` — Expected: pass.
- [ ] **Step 5: Commit** — `feat(caresuite): category delete with archive / move / uncategorize`

### Task 3: Page shell, Items Manager tab, routing and sidebar

**Files:**
- Create: `src/components/caresuite/CareSuiteManagerPage.tsx`
- Move: `src/components/caresuite/CareSuiteLibraryPage.tsx` → `src/components/caresuite/ItemsManagerTab.tsx` (`git mv`)
- Delete: `src/components/caresuite/TeamCategoriesPage.tsx`
- Modify: `src/components/Dashboard.tsx:56-60,171-181`, `src/components/CollapsibleSidebar.tsx:186,251`

**Interfaces:**
- Produces: `CareSuiteManagerPage({ tab, onNavigate }: { tab: 'items' | 'categories'; onNavigate: (route: string) => void })` — controlled by the route: changing tab calls `onNavigate('cs-library' | 'cs-categories')`. Header: icon + "CareSuite Manager" + "Manage patient services (amenities and requests) and organize their categories." The page owns the header, the `PillTabs` row, and the tab's primary button (Add Item / Add Category). It passes `addSignal: number` (incremented on click) to the active tab so the tab opens its own modal.
- `ItemsManagerTab({ addSignal }: { addSignal: number })` — the old Library body without its own header; list filters `!item.archived`; everything else unchanged.
- Routes: `cs-library` → items tab, `cs-categories` and `team-categories` → categories tab (Task 4 fills the categories tab; render a placeholder until then).
- Sidebar: CareSuite Manager sub-items become `Items Manager` (`cs-library`), `Categories Manager` (`cs-categories`), then Workflow and Teams Assignment unchanged. Remove `team-categories` from Control Panel.

- [ ] **Step 1: Implement** per Interfaces.
- [ ] **Step 2: Verify** with `npx vite build` (passes), then in the running dev server: both sidebar entries open the page on the right tab, tab clicks switch the sidebar highlight, Items Manager adds/edits/toggles/deletes exactly as before, and an item with `archived: true` set by hand in localStorage does not appear.
- [ ] **Step 3: Commit** — `feat(caresuite): CareSuite Manager page with Items Manager tab`

### Task 4: Categories Manager tab

**Files:**
- Create: `src/components/caresuite/CategoriesManagerTab.tsx`, `src/components/caresuite/CategoryFormModal.tsx`
- Modify: `src/components/caresuite/CareSuiteManagerPage.tsx`

**Interfaces:**
- Consumes: Task 1 service functions; Task 2 `deleteCategory` (through Task 6's dialog, stubbed until then with the dialog's props).
- Produces: `CategoriesManagerTab({ addSignal }: { addSignal: number })`; `CategoryFormModal({ category, onClose }: { category: TeamCategory | null; onClose: () => void })` with fields Name (required, unique case-insensitive), Display Name (EN), Display Name (AR, `dir="rtl"`), Active toggle.
- Info note above the table: "Manage and order categories" / "Reorder categories to control how they appear on the patient-facing screen. Click a category to manage its items and item order."
- Table columns: drag handle · Order (1-based badge) · Name · Display Name (EN) · Display Name (AR) · Items (`categoryUsage().items` + " items") · Active (`Toggle`, calls `updateCategory(id,{active})`) · Manage Items button · Edit / Delete icons. Row click = Manage Items.
- Drag: `@dnd-kit/sortable` vertical list on the handle only; on drop call `setCategoryOrder` and `toast.success('Category order saved')`.

- [ ] **Step 1: Implement** per Interfaces.
- [ ] **Step 2: Verify** `npx vite build` passes; in the browser: drag order persists across reload, the toggle persists and Teams Assignment's category dropdown still lists the category, edit/add validates names, and the Teams page still shows the same categories for each team after reordering.
- [ ] **Step 3: Commit** — `feat(caresuite): Categories Manager tab with ordering and active toggle`

### Task 5: Manage Items view

**Files:**
- Create: `src/components/caresuite/CategoryItemsView.tsx`
- Modify: `src/components/caresuite/CategoriesManagerTab.tsx`

**Interfaces:**
- Consumes: `listCategoryItems`, `setCategoryItemOrder`, `listCategories`, `categoryUsage`.
- Produces: `CategoryItemsView({ categoryId, onBack, onSelectCategory }: { categoryId: string; onBack: () => void; onSelectCategory: (id: string) => void })`. `CategoriesManagerTab` holds `managingId: string | null` and renders this view instead of the table when set.
- Layout per mockup: back arrow, category Name + Active/Inactive chip, subtitle "Manage the items within this category and set their display order on the patient-facing screen."; left card "Categories" list (Name + item count, selected highlighted); right table: order badge · thumbnail · Item Name (EN) · Item Name (AR) · Type (`TypeBadge`) · Active (`Toggle`, `updateLibraryItem`) · Edit / Delete reusing the Items Manager form (extract its modal into `ItemFormModal` inside `ItemsManagerTab.tsx` and export it).
- "Reorder Items" enters reorder mode (drag handles enabled; other controls disabled) with **Save** (`setCategoryItemOrder`, toast "Item order saved") and **Cancel** (drop the draft). Leaving the view or selecting another category while in reorder mode discards the draft.

- [ ] **Step 1: Implement** per Interfaces.
- [ ] **Step 2: Verify** `npx vite build` passes; in the browser: only this category's items show; Save persists across reload; Cancel and category switch restore the saved order; other categories' orders are unchanged.
- [ ] **Step 3: Commit** — `feat(caresuite): per-category Manage Items view with reorder`

### Task 6: Delete category dialog

**Files:**
- Create: `src/components/caresuite/DeleteCategoryDialog.tsx`
- Modify: `src/components/caresuite/CategoriesManagerTab.tsx`

**Interfaces:**
- Consumes: Task 2 `deleteCategory`, `DeleteCategoryMode`; `categoryUsage`.
- Produces: `DeleteCategoryDialog({ category, onClose }: { category: TeamCategory; onClose: () => void })`.
- Content: title "Delete “{Name}”?"; counts line "{n} items and {m} teams are linked to this category."; warning note "Teams assigned to this category will lose this association. Request history is kept." Three radio options with the spec's labels; option 2 shows a `SingleSelectDropdown` of other categories. When the category has 0 items, skip the options and show only the warning. "Delete category" (red) is disabled until an option is chosen (and a target for option 2). On confirm: `deleteCategory`, toast, close; if `managingId` was this category, return to the table.

- [ ] **Step 1: Implement** per Interfaces.
- [ ] **Step 2: Verify** `npx vite build` passes; in the browser, for each of the three options: items end up archived / in the target at the end / uncategorized in Items Manager; the team in Teams Assignment no longer lists the category; the CareSuite Admin dashboard still shows existing requests with their item names.
- [ ] **Step 3: Commit** — `feat(caresuite): category delete dialog with three options`
