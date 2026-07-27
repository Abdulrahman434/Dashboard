import { useState } from "react";
import {
  BookOpen, ClipboardList, Search, X, FileText, Play, Link2, Plus, Trash2,
} from "lucide-react";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { useEducation } from "../../../../../hooks/useEducation";
import { educationService, type EducationMaterial, type ContentType } from "../../../../../services/educationService";
import {
  PageHeader, StatusBadge, SectionCard, VisibilityControl, Toggle,
  Button, IconButton, EmptyState, ConfirmDialog, Overlay, cx, TONE,
} from "../ui";

/* ── Content-type presentation helper ────────────────────────────────── */
function typeMeta(type: ContentType): { tone: any; label: string; icon: any } {
  if (type === "PDF") return { tone: "danger", label: "PDF", icon: <FileText size={13} /> };
  if (type === "Video") return { tone: "info", label: "Video", icon: <Play size={13} /> };
  return { tone: "neutral", label: "Link", icon: <Link2 size={13} /> };
}

/* ── Shared material row ──────────────────────────────────────────────── */
function MaterialRow({ material, right }: any) {
  const meta = typeMeta(material.contentType);
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border border-[#eef1f6] bg-[#fafbfc]">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-[#16274D] truncate font-['Poppins',sans-serif]">
          {material.nameEn}
        </p>
        <p className="text-[12px] text-[#6B7280] truncate" dir="rtl" style={{ textAlign: "right" }}>
          {material.nameAr}
        </p>
      </div>
      <StatusBadge tone={meta.tone} icon={meta.icon}>{meta.label}</StatusBadge>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </div>
  );
}

/* ── Specific material picker modal (assign logic preserved) ──────────── */
function SpecificPickerModal({
  onClose,
  alreadyAssigned,
}: {
  onClose: () => void;
  alreadyAssigned: Set<string>;
}) {
  const { materials } = useEducation();
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
    <Overlay onClose={onClose} labelledBy="edu-picker-title">
      <div
        className="w-full max-w-lg max-h-[85vh] bg-white rounded-[14px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#eef1f6] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#eaf7fc] text-[#1d7da3] shrink-0">
              <BookOpen size={18} />
            </span>
            <h2 id="edu-picker-title" className="text-[17px] font-bold text-[#16274D] font-['Poppins',sans-serif]">
              Assign Education Material
            </h2>
          </div>
          <IconButton label="Close" icon={<X size={18} />} onClick={onClose} />
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3] w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              autoFocus
              className="w-full pl-10 pr-4 h-[40px] rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 font-['Poppins',sans-serif]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {specificMaterials.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={22} />}
              title="No specific materials yet"
              description="Go to Education Materials to add some, then assign them here."
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Search size={22} />} title="No results" description="No materials match your search." />
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => {
                const disabled = alreadyAssigned.has(m.id);
                const meta = typeMeta(m.contentType);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && handlePick(m)}
                    disabled={disabled}
                    className={cx(
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] border text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] font-['Poppins',sans-serif]",
                      disabled
                        ? "border-[#eef1f6] bg-[#f7f8fb] cursor-not-allowed opacity-60"
                        : "border-[#eef1f6] bg-white hover:border-[#4EBEE3] hover:bg-[#f5fcff] cursor-pointer",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#16274D] truncate">{m.nameEn}</div>
                      <div className="text-[12px] text-[#6B7280] truncate" dir="rtl" style={{ textAlign: "right" }}>
                        {m.nameAr}
                      </div>
                    </div>
                    <StatusBadge tone={meta.tone} icon={meta.icon}>{meta.label}</StatusBadge>
                    {disabled && <span className="text-[11px] text-[#98a2b3] font-semibold shrink-0">Assigned</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-[#f7f8fb] border-t border-[#eef1f6] shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Overlay>
  );
}

/* ── Main tab ─────────────────────────────────────────────────────────── */
export function EducationTab({ role }: { role: "nurse" | "doctor" }) {
  const store = useNurseStore();
  const { materials } = useEducation();
  const isNurse = role === "nurse";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const generalMaterials = materials.filter((m) => m.scope === "General");
  const specificMaterials = materials.filter((m) => m.scope === "Specific");

  // Build a set of already-assigned material IDs
  const assignedIds = new Set<string>(store.educationAssignments.map((a) => a.materialId));

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

  const sectionVisible = store.sectionVisibility.education;

  return (
    <div>
      <PageHeader
        title="Education"
        subtitle="Educational materials assigned to this patient's bedside terminal."
        badges={
          <>
            <StatusBadge tone={sectionVisible ? "success" : "neutral"} dot>
              {sectionVisible ? "Visible to Patient" : "Hidden from Patient"}
            </StatusBadge>
            <StatusBadge tone="success" dot>Synced</StatusBadge>
          </>
        }
        actions={isNurse && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setPickerOpen(true)}>
            Assign Material
          </Button>
        )}
      />

      <div className="space-y-5">
        {/* Master visibility */}
        {isNurse && (
          <VisibilityControl
            checked={sectionVisible}
            onChange={(v: boolean) => nurseActions.setSectionVisible("education", v)}
            title="Show Education Section to Patient"
            description={'Toggle visibility for "Education Materials" on the bedside screen.'}
          />
        )}

        {/* General Materials */}
        <SectionCard title="General Materials" icon={<BookOpen size={17} />}>
          {generalMaterials.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={22} />}
              title="No general materials"
              description="No general materials have been added yet."
            />
          ) : (
            <div className="space-y-2.5">
              {generalMaterials.map((m) => {
                const visible = getVisible(m.id);
                return (
                  <MaterialRow
                    key={m.id}
                    material={m}
                    right={isNurse ? (
                      <>
                        <span className="text-[11px] text-[#6B7280] font-medium w-[42px] text-right">
                          {visible ? "Visible" : "Hidden"}
                        </span>
                        <Toggle
                          size="sm"
                          checked={visible}
                          onChange={() => handleToggleGeneral(m.id)}
                          label={`Toggle visibility of ${m.nameEn}`}
                        />
                      </>
                    ) : undefined}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Assigned (Specific) Materials */}
        <SectionCard
          title="Assigned (Specific) Materials"
          subtitle="Materials assigned individually to this patient."
          icon={<ClipboardList size={17} />}
          actions={isNurse && (
            <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => setPickerOpen(true)}>
              Assign material
            </Button>
          )}
        >
          {assignedSpecificEntries.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={22} />}
              title="Nothing assigned yet"
              description="No specific materials are assigned to this patient."
              action={isNurse && (
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => setPickerOpen(true)}>
                  Assign material
                </Button>
              )}
            />
          ) : (
            <div className="space-y-2.5">
              {assignedSpecificEntries.map((entry) => {
                const material = educationService.get(entry.materialId);
                if (!material) return null;
                return (
                  <MaterialRow
                    key={entry.materialId}
                    material={material}
                    right={isNurse ? (
                      <>
                        <span className="text-[11px] text-[#6B7280] font-medium w-[42px] text-right">
                          {entry.visible ? "Visible" : "Hidden"}
                        </span>
                        <Toggle
                          size="sm"
                          checked={entry.visible}
                          onChange={() => nurseActions.toggleEducationVisibility(entry.materialId)}
                          label={`Toggle visibility of ${material.nameEn}`}
                        />
                        <IconButton
                          label={`Remove ${material.nameEn}`}
                          icon={<Trash2 size={16} />}
                          className="text-[#b42318] hover:bg-[#fdeceb]"
                          onClick={() => setRemoveId(entry.materialId)}
                        />
                      </>
                    ) : undefined}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Picker modal */}
      {pickerOpen && (
        <SpecificPickerModal
          onClose={() => setPickerOpen(false)}
          alreadyAssigned={assignedIds}
        />
      )}

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!removeId}
        title="Remove material?"
        message="This material will no longer be assigned to this patient's bedside terminal."
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) nurseActions.removeEducationMaterial(removeId);
          setRemoveId(null);
        }}
      />
    </div>
  );
}
