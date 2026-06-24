import { useState } from "react";
import { ApiImage } from "../../ApiImage";
import { Users, AlertTriangle, Apple, Plus, X, Activity, Eye, EyeOff, Info, Search } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { useStaff } from "../../../../../hooks/useStaff";
import type { StaffMember } from "../../../../../services/staffService";

function painColor(n: number) {
  if (n <= 0) return "#94A3B8";
  if (n < 4) return "#10B981";
  if (n < 7) return "#F59E0B";
  return "#EF4444";
}
function painLabel(n: number) {
  if (n <= 0) return "None";
  if (n < 4) return "Mild";
  if (n < 7) return "Moderate";
  return "Severe";
}

/* ─────────────────────────────────────────────────────────────── */
/* Staff Picker Modal                                              */
/* ─────────────────────────────────────────────────────────────── */
function StaffPickerModal({
  onClose,
  onPick,
  alreadyInTeam,
}: {
  onClose: () => void;
  onPick: (member: StaffMember) => void;
  alreadyInTeam: Set<string>;
}) {
  const { staff } = useStaff();
  const { theme: t } = useTheme();
  const [filter, setFilter] = useState<"All" | "Nurse" | "Doctor">("All");
  const [query, setQuery] = useState("");

  const filtered = staff.filter((m) => {
    if (filter !== "All" && m.type !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Add Care Team Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter toggles */}
        <div className="px-6 pt-4 pb-3 shrink-0 flex items-center gap-2">
          {(["All", "Nurse", "Doctor"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all font-['Poppins',sans-serif]"
              style={{
                backgroundColor:
                  filter === f
                    ? f === "Doctor"
                      ? "#EDE9FE"
                      : "#E0F7FD"
                    : "#F3F4F6",
                color:
                  filter === f
                    ? f === "Doctor"
                      ? "#8B5CF6"
                      : "#4EBEE3"
                    : "#6B7280",
                border: `1.5px solid ${
                  filter === f
                    ? f === "Doctor"
                      ? "#8B5CF6"
                      : "#4EBEE3"
                    : "transparent"
                }`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
            />
          </div>
        </div>

        {/* Staff list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                No staff added yet. Go to <strong>Staff List</strong> to add nurses and doctors.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-[13px] text-gray-400 font-['Poppins',sans-serif]">
                No results match your search.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => {
                const isDoctor = m.type === "Doctor";
                const avatarBg = isDoctor ? "#8B5CF6" : "#4EBEE3";
                const initial = m.name.trim().charAt(0).toUpperCase();
                const disabled = alreadyInTeam.has(m.name);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && onPick(m)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors font-['Poppins',sans-serif] ${
                      disabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                    >
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-bold text-[15px]"
                          style={{ backgroundColor: avatarBg }}
                        >
                          {initial}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#16274D] truncate">
                        {m.name}
                      </div>
                      <div className="text-[12px] text-[#6B7280] truncate">
                        {m.department || "—"}
                      </div>
                    </div>

                    {/* Type badge */}
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                      style={{
                        backgroundColor: isDoctor ? "#EDE9FE" : "#E0F7FD",
                        color: isDoctor ? "#8B5CF6" : "#4EBEE3",
                      }}
                    >
                      {m.type}
                    </span>

                    {disabled && (
                      <span className="text-[11px] text-gray-400 font-medium shrink-0">
                        In team
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Main tab component                                              */
/* ─────────────────────────────────────────────────────────────── */
export function CareOverviewTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const [newAllergy, setNewAllergy] = useState("");
  const [newDietCode, setNewDietCode] = useState("");
  const [newDietLabel, setNewDietLabel] = useState("");

  const [staffPickerOpen, setStaffPickerOpen] = useState(false);

  // Build a set of names already in the care team (for "already in team" check)
  const alreadyInTeam = new Set<string>(store.careTeam.map((m) => tr(m.nameKey)));

  const handlePickStaff = (member: StaffMember) => {
    nurseActions.addCareTeamMember({
      id: `ct-${member.id}`,
      nameKey: member.name,
      roleKey: member.type === "Nurse" ? "care.team.primaryNurse" : "care.team.attendingDoctor",
      specialtyKey: member.department,
      img: member.image,
      visible: true,
    });
    setStaffPickerOpen(false);
  };

  const pc = painColor(store.painScore);

  return (
    <div className="space-y-5">
      {isNurse && (
        <div className="nurse-card flex items-center justify-between" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primarySubtle }}>
              <Eye size={18} style={{ color: t.primary }} />
            </div>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, display: "block" }}>Show Section to Patient</span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>Toggle visibility for "Care Overview" on the bedside screen</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.careOverview}
              onChange={(e) => nurseActions.setSectionVisible("careOverview", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
              style={{ backgroundColor: store.sectionVisibility.careOverview ? t.primary : "#E5E7EB" }} />
          </label>
        </div>
      )}

      {/* Care Team */}
      <div className="nurse-card">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: t.textHeading, marginBottom: 0 }}>
            <Users size={18} style={{ color: t.primary }} /> Care Team
          </h3>
          {isNurse && (
            <button
              onClick={() => setStaffPickerOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{ backgroundColor: t.primarySubtle, color: t.primary }}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <div className="space-y-3">
          {store.careTeam.map((m) => {
            const isDoctor = m.roleKey === "care.team.attendingDoctor";
            const avatarBg = isDoctor ? "#8B5CF6" : t.primary;
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {m.img ? (
                    <ApiImage src={m.img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-[15px]"
                      style={{ backgroundColor: avatarBg }}>
                      {tr(m.nameKey).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>{tr(m.nameKey)}</p>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: isDoctor ? "#8B5CF6" : t.primary }}>{tr(m.roleKey)}</p>
                </div>
                {isNurse && (
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "11px", color: t.textMuted }}>{m.visible ? "Visible" : "Hidden"}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.visible}
                        onChange={() => nurseActions.toggleCareTeamMemberVisibility(m.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                        style={{ backgroundColor: m.visible ? t.primary : "#E5E7EB" }} />
                    </label>
                    <button
                      onClick={() => nurseActions.removeCareTeamMember(m.id)}
                      className="p-1 rounded-lg transition-colors"
                      style={{ color: t.error, background: "none", border: "none", cursor: "pointer" }}
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Allergies */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><AlertTriangle size={18} style={{ color: t.error }} /> Allergies</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {store.allergies.map((a) => (
            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ fontSize: "13px", fontWeight: 700, color: t.error, backgroundColor: t.errorSubtle, border: `1px solid ${t.errorSubtle}` }}>
              <AlertTriangle size={12} /> {a}
              {isNurse && (
                <button onClick={() => nurseActions.removeAllergy(a)} className="ml-1 cursor-pointer" style={{ background: "none", border: "none", color: t.error }}>
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isNurse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p style={{ fontSize: "12px", fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>Available Allergies (Tap to add/remove):</p>
            <div className="flex flex-wrap gap-2">
              {["Penicillin", "Latex", "Shellfish", "Aspirin", "Peanuts", "Sulfonamides", "Morphine", "Eggs", "Dairy"].map(allergy => {
                const isActive = store.allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    onClick={() => isActive ? nurseActions.removeAllergy(allergy) : nurseActions.addAllergy(allergy)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? t.errorSubtle : "#F3F4F6",
                      color: isActive ? t.error : t.textMuted,
                      border: `1px solid ${isActive ? t.error : "transparent"}`,
                      cursor: "pointer"
                    }}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Diet Codes */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><Apple size={18} style={{ color: t.primary }} /> Diet Codes</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {store.dietCodes.map((d) => (
            <span key={d.code} className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ fontSize: "13px", fontWeight: 700, color: t.primary, backgroundColor: t.primarySubtle }}>
              <span style={{ fontWeight: 800 }}>{d.code}</span> — {d.label}
              {isNurse && (
                <button onClick={() => nurseActions.removeDietCode(d.code)} className="ml-1 cursor-pointer" style={{ background: "none", border: "none", color: t.primary }}>
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isNurse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p style={{ fontSize: "12px", fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>Predefined Diet Codes:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "NAS", label: "No Added Salt" },
                { code: "DM", label: "Diabetic Diet" },
                { code: "LS", label: "Low Sodium" },
                { code: "NPO", label: "Nothing by mouth" },
                { code: "SOFT", label: "Soft Diet" },
                { code: "LIQ", label: "Clear Liquid" },
                { code: "RENAL", label: "Renal Diet" }
              ].map(diet => {
                const isActive = store.dietCodes.some(d => d.code === diet.code);
                return (
                  <button
                    key={diet.code}
                    onClick={() => isActive ? nurseActions.removeDietCode(diet.code) : nurseActions.addDietCode(diet.code, diet.label)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all text-left"
                    style={{
                      backgroundColor: isActive ? t.primarySubtle : "#F3F4F6",
                      color: isActive ? t.primary : t.textMuted,
                      border: `1px solid ${isActive ? t.primary : "transparent"}`,
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{diet.code}</span> — {diet.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pain Score */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><Activity size={18} style={{ color: pc }} /> Pain Score</h3>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: "36px", fontWeight: 900, color: pc }}>{store.painScore}<span style={{ fontSize: "18px", color: t.textMuted }}>/10</span></span>
          <span style={{ fontSize: "12px", fontWeight: 800, color: pc, backgroundColor: `${pc}18`, padding: "4px 12px", borderRadius: 99 }}>{painLabel(store.painScore).toUpperCase()}</span>
        </div>
        {isNurse && (
          <div className="mt-4">
            <input type="range" min={0} max={10} value={store.painScore}
              onChange={(e) => nurseActions.setPainScore(Number(e.target.value))}
              className="w-full cursor-pointer" style={{ accentColor: pc }} />
            <div className="flex justify-between mt-1" style={{ fontSize: "11px", color: t.textMuted }}>
              <span>0 — None</span><span>10 — Severe</span>
            </div>
          </div>
        )}
      </div>

      {/* HIS Disclaimer Note */}
      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: `${t.primary}08`, border: `1px dashed ${t.primary}40` }}>
        <Info size={20} style={{ color: t.primary, marginTop: 2 }} />
        <div className="flex flex-col gap-1">
          <p style={{ fontSize: "13px", fontWeight: 700, color: t.textHeading }}>Clinical Data Source Note</p>
          <p style={{ fontSize: "12px", color: t.textMuted, lineHeight: "1.5" }}>
            Information is synchronized from the Hospital Information System (HIS). Manual adjustments made here are for <strong>local bedside display only</strong> and will not update the patient's permanent Electronic Medical Record (EMR).
            <br />
            <em>Note: Any future updates from the HIS will automatically overwrite manual adjustments.</em>
          </p>
        </div>
      </div>

      {/* Staff Picker Modal */}
      {staffPickerOpen && (
        <StaffPickerModal
          onClose={() => setStaffPickerOpen(false)}
          onPick={handlePickStaff}
          alreadyInTeam={alreadyInTeam}
        />
      )}
    </div>
  );
}
