/**
 * careSuiteAtoms — CareSuite-specific UI bits, built on the same generic
 * CareInn atoms already used by Food Management (imported directly, not
 * duplicated, so both modules stay pixel-identical in look and feel).
 */

export { cx, Btn, Toggle, Chip, Badge, Tag, Note, Metric, Card, CardHead, Bar, rowCls } from '../food/foodAtoms';

import { cx } from '../food/foodAtoms';
import type { Priority, RequestType } from '../../services/careSuiteService';

// ---- page shell -------------------------------------------------------------

export function CareSuitePage({ children }: any) {
  return (
    <div className="p-6 font-['Poppins',sans-serif]">
      <div className="mx-auto w-full max-w-full">{children}</div>
    </div>
  );
}

// ---- table column header ----------------------------------------------------
// A header band aligned to the flex-based list rows below it. Each `cols` entry
// carries the SAME width/flex class as its matching row cell so labels line up.
export function ListHeader({ cols, className }: any) {
  return (
    <div className={cx('flex items-center gap-3 px-5 py-2.5 bg-[#f7f8fb] border-t border-[#e7e9f0]', className)}>
      {cols.map((c: any, i: number) => (
        <span
          key={i}
          className={cx('text-[11px] font-semibold uppercase tracking-[0.4px] text-[#9099ab]', c.align === 'right' && 'text-right', c.className)}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

// ---- domain pills -------------------------------------------------------------

const PRIORITY_TONE: Record<Priority, string> = {
  High: 'bg-[#fcebe9] text-[#c0392b]',
  Medium: 'bg-[#fbf1de] text-[#b9770b]',
  Low: 'bg-[#e7f6f0] text-[#1f9e75]',
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span className={cx('inline-flex items-center text-[12px] font-semibold px-2.5 py-[3px] rounded-[20px]', PRIORITY_TONE[priority] || 'bg-[#eef1f7] text-[#5d6678]')}>
      {priority}
    </span>
  );
}

const TYPE_TONE: Record<RequestType, string> = {
  'Service Request': 'bg-[#eaf7fc] text-[#1d7da3]',
  Issue: 'bg-[#fcebe9] text-[#c0392b]',
};

export function TypeBadge({ type }: { type: RequestType }) {
  return (
    <span className={cx('inline-flex items-center text-[12px] font-medium px-2.5 py-[3px] rounded-[7px]', TYPE_TONE[type] || 'bg-[#eef1f7] text-[#5d6678]')}>
      {type}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center text-[12px] font-medium px-2.5 py-[3px] rounded-[7px] bg-[#eef1f7] text-[#16274D]">
      {status}
    </span>
  );
}

// ---- live "time in current status" ------------------------------------------

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Counts up from the request's last status change. Colors escalate: neutral
 * while within the allowed period, amber once past it, red once past the
 * escalation threshold. `allowedMinutes`/`escalationMinutes` may be null
 * (no ceiling for that status, e.g. a terminal "Delivered" state).
 */
export function ElapsedBadge({ since, allowedMinutes, escalationMinutes }: { since: number; allowedMinutes: number | null; escalationMinutes: number | null }) {
  const ms = Date.now() - since;
  const mins = ms / 60000;
  const overEscalation = escalationMinutes != null && mins >= escalationMinutes;
  const overAllowed = !overEscalation && allowedMinutes != null && mins >= allowedMinutes;
  const tone = overEscalation ? 'bg-[#fcebe9] text-[#c0392b]' : overAllowed ? 'bg-[#fbf1de] text-[#b9770b]' : 'bg-[#eef1f7] text-[#5d6678]';
  return (
    <span className={cx('inline-flex items-center gap-1 text-[12px] font-mono font-medium px-2.5 py-[3px] rounded-[7px] whitespace-nowrap', tone)} title={overEscalation ? 'Past escalation threshold' : overAllowed ? 'Past allowed period' : 'Within allowed period'}>
      {formatElapsed(ms)}
    </span>
  );
}
