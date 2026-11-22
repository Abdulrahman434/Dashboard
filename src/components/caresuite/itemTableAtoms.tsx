/**
 * Cells for the CareSuite item tables (Items Manager, Manage Items), styled
 * to the approved Library table design: large image tile, outlined pills,
 * full-size switch.
 */
import { Package } from 'lucide-react';
import type { RequestType } from '../../services/careSuiteService';
import { cx } from './careSuiteAtoms';

/** Display name for a request type. The stored value stays "Service Request" / "Issue". */
export function typeLabel(type: RequestType): string {
  return type === 'Service Request' ? 'Service' : type;
}

const pill = 'inline-flex items-center px-2.5 py-1 rounded-md border text-[11.5px] font-medium whitespace-nowrap';

/** Item image on a warm tile; falls back to a package icon. */
export function ItemThumb({ src, alt }: { src?: string; alt: string }) {
  return (
    <span className="inline-flex w-[72px] h-[48px] rounded-lg bg-[#F3EEE8] items-center justify-center overflow-hidden text-[#b7ab9c]">
      {src ? <img src={src} alt={alt} className="max-w-full max-h-full object-contain" /> : <Package size={22} />}
    </span>
  );
}

/** Request type — the operational type is unchanged; this is only its look. */
export function TypePill({ type }: { type: RequestType }) {
  return (
    <span
      className={cx(
        pill,
        type === 'Issue'
          ? 'border-[#f3c7c1] bg-[#fdf1ef] text-[#c0392b]'
          : 'border-[#bfe6f4] bg-[#eef9fd] text-[#1d7da3]',
      )}
    >
      {typeLabel(type)}
    </span>
  );
}

export function CategoryPill({ name }: { name?: string }) {
  return (
    <span className={cx(pill, 'border-[#e5e7eb] bg-[#f3f4f6]', name ? 'text-[#374151]' : 'text-[#9099ab]')}>
      {name || 'Uncategorized'}
    </span>
  );
}

export function GroupPill({ group }: { group?: string }) {
  const label = !group || group === 'All' ? 'All Groups' : group;
  return <span className={cx(pill, 'border-[#bfe6f4] bg-[#eef9fd] text-[#1d7da3]')}>{label}</span>;
}

/** Full-size switch (44×24), the dashboard's standard toggle size. */
export function Switch({ on, onChange, disabled, label }: { on: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cx(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        on ? 'bg-[#4EBEE3]' : 'bg-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span
        className={cx('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform', on ? 'translate-x-5' : 'translate-x-0')}
      />
    </button>
  );
}
