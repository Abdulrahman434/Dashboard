import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { CareSuiteIcon, ICON_NAMES, iconLabel } from './careSuiteIcons';
import { ToneIconTile } from './categoryTone';
import { cx } from './careSuiteAtoms';

/**
 * Icon chooser in its own small dialog above the form, so the form never grows
 * and the grid scrolls inside a fixed-height panel on any screen size.
 */
export function IconPickerDialog({
  open,
  value,
  color,
  onChange,
  onClose,
}: {
  open: boolean;
  value?: string;
  color: string;
  onChange: (name: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // fresh search each time it opens; Escape closes
  useEffect(() => {
    if (!open) return;
    setQ('');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  if (!open) return null;

  const needle = q.trim().toLowerCase().replace(/\s+/g, '-');
  const names = ICON_NAMES.filter((n) => n.includes(needle));

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-[#16274D]/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose an icon"
        className="w-full max-w-[520px] max-h-[min(560px,85vh)] flex flex-col bg-white rounded-2xl shadow-2xl font-['Poppins',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="font-semibold text-[16px] text-[#16274D]">Choose an icon</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-[#f3f4f6] cursor-pointer" title="Close">
            <X size={17} />
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search icons, e.g. bed, light, water"
              className="w-full h-[40px] pl-9 pr-3 border border-[#d6dae6] rounded-[10px] text-[13.5px] outline-none focus:border-[#4EBEE3]"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
            {names.map((n) => (
              <button
                key={n}
                type="button"
                title={iconLabel(n)}
                onClick={() => {
                  onChange(n);
                  onClose();
                }}
                className={cx(
                  'flex flex-col items-center justify-center gap-1 h-[64px] rounded-xl border transition-colors cursor-pointer',
                  n === value ? 'border-[#4EBEE3] bg-[#eaf7fc]' : 'border-transparent hover:bg-[#f3f4f6] text-[#16274D]',
                )}
                style={n === value ? { color } : undefined}
              >
                <CareSuiteIcon name={n} size={20} />
                <span className="text-[10px] leading-tight text-[#5d6678] truncate max-w-[60px]">{iconLabel(n)}</span>
              </button>
            ))}
          </div>
          {names.length === 0 && <div className="text-center text-[13px] text-gray-400 py-8">No icons match “{q}”</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Field-style trigger (category form): current icon in the category colour + name. */
export default function IconPicker({ value, onChange, color, id }: { value?: string; onChange: (name: string) => void; color: string; id?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 h-[46px] px-2 border border-[#d6dae6] rounded-[10px] hover:border-[#4EBEE3] transition-colors cursor-pointer text-left"
      >
        <ToneIconTile color={color} size={32}>
          <CareSuiteIcon name={value} size={17} />
        </ToneIconTile>
        <span className={cx('flex-1 text-[13.5px]', value ? 'text-[#19233a]' : 'text-gray-400')}>{value ? iconLabel(value) : 'Choose an icon'}</span>
        <ChevronDown size={16} className="text-gray-500 mr-1" />
      </button>
      <IconPickerDialog open={open} value={value} color={color} onChange={onChange} onClose={() => setOpen(false)} />
    </>
  );
}
