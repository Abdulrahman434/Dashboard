---
name: dashboard-table
description: Build or restyle a data table in this dashboard — the shared list-page pattern with a search bar, column filters, a bulk-select checkbox column, inline editing, and a per-row actions column. Use whenever adding a list/table view, adding search or filters to one, adding bulk delete or row actions, adding inline (click-to-edit) cells, or when asked to make a table "match" the dishes / reference lists / menu sets pages.
---

# Dashboard table pattern

Every list page in this dashboard is the same table. Reference implementation:
the **Menu Dishes** table in `src/components/food/FoodLibraryPage.tsx` (`viewDishes`).
Two more built from it: `viewRefLists` in the same file, and `viewSets` in
`src/components/food/MenuSetsPage.tsx`.

A page is built top to bottom in this fixed order:

```
1. Page header    — h1 + count sub-line (left)  ·  bulk-delete + primary action (right)
2. Filters bar    — search (LEFT)  ·  flex-1 spacer  ·  filter dropdowns (RIGHT)
3. Table card     — checkbox column · data columns · actions column
```

Never reorder these, and never move the search to the right or the filters to
the left. Search is always leftmost, filters are always rightmost, on one line.

## 1. Page header

```jsx
<div className="flex items-center justify-between mb-5">
  <div>
    <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Menu Dishes</h1>
    <div className="text-[14px] text-[#6B7280]">{db.dishes.length} dishes in the library</div>
  </div>
  <div className="flex gap-2">
    {selectedRows.length > 0 && (
      <button
        onClick={handleDeleteSelected}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
      >
        <Trash2 size={16} strokeWidth={2} />
        Delete ({selectedRows.length})
      </button>
    )}
    <Btn variant="primary" onClick={() => openDish(null)}><Plus size={16} />Add dish</Btn>
  </div>
</div>
```

The red bulk-delete button only renders when something is selected, and always
sits immediately left of the primary action.

## 2. Filters bar

```jsx
<div className="flex items-center gap-3 mb-4 flex-wrap">
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      value={search}
      onChange={(e) => { setSearch(e.target.value); setSelectedRows([]); }}
      placeholder="Search dishes by name..."
      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
    />
  </div>
  <div className="flex-1" />
  <MultiSelectDropdown options={sectionOptions} selectedValues={filterSections}
    onChange={setFilterSections} placeholder="Section" className="min-w-[160px]" showSelectAll={false} />
  <MultiSelectDropdown options={statusOptions} selectedValues={filterStatuses}
    onChange={setFilterStatuses} placeholder="Status" className="min-w-[140px]" showSelectAll={false} />
</div>
```

Rules:

- `MultiSelectDropdown` comes from `../UnifiedDropdown`. Always
  `showSelectAll={false}`.
- **Give every column a filter where the data allows one** — a column with a
  bounded set of values (status, category, tags) gets a dropdown; free text
  (names, codes) is covered by the search box instead.
- **Omit a filter that can't apply** rather than rendering a dead one. The
  reference-lists Allergens and Meals tabs have no on/off state, so the Status
  filter is hidden there (`refHasStatus`), not shown-but-empty.
- Search matches English case-insensitively and Arabic against the raw query
  (lowercasing does nothing useful for Arabic):
  ```js
  if (q && !(row.en || '').toLowerCase().includes(q) && !(row.ar || '').includes(search.trim())) return false;
  ```
- Changing the search or a filter clears the selection, so a hidden row can
  never stay silently checked.

## 3. Table card

```jsx
<div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
  {rows.length === 0 ? emptyState : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">…</thead>
        <tbody className="divide-y divide-[#E5E7EB]">…</tbody>
      </table>
    </div>
  )}
</div>
```

Class tokens — copy verbatim, don't invent near-misses:

```js
const thLeft   = "py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]";
const thCenter = "py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]";
const tdCls    = 'py-3.5 px-4';
const rowCls   = 'hover:bg-[#F8FAFC] transition-colors cursor-pointer';
const nameCls  = "font-medium text-[#19233a] text-[13.5px] font-['Poppins',sans-serif]";
const checkboxCls = 'w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';
const inlineInputCls = "w-full px-2 py-1 border border-[#4EBEE3] rounded text-[13px] font-['Poppins',sans-serif] text-[#19233a] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20";
```

Column widths: checkbox `50px`, actions `96px` (`128px` for three buttons),
thumbnail `76px`. Text columns flex; name columns are `text-left`, everything
else `text-center`.

Empty state — inside the card, never below it:

```jsx
<div className="flex flex-col items-center justify-center text-center py-14 px-5">
  <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
    <Salad size={26} />
  </div>
  <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">
    {hasFilters ? 'No dishes match your filters' : 'No dishes yet'}
  </div>
  <div className="text-[13px] text-[#5d6678] mt-1">
    {hasFilters ? 'Try adjusting filters, or clear the search.' : 'Add your first dish to the library.'}
  </div>
</div>
```

## Checkbox column (bulk actions)

Rows are keyed by their **index in the store**, not their index after
filtering, so edit / select / delete keep pointing at the right record:

```js
const rows = db.dishes.map((dish, i) => ({ dish, i })).filter(/* search + filters */);

const handleRowSelect = (i) => setSelectedRows(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
const handleSelectAll = () =>
  setSelectedRows(selectedRows.length === rows.length ? [] : rows.map(({ i }) => i));
```

Select-all covers the **filtered** rows only. Bulk delete splices in descending
index order so earlier removals don't shift later ones:

```js
[...selectedRows].sort((a, b) => b - a).forEach(idx => d.dishes.splice(idx, 1));
```

## Inline editing

Inline editing is for **straightforward single-value fields**: names (EN and
AR), short codes, and images. Anything structural — relationships, multi-select
tags, rule config — belongs in the row's form/detail page, not in the cell.

One `editingField` state pins the row and the field:

```jsx
const [editingField, setEditingField] = useState<{ i: number; field: 'en' | 'ar' } | null>(null);
const [editValue, setEditValue] = useState('');
```

```jsx
{editingField?.i === i && editingField.field === 'en' ? (
  <input
    type="text"
    value={editValue}
    onChange={(e) => setEditValue(e.target.value)}
    onBlur={saveInlineEdit}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => {
      if (e.key === 'Enter') saveInlineEdit();
      if (e.key === 'Escape') cancelInlineEdit();
    }}
    autoFocus
    className={inlineInputCls}
  />
) : (
  <span
    onClick={(e) => { e.stopPropagation(); startInlineEdit(i, 'en', dish.en); }}
    className="cursor-pointer hover:text-[#4EBEE3] transition-colors font-medium text-[#19233a] text-[13.5px] font-['Poppins',sans-serif]"
  >
    {dish.en}
  </span>
)}
```

- Enter saves, Escape cancels, blur saves. Empty English name is rejected with
  `toast.error`; a duplicate name is rejected. An unchanged value saves silently
  (no toast).
- Success is `toast.success('Updated successfully')`.
- A blank Arabic value renders the amber missing badge, which is itself the
  click target that starts the edit:
  ```jsx
  <span className="inline-flex items-center gap-1.5 text-[12px] text-[#b9770b]"><AlertTriangle size={13} /> Missing</span>
  ```
- Images edit inline through a `<label>` wrapping a hidden file input, with a
  hover pencil overlay — see `handleInlinePhoto`.
- **A rename must carry into everything keyed by that name.** Sections, diets,
  allergens and meals are referenced by string across dishes and menu-set trees;
  `saveRefEdit` in `FoodLibraryPage.tsx` shows the cascade. Skipping it silently
  orphans records.

## Actions column

Always last, `text-center`, icon buttons only:

```jsx
<td className={tdCls}>
  <div className="flex items-center justify-center gap-1">
    <button onClick={(e) => { e.stopPropagation(); openDish(i); }}
      className="p-1.5 hover:bg-[#4EBEE3]/10 rounded-lg transition-colors cursor-pointer" title="Edit">
      <Edit2 size={14} className="text-[#4EBEE3]" strokeWidth={2} />
    </button>
    <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(i); }}
      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
      <Trash2 size={14} className="text-red-500" strokeWidth={2} />
    </button>
  </div>
</td>
```

Edit is cyan `#4EBEE3`, Delete is `text-red-500`, optional Duplicate is neutral
`#5d6678`. Every button needs a `title`.

## Click targets — the rule that keeps getting broken

The row opens the detail form. **Clicking anywhere that isn't an interactive
control must open it** — including cell padding and the whitespace beside a
value. Getting this wrong is the single most common regression.

- Put `stopPropagation` on the **control** (input, span, label, toggle, button),
  **never on the `<td>`**. A guard on the cell kills the whole column.
- Click-to-edit spans must be `inline-block` / `inline-flex`, never `block` — a
  block span stretches the full column width and swallows the empty space that
  was supposed to open the form.
- `dir="rtl"` right-aligns a box by default. Add `text-left` so Arabic sits
  where the English column does.
- Clicking away from an open editor is a *dismissal*, not a request to open the
  form. Record the pre-blur state on `onMouseDown` (which runs before the
  input's `blur`) and skip that one click:

```jsx
const editorWasOpen = useRef(false);
const openFromRow = (i) => {
  if (editorWasOpen.current) { editorWasOpen.current = false; return; }
  openDish(i);
};

<tr
  onMouseDown={() => { editorWasOpen.current = editingField != null; }}
  onClick={() => openFromRow(i)}
  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
>
```

A table with no detail page (the reference lists) skips all of this: no row
`onClick`, and its click-to-edit spans stay full-width `block` since nothing
competes for the click.

## Tabs above a table

Use `PillTabs` from `src/components/PillTabs.tsx` (the Channels page control),
placed between the page header and the filters bar with `className="mb-5"`.
Switching tabs clears selection, search, filters, and any open editor.

## Checklist

- [ ] Header: h1 + count sub-line, bulk-delete left of the primary button
- [ ] Search left, `flex-1` spacer, filters right — one row
- [ ] A filter for every column whose values are bounded; none rendered where it can't apply
- [ ] Checkbox column first (`50px`), select-all covers filtered rows only
- [ ] Rows carry their store index, not the filtered index
- [ ] Inline edit on names/codes/images; Enter / Escape / blur all handled
- [ ] Renames cascade to everything keyed by that name
- [ ] Actions column last (`96px`), icon buttons with `title`
- [ ] `stopPropagation` on controls, never on `<td>`
- [ ] Click-to-edit spans are `inline-block`, not `block`
- [ ] Empty state inside the card, worded for filtered vs genuinely empty
