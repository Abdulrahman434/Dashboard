import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, Layers, List, Edit2, Trash2, Pencil, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, categoryDisplayEn, categoryDisplayAr, type TeamCategory } from '../../services/careSuiteService';
import { Toggle, Note } from './careSuiteAtoms';
import { useAddSignal } from './ItemsManagerTab';
import CategoryFormModal from './CategoryFormModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { SortableRows, SortableTr, OrderBadge } from './sortable';

import { thLeft, thCenter, tdCls, trCls, nameCls } from './tableTokens';
import { CareSuiteIcon } from './careSuiteIcons';
import { ToneIconTile, toneColor, useBrandPrimary } from './categoryTone';
import QuickActionsPill from './QuickActionsPill';

const checkboxCls = 'w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';

/** Categories Manager tab — order, Active, Manage Items, Edit, Delete, and bulk Quick Actions. */
export default function CategoriesManagerTab({
  addSignal,
  onManageItems,
  headerSlot,
}: {
  addSignal: number;
  onManageItems: (categoryId: string) => void;
  headerSlot?: HTMLElement | null;
}) {
  const { categories, library } = useCareSuite();
  const primary = useBrandPrimary();
  // undefined = closed, null = adding, category = editing
  const [editing, setEditing] = useState<TeamCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<TeamCategory[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useAddSignal(addSignal, () => setEditing(null));

  // counts from the hook's live data (re-render on every store change)
  const itemCount = (id: string) => library.filter((i) => i.categoryId === id && !i.archived).length;

  // a category deleted elsewhere drops out of the selection
  const picked = categories.filter((c) => selected.includes(c.id));
  const allSelected = categories.length > 0 && picked.length === categories.length;
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const setActivePicked = (active: boolean) => {
    picked.forEach((c) => careSuiteService.updateCategory(c.id, { active }));
    toast.success(`${picked.length} ${picked.length === 1 ? 'category' : 'categories'} ${active ? 'shown to' : 'hidden from'} patients`);
  };
  const quickActions = (
    <QuickActionsPill
      count={picked.length}
      noun={['Category', 'Categories']}
      onDeselect={() => setSelected([])}
      actions={[
        ...(picked.length === 1 ? [{ label: 'Edit', icon: <Pencil size={16} />, tone: 'accent' as const, onClick: () => setEditing(picked[0]) }] : []),
        { label: 'Activate', icon: <Power size={16} />, tone: 'ok', onClick: () => setActivePicked(true) },
        { label: 'Deactivate', icon: <PowerOff size={16} />, tone: 'mute', onClick: () => setActivePicked(false) },
        { label: 'Delete', icon: <Trash2 size={16} />, tone: 'danger', onClick: () => setDeleting(picked), separated: true },
      ]}
    />
  );

  const saveOrder = (ids: string[]) => {
    careSuiteService.setCategoryOrder(ids);
    toast.success('Category order saved');
  };

  return (
    <>
      {picked.length > 0 && headerSlot && createPortal(quickActions, headerSlot)}
      <Note tone="info" icon={<Info size={16} />} className="mb-4">
        <div className="font-semibold text-[#16274D] text-[14px]">Manage and order categories</div>
        Reorder categories to control how they appear on the patient-facing screen. Click a category to manage its
        items and item order.
      </Note>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <Layers size={26} />
            </div>
            <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">No categories yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Add your first category to group items for patients.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <SortableRows ids={categories.map((c) => c.id)} onReorder={saveOrder}>
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className={thCenter} style={{ width: 40 }} />
                  <th className={thCenter} style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className={checkboxCls}
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? [] : categories.map((c) => c.id))}
                      aria-label="Select all categories"
                    />
                  </th>
                  <th className={thCenter} style={{ width: 70 }} title="Position on the patient-facing screen">
                    Order
                  </th>
                  <th className={thLeft}>Name</th>
                  <th className={thLeft}>Display Name (EN)</th>
                  <th className={thLeft}>Display Name (AR)</th>
                  <th className={thCenter}>Items</th>
                  <th className={thLeft} title="How the category looks on the patient screen">
                    Patient card
                  </th>
                  <th className={thCenter}>Active</th>
                  <th className={thCenter} />
                  <th className={thCenter} style={{ width: 96 }}>
                    Actions
                  </th>
                </tr>
              </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {categories.map((c, idx) => {
                    const n = itemCount(c.id);
                    return (
                      <SortableTr key={c.id} id={c.id} className={trCls} onClick={() => onManageItems(c.id)}>
                        {(handle) => (
                          <>
                            <td className={`${tdCls} text-center`}>{handle}</td>
                            <td className={`${tdCls} text-center`}>
                              <input
                                type="checkbox"
                                className={checkboxCls}
                                checked={selected.includes(c.id)}
                                onChange={() => toggleOne(c.id)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select ${c.nameEn}`}
                              />
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <OrderBadge n={idx + 1} />
                            </td>
                            <td className={tdCls}>
                              <span className={nameCls}>{c.nameEn}</span>
                            </td>
                            <td className={`${tdCls} text-[13.5px] text-[#19233a]`}>{categoryDisplayEn(c)}</td>
                            <td className={`${tdCls} text-[13.5px] text-[#19233a] text-left`} dir="rtl">
                              {categoryDisplayAr(c) || <span className="text-[#9099ab]">—</span>}
                            </td>
                            <td className={`${tdCls} text-center text-[13.5px] text-[#19233a] whitespace-nowrap`}>
                              {n} {n === 1 ? 'item' : 'items'}
                            </td>
                            <td className={tdCls}>
                              <span className="inline-flex items-center gap-2.5">
                                <ToneIconTile color={toneColor(c.tone, primary)} size={30}>
                                  <CareSuiteIcon name={c.icon} size={15} />
                                </ToneIconTile>
                                <span className="text-[12.5px] leading-tight text-[#19233a] whitespace-nowrap">
                                  {c.cardStyle === 'icon' ? 'Icon cards' : 'Photo cards'}
                                  <span className="block text-[11.5px] text-[#9099ab]">
                                    {c.tone === 'alert' ? 'Alert red' : 'Brand'} · {c.allowMultiple ? 'Several items' : 'One item'}
                                  </span>
                                </span>
                              </span>
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
                                <Toggle
                                  on={c.active}
                                  onClick={() => {
                                    careSuiteService.updateCategory(c.id, { active: !c.active });
                                    toast.success(c.active ? 'Category hidden from patients' : 'Category shown to patients');
                                  }}
                                />
                              </span>
                            </td>
                            <td className={`${tdCls} text-center`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onManageItems(c.id);
                                }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#4EBEE3] text-[#1d7da3] rounded-lg text-[13px] font-medium hover:bg-[#eaf7fc] transition-colors cursor-pointer whitespace-nowrap"
                                title="Manage this category's items and their order"
                              >
                                <List size={15} />
                                Manage Items
                              </button>
                            </td>
                            <td className={tdCls}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(c);
                                  }}
                                  className="p-1.5 hover:bg-[#4EBEE3]/10 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleting([c]);
                                  }}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </SortableTr>
                    );
                  })}
                </tbody>
            </table>
            </SortableRows>
          </div>
        )}
      </div>

      {editing !== undefined && <CategoryFormModal category={editing} onClose={() => setEditing(undefined)} />}
      {deleting && (
        <DeleteCategoryDialog
          categories={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setSelected((s) => s.filter((id) => !deleting.some((c) => c.id === id)));
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
