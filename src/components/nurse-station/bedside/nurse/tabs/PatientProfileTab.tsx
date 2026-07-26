import { useState } from "react";
import {
  User, Save, CheckCircle2, ChevronDown, ChevronUp, Users, MapPin,
  FileText, ShieldCheck, HeartHandshake, Stethoscope, Building, Calendar, FileCode
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useNurseStore, nurseActions, type PatientProfile } from "../../NurseDataStore";

type SubTabKey = "profile" | "visit" | "nok" | "insurance";

export function PatientProfileTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const store = useNurseStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>("profile");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PatientProfile>(store.patient);
  const [saved, setSaved] = useState(false);
  
  // Collapsible section states
  const [pidOpen, setPidOpen] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  
  // Visit section collapsibles
  const [pv1Open, setPv1Open] = useState(true);
  const [datesOpen, setDatesOpen] = useState(true);
  const [pv2Open, setPv2Open] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [mshOpen, setMshOpen] = useState(false);
  const [pv1DoctorOpen, setPv1DoctorOpen] = useState(true);

  // NK & Insurance section collapsibles
  const [nkOpen, setNkOpen] = useState(true);
  const [insOpen, setInsOpen] = useState(true);

  const isReadOnly = role === "doctor";

  // Automatically split full name into first and last name when changed
  const handleFullNameChange = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const first = parts[0] || "";
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
    setDraft((prev) => ({
      ...prev,
      name: val,
      firstName: first,
      lastName: last,
    }));
  };

  const handleSave = () => {
    nurseActions.updatePatientFromNurse(draft);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setDraft(store.patient);
    setEditing(false);
  };

  const getSpanClass = (span: number) => {
    if (span === 2) return "col-span-1 sm:col-span-2 lg:col-span-2";
    if (span === 3) return "col-span-1 sm:col-span-2 lg:col-span-3";
    if (span === 4) return "col-span-1 sm:col-span-2 lg:col-span-4";
    return "col-span-1";
  };

  // Centralized field renderer
  const renderField = ({
    fieldKey,
    label,
    span = 1,
    type = "text",
    options = null,
    readOnly = false,
    rows = 2,
    customOnChange = null,
  }: {
    fieldKey: keyof PatientProfile;
    label: string;
    span?: number;
    type?: "text" | "date" | "select" | "textarea";
    options?: string[] | null;
    readOnly?: boolean;
    rows?: number;
    customOnChange?: ((val: string) => void) | null;
  }) => {
    const value = editing ? (draft[fieldKey] || "") : (store.patient[fieldKey] || "");

    return (
      <div key={fieldKey} className={getSpanClass(span)}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: t.textMuted,
              margin: 0,
            }}
          >
            {label} {readOnly && <span className="text-[11px] text-gray-400 font-normal">(Auto-derived)</span>}
          </label>
        </div>
        {editing ? (
          readOnly ? (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "14px",
                fontWeight: 600,
                color: t.textMuted,
                backgroundColor: "#F3F4F6",
                border: `1px solid ${t.borderDefault}`,
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                cursor: "not-allowed",
              }}
            >
              {value || "—"}
            </div>
          ) : type === "textarea" ? (
            <textarea
              rows={rows}
              value={value}
              onChange={(e) => {
                if (customOnChange) customOnChange(e.target.value);
                else setDraft({ ...draft, [fieldKey]: e.target.value });
              }}
              className="w-full outline-none transition-all resize-none"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "14px",
                fontWeight: 600,
                color: t.textHeading,
                border: `1.5px solid ${t.borderDefault}`,
                backgroundColor: t.surface,
              }}
              onFocus={(e) => (e.target.style.borderColor = t.primary)}
              onBlur={(e) => (e.target.style.borderColor = t.borderDefault)}
            />
          ) : type === "select" ? (
            <select
              value={value}
              onChange={(e) => {
                if (customOnChange) customOnChange(e.target.value);
                else setDraft({ ...draft, [fieldKey]: e.target.value });
              }}
              className="w-full outline-none transition-all"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "14px",
                fontWeight: 600,
                color: t.textHeading,
                border: `1.5px solid ${t.borderDefault}`,
                backgroundColor: t.surface,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              <option value="">Select...</option>
              {options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => {
                if (customOnChange) customOnChange(e.target.value);
                else setDraft({ ...draft, [fieldKey]: e.target.value });
              }}
              className="w-full outline-none transition-all"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "14px",
                fontWeight: 600,
                color: t.textHeading,
                border: `1.5px solid ${t.borderDefault}`,
                backgroundColor: t.surface,
                minHeight: "44px",
              }}
              onFocus={(e) => (e.target.style.borderColor = t.primary)}
              onBlur={(e) => (e.target.style.borderColor = t.borderDefault)}
            />
          )
        ) : (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: "14px",
              fontWeight: 600,
              color: value ? t.textHeading : t.textMuted,
              backgroundColor: readOnly ? "#F3F4F6" : "#F9FAFB",
              border: `1px solid ${t.borderDefault}`,
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {value || "—"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nurse-card">
      {/* Main Header & Edit Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: t.textHeading, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <User size={20} style={{ color: t.primary }} /> Patient Profile Management
        </h3>
        {!isReadOnly && !editing && (
          <button
            onClick={() => {
              setDraft(store.patient);
              setEditing(true);
            }}
            className="px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95 hover:brightness-95"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: t.primary,
              backgroundColor: t.primarySubtle,
              border: "none",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* ── Sub-Section Tab Bar ── */}
      <div className="flex items-center gap-2 mb-6 p-1.5 rounded-xl bg-gray-100/80 border border-gray-200 overflow-x-auto">
        {[
          { key: "profile", label: "Patient Profile", icon: User },
          { key: "visit", label: "Patient Visit (PV)", icon: FileText },
          { key: "nok", label: "Next of Kin (NK)", icon: HeartHandshake },
          { key: "insurance", label: "Insurance", icon: ShieldCheck },
        ].map((tab) => {
          const active = activeSubTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as SubTabKey)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: active ? "#ffffff" : "transparent",
                color: active ? t.primary : t.textMuted,
                boxShadow: active ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                border: "none",
              }}
            >
              <Icon size={15} style={{ color: active ? t.primary : t.textMuted }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── SUB-TAB 1: PATIENT PROFILE ── */}
      {activeSubTab === "profile" && (
        <>
          {/* SECTION 1: Patient Identity (PID) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPidOpen(!pidOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <User size={18} className="text-blue-500" /> Patient Identity (PID)
              </span>
              {pidOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            
            {pidOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "name", label: "Full Name (English)", span: 2, customOnChange: handleFullNameChange })}
                {renderField({ fieldKey: "nameAr", label: "Full Name (Arabic)", span: 2 })}
                {renderField({ fieldKey: "firstName", label: "First Name", span: 1, readOnly: true })}
                {renderField({ fieldKey: "middleName", label: "Middle Name", span: 1 })}
                {renderField({ fieldKey: "lastName", label: "Last Name", span: 1, readOnly: true })}
                {renderField({ fieldKey: "prefix", label: "Prefix", span: 1, type: "select", options: ["Dr", "Mr", "Ms", "Mrs"] })}
                {renderField({ fieldKey: "suffix", label: "Suffix", span: 1 })}
                {renderField({ fieldKey: "degree", label: "Degree", span: 1 })}
                {renderField({ fieldKey: "dob", label: "Date of Birth", span: 1, type: "date" })}
                {renderField({ fieldKey: "sex", label: "Gender", span: 1, type: "select", options: ["Female", "Male"] })}
                {renderField({ fieldKey: "age", label: "Age", span: 1 })}
                {renderField({ fieldKey: "mrn", label: "MRN", span: 1 })}
                {renderField({ fieldKey: "visitNumber", label: "Visit / Account Number", span: 1 })}
                {renderField({ fieldKey: "identifierType", label: "Identifier Type", span: 1, type: "select", options: ["MRN", "SSN", "National ID"] })}
                {renderField({ fieldKey: "ssn", label: "SSN / National ID", span: 1 })}
                {renderField({ fieldKey: "admissionDate", label: "Admission Date", span: 2 })}
                {renderField({ fieldKey: "dischargeDate", label: "Expected Discharge", span: 2 })}
              </div>
            )}
          </div>

          {/* SECTION 2: Demographics */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setDemoOpen(!demoOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <Users size={18} className="text-indigo-500" /> Demographics
              </span>
              {demoOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            
            {demoOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "race", label: "Race", span: 1 })}
                {renderField({ fieldKey: "religion", label: "Religion", span: 1 })}
                {renderField({ fieldKey: "ethnicGroup", label: "Ethnic Group", span: 1 })}
                {renderField({ fieldKey: "maritalStatus", label: "Marital Status", span: 1, type: "select", options: ["Single", "Married", "Divorced", "Widowed"] })}
                {renderField({ fieldKey: "citizenship", label: "Citizenship", span: 1 })}
                {renderField({ fieldKey: "birthPlace", label: "Birth Place", span: 1 })}
                {renderField({ fieldKey: "languageCode", label: "Language (Code)", span: 1 })}
                {renderField({ fieldKey: "languageText", label: "Language (Text)", span: 1 })}
                {renderField({ fieldKey: "nationalityCode", label: "Nationality (Code)", span: 1 })}
                {renderField({ fieldKey: "nationalityText", label: "Nationality (Text)", span: 1 })}
                {renderField({ fieldKey: "multipleBirthIndicator", label: "Multiple Birth Indicator", span: 1, type: "select", options: ["Y", "N"] })}
                {renderField({ fieldKey: "birthOrder", label: "Birth Order", span: 1, type: "select", options: ["1", "2", "3", "4", "5"] })}
              </div>
            )}
          </div>

          {/* SECTION 3: Contact & Address */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setContactOpen(!contactOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <MapPin size={18} className="text-teal-500" /> Contact & Address
              </span>
              {contactOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            
            {contactOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "contact", label: "Contact Number", span: 2 })}
                {renderField({ fieldKey: "homePhone", label: "Home Phone", span: 1 })}
                {renderField({ fieldKey: "businessPhone", label: "Business Phone", span: 1 })}
                {renderField({ fieldKey: "email", label: "Email", span: 2 })}
                {renderField({ fieldKey: "streetAddress", label: "Street Address", span: 2 })}
                {renderField({ fieldKey: "city", label: "City", span: 1 })}
                {renderField({ fieldKey: "state", label: "State / Province", span: 1 })}
                {renderField({ fieldKey: "zipCode", label: "Zip / Postal Code", span: 1 })}
                {renderField({ fieldKey: "emergencyName", label: "Emergency Contact Name", span: 2 })}
                {renderField({ fieldKey: "emergencyContact", label: "Emergency Contact Number", span: 2 })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SUB-TAB 2: PATIENT VISIT (PV) ── */}
      {activeSubTab === "visit" && (
        <>
          {/* Visit Classification (PV1) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPv1Open(!pv1Open)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <FileText size={18} className="text-blue-500" /> Visit Classification (PV1)
              </span>
              {pv1Open ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {pv1Open && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "patientClass", label: "Patient Class", span: 1, type: "select", options: ["Inpatient", "Outpatient", "Emergency", "Preadmit"] })}
                {renderField({ fieldKey: "admissionType", label: "Admission Type", span: 1, type: "select", options: ["Elective", "Emergency", "Urgent", "Newborn"] })}
                {renderField({ fieldKey: "admitSource", label: "Admit Source", span: 1 })}
                {renderField({ fieldKey: "patientType", label: "Patient Type", span: 1 })}
                {renderField({ fieldKey: "hospitalService", label: "Hospital Service", span: 1 })}
                {renderField({ fieldKey: "financialClassCode", label: "Financial Class Code", span: 1 })}
                {renderField({ fieldKey: "accountStatus", label: "Account Status", span: 1 })}
                {renderField({ fieldKey: "vipIndicator", label: "VIP Indicator", span: 1, type: "select", options: ["Y", "N"] })}
                {renderField({ fieldKey: "servicingFacility", label: "Servicing Facility", span: 2 })}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setDatesOpen(!datesOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <Calendar size={18} className="text-purple-500" /> Dates
              </span>
              {datesOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {datesOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "admissionDate", label: "Admission Date/Time", span: 2 })}
                {renderField({ fieldKey: "dischargeDate", label: "Discharge Date/Time", span: 2 })}
                {renderField({ fieldKey: "evnRecordedDate", label: "EVN Recorded Date/Time", span: 2 })}
                {renderField({ fieldKey: "evnPlannedDate", label: "EVN Planned Event Date/Time", span: 2 })}
              </div>
            )}
          </div>

          {/* Visit Narrative (PV2) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPv2Open(!pv2Open)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <FileText size={18} className="text-teal-500" /> Visit Narrative (PV2)
              </span>
              {pv2Open ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {pv2Open && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "admitReason", label: "Admit Reason", span: 4, type: "textarea", rows: 2 })}
                {renderField({ fieldKey: "visitDescription", label: "Visit Description", span: 4, type: "textarea", rows: 2 })}
                {renderField({ fieldKey: "transferReason", label: "Transfer Reason", span: 2 })}
                {renderField({ fieldKey: "dischargeDisposition", label: "Discharge Disposition", span: 2 })}
                {renderField({ fieldKey: "dietType", label: "Diet Type", span: 2 })}
                {renderField({ fieldKey: "bedStatus", label: "Bed Status", span: 2 })}
                {renderField({ fieldKey: "patientConditionCode", label: "Patient Condition Code", span: 2 })}
                {renderField({ fieldKey: "visitPriorityCode", label: "Visit Priority Code", span: 2 })}
                {renderField({ fieldKey: "patientStatusCode", label: "Patient Status Code", span: 2 })}
                {renderField({ fieldKey: "admissionLevelOfCare", label: "Admission Level of Care", span: 2 })}
                {renderField({ fieldKey: "modeOfArrival", label: "Mode of Arrival", span: 2 })}
                {renderField({ fieldKey: "newbornIndicator", label: "Newborn Indicator", span: 2, type: "select", options: ["Y", "N"] })}
                {renderField({ fieldKey: "estLengthOfStay", label: "Est. Length of Stay (HL7 DT)", span: 2 })}
                {renderField({ fieldKey: "actualLengthOfStay", label: "Actual Length of Stay (HL7 DT)", span: 2 })}
              </div>
            )}
          </div>

          {/* Assigned Location */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setLocationOpen(!locationOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <Building size={18} className="text-emerald-500" /> Assigned Location
              </span>
              {locationOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {locationOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "room", label: "Room", span: 1, readOnly: true })}
                {renderField({ fieldKey: "bed", label: "Bed", span: 1, readOnly: true })}
                {renderField({ fieldKey: "extension", label: "Extension", span: 1, readOnly: true })}
                {renderField({ fieldKey: "roomType", label: "Room Type", span: 1 })}
              </div>
            )}
          </div>

          {/* Message Header (MSH / EVN) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setMshOpen(!mshOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <FileCode size={18} className="text-amber-500" /> Message Header (MSH / EVN)
              </span>
              {mshOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {mshOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                {renderField({ fieldKey: "eventTypeOptions", label: "Event Type Code", span: 1 })}
                {renderField({ fieldKey: "eventReasonCode", label: "Event Reason Code", span: 1 })}
                {renderField({ fieldKey: "sendingApp", label: "Sending Application", span: 1 })}
                {renderField({ fieldKey: "sendingFacility", label: "Sending Facility", span: 1 })}
                {renderField({ fieldKey: "receivingApp", label: "Receiving Application", span: 1 })}
                {renderField({ fieldKey: "receivingFacility", label: "Receiving Facility", span: 1 })}
                {renderField({ fieldKey: "messageControlId", label: "Message Control ID", span: 1 })}
                {renderField({ fieldKey: "processingId", label: "Processing ID", span: 1 })}
                {renderField({ fieldKey: "hl7Version", label: "HL7 Version", span: 1 })}
                {renderField({ fieldKey: "security", label: "Security", span: 1 })}
              </div>
            )}
          </div>

          {/* PV1 Doctors */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPv1DoctorOpen(!pv1DoctorOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
            >
              <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
                <Stethoscope size={18} className="text-cyan-500" /> PV1 Doctors
              </span>
              {pv1DoctorOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
            </button>
            {pv1DoctorOpen && (
              <div className="mt-4 p-4 rounded-xl border flex flex-col gap-6" style={{ borderColor: t.borderSubtle }}>
                {/* Attending Doctor */}
                <div>
                  <h4 className="text-[13px] font-bold mb-3 flex items-center gap-2" style={{ color: t.textHeading }}>
                    <span className="w-1.5 h-3 rounded bg-blue-500 inline-block" /> ATTENDING DOCTOR (PV1-7)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {renderField({ fieldKey: "attendingDoctorId", label: "ID", span: 1 })}
                    {renderField({ fieldKey: "attendingDoctorFirstName", label: "First Name", span: 1 })}
                    {renderField({ fieldKey: "attendingDoctorLastName", label: "Last Name", span: 1 })}
                    {renderField({ fieldKey: "attendingDoctorDegree", label: "Degree", span: 1 })}
                    {renderField({ fieldKey: "attendingDoctorSourceTable", label: "Source Table", span: 1 })}
                  </div>
                </div>

                {/* Referring Doctor */}
                <div className="pt-4 border-t" style={{ borderColor: t.borderSubtle }}>
                  <h4 className="text-[13px] font-bold mb-3 flex items-center gap-2" style={{ color: t.textHeading }}>
                    <span className="w-1.5 h-3 rounded bg-purple-500 inline-block" /> REFERRING DOCTOR (PV1-8)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {renderField({ fieldKey: "referringDoctorId", label: "ID", span: 1 })}
                    {renderField({ fieldKey: "referringDoctorFirstName", label: "First Name", span: 1 })}
                    {renderField({ fieldKey: "referringDoctorLastName", label: "Last Name", span: 1 })}
                    {renderField({ fieldKey: "referringDoctorDegree", label: "Degree", span: 1 })}
                    {renderField({ fieldKey: "referringDoctorSourceTable", label: "Source Table", span: 1 })}
                  </div>
                </div>

                {/* Admitting Doctor */}
                <div className="pt-4 border-t" style={{ borderColor: t.borderSubtle }}>
                  <h4 className="text-[13px] font-bold mb-3 flex items-center gap-2" style={{ color: t.textHeading }}>
                    <span className="w-1.5 h-3 rounded bg-teal-500 inline-block" /> ADMITTING DOCTOR (PV1-17)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {renderField({ fieldKey: "admittingDoctorId", label: "ID", span: 1 })}
                    {renderField({ fieldKey: "admittingDoctorFirstName", label: "First Name", span: 1 })}
                    {renderField({ fieldKey: "admittingDoctorLastName", label: "Last Name", span: 1 })}
                    {renderField({ fieldKey: "admittingDoctorDegree", label: "Degree", span: 1 })}
                    {renderField({ fieldKey: "admittingDoctorSourceTable", label: "Source Table", span: 1 })}
                  </div>
                </div>

                {/* Consulting Doctor */}
                <div className="pt-4 border-t" style={{ borderColor: t.borderSubtle }}>
                  <h4 className="text-[13px] font-bold mb-3 flex items-center gap-2" style={{ color: t.textHeading }}>
                    <span className="w-1.5 h-3 rounded bg-orange-500 inline-block" /> CONSULTING DOCTOR (PV1-9)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {renderField({ fieldKey: "consultingDoctorId", label: "ID", span: 1 })}
                    {renderField({ fieldKey: "consultingDoctorFirstName", label: "First Name", span: 1 })}
                    {renderField({ fieldKey: "consultingDoctorLastName", label: "Last Name", span: 1 })}
                    {renderField({ fieldKey: "consultingDoctorDegree", label: "Degree", span: 1 })}
                    {renderField({ fieldKey: "consultingDoctorSourceTable", label: "Source Table", span: 1 })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SUB-TAB 3: NEXT OF KIN (NK) ── */}
      {activeSubTab === "nok" && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setNkOpen(!nkOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
            style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
          >
            <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
              <HeartHandshake size={18} className="text-rose-500" /> Next of Kin Details (NK1)
            </span>
            {nkOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
          </button>
          
          {nkOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
              {renderField({ fieldKey: "nkSetId", label: "Set ID", span: 1 })}
              {renderField({ fieldKey: "nkFirstName", label: "First Name", span: 1 })}
              {renderField({ fieldKey: "nkLastName", label: "Last Name", span: 1 })}
              {renderField({ fieldKey: "nkRelationship", label: "Relationship", span: 1, type: "select", options: ["Brother", "Sister", "Spouse", "Parent", "Child", "Relative", "Friend", "Guardian"] })}
              {renderField({ fieldKey: "nkPhone", label: "Primary Phone Number", span: 2 })}
              {renderField({ fieldKey: "nkAltPhone", label: "Secondary / Alt Phone", span: 2 })}
              {renderField({ fieldKey: "nkEmail", label: "Email Address", span: 2 })}
              {renderField({ fieldKey: "nkJobTitle", label: "Occupation / Job Title", span: 2 })}
              {renderField({ fieldKey: "nkAddress", label: "Street Address", span: 2 })}
              {renderField({ fieldKey: "nkCity", label: "City", span: 1 })}
              {renderField({ fieldKey: "nkState", label: "State / Province", span: 1 })}
              {renderField({ fieldKey: "nkZip", label: "Zip / Postal Code", span: 1 })}
              {renderField({ fieldKey: "nkEmergencyFlag", label: "Emergency Contact Flag", span: 1, type: "select", options: ["Yes", "No"] })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: INSURANCE (IN1) ── */}
      {activeSubTab === "insurance" && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setInsOpen(!insOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
            style={{ border: `1px solid ${t.borderDefault}`, backgroundColor: "#F8FAFC" }}
          >
            <span className="flex items-center gap-2 font-bold text-[14px]" style={{ color: t.textHeading }}>
              <ShieldCheck size={18} className="text-emerald-500" /> Insurance Information (IN1)
            </span>
            {insOpen ? <ChevronUp size={18} style={{ color: t.textMuted }} /> : <ChevronDown size={18} style={{ color: t.textMuted }} />}
          </button>
          
          {insOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
              {renderField({ fieldKey: "insCompanyId", label: "Insurance Company ID", span: 1 })}
              {renderField({ fieldKey: "insName", label: "Insurance Company Name", span: 2 })}
              {renderField({ fieldKey: "insGroupName", label: "Insured Group Name", span: 1 })}
              {renderField({ fieldKey: "insType", label: "Insurance Plan Type", span: 2, type: "select", options: ["Silver A", "Gold", "Platinum", "VIP", "Standard"] })}
              {renderField({ fieldKey: "insPolicyNumber", label: "Policy / Plan ID Number", span: 2 })}
              {renderField({ fieldKey: "insGroupNumber", label: "Account / Group Number", span: 2 })}
              {renderField({ fieldKey: "insEffectiveDate", label: "Effective Date", span: 2, type: "date" })}
              {renderField({ fieldKey: "insExpiryDate", label: "Expiry Date", span: 2 })}
              {renderField({ fieldKey: "insPolicyHolderName", label: "Policyholder Name", span: 2 })}
              {renderField({ fieldKey: "insRelationship", label: "Relationship to Insured", span: 2, type: "select", options: ["Self", "Spouse", "Child", "Dependent"] })}
              {renderField({ fieldKey: "insPreAuthCode", label: "Pre-Authorization Code", span: 2 })}
            </div>
          )}
        </div>
      )}

      {/* Save / Cancel buttons in Edit Mode */}
      {editing && (
        <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: `1px solid ${t.borderDefault}` }}>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: t.primary, color: "#fff", fontSize: "14px", border: "none" }}
          >
            <Save size={16} /> Save All Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ fontSize: "14px", color: t.textMuted, border: `1.5px solid ${t.borderDefault}`, backgroundColor: "#fff" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Toast Save confirmation */}
      {saved && (
        <div className="flex items-center gap-2 mt-4" style={{ color: t.success, fontSize: "14px", fontWeight: 700 }}>
          <CheckCircle2 size={16} /> Saved successfully
        </div>
      )}
    </div>
  );
}
