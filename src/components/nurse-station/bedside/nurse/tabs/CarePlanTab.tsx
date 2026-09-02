import { useState, useEffect } from "react";
import {
  Plus, Clock, Pencil, Trash2, MoreVertical, ChevronLeft, ChevronRight,
  Eye, CheckCircle2, Circle, Check, Loader2, CalendarDays, Info,
  ClipboardList, FlaskConical, Pill, Apple, Footprints, Stethoscope,
  Activity, HeartPulse, Thermometer, StickyNote, Monitor, RefreshCw,
  ShieldCheck, FileText,
} from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions, type CarePlanItem } from "../../NurseDataStore";
import {
  PageHeader, StatusBadge, SectionCard, VisibilityControl, Button, IconButton, Toggle,
  ConfirmDialog, EmptyState, Segmented, cx, TONE,
} from "../ui";

/* ── Date helpers (preserved) ────────────────────────────────────────── */
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function shiftDay(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + delta);
  return next;
}
const toISO = (d: Date) => d.toISOString().split("T")[0];
const fromISO = (s: string) => new Date(s);
const timeShort = (t?: string) => (t ? t.replace(/\s*(AM|PM)$/i, "") : "");

/* ── getAutoStatus — PRESERVED VERBATIM ──────────────────────────────── */
function getAutoStatus(timeStr: string, periodMinutes: number): 'unchecked' | 'in-progress' | 'done' {
  if (!timeStr) return 'unchecked';
  let hours = 0;
  let minutes = 0;
  const ampmMatch = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    const normalMatch = timeStr.match(/^(\d+):(\d+)$/);
    if (normalMatch) {
      hours = parseInt(normalMatch[1], 10);
      minutes = parseInt(normalMatch[2], 10);
    } else {
      return 'unchecked';
    }
  }
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  const end = new Date(scheduled);
  end.setMinutes(scheduled.getMinutes() + (periodMinutes || 30));
  if (now < scheduled) return 'unchecked';
  if (now >= scheduled && now < end) return 'in-progress';
  return 'done';
}

/* ── Source (HIS vs Manual) — explicit field, falls back to id prefix ── */
const sourceOf = (it: CarePlanItem): "HIS" | "Manual" =>
  it.source === "manual" ? "Manual" : it.source === "his" ? "HIS" : it.id?.startsWith("man-") ? "Manual" : "HIS";

/* ── Effective 3-state status ────────────────────────────────────────── */
function statusOf(item?: CarePlanItem | null): 'unchecked' | 'in-progress' | 'done' {
  if (!item) return 'unchecked';
  if (item.autoFlag && item.time) return getAutoStatus(item.time, item.period || 30);
  if (item.status) return item.status;
  if (item.done) return 'done';
  if (item.active) return 'in-progress';
  return 'unchecked';
}

/* ── Minutes-of-day for ordering; blank sorts last ───────────────────── */
function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 24 * 60 + 1;
  const m = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!m) return 24 * 60 + 1;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

const STATUS_META = {
  done: { tone: "success" as const, label: "Completed" },
  "in-progress": { tone: "info" as const, label: "In Progress" },
  unchecked: { tone: "neutral" as const, label: "Pending" },
};

/* ── Type icon heuristic (display-only) ──────────────────────────────── */
function taskIcon(name: string) {
  const n = (name || "").toLowerCase();
  if (/assess/.test(n)) return <ClipboardList size={17} />;
  if (/blood|lab|cbc|test|sample|electrolyt/.test(n)) return <FlaskConical size={17} />;
  if (/medic|med round|drug|dose|infus/.test(n)) return <Pill size={17} />;
  if (/nutrit|diet|meal|food|intake/.test(n)) return <Apple size={17} />;
  if (/mobil|therap|physical|walk|ambulat/.test(n)) return <Footprints size={17} />;
  if (/review|checkup|check-up|doctor|physician|round|consult/.test(n)) return <Stethoscope size={17} />;
  return <ClipboardList size={17} />;
}

// DEV-ONLY MOCK — display-only clinical snapshot, NOT bound to the store.
const MOCK_SNAPSHOT = {
  bp: "120/80",
  hr: "72 bpm",
  temp: "36.8°C",
  lastRecorded: "09:15 AM",
  note: "Resting comfortably; pain score 1/10",
};
// DEV-ONLY MOCK — sync metadata surfaced from the HIS integration layer.
const MOCK_SYNC = { lastSync: "09:45 AM", source: "Hospital HIS" };

export function CarePlanTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const [showAdd, setShowAdd] = useState(false);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const mode = store.carePlanMode;

  // Editor form fields (compact — matches design)
  const [fLabel, setFLabel] = useState("");
  const [fTime, setFTime] = useState("05:00 PM");
  const [fMinutes, setFMinutes] = useState("30");
  const [fAuto, setFAuto] = useState(false);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<CarePlanItem | null>(null);

  // Session-local shift notes (DEV-ONLY — no store/backend field yet)
  const [notes, setNotes] = useState<{ id: string; text: string }[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  // Re-run status simulation every 10 seconds to keep UI live (PRESERVED)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((prev) => prev + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const selectedDate = fromISO(store.carePlanSelectedDate);
  const today = new Date();
  const yesterday = shiftDay(today, -1);
  const tomorrow = shiftDay(today, 1);

  let dateLabel = "";
  if (isSameDay(selectedDate, today)) dateLabel = tr("careplan.today") || "Today";
  else if (isSameDay(selectedDate, yesterday)) dateLabel = tr("careplan.yesterday") || "Yesterday";
  else if (isSameDay(selectedDate, tomorrow)) dateLabel = tr("careplan.tomorrow") || "Tomorrow";
  else dateLabel = selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const fullDate = selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  /* ── Filtered sets ────────────────────────────────────────────────── */
  const dailyItems = store.carePlan
    .filter((item) => item.date === store.carePlanSelectedDate)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const overallItems = store.carePlan.filter((item) => item.day !== undefined);

  // Metrics reflect the active view.
  const metricItems = mode === "overall" ? overallItems : dailyItems;
  const total = metricItems.length;
  const completed = metricItems.filter((i) => statusOf(i) === "done").length;
  const inProgress = metricItems.filter((i) => statusOf(i) === "in-progress").length;
  const pending = total - completed - inProgress;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const manualCount = store.carePlan.filter((i) => sourceOf(i) === "Manual").length;

  /* ── Editor lifecycle ─────────────────────────────────────────────── */
  const resetForm = () => { setFLabel(""); setFTime("05:00 PM"); setFMinutes("30"); setFAuto(false); };
  const openAdd = () => {
    setEditId(null); setMenuOpenId(null); resetForm();
    if (mode === "overall") { setShowAdd(false); setAddDay(1); }
    else { setAddDay(null); setShowAdd(true); }
  };
  const openAddDay = (day: number) => { setEditId(null); setMenuOpenId(null); setShowAdd(false); resetForm(); setAddDay(day); };
  const openEdit = (item: CarePlanItem) => {
    setMenuOpenId(null);
    setShowAdd(false); setAddDay(null);
    setFLabel(item.label || (item.labelKey ? tr(item.labelKey) : ""));
    setFTime(item.time || "05:00 PM");
    setFMinutes(String(item.period || item.minutes || 30));
    setFAuto(!!item.autoFlag);
    setEditId(item.id);
  };
  const closeEditor = () => { setShowAdd(false); setAddDay(null); setEditId(null); resetForm(); };

  const commitAdd = (extra: Partial<CarePlanItem>) => {
    if (!fLabel.trim()) return;
    const mins = Number(fMinutes) || 30;
    nurseActions.addCarePlanItem({
      id: `man-${Date.now().toString(36)}`,
      labelKey: "",
      label: fLabel.trim(),
      desc: "",
      source: "manual",
      done: false,
      time: fTime.trim() || undefined,
      minutes: mins,
      period: mins,
      autoFlag: fAuto,
      ...extra,
    } as CarePlanItem);
    closeEditor();
  };
  const commitEdit = (id: string) => {
    if (!fLabel.trim()) return;
    const mins = Number(fMinutes) || 30;
    nurseActions.updateCarePlanItem(id, {
      label: fLabel.trim(),
      time: fTime.trim() || undefined,
      period: mins,
      minutes: mins,
      autoFlag: fAuto,
    });
    closeEditor();
  };

  /* ── Status advance (direct, per design) ──────────────────────────── */
  const advance = (item: CarePlanItem) => {
    if (!isNurse) return;
    setMenuOpenId(null);
    if (item.autoFlag) nurseActions.updateCarePlanItem(item.id, { autoFlag: false });
    nurseActions.toggleCarePlanItem(item.id);
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    setNotes((n) => [...n, { id: `n-${Date.now().toString(36)}`, text: noteDraft.trim() }]);
    setNoteDraft("");
    setAddingNote(false);
  };

  /* ── Reusable compact editor form ─────────────────────────────────── */
  const editorForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="rounded-[10px] border border-dashed border-[#bfe6f3] bg-[#f7fbfe] p-4">
      <div className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-[#1d7da3]">
        <Plus size={15} /> {submitLabel === "Save" ? "Edit care item" : "Add care item"}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="text-[11.5px] font-semibold text-[#6B7280]">Care item</label>
          <input
            autoFocus
            value={fLabel}
            onChange={(e) => setFLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") closeEditor(); }}
            placeholder="Search care items (e.g. Vital Signs, Pain Assessment)"
            className="mt-1 w-full h-[40px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
          />
        </div>
        <div>
          <label className="text-[11.5px] font-semibold text-[#6B7280] block">Time</label>
          <div className="mt-1 relative">
            <input
              value={fTime}
              onChange={(e) => setFTime(e.target.value)}
              placeholder="05:00 PM"
              className="w-32 h-[40px] pl-3 pr-8 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
            />
            <Clock size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[11.5px] font-semibold text-[#6B7280] block">Duration (min)</label>
          <input
            type="number"
            value={fMinutes}
            onChange={(e) => setFMinutes(e.target.value)}
            placeholder="30"
            className="mt-1 w-24 h-[40px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
          />
        </div>
        <div className="flex flex-col gap-1 pb-1">
          <span className="text-[11.5px] font-semibold text-[#6B7280] inline-flex items-center gap-1">
            Auto trigger <Info size={12} className="text-[#98a2b3]" />
          </span>
          <Toggle size="sm" checked={fAuto} onChange={(v: boolean) => setFAuto(v)} label="Auto-trigger status from schedule" />
        </div>
        <div className="flex items-center gap-2 ml-auto pb-0.5">
          <Button variant="primary" size="sm" icon={<Plus size={15} />} disabled={!fLabel.trim()} onClick={onSubmit}>
            {submitLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={closeEditor}>Cancel</Button>
        </div>
      </div>
    </div>
  );

  /* ── Timeline row ─────────────────────────────────────────────────── */
  const TaskRow = ({ item, isLast }: any) => {
    const s = statusOf(item);
    const meta = STATUS_META[s];
    const c = TONE[meta.tone];
    const src = sourceOf(item);
    const isHIS = src === "HIS";
    const name = item.label || (item.labelKey ? tr(item.labelKey) : "");

    if (editId === item.id) {
      return <div className="py-2">{editorForm(() => commitEdit(item.id), "Save")}</div>;
    }

    return (
      <div className="flex items-center gap-3 sm:gap-4 py-3">
        {/* Time */}
        <div className="w-12 sm:w-14 shrink-0 text-right text-[13px] font-semibold text-[#16274D] tabular-nums">
          {timeShort(item.time) || "—"}
        </div>

        {/* Connector + status dot */}
        <div className="relative shrink-0 self-stretch flex flex-col items-center" style={{ width: 26 }}>
          {!isLast && <span className="absolute top-1/2 bottom-[-14px] w-[2px] bg-[#E8ECF2]" />}
          <span
            className="relative z-10 my-auto w-[22px] h-[22px] rounded-full flex items-center justify-center"
            style={{
              background: s === "unchecked" ? "#fff" : c.dot,
              border: s === "unchecked" ? "2px solid #cbd5e1" : `2px solid ${c.dot}`,
              color: "#fff",
            }}
          >
            {s === "done" && <Check size={13} strokeWidth={3} />}
            {s === "in-progress" && <Loader2 size={13} className="animate-spin" />}
          </span>
        </div>

        {/* Type icon */}
        <div
          className="shrink-0 w-9 h-9 rounded-[9px] flex items-center justify-center"
          style={{ background: "#eef4fb", color: "#3f77a8" }}
        >
          {taskIcon(name)}
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-semibold text-[#16274D] truncate"
            style={s === "done" ? { color: "#5d6b82" } : undefined}
          >
            {name || "—"}
          </div>
          <div className="text-[12.5px] text-[#6B7280] truncate">
            {item.desc || (item.autoFlag ? "Auto-triggered from schedule" : `${item.period || item.minutes || 30} min`)}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="hidden sm:inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-semibold text-[#475467] bg-[#f2f4f7] border border-[#e4e7ec]"
          >
            {src}
          </span>
          <StatusBadge tone={meta.tone} icon={s === "done" ? <CheckCircle2 size={13} /> : undefined} className="text-[11px]">
            {meta.label}
          </StatusBadge>

          {isNurse && s !== "done" && (
            <Button variant="secondary" size="sm" onClick={() => advance(item)}>
              {s === "in-progress" ? "Complete" : "Start"}
            </Button>
          )}

          {isNurse && (
            <div className="relative">
              <IconButton label="More actions" icon={<MoreVertical size={17} />} onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)} />
              {menuOpenId === item.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                  <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-[#e4e7ec] bg-white shadow-lg py-1">
                    {isHIS ? (
                      <div className="px-3 py-2 text-[12px] text-[#98a2b3]">Managed by HIS — read only</div>
                    ) : (
                      <>
                        <button onClick={() => openEdit(item)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#16274D] hover:bg-[#f2f4f7] cursor-pointer">
                          <Pencil size={14} /> Edit task
                        </button>
                        <button onClick={() => { setMenuOpenId(null); setConfirmDelete(item); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#b42318] hover:bg-[#fdeceb] cursor-pointer">
                          <Trash2 size={14} /> Delete task
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Sidebar definition row ───────────────────────────────────────── */
  const InfoRow = ({ label, value }: any) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12.5px] text-[#6B7280]">{label}</span>
      <span className="text-[12.5px] font-semibold text-[#16274D] text-right">{value}</span>
    </div>
  );

  const visibleOn = store.sectionVisibility.carePlan;

  /* ── Overall (full-admission) main card ───────────────────────────── */
  const renderOverallMain = () => {
    const maxDay = overallItems.reduce((mx, it) => Math.max(mx, it.day || 1), 1);
    const days = Array.from({ length: maxDay }, (_, i) => i + 1);
    return (
      <SectionCard padded={false}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eef1f6]">
          <CalendarDays size={16} className="text-[#4EBEE3] shrink-0" />
          <span className="text-[15px] font-bold text-[#16274D]">Care Timeline</span>
          <span className="text-[12px] text-[#98a2b3]">· Full admission plan</span>
        </div>
        <div className="p-4 space-y-5">
          {overallItems.length === 0 && (
            <EmptyState icon={<CalendarDays size={22} />} title="No care activities yet" description="Add the first planned task to build the admission timeline." />
          )}
          {days.map((day) => {
            const dayItems = overallItems
              .filter((it) => (it.day || 1) === day)
              .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            return (
              <div key={day}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-[#16274D] text-white text-[11.5px] font-bold">
                    {tr("careplan.dayLabel") || "Day"} {day}
                  </span>
                  <span className="text-[12px] text-[#98a2b3]">{dayItems.length} task{dayItems.length === 1 ? "" : "s"}</span>
                </div>
                <div className="rounded-[10px] border border-[#eef1f6] px-4">
                  {dayItems.length === 0 ? (
                    <div className="py-3 text-[12.5px] text-[#98a2b3]">No tasks scheduled for this day.</div>
                  ) : (
                    <div className="divide-y divide-[#f2f4f7]">
                      {dayItems.map((item, i) => <TaskRow key={item.id} item={item} isLast={i === dayItems.length - 1} />)}
                    </div>
                  )}
                </div>
                {isNurse && (
                  addDay === day ? (
                    <div className="mt-2">{editorForm(() => commitAdd({ day }), "Add")}</div>
                  ) : (
                    <button onClick={() => openAddDay(day)} className="mt-1.5 inline-flex items-center gap-1.5 py-1.5 text-[12.5px] font-semibold text-[#1d7da3] hover:text-[#16274D] cursor-pointer">
                      <Plus size={14} /> Add item to {tr("careplan.dayLabel") || "Day"} {day}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="space-y-5 font-['Poppins',sans-serif]">
      <PageHeader
        title={tr("care.plan.title") || "My Care Plan"}
        subtitle="Track the patient's planned care activities and completion status."
        badges={
          <>
            <StatusBadge tone={visibleOn ? "info" : "neutral"}>Visible to Patient</StatusBadge>
            <StatusBadge tone="success" dot>HIS Synced</StatusBadge>
          </>
        }
        actions={isNurse && <Button variant="primary" icon={<Plus size={16} />} onClick={openAdd}>Add Care Task</Button>}
      />

      {isNurse && (
        <VisibilityControl
          checked={visibleOn}
          onChange={(v: boolean) => nurseActions.setSectionVisible("carePlan", v)}
          title="Show Section to Patient"
          description='Toggle visibility for "My Care Plan" on the bedside screen'
        />
      )}

      {/* Daily / Overall toggle */}
      <div className="mb-4">
        <Segmented
          options={[
            { value: "daily", label: tr("careplan.toggle.daily") || "Daily" },
            { value: "overall", label: tr("careplan.toggle.overall") || "Overall" },
          ]}
          value={mode}
          onChange={(v: "daily" | "overall") => { closeEditor(); nurseActions.setCarePlanMode(v); }}
        />
      </div>



      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Main: timeline */}
        <div className="xl:col-span-2">
          {mode === "overall" ? renderOverallMain() : (
          <SectionCard padded={false}>
            {/* Date header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#eef1f6] flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarDays size={16} className="text-[#4EBEE3] shrink-0" />
                <span className="text-[15px] font-bold text-[#16274D] truncate">{dateLabel} · {fullDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconButton label="Previous day" icon={<ChevronLeft size={18} />} onClick={() => nurseActions.setCarePlanSelectedDate(toISO(shiftDay(selectedDate, -1)))} />
                <Button variant="secondary" size="sm" onClick={() => nurseActions.setCarePlanSelectedDate(toISO(today))}>Today</Button>
                <IconButton label="Next day" icon={<ChevronRight size={18} />} onClick={() => nurseActions.setCarePlanSelectedDate(toISO(shiftDay(selectedDate, 1)))} />
              </div>
            </div>

            {/* Vitals strip (DEV-ONLY MOCK) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#eef1f6] border-b border-[#eef1f6] bg-[#fafbfc]">
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280]"><HeartPulse size={13} className="text-[#EF4444]" /> Latest vitals</div>
                <div className="mt-1 text-[13px] font-semibold text-[#16274D]">BP {MOCK_SNAPSHOT.bp} · HR {MOCK_SNAPSHOT.hr.replace(" bpm", "")} · Temp {MOCK_SNAPSHOT.temp}</div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280]"><Clock size={13} className="text-[#4EBEE3]" /> Last recorded</div>
                <div className="mt-1 text-[13px] font-semibold text-[#16274D]">{MOCK_SNAPSHOT.lastRecorded}</div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280]"><StickyNote size={13} className="text-[#F59E0B]" /> Nursing note</div>
                <div className="mt-1 text-[13px] font-semibold text-[#16274D] truncate">{MOCK_SNAPSHOT.note}</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-4">
              {dailyItems.length === 0 ? (
                <EmptyState icon={<CalendarDays size={22} />} title="No tasks for this day" description="Nothing is scheduled. Add an activity below." />
              ) : (
                <div className="divide-y divide-[#f2f4f7]">
                  {dailyItems.map((item, i) => <TaskRow key={item.id} item={item} isLast={i === dailyItems.length - 1} />)}
                </div>
              )}
            </div>

            {/* Add item */}
            {isNurse && (
              <div className="px-4 pb-4 pt-1">
                {showAdd ? (
                  editorForm(() => commitAdd({ date: store.carePlanSelectedDate, day: 1 }), "Add")
                ) : (
                  <button onClick={openAdd} className="w-full flex items-center gap-2 py-3 rounded-[10px] border border-dashed border-[#cfe4f0] text-[13px] font-semibold text-[#1d7da3] hover:bg-[#f5fbfe] justify-center cursor-pointer">
                    <Plus size={15} /> Add item for today
                  </button>
                )}
              </div>
            )}
          </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">



          {/* Today's Notes */}
          <SectionCard title="Today's Notes" subtitle="Shift notes and observations for today." icon={<FileText size={16} />}>
            {notes.length === 0 && !addingNote && (
              <div className="text-[13px] text-[#6B7280]">No notes added for today.</div>
            )}
            {notes.length > 0 && (
              <ul className="space-y-2 mb-3">
                {notes.map((n) => (
                  <li key={n.id} className="text-[13px] text-[#16274D] bg-[#fafbfc] border border-[#eef1f6] rounded-lg px-3 py-2">{n.text}</li>
                ))}
              </ul>
            )}
            {isNurse && (
              addingNote ? (
                <div className="mt-2">
                  <textarea
                    autoFocus
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={2}
                    placeholder="Add a shift note…"
                    className="w-full px-3 py-2 rounded-lg border border-[#d6dae6] text-[13px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 resize-none"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="primary" size="sm" disabled={!noteDraft.trim()} onClick={addNote}>Save note</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setAddingNote(false); setNoteDraft(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" className="mt-3" icon={<Plus size={14} />} onClick={() => setAddingNote(true)}>Add note</Button>
              )
            )}
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete care task?"
        message="This will permanently remove the task from the care plan."
        tone="danger"
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) nurseActions.deleteCarePlanItem(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
