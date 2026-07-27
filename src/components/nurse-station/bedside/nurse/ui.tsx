/**
 * Shared clinical design-system primitives for the Nurse Interface tabs.
 * ----------------------------------------------------------------------------
 * One unified visual language: white cards on a light gray-blue page, navy
 * headings, cyan primary actions, restrained status colors (green=good,
 * amber=warning, red=urgent/clinical, gray=neutral), ~12px radius, subtle
 * borders. Poppins throughout. Purely presentational — no business logic,
 * no store access — so every tab stays wired to the real NurseDataStore.
 *
 * All controls expose hover / focus-visible / disabled states, accessible
 * labels, and keyboard support.
 */
import React, { useEffect, useRef } from "react";
import { AlertTriangle, Check, ChevronRight, Info, X, Eye, EyeOff, RefreshCw } from "lucide-react";

export const cx = (...a: any[]) => a.filter(Boolean).join(" ");

/* Tone → color map. Green=success, amber=warning, red=danger/clinical,
   cyan=info/primary, gray=neutral. */
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";
export const TONE: Record<Tone, { fg: string; bg: string; border: string; dot: string }> = {
  success: { fg: "#15803d", bg: "#e7f6ec", border: "#bbe6c9", dot: "#22C55E" },
  warning: { fg: "#b45309", bg: "#fdf3e3", border: "#f6dcb0", dot: "#F59E0B" },
  danger: { fg: "#b42318", bg: "#fdeceb", border: "#f6c9c4", dot: "#EF4444" },
  info: { fg: "#1d7da3", bg: "#eaf7fc", border: "#bfe6f3", dot: "#4EBEE3" },
  neutral: { fg: "#475467", bg: "#f2f4f7", border: "#e4e7ec", dot: "#98a2b3" },
};

/* ── Buttons ─────────────────────────────────────────────────────────── */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-[#4EBEE3] text-white border border-[#4EBEE3] hover:bg-[#3DA5CA] focus-visible:ring-[#4EBEE3]",
  secondary: "bg-white text-[#16274D] border border-[#d5deea] hover:bg-[#f4f8fc] focus-visible:ring-[#4EBEE3]",
  ghost: "bg-transparent text-[#16274D] border border-transparent hover:bg-[#eef2f7] focus-visible:ring-[#4EBEE3]",
  danger: "bg-white text-[#b42318] border border-[#f6c9c4] hover:bg-[#fdeceb] focus-visible:ring-[#EF4444]",
};
export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...p
}: any) {
  return (
    <button
      {...p}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins',sans-serif]",
        size === "sm" ? "h-[34px] px-3 text-[12.5px]" : "h-[40px] px-4 text-[13.5px]",
        BTN[variant as BtnVariant],
        className,
      )}
    >
      {loading ? <RefreshCw size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({ label, icon, className, ...p }: any) {
  return (
    <button
      {...p}
      aria-label={label}
      title={label}
      className={cx(
        "w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#5d6678] border border-transparent hover:bg-[#eef2f7] cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {icon}
    </button>
  );
}

/* ── StatusBadge ─────────────────────────────────────────────────────── */
export function StatusBadge({ tone = "neutral", icon, dot, children, className }: any) {
  const c = TONE[tone as Tone] || TONE.neutral;
  return (
    <span
      className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] font-semibold whitespace-nowrap", className)}
      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />}
      {icon}
      {children}
    </span>
  );
}

/* ── PageHeader ──────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, badges, actions }: any) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold text-[#16274D] leading-tight font-['Poppins',sans-serif]">{title}</h2>
        {subtitle && <p className="text-[13.5px] text-[#6B7280] mt-1 max-w-[640px]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        {badges}
        {actions}
      </div>
    </div>
  );
}

/* ── SectionCard ─────────────────────────────────────────────────────── */
export function SectionCard({ title, subtitle, icon, actions, tone, children, className, bodyClassName, padded = true }: any) {
  const accent = tone ? TONE[tone as Tone] : null;
  return (
    <section
      className={cx("rounded-[12px] border bg-white overflow-hidden", className)}
      style={{ borderColor: accent ? accent.border : "#E5E7EB", background: accent ? accent.bg : "#fff" }}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: accent ? accent.border : "#eef1f6" }}>
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span style={{ color: accent ? accent.fg : "#4EBEE3" }}>{icon}</span>}
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[#16274D] truncate font-['Poppins',sans-serif]">{title}</h3>
              {subtitle && <p className="text-[12px] text-[#6B7280] truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cx(padded && "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ── MetricSummary ───────────────────────────────────────────────────── */
export function MetricTile({ label, value, sub, tone, icon }: any) {
  const c = tone ? TONE[tone as Tone] : null;
  return (
    <div className="rounded-[10px] border border-[#eef1f6] bg-[#fafbfc] px-3.5 py-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280] font-medium">
        {icon && <span style={{ color: c ? c.dot : "#98a2b3" }}>{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 text-[20px] font-bold leading-none" style={{ color: c ? c.fg : "#16274D" }}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-[#98a2b3]">{sub}</div>}
    </div>
  );
}
export function MetricSummary({ items, cols = 4, className }: any) {
  return (
    <div
      className={cx("grid gap-3", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((it: any, i: number) => <MetricTile key={i} {...it} />)}
    </div>
  );
}

/* ── Definition field (read / edit / HIS / derived / missing) ────────── */
export type FieldKind = "editable" | "his" | "derived";
export function DefinitionField({
  label,
  value,
  kind = "editable",
  editing,
  onChange,
  type = "text",
  options,
  rtl,
  placeholder,
  canEdit = true,
  span,
  emptyText = "Not provided",
  showKind = true,
}: any) {
  const missing = value == null || value === "";
  const locked = kind === "his" || kind === "derived" || !canEdit;
  const kindLabel = showKind ? (kind === "his" ? "HIS" : kind === "derived" ? "Auto" : null) : null;

  return (
    <div className="min-w-0" style={span ? { gridColumn: `span ${span} / span ${span}` } : undefined}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[11.5px] font-semibold text-[#6B7280]">{label}</span>
        {kindLabel && (
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded"
            style={{ color: "#475467", background: "#f2f4f7", border: "1px solid #e4e7ec" }}
          >
            {kindLabel}
          </span>
        )}
      </div>
      {editing && !locked ? (
        type === "textarea" ? (
          <textarea
            value={value ?? ""}
            dir={rtl ? "rtl" : undefined}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 resize-none"
          />
        ) : type === "select" ? (
          <select
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] bg-white outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
          >
            {(options || []).map((o: any) => (
              <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
                {typeof o === "string" ? o : o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value ?? ""}
            dir={rtl ? "rtl" : undefined}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
          />
        )
      ) : (
        <div
          className={cx("text-[14px] font-semibold", missing ? "text-[#9aa4b2] italic font-normal" : "text-[#16274D]")}
          dir={rtl && !missing ? "rtl" : undefined}
        >
          {missing ? emptyText : value}
        </div>
      )}
    </div>
  );
}

/* ── Toggle switch (role=switch, keyboard-operable) ──────────────────── */
export function Toggle({ checked, onChange, disabled, label, size = "md" }: any) {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 20 : 24;
  const knob = size === "sm" ? 14 : 18;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cx(
        "relative shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] focus-visible:ring-offset-1",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      )}
      style={{ width: w, height: h, background: checked ? "#4EBEE3" : "#cbd5e1" }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-all"
        style={{ width: knob, height: knob, left: checked ? w - knob - 3 : 3 }}
      />
    </button>
  );
}

/* ── VisibilityControl (master "show on patient terminal") ───────────── */
export function VisibilityControl({ checked, onChange, disabled, title = "Show on Patient Terminal", description, scope, languages }: any) {
  return (
    <div className="rounded-[12px] border border-[#bfe6f3] bg-[#f5fcff] p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="mt-0.5 text-[#1d7da3]">{checked ? <Eye size={18} /> : <EyeOff size={18} />}</span>
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-[#16274D]">{title}</div>
          {description && <div className="text-[12.5px] text-[#5d6678] mt-0.5">{description}</div>}
          {(scope || languages) && (
            <div className="text-[11.5px] text-[#6B7280] mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
              {scope && <span>Scope: <b className="text-[#16274D] font-semibold">{scope}</b></span>}
              {languages && <span>Languages: <b className="text-[#16274D] font-semibold">{languages}</b></span>}
            </div>
          )}
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

/* ── SyncStatus rows ─────────────────────────────────────────────────── */
export function SyncStatus({ rows, lastSync, className }: any) {
  return (
    <div className={cx("space-y-2", className)}>
      {rows.map((r: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 text-[12.5px]">
          <div className="min-w-0">
            <span className="font-semibold text-[#16274D]">{r.label}</span>
            {r.source && <span className="text-[#6B7280]"> · {r.source}</span>}
          </div>
          <StatusBadge tone={r.tone || "success"} dot>{r.status || "Synced"}</StatusBadge>
        </div>
      ))}
      {lastSync && <div className="text-[11px] text-[#98a2b3] pt-1">Last synchronized {lastSync}</div>}
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action, className }: any) {
  return (
    <div className={cx("flex flex-col items-center justify-center text-center py-10 px-5", className)}>
      <div className="w-12 h-12 rounded-full bg-[#f2f4f7] text-[#98a2b3] flex items-center justify-center mb-3">
        {icon || <Info size={22} />}
      </div>
      <div className="text-[15px] font-semibold text-[#16274D]">{title}</div>
      {description && <div className="text-[13px] text-[#6B7280] mt-1 max-w-[360px]">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── LoadingSkeleton ─────────────────────────────────────────────────── */
export function LoadingSkeleton({ lines = 3, className }: any) {
  return (
    <div className={cx("animate-pulse space-y-2.5", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3.5 rounded bg-[#eef1f6]" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

/* ── ErrorState ──────────────────────────────────────────────────────── */
export function ErrorState({ title = "Something went wrong", description, onRetry, className }: any) {
  return (
    <div className={cx("flex flex-col items-center justify-center text-center py-10 px-5", className)} role="alert">
      <div className="w-12 h-12 rounded-full bg-[#fdeceb] text-[#b42318] flex items-center justify-center mb-3">
        <AlertTriangle size={22} />
      </div>
      <div className="text-[15px] font-semibold text-[#16274D]">{title}</div>
      {description && <div className="text-[13px] text-[#6B7280] mt-1 max-w-[360px]">{description}</div>}
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry} icon={<RefreshCw size={15} />}>Retry</Button>}
    </div>
  );
}

/* ── Segmented control ───────────────────────────────────────────────── */
export function Segmented({ options, value, onChange, className }: any) {
  return (
    <div className={cx("inline-flex rounded-lg border border-[#d8e1ec] bg-white p-0.5", className)} role="tablist">
      {options.map((o: any) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const on = value === v;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(v)}
            className={cx(
              "px-4 h-[32px] rounded-md text-[12.5px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3]",
              on ? "bg-[#4EBEE3] text-white" : "text-[#5d6678] hover:text-[#16274D]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── ConfirmDialog (with optional required reason) ───────────────────── */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "danger", requireReason, onConfirm, onCancel }: any) {
  const [reason, setReason] = React.useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  if (!open) return null;
  const c = TONE[tone as Tone] || TONE.danger;
  return (
    <Overlay onClose={onCancel} labelledBy="confirm-title">
      <div className="w-full max-w-[420px] bg-white rounded-[14px] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: c.bg, color: c.fg }}>
              <AlertTriangle size={20} />
            </span>
            <div className="min-w-0">
              <h3 id="confirm-title" className="text-[16px] font-bold text-[#16274D]">{title}</h3>
              {message && <p className="text-[13px] text-[#5d6678] mt-1">{message}</p>}
            </div>
          </div>
          {requireReason && (
            <div className="mt-4">
              <label className="text-[12px] font-semibold text-[#6B7280]">Reason <span className="text-[#b42318]">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                autoFocus
                placeholder="Enter a reason…"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#d6dae6] text-[13px] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 resize-none"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-[#f7f8fb] border-t border-[#eef1f6]">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={requireReason && !reason.trim()}
            onClick={() => onConfirm?.(reason.trim())}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

/* ── Overlay (shared modal backdrop; esc to close, click-out to close) ─ */
export function Overlay({ children, onClose, labelledBy }: any) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#16274D]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

/* ── Drawer (right-side; for Add Observation etc.) ───────────────────── */
export function Drawer({ open, title, subtitle, onClose, children, footer, width = 460 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-[#16274D]/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className="h-full bg-white shadow-2xl flex flex-col outline-none animate-[slideIn_.2s_ease]"
        style={{ width, maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#eef1f6] shrink-0">
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-[#16274D]">{title}</h3>
            {subtitle && <p className="text-[12.5px] text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          <IconButton label="Close" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-[#eef1f6] bg-[#f7f8fb] shrink-0 flex items-center justify-end gap-2">{footer}</div>}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

/* ── Small helpers ───────────────────────────────────────────────────── */
export function Avatar({ initials, tone = "info", size = 40 }: any) {
  const c = TONE[tone as Tone] || TONE.info;
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function FieldGroup({ title, icon, children, cols = 3 }: any) {
  return (
    <div className="mb-1">
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-[#4EBEE3]">{icon}</span>}
          <h4 className="text-[14px] font-bold text-[#16274D] font-['Poppins',sans-serif]">{title}</h4>
        </div>
      )}
      <div className="grid gap-x-6 gap-y-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {children}
      </div>
    </div>
  );
}

export function Chevron() {
  return <ChevronRight size={16} className="text-[#9aa4b2]" />;
}

export function CheckIcon() {
  return <Check size={14} strokeWidth={3} />;
}
