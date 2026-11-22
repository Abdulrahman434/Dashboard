import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { careSuiteService, type DeleteCategoryMode, type TeamCategory } from '../../services/careSuiteService';
import { Btn, Card, CardHead, Bar, Note, cx } from './careSuiteAtoms';
import { SingleSelectDropdown } from '../UnifiedDropdown';

type Mode = DeleteCategoryMode['mode'];

const OPTIONS: { mode: Mode; title: string; detail: string }[] = [
  {
    mode: 'delete-items',
    title: 'Delete category and its items',
    detail: 'The items are removed from Items Manager and the patient screen. Their request history stays readable.',
  },
  {
    mode: 'move-items',
    title: 'Move items to another category',
    detail: 'The items keep their settings and are added to the end of the chosen category.',
  },
  {
    mode: 'uncategorize',
    title: 'Keep items uncategorized',
    detail: 'The items stay in Items Manager without a category and are hidden from patients until reassigned.',
  },
];

/**
 * Delete a category: shows how many items and teams are affected, warns that
 * team associations are removed, and requires an explicit choice for the
 * category's items before the Delete button enables.
 */
export default function DeleteCategoryDialog({
  category,
  onClose,
  onDeleted,
}: {
  category: TeamCategory;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { items, teams } = careSuiteService.categoryUsage(category.id);
  const others = careSuiteService.listCategories().filter((c) => c.id !== category.id);
  // with no items there is nothing to decide
  const [mode, setMode] = useState<Mode | null>(items === 0 ? 'uncategorize' : null);
  const [target, setTarget] = useState('');

  const ready = mode !== null && (mode !== 'move-items' || !!target);

  const confirmDelete = () => {
    if (!ready) return;
    const opts: DeleteCategoryMode =
      mode === 'move-items' ? { mode, targetCategoryId: target } : ({ mode } as DeleteCategoryMode);
    careSuiteService.deleteCategory(category.id, opts);
    const moved = mode === 'move-items' ? others.find((c) => c.id === target)?.nameEn : null;
    toast.success(moved ? `Category deleted — ${items} items moved to ${moved}` : 'Category deleted');
    onDeleted();
  };

  const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

  return (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5" onClick={onClose}>
      <Card className="max-w-[560px] w-full" onClick={(e: any) => e.stopPropagation()} role="dialog" aria-modal="true">
        <CardHead
          title={`Delete “${category.nameEn}”?`}
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
          <div className="text-[14px] text-[#19233a]">
            <span className="font-semibold">{plural(items, 'item')}</span> and{' '}
            <span className="font-semibold">{plural(teams, 'team')}</span> are linked to this category.
          </div>

          {teams > 0 && (
            <Note tone="warn" icon={<AlertTriangle size={16} />}>
              The {plural(teams, 'team')} assigned to this category will lose this association. Request history is kept.
            </Note>
          )}

          {items > 0 && (
            <div className="space-y-2" role="radiogroup" aria-label="What happens to this category's items">
              <div className="text-[13px] font-medium text-[#5d6678]">What should happen to its items?</div>
              {OPTIONS.map((o) => {
                const on = mode === o.mode;
                const unavailable = o.mode === 'move-items' && others.length === 0;
                return (
                  <div
                    key={o.mode}
                    className={cx(
                      'rounded-[10px] border px-4 py-3 transition-colors',
                      on ? 'border-[#4EBEE3] bg-[#eaf7fc]' : 'border-[#e7e9f0]',
                      unavailable ? 'opacity-50' : 'cursor-pointer hover:border-[#4EBEE3]',
                    )}
                    onClick={() => !unavailable && setMode(o.mode)}
                    role="radio"
                    aria-checked={on}
                    aria-disabled={unavailable}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cx(
                          'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                          on ? 'border-[#4EBEE3]' : 'border-[#c4c9d6]',
                        )}
                      >
                        {on && <span className="w-2 h-2 rounded-full bg-[#4EBEE3]" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={cx('text-[14px] font-medium', o.mode === 'delete-items' ? 'text-[#c0392b]' : 'text-[#16274D]')}>
                          {o.title}
                        </div>
                        <div className="text-[12.5px] text-[#5d6678] mt-0.5">
                          {unavailable ? 'There is no other category to move them to.' : o.detail}
                        </div>
                        {on && o.mode === 'move-items' && (
                          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                            <SingleSelectDropdown
                              options={others.map((c) => ({ value: c.id, label: c.nameEn }))}
                              value={target}
                              onChange={(v: string) => setTarget(v)}
                              placeholder="Choose a category"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Bar>
          <Btn variant="neutral" onClick={onClose}>
            Cancel
          </Btn>
          <button
            onClick={confirmDelete}
            disabled={!ready}
            className="inline-flex items-center justify-center gap-2 h-[38px] px-[15px] rounded-[10px] text-[13.5px] font-medium bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete category
          </button>
        </Bar>
      </Card>
    </div>
  );
}
