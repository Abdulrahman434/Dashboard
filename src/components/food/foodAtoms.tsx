import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from '../UnifiedDropdown';
import { DAYS, resetFood } from './foodStore';

/**
 * foodAtoms — shared UI building blocks for the Food Management feature,
 * styled in the CareInn design language: Poppins, brand cyan #4EBEE3 for
 * primary/active, navy #16274D as the accent/strong tone, lucide icons.
 */

export const cx = (...a: any[]) => a.filter(Boolean).join(' ');

// ---- buttons ---------------------------------------------------------------

const BTN: Record<string, string> = {
  neutral: 'border border-[#d6dae6] bg-white text-[#19233a] hover:bg-[#f7f8fb]',
  primary: 'border border-[#4EBEE3] bg-[#4EBEE3] text-white hover:bg-[#3da5ca]',
  accent: 'border border-[#16274D] bg-[#16274D] text-white hover:bg-[#1c3163]',
};

export function Btn({ variant = 'neutral', lg, className, children, ...p }: any) {
  return (
    <button
      {...p}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium cursor-pointer transition-colors font-['Poppins',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed",
        lg ? 'h-[46px] px-[22px] text-[15px]' : 'h-[38px] px-[15px] text-[13.5px]',
        BTN[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---- toggle (switch) -------------------------------------------------------

export function Toggle({ on, onClick, disabled }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      role="switch"
      aria-checked={!!on}
      className={cx(
        'relative w-[34px] h-5 rounded-full flex-shrink-0 border-0 p-0 transition-colors',
        on ? 'bg-[#4EBEE3]' : 'bg-[#d6dae6]',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span className={cx('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', on ? 'left-4' : 'left-0.5')} />
    </button>
  );
}

// ---- chips -----------------------------------------------------------------

export function Chip({ on, onClick, children, square, checkbox, disabled, className }: any) {
  const onCls = 'border-[#4EBEE3] bg-[#eaf7fc] text-[#1d7da3] font-semibold';
  const offCls = 'border-[#d6dae6] bg-white text-[#19233a] hover:bg-[#f7f8fb]';
  if (square) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cx(
          'flex items-center gap-2 justify-center text-[13px] px-[13px] py-2 rounded-[9px] border select-none transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          on ? onCls : offCls,
          className,
        )}
      >
        {checkbox && (
          <span
            className={cx(
              'w-4 h-4 rounded-[5px] border flex items-center justify-center flex-shrink-0',
              on ? 'bg-[#4EBEE3] border-[#4EBEE3] text-[#16274D]' : 'border-[#d6dae6] text-transparent',
            )}
          >
            <Check size={12} strokeWidth={3} />
          </span>
        )}
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'text-[13px] px-[13px] py-2 rounded-[20px] border select-none transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        on ? onCls : offCls,
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---- badges / tags ---------------------------------------------------------

const TONE: Record<string, string> = {
  ok: 'bg-[#e7f6f0] text-[#1f9e75]',
  warn: 'bg-[#fbf1de] text-[#b9770b]',
  info: 'bg-[#eaf7fc] text-[#1d7da3]',
  mute: 'bg-[#eef1f7] text-[#5d6678]',
  danger: 'bg-[#fcebe9] text-[#c0392b]',
};

export function Badge({ tone = 'mute', className, children }: any) {
  return <span className={cx('inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-[3px] rounded-[7px] whitespace-nowrap', TONE[tone], className)}>{children}</span>;
}

const STATUS_TONE: Record<string, string> = {
  Published: 'ok', Live: 'ok', Delivered: 'ok', Draft: 'mute', Scheduled: 'info', Submitted: 'info', Printed: 'warn',
};

export function StatusBadge({ status }: any) {
  return <Badge tone={STATUS_TONE[status] || 'mute'}>{status}</Badge>;
}

export function Tag({ children, className }: any) {
  return <span className={cx('inline-flex items-center gap-1.5 text-[12px] px-[9px] py-[3px] rounded-[7px] bg-[#f7f8fb] text-[#5d6678] border border-[#e7e9f0] whitespace-nowrap', className)}>{children}</span>;
}

// ---- note (callout) --------------------------------------------------------

const NOTE: Record<string, string> = {
  info: 'bg-[#eaf7fc] text-[#1d7da3]',
  warn: 'bg-[#fbf1de] text-[#b9770b]',
  ok: 'bg-[#e7f6f0] text-[#1f9e75]',
};

export function Note({ tone = 'info', icon, children, className }: any) {
  return (
    <div className={cx('flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] text-[13px]', NOTE[tone], className)}>
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

// ---- misc ------------------------------------------------------------------

export function Metric({ label, value }: any) {
  return (
    <div className="bg-[#f7f8fb] rounded-[10px] px-[15px] py-[13px]">
      <div className="text-[12.5px] text-[#5d6678]">{label}</div>
      <div className="text-[23px] font-semibold text-[#16274D] mt-0.5 font-['Poppins',sans-serif]">{value}</div>
    </div>
  );
}

export function Stepper({ value, onDec, onInc }: any) {
  const b = 'w-[26px] h-[26px] rounded-[7px] border border-[#d6dae6] bg-white hover:bg-[#f7f8fb] text-[#19233a] text-[15px] leading-none cursor-pointer';
  return (
    <span className="inline-flex items-center gap-1.5">
      <button type="button" onClick={onDec} className={b}>−</button>
      <span className="min-w-4 text-center font-semibold">{value}</span>
      <button type="button" onClick={onInc} className={b}>+</button>
    </span>
  );
}

export function MiniSeg({ options, value, onChange }: any) {
  return (
    <div className="inline-flex flex-wrap rounded-[8px] border border-[#d6dae6] overflow-hidden">
      {options.map((o: any) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cx('px-3 py-[7px] text-[13px] border-0 cursor-pointer transition-colors', value === v ? 'bg-[#16274D] text-white' : 'bg-white text-[#5d6678] hover:bg-[#f7f8fb]')}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ---- card + header ---------------------------------------------------------

export function Card({ className, children, style }: any) {
  return (
    <div
      className={cx('rounded-[14px] border border-[#e7e9f0] bg-white shadow-[0_1px_2px_rgba(22,39,77,.05),0_1px_3px_rgba(22,39,77,.04)] overflow-hidden', className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHead({ eyebrow, back, title, sub, right }: any) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-[18px] border-b border-[#e7e9f0]">
      <div className="min-w-0">
        {back && (
          <button onClick={back.onClick} className="inline-flex items-center gap-1.5 text-[13px] text-[#5d6678] hover:text-[#16274D] mb-[9px] cursor-pointer">
            <ArrowLeft size={16} />
            {back.label}
          </button>
        )}
        {eyebrow && <div className="text-[12px] text-[#9099ab]">{eyebrow}</div>}
        <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D] flex items-center gap-2.5 mt-0.5">{title}</div>
        {sub && <div className="text-[13px] text-[#5d6678] mt-0.5">{sub}</div>}
      </div>
      {right && <div className="flex gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

export function Bar({ children, className }: any) {
  return <div className={cx('flex items-center justify-between gap-2.5 px-5 py-3.5 border-t border-[#e7e9f0] bg-[#f7f8fb]', className)}>{children}</div>;
}

// Standard interactive list row.
export const rowCls = 'flex items-center gap-3 px-5 py-[13px] border-t border-[#e7e9f0]';

// ---- process tracker -------------------------------------------------------

const STEPS: [string, string, string, string][] = [
  ['lib', '1', 'Set up library', 'food-library'],
  ['set', '2', 'Build menu set', 'food-sets'],
  ['kiosk', '3', 'Patient orders', 'food-kiosk'],
  ['kit', '4', 'Kitchen serves', 'food-kitchen'],
];

export function ProcessTracker({ current, onNavigate }: any) {
  return (
    <div className="flex items-center gap-2 mb-[22px]">
      <div className="flex gap-2 flex-1 min-w-0">
        {STEPS.map((s) => {
          const on = current === s[0];
          return (
            <button
              key={s[0]}
              onClick={() => onNavigate(s[3])}
              className={cx(
                'flex-1 flex items-center gap-2.5 px-3 py-[11px] rounded-[10px] border cursor-pointer min-w-0 text-left transition-colors',
                on ? 'border-[#16274D] bg-[#16274D]' : 'border-[#e7e9f0] bg-white hover:bg-[#f7f8fb]',
              )}
            >
              <span className={cx('w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[12.5px] flex-shrink-0', on ? 'bg-[#4EBEE3] text-[#16274D]' : 'bg-[#eef1f7] text-[#16274D]')}>{s[1]}</span>
              <span className={cx('text-[12.5px] font-medium truncate', on ? 'text-white' : 'text-[#5d6678]')}>{s[2]}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => {
          resetFood();
          toast('Demo data reset');
        }}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#5d6678] hover:text-[#16274D] px-2.5 py-2 cursor-pointer whitespace-nowrap"
      >
        <RefreshCw size={14} />
        Reset demo
      </button>
    </div>
  );
}

// ---- context bar (diet / meal / day selector) ------------------------------

export function ContextBar({ withDay, ctx, onCtx, db }: any) {
  return (
    <div className="flex flex-wrap gap-3 items-center px-5 py-3 bg-[#f7f8fb] border-t border-[#e7e9f0]">
      <span className="text-[13px] text-[#5d6678]">Editing menu for</span>
      <div className="w-[160px]">
        <SingleSelectDropdown options={db.diets.map((x: any) => x.en)} value={ctx.diet} onChange={(v: string) => onCtx('diet', v)} className="text-[12px]" />
      </div>
      <MiniSeg options={db.meals} value={ctx.meal} onChange={(v: string) => onCtx('meal', v)} />
      {withDay && <MiniSeg options={[...DAYS]} value={ctx.day} onChange={(v: string) => onCtx('day', v)} />}
    </div>
  );
}

// Page shell: centered content with process tracker on top.
export function FoodPage({ current, onNavigate, narrow, children }: any) {
  return (
    <div className="p-6 font-['Poppins',sans-serif]">
      <div className={cx('mx-auto w-full', narrow ? 'max-w-[760px]' : 'max-w-[1040px]')}>
        <ProcessTracker current={current} onNavigate={onNavigate} />
        {children}
      </div>
    </div>
  );
}
