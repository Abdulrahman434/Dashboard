import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ATTACHMENT_LABEL, profileService, type ProfileCategory } from '../../services/hospitalProfileService';
import { Btn, Card, CardHead, Bar, cx } from '../caresuite/careSuiteAtoms';

/**
 * Delete one or more profile categories. Lists what will be lost (text,
 * attachment) and only enables Delete once the admin ticks the acknowledgement.
 */
export default function DeleteCategoryDialog({ categories, onClose, onDeleted }: { categories: ProfileCategory[]; onClose: () => void; onDeleted: (ids: string[]) => void }) {
  const [ack, setAck] = useState(false);
  const single = categories.length === 1;
  const rows = categories.map((c) => ({ c, s: profileService.contentSummary(c.id) }));
  const withContent = rows.filter((r) => r.s.hasText || r.s.attachment);

  const del = () => {
    if (!ack) return;
    categories.forEach((c) => profileService.deleteCategory(c.id));
    toast.success(single ? 'Category deleted' : `${categories.length} categories deleted`);
    onDeleted(categories.map((c) => c.id));
  };

  const lost = (s: { hasText: boolean; attachment: keyof typeof ATTACHMENT_LABEL | null }) =>
    [s.hasText && 'its text (English and Arabic)', s.attachment && `its ${ATTACHMENT_LABEL[s.attachment]}`].filter(Boolean).join(' and ');

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <Card className="max-w-[520px] w-full" onClick={(e: any) => e.stopPropagation()} role="dialog" aria-modal="true">
        <CardHead
          title={single ? `Delete “${categories[0].nameEn}”?` : `Delete ${categories.length} categories?`}
          right={
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer" title="Close">
              <X size={18} />
            </button>
          }
        />
        <div className="p-5 space-y-4">
          <div className="flex gap-3 rounded-[10px] bg-[#fcebe9] text-[#9b2c1f] px-4 py-3 text-[13.5px]">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              {withContent.length === 0 ? (
                <>{single ? 'This category has' : 'These categories have'} no content. {single ? 'It' : 'They'} will be removed from the patient About Us menu.</>
              ) : single ? (
                <>The category and all its content will be deleted: {lost(withContent[0].s)}. Patients will no longer see it in About Us.</>
              ) : (
                <>
                  The categories and all their content will be deleted:
                  <ul className="list-disc ps-5 mt-1.5 space-y-0.5">
                    {withContent.map(({ c, s }) => (
                      <li key={c.id}>
                        <b className="font-semibold">{c.nameEn}</b>: {lost(s)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <label className={cx('flex items-center gap-2.5 text-[13.5px] text-[#16274D] cursor-pointer select-none')}>
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#EF4444] cursor-pointer" />
            I understand this can't be undone
          </label>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
          <button
            onClick={del}
            disabled={!ack}
            className="inline-flex items-center justify-center h-[38px] px-[15px] rounded-[10px] text-[13.5px] font-medium bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {single ? 'Delete category' : `Delete ${categories.length} categories`}
          </button>
        </Bar>
      </Card>
    </div>
  );
}
