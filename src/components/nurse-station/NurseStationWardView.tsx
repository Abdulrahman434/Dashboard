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
import { useCareSuite } from "../../hooks/useCareSuite";
import { careSuiteService } from "../../services/careSuiteService";
import { userService } from "../../services/userService";
import { useFood, updateFood } from "../food/foodStore";
import KitchenPage from "../food/KitchenPage";
import CareSuiteDashboardPage from "../caresuite/CareSuiteDashboardPage";
import { toast } from "sonner@2.0.3";
import { UserCircle2, X } from "lucide-react";

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

const NOTIFICATION_TYPES = ["HK Request", "Virtual Consultation Request"] as const;
type NotifType = typeof NOTIFICATION_TYPES[number];

function notifStyle(type: NotifType, index: number): { tagBg: string; color: string; rowBg: string } {
  if (type === "Virtual Consultation Request") {
    return { tagBg: C.vipBlue, color: C.vipBlue, rowBg: index % 3 === 0 ? "transparent" : "transparent" };
  }
  // HK Request
  return {
    tagBg: index % 3 === 0 ? C.cardNavy : C.gray400,
    color: index % 5 === 3 ? C.red : C.ink2,
    rowBg: index % 5 === 3 ? C.redBg : "transparent",
  };
}

const MOCK_TIMES = ["09:10", "09:15", "09:18", "09:22", "09:30", "09:41", "09:55", "10:02", "10:17", "10:28"];

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
  isCareSuite,
  careSuiteRequests,
  isKitchen,
  kitchenOrder,
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
  isCareSuite?: boolean;
  careSuiteRequests?: Array<{ id: string; itemName: string; status: string; priority: string }>;
  isKitchen?: boolean;
  kitchenOrder?: any;
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
        {isKitchen ? (
          <>
            {/* Room Number and Kitchen Status Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[18px] font-bold text-[#18355E] tracking-tight">{roomNumber}</span>
              {kitchenOrder ? (
                <span 
                  className="font-bold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase animate-pulse"
                  style={{
                    color: kitchenOrder.status === 'Submitted' ? '#b9770b' : kitchenOrder.status === 'Printed' ? '#0a84b1' : '#1f9e75',
                    backgroundColor: kitchenOrder.status === 'Submitted' ? '#fbf1de' : kitchenOrder.status === 'Printed' ? '#eaf5fa' : '#e7f6f0',
                  }}
                >
                  {kitchenOrder.status}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">
                  No Order
                </span>
              )}
            </div>

            {/* Patient Details */}
            {isOccupied ? (
              <div className="text-[11px] leading-[1.3] text-[#637381] space-y-0.5 mt-1 font-['Poppins',sans-serif]">
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
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic py-1 font-sans">Vacant bed</div>
            )}

            {/* Active Kitchen Order Details */}
            {kitchenOrder && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5 text-[10.5px]">
                <div><span className="text-gray-400">Diet:</span> <span className="font-semibold text-gray-700">{kitchenOrder.diet} ({kitchenOrder.meal})</span></div>
                <div className="text-gray-700 truncate max-w-[170px]" title={kitchenOrder.lines?.map((l: any) => Array.isArray(l) ? l[1] : l?.name).join(', ')}>
                  <span className="text-gray-400">Items:</span> <span className="font-medium">{kitchenOrder.lines?.map((l: any) => Array.isArray(l) ? l[1] : l?.name).join(', ')}</span>
                </div>
              </div>
            )}
          </>
        ) : isCareSuite ? (
          <>
            {/* Room Number and CareSuite Status Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[18px] font-bold text-[#18355E] tracking-tight">{roomNumber}</span>
              {careSuiteRequests && careSuiteRequests.length > 0 ? (
                <span className="bg-[#FEF2F2] text-[#DF4354] font-extrabold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">
                  {careSuiteRequests.length} Pending Order(s)
                </span>
              ) : (
                <span className="bg-[#E8F8F0] text-[#01C874] font-extrabold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">
                  No pending orders
                </span>
              )}
            </div>

            {/* Patient Details */}
            {isOccupied ? (
              <div className="text-[11px] leading-[1.3] text-[#637381] space-y-0.5 mt-1 font-['Poppins',sans-serif]">
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
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic py-1 font-sans">Vacant bed</div>
            )}

            {/* Active CareSuite Orders List */}
            {careSuiteRequests && careSuiteRequests.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                {careSuiteRequests.map((req) => (
                  <div key={req.id} className="flex justify-between items-center text-[10.5px]">
                    <span className="font-semibold text-gray-700 truncate max-w-[110px]" title={req.itemName}>{req.itemName}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{req.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : isOccupied ? (
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
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedKitchenOrder, setSelectedKitchenOrder] = useState<any | null>(null);

  const { library, requests, workflow, teams } = useCareSuite();
  const foodDb = useFood();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers(userService.listUsers());
  }, []);
  const [activeBottomTab, setActiveBottomTab] = useState<string>("Patient Profile");

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
        {activeBottomTab === "KitchenPageBackup" ? (
          <KitchenPage
            restrictToWardId={activeStation?.id}
            onNavigate={(route) => {
              if (onManageClick) onManageClick();
            }}
          />
        ) : (
          /* Main Grid + Side Panel */
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
                  {mappedRooms.map((r, i) => {
                    const terminalStatus = workflow[workflow.length - 1]?.status;
                    
                    // Fetch CareSuite requests
                    const roomReqs = requests
                      .filter((req) => req.room === r.no && req.status !== terminalStatus)
                      .map((req) => {
                        const libItem = library.find((l) => l.id === req.libraryItemId);
                        return {
                          id: req.id,
                          itemName: libItem?.nameEn ?? "Unknown",
                          status: req.status,
                          priority: req.priority,
                        };
                      });

                    // Fetch Kitchen order
                    const roomNoStr = r.no.replace(/[^0-9]/g, '');
                    const bedLetter = r.no.replace(/[0-9]/g, '');
                    const kitchenOrder = foodDb?.orders?.find((o: any) => o.room === roomNoStr && o.bed === bedLetter && o.status !== 'Delivered');

                    return (
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
                        isCareSuite={activeBottomTab === "CARESUITE"}
                        careSuiteRequests={roomReqs}
                        isKitchen={activeBottomTab === "Kitchen"}
                        kitchenOrder={kitchenOrder}
                        onUpdateManual={(info) => handleUpdateManual(r.no, info)}
                        onClearManual={
                          activeStation && manualOccupancies[`${activeStation.id}_${r.no}`]?.mrn
                            ? () => handleClearManual(r.no)
                            : undefined
                        }
                        onClick={() => {
                          if (activeBottomTab === "CARESUITE") {
                            const firstActiveReq = requests.find((req) => req.room === r.no && req.status !== terminalStatus);
                            if (firstActiveReq) {
                              setSelectedRequest(firstActiveReq);
                            } else {
                              toast.info("No active CareSuite requests for this room.");
                            }
                          } else if (activeBottomTab === "Kitchen") {
                            if (kitchenOrder) {
                              setSelectedKitchenOrder(kitchenOrder);
                            } else {
                              toast.info("No active Kitchen orders for this room.");
                            }
                          } else {
                            handleRoomClick(r);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Aside - Ward Overview Panel */}
            {(() => {
              const roomNos = mappedRooms.map((r) => r.no);
              const terminalStatus = workflow[workflow.length - 1]?.status;

              // Build notification entries
              const wardNotifications = activeBottomTab === "CARESUITE"
                ? requests
                    .filter((r) => roomNos.includes(r.room) && r.status !== terminalStatus)
                    .map((r) => {
                      const item = library.find((l) => l.id === r.libraryItemId);
                      const timeStr = new Date(r.lastStatusChangeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return {
                        room: r.room,
                        type: `${item?.nameEn ?? 'Request'} (${r.status})`,
                        time: timeStr,
                        rowBg: r.priority === 'High' ? '#FEF2F2' : '#F7F8FB',
                        tagBg: '#18355E',
                        color: r.priority === 'High' ? '#DF4354' : '#1C1B1F'
                      };
                    })
                : activeBottomTab === "Kitchen"
                ? foodDb?.orders
                    ?.filter((o: any) => roomNos.includes(o.room + o.bed) && o.status !== 'Delivered')
                    ?.map((o: any) => {
                      return {
                        room: o.room + o.bed,
                        type: `Meal Order (${o.status})`,
                        time: o.time,
                        rowBg: o.status === 'Submitted' ? '#FEF2F2' : '#F7F8FB',
                        tagBg: '#18355E',
                        color: o.status === 'Submitted' ? '#DF4354' : '#1C1B1F'
                      };
                    })
                : roomNos.map((room, i) => {
                    const type: NotifType = NOTIFICATION_TYPES[i % NOTIFICATION_TYPES.length];
                    const style = notifStyle(type, i);
                    return { room, type, time: MOCK_TIMES[i % MOCK_TIMES.length], ...style };
                  });

              return (
                <aside className="w-[260px] shrink-0 bg-white border border-gray-200 rounded-lg p-3 flex flex-col shadow-sm self-start font-['Poppins',sans-serif]">
                  <div
                    className="rounded-md text-center py-2 font-semibold text-white text-[13px] uppercase tracking-wider"
                    style={{ background: C.vipBlueLight }}
                  >
                    Ward Overview
                  </div>
                  <div className="mt-3 text-center font-bold text-[14px] text-[#1C1B1F]">
                    {activeBottomTab === "CARESUITE" ? "Active CareSuite Requests" : activeBottomTab === "Kitchen" ? "Active Kitchen Orders" : "Notification logs"}
                  </div>
                  {wardNotifications.length === 0 ? (
                    <p className="mt-4 text-[12px] text-gray-400 text-center">
                      {activeBottomTab === "CARESUITE" ? "No active requests" : activeBottomTab === "Kitchen" ? "No active orders" : "No rooms configured"}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1.5 flex-1 overflow-auto max-h-[400px]">
                      {wardNotifications.map((n, i) => (
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
                  )}
                </aside>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="px-6 py-4 flex gap-2 items-center bg-white border-t border-gray-100 shrink-0">
        {[
          { label: "Patient Profile", active: activeBottomTab === "Patient Profile" },
          { label: "Treatment Plan", active: activeBottomTab === "Treatment Plan" },
          { label: "Nurse Schedule", active: activeBottomTab === "Nurse Schedule" },
          { label: "Kitchen", active: activeBottomTab === "Kitchen" },
          { label: "CARESUITE", active: activeBottomTab === "CARESUITE" },
          { label: "CARELINK", active: activeBottomTab === "CARELINK" },
          { label: "Discharge Plan", active: activeBottomTab === "Discharge Plan" },
        ].map((t, i) => (
          <button
            key={i}
            onClick={() => {
              if (t.label === "Patient Profile" || t.label === "Kitchen" || t.label === "CARESUITE") {
                setActiveBottomTab(t.label);
              } else {
                toast.info(`${t.label} will be updated soon`);
              }
            }}
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
        <KitchenOrderDetailsModal
          order={selectedKitchenOrder}
          onClose={() => setSelectedKitchenOrder(null)}
        />
      )}
    </div>
  );
}

function RequestDetailsModal({ requestId, onClose, users, library, teams, requests, workflow }: any) {
  const request = requests.find((r: any) => r.id === requestId);
  if (!request) return null;

  const item = library.find((l: any) => l.id === request.libraryItemId);

  // Dynamically synthesize request history trail
  const historyList = (() => {
    if (request.history && request.history.length > 0) {
      if (request.history.some((h: any) => h.status === request.status)) {
        return request.history;
      }
    }

    const currentStepIdx = workflow.findIndex((w: any) => w.status === request.status);
    if (currentStepIdx < 0) {
      return [{ status: 'Sent', timestamp: request.createdAt }];
    }

    const stepsToRender = workflow.slice(0, currentStepIdx + 1);
    const start = request.createdAt;
    const end = request.lastStatusChangeAt;
    const count = stepsToRender.length;

    return stepsToRender.map((w: any, idx: number) => {
      let timestamp = start;
      if (count > 1) {
        timestamp = start + ((end - start) * idx) / (count - 1);
      }
      return {
        status: w.status,
        timestamp: Math.round(timestamp)
      };
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
              <div className="font-medium text-[#16274D]">{item?.nameEn ?? 'Unknown'}</div>
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
                        {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#5d6678] mb-2 font-medium">Assign User</div>
              <select 
                value={request.assignedUserId || ''} 
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
            {order.status !== 'Delivered' && (
              <>
                <button
                  onClick={() => {
                    updateFood((draft) => {
                      const o = draft.orders.find((x: any) => x.id === order.id);
                      if (o) o.status = 'Printed';
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
                      if (o) o.status = 'Delivered';
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
