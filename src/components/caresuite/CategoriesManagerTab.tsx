import { useState } from 'react';
import { Info, Layers, List, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, categoryDisplayEn, categoryDisplayAr, type TeamCategory } from '../../services/careSuiteService';
import { Toggle, Note } from './careSuiteAtoms';
import { useAddSignal } from './ItemsManagerTab';
import CategoryFormModal from './CategoryFormModal';
import CategoryItemsView from './CategoryItemsView';
import { SortableRows, SortableTr, OrderBadge } from './sortable';

import { thLeft, thCenter, tdCls, trCls, nameCls } from './tableTokens';

/** Categories Manager tab — order, Active, Manage Items, Edit, Delete. */
export default function CategoriesManagerTab({ addSignal }: { addSignal: number }) {
  const { categories, library } = useCareSuite();
  // undefined = closed, null = adding, category = editing
  const [editing, setEditing] = useState<TeamCategory | null | undefined>(undefined);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<TeamCategory | null>(null);

  useAddSignal(addSignal, () => setEditing(null));

  // counts from the hook's live data (re-render on every store change)
  const itemCount = (id: string) => library.filter((i) => i.categoryId === id && !i.archived).length;

  const saveOrder = (ids: string[]) => {
    careSuiteService.setCategoryOrder(ids);
    toast.success('Category order saved');
  };

  if (managingId) {
    return (
      <>
        {/* keyed so switching category drops any unsaved reorder draft */}
        <CategoryItemsView
          key={managingId}
          categoryId={managingId}
          onBack={() => setManagingId(null)}
          onSelectCategory={setManagingId}
        />
        {editing !== undefined && <CategoryFormModal category={editing} onClose={() => setEditing(undefined)} />}
      </>
    );
  }

  return (
    <>
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
                  <th className={thCenter} style={{ width: 50 }} />
                  <th className={thCenter} style={{ width: 70 }} title="Position on the patient-facing screen">
                    Order
                  </th>
                  <th className={thLeft}>Name</th>
                  <th className={thLeft}>Display Name (EN)</th>
                  <th className={thLeft}>Display Name (AR)</th>
                  <th className={thCenter}>Items</th>
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
                      <SortableTr key={c.id} id={c.id} className={trCls} onClick={() => setManagingId(c.id)}>
                        {(handle) => (
                          <>
                            <td className={`${tdCls} text-center`}>{handle}</td>
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
                                  setManagingId(c.id);
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
                                    setDeleting(c);
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
      {/* Task 6 replaces this with the delete dialog */}
      {deleting && void setDeleting}
    </>
  );
}
