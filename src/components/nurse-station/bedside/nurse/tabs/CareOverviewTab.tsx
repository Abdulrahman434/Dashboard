import { useState, useEffect, useRef } from "react";
import { Users, AlertTriangle, Apple, Plus, X, Search, Shield, MoreHorizontal, Eye, EyeOff, Trash2 } from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { useStaff } from "../../../../../hooks/useStaff";
import type { StaffMember } from "../../../../../services/staffService";
import { useFood } from "../../../../food/foodStore";
import {
  PageHeader,
  StatusBadge,
  SectionCard,
  Avatar,
  VisibilityControl,
  SyncStatus,
  Button,
  IconButton,
  Toggle,
  EmptyState,
  ConfirmDialog,
  Overlay,
  cx,
  TONE,
} from "../ui";

/* Dev-only presentational constant — last sync time shown on Data Sources card.
   Not wired to any store; purely cosmetic. */
const DEV_LAST_SYNC = "today at 08:42";

/* ─────────────────────────────────────────────────────────────── */
/* Staff Picker Modal (restyled with shared Overlay; add flow kept) */
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
    <Overlay onClose={onClose} labelledBy="staff-picker-title">
      <div
        className="bg-white rounded-[14px] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef1f6] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: TONE.info.bg, color: TONE.info.fg }}>
              <Users size={18} />
            </span>
            <h2 id="staff-picker-title" className="text-[17px] font-bold text-[#16274D] font-['Poppins',sans-serif]">
              Add Care Team Member
            </h2>
          </div>
          <IconButton label="Close" icon={<X size={18} />} onClick={onClose} />
        </div>

        {/* Filter toggles */}
        <div className="px-5 pt-4 pb-3 shrink-0 flex items-center gap-2">
          {(["All", "Nurse", "Doctor"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cx(
                "px-4 h-[32px] rounded-lg text-[12.5px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] font-['Poppins',sans-serif]",
                filter === f
                  ? "bg-[#4EBEE3] text-white border border-[#4EBEE3]"
                  : "bg-[#f2f4f7] text-[#5d6678] border border-transparent hover:text-[#16274D]",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa4b2] w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or department…"
              className="w-full pl-10 pr-4 h-[40px] border border-[#d6dae6] rounded-lg outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30 font-['Poppins',sans-serif] text-[13px]"
            />
          </div>
        </div>

        {/* Staff list */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {staff.length === 0 ? (
            <EmptyState
              icon={<Users size={22} />}
              title="No staff added yet"
              description="Go to Staff List to add nurses and doctors, then assign them here."
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Search size={22} />} title="No results" description="No staff match your search." />
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => {
                const isDoctor = m.type === "Doctor";
                const initial = m.name.trim().charAt(0).toUpperCase();
                const disabled = alreadyInTeam.has(m.name);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && onPick(m)}
                    disabled={disabled}
                    className={cx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] font-['Poppins',sans-serif]",
                      disabled
                        ? "border-[#e4e7ec] bg-[#f7f8fb] cursor-not-allowed opacity-60"
                        : "border-[#e4e7ec] hover:border-[#4EBEE3] hover:bg-[#f5fcff] cursor-pointer",
                    )}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <Avatar initials={initial} tone={isDoctor ? "neutral" : "info"} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#16274D] truncate">{m.name}</div>
                      <div className="text-[12px] text-[#6B7280] truncate">{m.department || "—"}</div>
                    </div>
                    <StatusBadge tone={isDoctor ? "neutral" : "info"}>{m.type}</StatusBadge>
                    {disabled && <span className="text-[11px] text-[#9aa4b2] font-medium shrink-0">In team</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-[#eef1f6] bg-[#f7f8fb] shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Per-member overflow (⋯) menu                                     */
/* ─────────────────────────────────────────────────────────────── */
function MemberMenu({
  visible,
  onToggleVisibility,
  onRemove,
}: {
  visible: boolean;
  onToggleVisibility: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <IconButton
        label="Member options"
        icon={<MoreHorizontal size={18} />}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-20 w-56 rounded-[10px] border border-[#e4e7ec] bg-white shadow-xl overflow-hidden py-1"
        >
          <button
            role="menuitem"
            onClick={() => {
              onToggleVisibility();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#16274D] hover:bg-[#f4f8fc] transition-colors outline-none focus-visible:bg-[#f4f8fc] cursor-pointer text-left"
          >
            {visible ? <EyeOff size={15} className="text-[#5d6678]" /> : <Eye size={15} className="text-[#5d6678]" />}
            Toggle patient visibility
          </button>
          <button
            role="menuitem"
            onClick={() => {
              onRemove();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#b42318] hover:bg-[#fdeceb] transition-colors outline-none focus-visible:bg-[#fdeceb] cursor-pointer text-left"
          >
            <Trash2 size={15} />
            Remove from team
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Main tab component                                              */
/* ─────────────────────────────────────────────────────────────── */
export function CareOverviewTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const foodStore = useFood();
  const isNurse = role === "nurse";

  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [manageMode, setManageMode] = useState(false); // "Manage Overview" edit toggle
  const [showAllergyPicker, setShowAllergyPicker] = useState(false);
  const [showDietPicker, setShowDietPicker] = useState(false);

  // Confirm dialog state (replaces window.confirm for destructive removes)
  const [confirm, setConfirm] = useState<{ title: string; message?: string; onConfirm: () => void } | null>(null);
  const askConfirm = (title: string, message: string, onConfirm: () => void) => setConfirm({ title, message, onConfirm });

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

  // Derive available diets and allergens dynamically from the food store
  const availableAllergens: string[] = foodStore?.allergens || [
    "Milk", "Egg", "Gluten", "Nuts", "Fish", "Shellfish", "Soy", "Sesame", "Peanut",
  ];

  const availableDiets = (foodStore?.diets || []).map((d: any) => {
    const code = d.his.includes("-") ? d.his.split("-")[1] : d.en.substring(0, 3).toUpperCase();
    return { code, label: d.en };
  });

  // Allergens not already active (don't list active ones in the add picker)
  const inactiveAllergens = availableAllergens.filter((a) => !store.allergies.includes(a));
  const inactiveDiets = availableDiets.filter((d: any) => !store.dietCodes.some((x) => x.code === d.code));

  const initialsOf = (name: string) =>
    (name || "")
      .trim()
      .split(/\s+/)
      .filter((w) => !/^dr\.?$/i.test(w))
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("") || "?";

  const canManage = isNurse && manageMode;

  return (
    <div>
      <PageHeader
        title="Care Overview"
        subtitle="Key care information, clinical risks, and assigned care team."
        badges={
          <>
            <StatusBadge tone={store.sectionVisibility.careOverview ? "info" : "neutral"} icon={store.sectionVisibility.careOverview ? <Eye size={13} /> : <EyeOff size={13} />}>
              {store.sectionVisibility.careOverview ? "Visible to patient" : "Hidden from patient"}
            </StatusBadge>
            <StatusBadge tone="success" dot>
              EMR Synced
            </StatusBadge>
          </>
        }
        actions={
          isNurse && (
            <Button variant={manageMode ? "primary" : "secondary"} onClick={() => setManageMode((v) => !v)}>
              {manageMode ? "Done" : "Manage Overview"}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* LEFT COLUMN ------------------------------------------------- */}
        <div className="space-y-4 min-w-0">
          {/* Allergies & Safety — most prominent clinical section */}
          <SectionCard
            tone="danger"
            icon={<AlertTriangle size={18} />}
            title="Allergies & Safety"
            subtitle="Highest-priority clinical risk information"
            actions={
              canManage && (
                <Button variant="danger" size="sm" icon={<Plus size={15} />} onClick={() => setShowAllergyPicker((v) => !v)}>
                  Manage Allergies
                </Button>
              )
            }
          >
            {store.allergies.length === 0 ? (
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: TONE.danger.fg }}>
                <Shield size={16} /> No known allergies on record.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {store.allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
                      style={{ color: TONE.danger.fg, background: "#fff", border: `1px solid ${TONE.danger.border}` }}
                    >
                      <AlertTriangle size={12} /> {a}
                      {canManage && (
                        <button
                          onClick={() => askConfirm("Remove allergy", `Remove the allergy "${a}"? This affects medication and dietary safety checks.`, () => nurseActions.removeAllergy(a))}
                          aria-label={`Remove ${a}`}
                          className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] cursor-pointer"
                          style={{ color: TONE.danger.fg }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12.5px] font-semibold" style={{ color: TONE.danger.fg }}>
                  {store.allergies.length} active {store.allergies.length === 1 ? "allergy" : "allergies"} — verify before medication or dietary service.
                </p>
              </>
            )}

            {canManage && showAllergyPicker && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: TONE.danger.border }}>
                <p className="text-[11.5px] font-bold uppercase tracking-wide mb-2" style={{ color: TONE.danger.fg }}>
                  Add allergen
                </p>
                {inactiveAllergens.length === 0 ? (
                  <p className="text-[12.5px] text-[#6B7280]">All known allergens are already active.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {inactiveAllergens.map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => nurseActions.addAllergy(allergy)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] cursor-pointer"
                        style={{ color: TONE.danger.fg, border: `1px dashed ${TONE.danger.border}` }}
                      >
                        <Plus size={13} /> {allergy}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Diet & Nutrition */}
          <SectionCard
            icon={<Apple size={18} />}
            title="Diet & Nutrition"
            subtitle="Source: Food Management"
            actions={
              canManage && (
                <Button variant="secondary" size="sm" icon={<Plus size={15} />} onClick={() => setShowDietPicker((v) => !v)}>
                  Manage Diet Codes
                </Button>
              )
            }
          >
            {store.dietCodes.length === 0 ? (
              <EmptyState icon={<Apple size={22} />} title="No diet codes assigned" description="Active dietary orders will appear here." className="py-6" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {store.dietCodes.map((d) => {
                  const c = TONE.info;
                  return (
                    <span
                      key={d.code}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px]"
                      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}
                    >
                      <b className="font-extrabold">{d.code}</b> — {d.label}
                      {canManage && (
                        <button
                          onClick={() => askConfirm("Remove diet code", `Remove the diet code "${d.code} — ${d.label}"?`, () => nurseActions.removeDietCode(d.code))}
                          aria-label={`Remove ${d.code}`}
                          className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] cursor-pointer"
                          style={{ color: c.fg }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {canManage && showDietPicker && (
              <div className="mt-4 pt-4 border-t border-[#eef1f6]">
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#6B7280] mb-2">Add diet code (Food Management)</p>
                {inactiveDiets.length === 0 ? (
                  <p className="text-[12.5px] text-[#6B7280]">All available diet codes are already active.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {inactiveDiets.map((diet: any) => (
                      <button
                        key={diet.code}
                        onClick={() => nurseActions.addDietCode(diet.code, diet.label)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-white text-[#16274D] border border-dashed border-[#d5deea] hover:bg-[#f4f8fc] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] cursor-pointer text-left"
                      >
                        <Plus size={13} /> <b className="font-extrabold">{diet.code}</b> — {diet.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Care Team */}
          <SectionCard
            icon={<Users size={18} />}
            title="Care Team"
            subtitle="Assigned clinicians for this patient"
            actions={
              canManage && (
                <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setStaffPickerOpen(true)}>
                  Add member
                </Button>
              )
            }
          >
            {store.careTeam.length === 0 ? (
              <EmptyState
                icon={<Users size={22} />}
                title="No care team members"
                description="Assign nurses and doctors to this patient."
                action={canManage ? <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setStaffPickerOpen(true)}>Add member</Button> : undefined}
                className="py-6"
              />
            ) : (
              <div className="space-y-2.5">
                {store.careTeam.map((m) => {
                  const isDoctor = m.roleKey === "care.team.attendingDoctor";
                  // Keep attending-doctor name synced with PV1 doctor section
                  const memberName =
                    isDoctor && store.patient.attendingDoctorFirstName && store.patient.attendingDoctorLastName
                      ? `Dr. ${store.patient.attendingDoctorFirstName} ${store.patient.attendingDoctorLastName}`
                      : tr(m.nameKey);

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border border-[#eef1f6] bg-[#fafbfc]"
                    >
                      {/* Avatar with INITIALS (no photos) */}
                      <Avatar initials={initialsOf(memberName)} tone={isDoctor ? "neutral" : "info"} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-[#16274D] truncate">{memberName}</p>
                        <p className="text-[12px] font-semibold" style={{ color: isDoctor ? TONE.neutral.fg : TONE.info.fg }}>
                          {tr(m.roleKey)}
                        </p>
                      </div>

                      {/* Patient Visible status */}
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge tone={m.visible ? "success" : "neutral"} dot>
                          {m.visible ? "Patient Visible" : "Hidden"}
                        </StatusBadge>
                        {canManage && (
                          <>
                            <Toggle
                              size="sm"
                              checked={m.visible}
                              onChange={() => nurseActions.toggleCareTeamMemberVisibility(m.id)}
                              label={`Patient visibility for ${memberName}`}
                            />
                            <MemberMenu
                              visible={m.visible}
                              onToggleVisibility={() => nurseActions.toggleCareTeamMemberVisibility(m.id)}
                              onRemove={() =>
                                askConfirm("Remove from team", `Remove ${memberName} from the care team?`, () => nurseActions.removeCareTeamMember(m.id))
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT COLUMN ------------------------------------------------ */}
        <div className="space-y-4 min-w-0">
          {/* Patient Visibility — master control */}
          <VisibilityControl
            checked={store.sectionVisibility.careOverview}
            onChange={(v: boolean) => nurseActions.setSectionVisible("careOverview", v)}
            disabled={!isNurse}
            title="Show on Patient Terminal"
            description="Controls whether the Care Overview section — allergies, diet, and visible care team — appears on the bedside terminal."
            scope="Care Overview"
            languages="English · العربية"
          />

          {/* Data Sources */}
          <SectionCard icon={<Shield size={18} />} title="Data Sources">
            <SyncStatus
              rows={[
                { label: "Care Team", source: "Hospital EMR", status: "Synced", tone: "success" },
                { label: "Diet Codes", source: "Food Management", status: "Synced", tone: "success" },
                { label: "Allergies", source: "Hospital EMR", status: "Synced", tone: "success" },
              ]}
              lastSync={DEV_LAST_SYNC}
            />
          </SectionCard>
        </div>
      </div>

      {/* Staff picker modal */}
      {staffPickerOpen && (
        <StaffPickerModal onClose={() => setStaffPickerOpen(false)} onPick={handlePickStaff} alreadyInTeam={alreadyInTeam} />
      )}

      {/* Shared confirm dialog for destructive removes */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
        }}
      />
    </div>
  );
}
