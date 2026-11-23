import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { profileService, type ProfileCategory } from '../../services/hospitalProfileService';
import { Btn, Toggle, Card, CardHead, Bar } from '../caresuite/careSuiteAtoms';
import InfoTip from '../caresuite/InfoTip';

const inputCls = 'w-full h-[40px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors text-[13.5px]';

/** Add (`category = null`) or rename a profile category. */
export default function CategoryFormModal({ category, onClose, onCreated }: { category: ProfileCategory | null; onClose: () => void; onCreated?: (id: string) => void }) {
  const [nameEn, setNameEn] = useState(category?.nameEn ?? '');
  const [nameAr, setNameAr] = useState(category?.nameAr ?? '');
  const [active, setActive] = useState(category?.active ?? true);

  const save = () => {
    if (!nameEn.trim() || !nameAr.trim()) {
      toast.error('Enter the category name in English and Arabic');
      return;
    }
    if (profileService.isNameTaken(nameEn, category?.id)) {
      toast.error('A category with this name already exists');
      return;
    }
    if (category) {
      profileService.updateCategory(category.id, { nameEn: nameEn.trim(), nameAr: nameAr.trim(), active });
      toast.success('Category updated');
    } else {
      const c = profileService.createCategory({ nameEn, nameAr, active });
      toast.success('Category added');
      onCreated?.(c.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <Card className="max-w-[520px] w-full" onClick={(e: any) => e.stopPropagation()} role="dialog" aria-modal="true">
        <CardHead
          title={category ? 'Edit category' : 'Add category'}
          right={
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer" title="Close">
              <X size={18} />
            </button>
          }
        />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5" htmlFor="pc-name-en">Name (English)</label>
              <input id="pc-name-en" className={inputCls} value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Services" autoFocus />
            </div>
            <div>
              <label className="block text-[13px] text-[#5d6678] mb-1.5" htmlFor="pc-name-ar">Name (Arabic)</label>
              <input id="pc-name-ar" className={inputCls} dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: الخدمات" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e7e9f0]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#19233a] text-[14px]">
              Active <InfoTip text="Inactive categories are hidden from the patient About Us menu. Their content is kept." />
            </span>
            <Toggle on={active} onClick={() => setActive(!active)} />
          </div>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save}>{category ? 'Save' : 'Add category'}</Btn>
        </Bar>
      </Card>
    </div>
  );
}
