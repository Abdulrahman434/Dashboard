import { useEffect, useRef, useState } from 'react';
import { Package, Search, Edit2, Trash2, X, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, type LibraryItem, type RequestType, type Priority } from '../../services/careSuiteService';
import { cx, Btn, Toggle, Tag, Note, Card, CardHead, Bar, rowCls, PriorityPill, TypeBadge, ListHeader } from './careSuiteAtoms';
import { SingleSelectDropdown } from '../UnifiedDropdown';
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
  { value: 'Service Request', label: 'Service Request' },
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

/** Items Manager tab — the former CareSuite Library, unchanged apart from hiding archived items. */
export default function ItemsManagerTab({ addSignal }: { addSignal: number }) {
  const { categories, library } = useCareSuite();

  const [search, setSearch] = useState('');
  // undefined = closed, null = adding, item = editing
  const [editing, setEditing] = useState<LibraryItem | null | undefined>(undefined);

  useAddSignal(addSignal, () => setEditing(null));

  const q = search.trim().toLowerCase();
  const rows = library
    .filter((item) => !item.archived)
    .filter((item) =>
      !q ? true : item.nameEn.toLowerCase().includes(q) || (item.nameAr || '').includes(search.trim()),
    );

  return (
    <>
      <Card>
        {categories.length === 0 && (
          <div className="px-5 pt-4">
            <Note tone="info" icon={<Info size={16} />}>
              No categories yet — items can still be added, but showing them to patients and routing them to a
              team needs at least one category. Create one in the Categories Manager tab.
            </Note>
          </div>
        )}

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 h-[38px] px-3 border border-[#e7e9f0] rounded-[10px] focus-within:border-[#4EBEE3] transition-colors">
            <Search size={16} className="text-[#9099ab] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items by name"
              className="flex-1 bg-transparent outline-none text-[13.5px] text-[#19233a] placeholder:text-[#9099ab]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[#9099ab] hover:text-[#5d6678] cursor-pointer flex-shrink-0"
                title="Clear"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 px-5">
              <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
                <Package size={26} />
              </div>
              <div className="font-semibold text-[#16274D]">{q ? 'No items match your search' : 'No items yet'}</div>
              <div className="text-[13px] text-[#5d6678] mt-1">
                {q ? 'Try a different name, or clear the search.' : 'Add your first item.'}
              </div>
            </div>
          ) : (
            <>
              <ListHeader
                cols={[
                  { label: 'ID', className: 'w-[45px] flex-shrink-0 text-left' },
                  { className: 'w-[34px] flex-shrink-0' },
                  { label: 'Item Name (EN)', className: 'flex-1' },
                  { label: 'Item Name (AR)', className: 'flex-1' },
                  { label: 'Type', className: 'w-[130px] flex-shrink-0' },
                  { label: 'Priority', className: 'w-[90px] flex-shrink-0' },
                  { label: 'Category', className: 'w-[150px] flex-shrink-0' },
                  { label: 'Active', className: 'w-[60px] flex-shrink-0' },
                  { label: 'Actions', className: 'w-[72px] flex-shrink-0', align: 'right' },
                ]}
              />
              {rows.map((item, idx) => {
                const category = categories.find((c) => c.id === item.categoryId);
                const serialNum = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={item.id}
                    onClick={() => setEditing(item)}
                    className={cx(rowCls, 'cursor-pointer hover:bg-[#f7f8fb] transition-colors')}
                  >
                    <div className="w-[45px] flex-shrink-0 text-[13px] font-semibold text-[#9099ab] text-left">
                      {serialNum}
                    </div>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nameEn}
                        className="w-[34px] h-[34px] rounded-[8px] object-cover border border-[#e7e9f0] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[34px] h-[34px] rounded-[8px] bg-[#f7f8fb] border border-[#e7e9f0] flex items-center justify-center text-[#9099ab] flex-shrink-0">
                        <Package size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 font-medium text-[#19233a] truncate">{item.nameEn}</div>
                    <div className="flex-1 min-w-0 text-[13.5px] text-[#5d6678] truncate">{item.nameAr || '—'}</div>
                    <div className="w-[130px] flex-shrink-0">
                      <TypeBadge type={item.type} />
                    </div>
                    <div className="w-[90px] flex-shrink-0">
                      <PriorityPill priority={item.priority} />
                    </div>
                    <div className="w-[150px] flex-shrink-0 min-w-0">
                      {category ? <Tag>{category.nameEn}</Tag> : <Tag className="text-[#9099ab]">Uncategorized</Tag>}
                    </div>
                    <div className="w-[60px] flex-shrink-0">
                      <Toggle
                        on={item.active}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          careSuiteService.updateLibraryItem(item.id, { active: !item.active });
                        }}
                      />
                    </div>
                    <div className="w-[72px] flex-shrink-0 flex items-center gap-1 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(item);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5d6678] hover:bg-[#eef1f7] hover:text-[#16274D] cursor-pointer transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmRemoveItem(item);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5d6678] hover:bg-[#fcebe9] hover:text-[#c0392b] cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </Card>

      {editing !== undefined && <ItemFormModal item={editing} onClose={() => setEditing(undefined)} />}
    </>
  );
}
