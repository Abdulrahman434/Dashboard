import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CareSuiteIcon, ICON_NAMES, iconLabel } from './careSuiteIcons';
import { ToneIconTile } from './categoryTone';
import { cx } from './careSuiteAtoms';

/** Pick an icon by name from the CareSuite set; shown in the category colour. */
export default function IconPicker({ value, onChange, color, id }: { value?: string; onChange: (name: string) => void; color: string; id?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const names = ICON_NAMES.filter((n) => n.includes(q.trim().toLowerCase().replace(/\s+/g, '-')));

  return (
    <div>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 h-[46px] px-2 border border-[#d6dae6] rounded-[10px] hover:border-[#4EBEE3] transition-colors cursor-pointer text-left"
      >
        <ToneIconTile color={color} size={32}>
          <CareSuiteIcon name={value} size={17} />
        </ToneIconTile>
        <span className={cx('flex-1 text-[13.5px]', value ? 'text-[#19233a]' : 'text-gray-400')}>{value ? iconLabel(value) : 'Choose an icon'}</span>
        <ChevronDown size={16} className={cx('text-gray-500 mr-1 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-2 border border-[#e7e9f0] rounded-[10px] p-2.5 bg-white">
          <div className="relative mb-2">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search icons"
              className="w-full h-[34px] pl-8 pr-2 border border-[#e7e9f0] rounded-lg text-[13px] outline-none focus:border-[#4EBEE3]"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-[184px] overflow-y-auto">
            {names.map((n) => (
              <button
                key={n}
                type="button"
                title={iconLabel(n)}
                aria-label={iconLabel(n)}
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                  setQ('');
                }}
                className={cx(
                  'h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer',
                  n === value ? 'ring-2 ring-[#4EBEE3] bg-[#eaf7fc]' : 'hover:bg-[#f3f4f6] text-[#16274D]',
                )}
                style={n === value ? { color } : undefined}
              >
                <CareSuiteIcon name={n} size={19} />
              </button>
            ))}
            {names.length === 0 && <div className="col-span-8 text-center text-[13px] text-gray-400 py-4">No icons match</div>}
          </div>
        </div>
      )}
    </div>
  );
}
