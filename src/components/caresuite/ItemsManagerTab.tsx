import { useEffect, useRef, useState } from 'react';
import { Package, Search, Pencil, Trash2, X, Info, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, type LibraryItem, type RequestType, type Priority } from '../../services/careSuiteService';
import { Btn, Toggle, Note, Card, CardHead, Bar } from './careSuiteAtoms';
import { ItemThumb, TypePill, CategoryPill, GroupPill, Switch, typeLabel } from './itemTableAtoms';
import TablePagination from '../TablePagination';
import { SingleSelectDropdown, MultiSelectDropdown } from '../UnifiedDropdown';
import InlineImageUpload from '../InlineImageUpload';

const blankForm = (categoryId: string | null = null) => ({
  image: '',
  nameEn: '',
  nameAr: '',
  categoryId,
  type: 'Service Request' as RequestType,
  priority: 'Medium' as Priority,
  group: 'All',
  active: true,
});

const TYPE_OPTIONS = [
  { value: 'Service Request', label: typeLabel('Service Request') },
  { value: 'Issue', label: 'Issue' },
];

const PRIORITY_OPTIONS = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const GROUP_OPTIONS = [
  { value: 'All', label: 'All Groups' },
  { value: 'Kids', label: 'Kids' },
  { value: 'Adults', label: 'Adults' },
  { value: 'VIP', label: 'VIP' },
];

/** Fires `fn` whenever `signal` changes after mount (the page's Add button). */
export function useAddSignal(signal: number, fn: () => void) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);
}

/** Remove an item after confirmation — shared by Items Manager and Manage Items. */
export function confirmRemoveItem(item: LibraryItem) {
  if (confirm('Remove this item?')) {
    careSuiteService.removeLibraryItem(item.id);
  }
}

/**
 * Add / edit form for a CareSuite item. `item = null` adds a new one,
 * pre-filled with `defaultCategoryId` (used by Manage Items).
 */
export function ItemFormModal({
  item,
  defaultCategoryId = null,
  onClose,
}: {
  item: LibraryItem | null;
  defaultCategoryId?: string | null;
  onClose: () => void;
}) {
  const { categories } = useCareSuite();
  const [form, setForm] = useState<any>(() =>
    item
      ? {
          image: item.image || '',
          nameEn: item.nameEn,
          nameAr: item.nameAr,
          categoryId: item.categoryId,
          type: item.type,
          priority: item.priority,
          group: item.group || 'All',
          active: item.active,
        }
      : blankForm(defaultCategoryId),
  );
  const patchForm = (p: any) => setForm((f: any) => ({ ...f, ...p }));

  const saveItem = () => {
    const nameEn = (form.nameEn || '').trim();
    if (!nameEn) {
      toast('Enter an item name');
      return;
    }
    const payload = {
      image: form.image || undefined,
      nameEn,
      nameAr: (form.nameAr || '').trim(),
      categoryId: form.categoryId || null,
      type: form.type as RequestType,
      priority: form.priority as Priority,
      group: form.group || 'All',
      active: !!form.active,
    };
    if (item) {
      careSuiteService.updateLibraryItem(item.id, payload);
    } else {
      careSuiteService.createLibraryItem(payload);
    }
    onClose();
    toast('Item saved');
  };

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5" onClick={onClose}>
      <Card className="max-w-[520px] w-full" onClick={(e: any) => e.stopPropagation()}>
        <CardHead
          title={item ? 'Edit item' : 'Add item'}
          right={
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          }
        />
        <div className="p-5">
          <div className="flex gap-4 items-start">
            <InlineImageUpload
              imageUrl={form.image}
              onImageChange={(dataUrl) => patchForm({ image: dataUrl })}
              altText={form.nameEn || 'Item image'}
              size="md"
            />
            <div className="flex-1">
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Name (English)</label>
              <input
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors"
                value={form.nameEn}
                onChange={(e) => patchForm({ nameEn: e.target.value })}
                placeholder="e.g. Extra towel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Name (Arabic)</label>
              <input
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => patchForm({ nameAr: e.target.value })}
                placeholder="اسم العنصر"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Category</label>
              <SingleSelectDropdown
                options={categories.map((c) => ({ value: c.id, label: c.nameEn }))}
                value={form.categoryId || ''}
                onChange={(v: string) => patchForm({ categoryId: v || null })}
                placeholder="No category"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Request type</label>
              <SingleSelectDropdown options={TYPE_OPTIONS} value={form.type} onChange={(v: string) => patchForm({ type: v })} />
            </div>
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Priority</label>
              <SingleSelectDropdown
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onChange={(v: string) => patchForm({ priority: v })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Group Scope</label>
              <SingleSelectDropdown
                options={GROUP_OPTIONS}
                value={form.group || 'All'}
                onChange={(v: string) => patchForm({ group: v })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e7e9f0]">
            <div>
              <div className="font-medium text-[#19233a]">Active</div>
              <div className="text-[13px] text-[#5d6678] mt-0.5">Inactive items are hidden from patients</div>
            </div>
            <Toggle on={form.active} onClick={() => patchForm({ active: !form.active })} />
          </div>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={saveItem}>
            Save item
          </Btn>
        </Bar>
      </Card>
    </div>
  );
}

type SortDir = 'asc' | 'desc' | null;
type GroupBy = 'none' | 'category' | 'type' | 'group';

const thCls = "py-4 px-4 text-left text-[13.5px] font-medium text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap";
const tdCls = 'py-4 px-4 align-middle';
const checkboxCls = 'w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';
const COLS = 9;

const UNCATEGORIZED = '__none';
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const GROUP_BY_OPTIONS = [
  { value: 'none', label: 'Group by: None' },
  { value: 'category', label: 'Group by: Category' },
  { value: 'type', label: 'Group by: Type' },
  { value: 'group', label: 'Group by: Group' },
];
const groupLabel = (g?: string) => (!g || g === 'All' ? 'All Groups' : g);

/** Items Manager tab — the former CareSuite Library (archived items hidden), in the Library table layout. */
export default function ItemsManagerTab({ addSignal }: { addSignal: number }) {
  const { categories, library } = useCareSuite();

  const [search, setSearch] = useState('');
  const [fTypes, setFTypes] = useState<string[]>([]);
  const [fCats, setFCats] = useState<string[]>([]);
  const [fGroups, setFGroups] = useState<string[]>([]);
  const [fStatus, setFStatus] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<string[]>([]);
  // undefined = closed, null = adding, item = editing
  const [editing, setEditing] = useState<LibraryItem | null | undefined>(undefined);

  useAddSignal(addSignal, () => setEditing(null));

  /** Any change to what's listed resets paging and selection, so a hidden row never stays checked. */
  const narrow = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
    setSelected([]);
  };

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.nameEn || '';
  const categoryRank = (id: string | null) => {
    const i = categories.findIndex((c) => c.id === id);
    return i < 0 ? categories.length : i; // uncategorized last
  };

  const q = search.trim().toLowerCase();
  const hasFilters = !!q || fTypes.length + fCats.length + fGroups.length + fStatus.length > 0;
  const filtered = library.filter((item) => {
    if (item.archived) return false;
    if (q && !item.nameEn.toLowerCase().includes(q) && !(item.nameAr || '').includes(search.trim())) return false;
    if (fTypes.length && !fTypes.includes(item.type)) return false;
    if (fCats.length && !fCats.includes(item.categoryId || UNCATEGORIZED)) return false;
    if (fGroups.length && !fGroups.includes(item.group || 'All')) return false;
    if (fStatus.length && !fStatus.includes(item.active ? 'active' : 'inactive')) return false;
    return true;
  });

  // grouping key + label + rank (rank keeps groups in a meaningful order)
  const groupOf = (item: LibraryItem): { key: string; label: string; rank: number } => {
    if (groupBy === 'category')
      return { key: item.categoryId || UNCATEGORIZED, label: categoryName(item.categoryId) || 'Uncategorized', rank: categoryRank(item.categoryId) };
    if (groupBy === 'type') return { key: item.type, label: typeLabel(item.type), rank: TYPE_OPTIONS.findIndex((t) => t.value === item.type) };
    if (groupBy === 'group') {
      const g = item.group || 'All';
      return { key: g, label: groupLabel(g), rank: GROUP_OPTIONS.findIndex((o) => o.value === g) };
    }
    return { key: '', label: '', rank: 0 };
  };

  const byCategory = (a: LibraryItem, b: LibraryItem) => {
    const an = categoryName(a.categoryId);
    const bn = categoryName(b.categoryId);
    if (!an || !bn) return an ? -1 : bn ? 1 : 0; // uncategorized always last
    return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an);
  };
  const rows = [...filtered].sort((a, b) => {
    if (groupBy !== 'none') {
      const d = groupOf(a).rank - groupOf(b).rank;
      if (d) return d;
    }
    return sortDir ? byCategory(a, b) : 0; // stable: keeps stored order otherwise
  });
  const groupCounts = new Map<string, number>();
  if (groupBy !== 'none') rows.forEach((r) => groupCounts.set(groupOf(r).key, (groupCounts.get(groupOf(r).key) || 0) + 1));

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * perPage, current * perPage);

  // select-all covers the filtered rows, not just this page
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const deleteSelected = () => {
    if (!confirm(`Delete ${selected.length} selected item${selected.length === 1 ? '' : 's'}?`)) return;
    selected.forEach((id) => careSuiteService.removeLibraryItem(id));
    toast.success(`${selected.length} item${selected.length === 1 ? '' : 's'} deleted`);
    setSelected([]);
  };

  const clearFilters = () => {
    setSearch('');
    setFTypes([]);
    setFCats([]);
    setFGroups([]);
    setFStatus([]);
    setPage(1);
    setSelected([]);
  };

  const cycleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));
  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  const pager = (
    <TablePagination
      alwaysShow
      className="px-5 py-3.5 border-t border-gray-200 bg-white"
      currentPage={current}
      totalItems={rows.length}
      itemsPerPage={perPage}
      onPageChange={setPage}
      onItemsPerPageChange={setPerPage}
      itemLabel={rows.length === 1 ? 'item' : 'items'}
    />
  );

  return (
    <div className="space-y-4 font-['Poppins',sans-serif]">
      {categories.length === 0 && (
        <Note tone="info" icon={<Info size={16} />}>
          No categories yet — items can still be added, but showing them to patients and routing them to a team
          needs at least one category. Create one in the Categories Manager tab.
        </Note>
      )}

      {/* search (left) · filters + group by (right) */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => narrow(setSearch)(e.target.value)}
            placeholder="Search items by name"
            className="w-full h-[44px] pl-11 pr-10 bg-white border border-gray-300 rounded-lg text-[14px] text-[#19233a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/40 focus:border-[#4EBEE3] transition-all"
          />
          {search && (
            <button
              onClick={() => narrow(setSearch)('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <MultiSelectDropdown options={TYPE_OPTIONS} selectedValues={fTypes} onChange={narrow(setFTypes)} placeholder="Type" className="min-w-[150px]" showSelectAll={false} />
        <MultiSelectDropdown
          options={[...categories.map((c) => ({ value: c.id, label: c.nameEn })), { value: UNCATEGORIZED, label: 'Uncategorized' }]}
          selectedValues={fCats}
          onChange={narrow(setFCats)}
          placeholder="Category"
          className="min-w-[170px]"
          showSelectAll={false}
        />
        <MultiSelectDropdown
          options={GROUP_OPTIONS.map((g) => ({ value: g.value, label: groupLabel(g.value) }))}
          selectedValues={fGroups}
          onChange={narrow(setFGroups)}
          placeholder="Group"
          className="min-w-[140px]"
          showSelectAll={false}
        />
        <MultiSelectDropdown options={STATUS_OPTIONS} selectedValues={fStatus} onChange={narrow(setFStatus)} placeholder="Status" className="min-w-[130px]" showSelectAll={false} />
        <SingleSelectDropdown
          options={GROUP_BY_OPTIONS}
          value={groupBy}
          onChange={(v: string) => {
            setGroupBy(v as GroupBy);
            setPage(1);
          }}
          size="md"
          className="min-w-[190px]"
        />
      </div>

      {/* bulk actions — only while rows are ticked */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-xl border border-[#bfe6f4] bg-[#eef9fd]">
          <span className="text-[14px] text-[#16274D]">
            <b className="font-semibold">{selected.length}</b> {selected.length === 1 ? 'item' : 'items'} selected
            <button onClick={() => setSelected([])} className="ml-3 text-[13px] text-[#1d7da3] underline cursor-pointer">
              Clear
            </button>
          </span>
          <button
            onClick={deleteSelected}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Trash2 size={15} />
            Delete ({selected.length})
          </button>
        </div>
      )}

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <Package size={26} />
            </div>
            <div className="font-semibold text-[#16274D]">{hasFilters ? 'No items match your filters' : 'No items yet'}</div>
            <div className="text-[13px] text-[#5d6678] mt-1">
              {hasFilters ? (
                <>
                  Try adjusting the filters, or{' '}
                  <button onClick={clearFilters} className="text-[#1d7da3] underline cursor-pointer">
                    clear them all
                  </button>
                  .
                </>
              ) : (
                'Add your first item.'
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className={thCls} style={{ width: 56 }}>
                      <input type="checkbox" className={checkboxCls} checked={allSelected} onChange={toggleAll} aria-label="Select all items" />
                    </th>
                    <th className={thCls} style={{ width: 120 }}>Icon</th>
                    <th className={thCls}>Item Name (EN)</th>
                    <th className={thCls}>Item Name (AR)</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>
                      <button onClick={cycleSort} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[#4EBEE3] transition-colors" title="Sort by category">
                        Category
                        <SortIcon size={14} className={sortDir ? 'text-[#4EBEE3]' : 'text-gray-400'} />
                      </button>
                    </th>
                    <th className={thCls}>Group</th>
                    <th className={thCls}>Active</th>
                    <th className={`${thCls} text-right`} style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageRows.map((item, i) => {
                    const g = groupOf(item);
                    const startsGroup = groupBy !== 'none' && (i === 0 || groupOf(pageRows[i - 1]).key !== g.key);
                    return [
                      startsGroup && (
                        <tr key={`g-${g.key}`} className="bg-[#F8FAFC]">
                          <td colSpan={COLS} className="px-4 py-2.5">
                            <span className="text-[13px] font-semibold text-[#16274D]">{g.label}</span>
                            <span className="ml-2 text-[12px] text-gray-500">
                              {groupCounts.get(g.key)} {groupCounts.get(g.key) === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                        </tr>
                      ),
                      <tr key={item.id} onClick={() => setEditing(item)} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                        <td className={tdCls}>
                          <input
                            type="checkbox"
                            className={checkboxCls}
                            checked={selected.includes(item.id)}
                            onChange={() => toggleOne(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${item.nameEn}`}
                          />
                        </td>
                        <td className={tdCls}>
                          <ItemThumb src={item.image} alt={item.nameEn} />
                        </td>
                        <td className={`${tdCls} text-[14px] text-[#16274D]`}>{item.nameEn}</td>
                        <td className={`${tdCls} text-[14px] text-[#16274D] text-right`} dir="rtl">
                          {item.nameAr || <span className="text-gray-400">—</span>}
                        </td>
                        <td className={tdCls}>
                          <TypePill type={item.type} />
                        </td>
                        <td className={tdCls}>
                          <CategoryPill name={categoryName(item.categoryId)} />
                        </td>
                        <td className={tdCls}>
                          <GroupPill group={item.group} />
                        </td>
                        <td className={tdCls}>
                          <Switch
                            on={item.active}
                            label={`${item.nameEn} active`}
                            onChange={() => careSuiteService.updateLibraryItem(item.id, { active: !item.active })}
                          />
                        </td>
                        <td className={tdCls}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditing(item);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[#4EBEE3]/10 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil size={18} className="text-[#4EBEE3]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmRemoveItem(item);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>,
                    ];
                  })}
                </tbody>
              </table>
            </div>
            {/* pagination */}
            {pager}
          </>
        )}
      </div>

      {editing !== undefined && <ItemFormModal item={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
