import { useState, useEffect } from "react";
import {
  X, ClipboardList, Stethoscope, User, Heart, DollarSign,
  FlaskConical, Image as ImageIcon, Baby, LogOut, Activity,
  Hash, DoorOpen, Clock, Plus, Bed, ExternalLink,
  Crown, Gem, BedDouble, BookOpen, ChevronLeft, RefreshCw,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { nurseStationService } from "../../../../services/nurseStationService";
import { sectionVisibilityService, type SectionVisibilityMap } from "../../../../services/sectionVisibilityService";
import { useTheme } from "../ThemeContext";
import { useLocale } from "../i18n";
import { useNurseStore, nurseActions, type SectionKey } from "../NurseDataStore";
import { PatientProfileTab } from "./tabs/PatientProfileTab";
import { CareOverviewTab } from "./tabs/CareOverviewTab";
import { CarePlanTab } from "./tabs/CarePlanTab";
import { FinancialTab } from "./tabs/FinancialTab";
import { LabResultsTab } from "./tabs/LabResultsTab";
import { ImagingTab } from "./tabs/ImagingTab";
import { BabyCameraTab } from "./tabs/BabyCameraTab";
import { DischargePlanTab } from "./tabs/DischargePlanTab";
import { ObservationsTab } from "./tabs/ObservationsTab";
import { EducationTab } from "./tabs/EducationTab";

interface TabDef {
  key: SectionKey;
  label: string;
  icon: typeof User;
  hasVisibility: boolean;
}

const TABS: TabDef[] = [
  { key: "profile", label: "Patient Profile", icon: User, hasVisibility: false },
  { key: "careOverview", label: "Care Overview", icon: Heart, hasVisibility: true },
  { key: "observations", label: "Observations", icon: Activity, hasVisibility: true },
  { key: "carePlan", label: "My Care Plan", icon: ClipboardList, hasVisibility: true },
  { key: "labs", label: "Lab Results", icon: FlaskConical, hasVisibility: true },
  { key: "imaging", label: "Imaging", icon: ImageIcon, hasVisibility: true },
  { key: "education", label: "Education", icon: BookOpen, hasVisibility: true },
  { key: "baby", label: "Baby Camera", icon: Baby, hasVisibility: true },
  { key: "discharge", label: "Discharge Plan", icon: LogOut, hasVisibility: true },
  { key: "financial", label: "Financial", icon: DollarSign, hasVisibility: true },
];

interface NurseInterfaceProps {
  role: "nurse" | "doctor";
  onClose: () => void;
}

const getRoomTypeIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("royal")) return <Crown size={15} />;
  if (t.includes("vip")) return <Gem size={15} />;
  return <BedDouble size={15} />;
};

export function NurseInterface({ role, onClose }: NurseInterfaceProps) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const [activeTab, setActiveTab] = useState<SectionKey>("profile");
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [isEditingOther, setIsEditingOther] = useState(false);
  const [customTypeDraft, setCustomTypeDraft] = useState("");

  const patient = store.patient;

  const [visibility, setVisibility] = useState<SectionVisibilityMap>(
    sectionVisibilityService.getPatientVisibility(patient.room || patient.mrn || "")
  );

  useEffect(() => {
    const syncVisibility = () => {
      setVisibility(sectionVisibilityService.getPatientVisibility(patient.room || patient.mrn || ""));
    };
    syncVisibility();
    window.addEventListener("careinn-global-visibility-updated", syncVisibility);
    window.addEventListener("careinn-patient-visibility-updated", syncVisibility);
    window.addEventListener("storage", syncVisibility);
    return () => {
      window.removeEventListener("careinn-global-visibility-updated", syncVisibility);
      window.removeEventListener("careinn-patient-visibility-updated", syncVisibility);
      window.removeEventListener("storage", syncVisibility);
    };
  }, [patient.room, patient.mrn]);

  const visibleTabs = TABS.filter((tab) => {
    if (!tab.hasVisibility) return true;
    return visibility[tab.key] !== false;
  });

  useEffect(() => {
    if (activeTab !== "profile" && visibility[activeTab] === false) {
      setActiveTab("profile");
    }
  }, [visibility, activeTab]);

  const wardName = nurseStationService.get(patient.stationId || "")?.name;
  const initials =
    (patient.name || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P";

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <PatientProfileTab role={role} />;
      case "careOverview": return <CareOverviewTab role={role} />;
      case "carePlan": return <CarePlanTab role={role} />;
      case "financial": return <FinancialTab role={role} />;
      case "labs": return <LabResultsTab role={role} />;
      case "imaging": return <ImagingTab role={role} />;
      case "baby": return <BabyCameraTab role={role} />;
      case "discharge": return <DischargePlanTab role={role} />;
      case "observations": return <ObservationsTab role={role} />;
      case "education": return <EducationTab role={role} />;
      default: return null;
    }
  };

  return (
    <div
      className="absolute inset-0 z-[900] flex flex-col"
      style={{ backgroundColor: "#F4F6F8" }}
    >
      {/* ── Header (white) ── */}
      <div
        className="flex items-center gap-4 px-6 py-3.5 shrink-0 bg-white"
        style={{ borderBottom: `1px solid ${t.borderDefault}` }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#4EBEE3" }}>
          {role === "nurse" ? <ClipboardList size={22} color="#fff" /> : <Stethoscope size={22} color="#fff" />}
        </div>
        <div className="min-w-0">
          <h1 style={{ fontFamily: t.fontFamily, fontSize: "20px", fontWeight: 800, color: "#16274D" }}>
            {role === "nurse" ? tr("careteam.nurseRole") : tr("careteam.doctorRole")}
          </h1>
          <p style={{ fontSize: "13px", color: "#5d6678", fontWeight: 500 }}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        {wardName && (
          <button
            onClick={onClose}
            className="ms-2 flex items-center gap-1 text-[14px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: "#4EBEE3" }}
          >
            <ChevronLeft size={17} /> Ward {wardName}
          </button>
        )}
        <div className="ms-auto flex items-center gap-3 shrink-0">
          {role === "nurse" && (
            <button
              onClick={() => toast.success("Patient Terminal synced successfully")}
              className="flex items-center gap-2 px-5 h-[42px] rounded-xl text-white font-bold text-[14px] cursor-pointer transition-colors hover:bg-[#3DA5CA] active:scale-95"
              style={{ background: "#4EBEE3", border: "none" }}
            >
              <RefreshCw size={17} /> Sync Terminal
            </button>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border transition-colors cursor-pointer hover:bg-gray-50"
            style={{ borderColor: t.borderDefault, color: "#5d6678" }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Patient Summary Bar ── */}
      <div
        className="flex items-center gap-5 px-6 py-4 shrink-0 bg-white"
        style={{ borderBottom: `1px solid ${t.borderDefault}` }}
      >
        {/* Identity */}
        <div className="flex items-center gap-3 shrink-0 pe-5" style={{ borderInlineEnd: `1px solid ${t.borderDefault}` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[18px] shrink-0" style={{ background: "#eaf7fc", color: "#1d7da3" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[19px] font-bold leading-tight" style={{ color: "#16274D" }}>
              {(tr("direction") === "rtl" && patient.nameAr) ? patient.nameAr : (patient.name || "—")}
            </div>
            <div className="text-[13px]" style={{ color: "#5d6678" }}>
              {patient.sex || "—"}{patient.age ? ` · ${patient.age} years` : ""}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide bg-[#fcebe9] text-[#c0392b] border border-[#f5c6cb]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" /> OCCUPIED
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="flex-1 flex items-stretch">
          {[
            { label: "MRN", value: patient.mrn || "—" },
            { label: "Room", value: patient.room || "—" },
            { label: "Bed", value: patient.bed || "—" },
          ].map((c, i) => (
            <div
              key={c.label}
              className="flex-1 min-w-0 flex flex-col justify-center px-5"
              style={i > 0 ? { borderInlineStart: `1px solid ${t.borderDefault}` } : undefined}
            >
              <span className="text-[12px] mb-1" style={{ color: "#5d6678", fontWeight: 600 }}>{c.label}</span>
              <span className="text-[16px] font-bold truncate" style={{ color: "#16274D" }}>{c.value}</span>
            </div>
          ))}

          {/* Room Type column (editable) */}
          <div className="flex-1 min-w-0 flex flex-col justify-center px-5" style={{ borderInlineStart: `1px solid ${t.borderDefault}` }}>
            <span className="text-[12px] mb-1" style={{ color: "#5d6678", fontWeight: 600 }}>Room Type</span>
            {isEditingOther ? (
              <div className="flex items-center gap-1" style={{ zIndex: 100 }}>
                <input
                  type="text"
                  value={customTypeDraft}
                  onChange={(e) => setCustomTypeDraft(e.target.value)}
                  placeholder="Type custom type..."
                  className="px-2 py-0.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4EBEE3] font-semibold text-[#16274D]"
                  style={{ width: "110px" }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (customTypeDraft.trim()) {
                      nurseActions.updatePatient({ roomType: customTypeDraft.trim() });
                    }
                    setIsEditingOther(false);
                  }}
                  className="p-1 rounded bg-[#01C874] text-white hover:bg-[#00AC64] transition-colors cursor-pointer flex items-center justify-center"
                  title="Save custom type"
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setIsEditingOther(false)}
                  className="p-1 rounded bg-[#DF4354] text-white hover:bg-[#c93545] transition-colors cursor-pointer flex items-center justify-center"
                  title="Cancel"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowRoomTypeDropdown(!showRoomTypeDropdown)}
                  className="flex items-center gap-1.5 cursor-pointer font-bold text-[16px]"
                  style={{ color: "#16274D", background: "none", border: "none", padding: 0 }}
                >
                  <span>{patient.roomType || "Single"}</span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                </button>

                {showRoomTypeDropdown && (
                  <>
                    {/* Invisible backdrop to dismiss dropdown */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoomTypeDropdown(false)} />

                    <div className="absolute top-full inset-inline-start-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                      {[
                        { value: "Single", label: "Single", icon: <BedDouble size={14} className="text-blue-500" /> },
                        { value: "Royal", label: "Royal", icon: <Crown size={14} className="text-purple-500" /> },
                        { value: "VIP", label: "VIP", icon: <Gem size={14} className="text-teal-500" /> },
                        { value: "other", label: "Other (type)...", icon: <Plus size={14} className="text-gray-500" /> }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            if (opt.value === "other") {
                              setCustomTypeDraft("");
                              setIsEditingOther(true);
                            } else {
                              nurseActions.updatePatient({ roomType: opt.value });
                            }
                            setShowRoomTypeDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-[13px] text-left hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer font-semibold text-gray-700"
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Admission column */}
          <div className="flex-1 min-w-0 flex flex-col justify-center px-5" style={{ borderInlineStart: `1px solid ${t.borderDefault}` }}>
            <span className="text-[12px] mb-1" style={{ color: "#5d6678", fontWeight: 600 }}>Admission</span>
            <span className="text-[16px] font-bold truncate" style={{ color: "#16274D" }}>{patient.admissionDate || "—"}</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Tab Bar â”€â”€ */}
      <div
        className="flex items-center gap-1 px-6 shrink-0 overflow-x-auto"
        style={{ backgroundColor: "#fff", borderBottom: `1px solid ${t.borderDefault}`, padding: "0 24px" }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <div key={tab.key} className="flex items-center shrink-0">
              <button
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3.5 transition-all cursor-pointer relative"
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? t.primary : t.textMuted,
                  borderBottom: isActive ? `3px solid ${t.primary}` : "3px solid transparent",
                  background: "none",
                  border: "none",
                  borderBottomWidth: "3px",
                  borderBottomStyle: "solid",
                  borderBottomColor: isActive ? t.primary : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* â”€â”€ Tab Content â”€â”€ */}
      <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "#F4F6F8" }}>
        <div className="mx-auto" style={{ maxWidth: 1440 }}>
          {renderTab()}
        </div>
      </div>

      <style>{`
        .nurse-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 24px;
          margin-bottom: 20px;
        }
        .nurse-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ni-scroll::-webkit-scrollbar { width: 5px; }
        .ni-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }
        .ni-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
