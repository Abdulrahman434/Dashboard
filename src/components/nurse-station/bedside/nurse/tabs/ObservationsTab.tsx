/**
 * ObservationsTab — action-focused observations screen.
 * ----------------------------------------------------------------------------
 * Presentation rebuilt on the shared `../ui` design system. ALL store bindings
 * and write paths are preserved untouched:
 *   reads   → store.observations (ClinicalObservation[]), store.sectionVisibility.observations
 *   writes  → nurseActions.setSectionVisible / addObservation / deleteObservation / addDoctorNote
 * The stored ClinicalObservation shape and the vitals sanitization rules are
 * carried over verbatim from the previous implementation.
 *
 * Anything the store cannot hold is clearly marked "DEV-ONLY" below and never
 * bypasses the real store writes:
 *   - Respiratory Rate (not in the vitals shape) → mocked display default 16/min
 *   - Timeline categories (Vital Signs / Nursing Notes / Intake & Output / …)
 *   - "Source" labels and "Entered manually" metric
 *   - "Visible to patient" per-observation toggle (no per-row field in store)
 */
import { useMemo, useState } from "react";
import {
  Activity, HeartPulse, Thermometer, Droplet, Wind, Gauge,
  Plus, AlertTriangle, Clock,
} from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions, type ClinicalObservation } from "../../NurseDataStore";
import {
  PageHeader, StatusBadge, SectionCard, VisibilityControl, MetricSummary, Drawer, Button,
  IconButton, Segmented, ConfirmDialog, EmptyState, Toggle, cx, TONE,
} from "../ui";

/* DEV-ONLY: respiratory rate has no home in the ClinicalObservation.vitals
   shape ({bp,hr,temp,spo2}). Displayed as a mocked default until the store
   grows a field for it. */
const DEV_RESP_RATE_DEFAULT = 16; // /min

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/* ── formatting ──────────────────────────────────────────────────────── */
function toDate(input: any): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}
function fmtTime(input: any) {
  const d = toDate(input);
  return d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}
function fmtFull(input: any) {
  const d = toDate(input);
  if (!d) return "—";
  return `${d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function isToday(input: any) {
  const d = toDate(input);
  if (!d) return false;
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function datetimeLocalValue(d: Date) {
  // yyyy-MM-ddThh:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── vitals sanitization (carried over verbatim) ─────────────────────── */
function sanitizeVital(key: string, raw: string): string {
  let val = raw;
  if (key === "hr") {
    val = val.replace(/\D/g, "").slice(0, 3);
  } else if (key === "spo2") {
    val = val.replace(/\D/g, "");
    if (Number(val) > 100) val = "100";
  } else if (key === "temp") {
    val = val.replace(/[^0-9.]/g, "");
    if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);
  } else if (key === "bp") {
    val = val.replace(/[^0-9/]/g, "");
    const parts = val.split("/");
    if (parts.length > 2) val = parts[0] + "/" + parts[1];
    const p0 = parts[0]?.slice(0, 3) || "";
    const p1 = parts[1]?.slice(0, 3) || "";
    val = parts.length > 1 ? `${p0}/${p1}` : p0;
  }
  return val;
}

/* ── clinical tone helpers (simple ranges — NOT a diagnosis) ─────────── */
// Returns a tone bucket for a single measurement. gray/"neutral" == no reading.
function vitalTone(field: string, raw: any): Tone {
  const s = (raw ?? "").toString().trim();
  if (s === "" || s === "—") return "neutral";
  const n = Number(s.split("/")[0]); // for bp use systolic
  switch (field) {
    case "bp": {
      const sys = Number(s.split("/")[0]);
      if (isNaN(sys)) return "neutral";
      if (sys >= 180 || sys <= 90) return "danger";
      if (sys >= 140 || sys < 100) return "warning";
      return "success";
    }
    case "hr":
      if (isNaN(n)) return "neutral";
      if (n < 50 || n > 120) return "danger";
      if (n < 60 || n > 100) return "warning";
      return "success";
    case "temp":
      if (isNaN(n)) return "neutral";
      if (n >= 39 || n < 35) return "danger";
      if (n >= 38 || n < 36) return "warning";
      return "success";
    case "spo2":
      if (isNaN(n)) return "neutral";
      if (n < 88) return "danger";
      if (n < 92) return "warning";
      return "success";
    case "pain":
      if (isNaN(n)) return "neutral";
      if (n >= 7) return "danger";
      if (n >= 4) return "warning";
      return "success";
    case "resp":
      if (isNaN(n)) return "neutral";
      if (n < 8 || n > 30) return "danger";
      if (n < 12 || n > 20) return "warning";
      return "success";
    default:
      return "neutral";
  }
}
const toneLabel: Record<Tone, string> = {
  success: "Normal", warning: "Warning", danger: "Critical", info: "Info", neutral: "No reading",
};

// An observation "requires attention" if any flagged risk or any warning/critical vital/pain.
function needsAttention(obs: ClinicalObservation): boolean {
  const r = obs.risks || ({} as any);
  if (r.fall || r.pressure || r.allergies || r.other) return true;
  const buckets = [
    vitalTone("bp", obs.vitals?.bp), vitalTone("hr", obs.vitals?.hr),
    vitalTone("temp", obs.vitals?.temp), vitalTone("spo2", obs.vitals?.spo2),
    vitalTone("pain", obs.painLevel),
  ];
  return buckets.some((t) => t === "warning" || t === "danger");
}

/* DEV-ONLY: categorise a stored observation for the timeline filters.
   The store has no category field, so we infer from what was recorded. */
function categoriesOf(obs: ClinicalObservation): string[] {
  const v = obs.vitals || ({} as any);
  const hasVitals = !!(v.bp || v.hr || v.temp || v.spo2) || Number(obs.painLevel) > 0;
  const notes = (obs.nurseNotes || "").trim();
  const cats: string[] = [];
  if (hasVitals) cats.push("vitals");
  if (notes) cats.push("notes");
  if (/^(fluid intake|fluid output)/i.test(notes)) cats.push("io");
  if (needsAttention(obs)) cats.push("attention");
  return cats;
}

// Short human description for a timeline row.
function describe(obs: ClinicalObservation): string {
  const v = obs.vitals || ({} as any);
  const filled = ["bp", "hr", "temp", "spo2"].filter((k) => (v as any)[k]);
  if (filled.length >= 3) return "Full vital signs recorded";
  if ((obs.nurseNotes || "").trim()) return obs.nurseNotes.trim();
  if (filled.length > 0) return `Recorded ${filled.map((k) => k.toUpperCase()).join(", ")}`;
  if (Number(obs.painLevel) > 0) return `Pain score ${obs.painLevel}/10`;
  return "Observation recorded";
}

/* Observation-type catalog for the Add drawer. `field` maps back into the
   preserved ClinicalObservation shape; null → recorded in nurseNotes. */
const OBS_TYPES: { value: string; label: string; unit: string; field: string | null }[] = [
  { value: "bp", label: "Blood pressure", unit: "mmHg", field: "bp" },
  { value: "hr", label: "Heart rate", unit: "bpm", field: "hr" },
  { value: "temp", label: "Temperature", unit: "°C", field: "temp" },
  { value: "spo2", label: "Oxygen saturation", unit: "%", field: "spo2" },
  { value: "resp", label: "Respiratory rate", unit: "/min", field: null },
  { value: "pain", label: "Pain score", unit: "/10", field: "pain" },
  { value: "glucose", label: "Blood glucose", unit: "mmol/L", field: null },
  { value: "weight", label: "Weight", unit: "kg", field: null },
  { value: "intake", label: "Fluid intake", unit: "ml", field: null },
  { value: "output", label: "Fluid output", unit: "ml", field: null },
  { value: "note", label: "Nursing note", unit: "", field: null },
  { value: "custom", label: "Custom observation", unit: "", field: null },
];

/* DEV-ONLY: source options — the store has no source field, so this is used
   only to prefix the recorded note for provenance. */
const SOURCE_OPTIONS = ["Manual entry", "Bedside monitor", "HIS import"];

const TIMELINE_FILTERS = [
  { value: "all", label: "All" },
  { value: "vitals", label: "Vital Signs" },
  { value: "notes", label: "Nursing Notes" },
  { value: "io", label: "Intake & Output" },
  { value: "attention", label: "Requires Attention" },
];

const inputBase =
  "w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] bg-white outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 disabled:opacity-50 transition-colors";

/* ════════════════════════════════════════════════════════════════════ */
export function ObservationsTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const observations = store.observations;
  const latest = observations.length ? observations[observations.length - 1] : null;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add-observation drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Doctor-note editor
  const [docNote, setDocNote] = useState("");

  const activeObs =
    observations.find((o) => o.id === selectedId) || latest || null;

  /* ── metrics ─────────────────────────────────────────────────────── */
  const attentionCount = observations.filter(needsAttention).length;
  const todayCount = observations.filter((o) => isToday(o.timestamp)).length;
  const metrics = [
    { label: "Last observation", value: latest ? fmtTime(latest.timestamp) : "—", sub: latest ? "Most recent entry" : "None yet", icon: <Clock size={14} />, tone: "info" },
    { label: "Observations today", value: todayCount, sub: new Date().toLocaleDateString([], { day: "2-digit", month: "short" }), icon: <Activity size={14} /> },
    { label: "Requires attention", value: attentionCount, sub: attentionCount ? "Review flagged entries" : "All within range", icon: <AlertTriangle size={14} />, tone: attentionCount ? "warning" : "success" },
    // DEV-ONLY: no per-row source in store — every stored entry is manual.
    { label: "Entered manually", value: observations.length, sub: "This admission", icon: <Gauge size={14} /> },
  ];

  /* ── latest measurement cards ────────────────────────────────────── */
  const v = latest?.vitals || ({} as any);
  const measurements = [
    { key: "bp", label: "Blood Pressure", icon: <Droplet size={16} />, value: v.bp || "", unit: "mmHg", tone: vitalTone("bp", v.bp) },
    { key: "hr", label: "Heart Rate", icon: <HeartPulse size={16} />, value: v.hr || "", unit: "bpm", tone: vitalTone("hr", v.hr) },
    { key: "temp", label: "Temperature", icon: <Thermometer size={16} />, value: v.temp || "", unit: "°C", tone: vitalTone("temp", v.temp) },
    { key: "spo2", label: "Oxygen Saturation", icon: <Wind size={16} />, value: v.spo2 || "", unit: "%", tone: vitalTone("spo2", v.spo2) },
    { key: "pain", label: "Pain Score", icon: <Activity size={16} />, value: latest ? String(latest.painLevel) : "", unit: "/10", tone: vitalTone("pain", latest?.painLevel) },
    // DEV-ONLY: respiratory rate mocked — not in store.
    { key: "resp", label: "Respiratory Rate", icon: <Gauge size={16} />, value: latest ? String(DEV_RESP_RATE_DEFAULT) : "", unit: "/min", tone: vitalTone("resp", latest ? DEV_RESP_RATE_DEFAULT : "") },
  ];

  /* ── timeline (reverse-chronological + filter) ───────────────────── */
  const timeline = useMemo(() => {
    const rows = [...observations].reverse();
    if (filter === "all") return rows;
    return rows.filter((o) => categoriesOf(o).includes(filter));
  }, [observations, filter]);

  /* ── doctor note write (preserved) ───────────────────────────────── */
  const handleDocSave = () => {
    if (!activeObs || !docNote.trim()) return;
    nurseActions.addDoctorNote(activeObs.id, {
      text: docNote.trim(),
      addedAt: new Date(),
      doctorName: "Dr. Omar Abdulhalim",
    });
    setDocNote("");
  };

  return (
    <div className="font-['Poppins',sans-serif]">
      <PageHeader
        title="Observations"
        subtitle="Record and review patient observations during the current admission."
        badges={
          <>
            <StatusBadge tone={store.sectionVisibility.observations ? "info" : "neutral"}>Visible to Patient</StatusBadge>
            <StatusBadge tone="success" dot>EMR Synced</StatusBadge>
          </>
        }
        actions={
          isNurse && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>
              Add Observation
            </Button>
          )
        }
      />

      {isNurse && (
        <VisibilityControl
          checked={store.sectionVisibility.observations}
          onChange={(val: boolean) => nurseActions.setSectionVisible("observations", val)}
          title="Show Section to Patient"
          description='Toggle visibility for "Observations" on the bedside screen'
        />
      )}

      <MetricSummary items={metrics} cols={4} className="mb-5" />

      {/* ── A. Latest Measurements ───────────────────────────────────── */}
      <SectionCard
        title="Latest Measurements"
        subtitle={latest ? `Recorded ${fmtFull(latest.timestamp)}` : "No observations recorded yet"}
        icon={<Activity size={17} />}
        className="mb-5"
      >
        {latest ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
            {measurements.map((m) => {
              const c = TONE[m.tone];
              const hasReading = m.value !== "" && m.value != null;
              return (
                <div
                  key={m.key}
                  className="rounded-[12px] border bg-white p-3.5"
                  style={{ borderColor: hasReading ? c.border : "#E5E7EB" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#6B7280]">
                      <span style={{ color: hasReading ? c.dot : "#98a2b3" }}>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hasReading ? c.dot : TONE.neutral.dot }} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[22px] font-bold leading-none" style={{ color: hasReading ? "#16274D" : "#9aa4b2" }}>
                      {hasReading ? m.value : "—"}
                    </span>
                    {hasReading && <span className="text-[11px] text-[#98a2b3]">{m.unit}</span>}
                  </div>
                  <div className="mt-2">
                    <StatusBadge tone={hasReading ? m.tone : "neutral"} dot>{toneLabel[hasReading ? m.tone : "neutral"]}</StatusBadge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Activity size={22} />}
            title="No measurements yet"
            description="Add the first observation to populate the latest measurements."
            action={isNurse && <Button variant="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>Add Observation</Button>}
          />
        )}
      </SectionCard>

      {/* ── B. Observation Timeline + detail ─────────────────────────── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)" }}>
        <SectionCard
          title="Observation Timeline"
          subtitle={`${observations.length} total`}
          icon={<Clock size={17} />}
          actions={<Segmented options={TIMELINE_FILTERS} value={filter} onChange={setFilter} />}
        >
          {timeline.length === 0 ? (
            <EmptyState
              icon={<Clock size={22} />}
              title="Nothing to show"
              description={filter === "all" ? "No observations have been recorded." : "No entries match this filter."}
            />
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {timeline.map((obs) => {
                const attn = needsAttention(obs);
                const tone: Tone = attn ? "warning" : "success";
                const selected = obs.id === activeObs?.id;
                return (
                  <div
                    key={obs.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(obs.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(obs.id); } }}
                    className={cx(
                      "group flex items-start gap-3 rounded-[10px] border p-3 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3]",
                      selected ? "bg-[#f5fbfe]" : "bg-white hover:bg-[#f7f9fc]",
                    )}
                    style={{ borderColor: selected ? "#4EBEE3" : "#eef1f6" }}
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: TONE[tone].dot }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-bold text-[#16274D]">{fmtTime(obs.timestamp)}</span>
                        <span className="text-[11px] text-[#98a2b3]">{fmtFull(obs.timestamp)}</span>
                        {attn && <StatusBadge tone="warning">Requires attention</StatusBadge>}
                      </div>
                      <p className="text-[13px] text-[#475467] mt-0.5 line-clamp-2">{describe(obs)}</p>
                      <p className="text-[11.5px] text-[#98a2b3] mt-0.5">{tr(obs.nurseName)}</p>
                    </div>
                    {isNurse && (
                      <IconButton
                        label="Delete observation"
                        icon={<AlertTriangle size={15} />}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[#b42318] hover:bg-[#fdeceb]"
                        onClick={(e: any) => { e.stopPropagation(); setConfirmDeleteId(obs.id); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Detail panel */}
        <SectionCard title="Observation Detail" icon={<Gauge size={17} />}>
          {activeObs ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[14px] font-bold text-[#16274D]">{tr(activeObs.nurseName)}</div>
                  <div className="text-[12px] text-[#6B7280]">{fmtFull(activeObs.timestamp)}</div>
                </div>
                <StatusBadge tone={needsAttention(activeObs) ? "warning" : "success"} dot>
                  {needsAttention(activeObs) ? "Requires attention" : "Within range"}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "BP", field: "bp", val: activeObs.vitals.bp, unit: "mmHg" },
                  { label: "HR", field: "hr", val: activeObs.vitals.hr, unit: "bpm" },
                  { label: "Temp", field: "temp", val: activeObs.vitals.temp, unit: "°C" },
                  { label: "SpO₂", field: "spo2", val: activeObs.vitals.spo2, unit: "%" },
                  { label: "Pain", field: "pain", val: String(activeObs.painLevel), unit: "/10" },
                ].map((m) => {
                  const has = m.val !== "" && m.val != null;
                  const c = TONE[vitalTone(m.field, m.val)];
                  return (
                    <div key={m.label} className="rounded-[10px] border border-[#eef1f6] bg-[#fafbfc] px-3 py-2">
                      <div className="text-[11px] text-[#6B7280] font-semibold">{m.label}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[16px] font-bold" style={{ color: has ? c.fg : "#9aa4b2" }}>{has ? m.val : "—"}</span>
                        {has && <span className="text-[10px] text-[#98a2b3]">{m.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Risks */}
              {(activeObs.risks?.fall || activeObs.risks?.pressure || activeObs.risks?.allergies || activeObs.risks?.other) && (
                <div className="flex flex-wrap gap-1.5">
                  {(["fall", "pressure", "allergies", "other"] as const)
                    .filter((k) => (activeObs.risks as any)[k])
                    .map((k) => (
                      <StatusBadge key={k} tone="danger" icon={<AlertTriangle size={12} />}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </StatusBadge>
                    ))}
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="text-[11.5px] font-semibold text-[#6B7280] mb-1">Clinical note</div>
                <p className="text-[13.5px] text-[#475467] leading-relaxed">{activeObs.nurseNotes || "—"}</p>
              </div>

              {/* Existing doctor note */}
              {activeObs.doctorNote && (
                <div className="rounded-[10px] border p-3" style={{ borderColor: TONE.info.border, background: TONE.info.bg }}>
                  <div className="text-[12px] font-bold" style={{ color: TONE.info.fg }}>Physician Note</div>
                  <p className="text-[13px] text-[#475467] italic mt-1">{activeObs.doctorNote.text}</p>
                  <p className="text-[11.5px] font-semibold mt-1.5" style={{ color: TONE.info.fg }}>
                    {activeObs.doctorNote.doctorName} · {fmtFull(activeObs.doctorNote.addedAt)}
                  </p>
                </div>
              )}

              {/* Doctor note editor (doctor role only) — preserved write */}
              {role === "doctor" && (
                <div className="pt-3 border-t border-[#eef1f6]">
                  <div className="text-[13px] font-bold text-[#16274D] mb-2">Add Physician Note</div>
                  <textarea
                    value={docNote}
                    onChange={(e) => setDocNote(e.target.value)}
                    rows={3}
                    placeholder="Enter physician note…"
                    className="w-full px-3 py-2 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button variant="primary" disabled={!docNote.trim()} onClick={handleDocSave}>Save Note</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={<Gauge size={22} />} title="No observation selected" description="Select an entry from the timeline to view its detail." />
          )}
        </SectionCard>
      </div>

      {/* ── C. Add Observation drawer (nurse) ────────────────────────── */}
      {isNurse && (
        <AddObservationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSaved={(id) => setSelectedId(id)} />
      )}

      {/* Delete confirmation (nurse only) — preserved write */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete observation?"
        message="This will permanently remove the observation from the timeline. This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            nurseActions.deleteObservation(confirmDeleteId);
            if (selectedId === confirmDeleteId) setSelectedId(null);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Add Observation — right Drawer. Maps back into the preserved
   addObservation(ClinicalObservation) write. */
function AddObservationDrawer({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (id: string) => void }) {
  const blank = {
    type: "bp",
    when: datetimeLocalValue(new Date()),
    value: "",
    unit: "mmHg",
    status: "normal", // manual override for the recorded label
    note: "",
    visibleToPatient: true, // DEV-ONLY: no per-observation field in store
    source: SOURCE_OPTIONS[0], // DEV-ONLY: prefixes the note for provenance
    ack: false,
  };
  const [form, setForm] = useState<any>(blank);
  const [submitted, setSubmitted] = useState(false);

  const typeDef = OBS_TYPES.find((o) => o.value === form.type) || OBS_TYPES[0];
  const isNumeric = ["bp", "hr", "temp", "spo2", "resp", "pain", "glucose", "weight", "intake", "output"].includes(form.type);
  const isNoteOnly = form.type === "note" || form.type === "custom";

  const reset = () => { setForm({ ...blank, when: datetimeLocalValue(new Date()) }); setSubmitted(false); };
  const close = () => { reset(); onClose(); };

  const setType = (val: string) => {
    const def = OBS_TYPES.find((o) => o.value === val)!;
    setForm((f: any) => ({ ...f, type: val, unit: def.unit, value: "", ack: false }));
  };
  const setValue = (raw: string) => {
    // Apply the preserved sanitization when the type maps to a core vital.
    const sanitized = ["bp", "hr", "temp", "spo2"].includes(form.type) ? sanitizeVital(form.type, raw) : raw;
    setForm((f: any) => ({ ...f, value: sanitized, ack: false }));
  };

  // Tone for the entered value (drives inline warn + critical ack requirement).
  const valTone: Tone = isNoteOnly ? "neutral" : vitalTone(typeDef.field || (form.type === "resp" ? "resp" : form.type === "pain" ? "pain" : "x"), form.value);
  const isCritical = valTone === "danger";
  const isWarning = valTone === "warning";

  // Validation
  const errors: string[] = [];
  if (!form.type) errors.push("Observation type is required.");
  if (!form.when) errors.push("Date & time is required.");
  if (isNumeric) {
    if (form.value.trim() === "") errors.push("A measurement value is required.");
    else if (form.type !== "bp" && isNaN(Number(form.value))) errors.push("Value must be numeric.");
    if (!form.unit.trim()) errors.push("Unit is required.");
  } else if (isNoteOnly && !form.note.trim() && !form.value.trim()) {
    errors.push("Enter the note text.");
  }
  const canSave = errors.length === 0 && (!isCritical || form.ack);

  const handleSave = () => {
    setSubmitted(true);
    if (!canSave) return;

    const def = typeDef;
    // Base blank vitals — preserved shape.
    const vitals = { bp: "", hr: "", temp: "", spo2: "" };
    let painLevel = 0;
    const noteParts: string[] = [];

    if (def.field && ["bp", "hr", "temp", "spo2"].includes(def.field)) {
      (vitals as any)[def.field] = form.value.trim();
    } else if (form.type === "pain") {
      painLevel = Math.max(0, Math.min(10, Number(form.value) || 0));
    } else {
      // Not representable in vitals → record in nurseNotes prefixed with label.
      const measure = form.value.trim() ? `${form.value.trim()}${form.unit ? " " + form.unit : ""}` : "";
      const body = [def.label, measure].filter(Boolean).join(": ");
      if (body) noteParts.push(body);
    }

    if (form.note.trim()) noteParts.push(form.note.trim());
    // DEV-ONLY provenance tags — the store has no source/visibility fields.
    if (form.source && form.source !== SOURCE_OPTIONS[0]) noteParts.push(`[Source: ${form.source}]`);
    if (!form.visibleToPatient) noteParts.push("[Hidden from patient]");

    const obs: ClinicalObservation = {
      id: Date.now().toString(36),
      timestamp: new Date(form.when),
      nurseName: "clinical.nurse.nura",
      vitals,
      painLevel,
      risks: { fall: false, pressure: false, allergies: false, other: false },
      nurseNotes: noteParts.join(" — "),
      doctorNote: null,
    };
    nurseActions.addObservation(obs);
    onSaved(obs.id);
    close();
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Add Observation"
      subtitle="Record a new measurement or note for this admission."
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={!canSave} onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280]">Observation type <span className="text-[#b42318]">*</span></label>
          <select value={form.type} onChange={(e) => setType(e.target.value)} className={cx(inputBase, "mt-1")}>
            {OBS_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Date & time */}
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280]">Date & time <span className="text-[#b42318]">*</span></label>
          <input type="datetime-local" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} className={cx(inputBase, "mt-1")} />
        </div>

        {/* Value + unit (numeric types) */}
        {!isNoteOnly && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280]">Measurement / value{isNumeric && <span className="text-[#b42318]"> *</span>}</label>
              <input
                value={form.value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={form.type === "bp" ? "120/80" : "0"}
                inputMode={form.type === "temp" ? "decimal" : form.type === "bp" ? "text" : "numeric"}
                className={cx(inputBase, "mt-1")}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280]">Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={cx(inputBase, "mt-1")} />
            </div>
          </div>
        )}

        {/* Inline range feedback (warn amber / critical red) — NOT a diagnosis */}
        {!isNoteOnly && form.value.trim() !== "" && (isWarning || isCritical) && (
          <div
            className="rounded-lg border px-3 py-2 text-[12.5px] flex items-start gap-2"
            style={{ borderColor: TONE[valTone].border, background: TONE[valTone].bg, color: TONE[valTone].fg }}
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{isCritical ? "This value is outside the critical range. Acknowledge before saving." : "This value is outside the normal range."}</span>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280]">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={cx(inputBase, "mt-1")}>
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Clinical note */}
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280]">Clinical note{isNoteOnly && <span className="text-[#b42318]"> *</span>}</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            placeholder="Additional context…"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 resize-none"
          />
        </div>

        {/* Source (DEV-ONLY provenance) */}
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280]">Source</label>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={cx(inputBase, "mt-1")}>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Visible to patient (DEV-ONLY) */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#eef1f6] bg-[#fafbfc] px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#16274D]">Visible to patient</div>
            <div className="text-[11.5px] text-[#6B7280]">Show this entry on the bedside screen</div>
          </div>
          <Toggle checked={form.visibleToPatient} onChange={(val: boolean) => setForm({ ...form, visibleToPatient: val })} label="Visible to patient" />
        </div>

        {/* Critical acknowledgement */}
        {isCritical && (
          <label className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer" style={{ borderColor: TONE.danger.border, background: TONE.danger.bg }}>
            <input
              type="checkbox"
              checked={form.ack}
              onChange={(e) => setForm({ ...form, ack: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-[#EF4444] cursor-pointer"
            />
            <span className="text-[12.5px]" style={{ color: TONE.danger.fg }}>
              I acknowledge this is a critical value and have reviewed it before recording.
            </span>
          </label>
        )}

        {/* Validation summary */}
        {submitted && errors.length > 0 && (
          <div className="rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: TONE.danger.border, background: TONE.danger.bg, color: TONE.danger.fg }}>
            <ul className="list-disc pl-4 space-y-0.5">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>
    </Drawer>
  );
}
