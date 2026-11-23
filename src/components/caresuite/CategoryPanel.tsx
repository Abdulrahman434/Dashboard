import { Layers, LayoutList, PanelLeftClose, FolderX } from 'lucide-react';
import type { TeamCategory } from '../../services/careSuiteService';
import { cx } from './careSuiteAtoms';
import { ItemIcon } from './careSuiteIcons';

export const ALL = '__all';
export const UNCATEGORIZED = '__none';

/**
 * Left-hand category list for Items Manager: All items, each category in
 * patient-facing order (count + inactive mark), then Uncategorized.
 */
export default function CategoryPanel({
  categories,
  counts,
  selected,
  onSelect,
  onCollapse,
  locked,
}: {
  categories: TeamCategory[];
  /** visible (non-archived) item count per category id, plus ALL and UNCATEGORIZED */
  counts: Record<string, number>;
  selected: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
  /** while reordering, switching would drop the draft — the list is frozen */
  locked?: boolean;
}) {
  const row = (id: string, label: string, icon: React.ReactNode, sub?: string, muted?: boolean) => {
    const on = selected === id;
    return (
      <button
        key={id}
        onClick={() => !on && !locked && onSelect(id)}
        disabled={locked && !on}
        className={cx(
          'w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors border',
          on ? 'bg-[#eaf7fc] border-[#4EBEE3]' : 'border-transparent hover:bg-[#f7f8fb]',
          locked && !on ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        )}
        title={locked && !on ? 'Save or cancel the new order first' : undefined}
      >
        <span className={cx('shrink-0', on ? 'text-[#1d7da3]' : 'text-[#5d6678]')}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={cx('block text-[13.5px] leading-snug', on ? 'font-semibold text-[#16274D]' : muted ? 'text-[#5d6678]' : 'text-[#19233a]')}>
            {label}
          </span>
          {sub && <span className="block text-[12px] text-[#9099ab]">{sub}</span>}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-[#5d6678] bg-[#f3f4f6] rounded-full px-2 py-0.5">{counts[id] ?? 0}</span>
      </button>
    );
  };

  return (
    <div className="w-[216px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden self-start font-['Poppins',sans-serif]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="font-semibold text-[14px] text-[#16274D]">Categories</span>
        <button
          onClick={onCollapse}
          className="p-1 rounded-md text-[#9099ab] hover:text-[#16274D] hover:bg-[#f3f4f6] cursor-pointer"
          title="Hide categories"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
      <div className="p-2 space-y-1">
        {row(ALL, 'All items', <LayoutList size={17} />)}
        <div className="border-t border-gray-100 my-1.5" />
        {categories.map((c) => row(c.id, c.nameEn, c.icon || c.iconSvg ? <ItemIcon name={c.icon} svg={c.iconSvg} size={17} /> : <Layers size={17} />, c.active ? undefined : 'Hidden from patients'))}
        {(counts[UNCATEGORIZED] ?? 0) > 0 && row(UNCATEGORIZED, 'Uncategorized', <FolderX size={17} />, 'Not shown to patients', true)}
      </div>
    </div>
  );
}
