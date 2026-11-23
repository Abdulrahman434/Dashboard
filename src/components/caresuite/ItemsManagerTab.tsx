import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Package, Search, Pencil, Trash2, X, Info, ArrowUpDown, ArrowUp, ArrowDown, Power, PowerOff, PanelLeftOpen, ImagePlus, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, type LibraryItem, type RequestType, type Priority } from '../../services/careSuiteService';
import { Btn, Badge, Toggle, Note, Card, CardHead, Bar, cx } from './careSuiteAtoms';
import { ItemThumb, TypePill, CategoryPill, GroupPill, Switch, typeLabel } from './itemTableAtoms';
import TablePagination from '../TablePagination';
import QuickActionsPill from './QuickActionsPill';
import CategoryPanel, { ALL, UNCATEGORIZED } from './CategoryPanel';
import { SortableRows, SortableTr, OrderBadge } from './sortable';
import { peekPendingCategory, clearPendingCategory } from './caresuiteNav';
import { SingleSelectDropdown, MultiSelectDropdown } from '../UnifiedDropdown';
import { IconPickerDialog } from './IconPicker';
import { CareSuiteIcon, iconLabel } from './careSuiteIcons';
import { ToneIconTile, alpha, toneColor, useBrandPrimary } from './categoryTone';

const blankForm = (categoryId: string | null = null) => ({
  image: '',
  icon: '',
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
          icon: item.icon || '',
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
  const primary = useBrandPrimary();
  // the item's category decides whether the patient sees its photo or an icon
  const formCategory = categories.find((c) => c.id === form.categoryId);
  const iconStyle = formCategory?.cardStyle === 'icon';
  const color = toneColor(formCategory?.tone, primary);

  const saveItem = () => {
    const nameEn = (form.nameEn || '').trim();
    if (!nameEn) {
      toast('Enter an item name');
      return;
    }
    const payload = {
      image: form.image || undefined,
      icon: form.icon || undefined,
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

  const fieldCls = 'w-full h-[40px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors text-[13.5px]';
  const labelCls = 'block text-[13px] text-[#5d6678] mb-1.5';

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <Card className="max-w-[560px] w-full max-h-[90vh] flex flex-col" onClick={(e: any) => e.stopPropagation()}>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* picture + names: the same layout for photo and icon categories */}
          <div className="flex gap-4 items-start">
            <ItemVisualField
              iconStyle={iconStyle}
              image={form.image}
              icon={form.icon}
              color={color}
              alt={form.nameEn || 'Item'}
              onImage={(image) => patchForm({ image })}
              onIcon={(icon) => patchForm({ icon })}
            />
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <label className={labelCls} htmlFor="item-name-en">Name (English)</label>
                <input id="item-name-en" className={fieldCls} value={form.nameEn} onChange={(e) => patchForm({ nameEn: e.target.value })} placeholder="e.g. Extra towel" />
              </div>
              <div>
                <label className={labelCls} htmlFor="item-name-ar">Name (Arabic)</label>
                <input id="item-name-ar" className={fieldCls} dir="rtl" value={form.nameAr} onChange={(e) => patchForm({ nameAr: e.target.value })} placeholder="اسم العنصر" />
              </div>
            </div>
          </div>
          {formCategory && (
            <div className="text-[12px] text-[#9099ab] -mt-1">
              “{formCategory.nameEn}” shows {iconStyle ? 'an icon' : 'a photo'} for each item to patients
              {iconStyle ? `, in its ${formCategory.tone === 'alert' ? 'alert red' : 'brand'} colour` : ''}.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className={labelCls}>Category</span>
              <SingleSelectDropdown
                options={categories.map((c) => ({ value: c.id, label: c.nameEn }))}
                value={form.categoryId || ''}
                onChange={(v: string) => patchForm({ categoryId: v || null })}
                placeholder="No category"
                size="md"
              />
            </div>
            <div>
              <span className={labelCls}>Type</span>
              <SingleSelectDropdown options={TYPE_OPTIONS} value={form.type} onChange={(v: string) => patchForm({ type: v })} size="md" />
            </div>
            <div>
              <span className={labelCls}>Group Scope</span>
              <SingleSelectDropdown options={GROUP_OPTIONS} value={form.group || 'All'} onChange={(v: string) => patchForm({ group: v })} size="md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e7e9f0]">
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

/**
 * The item's picture slot: a photo upload for photo categories, an icon choice
 * for icon categories — same size and place, so both forms look alike.
 */
function ItemVisualField({
  iconStyle,
  image,
  icon,
  color,
  alt,
  onImage,
  onIcon,
}: {
  iconStyle: boolean;
  image?: string;
  icon?: string;
  color: string;
  alt: string;
  onImage: (dataUrl: string) => void;
  onIcon: (name: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tile = 'relative w-[104px] h-[104px] rounded-xl overflow-hidden flex items-center justify-center border transition-colors cursor-pointer group';
  const caption = 'block text-center text-[12px] text-[#1d7da3] mt-1.5';

  if (iconStyle) {
    return (
      <div className="shrink-0">
        <button
          type="button"
          onClick={() => setPicking(true)}
          className={cx(tile, 'border-[#e7e9f0] hover:border-[#4EBEE3]')}
          style={{ background: `linear-gradient(180deg, ${alpha(color, 0.1)}, ${alpha(color, 0.04)})` }}
          aria-label={icon ? `Icon: ${iconLabel(icon)}. Change icon` : 'Choose an icon'}
        >
          <ToneIconTile color={color} size={60}>
            <CareSuiteIcon name={icon} size={28} />
          </ToneIconTile>
        </button>
        <span className={caption}>{icon ? 'Change icon' : 'Choose icon'}</span>
        <IconPickerDialog open={picking} value={icon} color={color} onChange={onIcon} onClose={() => setPicking(false)} />
      </div>
    );
  }

  return (
    <div className="shrink-0">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => onImage(reader.result as string);
          reader.readAsDataURL(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cx(tile, 'bg-[#F3EEE8] border-[#e7e9f0] hover:border-[#4EBEE3]')}
        aria-label={image ? 'Change photo' : 'Upload a photo'}
      >
        {image ? (
          <img src={image} alt={alt} className="max-w-full max-h-full object-contain" />
        ) : (
          <ImagePlus size={28} className="text-[#b7ab9c]" />
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload size={18} className="text-white" />
        </span>
      </button>
      <span className={caption}>{image ? 'Change photo' : 'Upload photo'}</span>
    </div>
  );
}

type SortDir = 'asc' | 'desc' | null;
type GroupBy = 'none' | 'type' | 'group';

const thCls = "py-4 px-3 text-left text-[13.5px] font-medium text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap";
const tdCls = 'py-3 px-3 align-middle';
const checkboxCls = 'w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const GROUP_BY_OPTIONS = [
  { value: 'none', label: 'Group by: None' },
  { value: 'type', label: 'Group by: Type' },
  { value: 'group', label: 'Group by: Group' },
];
const groupLabel = (g?: string) => (!g || g === 'All' ? 'All Groups' : g);
const byOrder = (a: LibraryItem, b: LibraryItem) => (a.order ?? 0) - (b.order ?? 0);
const sameOrder = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * Items Manager tab: category list on the left (All items, each category in
 * patient order, Uncategorized) and the items table on the right. In a
 * category the table is in patient-facing order and rows can be dragged; a
 * changed order is a draft until Save order (or Cancel). Archived items are hidden.
 */
export default function ItemsManagerTab({ addSignal, headerSlot }: { addSignal: number; headerSlot?: HTMLElement | null }) {
  const { categories, library } = useCareSuite();
  const primary = useBrandPrimary();

  const [cat, setCat] = useState<string>(() => peekPendingCategory() ?? ALL);
  useEffect(() => clearPendingCategory(), []);
  const [panelOpen, setPanelOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [fTypes, setFTypes] = useState<string[]>([]);
  const [fGroups, setFGroups] = useState<string[]>([]);
  const [fStatus, setFStatus] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<string[]>([]);
  /** unsaved item order for the selected category (full id list), null when nothing changed */
  const [draft, setDraft] = useState<string[] | null>(null);
  // undefined = closed, null = adding, item = editing
  const [editing, setEditing] = useState<LibraryItem | null | undefined>(undefined);

  // a category deleted elsewhere falls back to All items
  const current = cat === ALL || cat === UNCATEGORIZED || categories.some((c) => c.id === cat) ? cat : ALL;
  const category = categories.find((c) => c.id === current);
  const isAll = current === ALL;
  const dirty = draft !== null && !!category;

  useAddSignal(addSignal, () => setEditing(null));

  /** Any change to what's listed resets paging and selection, so a hidden row never stays checked. */
  const narrow = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
    setSelected([]);
  };
  const selectCategory = (id: string) => {
    setCat(id);
    setDraft(null);
    setPage(1);
    setSelected([]);
  };

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.nameEn || '';
  const visible = library.filter((i) => !i.archived);
  const counts: Record<string, number> = { [ALL]: visible.length, [UNCATEGORIZED]: 0 };
  visible.forEach((i) => {
    const k = i.categoryId && categories.some((c) => c.id === i.categoryId) ? i.categoryId : UNCATEGORIZED;
    counts[k] = (counts[k] || 0) + 1;
  });

  const inScope = visible.filter((i) =>
    isAll ? true : current === UNCATEGORIZED ? !i.categoryId || !categories.some((c) => c.id === i.categoryId) : i.categoryId === current,
  );

  // patient order of the selected category: the draft if there is one, else the saved order
  const savedIds = category ? [...inScope].sort(byOrder).map((i) => i.id) : [];
  const orderedIds = draft
    ? [...draft.filter((id) => savedIds.includes(id)), ...savedIds.filter((id) => !draft.includes(id))]
    : savedIds;
  const position = new Map(orderedIds.map((id, n) => [id, n + 1]));

  const q = search.trim().toLowerCase();
  const hasFilters = !!q || fTypes.length + fGroups.length + fStatus.length > 0;
  const filtered = inScope.filter((item) => {
    if (q && !item.nameEn.toLowerCase().includes(q) && !(item.nameAr || '').includes(search.trim())) return false;
    if (fTypes.length && !fTypes.includes(item.type)) return false;
    if (fGroups.length && !fGroups.includes(item.group || 'All')) return false;
    if (fStatus.length && !fStatus.includes(item.active ? 'active' : 'inactive')) return false;
    return true;
  });

  const grouping = groupBy !== 'none';
  const groupOf = (item: LibraryItem): { key: string; label: string; rank: number } => {
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
    if (grouping) {
      const d = groupOf(a).rank - groupOf(b).rank;
      if (d) return d;
    }
    if (category) return (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0); // patient order
    return isAll && sortDir ? byCategory(a, b) : 0; // stable: stored order otherwise
  });
  const groupCounts = new Map<string, number>();
  if (grouping) rows.forEach((r) => groupCounts.set(groupOf(r).key, (groupCounts.get(groupOf(r).key) || 0) + 1));

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * perPage, currentPage * perPage);

  // dragging only means one thing when the whole category is listed in patient order
  const canDrag = !!category && !hasFilters && !grouping;
  const dragHint = !category
    ? undefined
    : canDrag
      ? undefined
      : 'Clear the search, filters and grouping to reorder';

  /** A drag on this page: put the page's items into their new order inside the full category order. */
  const reorderPage = (newPageIds: string[]) => {
    const slots = newPageIds.map((id) => orderedIds.indexOf(id)).sort((a, b) => a - b);
    const next = [...orderedIds];
    slots.forEach((slot, k) => (next[slot] = newPageIds[k]));
    setDraft(sameOrder(next, savedIds) ? null : next);
  };
  const saveOrder = () => {
    careSuiteService.setCategoryItemOrder(current, orderedIds);
    setDraft(null);
    toast.success('Item order saved');
  };

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
  const setActiveSelected = (active: boolean) => {
    selected.forEach((id) => careSuiteService.updateLibraryItem(id, { active }));
    toast.success(`${selected.length} item${selected.length === 1 ? '' : 's'} ${active ? 'activated' : 'deactivated'}`);
  };

  const clearFilters = () => {
    setSearch('');
    setFTypes([]);
    setFGroups([]);
    setFStatus([]);
    setPage(1);
    setSelected([]);
  };

  const cycleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));
  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  const quickActions = (
    <QuickActionsPill
      count={selected.length}
      noun={['Item', 'Items']}
      onDeselect={() => setSelected([])}
      actions={[
        ...(selected.length === 1
          ? [{ label: 'Edit', icon: <Pencil size={16} />, tone: 'accent' as const, onClick: () => setEditing(library.find((i) => i.id === selected[0]) ?? undefined) }]
          : []),
        { label: 'Activate', icon: <Power size={16} />, tone: 'ok', onClick: () => setActiveSelected(true) },
        { label: 'Deactivate', icon: <PowerOff size={16} />, tone: 'mute', onClick: () => setActiveSelected(false) },
        { label: 'Delete', icon: <Trash2 size={16} />, tone: 'danger', onClick: deleteSelected, separated: true },
      ]}
    />
  );

  const showCategoryCol = isAll;
  const showOrderCol = !!category;
  const colCount = 8 + (showCategoryCol ? 1 : 0) + (showOrderCol ? 2 : 0);

  /** What the patient sees on the card: the photo, or the icon in the category colour. */
  const itemVisual = (item: LibraryItem) => {
    const c = categories.find((x) => x.id === item.categoryId);
    if (c?.cardStyle !== 'icon') return <ItemThumb src={item.image} alt={item.nameEn} />;
    const color = toneColor(c.tone, primary);
    return (
      <span className="inline-flex w-[72px] h-[48px] rounded-lg items-center justify-center" style={{ background: `linear-gradient(180deg, ${color}1a, ${color}0a)` }}>
        <ToneIconTile color={color} size={36}>
          <CareSuiteIcon name={item.icon} size={18} />
        </ToneIconTile>
      </span>
    );
  };

  const checkboxCell = (item: LibraryItem) => (
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
  );

  /** Every cell after the checkbox. */
  const cells = (item: LibraryItem) => (
    <>
      {showOrderCol && (
        <td className={tdCls}>
          <OrderBadge n={position.get(item.id) ?? 0} />
        </td>
      )}
      <td className={tdCls}>
        {itemVisual(item)}
      </td>
      <td className={`${tdCls} text-[14px] text-[#16274D]`}>{item.nameEn}</td>
      <td className={`${tdCls} text-[14px] text-[#16274D] text-right`} dir="rtl">
        {item.nameAr || <span className="text-gray-400">—</span>}
      </td>
      <td className={tdCls}>
        <TypePill type={item.type} />
      </td>
      {showCategoryCol && (
        <td className={tdCls}>
          <CategoryPill name={categoryName(item.categoryId)} />
        </td>
      )}
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
    </>
  );

  const groupHeader = (item: LibraryItem, i: number) => {
    const g = groupOf(item);
    if (!grouping || (i > 0 && groupOf(pageRows[i - 1]).key === g.key)) return null;
    return (
      <tr key={`g-${g.key}`} className="bg-[#F8FAFC]">
        <td colSpan={colCount} className="px-4 py-2.5">
          <span className="text-[13px] font-semibold text-[#16274D]">{g.label}</span>
          <span className="ml-2 text-[12px] text-gray-500">
            {groupCounts.get(g.key)} {groupCounts.get(g.key) === 1 ? 'item' : 'items'}
          </span>
        </td>
      </tr>
    );
  };

  const table = (
    <table className="w-full">
      <thead className="border-b border-gray-200">
        <tr>
          {showOrderCol && <th className={thCls} style={{ width: 36 }} title={dragHint} />}
          <th className={thCls} style={{ width: 44 }}>
            <input type="checkbox" className={checkboxCls} checked={allSelected} onChange={toggleAll} aria-label="Select all items" />
          </th>
          {showOrderCol && (
            <th className={thCls} style={{ width: 64 }} title="Position on the patient-facing screen">
              Order
            </th>
          )}
          <th className={thCls} style={{ width: 96 }}>Icon</th>
          <th className={thCls}>Item Name (EN)</th>
          <th className={thCls}>Item Name (AR)</th>
          <th className={thCls}>Type</th>
          {showCategoryCol && (
            <th className={thCls}>
              <button onClick={cycleSort} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[#4EBEE3] transition-colors" title="Sort by category">
                Category
                <SortIcon size={14} className={sortDir ? 'text-[#4EBEE3]' : 'text-gray-400'} />
              </button>
            </th>
          )}
          <th className={thCls}>Group</th>
          <th className={thCls}>Active</th>
          <th className={`${thCls} text-right`} style={{ width: 92 }}>Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {pageRows.map((item, i) => [
          groupHeader(item, i),
          category ? (
            <SortableTr
              key={item.id}
              id={item.id}
              disabled={!canDrag}
              onClick={() => setEditing(item)}
              className="bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              {(handle) => (
                <>
                  <td className="py-3 pl-3 pr-0 align-middle" title={dragHint}>
                    {handle}
                  </td>
                  {checkboxCell(item)}
                  {cells(item)}
                </>
              )}
            </SortableTr>
          ) : (
            <tr key={item.id} onClick={() => setEditing(item)} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer">
              {checkboxCell(item)}
              {cells(item)}
            </tr>
          ),
        ])}
      </tbody>
    </table>
  );

  return (
    <div className="flex gap-4 items-start font-['Poppins',sans-serif]">
      {selected.length > 0 && headerSlot && createPortal(quickActions, headerSlot)}

      {panelOpen && (
        <CategoryPanel
          categories={categories}
          counts={counts}
          selected={current}
          onSelect={selectCategory}
          onCollapse={() => setPanelOpen(false)}
          locked={dirty}
        />
      )}

      <div className="flex-1 min-w-0 space-y-4">
        {categories.length === 0 && (
          <Note tone="info" icon={<Info size={16} />}>
            No categories yet — items can still be added, but showing them to patients and routing them to a team
            needs at least one category. Create one in the Categories Manager tab.
          </Note>
        )}

        {/* view title: All items / category name and state; Save / Cancel while the order is changed */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[18px] font-semibold text-[#16274D] truncate">
                {isAll ? 'All items' : category ? category.nameEn : 'Uncategorized'}
              </h2>
              {category && <Badge tone={category.active ? 'ok' : 'mute'}>{category.active ? 'Active' : 'Hidden from patients'}</Badge>}
              {dirty && <Badge tone="warn">Unsaved order</Badge>}
            </div>
            <p className="text-[13px] text-[#6B7280]">
              {isAll
                ? 'Every item across all categories. Pick a category to see and change the order patients see.'
                : category
                  ? dirty
                    ? 'Save to apply the new order on the patient screen, or cancel to keep the current one.'
                    : 'Items are listed in the order patients see them. Drag rows by the handle to change it.'
                  : 'These items have no category and are not shown to patients. Assign a category to show them.'}
            </p>
          </div>
          {dirty && (
            <div className="flex gap-2 shrink-0">
              <Btn variant="neutral" onClick={() => setDraft(null)}>
                Cancel
              </Btn>
              <Btn variant="primary" onClick={saveOrder}>
                Save order
              </Btn>
            </div>
          )}
        </div>

        {/* search (left) · filters + group by (right); locked while an order change is unsaved */}
        <div className="flex items-center gap-3 flex-wrap" title={dirty ? 'Save or cancel the new order first' : undefined}>
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-2 h-[44px] px-3.5 bg-white border border-gray-300 rounded-lg text-[14px] text-[#16274D] hover:border-gray-400 cursor-pointer"
              title="Show categories"
            >
              <PanelLeftOpen size={17} className="text-[#4EBEE3]" />
              {isAll ? 'All items' : category?.nameEn ?? 'Uncategorized'}
            </button>
          )}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              disabled={dirty}
              onChange={(e) => narrow(setSearch)(e.target.value)}
              placeholder="Search items by name"
              className="w-full h-[44px] pl-11 pr-10 bg-white border border-gray-300 rounded-lg text-[14px] text-[#19233a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/40 focus:border-[#4EBEE3] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            {search && !dirty && (
              <button
                onClick={() => narrow(setSearch)('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <MultiSelectDropdown options={TYPE_OPTIONS} selectedValues={fTypes} onChange={narrow(setFTypes)} placeholder="Type" className="min-w-[120px]" showSelectAll={false} disabled={dirty} />
          <MultiSelectDropdown
            options={GROUP_OPTIONS.map((g) => ({ value: g.value, label: groupLabel(g.value) }))}
            selectedValues={fGroups}
            onChange={narrow(setFGroups)}
            placeholder="Group"
            className="min-w-[120px]"
            showSelectAll={false}
            disabled={dirty}
          />
          <MultiSelectDropdown options={STATUS_OPTIONS} selectedValues={fStatus} onChange={narrow(setFStatus)} placeholder="Status" className="min-w-[115px]" showSelectAll={false} disabled={dirty} />
          <SingleSelectDropdown
            options={GROUP_BY_OPTIONS}
            value={groupBy}
            onChange={(v: string) => {
              setGroupBy(v as GroupBy);
              setPage(1);
            }}
            size="md"
            className="min-w-[170px]"
            disabled={dirty}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 px-5">
              <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
                <Package size={26} />
              </div>
              <div className="font-semibold text-[#16274D]">
                {hasFilters ? 'No items match your filters' : isAll ? 'No items yet' : 'No items in this category'}
              </div>
              <div className="text-[13px] text-[#5d6678] mt-1">
                {hasFilters ? (
                  <>
                    Try adjusting the filters, or{' '}
                    <button onClick={clearFilters} className="text-[#1d7da3] underline cursor-pointer">
                      clear them all
                    </button>
                    .
                  </>
                ) : category ? (
                  'Add an item, or assign existing items to this category.'
                ) : (
                  'Add your first item.'
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {category ? (
                  <SortableRows ids={pageRows.map((i) => i.id)} onReorder={reorderPage}>
                    {table}
                  </SortableRows>
                ) : (
                  table
                )}
              </div>
              <TablePagination
                alwaysShow
                className="px-5 py-3.5 border-t border-gray-200 bg-white"
                currentPage={currentPage}
                totalItems={rows.length}
                itemsPerPage={perPage}
                onPageChange={setPage}
                onItemsPerPageChange={setPerPage}
                itemLabel={rows.length === 1 ? 'item' : 'items'}
              />
            </>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <ItemFormModal item={editing} defaultCategoryId={category ? category.id : null} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
