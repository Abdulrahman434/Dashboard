import { useState } from "react";
import { BookOpen, ClipboardList, Eye, Plus, Search, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { useEducation } from "../../../../../hooks/useEducation";
import { educationService, type EducationMaterial, type ContentType } from "../../../../../services/educationService";

/* ─────────────────────────────────────────────────────────── */
/* Type icon helper                                            */
/* ─────────────────────────────────────────────────────────── */
function typeIcon(type: ContentType): string {
  if (type === "PDF") return "📄";
  if (type === "Video") return "▶";
  return "🔗";
}

/* ─────────────────────────────────────────────────────────── */
/* Inline toggle — exact markup from CareOverviewTab (w-9 h-5) */
/* ─────────────────────────────────────────────────────────── */
function InlineToggle({
  checked,
  onChange,
  primaryColor,
}: {
  checked: boolean;
  onChange: () => void;
  primaryColor: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className="w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
        style={{ backgroundColor: checked ? primaryColor : "#E5E7EB" }}
      />
    </label>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Specific material picker modal                              */
/* ─────────────────────────────────────────────────────────── */
function SpecificPickerModal({
  onClose,
  alreadyAssigned,
}: {
  onClose: () => void;
  alreadyAssigned: Set<string>;
}) {
  const { materials } = useEducation();
  const { theme: t } = useTheme();
  const [query, setQuery] = useState("");

  const specificMaterials = materials.filter((m) => m.scope === "Specific");

  const filtered = specificMaterials.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return m.nameEn.toLowerCase().includes(q) || m.nameAr.toLowerCase().includes(q);
  });

  const handlePick = (m: EducationMaterial) => {
    nurseActions.assignEducationMaterial(m.id);
    onClose();
  };

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
            <div className="rounded-lg p-2" style={{ backgroundColor: t.primarySubtle }}>
              <BookOpen className="w-5 h-5" style={{ color: t.primary }} />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Assign Education Material
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {specificMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                No specific materials added yet. Go to{" "}
                <strong>Education Materials</strong> to add some.
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
                const disabled = alreadyAssigned.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && handlePick(m)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors font-['Poppins',sans-serif] ${
                      disabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5"
                    }`}
                  >
                    {/* Type icon */}
                    <span className="text-[18px] shrink-0">{typeIcon(m.contentType)}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#16274D] truncate">
                        {m.nameEn}
                      </div>
                      <div
                        className="text-[12px] text-[#6B7280] truncate"
                        style={{ direction: "rtl", textAlign: "right" }}
                      >
                        {m.nameAr}
                      </div>
                    </div>

                    {/* Type badge */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 bg-gray-100 text-gray-700">
                      {m.contentType}
                    </span>

                    {disabled && (
                      <span className="text-[11px] text-gray-400 font-medium shrink-0">
                        Assigned
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

/* ─────────────────────────────────────────────────────────── */
/* Main tab                                                    */
/* ─────────────────────────────────────────────────────────── */
export function EducationTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const store = useNurseStore();
  const { materials } = useEducation();
  const isNurse = role === "nurse";

  const [pickerOpen, setPickerOpen] = useState(false);

  const generalMaterials = materials.filter((m) => m.scope === "General");
  const specificMaterials = materials.filter((m) => m.scope === "Specific");

  // Build a set of already-assigned material IDs
  const assignedIds = new Set(store.educationAssignments.map((a) => a.materialId));

  // Helper: get visibility of a material (defaults to true if no assignment record)
  const getVisible = (materialId: string): boolean => {
    const assignment = store.educationAssignments.find((a) => a.materialId === materialId);
    return assignment ? assignment.visible : true;
  };

  // Toggle general material visibility — ensure assignment exists first
  const handleToggleGeneral = (materialId: string) => {
    if (!assignedIds.has(materialId)) {
      nurseActions.assignEducationMaterial(materialId);
      // assignEducationMaterial defaults visible: true, so toggling means setting to false
      nurseActions.toggleEducationVisibility(materialId);
    } else {
      nurseActions.toggleEducationVisibility(materialId);
    }
  };

  // Assigned specific entries (only those whose materialId is a Specific scope material)
  const specificScopeIds = new Set(specificMaterials.map((m) => m.id));
  const assignedSpecificEntries = store.educationAssignments.filter(
    (a) => specificScopeIds.has(a.materialId)
  );

  return (
    <div className="space-y-5">
      {/* Card 1 — Section visibility toggle (nurse only) */}
      {isNurse && (
        <div className="nurse-card flex items-center justify-between" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: t.primarySubtle }}
            >
              <Eye size={18} style={{ color: t.primary }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: t.textHeading,
                  display: "block",
                }}
              >
                Show Section to Patient
              </span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>
                Toggle visibility for "Education Materials" on the bedside screen
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.education}
              onChange={(e) =>
                nurseActions.setSectionVisible("education", e.target.checked)
              }
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                backgroundColor: store.sectionVisibility.education
                  ? t.primary
                  : "#E5E7EB",
              }}
            />
          </label>
        </div>
      )}

      {/* Card 2 — General Materials */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}>
          <BookOpen size={18} style={{ color: t.primary }} /> General Materials
        </h3>

        {generalMaterials.length === 0 ? (
          <p style={{ fontSize: "13px", color: t.textMuted }}>
            No general materials added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {generalMaterials.map((m) => {
              const visible = getVisible(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: `1px solid ${t.borderDefault}`,
                  }}
                >
                  {/* Type icon */}
                  <span className="text-[18px] shrink-0">{typeIcon(m.contentType)}</span>

                  {/* Names */}
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: t.textHeading,
                      }}
                    >
                      {m.nameEn}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: t.textMuted,
                        direction: "rtl",
                        textAlign: "right",
                      }}
                    >
                      {m.nameAr}
                    </p>
                  </div>

                  {/* Visibility toggle (nurse only) */}
                  {isNurse && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span style={{ fontSize: "11px", color: t.textMuted }}>
                        {visible ? "Visible" : "Hidden"}
                      </span>
                      <InlineToggle
                        checked={visible}
                        onChange={() => handleToggleGeneral(m.id)}
                        primaryColor={t.primary}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 3 — Assigned (Specific) Materials */}
      <div className="nurse-card">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: t.textHeading, marginBottom: 0 }}>
            <ClipboardList size={18} style={{ color: t.primary }} /> Assigned to
            Patient
          </h3>
          {isNurse && (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{ backgroundColor: t.primarySubtle, color: t.primary }}
            >
              <Plus size={14} /> Assign
            </button>
          )}
        </div>

        {assignedSpecificEntries.length === 0 ? (
          <p style={{ fontSize: "13px", color: t.textMuted }}>
            No specific materials assigned yet.
          </p>
        ) : (
          <div className="space-y-3">
            {assignedSpecificEntries.map((entry) => {
              const material = educationService.get(entry.materialId);
              if (!material) return null;
              return (
                <div
                  key={entry.materialId}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: `1px solid ${t.borderDefault}`,
                  }}
                >
                  {/* Type icon */}
                  <span className="text-[18px] shrink-0">
                    {typeIcon(material.contentType)}
                  </span>

                  {/* Names */}
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: t.textHeading,
                      }}
                    >
                      {material.nameEn}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: t.textMuted,
                        direction: "rtl",
                        textAlign: "right",
                      }}
                    >
                      {material.nameAr}
                    </p>
                  </div>

                  {/* Visibility toggle + remove (nurse only) */}
                  {isNurse && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span style={{ fontSize: "11px", color: t.textMuted }}>
                        {entry.visible ? "Visible" : "Hidden"}
                      </span>
                      <InlineToggle
                        checked={entry.visible}
                        onChange={() =>
                          nurseActions.toggleEducationVisibility(entry.materialId)
                        }
                        primaryColor={t.primary}
                      />
                      <button
                        onClick={() =>
                          nurseActions.removeEducationMaterial(entry.materialId)
                        }
                        className="p-1 rounded-lg transition-colors"
                        style={{
                          color: t.error,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
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
        )}
      </div>

      {/* Picker modal */}
      {pickerOpen && (
        <SpecificPickerModal
          onClose={() => setPickerOpen(false)}
          alreadyAssigned={assignedIds}
        />
      )}
    </div>
  );
}
