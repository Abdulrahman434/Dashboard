import { useState } from "react";
import {
  User, FileText, HeartHandshake, ShieldCheck, Users, MapPin, Calendar,
  Building, FileCode, Stethoscope, Save, X, Pencil, Info, ChevronRight,
  IdCard, CheckCircle2, ExternalLink,
} from "lucide-react";
import { useNurseStore, nurseActions, type PatientProfile } from "../../NurseDataStore";
import { StatusBadge, DefinitionField, Button, ConfirmDialog, cx } from "../ui";

type SubTabKey = "profile" | "visit" | "nok" | "insurance";

/* HL7 / HIS-sourced keys render locked. firstName / lastName are auto-derived
   from the English full name. Everything else is nurse-editable. Kind chips are
   hidden in this tab (showKind=false) to match the EMR design. */
const HIS_KEYS = new Set<keyof PatientProfile>([
  "mrn", "visitNumber", "identifierType",
  "admissionDate", "dischargeDate", "evnRecordedDate", "evnPlannedDate",
  "patientClass", "admissionType", "admitSource", "patientType",
  "hospitalService", "financialClassCode", "accountStatus", "vipIndicator",
  "servicingFacility",
  "room", "bed", "extension",
  "eventTypeOptions", "eventReasonCode", "sendingApp", "sendingFacility",
  "receivingApp", "receivingFacility", "messageControlId", "processingId",
  "hl7Version", "security",
  "attendingDoctorId", "attendingDoctorFirstName", "attendingDoctorLastName",
  "attendingDoctorDegree", "attendingDoctorSourceTable",
  "referringDoctorId", "referringDoctorFirstName", "referringDoctorLastName",
  "referringDoctorDegree", "referringDoctorSourceTable",
  "admittingDoctorId", "admittingDoctorFirstName", "admittingDoctorLastName",
  "admittingDoctorDegree", "admittingDoctorSourceTable",
  "consultingDoctorId", "consultingDoctorFirstName", "consultingDoctorLastName",
  "consultingDoctorDegree", "consultingDoctorSourceTable",
] as any);

const DERIVED_KEYS = new Set<keyof PatientProfile>(["firstName", "lastName"] as any);

const SECTIONS: { value: SubTabKey; label: string; icon: any; title: string; subtitle: string }[] = [
  { value: "profile", label: "Patient Profile", icon: <User size={17} />, title: "Patient Profile", subtitle: "Identity and demographic information received from the hospital EMR." },
  { value: "visit", label: "Patient Visit (PV)", icon: <FileText size={17} />, title: "Patient Visit", subtitle: "Visit classification, dates, and assigned location from the hospital EMR." },
  { value: "nok", label: "Next of Kin (NK)", icon: <HeartHandshake size={17} />, title: "Next of Kin", subtitle: "Emergency contact and next-of-kin details on record." },
  { value: "insurance", label: "Insurance", icon: <ShieldCheck size={17} />, title: "Insurance", subtitle: "Coverage, policy, and pre-authorization information." },
];

export function PatientProfileTab({ role }: { role: "nurse" | "doctor" }) {
  const store = useNurseStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>("profile");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PatientProfile>(store.patient);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<null | (() => void)>(null);

  const isReadOnly = role === "doctor";
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(store.patient);
  const current = SECTIONS.find((s) => s.value === activeSubTab)!;

  const handleFullNameChange = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const first = parts[0] || "";
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
    setDraft((prev) => ({ ...prev, name: val, firstName: first, lastName: last }));
  };

  const handleSave = () => {
    nurseActions.updatePatientFromNurse(draft);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };
  const doCancel = () => { setDraft(store.patient); setEditing(false); };
  const guard = (action: () => void) => {
    if (dirty) { setPending(() => action); setConfirmOpen(true); } else action();
  };
  const startEdit = () => { setDraft(store.patient); setEditing(true); };

  const kindOf = (key: keyof PatientProfile) =>
    DERIVED_KEYS.has(key) ? "derived" : HIS_KEYS.has(key) ? "his" : "editable";

  /* Single field renderer bound to store (read) / draft (edit). No kind chip,
     "Not available" for empties — matches the EMR design. */
  const F = (
    key: keyof PatientProfile,
    label: string,
    opts: { type?: "text" | "date" | "select" | "textarea"; options?: string[]; rtl?: boolean; span?: number; onChange?: (v: string) => void } = {},
  ) => {
    const value = editing ? (draft[key] as any) : (store.patient[key] as any);
    return (
      <DefinitionField
        key={key as string}
        label={label}
        value={value}
        kind={kindOf(key)}
        showKind={false}
        emptyText="Not available"
        editing={editing}
        canEdit={!isReadOnly}
        type={opts.type}
        options={opts.options}
        rtl={opts.rtl}
        span={opts.span}
        onChange={opts.onChange ?? ((v: string) => setDraft((prev) => ({ ...prev, [key]: v })))}
      />
    );
  };

  /* Field group inside the content card: icon + title + divider + grid. */
  const Group = ({ icon, title, cols = 3, children }: any) => (
    <div className="py-6 border-t border-[#eef1f6] first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#4EBEE3]">{icon}</span>
        <h3 className="text-[15px] font-bold text-[#16274D] font-['Poppins',sans-serif]">{title}</h3>
      </div>
      <div className="grid gap-x-8 gap-y-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {children}
      </div>
    </div>
  );

  const p = store.patient;
  const roomBed = p.room ? `${p.room}${p.bed ? ` · Bed ${p.bed}` : ""}` : "";

  return (
    <div className="font-['Poppins',sans-serif] grid grid-cols-1 lg:grid-cols-[264px_1fr] gap-5 items-stretch">
      {/* ── Left: Profile Sections nav ── */}
      <aside className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 flex flex-col self-start lg:self-stretch">
        <h3 className="text-[15px] font-bold text-[#16274D] mb-3 px-1">Profile Sections</h3>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => {
            const on = activeSubTab === s.value;
            return (
              <button
                key={s.value}
                onClick={() => guard(() => setActiveSubTab(s.value))}
                aria-current={on ? "page" : undefined}
                className={cx(
                  "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3]",
                  on ? "bg-[#eaf7fc] text-[#1d7da3]" : "text-[#16274D] hover:bg-[#f4f8fc]",
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={on ? "text-[#1d7da3]" : "text-[#98a2b3]"}>{s.icon}</span>
                  <span className="text-[13.5px] font-semibold truncate">{s.label}</span>
                </span>
                <ChevronRight size={16} className={on ? "text-[#1d7da3]" : "text-[#c2c9d4]"} />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Right: content card ── */}
      <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 min-w-0">
        <header className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold text-[#16274D] leading-tight">{current.title}</h2>
            <p className="text-[13.5px] text-[#6B7280] mt-1">{current.subtitle}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {saved
              ? <StatusBadge tone="success" icon={<CheckCircle2 size={14} />}>Changes saved</StatusBadge>
              : <StatusBadge tone="success" icon={<CheckCircle2 size={14} />}>EMR Synced</StatusBadge>}
            {!isReadOnly && (editing ? (
              <>
                <Button variant="primary" icon={<Save size={15} />} onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" icon={<X size={15} />} onClick={() => guard(doCancel)}>Cancel</Button>
              </>
            ) : (
              <Button variant="secondary" icon={<Pencil size={15} />} onClick={startEdit}>Edit Profile</Button>
            ))}
          </div>
        </header>

        {/* ── PATIENT PROFILE ── */}
        {activeSubTab === "profile" && (
          <>
            <Group icon={<User size={17} />} title="Basic Information" cols={3}>
              {F("name", "Full Name (English)", { onChange: handleFullNameChange })}
              {F("nameAr", "Full Name (Arabic)", { rtl: true })}
              {F("age", "Age")}
              {F("sex", "Gender", { type: "select", options: ["Female", "Male"] })}
              {F("dob", "Date of Birth", { type: "date" })}
              {F("prefix", "Prefix", { type: "select", options: ["Dr", "Mr", "Ms", "Mrs"] })}
              {F("suffix", "Suffix")}
              {F("degree", "Degree")}
            </Group>

            <Group icon={<IdCard size={17} />} title="Patient Identifiers" cols={3}>
              {F("mrn", "MRN")}
              {F("visitNumber", "Visit / Account Number")}
              {F("identifierType", "Identifier Type", { type: "select", options: ["MRN", "SSN", "National ID"] })}
              {F("ssn", "SSN / National ID")}
            </Group>

            <Group icon={<Calendar size={17} />} title="Current Admission" cols={4}>
              {F("admissionDate", "Admission Date")}
              {F("dischargeDate", "Expected Discharge")}
              <div className="min-w-0">
                <div className="text-[11.5px] font-semibold text-[#6B7280] mb-1">Room &amp; Bed</div>
                <div className={cx("text-[14px] font-semibold", roomBed ? "text-[#16274D]" : "text-[#9aa4b2] italic font-normal")}>
                  {roomBed || "Not available"}
                </div>
              </div>
              {F("roomType", "Room Type")}
            </Group>

            <Group icon={<Users size={17} />} title="Demographics" cols={3}>
              {F("maritalStatus", "Marital Status", { type: "select", options: ["Single", "Married", "Divorced", "Widowed"] })}
              {F("religion", "Religion")}
              {F("nationalityText", "Nationality")}
              {F("languageText", "Language")}
              {F("citizenship", "Citizenship")}
              {F("birthPlace", "Birth Place")}
            </Group>

            <Group icon={<MapPin size={17} />} title="Contact Information" cols={3}>
              {F("contact", "Contact Number")}
              {F("email", "Email")}
              {F("businessPhone", "Business Phone")}
              {F("streetAddress", "Street Address", { span: 2 })}
              {F("city", "City")}
              {F("emergencyName", "Emergency Contact Name")}
              {F("emergencyContact", "Emergency Contact Number")}
            </Group>
          </>
        )}

        {/* ── PATIENT VISIT ── */}
        {activeSubTab === "visit" && (
          <>
            <Group icon={<FileText size={17} />} title="Visit Classification (PV1)" cols={4}>
              {F("patientClass", "Patient Class", { type: "select", options: ["Inpatient", "Outpatient", "Emergency", "Preadmit"] })}
              {F("admissionType", "Admission Type", { type: "select", options: ["Elective", "Emergency", "Urgent", "Newborn"] })}
              {F("admitSource", "Admit Source")}
              {F("patientType", "Patient Type")}
              {F("hospitalService", "Hospital Service")}
              {F("financialClassCode", "Financial Class Code")}
              {F("accountStatus", "Account Status")}
              {F("vipIndicator", "VIP Indicator", { type: "select", options: ["Y", "N"] })}
              {F("servicingFacility", "Servicing Facility", { span: 2 })}
            </Group>

            <Group icon={<Calendar size={17} />} title="Dates" cols={2}>
              {F("admissionDate", "Admission Date/Time")}
              {F("dischargeDate", "Discharge Date/Time")}
              {F("evnRecordedDate", "EVN Recorded Date/Time")}
              {F("evnPlannedDate", "EVN Planned Event Date/Time")}
            </Group>

            <Group icon={<FileText size={17} />} title="Visit Narrative (PV2)" cols={4}>
              {F("admitReason", "Admit Reason", { type: "textarea", span: 4 })}
              {F("visitDescription", "Visit Description", { type: "textarea", span: 4 })}
              {F("transferReason", "Transfer Reason", { span: 2 })}
              {F("dischargeDisposition", "Discharge Disposition", { span: 2 })}
              {F("dietType", "Diet Type", { span: 2 })}
              {F("bedStatus", "Bed Status", { span: 2 })}
              {F("patientConditionCode", "Patient Condition Code", { span: 2 })}
              {F("visitPriorityCode", "Visit Priority Code", { span: 2 })}
              {F("patientStatusCode", "Patient Status Code", { span: 2 })}
              {F("admissionLevelOfCare", "Admission Level of Care", { span: 2 })}
              {F("modeOfArrival", "Mode of Arrival", { span: 2 })}
              {F("newbornIndicator", "Newborn Indicator", { type: "select", options: ["Y", "N"], span: 2 })}
              {F("estLengthOfStay", "Est. Length of Stay (HL7 DT)", { span: 2 })}
              {F("actualLengthOfStay", "Actual Length of Stay (HL7 DT)", { span: 2 })}
            </Group>

            <Group icon={<Building size={17} />} title="Assigned Location" cols={4}>
              {F("room", "Room")}
              {F("bed", "Bed")}
              {F("extension", "Extension")}
              {F("roomType", "Room Type")}
            </Group>

            <Group icon={<FileCode size={17} />} title="Message Header (MSH / EVN)" cols={4}>
              {F("eventTypeOptions", "Event Type Code")}
              {F("eventReasonCode", "Event Reason Code")}
              {F("sendingApp", "Sending Application")}
              {F("sendingFacility", "Sending Facility")}
              {F("receivingApp", "Receiving Application")}
              {F("receivingFacility", "Receiving Facility")}
              {F("messageControlId", "Message Control ID")}
              {F("processingId", "Processing ID")}
              {F("hl7Version", "HL7 Version")}
              {F("security", "Security")}
            </Group>

            <Group icon={<Stethoscope size={17} />} title="Attending Doctor (PV1-7)" cols={5}>
              {F("attendingDoctorId", "ID")}
              {F("attendingDoctorFirstName", "First Name")}
              {F("attendingDoctorLastName", "Last Name")}
              {F("attendingDoctorDegree", "Degree")}
              {F("attendingDoctorSourceTable", "Source Table")}
            </Group>
            <Group icon={<Stethoscope size={17} />} title="Referring Doctor (PV1-8)" cols={5}>
              {F("referringDoctorId", "ID")}
              {F("referringDoctorFirstName", "First Name")}
              {F("referringDoctorLastName", "Last Name")}
              {F("referringDoctorDegree", "Degree")}
              {F("referringDoctorSourceTable", "Source Table")}
            </Group>
            <Group icon={<Stethoscope size={17} />} title="Admitting Doctor (PV1-17)" cols={5}>
              {F("admittingDoctorId", "ID")}
              {F("admittingDoctorFirstName", "First Name")}
              {F("admittingDoctorLastName", "Last Name")}
              {F("admittingDoctorDegree", "Degree")}
              {F("admittingDoctorSourceTable", "Source Table")}
            </Group>
            <Group icon={<Stethoscope size={17} />} title="Consulting Doctor (PV1-9)" cols={5}>
              {F("consultingDoctorId", "ID")}
              {F("consultingDoctorFirstName", "First Name")}
              {F("consultingDoctorLastName", "Last Name")}
              {F("consultingDoctorDegree", "Degree")}
              {F("consultingDoctorSourceTable", "Source Table")}
            </Group>
          </>
        )}

        {/* ── NEXT OF KIN ── */}
        {activeSubTab === "nok" && (
          <Group icon={<HeartHandshake size={17} />} title="Next of Kin Details (NK1)" cols={4}>
            {F("nkSetId", "Set ID")}
            {F("nkFirstName", "First Name")}
            {F("nkLastName", "Last Name")}
            {F("nkRelationship", "Relationship", { type: "select", options: ["Brother", "Sister", "Spouse", "Parent", "Child", "Relative", "Friend", "Guardian"] })}
            {F("nkPhone", "Primary Phone Number", { span: 2 })}
            {F("nkAltPhone", "Secondary / Alt Phone", { span: 2 })}
            {F("nkEmail", "Email Address", { span: 2 })}
            {F("nkJobTitle", "Occupation / Job Title", { span: 2 })}
            {F("nkAddress", "Street Address", { span: 2 })}
            {F("nkCity", "City")}
            {F("nkState", "State / Province")}
            {F("nkZip", "Zip / Postal Code")}
            {F("nkEmergencyFlag", "Emergency Contact Flag", { type: "select", options: ["Yes", "No"] })}
          </Group>
        )}

        {/* ── INSURANCE ── */}
        {activeSubTab === "insurance" && (
          <Group icon={<ShieldCheck size={17} />} title="Insurance Information (IN1)" cols={4}>
            {F("insCompanyId", "Insurance Company ID")}
            {F("insName", "Insurance Company Name", { span: 2 })}
            {F("insGroupName", "Insured Group Name")}
            {F("insType", "Insurance Plan Type", { type: "select", options: ["Silver A", "Gold", "Platinum", "VIP", "Standard"], span: 2 })}
            {F("insPolicyNumber", "Policy / Plan ID Number", { span: 2 })}
            {F("insGroupNumber", "Account / Group Number", { span: 2 })}
            {F("insEffectiveDate", "Effective Date", { type: "date", span: 2 })}
            {F("insExpiryDate", "Expiry Date", { span: 2 })}
            {F("insPolicyHolderName", "Policyholder Name", { span: 2 })}
            {F("insRelationship", "Relationship to Insured", { type: "select", options: ["Self", "Spouse", "Child", "Dependent"], span: 2 })}
            {F("insPreAuthCode", "Pre-Authorization Code", { span: 2 })}
          </Group>
        )}

        {/* Footer banner */}
        <div className="mt-6 flex items-start gap-2 rounded-[10px] border border-[#bfe6f3] bg-[#f5fcff] px-4 py-3 text-[12.5px] text-[#1d5a72]">
          <Info size={15} className="mt-0.5 shrink-0 text-[#4EBEE3]" />
          <span>Patient identity is synchronized from the hospital EMR. Edit permissions depend on your assigned role.</span>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Discard unsaved changes?"
        message="You have unsaved edits to this patient. Leaving now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => { pending?.(); setPending(null); setConfirmOpen(false); }}
        onCancel={() => { setPending(null); setConfirmOpen(false); }}
      />
    </div>
  );
}
