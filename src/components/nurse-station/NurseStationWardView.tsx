import React, { useState, useEffect, useMemo } from "react";
import {
  BedDouble,
  Gem,
  Crown,
  ShieldAlert,
  Venus,
  Mars,
  Check,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  Activity,
  BedSingle,
  Filter,
  Settings2,
  RefreshCw,
  Video,
  Wrench,
  Utensils,
  UserRound,
  ClipboardList,
  UsersRound,
  CookingPot,
  LogOut,
  Monitor,
  Trash2,
  X,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useNurseStations } from "../../hooks/useNurseStations";
import { nurseStationService } from "../../services/nurseStationService";
import { NurseInterface } from "./bedside/nurse/NurseInterface";
import { nurseActions } from "./bedside/NurseDataStore";
import { useCareSuite } from "../../hooks/useCareSuite";
import { careSuiteService } from "../../services/careSuiteService";
import { userService } from "../../services/userService";
import { useFood, updateFood } from "../food/foodStore";
import { toast } from "sonner@2.0.3";
import { CareSignDoorDisplayScreen, FemaleIconSVG, MaleIconSVG } from "../CareSignPage";
import { careSignDeviceService, careSignTypeService } from "../../services/careSignService";

/* =========================================================================
   Design tokens
   ========================================================================= */
const C = {
  navy: "#16274D",
  cyan: "#4EBEE3",
  cyanDark: "#3DA5CA",
  green: "#1f9e75",
  amber: "#b9770b",
  red: "#c0392b",
  ink: "#1C1B1F",
  muted: "#5d6678",
};

interface ManualRoomInfo {
  mrn?: string;
  gender?: string;
  doa?: string;
  age?: string;
  mrp?: string;
  nurse?: string;
  department?: string;
  name?: string;
  nameAr?: string;
  contact?: string;
  emergencyName?: string;
  emergencyContact?: string;
  extension?: string;
  dischargeDate?: string;
  bed?: string;
}

/* Per room-type header styling — pale tint header + dark label, keeping the
   real CareInn type system (Single / VIP / Royal / Single isolated / other). */
function typeHeaderStyle(type: string): { bg: string; color: string } {
  const t = (type || "").toLowerCase();
  if (t.includes("vip")) return { bg: "#eaf7fc", color: "#1d7da3" };
  if (t.includes("royal")) return { bg: "#f2eff9", color: "#6b3fa0" };
  if (t.includes("isolat")) return { bg: "#fdf0e6", color: "#b45309" };
  if (t === "single" || t.includes("single")) return { bg: "#eef3f8", color: "#163968" };
  return { bg: "#f1f3f6", color: "#4b5563" }; // other / overridden
}

/* Human gender pictogram (ported from the approved ward-dashboard reference). */
function GenderPictogram({ gender }: { gender?: string }) {
  const isMale = (gender || "").toLowerCase() === "male";
  if (!isMale) {
    return (
      <svg viewBox="0 0 24 32" width={11} height={16} aria-label="Female" style={{ fill: "#e90078", color: "#e90078", overflow: "visible" }}>
        <circle cx="12" cy="4.3" r="3.5" />
        <path d="M8.4 9.2h7.2l3.3 11h-4.1V30h-3v-9.8h-.1V30h-3v-9.8H4.9l3.5-11Z" />
        <path d="M7.6 10.2 4.5 20.7M16.4 10.2l3.1 10.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 32" width={11} height={16} aria-label="Male" style={{ fill: "#10a7dc", color: "#10a7dc", overflow: "visible" }}>
      <circle cx="12" cy="4.3" r="3.5" />
      <path d="M8 9h8a2 2 0 0 1 2 2v9.5h-3V30h-3v-9.5h-.1V30h-3v-9.5H6V11a2 2 0 0 1 2-2Z" />
      <path d="M6.7 10.5v10M17.3 10.5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const EVENT_TONE: Record<string, { chipBg: string; chipColor: string; iconBg: string }> = {
  urgent: { chipBg: "#fcebe9", chipColor: "#c0392b", iconBg: "#c0392b" },
  pending: { chipBg: "#fbf1de", chipColor: "#b9770b", iconBg: "#b9770b" },
  active: { chipBg: "#eaf7fc", chipColor: "#1d7da3", iconBg: "#4EBEE3" },
  completed: { chipBg: "#e7f6f0", chipColor: "#1f9e75", iconBg: "#1f9e75" },
};

/* =========================================================================
   Room Card
   ========================================================================= */
function RoomCard({
  roomNumber,
  type,
  icon: Icon,
  isOccupied,
  mrn,
  doa,
  gender,
  age,
  requestLabel,
  requestTone,
  onOpen,
  variant,
  careSuiteRequests,
  kitchenOrder,
  onCardClick,
  isCareSign,
  onCareSignClick,
}: any) {
  const hs = typeHeaderStyle(type);
  const toneColor =
    requestTone === "urgent" ? C.red : requestTone === "pending" ? C.amber : requestTone === "active" ? "#1d7da3" : C.muted;

  return (
    <article
      onClick={onCardClick}
      className="rounded-[10px] overflow-hidden border border-[#dce4ee] bg-white flex flex-col min-h-[150px] shadow-[0_1px_2px_rgba(22,43,72,0.05)] transition hover:shadow-md hover:border-[#c3d0e0] cursor-pointer select-none font-['Poppins',sans-serif] relative group"
    >
      {/* Type header */}
      <header
        className="flex items-center justify-between px-3.5 h-[28px] shrink-0 text-[11px] font-extrabold tracking-wide uppercase"
        style={{ background: hs.bg, color: hs.color }}
      >
        <span className="flex items-center gap-1.5">
          <Icon size={13} strokeWidth={2.6} />
          {type}
        </span>

        {isCareSign && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onCareSignClick?.();
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#7B113A] text-white text-[9px] font-extrabold tracking-wider cursor-pointer hover:bg-[#5e0b2c] transition-colors"
            title="Click to preview & edit CareSign Door Signage"
          >
            <Sparkles size={10} /> CareSign
          </span>
        )}
      </header>

      {/* Body */}
      <div className="relative flex-1 px-3.5 py-2.5 flex flex-col">
        {!isOccupied ? (
          /* Available */
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2">
            <span className="text-[26px] font-extrabold text-[#16274D] leading-none">{roomNumber}</span>
            <span className="w-9 h-9 rounded-full bg-[#1f9e75] text-white flex items-center justify-center">
              <Check size={20} strokeWidth={3} />
            </span>
            <strong className="text-[12px] tracking-wider text-[#1f9e75] font-extrabold">AVAILABLE</strong>
          </div>
        ) : (
          <>
            {/* Room number + occupancy / status */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[22px] font-extrabold text-[#16274D] leading-none">{roomNumber}</h3>
              {variant === "kitchen" ? (
                kitchenOrder ? (
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase"
                    style={{
                      color: kitchenOrder.status === "Submitted" ? "#b9770b" : kitchenOrder.status === "Printed" ? "#1d7da3" : "#1f9e75",
                      background: kitchenOrder.status === "Submitted" ? "#fbf1de" : kitchenOrder.status === "Printed" ? "#eaf7fc" : "#e7f6f0",
                    }}
                  >
                    {kitchenOrder.status}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase bg-[#f1f3f6] text-[#9099ab]">No order</span>
                )
              ) : variant === "caresuite" ? (
                careSuiteRequests && careSuiteRequests.length > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase bg-[#fcebe9] text-[#c0392b]">
                    {careSuiteRequests.length} pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase bg-[#e7f6f0] text-[#1f9e75]">Clear</span>
                )
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#f3f5f8] text-[#2e3d59] text-[9px] font-extrabold tracking-wide">
                  OCCUPIED
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="mt-1.5 text-[11px] text-[#637381]">Age {String(age || "").replace("y", "") || "—"}</div>
            <div className="mt-0.5 text-[10.5px] text-[#9099ab]">
              <span className="font-mono">MRN {mrn || "—"}</span>
              {doa && <span> · DOA {doa}</span>}
            </div>

            {/* Kitchen order detail */}
            {variant === "kitchen" && kitchenOrder && (
              <div className="mt-2 pt-2 border-t border-[#eef1f6] text-[10.5px] text-[#5d6678] space-y-0.5">
                <div><span className="text-[#9099ab]">Diet:</span> <span className="font-semibold text-[#19233a]">{kitchenOrder.diet} ({kitchenOrder.meal})</span></div>
                <div className="truncate max-w-[180px]" title={kitchenOrder.lines?.map((l: any) => (Array.isArray(l) ? l[1] : l?.name)).join(", ")}>
                  <span className="text-[#9099ab]">Items:</span> {kitchenOrder.lines?.map((l: any) => (Array.isArray(l) ? l[1] : l?.name)).join(", ")}
                </div>
              </div>
            )}

            {/* CareSuite requests list */}
            {variant === "caresuite" && careSuiteRequests && careSuiteRequests.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#eef1f6] space-y-1">
                {careSuiteRequests.map((req) => (
                  <div key={req.id} className="flex justify-between items-center text-[10.5px]">
                    <span className="font-semibold text-[#19233a] truncate max-w-[120px]" title={req.itemName}>{req.itemName}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#eef1f6] text-[#5d6678]">{req.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Patient-profile request line + Open */}
            {variant === "profile" && (
              <>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] truncate" style={{ color: toneColor }}>
                  {requestTone === "urgent" ? <ShieldAlert size={13} /> : requestTone === "pending" ? <Utensils size={13} /> : requestTone === "active" ? <Video size={13} /> : <Wifi size={13} />}
                  <span className="truncate">{requestLabel}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen?.();
                  }}
                  className="absolute right-3 bottom-2 inline-flex items-center gap-0.5 text-[11px] font-bold text-[#0078d4] hover:text-[#16274D]"
                >
                  Open <ChevronRight size={15} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </article>
  );
}

/* =========================================================================
   Metric tile
   ========================================================================= */
function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: string }) {
  const bg =
    tone === "amber" ? C.amber : tone === "red" ? C.red : tone === "green" ? C.green : C.cyan;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: bg }}>
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <small className="block text-[10.5px] text-[#6d7c96] truncate">{label}</small>
        <strong className="block text-[17px] text-[#16274D] font-semibold leading-tight">{value}</strong>
      </span>
    </div>
  );
}

/* =========================================================================
   CareSign Door Signage Popup Modal (Inpatient Signage Look & Feel Preview)
   ========================================================================= */
function CareSignDoorDisplayPopup({
  room,
  stationId,
  onClose,
  onUpdate,
}: {
  room: any;
  stationId: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const csTypes = careSignTypeService.list();
  const csDevices = careSignDeviceService.list();
  const csDevice = csDevices.find((d) => d.room === room.no || d.deviceId === room.deviceId);

  const [status, setStatus] = useState<'Available' | 'Occupied'>(
    csDevice?.status || (room.state === "occupied" ? "Occupied" : "Available")
  );
  const [gender, setGender] = useState<'Female' | 'Male'>(
    csDevice?.gender || (room.gender === "Male" ? "Male" : "Female")
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    csDevice?.careSignTypeId || csTypes[0]?.id || ''
  );

  const selectedTypeObj = csTypes.find((t) => t.id === selectedTypeId) || csTypes[0];
  const bgColor = selectedTypeObj?.color || "#7B113A";
  const roomTypeName = selectedTypeObj?.name || room.type || "Suite Room";

  const handleSave = () => {
    // 1. Update CareSign device
    if (csDevice) {
      careSignDeviceService.update(csDevice.id, {
        status,
        gender,
        careSignTypeId: selectedTypeId,
        patientId: status === 'Available' ? 'No Patient' : (csDevice.patientId !== 'No Patient' ? csDevice.patientId : 'PAT2005'),
      });
    }

    // 2. Update manualOccupancies in localStorage for live Ward View sync
    const key = `${stationId}_${room.no}`;
    let manualMap: Record<string, any> = {};
    try {
      manualMap = JSON.parse(localStorage.getItem("careinn_manual_room_occupancy") || "{}");
    } catch {}

    if (status === "Available") {
      delete manualMap[key];
    } else {
      manualMap[key] = {
        ...(manualMap[key] || {}),
        mrn: room.mrn || "MRN1000005",
        gender,
        doa: room.doa || "27/07/2026",
        age: room.age || "43y",
      };
    }
    localStorage.setItem("careinn_manual_room_occupancy", JSON.stringify(manualMap));

    // 3. Update room type override
    let typeOverrides: Record<string, string> = {};
    try {
      typeOverrides = JSON.parse(localStorage.getItem("careinn_room_type_overrides") || "{}");
    } catch {}
    typeOverrides[key] = roomTypeName;
    localStorage.setItem("careinn_room_type_overrides", JSON.stringify(typeOverrides));

    window.dispatchEvent(new Event("storage"));
    toast.success(`Door Signage for Room ${room.no} updated`, {
      description: `Status: ${status} (${gender}) | Theme: ${roomTypeName}`,
    });

    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm font-['Poppins',sans-serif]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: bgColor }}>
              <Monitor size={22} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#16274D]">
                CareSign Door Signage Preview — Room {room.no}
              </h2>
              <p className="text-[12px] text-gray-500">
                Preview exact inpatient door display look & feel before changing status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 min-h-0">
          {/* Interactive Settings Bar */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
            {/* Status Option: Available / Occupied */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Room Status
              </label>
              <div className="flex bg-white border border-gray-200 p-1 rounded-xl gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setStatus("Available")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    status === "Available" ? "bg-[#10B981] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("Occupied")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    status === "Occupied" ? "bg-[#7B113A] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Occupied
                </button>
              </div>
            </div>

            {/* Patient Gender Option: Female / Male (when Occupied) */}
            {status === "Occupied" && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Patient Gender
                </label>
                <div className="flex bg-white border border-gray-200 p-1 rounded-xl gap-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setGender("Female")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gender === "Female" ? "bg-[#C2185B] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FemaleIconSVG className="w-3.5 h-4" color={gender === "Female" ? "#ffffff" : "#E91E63"} />
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("Male")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gender === "Male" ? "bg-[#1976D2] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <MaleIconSVG className="w-3.5 h-4" color={gender === "Male" ? "#ffffff" : "#00A3E0"} />
                    Male
                  </button>
                </div>
              </div>
            )}

            {/* CareSign Type (Theme Color) Option */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                CareSign Type (Theme Color)
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-[#16274D] bg-white focus:outline-none focus:border-[#4EBEE3]"
              >
                {csTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.color})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Door Signage Hardware Display Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: bgColor }} />
                Door Display Look & Feel Preview
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Theme: <span className="font-bold" style={{ color: bgColor }}>{bgColor}</span>
              </span>
            </div>

            <CareSignDoorDisplayScreen
              roomNumber={room.no}
              roomType={roomTypeName}
              status={status}
              gender={gender}
              bgColor={bgColor}
              patientId={csDevice?.patientId || room.mrn}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all shadow-md hover:opacity-90"
            style={{ backgroundColor: bgColor }}
          >
            Update Door Signage & Return
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   NurseStationWardView
   ========================================================================= */
export default function NurseStationWardView({
  focusStationId,
  onManageClick,
}: {
  focusStationId: string;
  onManageClick?: () => void;
}) {
  const { stations } = useNurseStations();
  const [selectedStationId, setSelectedStationId] = useState<string>(focusStationId);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedKitchenOrder, setSelectedKitchenOrder] = useState<any | null>(null);
  const [actionRoom, setActionRoom] = useState<any | null>(null);
  const [careSignModalRoom, setCareSignModalRoom] = useState<any | null>(null);
  const [bedFilter, setBedFilter] = useState<"all" | "attention" | "services" | "caresign">("all");
  const [eventFilter, setEventFilter] = useState<"all" | "pending" | "urgent">("all");

  const { library, requests, workflow, teams } = useCareSuite();
  const foodDb = useFood();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers(userService.listUsers());
  }, []);
  const [activeBottomTab, setActiveBottomTab] = useState<string>("Patient Profile");

  // Sync state if focusStationId changes
  useEffect(() => {
    if (focusStationId) setSelectedStationId(focusStationId);
  }, [focusStationId]);

  // Active station
  const activeStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0] || null;
  }, [stations, selectedStationId]);

  // Manual occupancy overlay + room-type overrides (shared localStorage contract)
  const [manualOccupancies, setManualOccupancies] = useState<Record<string, ManualRoomInfo>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("careinn_manual_room_occupancy") || "{}");
    } catch {
      return {};
    }
  });

  const [roomTypeOverrides, setRoomTypeOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("careinn_room_type_overrides") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setManualOccupancies(JSON.parse(localStorage.getItem("careinn_manual_room_occupancy") || "{}"));
        setRoomTypeOverrides(JSON.parse(localStorage.getItem("careinn_room_type_overrides") || "{}"));
      } catch {}
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClearManual = (roomNumber: string) => {
    if (!activeStation) return;
    const key = `${activeStation.id}_${roomNumber}`;
    const next = { ...manualOccupancies };
    delete next[key];
    setManualOccupancies(next);
    localStorage.setItem("careinn_manual_room_occupancy", JSON.stringify(next));
  };

  // Devices to resolve MRNs + terminal connection state
  const devices = useMemo(() => nurseStationService.listDevices(), []);
  const csDevices = useMemo(() => careSignDeviceService.list(), []);

  // Map station rooms → view rooms (sync-critical: unchanged logic + additive terminal fields)
  const mappedRooms = useMemo(() => {
    if (!activeStation) return [];

    const getTodayDMY = () => {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const todayDMY = getTodayDMY();

    return activeStation.rooms.map((r: any) => {
      const dev = r.deviceId ? devices.find((d) => d.deviceId === r.deviceId) : undefined;
      const key = `${activeStation.id}_${r.roomNumber}`;
      const manual = manualOccupancies[key];

      const mrn = manual?.mrn || dev?.mrn || "";
      const isOccupied = mrn.trim().length > 0;

      const overrideType = roomTypeOverrides[key];
      let type = overrideType || r.type || "Single";

      const num = r.roomNumber.toLowerCase();
      let icon = BedDouble;
      const group = type.toLowerCase();
      if (group.includes("vip") || num.includes("vip") || num.includes("v")) {
        type = "VIP";
        icon = Gem;
      } else if (group.includes("royal") || num.includes("royal") || num.includes("r")) {
        type = "Royal";
        icon = Crown;
      } else if (group.includes("isolated") || num.includes("iso") || num.includes("i")) {
        type = "Single isolated";
        icon = ShieldAlert;
      } else if (group !== "single" && overrideType) {
        icon = BedDouble;
      }

      const defaultName = isOccupied ? (manual?.gender === "Male" ? "Omar Saleh" : "Sara Saleh") : "";
      const defaultNameAr = isOccupied ? (manual?.gender === "Male" ? "عمر صالح" : "سارة صالح") : "";

      const isCareSign = r.sourceType === "caresign" || csDevices.some((d) => d.room === r.roomNumber || d.deviceId === r.deviceId);

      return {
        no: r.roomNumber,
        type,
        icon,
        state: isOccupied ? "occupied" : "available",
        mrn,
        gender: manual?.gender || (isOccupied ? "Female" : ""),
        doa: manual?.doa || (dev as any)?.doa || (isOccupied ? todayDMY : ""),
        age: manual?.age || (isOccupied ? "43y" : ""),
        mrp: dev?.poc || "Dr. Abdullah",
        nurse: "Amal AlAmer",
        department: "Delivery",
        name: manual?.name || defaultName,
        nameAr: manual?.nameAr || defaultNameAr,
        contact: manual?.contact || "",
        emergencyName: manual?.emergencyName || "",
        emergencyContact: manual?.emergencyContact || "",
        extension: manual?.extension || "",
        dischargeDate: manual?.dischargeDate || "",
        bed: manual?.bed || dev?.bedNo || "1",
        // additive (non-breaking) — real terminal status from the device
        deviceId: r.deviceId,
        hasDevice: !!r.deviceId,
        terminalOnline: dev?.isConnected ?? false,
        hasManual: !!(manual && manual.mrn),
        sourceType: r.sourceType,
        isCareSign,
      };
    });
  }, [activeStation, devices, csDevices, manualOccupancies, roomTypeOverrides]);

  // Push synthesized patient context into the bedside store, then open it (unchanged).
  const handleRoomClick = (room: any) => {
    if (!activeStation) return;
    nurseActions.updatePatient({
      mrn: room.mrn || "",
      room: room.no,
      age: room.age?.replace("y", "") || "",
      admissionDate: room.doa || "",
      name: room.name || "",
      nameAr: room.nameAr || "",
      nameKey: "",
      bed: room.bed || "",
      roomType: room.type || "Single",
      stationId: activeStation.id,
      sex: room.gender || "",
      dob: "",
      dischargeDate: room.dischargeDate || "",
      contact: room.contact || "",
      emergencyContact: room.emergencyContact || "",
      emergencyName: room.emergencyName || "",
      extension: room.extension || "",
    });
    setSelectedRoom(room);
  };

  const switchTab = (label: string) => {
    setActionRoom(null);
    if (label === "CareSign") {
      setBedFilter("caresign");
      setActiveBottomTab("CareSign");
    } else if (label === "Patient Profile" || label === "Kitchen" || label === "CARESUITE") {
      if (bedFilter === "caresign") setBedFilter("all");
      setActiveBottomTab(label);
    } else {
      toast.info(`${label} will be updated soon`);
    }
  };

  // ---- derived live data (all real; no mock) --------------------------------
  const terminalStatus = workflow[workflow.length - 1]?.status;
  const firstStatus = workflow[0]?.status;
  const wardRoomNos = mappedRooms.map((r) => r.no);
  const activeReqs = requests.filter((r) => wardRoomNos.includes(r.room) && r.status !== terminalStatus);
  const activeKitchen = (foodDb?.orders || []).filter(
    (o: any) => wardRoomNos.includes(o.room + o.bed) && o.status !== "Delivered",
  );

  const roomActiveReqs = (no: string) => activeReqs.filter((r) => r.room === no);
  const roomKitchen = (no: string) => activeKitchen.find((o: any) => o.room + o.bed === no);

  // KPIs (scoped to active view context)
  const isCareSignMode = bedFilter === "caresign" || activeBottomTab === "CareSign";
  const contextRooms = mappedRooms.filter((r) => (isCareSignMode ? r.isCareSign : !r.isCareSign));
  const total = contextRooms.length;
  const occupiedCount = contextRooms.filter((r) => r.state === "occupied").length;
  const availableCount = total - occupiedCount;
  const terminalRooms = contextRooms.filter((r) => r.hasDevice);
  const terminalsOnline = terminalRooms.filter((r) => r.terminalOnline).length;
  const terminalsTotal = terminalRooms.length;
  const activeRequestsCount = activeReqs.length + activeKitchen.length;
  const urgentCount = activeReqs.filter((r) => r.priority === "High").length;
  const awaitingCount =
    activeReqs.filter((r) => r.status === firstStatus).length +
    activeKitchen.filter((o: any) => o.status === "Submitted").length;

  // Per-room request summary (for the profile card request line)
  const roomRequestSummary = (no: string): { label: string; tone: "normal" | "active" | "pending" | "urgent" } => {
    const reqs = roomActiveReqs(no);
    const kit = roomKitchen(no);
    if (reqs.some((r) => r.priority === "High")) {
      const r = reqs.find((x) => x.priority === "High")!;
      const item = library.find((l) => l.id === r.libraryItemId);
      return { label: item?.nameEn ?? "Urgent request", tone: "urgent" };
    }
    if (kit && kit.status === "Submitted") return { label: "Meal order pending", tone: "pending" };
    if (reqs.length > 0) {
      const item = library.find((l) => l.id === reqs[0].libraryItemId);
      return { label: item?.nameEn ?? "Active request", tone: "active" };
    }
    if (kit) return { label: `Meal order (${kit.status})`, tone: "active" };
    return { label: "No active requests", tone: "normal" };
  };

  const roomNeedsAttention = (no: string) => roomActiveReqs(no).some((r) => r.priority === "High");
  const roomHasService = (no: string) => roomActiveReqs(no).length > 0 || !!roomKitchen(no);

  const visibleRooms = mappedRooms.filter((r) => {
    if (bedFilter === "caresign" || activeBottomTab === "CareSign") {
      return r.isCareSign;
    }
    // Patient View, Kitchen View, Housekeeping View (non-CareSign views): HIDE CareSign devices!
    if (r.isCareSign) return false;

    if (bedFilter === "attention") return roomNeedsAttention(r.no);
    if (bedFilter === "services") return roomHasService(r.no);
    return true;
  });

  // Ward Overview events (real CareSuite + Kitchen activity for this ward)
  const careSuiteEvents = activeReqs.map((r) => {
    const item = library.find((l) => l.id === r.libraryItemId);
    const tone = r.priority === "High" ? "urgent" : r.status === firstStatus ? "pending" : "active";
    return {
      key: "r" + r.id,
      room: r.room,
      title: `${item?.nameEn ?? "Request"}`,
      status: r.status,
      time: new Date(r.lastStatusChangeAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tone,
      ts: r.lastStatusChangeAt,
    };
  });
  const kitchenEvents = activeKitchen.map((o: any) => {
    const tone = o.status === "Submitted" ? "pending" : "active";
    return { key: "k" + o.id, room: o.room + o.bed, title: "Meal order", status: o.status, time: o.time || "", tone, ts: 0 };
  });
  const allEvents =
    activeBottomTab === "CARESUITE" ? careSuiteEvents : activeBottomTab === "Kitchen" ? kitchenEvents : [...careSuiteEvents, ...kitchenEvents];
  const sortedEvents = [...allEvents].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const visibleEvents = sortedEvents.filter((e) => (eventFilter === "all" ? true : e.tone === eventFilter));
  const pendingEventCount = sortedEvents.filter((e) => e.tone === "pending").length;
  const urgentEventCount = sortedEvents.filter((e) => e.tone === "urgent").length;

  // Bedside interface takes over the whole view (unchanged)
  if (selectedRoom) {
    return <NurseInterface role="nurse" onClose={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="min-h-full w-full bg-[#f8fafc] font-['Poppins',sans-serif] text-[#1C1B1F] flex flex-col">
      {/* Metrics */}
      <div className="mx-6 mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 rounded-xl border border-[#e7e9f0] bg-white overflow-hidden divide-x divide-[#eef1f6]">
        <Metric label="Occupied" value={`${occupiedCount} / ${total}`} icon={BedSingle} tone="blue" />
        <Metric label="Active Requests" value={String(activeRequestsCount)} icon={Bell} tone="blue" />
        <Metric label="Awaiting Response" value={String(awaitingCount)} icon={Activity} tone="amber" />
        <Metric label="Urgent" value={String(urgentCount)} icon={ShieldAlert} tone="red" />
        <Metric label="Terminals Online" value={terminalsTotal > 0 ? `${terminalsOnline} / ${terminalsTotal}` : "—"} icon={Wifi} tone="green" />
      </div>

      {/* Toolbar — bed filter */}
      <div className="px-6 pt-4 pb-1 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-[#d8e1ec] overflow-hidden bg-white">
          {[
            { id: "all", label: "All Beds", icon: BedSingle },
            { id: "attention", label: "Needs Attention", icon: ShieldAlert },
            { id: "services", label: "Service Requests", icon: Monitor },
            { id: "caresign", label: "CareSign View", icon: Sparkles },
          ].map((f) => {
            const on = bedFilter === (f.id as any);
            const Ico = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setBedFilter(f.id as any)}
                className={
                  "inline-flex items-center gap-2 h-[36px] px-4 text-[12px] border-r border-[#e1e7ef] last:border-r-0 transition-colors " +
                  (on ? "text-[#7B113A] bg-[#fde8ef] font-bold shadow-[inset_0_-2px_#7B113A]" : "text-[#53637f] hover:bg-[#f7fbff]")
                }
              >
                <Ico size={15} />
                {f.label}
              </button>
            );
          })}
        </div>
        {onManageClick && (
          <button
            onClick={onManageClick}
            className="inline-flex items-center gap-2 h-[36px] px-4 rounded-lg border border-[#d5deea] bg-white text-[#16274D] text-[13px] font-medium hover:bg-[#f4f8fc] transition-colors"
          >
            <Settings2 size={16} /> Manage
          </button>
        )}
      </div>

      {/* Main workspace: grid + right panel */}
      <div className="flex-1 flex gap-4 px-6 py-4 min-h-0">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {mappedRooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <BedDouble className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-[16px] font-semibold text-[#16274D] mb-1">No rooms configured</h3>
              <p className="text-[13px] text-gray-500 max-w-sm mb-6">
                Please add rooms to this station in the Manage tab before they can be displayed here.
              </p>
              {activeStation && onManageClick && (
                <button
                  onClick={onManageClick}
                  className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors text-[13px] font-semibold"
                >
                  Add Rooms Now
                </button>
              )}
            </div>
          ) : visibleRooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
              <Filter className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-[15px] font-semibold text-[#16274D] mb-1">No rooms match this filter</h3>
              <button onClick={() => setBedFilter("all")} className="mt-2 text-[13px] text-[#4EBEE3] font-medium">Show all beds</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleRooms.map((r, i) => {
                const roomReqs = roomActiveReqs(r.no).map((req) => {
                  const libItem = library.find((l) => l.id === req.libraryItemId);
                  return { id: req.id, itemName: libItem?.nameEn ?? "Unknown", status: req.status, priority: req.priority };
                });
                const kitchenOrder = roomKitchen(r.no);
                const summary = roomRequestSummary(r.no);
                const variant = activeBottomTab === "CARESUITE" ? "caresuite" : activeBottomTab === "Kitchen" ? "kitchen" : "profile";

                return (
                  <RoomCard
                    key={r.no + "_" + i}
                    roomNumber={r.no}
                    type={r.type}
                    icon={r.icon}
                    isOccupied={r.state === "occupied"}
                    mrn={r.mrn}
                    gender={r.gender}
                    doa={r.doa}
                    age={r.age}
                    variant={variant as any}
                    requestLabel={summary.label}
                    requestTone={summary.tone}
                    careSuiteRequests={roomReqs}
                    kitchenOrder={kitchenOrder}
                    isCareSign={r.isCareSign}
                    onCareSignClick={() => setCareSignModalRoom(r)}
                    onOpen={() => {
                      setActionRoom(r);
                    }}
                    onCardClick={() => {
                      if (r.isCareSign || bedFilter === "caresign") {
                        setCareSignModalRoom(r);
                      } else if (activeBottomTab === "CARESUITE") {
                        const first = roomActiveReqs(r.no)[0];
                        if (first) setSelectedRequest(first);
                        else toast.info("No active CareSuite requests for this room.");
                      } else if (activeBottomTab === "Kitchen") {
                        if (kitchenOrder) setSelectedKitchenOrder(kitchenOrder);
                        else toast.info("No active Kitchen orders for this room.");
                      } else if (r.state === "occupied") {
                        handleRoomClick(r);
                      } else {
                        setCareSignModalRoom(r);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        {actionRoom ? (
          <PatientActionsPanel
            room={actionRoom}
            summary={roomRequestSummary(actionRoom.no)}
            onClose={() => setActionRoom(null)}
            onOpenBedside={() => handleRoomClick(actionRoom)}
            onClearManual={actionRoom.hasManual ? () => { handleClearManual(actionRoom.no); setActionRoom(null); } : undefined}
            onMealOrder={() => { setActionRoom(null); setActiveBottomTab("Kitchen"); }}
            onHousekeeping={() => { setActionRoom(null); setActiveBottomTab("CARESUITE"); }}
          />
        ) : (
          <WardOverviewPanel
            wardName={activeStation?.name || "—"}
            events={visibleEvents}
            filter={eventFilter}
            onFilter={setEventFilter}
            counts={{ all: sortedEvents.length, pending: pendingEventCount, urgent: urgentEventCount }}
            emptyLabel={
              activeBottomTab === "CARESUITE" ? "No active requests" : activeBottomTab === "Kitchen" ? "No active orders" : "No live events"
            }
          />
        )}
      </div>

      {/* Bottom tabs (mode switch) */}
      <div className="px-6 py-3 flex gap-2 items-center bg-white border-t border-gray-100 shrink-0 flex-wrap">
        {[
          { label: "Patient View", value: "Patient Profile" },
          { label: "CareSign", value: "CareSign" },
          { label: "Kitchen View", value: "Kitchen" },
          { label: "Housekeeping View", value: "CARESUITE" },
        ].map(({ label, value }) => {
          const active = activeBottomTab === value;
          return (
            <button
              key={value}
              onClick={() => switchTab(value)}
              className={
                "px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all " +
                (active ? "bg-[#4EBEE3] text-white border-[#4EBEE3]" : "bg-transparent text-[#9099ab] border-[#e2e8f0] hover:text-[#16274D] hover:border-[#cbd5e1]")
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {selectedRequest && (
        <RequestDetailsModal
          requestId={selectedRequest.id}
          onClose={() => setSelectedRequest(null)}
          users={users}
          library={library}
          teams={teams}
          requests={requests}
          workflow={workflow}
        />
      )}

      {selectedKitchenOrder && (
        <KitchenOrderDetailsModal order={selectedKitchenOrder} onClose={() => setSelectedKitchenOrder(null)} />
      )}

      {careSignModalRoom && activeStation && (
        <CareSignDoorDisplayPopup
          room={careSignModalRoom}
          stationId={activeStation.id}
          onClose={() => setCareSignModalRoom(null)}
          onUpdate={() => setActionRoom(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   Ward Overview panel (read-only live events)
   ========================================================================= */
function WardOverviewPanel({
  wardName,
  events,
  filter,
  onFilter,
  counts,
  emptyLabel,
}: {
  wardName: string;
  events: Array<{ key: string; room: string; title: string; status: string; time: string; tone: string }>;
  filter: "all" | "pending" | "urgent";
  onFilter: (f: "all" | "pending" | "urgent") => void;
  counts: { all: number; pending: number; urgent: number };
  emptyLabel: string;
}) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <aside className="w-[320px] shrink-0 bg-white border border-[#e7e9f0] rounded-xl flex flex-col self-start max-h-[calc(100vh-220px)] overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-[#eef1f6]">
        <h2 className="text-[18px] font-semibold text-[#16274D]">Ward Overview</h2>
        <p className="text-[12px] text-[#607391] mt-0.5">Live events from Ward {wardName}</p>
      </div>
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
        {([
          ["all", "All", counts.all],
          ["pending", "Pending", counts.pending],
          ["urgent", "Urgent", counts.urgent],
        ] as const).map(([id, label, n]) => {
          const on = filter === id;
          return (
            <button
              key={id}
              onClick={() => onFilter(id)}
              className={
                "inline-flex items-center gap-1.5 h-[32px] px-3 rounded-lg text-[12px] border transition-colors " +
                (on ? "text-[#1d7da3] border-[#4EBEE3] bg-[#f7fcff] font-semibold" : "text-[#5c6c86] border-[#d8e1ec] hover:bg-[#f7fbff]")
              }
            >
              {label} <strong className="font-semibold">{n}</strong>
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto px-2">
        {events.length === 0 ? (
          <p className="text-center text-[12px] text-[#9099ab] py-10">{emptyLabel}</p>
        ) : (
          events.map((e) => {
            const t = EVENT_TONE[e.tone] || EVENT_TONE.active;
            return (
              <div key={e.key} className="flex gap-3 px-2 py-3 border-t border-[#eef1f6] first:border-t-0">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5" style={{ background: t.iconBg }}>
                  {e.tone === "completed" ? <Check size={16} /> : e.title === "Meal order" ? <Utensils size={15} /> : <Bell size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#f0f3f7] text-[#16274D] text-[10px] font-extrabold shrink-0">{e.room}</span>
                    <strong className="text-[11.5px] text-[#19385f] truncate">{e.title}</strong>
                    <time className="ml-auto text-[11px] text-[#657895] shrink-0">{e.time}</time>
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold" style={{ background: t.chipBg, color: t.chipColor }}>
                    {e.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <p className="text-center text-[10px] text-[#7585a0] py-3 border-t border-[#eef1f6]">Last updated {now}</p>
    </aside>
  );
}

/* =========================================================================
   Patient Actions panel (replaces Ward Overview when a room is opened)
   ========================================================================= */
function PatientActionsPanel({
  room,
  summary,
  onClose,
  onOpenBedside,
  onClearManual,
  onMealOrder,
  onHousekeeping,
}: {
  room: any;
  summary: { label: string; tone: string };
  onClose: () => void;
  onOpenBedside: () => void;
  onClearManual?: () => void;
  onMealOrder: () => void;
  onHousekeeping: () => void;
}) {
  const soon = (label: string) => () => toast.info(`${label} will be updated soon`);
  const actions: Array<[any, string, () => void]> = [
    [UserRound, "Patient Profile", onOpenBedside],
    [ClipboardList, "Treatment Plan", soon("Treatment Plan")],
    [UsersRound, "Assign Nurse", soon("Assign Nurse")],
    [CookingPot, "Meal Order", onMealOrder],
    [Wrench, "Housekeeping", onHousekeeping],
    [LogOut, "Discharge Plan", soon("Discharge Plan")],
    [Monitor, "Send to Terminal", () => toast.success("Sent to terminal")],
    [RefreshCw, "Refresh Terminal", () => toast.success("Refresh signal sent to terminal")],
  ];
  const toneColor = summary.tone === "urgent" ? C.red : summary.tone === "pending" ? C.amber : "#1d7da3";

  return (
    <aside className="w-[320px] shrink-0 bg-white border border-[#e7e9f0] rounded-xl flex flex-col self-start max-h-[calc(100vh-220px)] overflow-auto">
      <div className="px-4 pt-4 pb-3 border-b border-[#eef1f6] flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-[#16274D]">Room {room.no}</h2>
          <p className="text-[12px] text-[#607391] mt-0.5 uppercase tracking-wide">{room.type}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-[#9099ab] hover:text-[#16274D] rounded-md" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        {/* Summary */}
        <div className="rounded-xl border border-[#dbe4ee] p-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#f3f5f8] text-[#2e3d59] text-[9px] font-extrabold tracking-wide">
            OCCUPIED
          </span>
          <h3 className="mt-3 text-[16px] font-semibold text-[#16274D]">Age {String(room.age || "").replace("y", "") || "—"}</h3>
          <p className="text-[12px] text-[#64738d] mt-0.5">DOA {room.doa || "—"} · MRN <span className="font-mono">{room.mrn || "—"}</span></p>
          <span className={"inline-flex items-center gap-1.5 mt-2 text-[11px] " + (room.terminalOnline ? "text-[#1f9e75]" : "text-[#c0392b]")}>
            {room.terminalOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            Terminal {room.terminalOnline ? "Online" : room.hasDevice ? "Offline" : "Not linked"}
          </span>
        </div>

        {/* Active request */}
        {summary.tone !== "normal" && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border p-3.5" style={{ borderColor: toneColor + "55", background: toneColor + "0d", color: toneColor }}>
            {summary.tone === "urgent" ? <ShieldAlert size={17} /> : summary.tone === "pending" ? <Utensils size={17} /> : <Video size={17} />}
            <span className="min-w-0">
              <small className="block text-[9px] uppercase tracking-wide">Active request</small>
              <strong className="block text-[12px] truncate">{summary.label}</strong>
            </span>
          </div>
        )}

        {/* Quick actions */}
        <h3 className="text-[13px] font-semibold text-[#1a355d] mt-5 mb-2.5">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {actions.map(([Icon, label, fn]) => (
            <button
              key={label}
              onClick={fn}
              className="min-h-[48px] px-3 flex items-center gap-2 rounded-lg border border-[#d8e1ec] text-[#087fc2] text-[11px] text-left hover:border-[#74c4e8] hover:bg-[#f5fbfe] transition-colors"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {onClearManual && (
          <button
            onClick={onClearManual}
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#c0392b] hover:underline font-medium"
          >
            <Trash2 size={13} /> Clear manual details
          </button>
        )}
      </div>
    </aside>
  );
}

/* =========================================================================
   Modals (preserved)
   ========================================================================= */
function RequestDetailsModal({ requestId, onClose, users, library, teams, requests, workflow }: any) {
  const request = requests.find((r: any) => r.id === requestId);
  if (!request) return null;

  const item = library.find((l: any) => l.id === request.libraryItemId);

  const historyList = (() => {
    if (request.history && request.history.length > 0) {
      if (request.history.some((h: any) => h.status === request.status)) {
        return request.history;
      }
    }
    const currentStepIdx = workflow.findIndex((w: any) => w.status === request.status);
    if (currentStepIdx < 0) {
      return [{ status: "Sent", timestamp: request.createdAt }];
    }
    const stepsToRender = workflow.slice(0, currentStepIdx + 1);
    const start = request.createdAt;
    const end = request.lastStatusChangeAt;
    const count = stepsToRender.length;
    return stepsToRender.map((w: any, idx: number) => {
      let timestamp = start;
      if (count > 1) timestamp = start + ((end - start) * idx) / (count - 1);
      return { status: w.status, timestamp: Math.round(timestamp) };
    });
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16274D]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-['Poppins',sans-serif]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#e7e9f0] flex items-center justify-between bg-[#f7f8fb]">
          <h2 className="text-lg font-semibold text-[#16274D]">Request Details</h2>
          <button onClick={onClose} className="p-1.5 text-[#9099ab] hover:text-[#16274D] hover:bg-white rounded-md transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-[#5d6678] mb-1">Item</div>
              <div className="font-medium text-[#16274D]">{item?.nameEn ?? "Unknown"}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[#5d6678] mb-1">Room</div>
                <div className="font-mono bg-[#f7f8fb] px-2 py-0.5 rounded text-[#16274D] inline-block">{request.room}</div>
              </div>
              <div>
                <div className="text-sm text-[#5d6678] mb-1 font-medium">Priority</div>
                <span className="inline-flex items-center text-[12px] font-semibold px-2.5 py-[3px] rounded-[20px] bg-[#fcebe9] text-[#c0392b]">
                  {request.priority}
                </span>
              </div>
            </div>
            {request.comment && (
              <div>
                <div className="text-sm text-[#5d6678] mb-1">Comment</div>
                <div className="text-sm text-[#19233a] bg-[#fbf1de] p-3 rounded-lg border border-[#f5e3c3]">{request.comment}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-[#5d6678] mb-2 font-medium">History Audit</div>
              <div className="space-y-3 border-l-2 border-[#e7e9f0] ml-2 pl-4 py-1">
                {historyList.map((h: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4EBEE3] border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13px] text-[#16274D] w-24">{h.status}</span>
                      <span className="text-[12px] text-[#9099ab]">
                        {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#5d6678] mb-2 font-medium">Assign User</div>
              <select
                value={request.assignedUserId || ""}
                onChange={(e) => careSuiteService.assignRequestUser(request.id, e.target.value || null)}
                className="w-full bg-[#f7f8fb] border border-[#d6dae6] rounded-lg px-3 py-2 text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]"
              >
                <option value="">Unassigned</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.username} ({u.userRole})</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenOrderDetailsModal({ order, onClose }: { order: any; onClose: () => void }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16274D]/40 backdrop-blur-sm p-4 font-['Poppins',sans-serif]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#e7e9f0] flex items-center justify-between bg-[#f7f8fb]">
          <h2 className="text-lg font-semibold text-[#16274D]">Kitchen Order Details</h2>
          <button onClick={onClose} className="p-1.5 text-[#9099ab] hover:text-[#16274D] hover:bg-white rounded-md transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase">Room</div>
              <div className="font-semibold text-gray-800">{order.room}{order.bed}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Meal</div>
              <div className="font-semibold text-gray-800">{order.meal}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Diet</div>
            <div className="font-semibold text-gray-800">{order.diet}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Items</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mt-1">
              {order.lines?.map((l: any, i: number) => (
                <li key={i}>{Array.isArray(l) ? l[1] : l?.name}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {order.status !== "Delivered" && (
              <>
                <button
                  onClick={() => {
                    updateFood((draft) => {
                      const o = draft.orders.find((x: any) => x.id === order.id);
                      if (o) o.status = "Printed";
                    });
                    toast.success("Order printed successfully");
                    onClose();
                  }}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-[13px] transition-colors"
                >
                  Print Order
                </button>
                <button
                  onClick={() => {
                    updateFood((draft) => {
                      const o = draft.orders.find((x: any) => x.id === order.id);
                      if (o) o.status = "Delivered";
                    });
                    toast.success("Order delivered successfully");
                    onClose();
                  }}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-[13px] transition-colors"
                >
                  Deliver Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
