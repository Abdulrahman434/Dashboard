import { useState } from "react";
import {
  X, ClipboardList, Stethoscope, User, Heart, DollarSign,
  FlaskConical, Image as ImageIcon, Baby, LogOut, Activity,
  Hash, DoorOpen, Clock, Plus, Bed, ExternalLink,
  Crown, Gem, BedDouble,
} from "lucide-react";
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

interface TabDef {
  key: SectionKey;
  label: string;
  icon: typeof User;
  hasVisibility: boolean;
}

const TABS: TabDef[] = [
  { key: "profile", label: "Patient Profile", icon: User, hasVisibility: false },
  { key: "careOverview", label: "Care Overview", icon: Heart, hasVisibility: true },
  { key: "carePlan", label: "My Care Plan", icon: ClipboardList, hasVisibility: true },
  { key: "financial", label: "Financial", icon: DollarSign, hasVisibility: true },
  { key: "labs", label: "Lab Results", icon: FlaskConical, hasVisibility: true },
  { key: "imaging", label: "Imaging", icon: ImageIcon, hasVisibility: true },
  { key: "baby", label: "Baby Camera", icon: Baby, hasVisibility: true },
  { key: "discharge", label: "Discharge Plan", icon: LogOut, hasVisibility: true },
  { key: "observations", label: "Observations", icon: Activity, hasVisibility: true },
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
      default: return null;
    }
  };

  return (
    <div
      className="absolute inset-0 z-[900] flex flex-col"
      style={{ backgroundColor: "#F4F6F8" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-8 py-4 shrink-0"
        style={{ backgroundColor: t.primary }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            {role === "nurse"
              ? <ClipboardList size={22} color="#fff" />
              : <Stethoscope size={22} color="#fff" />}
          </div>
          <div>
            <h1 style={{ fontFamily: t.fontFamily, fontSize: "20px", fontWeight: 800, color: "#fff" }}>
              {role === "nurse" ? tr("careteam.nurseRole") : tr("careteam.doctorRole")}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <X size={20} color="rgba(255,255,255,0.9)" />
        </button>
      </div>

      {/* ── Patient Summary Bar ── */}
      <div
        className="flex items-center px-8 py-4 shrink-0"
        style={{ backgroundColor: "#fff", borderBottom: `1px solid ${t.borderDefault}` }}
      >
        <div className="flex-1 grid grid-cols-5 gap-0">
          {[
            { label: "MRN", value: patient.mrn, icon: <Hash size={15} /> },
            { 
              label: "Patient", 
              value: `${(tr("direction") === "rtl" && patient.nameAr) ? patient.nameAr : patient.name} (${patient.age}y)`, 
              icon: <User size={15} /> 
            },
            { label: "Room", value: patient.room, icon: <DoorOpen size={15} /> },
            { label: "Bed", value: patient.bed || "—", icon: <Bed size={15} /> },
          ].map((item, i) => (
            <div key={i} className="flex relative items-center justify-center">
              {i > 0 && (
                <div className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 w-[1.5px] h-10"
                  style={{ backgroundColor: t.borderDefault, opacity: 0.6 }} />
              )}
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1.5 mb-1" style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                  <span style={{ color: t.primary }}>{item.icon}</span> {item.label}
                </span>
                <span style={{ fontSize: "17px", fontWeight: 800, color: t.textHeading }}>{item.value}</span>
              </div>
            </div>
          ))}

          {/* 5th Column: Room Type dropdown */}
          <div className="flex relative items-center justify-center">
            <div className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 w-[1.5px] h-10"
              style={{ backgroundColor: t.borderDefault, opacity: 0.6 }} />
            <div className="flex flex-col items-center relative">
              <span className="flex items-center gap-1.5 mb-1" style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                <span style={{ color: t.primary }}>{getRoomTypeIcon(patient.roomType || "Single")}</span> Room Type
              </span>
              
              {isEditingOther ? (
                <div className="flex items-center gap-1 mt-0.5" style={{ zIndex: 100 }}>
                  <input
                    type="text"
                    value={customTypeDraft}
                    onChange={(e) => setCustomTypeDraft(e.target.value)}
                    placeholder="Type custom type..."
                    className="px-2 py-0.5 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#09ADEA] font-semibold text-[#1C1B1F]"
                    style={{ width: "120px" }}
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
                    className="flex items-center gap-1.5 mt-0.5 px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all cursor-pointer font-bold text-[#1C1B1F] text-[15px]"
                  >
                    <span>{patient.roomType || "Single"}</span>
                    <span className="text-gray-400 text-[10px]">▼</span>
                  </button>

                  {showRoomTypeDropdown && (
                    <>
                      {/* Invisible backdrop to dismiss dropdown */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowRoomTypeDropdown(false)} />
                      
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
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
          </div>
        </div>
        {role === "nurse" && (
          <button
            onClick={() => setActiveTab("observations")}
            className="flex items-center gap-2 px-5 py-3 cursor-pointer transition-all active:scale-95"
            style={{ backgroundColor: t.primary, color: "#fff", fontSize: "14px", fontWeight: 800, borderRadius: "14px", border: "none" }}
          >
            <Plus size={18} /> Add Observation
          </button>
        )}
      </div>

      {/* â”€â”€ Tab Bar â”€â”€ */}
      <div
        className="flex items-center gap-1 px-6 shrink-0 overflow-x-auto"
        style={{ backgroundColor: "#fff", borderBottom: `1px solid ${t.borderDefault}`, padding: "0 24px" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const isVisible = store.sectionVisibility[tab.key];
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
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          {renderTab()}
        </div>
      </div>

      {/* â”€â”€ Footer Link â”€â”€ */}
      {role === "nurse" && (
        <div className="flex justify-end px-8 pb-4 shrink-0">
          <a
            href="https://client.careinn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
            style={{ color: t.primary }}
          >
            <ExternalLink size={14} />
            {tr("careteam.gotoEmr")}
          </a>
        </div>
      )}

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
