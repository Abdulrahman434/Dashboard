import { useState, type ReactNode } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { cx } from './careSuiteAtoms';

export interface QuickAction {
  label: string;
  icon: ReactNode;
  /** icon tile colours */
  tone: 'accent' | 'ok' | 'mute' | 'danger';
  onClick: () => void;
  /** draw a divider above this action */
  separated?: boolean;
}

const TONE: Record<QuickAction['tone'], string> = {
  accent: 'bg-[#4EBEE3]/10 text-[#4EBEE3]',
  ok: 'bg-green-50 text-green-600',
  mute: 'bg-gray-50 text-gray-600',
  danger: 'bg-red-50 text-red-600',
};

/**
 * Selection summary for the page header: "(n) Items selected · Deselect All ·
 * Quick Actions ▾" — same menu pattern as the Food Library's Quick Actions.
 */
export default function QuickActionsPill({
  count,
  noun,
  onDeselect,
  actions,
}: {
  count: number;
  noun: [string, string]; // singular, plural
  onDeselect: () => void;
  actions: QuickAction[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-4 pl-3 pr-1 py-1 rounded-xl border border-[#4EBEE3]/40 bg-[#eef9fd] font-['Poppins',sans-serif]">
      <div className="flex items-center gap-2">
        <span className="min-w-[30px] h-[22px] px-2 rounded-full bg-[#4EBEE3] text-white text-[12px] font-semibold flex items-center justify-center tabular-nums">
          {count}
        </span>
        <span className="text-[13.5px] font-medium text-[#16274D] whitespace-nowrap">
          {count === 1 ? noun[0] : noun[1]} selected
        </span>
      </div>
      <button
        onClick={() => {
          setOpen(false);
          onDeselect();
        }}
        className="text-[13px] text-[#4EBEE3] hover:text-[#3DA5CA] underline underline-offset-2 font-medium cursor-pointer whitespace-nowrap"
      >
        Deselect All
      </button>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 px-4 h-[36px] bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors text-[13px] font-medium shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Settings size={16} strokeWidth={2} />
          Quick Actions
          <ChevronDown size={16} strokeWidth={2} className={cx('transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden">
              {actions.map((a, i) => (
                <div key={a.label}>
                  {a.separated && <div className="border-t-2 border-gray-200 my-1" />}
                  <button
                    onClick={() => {
                      setOpen(false);
                      a.onClick();
                    }}
                    className={cx(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer',
                      i > 0 && !a.separated && 'border-t border-gray-100',
                    )}
                  >
                    <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center', TONE[a.tone])}>{a.icon}</span>
                    <span className="text-[13px] font-medium text-[#16274D]">{a.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
