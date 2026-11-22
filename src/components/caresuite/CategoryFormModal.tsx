import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { careSuiteService, categoryDisplayAr, type TeamCategory } from '../../services/careSuiteService';
import { Btn, Toggle, Card, CardHead, Bar } from './careSuiteAtoms';

const inputCls =
  'w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors text-[13.5px]';

/** Add (`category = null`) or edit a category: internal Name, patient-facing Display Names, Active. */
export default function CategoryFormModal({ category, onClose }: { category: TeamCategory | null; onClose: () => void }) {
  const [name, setName] = useState(category?.nameEn ?? '');
  const [displayEn, setDisplayEn] = useState(category?.displayNameEn ?? '');
  const [displayAr, setDisplayAr] = useState(category ? categoryDisplayAr(category) : '');
  const [active, setActive] = useState(category?.active ?? true);

  const save = () => {
    const n = name.trim();
    if (!n) {
      toast.error('Enter a category name');
      return;
    }
    if (careSuiteService.isCategoryNameTaken(n, category?.id)) {
      toast.error('A category with this name already exists');
      return;
    }
    const fields = { displayNameEn: displayEn.trim() || undefined, displayNameAr: displayAr.trim() || undefined, active };
    if (category) {
      careSuiteService.updateCategory(category.id, { nameEn: n, ...fields });
    } else {
      careSuiteService.createCategory({ nameEn: n, ...fields });
    }
    toast.success(category ? 'Category updated' : 'Category added');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5" onClick={onClose}>
      <Card className="max-w-[520px] w-full" onClick={(e: any) => e.stopPropagation()}>
        <CardHead
          title={category ? 'Edit category' : 'Add category'}
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
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] text-[#5d6678] mb-1.5">Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Housekeeping requests" autoFocus />
            <div className="text-[12px] text-[#9099ab] mt-1">Internal name — used in Team Assignment and Items Manager.</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Display Name (EN)</label>
              <input className={inputCls} value={displayEn} onChange={(e) => setDisplayEn(e.target.value)} placeholder={name || 'e.g. I Need Something'} />
            </div>
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5">Display Name (AR)</label>
              <input className={inputCls} dir="rtl" value={displayAr} onChange={(e) => setDisplayAr(e.target.value)} placeholder="مثال: أحتاج إلى شيء" />
            </div>
          </div>
          <div className="text-[12px] text-[#9099ab] -mt-2">Shown on the patient-facing screen. English falls back to the Name when empty.</div>
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e7e9f0]">
            <div>
              <div className="font-medium text-[#19233a]">Active</div>
              <div className="text-[13px] text-[#5d6678] mt-0.5">
                Inactive categories and their items are hidden from patients. Teams and requests are not affected.
              </div>
            </div>
            <Toggle on={active} onClick={() => setActive(!active)} />
          </div>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={save}>
            Save category
          </Btn>
        </Bar>
      </Card>
    </div>
  );
}
