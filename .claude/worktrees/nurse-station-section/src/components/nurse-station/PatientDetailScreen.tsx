import React, { useState } from "react";
import {
  RefreshCw,
  UserCircle2,
  BedDouble,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCw,
  Sparkles,
  X,
} from "lucide-react";
import careinnLogo from "./assets/careinn-logo.svg";

/* =========================================================================
   Design tokens — shared with the dashboard
   ========================================================================= */
const C = {
  headerNavy: "#152A4C",
  cardNavy: "#18355E",
  vipBlue: "#09ADEA",
  vipBlueLight: "#4BBDE3",
  green: "#01C874",
  greenDark: "#00AC64",
  red: "#DF4354",
  redBg: "#FEF7F7",
  gray100: "#F1F1F1",
  gray150: "#F5F5F5",
  gray200: "#FAFAFA",
  gray300: "#D9D9D9",
  gray400: "#B8B8B8",
  gray500: "#7B7B7B",
  ink: "#1C1B1F",
  ink2: "#343434",
};

/* =========================================================================
   Mock data — Patient Admission tab
   ========================================================================= */
const greenBadge = (t) => (
  <span
    className="px-2 py-0.5 rounded text-[11px] font-semibold"
    style={{ color: C.greenDark, background: "rgba(1,200,116,0.18)" }}
  >
    {t}
  </span>
);

const patientIdentification = [
  { label: "Group",               value: greenBadge("Children"), action: "Change" },
  { label: "Patient ID",          value: "MR21446" },
  { label: "Patient Name",        value: "Balfaqih Aseel" },
  { label: "Admission Date/Time", value: "25/05/2025 10:45AM" },
  { label: "Discharge Date/Time", value: "-" },
  { label: "Patient Sex",         value: "Female" },
  { label: "Race",                value: "-" },
  { label: "Birthdate",           value: "01/05/1983 (42y)" },
  { label: "Phone Number",        value: "+966501014752" },
  { label: "Diet Code",           value: "No Suger" },
  { label: "Patient Mobility",    value: "Wheelchair" },
];
const patientVisit = [
  { label: "Patient Class",      value: greenBadge("I") },
  { label: "Room Number",        value: "301A" },
  { label: "Bed Number",         value: "01" },
  { label: "Admission Type",     value: "3" },
  { label: "Attending Doctor",   value: "Dr. Abdullah" },
  { label: "Consulting Doctor",  value: "Dr. Omar" },
  { label: "Referring Doctor",   value: "-" },
  { label: "Primary Nurse",      value: "Amal Alamer" },
  { label: "Head Nurse",         value: "Jisa" },
  { label: "Servicing Facility", value: "-" },
  { label: "Hospital Service",   value: "-" },
];
const insurance = [
  { label: "Insurance Company ID", value: greenBadge("3") },
  { label: "Insurance Name",       value: "BUBA" },
  { label: "Insured Group Name",   value: "-" },
  { label: "Insurance Type",       value: "Silver A" },
  { label: "Expiry Date",          value: "12/12/2025" },
];
const nextKin = [
  { label: "Set ID",        value: greenBadge("3") },
  { label: "Next Kin Name", value: "Omar Ahmed" },
  { label: "Relationship",  value: "Brother" },
  { label: "Address",       value: "-" },
  { label: "Phone Number",  value: "+966530014785" },
];

/* =========================================================================
   Mock data — Observations tab
   ========================================================================= */
const observations = [
  { id: "01", datetime: "2025-06-18 09:18", name: "Systolic Blood Pressure",  value: "120", unit: "mmHg", range: "90-120" },
  { id: "02", datetime: "2025-06-18 09:18", name: "Diastolic Blood Pressure", value: "80",  unit: "mmHg", range: "60-80" },
];

const observationTypes = [
  { id: "01", name: "Systolic Blood Pressure",  loinc: "8480-6", range: "90-120", unit: "mmHg", highRisk: "value<90, value>150", show: false },
  { id: "02", name: "Diastolic Blood Pressure", loinc: "8480-7", range: "60-80",  unit: "mmHg", highRisk: "Value<60, Value>90",   show: true  },
];

const reminders = [
  { id: "01", datetime: "2025-06-18 09:18", text: "Request For Water",    status: "Closed", action: "-" },
  { id: "02", datetime: "2025-06-18 11:18", text: "Request for a doctor", status: "Active", action: "-" },
];

/* =========================================================================
   Mock data — Alerts tab (history + received)
   ========================================================================= */
const alertHistory = [
  { id: "01", datetime: "2025-06-18 09:18", message: "Prepare for the Surgery", messageAr: "Reminder", status: "Sent" },
  { id: "02", datetime: "2025-06-18 20:18", message: "Visit time is over",      messageAr: "mmHg",     status: "Seen" },
];

const receivedAlerts = [
  { id: "01", datetime: "2025-06-18 09:18", message: "Screen is active for 10 hours", action: "Deactivate Screen", status: "Resolved", actionLink: null },
  { id: "02", datetime: "2025-06-19 20:18", message: "Screen inactive for 24 hours",  action: "Send Alert",         status: "Active",   actionLink: "Mark as done" },
  { id: "03", datetime: "2025-06-19 20:18", message: "Pain Assessment",                action: "Visit Patient",      status: "Active",   actionLink: "Mark as done" },
];

/* =========================================================================
   Mock data — Medications tab (history + home)
   ========================================================================= */
const medicationHistory = [
  { id: "01", datetime: "2025-06-18 09:18", type: "Paracetamol", route: "PO(Oral)",       frequency: "PRN(as needed)", dose: "500mg"  },
  { id: "02", datetime: "2025-06-18 20:18", type: "aspirin",     route: "IV(Intravenous)", frequency: "BID(Two)",      dose: "1000mg" },
];

const homeMedications = [];

/* =========================================================================
   Mock data — Treatment Plan tab
   ========================================================================= */
const initialTreatmentTasks = [
  { id: 1, task: "Blood sugar check",  time: "10 AM", done: false },
  { id: 2, task: "Chest physiotherapy", time: "2 PM",  done: false },
];

const initialTreatmentHistory = [
  { date: "06/06/2025", task: "Vital signs",       time: "8 AM",  done: true  },
  { date: "06/06/2025", task: "Wound dressing",    time: "11 AM", done: true  },
  { date: "05/06/2025", task: "Blood sugar check", time: "10 AM", done: true  },
];

/* =========================================================================
   Mock data — Discharge Plan tab
   ========================================================================= */
const initialDischargeTasks = [
  { id: 1, task: "Doctor confirmed discharge",        period: "30 mins",  done: false },
  { id: 2, task: "Nurse Preparing documents",         period: "15 mins",  done: false },
  { id: 3, task: "Medication Preapartion and reviewed", period: "90 mins", done: false },
  { id: 4, task: "Billing",                           period: "30 mins",  done: false },
  { id: 5, task: "Insurance confirmation",            period: "30 mins",  done: false },
  { id: 6, task: "Actual Checkout",                   period: "30 mins",  done: false },
  { id: 7, task: "Room TurnOver",                     period: "120 mins", done: false },
];

const initialDischargeHistory = [
  { date: "05/06/2025", task: "Final paperwork signed", period: "20 mins", done: true },
];

/* =========================================================================
   Mock data — Educational Material tab
   ========================================================================= */
const initialEducationMaterials = [
  { id: "01", title: "How to use insulin pen",   description: "Paracetamol", attachment: "PDF", viewed: "Yes" },
  { id: "02", title: "Caring for surgical wound", description: "aspirin",     attachment: "MP4", viewed: "No"  },
];

/* =========================================================================
   Notifications side panel
   ========================================================================= */
const notifications = [
  { room: "301A", type: "HK Request", time: "15-5-2025 09:10", color: C.ink2,    rowBg: "transparent", tagBg: C.cardNavy },
  { room: "308A", type: "HK Request", time: "15-5-2025 09:15", color: C.ink2,    rowBg: "transparent", tagBg: C.cardNavy },
  { room: "303A", type: "HK Request", time: "15-5-2025 09:18", color: C.gray400, rowBg: "transparent", tagBg: C.gray400 },
  { room: "312A", type: "HK Request", time: "15-5-2025 09:18", color: C.red,     rowBg: C.redBg,       tagBg: C.gray400 },
];

/* =========================================================================
   Main tab definitions for the detail screen
   ========================================================================= */
const TABS = [
  { key: "admission",     label: "Patient Admission" },
  { key: "observations",  label: "Observations" },
  { key: "reminders",     label: "Reminders" },
  { key: "alerts",        label: "Alerts", badge: 2 },
  { key: "medications",   label: "Medications" },
  { key: "treatment",     label: "Treatment Plan" },
  { key: "discharge",     label: "Discharge Plan" },
  { key: "education",     label: "Educational Material" },
];

/* =========================================================================
   Reusable info-table renderer (used by the Admission tab)
   ========================================================================= */
function InfoSection({ title, rows }) {
  return (
    <div>
      <h3 className="text-[12px] font-semibold mb-1.5 text-[#343434]">{title}</h3>
      <div className="border border-[#F1F1F1] rounded-md overflow-hidden bg-white">
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_2fr] gap-2 px-3 py-2 text-[12px] items-center"
            style={{ background: i % 2 === 0 ? C.gray150 : "#fff" }}
          >
            <span className="text-[#343434] font-medium">{r.label}</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#343434]">{r.value}</span>
              {r.action && (
                <button className="text-[#09ADEA] text-[12px] underline">
                  {r.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   Tab panel: Patient Admission
   ========================================================================= */
function AdmissionPanel() {
  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <InfoSection title="Patient Identification" rows={patientIdentification} />
      <InfoSection title="Patient Visit"          rows={patientVisit} />
      <InfoSection title="Insurance"              rows={insurance} />
      <InfoSection title="Next Kin"               rows={nextKin} />
    </div>
  );
}

/* =========================================================================
   Tab panel: Observations
   ========================================================================= */
function ObservationsPanel() {
  const [subTab, setSubTab] = useState("observations");

  return (
    <div className="p-6">
      {/* Sub-tabs + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setSubTab("observations")}
            className="flex items-center gap-2 pb-1 text-[18px]"
            style={{
              color: subTab === "observations" ? C.ink : C.gray400,
              fontWeight: subTab === "observations" ? 700 : 500,
              borderBottom: subTab === "observations" ? `2px solid ${C.ink}` : "2px solid transparent",
            }}
          >
            Observations
            {subTab === "observations" && (
              <RotateCw size={16} className="text-[#09ADEA]" strokeWidth={2.5} />
            )}
          </button>
          <button
            onClick={() => setSubTab("types")}
            className="flex items-center gap-2 pb-1 text-[18px]"
            style={{
              color: subTab === "types" ? C.ink : C.gray400,
              fontWeight: subTab === "types" ? 700 : 500,
              borderBottom: subTab === "types" ? `2px solid ${C.ink}` : "2px solid transparent",
            }}
          >
            Observation Types
            {subTab === "types" && (
              <RotateCw size={16} className="text-[#09ADEA]" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold border-2"
          style={{ borderColor: C.green, color: C.green, background: "#fff" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {subTab === "observations" ? "New Observation" : "New Observation Type"}
        </button>
      </div>

      {/* Table */}
      {subTab === "observations" ? (
        <ObservationsTable rows={observations} />
      ) : (
        <ObservationTypesTable rows={observationTypes} />
      )}
    </div>
  );
}

function ObservationsTable({ rows }) {
  const cols = [
    { key: "id",       label: "ID",          w: "80px"  },
    { key: "datetime", label: "Date/time",   w: "180px" },
    { key: "name",     label: "Observations", w: "1fr"  },
    { key: "value",    label: "Value",       w: "120px" },
    { key: "unit",     label: "Unit",        w: "120px" },
    { key: "range",    label: "Normal Range",w: "160px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      {/* Header */}
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
        style={{ gridTemplateColumns: gridCols, background: C.gray200 }}
      >
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>

      {/* Rows */}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.datetime}</div>
          <div>{r.name}</div>
          <div>{r.value}</div>
          <div className="font-semibold">{r.unit}</div>
          <div>{r.range}</div>
        </div>
      ))}
    </div>
  );
}

function ObservationTypesTable({ rows }) {
  const [state, setState] = useState(rows);

  const cols = [
    { key: "id",       label: "ID",              w: "80px"  },
    { key: "name",     label: "Observation Name", w: "1fr"  },
    { key: "loinc",    label: "Loinc Code",      w: "160px" },
    { key: "range",    label: "Normal Range",    w: "160px" },
    { key: "unit",     label: "Unit",            w: "120px" },
    { key: "highRisk", label: "High Risk Range", w: "200px" },
    { key: "show",     label: "Show",            w: "90px"  },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  const toggleShow = (idx) => {
    setState((s) =>
      s.map((row, i) => (i === idx ? { ...row, show: !row.show } : row))
    );
  };

  return (
    <div className="rounded">
      {/* Header */}
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
        style={{ gridTemplateColumns: gridCols, background: C.gray200 }}
      >
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>

      {/* Rows */}
      {state.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.name}</div>
          <div>{r.loinc}</div>
          <div>{r.range}</div>
          <div className="font-semibold">{r.unit}</div>
          <div>{r.highRisk}</div>
          <div>
            <button
              onClick={() => toggleShow(i)}
              aria-label={`Toggle show for ${r.name}`}
              className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
              style={{
                borderColor: C.ink,
                background: r.show ? C.ink : "#fff",
              }}
            >
              {r.show && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="white" strokeWidth="3"
                     strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Tab panel: Reminders
   ========================================================================= */
function RemindersPanel() {
  return (
    <div className="p-6">
      {/* Header row: title + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 pb-1 text-[18px] font-bold text-[#1C1B1F]"
             style={{ borderBottom: `2px solid ${C.ink}`, alignSelf: "flex-start" }}>
          Reminders
          <RotateCw size={16} className="text-[#09ADEA]" strokeWidth={2.5} />
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold border-2"
          style={{ borderColor: C.green, color: C.green, background: "#fff" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Reminder
        </button>
      </div>

      <RemindersTable rows={reminders} />
    </div>
  );
}

function RemindersTable({ rows }) {
  const cols = [
    { key: "id",       label: "ID",        w: "80px"  },
    { key: "datetime", label: "Date/time", w: "200px" },
    { key: "text",     label: "Reminder",  w: "1fr"   },
    { key: "status",   label: "Status",    w: "160px" },
    { key: "action",   label: "Action",    w: "120px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      {/* Header */}
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
        style={{ gridTemplateColumns: gridCols, background: C.gray200 }}
      >
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>

      {/* Rows */}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.datetime}</div>
          <div>{r.text}</div>
          <div className="font-semibold">{r.status}</div>
          <div>{r.action}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Tab panel: Alerts (Alert History + Received Alert sub-tabs + New Alert modal)
   ========================================================================= */
function AlertsPanel() {
  const [subTab, setSubTab] = useState("history");
  const [modalOpen, setModalOpen] = useState(false);

  const subTabBtn = (key, label, badge) => {
    const active = subTab === key;
    return (
      <button
        onClick={() => setSubTab(key)}
        className="flex items-center gap-2 pb-1 text-[18px] relative"
        style={{
          color: active ? C.ink : C.gray400,
          fontWeight: active ? 700 : 500,
          borderBottom: active ? `2px solid ${C.ink}` : "2px solid transparent",
        }}
      >
        {label}
        {badge && (
          <span
            className="absolute -top-1 -right-3 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: C.red }}
          >
            {badge}
          </span>
        )}
        {active && <RotateCw size={16} className="text-[#09ADEA] ml-1" strokeWidth={2.5} />}
      </button>
    );
  };

  return (
    <div className="p-6">
      {/* Sub-tabs + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-10">
          {subTabBtn("history",  "Alert History")}
          {subTabBtn("received", "Received Alert", 2)}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold border-2"
          style={{ borderColor: C.green, color: C.green, background: "#fff" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Alert
        </button>
      </div>

      {subTab === "history"
        ? <AlertHistoryTable rows={alertHistory} />
        : <ReceivedAlertsTable rows={receivedAlerts} />}

      {modalOpen && <NewAlertModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function AlertHistoryTable({ rows }) {
  const cols = [
    { key: "id",        label: "ID",            w: "80px"  },
    { key: "datetime",  label: "Date/time",     w: "200px" },
    { key: "message",   label: "Message",       w: "1fr"   },
    { key: "messageAr", label: "Message Arabic", w: "200px" },
    { key: "status",    label: "Status",        w: "160px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      <div className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
           style={{ gridTemplateColumns: gridCols, background: C.gray200 }}>
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.datetime}</div>
          <div>{r.message}</div>
          <div className="font-semibold">{r.messageAr}</div>
          <div>
            {r.status}{" "}
            <button className="text-[#09ADEA] underline ml-1">(Resend)</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReceivedAlertsTable({ rows }) {
  const cols = [
    { key: "id",       label: "ID",              w: "80px"  },
    { key: "datetime", label: "Date/time",       w: "200px" },
    { key: "message",  label: "Message",         w: "1fr"   },
    { key: "action",   label: "Suggested Action", w: "200px" },
    { key: "status",   label: "Status",          w: "200px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      <div className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
           style={{ gridTemplateColumns: gridCols, background: C.gray200 }}>
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-3 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.datetime}</div>
          <div>{r.message}</div>
          <div className="font-semibold">{r.action}</div>
          <div>
            {r.status}
            {r.actionLink && (
              <button className="text-[#09ADEA] underline ml-2">({r.actionLink})</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   New Alert Message modal
   ========================================================================= */
function NewAlertModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [en, setEn] = useState("");
  const [ar, setAr] = useState("");
  const [attachment, setAttachment] = useState("None");

  const handleSend = () => {
    // Hook your real "send" API here.
    onClose();
  };

  const generateAi = () => {
    // Placeholder — wire to your translation/AI service.
    if (en.trim()) {
      setAr("(الترجمة المُولَّدة بالذكاء الاصطناعي) " + en);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-xl w-full max-w-[900px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          className="text-white text-center py-3 font-bold text-[18px] relative"
          style={{ background: C.vipBlueLight }}
        >
          New Alert Message
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-5">
          <Field label="Alert Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <Field label="English Description">
            <textarea
              value={en}
              onChange={(e) => setEn(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] resize-none focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <Field
            label="Arabic Description"
            extra={
              <button
                onClick={generateAi}
                className="flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-semibold text-white"
                style={{ background: C.greenDark }}
              >
                <Sparkles size={14} strokeWidth={2.5} />
                Generate (Ai)
              </button>
            }
          >
            <textarea
              value={ar}
              onChange={(e) => setAr(e.target.value)}
              rows={2}
              dir="rtl"
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] resize-none focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <div>
            <label className="block text-[14px] font-bold text-[#1C1B1F] mb-2">Attachments</label>
            <button
              onClick={() => setAttachment(attachment === "None" ? "file.pdf" : "None")}
              className="px-4 py-1.5 rounded-md border border-[#B8B8B8] text-[13px] font-semibold text-[#1C1B1F] bg-white hover:bg-gray-50"
            >
              {attachment}
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-8 pb-6 flex items-center justify-between">
          <button
            onClick={handleSend}
            className="px-8 py-2.5 rounded-full text-white font-bold text-[14px] tracking-wide"
            style={{ background: C.vipBlueLight }}
          >
            SEND
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-full text-white font-bold text-[14px] tracking-wide"
            style={{ background: "#A93535" }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, extra, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <label className="text-[14px] font-bold text-[#1C1B1F]">{label}</label>
        {extra}
      </div>
      {children}
    </div>
  );
}

/* =========================================================================
   Tab panel: Medications (Medication History + Home Medications sub-tabs)
   ========================================================================= */
function MedicationsPanel() {
  const [subTab, setSubTab] = useState("history");

  const subTabBtn = (key, label) => {
    const active = subTab === key;
    return (
      <button
        onClick={() => setSubTab(key)}
        className="flex items-center gap-2 pb-1 text-[18px]"
        style={{
          color: active ? C.ink : C.gray400,
          fontWeight: active ? 700 : 500,
          borderBottom: active ? `2px solid ${C.ink}` : "2px solid transparent",
        }}
      >
        {label}
        {active && <RotateCw size={16} className="text-[#09ADEA] ml-1" strokeWidth={2.5} />}
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-10">
          {subTabBtn("history", "Medication History")}
          {subTabBtn("home",    "Home Medications")}
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold border-2"
          style={{ borderColor: C.green, color: C.green, background: "#fff" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Medication
        </button>
      </div>

      {subTab === "history"
        ? <MedicationsTable rows={medicationHistory} />
        : (homeMedications.length === 0
            ? <div className="py-16 text-center text-[#B8B8B8] text-[13px]">No home medications recorded.</div>
            : <MedicationsTable rows={homeMedications} />)}
    </div>
  );
}

function MedicationsTable({ rows }) {
  const cols = [
    { key: "id",        label: "ID",        w: "80px"  },
    { key: "datetime",  label: "Date/time", w: "180px" },
    { key: "type",      label: "Type",      w: "1fr"   },
    { key: "route",     label: "Route",     w: "180px" },
    { key: "frequency", label: "Frequency", w: "200px" },
    { key: "dose",      label: "Dose",      w: "120px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      <div className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
           style={{ gridTemplateColumns: gridCols, background: C.gray200 }}>
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.datetime}</div>
          <div>{r.type}</div>
          <div>{r.route}</div>
          <div className="font-semibold">{r.frequency}</div>
          <div>{r.dose}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Tab panel: Treatment Plan (plan + history sub-tabs, inline calendar)
   ========================================================================= */
function TreatmentPlanPanel() {
  const [subTab, setSubTab]   = useState("plan");
  const [date, setDate]       = useState(new Date(2025, 5, 7)); // June 7 2025
  const [showCal, setShowCal] = useState(false);
  const [tasks, setTasks]     = useState(initialTreatmentTasks);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ task: "", time: "" });

  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const toggleDone = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const saveDraft = () => {
    if (!draft.task.trim()) return;
    setTasks((ts) => [...ts, { id: Date.now(), task: draft.task, time: draft.time, done: false }]);
    setDraft({ task: "", time: "" });
    setEditing(false);
  };

  const subTabBtn = (key, label) => {
    const active = subTab === key;
    return (
      <button
        onClick={() => setSubTab(key)}
        className="flex items-center gap-2 pb-1 text-[18px]"
        style={{
          color: active ? C.ink : C.gray400,
          fontWeight: active ? 700 : 500,
          borderBottom: active ? `2px solid ${C.ink}` : "2px solid transparent",
        }}
      >
        {label}
        {active && <RotateCw size={16} className="text-[#09ADEA] ml-1" strokeWidth={2.5} />}
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-10 mb-4">
        {subTabBtn("plan",    "Treatment Plan")}
        {subTabBtn("history", "History")}
      </div>

      {subTab === "plan" ? (
        <>
          {/* Date row */}
          <div className="flex items-center gap-3 mb-4 relative">
            <span className="font-bold text-[16px] text-[#1C1B1F]">Date</span>
            <button
              onClick={() => setShowCal((v) => !v)}
              className="px-4 py-1.5 rounded-full border border-[#F1F1F1] bg-[#FAFAFA] text-[14px] font-medium text-[#343434] hover:border-[#09ADEA]"
            >
              {fmt(date)}
            </button>
            {showCal && (
              <DatePicker
                value={date}
                onSelect={(d) => { setDate(d); setShowCal(false); }}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>

          {/* Table */}
          <TreatmentTable
            rows={tasks}
            onToggle={toggleDone}
            editing={editing}
            draft={draft}
            setDraft={setDraft}
            onSaveDraft={saveDraft}
            onAddRow={() => setEditing(true)}
          />
        </>
      ) : (
        <TreatmentHistoryTable rows={initialTreatmentHistory} />
      )}
    </div>
  );
}

function TreatmentTable({ rows, onToggle, editing, draft, setDraft, onSaveDraft, onAddRow }) {
  const cols = "1fr 200px 140px";
  return (
    <div className="rounded">
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#1C1B1F]"
        style={{ gridTemplateColumns: cols, background: C.gray200 }}
      >
        <div>What we are going to do today</div>
        <div className="text-right pr-6">Time (optional)</div>
        <div className="text-right">Mark as Done</div>
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <div>{r.task}</div>
          <div className="text-right pr-6">{r.time}</div>
          <div className="flex justify-end">
            <Checkbox checked={r.done} onChange={() => onToggle(r.id)} />
          </div>
        </div>
      ))}

      {editing && (
        <div
          className="grid items-center px-4 py-3 text-[13px] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <input
            autoFocus
            placeholder="New task…"
            value={draft.task}
            onChange={(e) => setDraft({ ...draft, task: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSaveDraft()}
            className="px-2 py-1.5 rounded border border-[#F1F1F1] bg-white text-[13px] focus:outline-none focus:border-[#09ADEA]"
          />
          <div className="flex justify-end pr-6">
            <input
              placeholder="e.g. 3 PM"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSaveDraft()}
              className="px-2 py-1.5 rounded border border-[#F1F1F1] bg-white text-[13px] text-right w-24 focus:outline-none focus:border-[#09ADEA]"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={onSaveDraft}
              className="px-3 py-1 rounded text-[12px] font-semibold text-white"
              style={{ background: C.green }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add row */}
      <button
        onClick={onAddRow}
        aria-label="Add task"
        className="flex items-center gap-2 px-4 py-3 text-[#343434] hover:bg-[#FAFAFA] w-full text-left"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function TreatmentHistoryTable({ rows }) {
  const cols = "160px 1fr 200px 140px";
  return (
    <div className="rounded">
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#1C1B1F]"
        style={{ gridTemplateColumns: cols, background: C.gray200 }}
      >
        <div>Date</div>
        <div>Task</div>
        <div className="text-right pr-6">Time</div>
        <div className="text-right">Done</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-3 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <div>{r.date}</div>
          <div>{r.task}</div>
          <div className="text-right pr-6">{r.time}</div>
          <div className="flex justify-end">
            <Checkbox checked={r.done} disabled />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Small reusable Checkbox (matches the dark-square Figma style)
   ========================================================================= */
function Checkbox({ checked, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="checkbox"
      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
      style={{
        borderColor: C.ink,
        background: checked ? C.ink : "#fff",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="white" strokeWidth="3"
             strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

/* =========================================================================
   Mini date picker — month grid matching the Figma calendar
   ========================================================================= */
function DatePicker({ value, onSelect, onClose }) {
  const [view, setView] = useState(new Date(value.getFullYear(), value.getMonth(), 1));

  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const dow = ["Mo","Tu","We","Th","Fr","Sa","Su"];

  const year = view.getFullYear();
  const month = view.getMonth();

  // Build a 6×7 grid starting on Monday
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month,     0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++)
    cells.push({ day: daysInPrev - firstDow + i + 1, current: false, date: new Date(year, month - 1, daysInPrev - firstDow + i + 1) });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  while (cells.length < 42) {
    const d = cells.length - firstDow - daysInMonth + 1;
    cells.push({ day: d, current: false, date: new Date(year, month + 1, d) });
  }

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate();

  return (
    <div
      className="absolute top-12 left-20 z-30 bg-white rounded-md shadow-lg p-4 w-[320px] border border-[#F1F1F1]"
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="w-8 h-8 rounded-full border border-[#F1F1F1] flex items-center justify-center hover:bg-[#FAFAFA]"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="font-bold text-[15px] text-[#1C1B1F]">
          {months[month]} {year}
        </div>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="w-8 h-8 rounded-full border border-[#F1F1F1] flex items-center justify-center hover:bg-[#FAFAFA]"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[12px] text-[#343434] font-semibold mb-1">
        {dow.map((d) => <div key={d} className="text-center py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const selected = sameDay(c.date, value);
          return (
            <button
              key={i}
              onClick={() => onSelect(c.date)}
              className="h-9 rounded text-[13px] flex items-center justify-center transition-colors"
              style={{
                background: selected ? "#1D5EFF" : c.current ? "#fff" : "transparent",
                color: selected ? "#fff" : c.current ? "#1C1B1F" : "#D9D9D9",
                border: c.current && !selected ? "1px solid #F1F1F1" : "1px solid transparent",
                fontWeight: selected ? 700 : 500,
              }}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   Tab panel: Discharge Plan (plan + history sub-tabs)
   ========================================================================= */
function DischargePlanPanel() {
  const [subTab, setSubTab]   = useState("plan");
  const [date, setDate]       = useState(new Date(2025, 5, 7));
  const [showCal, setShowCal] = useState(false);
  const [tasks, setTasks]     = useState(initialDischargeTasks);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ task: "", period: "" });

  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const toggleDone = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const saveDraft = () => {
    if (!draft.task.trim()) return;
    setTasks((ts) => [...ts, { id: Date.now(), task: draft.task, period: draft.period, done: false }]);
    setDraft({ task: "", period: "" });
    setEditing(false);
  };

  const subTabBtn = (key, label) => {
    const active = subTab === key;
    return (
      <button
        onClick={() => setSubTab(key)}
        className="flex items-center gap-2 pb-1 text-[18px]"
        style={{
          color: active ? C.ink : C.gray400,
          fontWeight: active ? 700 : 500,
          borderBottom: active ? `2px solid ${C.ink}` : "2px solid transparent",
        }}
      >
        {label}
        {active && <RotateCw size={16} className="text-[#09ADEA] ml-1" strokeWidth={2.5} />}
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-10 mb-4">
        {subTabBtn("plan",    "Discharge Plan")}
        {subTabBtn("history", "History")}
      </div>

      {subTab === "plan" ? (
        <>
          <div className="flex items-center gap-3 mb-4 relative">
            <span className="font-bold text-[16px] text-[#1C1B1F]">Discharge date</span>
            <button
              onClick={() => setShowCal((v) => !v)}
              className="px-4 py-1.5 rounded-full border border-[#F1F1F1] bg-[#FAFAFA] text-[14px] font-medium text-[#343434] hover:border-[#09ADEA]"
            >
              {fmt(date)}
            </button>
            {showCal && (
              <DatePicker
                value={date}
                onSelect={(d) => { setDate(d); setShowCal(false); }}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>

          <DischargeTable
            rows={tasks}
            onToggle={toggleDone}
            editing={editing}
            draft={draft}
            setDraft={setDraft}
            onSaveDraft={saveDraft}
            onAddRow={() => setEditing(true)}
          />
        </>
      ) : (
        <DischargeHistoryTable rows={initialDischargeHistory} />
      )}
    </div>
  );
}

function DischargeTable({ rows, onToggle, editing, draft, setDraft, onSaveDraft, onAddRow }) {
  const cols = "1fr 200px 140px";
  return (
    <div className="rounded">
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#1C1B1F]"
        style={{ gridTemplateColumns: cols, background: C.gray200 }}
      >
        <div>Discharge Plan</div>
        <div className="text-right pr-6">Period</div>
        <div className="text-right">Mark as Done</div>
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          className="grid items-center px-4 py-3 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <div>{r.task}</div>
          <div className="text-right pr-6">{r.period}</div>
          <div className="flex justify-end">
            <Checkbox checked={r.done} onChange={() => onToggle(r.id)} />
          </div>
        </div>
      ))}

      {editing && (
        <div
          className="grid items-center px-4 py-3 text-[13px] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <input
            autoFocus
            placeholder="New task…"
            value={draft.task}
            onChange={(e) => setDraft({ ...draft, task: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSaveDraft()}
            className="px-2 py-1.5 rounded border border-[#F1F1F1] bg-white text-[13px] focus:outline-none focus:border-[#09ADEA]"
          />
          <div className="flex justify-end pr-6">
            <input
              placeholder="e.g. 30 mins"
              value={draft.period}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSaveDraft()}
              className="px-2 py-1.5 rounded border border-[#F1F1F1] bg-white text-[13px] text-right w-28 focus:outline-none focus:border-[#09ADEA]"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={onSaveDraft}
              className="px-3 py-1 rounded text-[12px] font-semibold text-white"
              style={{ background: C.green }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onAddRow}
        aria-label="Add discharge task"
        className="flex items-center gap-2 px-4 py-3 text-[#343434] hover:bg-[#FAFAFA] w-full text-left"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function DischargeHistoryTable({ rows }) {
  const cols = "160px 1fr 200px 140px";
  return (
    <div className="rounded">
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#1C1B1F]"
        style={{ gridTemplateColumns: cols, background: C.gray200 }}
      >
        <div>Date</div>
        <div>Task</div>
        <div className="text-right pr-6">Period</div>
        <div className="text-right">Done</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-3 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: cols }}
        >
          <div>{r.date}</div>
          <div>{r.task}</div>
          <div className="text-right pr-6">{r.period}</div>
          <div className="flex justify-end">
            <Checkbox checked={r.done} disabled />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Tab panel: Educational Material (+ New Material modal)
   ========================================================================= */
function EducationalMaterialPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [materials, setMaterials] = useState(initialEducationMaterials);

  const handleCreate = (data) => {
    const nextId = String(materials.length + 1).padStart(2, "0");
    setMaterials((m) => [
      ...m,
      {
        id: nextId,
        title: data.title || "Untitled",
        description: data.description || "-",
        attachment: data.attachment || "-",
        viewed: "No",
      },
    ]);
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 pb-1 text-[18px] font-bold text-[#1C1B1F]"
          style={{ borderBottom: `2px solid ${C.ink}`, alignSelf: "flex-start" }}
        >
          Educational Material
          <RotateCw size={16} className="text-[#09ADEA]" strokeWidth={2.5} />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold border-2"
          style={{ borderColor: C.green, color: C.green, background: "#fff" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Material
        </button>
      </div>

      <EducationalMaterialTable rows={materials} />

      {modalOpen && (
        <NewMaterialModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function EducationalMaterialTable({ rows }) {
  const cols = [
    { key: "id",          label: "ID",          w: "80px"  },
    { key: "title",       label: "Title",       w: "1fr"   },
    { key: "description", label: "Description", w: "1fr"   },
    { key: "attachment",  label: "Attachments", w: "160px" },
    { key: "push",        label: "Push",        w: "180px" },
    { key: "viewed",      label: "Viewed",      w: "100px" },
  ];
  const gridCols = cols.map((c) => c.w).join(" ");

  return (
    <div className="rounded">
      <div
        className="grid items-center px-4 py-3 text-[14px] font-semibold text-[#343434]"
        style={{ gridTemplateColumns: gridCols, background: C.gray200 }}
      >
        {cols.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid items-center px-4 py-4 text-[13px] text-[#343434] border-b border-[#F1F1F1]"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="font-semibold">{r.id}</div>
          <div>{r.title}</div>
          <div>{r.description}</div>
          <div>{r.attachment}</div>
          <div>
            <button
              className="px-4 py-1.5 rounded-full text-white text-[12px] font-semibold"
              style={{ background: C.vipBlueLight }}
            >
              Push to Screen
            </button>
          </div>
          <div>{r.viewed}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   New Educational Material modal
   ========================================================================= */
function NewMaterialModal({ onClose, onSubmit }) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [arabic, setArabic]           = useState("");
  const [attachment, setAttachment]   = useState("");

  const generateAi = () => {
    if (description.trim()) {
      setArabic("(الترجمة المُولَّدة بالذكاء الاصطناعي) " + description);
    }
  };

  const handlePick = () => {
    // In a real app this opens a file picker. For the mock, prompt the user.
    const name = window.prompt("File name (JPG, PNG, MP4 or PDF):", "guide.pdf");
    if (name) setAttachment(name);
  };

  const handleSubmit = () => {
    onSubmit({ title, description, arabic, attachment });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-xl w-full max-w-[900px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-white text-center py-3 font-bold text-[18px] relative"
          style={{ background: C.vipBlueLight }}
        >
          New Educational Material
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] resize-none focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <Field
            label="Arabic Description"
            extra={
              <button
                onClick={generateAi}
                className="flex items-center gap-1 px-3 py-1 rounded-md text-[12px] font-semibold text-white"
                style={{ background: C.greenDark }}
              >
                <Sparkles size={14} strokeWidth={2.5} />
                Generate (Ai)
              </button>
            }
          >
            <textarea
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              rows={2}
              dir="rtl"
              className="w-full px-3 py-2.5 rounded-md border border-[#F1F1F1] bg-[#FAFAFA] resize-none focus:outline-none focus:border-[#09ADEA]"
            />
          </Field>

          <div>
            <label className="block text-[14px] font-bold text-[#1C1B1F] mb-2">
              Attachment (JPG,PNG,MP4,PDF)
            </label>
            <button
              onClick={handlePick}
              className="px-4 py-1.5 rounded-md border border-[#B8B8B8] text-[13px] font-semibold text-[#1C1B1F] bg-white hover:bg-gray-50"
            >
              {attachment || "Upload"}
            </button>
          </div>
        </div>

        <div className="px-8 pb-6 flex items-center justify-between">
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-full text-white font-bold text-[14px] tracking-wide"
            style={{ background: C.vipBlueLight }}
          >
            SEND
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-full text-white font-bold text-[14px] tracking-wide"
            style={{ background: "#A93535" }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Placeholder for tabs we haven't built yet
   ========================================================================= */
function PlaceholderPanel({ label }) {
  return (
    <div className="p-6 py-20 text-center text-[#B8B8B8] text-[14px]">
      "{label}" content — coming soon.
    </div>
  );
}

/* =========================================================================
   Main detail screen
   ========================================================================= */
export default function PatientDetailScreen({ roomNo = "301A", onBack }) {
  const [activeTab, setActiveTab] = useState("admission");

  return (
    <div className="min-h-full w-full bg-[#FAFAFA] font-sans text-[#1C1B1F]">
      {/* Back to ward — header trimmed to blend with the dashboard chrome */}
      {onBack && (
        <div className="px-6 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-[#152A4C] hover:text-[#09ADEA] transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
            Back to Ward
          </button>
        </div>
      )}

      {/* Sub-header: date / ward title / time — on page background, no white bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#343434]">
          <Calendar size={26} strokeWidth={1.8} />
          <span className="font-bold text-[20px] tracking-wide">10 FEB 2025</span>
        </div>
        <div className="flex items-center gap-3">
          <BedDouble size={28} className="text-[#343434]" />
          <h1 className="text-[24px] font-bold tracking-wide">IP 3A</h1>
        </div>
        <div className="flex items-center gap-3 text-[#343434]">
          <Clock size={26} strokeWidth={1.8} />
          <span className="font-bold text-[20px] tracking-wide">11:00AM</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-3 px-3 pb-6">
        <div className="flex-1 bg-white rounded-md border border-gray-200 overflow-hidden">
          {/* Room label */}
          <div
            className="text-white text-center py-3 font-bold text-[16px] flex items-center justify-center gap-2"
            style={{ background: C.cardNavy }}
          >
            {roomNo} Single
            <BedDouble size={18} />
          </div>

          {/* Tab bar */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex items-center gap-7 overflow-x-auto">
              {TABS.map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className="relative py-3 text-[13px] whitespace-nowrap"
                    style={{
                      color: active ? C.vipBlue : C.gray500,
                      fontWeight: active ? 600 : 400,
                      borderBottom: active ? `2px solid ${C.vipBlue}` : "2px solid transparent",
                    }}
                  >
                    {t.label}
                    {t.badge && (
                      <span
                        className="absolute -top-0.5 -right-3 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                        style={{ background: C.red }}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active panel */}
          {activeTab === "admission"    && <AdmissionPanel />}
          {activeTab === "observations" && <ObservationsPanel />}
          {activeTab === "reminders"    && <RemindersPanel />}
          {activeTab === "alerts"       && <AlertsPanel />}
          {activeTab === "medications"  && <MedicationsPanel />}
          {activeTab === "treatment"    && <TreatmentPlanPanel />}
          {activeTab === "discharge"    && <DischargePlanPanel />}
          {activeTab === "education"    && <EducationalMaterialPanel />}
        </div>

        {/* Right notification panel */}
        <aside className="w-[260px] shrink-0">
          <div className="rounded-md text-center py-2.5 font-semibold text-white" style={{ background: C.gray400 }}>
            Ward Overview
          </div>
          <div className="mt-3 text-center font-bold text-[15px] text-[#1C1B1F]">
            Notification logs
          </div>
          <div className="mt-2 space-y-1">
            {notifications.map((n, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px]"
                style={{ background: n.rowBg }}
              >
                <span
                  className="px-2 py-0.5 rounded font-bold text-[11px] text-white"
                  style={{ background: n.tagBg, minWidth: 44, textAlign: "center" }}
                >
                  {n.room}
                </span>
                <span style={{ color: n.color, fontWeight: 600 }}>{n.type}</span>
                <span className="ml-auto" style={{ color: n.color }}>{n.time}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom tabs — hidden for now (fixed bar overlapped the dashboard chrome).
          Set `false` back to `true` to restore. */}
      {false && (
        <div className="fixed bottom-0 left-0 right-0 px-3 py-3 flex gap-2 items-center" style={{ background: "#FAFAFA" }}>
          {[
            { label: "Patient Profile", active: true },
            { label: "Treatment Plan" },
            { label: "Nurse Schedule" },
            { label: "CARESUITE" },
            { label: "CARELINK" },
            { label: "SUPPORT" },
          ].map((t, i) => (
            <button
              key={i}
              className="px-4 py-2 rounded text-[13px] font-semibold border"
              style={
                t.active
                  ? { background: C.vipBlue, color: "#fff", borderColor: C.vipBlue }
                  : { background: "transparent", color: C.gray400, borderColor: C.gray400 }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
