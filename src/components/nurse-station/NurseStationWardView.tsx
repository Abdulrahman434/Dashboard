import React, { useState, useEffect, useMemo } from "react";
import {
  BedDouble,
  Gem,
  Crown,
  ShieldAlert,
  Droplet,
  BarChart3,
  CalendarDays,
  Clock,
  Venus,
  Mars,
  Sliders,
} from "lucide-react";
import { useNurseStations } from "../../hooks/useNurseStations";
import { nurseStationService, type DeviceRow } from "../../services/nurseStationService";
import { NurseInterface } from "./bedside/nurse/NurseInterface";
import { nurseActions } from "./bedside/NurseDataStore";

/* =========================================================================
   Design tokens — matching the theme in the image
   ========================================================================= */
const C = {
  headerNavy: "#152A4C",
  cardNavy: "#18355E",
  vipBlue: "#09ADEA",
  vipBlueLight: "#4BBDE3",
  royalPurple: "#8B2975",
  royalPurpleLight: "#C776C6",
  isolatedOrange: "#EEBB2C",
  green: "#01C874",
  red: "#DF4354",
  redBright: "#E74040",
  redBg: "#FEF7F7",
  redBgStrong: "#FFCECE",
  gray100: "#F2F2F2",
  gray150: "#FAFAFA",
  gray300: "#C4C9CE",
  gray400: "#B8B8B8",
  gray500: "#637381",
  ink: "#1C1B1F",
  ink2: "#343434",
};

const notifications = [
  { room: "301A", tagBg: C.cardNavy, type: "HK Request",      time: "09:10", color: C.ink2,    rowBg: "transparent" },
  { room: "302A", tagBg: C.cardNavy, type: "HK Request",      time: "09:15", color: C.ink2,    rowBg: "transparent" },
  { room: "303A", tagBg: C.gray400,  type: "HK Request",      time: "09:15", color: C.gray400, rowBg: "transparent" },
  { room: "312A", tagBg: C.gray400,  type: "HK Request",      time: "09:18", color: C.red,     rowBg: C.redBg },
  { room: "301A", tagBg: C.cardNavy, type: "Discharge Order", time: "09:10", color: C.ink2,    rowBg: C.redBgStrong },
];

interface ManualRoomInfo {
  mrn?: string;
  gender?: string;
  doa?: string;
  age?: string;
  mrp?: string;
  nurse?: string;
  department?: string;
}

/* =========================================================================
   Room Card Component
   ========================================================================= */
function RoomCard({
  roomNumber,
  type,
  headerColor,
  icon: Icon,
  isOccupied,
  mrn,
  doa,
  gender,
  age,
  onClearManual,
  onClick,
}: {
  roomNumber: string;
  type: string;
  headerColor: string;
  icon: any;
  isOccupied: boolean;
  mrn?: string;
  doa?: string;
  gender?: string;
  age?: string;
  onClearManual?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="text-left rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white flex flex-col justify-between min-h-[175px]
                 transition hover:shadow-md hover:scale-[1.01] cursor-pointer select-none"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 text-white font-['Poppins',sans-serif] shrink-0"
        style={{ background: headerColor }}
      >
        <span className="text-[11px] font-bold tracking-wide uppercase opacity-95">{type}</span>
        <Icon size={13} strokeWidth={2.5} />
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-white font-['Poppins',sans-serif]">
        {isOccupied ? (
          <>
            {/* Room Number and Status Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[18px] font-bold text-[#18355E] tracking-tight">{roomNumber}</span>
              <span className="bg-[#FEF2F2] text-[#DF4354] font-bold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">
                Occupied
              </span>
            </div>

            {/* Dynamic Inner Details */}
            <div className="text-[11px] leading-[1.4] text-[#637381] space-y-1 mt-1 font-['Poppins',sans-serif]">
              <div className="flex items-center gap-1">
                <span className="font-normal text-gray-400">MRN:</span>
                <span className="font-semibold text-gray-800 font-sans">{mrn}</span>
              </div>

              <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                {gender?.toLowerCase() === "male" ? (
                  <>
                    <Mars size={11} className="text-blue-500" strokeWidth={2.5} />
                    <span className="text-gray-400">Male</span>
                  </>
                ) : (
                  <>
                    <Venus size={11} className="text-pink-400" strokeWidth={2.5} />
                    <span className="text-gray-400">Female</span>
                  </>
                )}
                {age && <span className="text-gray-400">({age})</span>}
              </div>

              {doa && (
                <div className="text-[10px] text-gray-400 mt-0.5">
                  <span className="font-normal text-gray-400">DOA:</span> <span className="font-sans">{doa}</span>
                </div>
              )}

              {onClearManual && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearManual();
                  }}
                  className="mt-2 text-[9px] text-red-500 hover:text-red-700 font-semibold underline block text-right font-sans"
                >
                  Clear Details
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center font-['Poppins',sans-serif] py-4 gap-1">
            <span className="text-[32px] font-extrabold text-[#18355E] tracking-tight leading-none">
              {roomNumber}
            </span>
            <span className="bg-[#E8F8F0] text-[#01C874] font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
              Available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   NurseStationWardView Component
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
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Sync state if focusStationId changes
  useEffect(() => {
    if (focusStationId) {
      setSelectedStationId(focusStationId);
    }
  }, [focusStationId]);

  // Determine active station
  const activeStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0] || null;
  }, [stations, selectedStationId]);

  // Load manual room details from local storage
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

  const handleUpdateManual = (roomNumber: string, info: ManualRoomInfo) => {
    if (!activeStation) return;
    const key = `${activeStation.id}_${roomNumber}`;
    const next = { ...manualOccupancies, [key]: info };
    setManualOccupancies(next);
    localStorage.setItem("careinn_manual_room_occupancy", JSON.stringify(next));
  };

  const handleClearManual = (roomNumber: string) => {
    if (!activeStation) return;
    const key = `${activeStation.id}_${roomNumber}`;
    const next = { ...manualOccupancies };
    delete next[key];
    setManualOccupancies(next);
    localStorage.setItem("careinn_manual_room_occupancy", JSON.stringify(next));
  };

  // List of devices to resolve MRNs
  const devices = useMemo(() => nurseStationService.listDevices(), []);

  // Map active station rooms to MappedRoom objects
  const mappedRooms = useMemo(() => {
    if (!activeStation) return [];

    const getTodayDMY = () => {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const todayDMY = getTodayDMY();

    return activeStation.rooms.map((r) => {
      // Find corresponding device
      const dev = r.deviceId ? devices.find((d) => d.deviceId === r.deviceId) : undefined;

      // Check manual occupancy info
      const key = `${activeStation.id}_${r.roomNumber}`;
      const manual = manualOccupancies[key];

      // occupied if device has MRN OR manual MRN entered
      const mrn = manual?.mrn || dev?.mrn || "";
      const isOccupied = mrn.trim().length > 0;

      // Check room type override
      const overrideType = roomTypeOverrides[key];
      let type = overrideType || r.type || "Single";

      // design styling
      const num = r.roomNumber.toLowerCase();
      let headerColor = C.cardNavy;
      let icon = BedDouble;

      const group = type.toLowerCase();
      if (group.includes("vip") || num.includes("vip") || num.includes("v")) {
        type = "VIP";
        headerColor = C.vipBlue;
        icon = Gem;
      } else if (group.includes("royal") || num.includes("royal") || num.includes("r")) {
        type = "Royal";
        headerColor = C.royalPurple;
        icon = Crown;
      } else if (group.includes("isolated") || num.includes("iso") || num.includes("i")) {
        type = "Single isolated";
        headerColor = C.isolatedOrange;
        icon = ShieldAlert;
      } else if (group !== "single" && overrideType) {
        // If it's an overridden type and NOT VIP, Royal, Single, or Isolated, it is "other" -> gray header!
        headerColor = "#A0AEC0"; // a premium gray color
        icon = BedDouble;
      }

      const defaultName = isOccupied ? (manual?.gender === "Male" ? "Omar Saleh" : "Sara Saleh") : "";
      const defaultNameAr = isOccupied ? (manual?.gender === "Male" ? "عمر صالح" : "سارة صالح") : "";

      return {
        no: r.roomNumber,
        type,
        headerColor,
        icon,
        state: isOccupied ? "occupied" : "available",
        mrn: mrn,
        gender: manual?.gender || (isOccupied ? "Female" : ""),
        doa: manual?.doa || dev?.doa || (isOccupied ? todayDMY : ""),
        age: manual?.age || (isOccupied ? "43y" : ""),
        mrp: dev?.poc || "Dr. Abdullah",
        nurse: "Amal AlAmer",
        department: "Delivery",
        // persisted manual profile fields
        name: manual?.name || defaultName,
        nameAr: manual?.nameAr || defaultNameAr,
        contact: manual?.contact || "",
        emergencyName: manual?.emergencyName || "",
        emergencyContact: manual?.emergencyContact || "",
        extension: manual?.extension || "",
        dischargeDate: manual?.dischargeDate || "",
        bed: manual?.bed || (dev?.bedNo || "1"),
      };
    });
  }, [activeStation, devices, manualOccupancies, roomTypeOverrides]);

  // Click handler to update store state and select room
  const handleRoomClick = (room: any) => {
    // Sync active MRN, Room, DOA, Gender details to NurseDataStore
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

  // If a room is selected, render the NurseInterface view
  if (selectedRoom) {
    return (
      <NurseInterface
        role="nurse"
        onClose={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-full w-full bg-[#FAFAFA] font-sans text-[#1C1B1F] flex flex-col justify-between">
      <div>
        {/* Main Grid + Side Panel */}
        <div className="flex gap-4 px-6 py-6 flex-1">
          {/* Left Icon Bar */}
          <div className="flex flex-col items-center gap-6 pt-2 w-8 shrink-0">
            <div className="p-1.5 rounded-lg bg-[#4EBEE3]/10 text-[#4EBEE3]">
              <Droplet size={18} fill="currentColor" />
            </div>
            <div className="p-1.5 rounded-lg hover:bg-gray-100 text-[#637381] cursor-pointer">
              <BarChart3 size={18} />
            </div>
            <div className="p-1.5 rounded-lg hover:bg-gray-100 text-[#637381] cursor-pointer">
              <CalendarDays size={18} />
            </div>
          </div>

          {/* Grid of Cards */}
          <div className="flex-1">
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {mappedRooms.map((r, i) => (
                  <RoomCard
                    key={r.no + "_" + i}
                    roomNumber={r.no}
                    type={r.type}
                    headerColor={r.headerColor}
                    icon={r.icon}
                    isOccupied={r.state === "occupied"}
                    mrn={r.mrn}
                    gender={r.gender}
                    doa={r.doa}
                    age={r.age}
                    onUpdateManual={(info) => handleUpdateManual(r.no, info)}
                    onClearManual={
                      activeStation && manualOccupancies[`${activeStation.id}_${r.no}`]?.mrn
                        ? () => handleClearManual(r.no)
                        : undefined
                    }
                    onClick={() => handleRoomClick(r)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Aside - Ward Overview Panel */}
          <aside className="w-[260px] shrink-0 bg-white border border-gray-200 rounded-lg p-3 flex flex-col shadow-sm self-start font-['Poppins',sans-serif]">
            <div
              className="rounded-md text-center py-2 font-semibold text-white text-[13px] uppercase tracking-wider"
              style={{ background: C.vipBlueLight }}
            >
              Ward Overview
            </div>
            <div className="mt-3 text-center font-bold text-[14px] text-[#1C1B1F]">Notification logs</div>
            <div className="mt-2 space-y-1.5 flex-1 overflow-auto max-h-[400px]">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] border border-transparent font-['Poppins',sans-serif]"
                  style={{ background: n.rowBg }}
                >
                  <span
                    className="px-1.5 py-0.5 rounded font-bold text-[9px] text-white shrink-0 font-sans"
                    style={{ background: n.tagBg, minWidth: 38, textAlign: "center" }}
                  >
                    {n.room}
                  </span>
                  <span className="truncate font-semibold" style={{ color: n.color }}>
                    {n.type}
                  </span>
                  <span className="ml-auto text-gray-400 shrink-0 font-normal font-sans">{n.time}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="px-6 py-4 flex gap-2 items-center bg-white border-t border-gray-100 shrink-0">
        {[
          { label: "Patient Profile", active: true },
          { label: "Treatment Plan" },
          { label: "Nurse Schedule" },
          { label: "CARESUITE" },
          { label: "CARELINK" },
          { label: "Discharge Plan" },
        ].map((t, i) => (
          <button
            key={i}
            className="px-4 py-2 rounded text-[12px] font-semibold border transition-all font-['Poppins',sans-serif]"
            style={
              t.active
                ? { background: C.vipBlue, color: "#fff", borderColor: C.vipBlue }
                : { background: "transparent", color: C.gray400, borderColor: "#E2E8F0" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
