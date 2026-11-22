import { useState } from 'react';
import { ArrowLeft, ArrowUpDown, Edit2, Layers, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, type LibraryItem } from '../../services/careSuiteService';
import { Btn, Badge, cx } from './careSuiteAtoms';
import { ItemThumb, TypePill, Switch } from './itemTableAtoms';
import { ItemFormModal, confirmRemoveItem } from './ItemsManagerTab';
import { SortableRows, SortableTr, OrderBadge } from './sortable';
import { thLeft, thCenter, tdCls, trCls, nameCls } from './tableTokens';

const byOrder = (a: LibraryItem, b: LibraryItem) => (a.order ?? 0) - (b.order ?? 0);

/**
 * Manage Items — one category's items only, in their saved patient-facing
 * order. "Reorder Items" edits a draft that is written on Save and dropped on
 * Cancel, on Back, or on switching category (the parent keys this view by
 * category id). Reordering writes `order` only; category, type and team
 * routing are never touched.
 */
export default function CategoryItemsView({
  categoryId,
  onBack,
  onSelectCategory,
}: {
  categoryId: string;
  onBack: () => void;
  onSelectCategory: (id: string) => void;
}) {
  const { categories, library } = useCareSuite();
  const [draft, setDraft] = useState<string[] | null>(null);
  // undefined = closed, null = adding, item = editing
  const [editing, setEditing] = useState<LibraryItem | null | undefined>(undefined);

  const category = categories.find((c) => c.id === categoryId);
  const visible = (id: string) => library.filter((i) => i.categoryId === id && !i.archived);
  const saved = visible(categoryId).sort(byOrder);
  const reordering = draft !== null;
  const rows = reordering
    ? (draft.map((id) => saved.find((i) => i.id === id)).filter(Boolean) as LibraryItem[])
    : saved;

  if (!category) {
    // deleted elsewhere while open
    return (
      <Btn variant="neutral" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to categories
      </Btn>
    );
  }

  const save = () => {
    careSuiteService.setCategoryItemOrder(categoryId, draft!);
    setDraft(null);
    toast.success('Item order saved');
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e7e9f0] bg-white text-[#16274D] hover:bg-[#f7f8fb] cursor-pointer transition-colors shrink-0"
            title="Back to categories"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[20px] font-semibold text-[#16274D]">{category.nameEn}</h2>
              <Badge tone={category.active ? 'ok' : 'mute'}>{category.active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="text-[13.5px] text-[#6B7280]">
              Manage the items within this category and set their display order on the patient-facing screen.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {reordering ? (
            <>
              <Btn variant="neutral" onClick={() => setDraft(null)}>
                Cancel
              </Btn>
              <Btn variant="primary" onClick={save}>
                Save order
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="neutral" onClick={() => setEditing(null)}>
                <Plus size={16} />
                Add Item
              </Btn>
              <Btn variant="primary" onClick={() => setDraft(saved.map((i) => i.id))} disabled={saved.length < 2}>
                <ArrowUpDown size={16} />
                Reorder Items
              </Btn>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* category switcher */}
        <div className="w-[250px] shrink-0 bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 font-semibold text-[#16274D] border-b border-[#E5E7EB]">Categories</div>
          <div className="p-2 space-y-1">
            {categories.map((c) => {
              const n = visible(c.id).length;
              const on = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  onClick={() => !on && onSelectCategory(c.id)}
                  className={cx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer border',
                    on ? 'bg-[#eaf7fc] border-[#4EBEE3]' : 'border-transparent hover:bg-[#f7f8fb]',
                  )}
                  title={reordering && !on ? 'Unsaved order changes will be discarded' : undefined}
                >
                  <Layers size={18} className={on ? 'text-[#1d7da3]' : 'text-[#5d6678]'} />
                  <span className="min-w-0">
                    <span className={cx('block text-[13.5px] truncate', on ? 'font-semibold text-[#16274D]' : 'text-[#19233a]')}>
                      {c.nameEn}
                    </span>
                    <span className="block text-[12px] text-[#9099ab]">
                      {n} {n === 1 ? 'item' : 'items'}
                      {!c.active && ' · inactive'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* items of this category */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 px-5">
              <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
                <Package size={26} />
              </div>
              <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">No items in this category</div>
              <div className="text-[13px] text-[#5d6678] mt-1">Add an item, or assign existing items to it in Items Manager.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <SortableRows ids={rows.map((i) => i.id)} onReorder={setDraft}>
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      {reordering && <th className={thCenter} style={{ width: 50 }} />}
                      <th className={thCenter} style={{ width: 70 }}>
                        Order
                      </th>
                      <th className={thCenter} style={{ width: 120 }} />
                      <th className={thLeft}>Item Name (EN)</th>
                      <th className={thLeft}>Item Name (AR)</th>
                      <th className={thCenter}>Type</th>
                      <th className={thCenter}>Active</th>
                      {!reordering && (
                        <th className={thCenter} style={{ width: 96 }}>
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {rows.map((item, idx) => (
                      <SortableTr
                        key={item.id}
                        id={item.id}
                        disabled={!reordering}
                        className={reordering ? 'bg-white' : trCls}
                        onClick={reordering ? undefined : () => setEditing(item)}
                      >
                        {(handle) => (
                          <>
                            {reordering && <td className={`${tdCls} text-center`}>{handle}</td>}
                            <td className={`${tdCls} text-center`}>
                              <OrderBadge n={idx + 1} />
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <ItemThumb src={item.image} alt={item.nameEn} />
                            </td>
                            <td className={tdCls}>
                              <span className={nameCls}>{item.nameEn}</span>
                            </td>
                            <td className={`${tdCls} text-[13.5px] text-[#19233a] text-left`} dir="rtl">
                              {item.nameAr || <span className="text-[#9099ab]">—</span>}
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <TypePill type={item.type} />
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <Switch
                                  on={item.active}
                                  disabled={reordering}
                                  label={`${item.nameEn} active`}
                                  onChange={() => careSuiteService.updateLibraryItem(item.id, { active: !item.active })}
                                />
                            </td>
                            {!reordering && (
                              <td className={tdCls}>
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditing(item);
                                    }}
                                    className="p-1.5 hover:bg-[#4EBEE3]/10 rounded-lg transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      confirmRemoveItem(item);
                                    }}
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </SortableTr>
                    ))}
                  </tbody>
                </table>
              </SortableRows>
            </div>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <ItemFormModal item={editing} defaultCategoryId={categoryId} onClose={() => setEditing(undefined)} />
      )}
    </>
  );
}
