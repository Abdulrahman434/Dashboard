import React from "react";
import {
  RefreshCw,
  UserCircle2,
  BedDouble,
  Gem,
  Crown,
  ShieldAlert,
  Droplet,
  BarChart3,
  CalendarDays,
  Clock,
} from "lucide-react";
import careinnLogo from "./assets/careinn-logo.svg";

/* =========================================================================
   Design tokens — extracted from the Figma SVG
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

/* =========================================================================
   Room data — mirrors the Figma layout (5 columns × 4 rows)
   ========================================================================= */
const rooms = [
  // Row 1
  {
    no: "301A", type: "Single", headerColor: C.cardNavy, icon: BedDouble, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Abdullah", nurse: "Amal AlAmer", department: "Delivery" },
    footer: { text: "(No Requests Physical/Virtual Appointment set)", color: C.gray400 },
  },
  {
    no: "302A", type: "VIP", headerColor: C.vipBlue, icon: Gem, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "M", age: "32y",
      mrp: "Dr. Omar Alomari", nurse: "Noran, widan", department: "Cardiology" },
    footer: { text: "(Virtual Consultation Appointment at 11:30am)", color: C.green },
  },
  {
    no: "303A", type: "Royal", headerColor: C.royalPurple, icon: Crown, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "M", age: "32y",
      mrp: "Dr. Waleed", nurse: "Noran, widan", department: "Orthopedics" },
    footer: { text: "Not Attended Patient Request/s", color: C.red },
  },
  {
    no: "304A", type: "Single", headerColor: C.cardNavy, icon: BedDouble, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "(waiting for Discharge)", color: C.gray400 },
  },
  {
    no: "305A", type: "Single isolated", headerColor: C.isolatedOrange, icon: ShieldAlert, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "M", age: "43y",
      mrp: "Dr. Khaled", nurse: "Widan", department: "Rhinology" },
    footer: { text: "(waiting for Discharge)", color: C.gray400 },
  },

  // Row 2
  { no: "306A", type: "Single", headerColor: C.cardNavy, state: "available" },
  { no: "307A", type: "Single", headerColor: C.cardNavy, state: "closed" },
  { no: "308A", type: "Single", headerColor: C.cardNavy, state: "preparation" },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "Unattended Patient Request/s", color: C.red },
  },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "Unattended Patient Request/s\n(Towel | Housekeeping, AC | maintenance, Discharge | Nurse)", color: C.red },
  },

  // Row 3
  { no: "306A", type: "Single", headerColor: C.cardNavy, state: "available" },
  { no: "307A", type: "Single", headerColor: C.cardNavy, state: "closed" },
  { no: "308A", type: "Single", headerColor: C.cardNavy, state: "preparation" },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "Unattended Patient Request/s", color: C.red },
  },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "ALERT", color: C.red, bold: true },
  },

  // Row 4
  { no: "306A", type: "Single", headerColor: C.cardNavy, state: "available" },
  { no: "307A", type: "Single", headerColor: C.cardNavy, state: "closed" },
  { no: "308A", type: "Single", headerColor: C.cardNavy, state: "preparation" },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "Unattended Patient Request/s", color: C.red },
  },
  {
    no: "309A", type: "Single", headerColor: C.cardNavy, state: "occupied",
    patient: { mrn: "MR21446", doa: "25/5/2025", gender: "F", age: "43y",
      mrp: "Dr. Omar", nurse: "Amal AlAmer", department: "Optology" },
    footer: { text: "Unattended Patient Request/s", color: C.red },
  },
];

const notifications = [
  { room: "301A", tagBg: C.cardNavy, type: "HK Request",      time: "15-5-2025 09:10", color: C.ink2,    rowBg: "transparent" },
  { room: "302A", tagBg: C.cardNavy, type: "HK Request",      time: "15-5-2025 09:15", color: C.ink2,    rowBg: "transparent" },
  { room: "303A", tagBg: C.gray400,  type: "HK Request",      time: "15-5-2025 09:15", color: C.gray400, rowBg: "transparent" },
  { room: "312A", tagBg: C.gray400,  type: "HK Request",      time: "15-5-2025 09:18", color: C.red,     rowBg: C.redBg },
  { room: "301A", tagBg: C.cardNavy, type: "Discharge Order", time: "15-5-2025 09:10", color: C.ink2,    rowBg: C.redBgStrong },
];

/* =========================================================================
   Subcomponents
   ========================================================================= */
function CardHeader({ no, type, color, Icon = BedDouble }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-white"
         style={{ background: color }}>
      <div className="font-semibold text-[15px]">
        {no} <span className="font-normal opacity-95">{type}</span>
      </div>
      <Icon size={18} strokeWidth={2} />
    </div>
  );
}

function PatientBody({ p, footer }) {
  return (
    <div className="bg-white px-3 pt-2.5 pb-2 text-[11px] leading-[1.55] text-[#343434]">
      <div className="flex flex-wrap items-center gap-x-2">
        <span><span className="font-semibold">MRN:</span> {p.mrn}</span>
        <span><span className="font-semibold">DOA:</span> {p.doa}</span>
        <Droplet size={11} className="text-pink-400" fill="currentColor" />
        <span className="text-[#637381]">({p.gender} {p.age})</span>
      </div>
      <div className="mt-1"><span className="font-semibold">MRP:</span> {p.mrp}</div>
      <div><span className="font-semibold">Primary Nurses:</span> {p.nurse}</div>
      <div><span className="font-semibold">department:</span> {p.department}</div>

      {footer && (
        <div className="mt-2 text-[11px] font-medium whitespace-pre-line text-center"
             style={{ color: footer.color, fontWeight: footer.bold ? 700 : 500 }}>
          {footer.text}
        </div>
      )}
    </div>
  );
}

function StateBody({ state }) {
  const map = {
    available:   { label: "Available",   color: C.green },
    closed:      { label: "Closed",      color: C.gray300 },
    preparation: { label: "Preparation", color: C.gray300 },
  };
  const s = map[state];
  return (
    <div className="bg-white flex items-center justify-center"
         style={{ minHeight: 132, color: s.color, fontWeight: 600, fontSize: 22 }}>
      {s.label}
    </div>
  );
}

function RoomCard({ room, onClick }) {
  const Icon = room.icon ?? BedDouble;
  return (
    <button
      onClick={onClick}
      className="text-left rounded-md overflow-hidden shadow-sm border border-gray-200 bg-white
                 transition hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#09ADEA]"
    >
      <CardHeader no={room.no} type={room.type} color={room.headerColor} Icon={Icon} />
      {room.state === "occupied"
        ? <PatientBody p={room.patient} footer={room.footer} />
        : <StateBody state={room.state} />}
    </button>
  );
}

/* =========================================================================
   Dashboard — onRoomClick(room, index) is fired when a card is clicked
   ========================================================================= */
export default function NurseScreen({ onRoomClick }) {
  return (
    <div className="min-h-full w-full bg-[#FAFAFA] font-sans text-[#1C1B1F]">
      {/* Sub-header: date / IP 3A / time — sits on the page background, no white bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#343434]">
          <CalendarDays size={26} strokeWidth={1.8} />
          <span className="font-bold text-[20px] tracking-wide">10 FEB 2025</span>
        </div>
        <div className="flex items-center gap-3">
          <BedDouble size={28} className="text-[#343434]" />
          <h1 className="text-[24px] font-bold tracking-wide text-[#1C1B1F]">IP 3A</h1>
        </div>
        <div className="flex items-center gap-3 text-[#343434]">
          <Clock size={26} strokeWidth={1.8} />
          <span className="font-bold text-[20px] tracking-wide">11:00AM</span>
        </div>
      </div>

      {/* Main grid + side panel */}
      <div className="flex gap-3 px-3 py-4">
        <div className="flex flex-col items-center gap-6 pt-2 w-8">
          <Droplet size={20} className="text-[#4EBEE3]" />
          <BarChart3 size={20} className="text-[#637381]" />
          <CalendarDays size={20} className="text-[#637381]" />
        </div>

        <div className="grid grid-cols-5 gap-3 flex-1">
          {rooms.map((r, i) => (
            <RoomCard key={i} room={r} onClick={() => onRoomClick?.(r, i)} />
          ))}
        </div>

        <aside className="w-[260px] shrink-0">
          <div className="rounded-md text-center py-2.5 font-semibold text-white"
               style={{ background: C.vipBlueLight }}>
            Ward Overview
          </div>
          <div className="mt-3 text-center font-bold text-[15px] text-[#1C1B1F]">
            Notification logs
          </div>
          <div className="mt-2 space-y-1">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px]"
                   style={{ background: n.rowBg }}>
                <span className="px-2 py-0.5 rounded font-bold text-[11px] text-white"
                      style={{ background: n.tagBg, minWidth: 44, textAlign: "center" }}>
                  {n.room}
                </span>
                <span style={{ color: n.color, fontWeight: 600 }}>{n.type}</span>
                <span className="ml-auto" style={{ color: n.color }}>{n.time}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom tabs */}
      <div className="px-3 pb-4 flex gap-2 items-center">
        {[
          { label: "Patient Profile", active: true },
          { label: "Treatment Plan" },
          { label: "Nurse Schedule" },
          { label: "CARESUITE" },
          { label: "CARELINK" },
          { label: "Discharge Plan" },
        ].map((t, i) => (
          <button key={i} className="px-4 py-2 rounded text-[13px] font-semibold border"
                  style={t.active
                    ? { background: C.vipBlue, color: "#fff", borderColor: C.vipBlue }
                    : { background: "transparent", color: C.gray400, borderColor: C.gray400 }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
