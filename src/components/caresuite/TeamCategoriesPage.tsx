import { useState } from 'react';
import { Tag, Plus, Trash2, X, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { careSuiteService } from '../../services/careSuiteService';
import { useCareSuite } from '../../hooks/useCareSuite';
import { cx, Btn, Badge, Card, CardHead, Bar, rowCls, CareSuitePage, ListHeader } from './careSuiteAtoms';

export default function TeamCategoriesPage() {
  const { categories, library, teams } = useCareSuite();

  const [addOpen, setAddOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');

  function resetAddRow() {
    setNameEn('');
    setNameAr('');
    setAddOpen(false);
  }

  function handleSave() {
    if (!nameEn.trim()) {
      toast('Enter a category name');
      return;
    }
    careSuiteService.createCategory({ nameEn: nameEn.trim(), nameAr: nameAr.trim() || undefined });
    resetAddRow();
    toast('Category added');
  }

  function handleDelete(catId: string, usedByItems: number, usedByTeams: number) {
    if (usedByItems + usedByTeams > 0) {
      toast('Remove this category from all items/teams first');
      return;
    }
    careSuiteService.removeCategory(catId);
    toast('Category removed');
  }

  return (
    <CareSuitePage>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center text-[#4EBEE3] shrink-0 mt-1">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Team Categories</h1>
            <p className="text-[14px] text-[#6B7280]">
              The category tags used to route CareSuite library items and teams (e.g. Housekeeping, Maintenance).
            </p>
          </div>
        </div>
        <Btn variant="primary" onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4" />
          Add category
        </Btn>
      </div>

      <Card>

        {addOpen && (
          <div className="p-4 border-b border-[#e7e9f0] bg-[#f7f8fb] flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-[#5d6678] mb-1">Name (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Housekeeping"
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-[#5d6678] mb-1">Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="اختياري"
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="neutral" onClick={resetAddRow}>
                <X className="w-4 h-4" />
                Cancel
              </Btn>
              <Btn variant="primary" onClick={handleSave}>
                Save
              </Btn>
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center mb-3">
              <Tag className="w-8 h-8 text-[#9099ab]" />
            </div>
            <div className="text-[#19233a] font-medium">No team categories yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1 max-w-[320px]">
              Add your first category to start tagging CareSuite items and teams.
            </div>
          </div>
        ) : (
          <div>
            <ListHeader
              cols={[
                { label: 'ID', className: 'w-[45px] flex-shrink-0 text-left' },
                { label: 'Category (EN)', className: 'flex-1' },
                { label: 'Category (AR)', className: 'flex-1' },
                { label: 'Used by', className: 'w-[160px] flex-shrink-0' },
                { label: 'Actions', className: 'w-[70px] flex-shrink-0', align: 'right' },
              ]}
            />
            {categories.map((cat: any, idx: number) => {
              const usedByItems = library.filter((i: any) => i.categoryId === cat.id).length;
              const usedByTeams = teams.filter((t: any) => t.categoryIds.includes(cat.id)).length;
              const inUse = usedByItems + usedByTeams > 0;
              const serialNum = String(idx + 1).padStart(2, '0');
              return (
                <div key={cat.id} className={rowCls}>
                  <div className="w-[45px] flex-shrink-0 text-[13px] font-semibold text-[#9099ab] text-left">
                    {serialNum}
                  </div>
                  <div className="flex-1 min-w-0 font-medium text-[#19233a]">
                    {cat.nameEn}
                  </div>
                  <div className="flex-1 min-w-0 text-[13.5px] text-[#5d6678]">
                    {cat.nameAr || '—'}
                  </div>
                  <div className="w-[160px] flex-shrink-0">
                    <Badge tone="mute">
                      {usedByItems} item{usedByItems === 1 ? '' : 's'} · {usedByTeams} team{usedByTeams === 1 ? '' : 's'}
                    </Badge>
                  </div>
                  <div className="w-[70px] flex-shrink-0 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, usedByItems, usedByTeams)}
                      title={inUse ? 'Remove this category from all items/teams first' : 'Delete category'}
                      className="p-1.5 rounded-lg text-[#5d6678] hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Bar>
          <Info className="w-4 h-4 text-[#5d6678]" />
          <span className="text-[13px] text-[#5d6678]">
            Categories tag both CareSuite Library items and Teams Assignment — set them up before configuring either.
          </span>
        </Bar>
      </Card>
    </CareSuitePage>
  );
}
