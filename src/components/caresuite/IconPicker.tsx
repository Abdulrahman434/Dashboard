import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CARESUITE_ICONS, ICON_NAMES, ItemIcon, iconLabel, readIconSvg, useAllIcons } from './careSuiteIcons';
import { ToneIconTile } from './categoryTone';
import { cx } from './careSuiteAtoms';

const MAX_RESULTS = 240;

/**
 * Icon chooser in its own small dialog above the form: the suggested set first,
 * search across the whole lucide library (~1,500 icons, loaded on first open),
 * and an "Upload SVG" fallback for anything missing.
 */
export function IconPickerDialog({
  open,
  value,
  color,
  onChange,
  onUpload,
  onClose,
}: {
  open: boolean;
  value?: string;
  color: string;
  onChange: (name: string) => void;
  /** single-colour SVG as a data URL; omit to hide the upload button */
  onUpload?: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const fileRef = useRef<HTMLInputElement>(null);
  const all = useAllIcons(open);

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
  const searching = needle.length > 0;
  const pool = searching && all ? Object.keys(all) : ICON_NAMES;
  // suggested matches first, then the rest of the library
  const matches = searching
    ? [...pool.filter((n) => CARESUITE_ICONS[n] && n.includes(needle)), ...pool.filter((n) => !CARESUITE_ICONS[n] && n.includes(needle))]
    : pool;
  const shown = matches.slice(0, MAX_RESULTS);

  const upload = async (file: File) => {
    const r = await readIconSvg(file);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    onUpload?.(r.dataUrl);
    toast.success('Icon uploaded');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-[#16274D]/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose an icon"
        className="w-full max-w-[560px] max-h-[min(600px,85vh)] flex flex-col bg-white rounded-2xl shadow-2xl font-['Poppins',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="font-semibold text-[16px] text-[#16274D]">Choose an icon</div>
          <div className="flex items-center gap-1">
            {onUpload && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) upload(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium text-[#1d7da3] hover:bg-[#eaf7fc] cursor-pointer"
                  title="Upload a single-colour SVG (20 KB max) when the library has nothing suitable"
                >
                  <Upload size={14} /> Upload SVG
                </button>
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-[#f3f4f6] cursor-pointer" title="Close">
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="px-5 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search all icons, e.g. bed, light, water"
              className="w-full h-[40px] pl-9 pr-3 border border-[#d6dae6] rounded-[10px] text-[13.5px] outline-none focus:border-[#4EBEE3]"
              autoFocus
            />
          </div>
          <div className="text-[11.5px] text-[#9099ab] mt-1.5 h-4">
            {searching
              ? all
                ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}${matches.length > MAX_RESULTS ? ` — showing the first ${MAX_RESULTS}` : ''}`
                : 'Loading the full icon library…'
              : `Suggested for patient services · search to see all ${all ? Object.keys(all).length.toLocaleString() : '1,500+'} icons`}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
          {searching && !all ? (
            <div className="flex justify-center py-10 text-[#9099ab]">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
              {shown.map((n) => (
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
                  <ItemIcon name={n} size={20} />
                  <span className="text-[10px] leading-tight text-[#5d6678] truncate max-w-[60px]">{iconLabel(n)}</span>
                </button>
              ))}
            </div>
          )}
          {searching && all && matches.length === 0 && (
            <div className="text-center text-[13px] text-gray-400 py-8">
              No icons match “{q}”.{onUpload ? ' You can upload an SVG instead.' : ''}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Field-style trigger (category form): current icon in the category colour + name. */
export default function IconPicker({
  value,
  iconSvg,
  onChange,
  onUpload,
  color,
  id,
}: {
  value?: string;
  iconSvg?: string;
  onChange: (name: string) => void;
  onUpload?: (dataUrl: string) => void;
  color: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const label = iconSvg ? 'Uploaded icon' : value ? iconLabel(value) : '';
  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 h-[46px] px-2 border border-[#d6dae6] rounded-[10px] hover:border-[#4EBEE3] transition-colors cursor-pointer text-left"
      >
        <ToneIconTile color={color} size={32}>
          <ItemIcon name={value} svg={iconSvg} size={17} />
        </ToneIconTile>
        <span className={cx('flex-1 text-[13.5px]', label ? 'text-[#19233a]' : 'text-gray-400')}>{label || 'Choose an icon'}</span>
        <ChevronDown size={16} className="text-gray-500 mr-1" />
      </button>
      <IconPickerDialog open={open} value={iconSvg ? undefined : value} color={color} onChange={onChange} onUpload={onUpload} onClose={() => setOpen(false)} />
    </>
  );
}
