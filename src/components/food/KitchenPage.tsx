import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChefHat, Tablet, Printer, Check, CheckCheck, User, Clock, Utensils, CheckCircle2, Edit, BedDouble, Gem, Crown, ShieldAlert, AlertTriangle, LayoutGrid, Table as TableIcon, ChevronUp, ChevronDown, ChevronRight, PlusCircle, MoreVertical, Wheat, Egg, Croissant, Milk, Soup, Salad, Beef, CupSoda, CakeSlice, ClipboardList, Package, TrendingUp, Download, Plus, Search, X, MapPin, Link2, Layers } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood, resolve, MEAL_SECTIONS, sectionRule, nextOrderId, setKioskPrefill, dietColor, dietAr, mealAr, allergenAr } from './foodStore';
import { buildSheets, type Sheet } from './mealTicket';
import { MealSheet, MealTicketPrintStyles } from './MealTicketSheet';
import { cx, Btn, Badge, Card, FoodPage } from './foodAtoms';
import PillTabs from '../PillTabs';
import TableSortIcon from '../TableSortIcon';
import { MultiSelectDropdown, SingleSelectDropdown } from '../UnifiedDropdown';
import { nurseStationService } from '../../services/nurseStationService';

interface KitchenCardProps {
  roomNumber: string;
  type: string;
  headerColor: string;
  icon: any;
  order: any | null;
  onEdit: () => void;
  onPrint: () => void;
  onDeliver: () => void;
}

function KitchenCard({
  roomNumber,
  type,
  headerColor,
  icon: Icon,
  order,
  onEdit,
  onPrint,
  onDeliver,
}: KitchenCardProps) {
  const getItemsSummary = () => {
    if (!order || !order.lines) return '';
    return order.lines
      .map((l: any) => {
        if (Array.isArray(l)) return l[1];
        if (l && typeof l === 'object') return l.name;
        return '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const getStatusStyle = () => {
    if (!order) return { text: '#DF4354', bg: '#FEF2F2', label: 'No Order' };
    if (order.status === 'Submitted') return { text: '#b9770b', bg: '#fbf1de', label: 'Submitted' };
    if (order.status === 'Printed') return { text: '#0a84b1', bg: '#eaf5fa', label: 'Printed' };
    if (order.status === 'Delivered') return { text: '#1f9e75', bg: '#e7f6f0', label: 'Delivered' };
    return { text: '#DF4354', bg: '#FEF2F2', label: order.status };
  };

  const status = getStatusStyle();

  return (
    <div
      onClick={onEdit}
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
        <div>
          {/* Room Number and Status Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[18px] font-bold text-[#18355E] tracking-tight">{roomNumber}</span>
            <span 
              className="font-bold px-2 py-0.5 rounded text-[9px] tracking-wide uppercase"
              style={{ color: status.text, backgroundColor: status.bg }}
            >
              {status.label}
            </span>
          </div>

          {/* Details */}
          {order ? (
            <div className="text-[11px] leading-[1.4] text-[#637381] space-y-1 mt-1 font-['Poppins',sans-serif]">
              <div className="flex items-center gap-1">
                <span className="font-normal text-gray-400">Patient:</span>
                <span className="font-semibold text-gray-800 truncate block max-w-[120px]">{order.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-normal text-gray-400">Diet:</span>
                <span className="font-semibold text-gray-800">{order.diet}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-normal text-gray-400">Meal:</span>
                <span className="font-semibold text-gray-800">{order.meal}</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="font-normal text-gray-400 shrink-0">Items:</span>
                <span className="font-semibold text-gray-800 line-clamp-2" title={getItemsSummary()}>
                  {getItemsSummary() || <span className="italic text-gray-400 font-normal">None selected</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] leading-[1.4] text-[#637381] italic py-2">
              Waiting for order selection
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {order && (
          <div className="mt-3 flex items-center justify-end gap-2 text-[10.5px] font-bold border-t border-gray-100 pt-2 shrink-0 font-['Poppins',sans-serif]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-[#0a84b1] hover:underline cursor-pointer border-0 bg-transparent p-0"
            >
              Edit
            </button>
            <span className="text-gray-300">·</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrint();
              }}
              className="text-[#0a84b1] hover:underline cursor-pointer border-0 bg-transparent p-0"
            >
              Print
            </button>
            {order.status === 'Printed' && (
              <>
                <span className="text-gray-300">·</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeliver();
                  }}
                  className="text-green-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
                >
                  Deliver
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// Colour per diet so kitchen staff instantly recognise which diet a ticket is for.
// Each entry: dot = bullets/accent text, headerBg = ticket header tint, chipBg = icon
// chip background, pill* = "Comes with meal" pill. Diets not listed fall back to slate.
type DietTone = {
  dot: string;
  headerBg: string;
  headerBg2?: string;   // optional 2nd stop for a playful gradient header
  idText: string;
  pillText: string;
  pillBg: string;
  chipBg: string;
  dots?: string[];      // optional palette → bullets cycle through it (kid-friendly)
};
const DIET_COLORS: Record<string, DietTone> = {
  // Kids — matched to the Fakeeh kids menu: warm terracotta/peach with a playful,
  // multi-colour bullet palette so the ticket feels fun, not clinical.
  'Kids': {
    dot: '#E08A45',
    headerBg: '#FDF3E8',
    headerBg2: '#FCE7D2',
    idText: '#C05A2E',
    pillText: '#C05A2E',
    pillBg: '#FBE3CE',
    chipBg: '#FBE3CE',
    dots: ['#E0873C', '#4FA8A0', '#E2B33C', '#D45B4A', '#6FB05A', '#C05A9E'],
  },
  // Low potassium — matched to the Fakeeh low-potassium menu: magenta/pink theme.
  'Low potassium': {
    dot: '#C02E77',
    headerBg: '#FCEAF2',
    headerBg2: '#F7D5E5',
    idText: '#A81E5F',
    pillText: '#A81E5F',
    pillBg: '#F7DAE7',
    chipBg: '#F7DAE7',
  },
  // Low sodium — matched to the Fakeeh low-sodium menu: green theme.
  'Low sodium': {
    dot: '#4E8A3C',
    headerBg: '#EEF6E8',
    headerBg2: '#DCEBCC',
    idText: '#3B6E2C',
    pillText: '#3B6E2C',
    pillBg: '#E3F0D6',
    chipBg: '#E3F0D6',
  },
  // OB / maternity — matched to the Fakeeh OB menu: warm tan/copper theme.
  'OB / maternity': {
    dot: '#B07A3E',
    headerBg: '#F8F1E7',
    headerBg2: '#EADCC6',
    idText: '#8C5E2A',
    pillText: '#8C5E2A',
    pillBg: '#EFE3D0',
    chipBg: '#EFE3D0',
  },
  // Diabetic — matched to the Fakeeh diabetic menu: blue theme.
  'Diabetic': {
    dot: '#2E6FA8',
    headerBg: '#EAF1F8',
    headerBg2: '#D2E1F0',
    idText: '#1F5C93',
    pillText: '#1F5C93',
    pillBg: '#DBE8F4',
    chipBg: '#DBE8F4',
  },
  // Soft diet — matched to the Fakeeh soft-diet menu: golden ochre theme.
  'Soft diet': {
    dot: '#C29A42',
    headerBg: '#FAF4E6',
    headerBg2: '#EFE0C0',
    idText: '#9A7620',
    pillText: '#9A7620',
    pillBg: '#F3E9CE',
    chipBg: '#F3E9CE',
  },
};
// Neutral slate fallback for diets without an assigned colour yet.
const DIET_TONE_DEFAULT: DietTone = { dot: '#64748B', headerBg: '#F1F3F6', idText: '#475569', pillText: '#475569', pillBg: '#E7ECF1', chipBg: '#E7ECF1' };
// Regular menu is colour-coded per MEAL (matching the Fakeeh regular menu):
// breakfast amber, lunch olive-green, dinner red.
const REGULAR_BY_MEAL: Record<string, DietTone> = {
  'Breakfast': { dot: '#D9822B', headerBg: '#FBF1E5', headerBg2: '#F5DFC5', idText: '#B5651A', pillText: '#B5651A', pillBg: '#F7E6D3', chipBg: '#F7E6D3' },
  'Lunch':     { dot: '#7FA53F', headerBg: '#F3F7E9', headerBg2: '#E3EDCB', idText: '#5E7E2A', pillText: '#5E7E2A', pillBg: '#EBF1DA', chipBg: '#EBF1DA' },
  'Dinner':    { dot: '#C0453C', headerBg: '#FBEEED', headerBg2: '#F5D7D4', idText: '#A5342B', pillText: '#A5342B', pillBg: '#F7DFDC', chipBg: '#F7DFDC' },
};
const dietTone = (diet: string, meal?: string): DietTone => {
  if (diet === 'Regular' && meal && REGULAR_BY_MEAL[meal]) return REGULAR_BY_MEAL[meal];
  return DIET_COLORS[diet] || DIET_TONE_DEFAULT;
};

export default function KitchenPage({
  onNavigate,
  restrictToWardId,
}: {
  onNavigate: (route: string) => void;
  restrictToWardId?: string;
}) {
  const db = useFood();
  const station = restrictToWardId ? nurseStationService.get(restrictToWardId) : null;

  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editSelections, setEditSelections] = useState<Record<string, string[]>>({});

  const startEdit = (order: any) => {
    setEditingOrder(order);
    const initialSel: Record<string, string[]> = {};
    (order.lines || []).forEach((line: any) => {
      const [sec, dishName] = Array.isArray(line) ? [line[0], line[1]] : [line.section, line.name];
      if (!initialSel[sec]) initialSel[sec] = [];
      if (!initialSel[sec].includes(dishName)) {
        initialSel[sec].push(dishName);
      }
    });
    setEditSelections(initialSel);
  };

  const handleToggleDish = (section: string, dishName: string, max: number) => {
    setEditSelections(prev => {
      const current = prev[section] ? [...prev[section]] : [];
      if (current.includes(dishName)) {
        return {
          ...prev,
          [section]: current.filter(x => x !== dishName)
        };
      } else {
        if (max === 1) {
          return {
            ...prev,
            [section]: [dishName]
          };
        } else {
          return {
            ...prev,
            [section]: [...current, dishName]
          };
        }
      }
    });
  };

  const saveEdit = () => {
    if (!editingOrder) return;
    
    const newLines: [string, string][] = [];
    Object.entries(editSelections).forEach(([sec, dishes]) => {
      dishes.forEach(dish => {
        newLines.push([sec, dish]);
      });
    });

    updateFood((draft: any) => {
      let o = draft.orders.find((ord: any) => ord.id === editingOrder.id);
      if (!o) {
        draft.orders.unshift({
          ...editingOrder,
          id: editingOrder.id.startsWith('DEF-') ? nextOrderId() : editingOrder.id,
          lines: newLines
        });
      } else {
        o.lines = newLines;
      }
    });

    toast.success('Order updated successfully');
    setEditingOrder(null);
  };

  const renderEditModal = () => {
    if (!editingOrder) return null;

    const sections = MEAL_SECTIONS[editingOrder.meal] || [];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
        <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-[#16274D] text-white p-5 flex items-center justify-between">
            <div>
              <h3 className="font-['Poppins',sans-serif] font-bold text-[18px]">
                Edit Order #{editingOrder.id.replace('ORD-', '')}
              </h3>
              <p className="text-[12.5px] text-[#4EBEE3] mt-0.5">
                For {editingOrder.name} · Room {editingOrder.room}{editingOrder.bed && ` / Bed ${editingOrder.bed}`} · Diet: {editingOrder.diet} · {editingOrder.meal}
              </p>
            </div>
            <button
              onClick={() => setEditingOrder(null)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer border-0 outline-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {sections.map((section: string) => {
              const rules = sectionRule(db, section);
              const max = rules.forAll ? 99 : (rules.max || 1);
              const isSelectedToEveryone = !!rules.forAll;
              
              const sectionDishes = db.dishes.filter(
                (d: any) => d.section === section && d.on
              );

              const selectedInSec = editSelections[section] || [];

              return (
                <div key={section} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#16274D]">
                      {section}
                    </span>
                    <span className="text-[12px] text-[#9099ab] font-medium">
                      {isSelectedToEveryone ? 'Served to everyone' : max === 1 ? 'Choose one' : `Choose up to ${max}`}
                    </span>
                  </div>
                  {sectionDishes.length === 0 ? (
                    <p className="text-[13px] text-gray-400 italic">No dishes available in this section</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sectionDishes.map((dish: any) => {
                        const isSelected = selectedInSec.includes(dish.en);
                        return (
                          <button
                            key={dish.en}
                            type="button"
                            onClick={() => handleToggleDish(section, dish.en, max)}
                            className={cx(
                              "flex items-center gap-2.5 rounded-[12px] p-3 text-left w-full transition-all border outline-none cursor-pointer",
                              isSelected
                                ? "border-[#4EBEE3] bg-[#eaf7fc] text-[#1d7da3] font-semibold"
                                : "border-[#d6dae6] bg-white text-[#19233a] hover:border-[#4EBEE3]"
                            )}
                          >
                            <span
                              className={cx(
                                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center border",
                                isSelected ? "bg-[#4EBEE3] border-[#4EBEE3]" : "border-[#d6dae6]"
                              )}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[13.5px] leading-tight truncate">{dish.en}</span>
                              <span className="block text-[11px] text-[#9099ab] truncate font-normal mt-0.5">{dish.ar}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#f8fafc] border-t border-[#e7e9f0] flex justify-end gap-2 shrink-0">
            <Btn variant="neutral" onClick={() => setEditingOrder(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={saveEdit}>
              Save Changes
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // Load occupancies & devices
  const getDeviceAndOccupancy = (o: any, idx: number) => {
    const devRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_devices') : null;
    const allDevs: any[] = devRaw ? JSON.parse(devRaw) : [];

    const devices = restrictToWardId && station
      ? allDevs.filter((d: any) =>
          station.rooms.some((r: any) => r.source === 'device' && r.deviceId === d.deviceId)
        )
      : allDevs;
    
    const occRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_manual_room_occupancy') : null;
    const occupancies: any = occRaw ? JSON.parse(occRaw) : {};

    const MOCK_PATIENT_NAMES: Record<string, string> = {
      'MRN1000000': 'Ahmed Al-Salem',
      'MRN1000001': 'Sara Hassan',
      'MRN1000002': 'Khalid Al-Otaibi',
      'MRN1000003': 'Maryam Saleh',
      'MRN1000004': 'Fatima Noor',
      'MRN1000005': 'Omar Said',
    };

    // Find device by location, fallback to dev[idx] for robust demo pairing
    const dev = devices.find((d: any) => 
      d.roomNo === `${o.room}${o.bed}` || 
      (d.roomNo === o.room && d.bedNo === o.bed)
    ) || devices[idx % (devices.length || 1)] || null;

    let patientName = o.name;
    let locationDetails = `Room ${o.room} ${o.bed && `· Bed ${o.bed}`}`;
    let mrn = '';
    let deviceId = '';
    
    if (dev) {
      const occKey = Object.keys(occupancies).find(key => occupancies[key].mrn === dev.mrn);
      const occ = occKey ? occupancies[occKey] : null;
      if (occ && occ.name) {
        patientName = occ.name;
      } else if (MOCK_PATIENT_NAMES[dev.mrn]) {
        patientName = MOCK_PATIENT_NAMES[dev.mrn];
      }
      locationDetails = `Room ${dev.roomNo} · Bed ${dev.bedNo} · Floor ${dev.floor} · Bldg ${dev.building} (${dev.poc})`;
      mrn = dev.mrn;
      deviceId = dev.deviceId;
    }

    // Try to read observations from active nurse store
    const nurseStoreRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn-nurse-store') : null;
    let obs: any = null;
    try {
      if (nurseStoreRaw) {
        const parsed = JSON.parse(nurseStoreRaw);
        if (parsed.observations && parsed.observations.length > 0) {
          obs = parsed.observations[0];
        }
      }
    } catch (e) {}

    if (!obs) {
      // Realistic fallback observation
      obs = {
        vitals: { bp: "116/74", hr: "72", temp: "36.8", spo2: "98" },
        painLevel: 2,
        risks: { fall: true, pressure: false, allergies: true, other: false },
        nurseNotes: "Patient alert and oriented. Tolerating diet without nausea. Pain controlled."
      };
    }

    const activeRisks: string[] = [];
    if (obs.risks?.fall) activeRisks.push('Fall Risk');
    if (obs.risks?.pressure) activeRisks.push('Pressure Injury');
    if (obs.risks?.allergies) activeRisks.push('Allergies');
    if (obs.risks?.other) activeRisks.push('Other');

    return {
      patientName,
      locationDetails,
      mrn,
      deviceId,
      obs,
      activeRisks
    };
  };

  // Selected tickets state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  // A ticket to jump to (e.g. after placing an order at the kiosk).
  const [focusOrderId, setFocusOrderId] = useState<string | null>(null);

  // Patient Order Status: filter + search
  // Kitchen Queue: free-text search (name, room, bed, order id, meal, diet)
  const [queueSearch, setQueueSearch] = useState('');

  // Kitchen Queue: filter tickets by workflow stage
  const [queueStatus, setQueueStatus] = useState<'all' | 'Submitted' | 'Printed' | 'Delivered'>('all');

  // Kitchen Queue: Cards vs Table view + table sorting
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'room', dir: 'asc' });
  const [rowMenu, setRowMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [mealPopover, setMealPopover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [queueGroupBy, setQueueGroupBy] = useState<'none' | 'meal' | 'diet' | 'orderfor' | 'floor'>('none');
  const [cardsGroupBy, setCardsGroupBy] = useState<'none' | 'floor' | 'ward'>('none');
  // Floor / ward for an order (device data first, else derived from room number).
  const orderFloor = (o: any): string => {
    if (o._floor) return String(o._floor);
    const n = parseInt(String(o.room), 10);
    return Number.isFinite(n) ? String(Math.floor(n / 100)) : '—';
  };
  const orderWard = (o: any): string => {
    const n = parseInt(String(o.room), 10);
    return Number.isFinite(n) ? String(Math.floor(n / 100) * 100) : '—';
  };
  // Patient ↔ companion pairing: a companion order is "Companion — <patient>" in
  // the same room/bed/meal. pairKey is shared by a patient and their companion.
  const isCompanionOrder = (o: any) => String(o.name || '').toLowerCase().includes('companion');
  const basePatientName = (o: any) =>
    isCompanionOrder(o) ? String(o.name).replace(/^\s*companion\s*[—–-]\s*/i, '').trim() : String(o.name || '');
  const pairKey = (o: any) => `${o.room}|${o.bed}|${o.meal}|${basePatientName(o).toLowerCase()}`;
  // Return [patient, companion] for an order (whichever exist in the pool), ordered.
  const pairList = (order: any, pool: any[]) => {
    const key = pairKey(order);
    const patient = pool.find((o) => pairKey(o) === key && !isCompanionOrder(o)) || (!isCompanionOrder(order) ? order : null);
    const companion = pool.find((o) => pairKey(o) === key && isCompanionOrder(o)) || (isCompanionOrder(order) ? order : null);
    const list: any[] = [];
    if (patient) list.push(patient);
    if (companion) list.push(companion);
    return list.length ? list : [order];
  };
  const [collapsedMeals, setCollapsedMeals] = useState<string[]>([]);
  const [collapsedSummary, setCollapsedSummary] = useState<string[]>([]);

  // Which service day the kitchen is viewing. Any past date shows read-only
  // history. "Today" always tracks the real current date.
  const isoOf = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const shiftDays = (iso: string, days: number) => {
    const [y, m, d] = iso.split('-').map(Number);
    return isoOf(new Date(y, m - 1, d + days));
  };
  const appToday = isoOf(new Date());
  const appYesterday = shiftDays(appToday, -1);
  const appTomorrow = shiftDays(appToday, 1);
  const [selectedDate, setSelectedDate] = useState<string>(appToday);
  const [mainTab, setMainTab] = useState<'queue' | 'summary' | 'missing'>('summary');
  // "Not ordered" tab — its own filters so switching tabs doesn't carry the
  // queue's filter state (and its Date/Companion-status filters) across.
  const [missSearch, setMissSearch] = useState('');
  const [missMeals, setMissMeals] = useState<string[]>([]);
  const [missDiets, setMissDiets] = useState<string[]>([]);
  const [missRooms, setMissRooms] = useState<string[]>([]);
  const [missFor, setMissFor] = useState<string[]>([]);
  const [missGroupBy, setMissGroupBy] = useState<'none' | 'floor' | 'ward' | 'meal'>('none');
  /* Ordering is for tomorrow, but a patient admitted today still has to be fed
     today — the kitchen asks them and enters it by hand — so the tab can look
     at either day. */
  const [missDate, setMissDate] = useState<string>(appTomorrow);
  const [summaryDate, setSummaryDate] = useState<string>(appToday);
  const [summaryMeal, setSummaryMeal] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [summaryGroup, setSummaryGroup] = useState<'none' | 'floor' | 'section' | 'diet' | 'ward'>('none');
  const [tableSort, setTableSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'total', dir: 'desc' });
  const [summaryPrint, setSummaryPrint] = useState(false);
  const isTodaySelected = selectedDate === appToday;
  const isHistory = selectedDate < appToday;

  // Jump to a specific order when arriving from the kiosk ("See it in the kitchen").
  useEffect(() => {
    let id: string | null = null;
    try { id = sessionStorage.getItem('careinn-kitchen-focus'); } catch { id = null; }
    if (!id) return;
    try { sessionStorage.removeItem('careinn-kitchen-focus'); } catch { /* ignore */ }
    const ord = db.orders.find((o: any) => o.id === id);
    if (!ord) return;
    setMainTab('queue');
    setActiveTab('queue');
    setQueueStatus('all');
    setViewMode('cards');
    if (ord.date) setSelectedDate(ord.date);
    setFocusOrderId(id);
  }, []);

  // Scroll the focused ticket into view and clear the highlight after a moment.
  useEffect(() => {
    if (!focusOrderId) return;
    const scrollT = setTimeout(() => {
      const el = document.getElementById(`korder-${focusOrderId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    const clearT = setTimeout(() => setFocusOrderId(null), 3400);
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
  }, [focusOrderId]);

  // Format an ISO date (YYYY-MM-DD) as e.g. "Sun, Jul 5, 2026"; pass through anything else.
  const fmtDate = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };
  const dateDisplay = fmtDate(selectedDate);

  // Filters state
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedMealFor, setSelectedMealFor] = useState<string[]>([]); // Patient / Companion
  const [companionFilter, setCompanionFilter] = useState<'all' | 'with' | 'without'>('all'); // has a companion?
  const [expandedCards, setExpandedCards] = useState<string[]>([]); // order ids whose card is expanded

  // Print queue state
  /** The orders behind the sheets currently queued for print. */
  const [printScope, setPrintScope] = useState<any[]>([]);
  // Batch meal-ticket sheets: one A4 landscape page per recipient.
  const [printSheets, setPrintSheets] = useState<Sheet[]>([]);
  const [sheetPreviewOpen, setSheetPreviewOpen] = useState(false);
  const [cutGuides, setCutGuides] = useState(true);

  // Advance an order along its lifecycle: Submitted -> Printed -> Delivered.
  const advance = (id: string) => {
    let newStatus = '';
    updateFood((d: any) => {
      let o = d.orders.find((ord: any) => ord.id === id);
      if (!o) {
        const generated = allOrders.find(x => x.id === id);
        if (generated) {
          d.orders.unshift({ ...generated, status: 'Submitted' });
          o = d.orders[0];
        }
      }
      if (o) {
        newStatus = o.status === 'Submitted' ? 'Printed' : 'Delivered';
        o.status = newStatus;
      }
    });
    toast(newStatus === 'Printed' ? 'Ticket printed' : 'Marked delivered');
  };

  /* Every print path below goes through the same meal-ticket sheet — one A4
     landscape page per recipient. What differs is only the scope: one row, the
     current selection, or the whole day. */
  const markPrinted = (orders: any[]) => {
    updateFood((d: any) => {
      orders.forEach((src: any) => {
        let o = d.orders.find((ord: any) => ord.id === src.id);
        if (!o) {
          d.orders.unshift({ ...src, status: 'Submitted' });
          o = d.orders[0];
        }
        if (o && o.status === 'Submitted') o.status = 'Printed';
      });
    });
  };

  const sendSheetsToPrinter = (orders: any[], sheets: Sheet[]) => {
    markPrinted(orders);
    setSummaryPrint(false);
    setPrintSheets(sheets);
    setSheetPreviewOpen(false);
    const clear = () => { setPrintSheets([]); window.removeEventListener('afterprint', clear); };
    window.addEventListener('afterprint', clear);
    setTimeout(() => window.print(), 200);
  };

  // Print a single ticket (and advance status to Printed if it is Submitted)
  const printSingle = (order: any) => {
    // Print the patient and their companion together (patient first).
    const list = pairList(order, visibleOrders);
    const sheets = buildSheets(db, list, selectedDate);
    if (sheets.length === 0) {
      toast('No orders to print for this date');
      return;
    }
    sendSheetsToPrinter(list, sheets);
  };

  // Mark a single order delivered (works for generated + stored orders)
  const deliverOrder = (order: any) => {
    updateFood((d: any) => {
      let o = d.orders.find((ord: any) => ord.id === order.id);
      if (!o) {
        d.orders.unshift({ ...order, status: 'Delivered' });
      } else {
        o.status = 'Delivered';
      }
    });
    toast('Marked delivered');
  };

  // Revert a delivered order back to pending (undo accidental delivery)
  const undeliverOrder = (order: any) => {
    updateFood((d: any) => {
      let o = d.orders.find((ord: any) => ord.id === order.id);
      if (!o) {
        d.orders.unshift({ ...order, status: 'Printed' });
      } else {
        o.status = 'Printed';
      }
    });
    toast('Reverted to pending');
  };

  // ---- batch meal-ticket sheets ---------------------------------------------

  /**
   * What a print action covers: the selected rows if any are selected, and
   * otherwise every order for the serving date. Selecting rows and printing
   * used to go down a different path that ignored the selection — there is now
   * one path, and it always follows what is ticked.
   *
   * A selected row is expanded to its patient+companion pair, so a tray is
   * never printed without its partner.
   */
  const ordersToPrint = (): any[] => {
    const all = buildOrdersForDate(selectedDate);
    if (selectedOrderIds.length === 0) return all;
    const picked = visibleOrders.filter((o: any) => selectedOrderIds.includes(o.id));
    const out: any[] = [];
    const seen = new Set<string>();
    picked.forEach((o: any) => {
      pairList(o, visibleOrders).forEach((x: any) => {
        if (!seen.has(x.id)) { seen.add(x.id); out.push(x); }
      });
    });
    return out;
  };

  const openSheetPreview = () => {
    const orders = ordersToPrint();
    const sheets = buildSheets(db, orders, selectedDate);
    if (sheets.length === 0) {
      toast('No orders to print for this date');
      return;
    }
    setPrintScope(orders);
    setPrintSheets(sheets);
    setSheetPreviewOpen(true);
  };

  /** Print the batch, advancing the printed orders to Printed as it goes. */
  const printSheetBatch = () => {
    const orders = printScope.length ? printScope : ordersToPrint();
    const sheets = printSheets.length ? printSheets : buildSheets(db, orders, selectedDate);
    if (sheets.length === 0) {
      toast('No orders to print for this date');
      return;
    }
    sendSheetsToPrinter(orders, sheets);
    setSelectedOrderIds([]);
  };

  // Bulk Deliver
  const bulkDeliver = () => {
    if (selectedOrderIds.length === 0) return;
    updateFood((d: any) => {
      selectedOrderIds.forEach((id) => {
        let o = d.orders.find((ord: any) => ord.id === id);
        if (!o) {
          const generated = allOrders.find(x => x.id === id);
          if (generated) {
            d.orders.unshift({ ...generated, status: 'Submitted' });
            o = d.orders[0];
          }
        }
        if (o && o.status !== 'Delivered') {
          o.status = 'Delivered';
        }
      });
    });
    toast(`Marked ${selectedOrderIds.length} orders as delivered`);
    setSelectedOrderIds([]);
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Helper to identify accompaniment/comes-with items
  const isAccompaniment = (section: string, dishName: string) => {
    const sec = section.toLowerCase();
    const dish = dishName.toLowerCase();
    if (sec === 'drinks' || sec === 'baked breads') return true;
    if (dish.includes('cheese platter') || dish === 'bread' || dish === 'milk') return true;
    return false;
  };

  // Extract unique rooms
  const uniqueRooms = restrictToWardId && station
    ? Array.from(new Set(station.rooms.map((r: any) => r.roomNumber)))
        .filter(Boolean)
        .sort() as string[]
    : (() => {
        // Derive room options from the actual devices (the kitchen tickets map to
        // these), not from the two legacy seed orders.
        const devRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_devices') : null;
        const allDevs: any[] = devRaw ? JSON.parse(devRaw) : [];
        return Array.from(new Set(allDevs.map((d: any) => String(d.roomNo).replace(/[A-Za-z]/g, ''))))
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) as string[];
      })();

  // Get current time comparison
  const getCutoffStatus = () => {
    const now = new Date();
    const currentStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    
    const timeToMinutes = (tStr: string) => {
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + m;
    };
    
    const cutoffTime = db.win.close || '20:00';
    const currentMin = timeToMinutes(currentStr);
    const cutoffMin = timeToMinutes(cutoffTime);
    const isAfterCutoff = currentMin >= cutoffMin;
    
    return {
      currentStr,
      cutoffTime,
      isAfterCutoff
    };
  };

  const { currentStr, cutoffTime, isAfterCutoff } = getCutoffStatus();

  // Small deterministic hash so each device's order is stable across renders
  // (same device + day + meal always yields the same "did they order?" outcome
  // and the same item picks) — no Math.random, so history doesn't reshuffle.
  const hashStr = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const MOCK_PATIENT_NAMES: Record<string, string> = {
    'MRN1000000': 'Ahmed Al-Salem',
    'MRN1000001': 'Sara Hassan',
    'MRN1000002': 'Khalid Al-Otaibi',
    'MRN1000003': 'Maryam Saleh',
    'MRN1000004': 'Fatima Noor',
    'MRN1000005': 'Omar Said',
  };

  // A pool of believable names so every bed has a real patient name (never an MRN)
  const NAME_POOL = [
    'Layla Ibrahim', 'Yousef Nasser', 'Huda Kamal', 'Tariq Aziz', 'Noura Faisal',
    'Zaid Hamdan', 'Aisha Rahman', 'Mohammed Riyad', 'Reem Adel', 'Bilal Hakim',
    'Salma Yusuf', 'Hassan Tamir', 'Dana Waleed', 'Faris Qasim', 'Rania Sami',
    'Nabil Aoun', 'Lina Habib', 'Karim Fouad', 'Mona Saleh', 'Adel Munir',
    'Hana Zayd', 'Sami Rashid', 'Jana Ali', 'Wael Amin', 'Ghada Salim',
  ];
  /* Bed names come from the patient list the rest of the app joins against, so
     a printed ticket can resolve the person: their allergies, and whether they
     are a child (the pediatric ticket decoration). Names invented outside that
     list matched no patient record, which is why no ticket was ever pediatric
     and why allergy strips were always empty. NAME_POOL is the fallback for an
     empty roster only. */
  const rosterNames: string[] = (db.patients || []).map((x: any) => String(x.name)).filter(Boolean);
  const nameForMrn = (mrn: string) => {
    if (MOCK_PATIENT_NAMES[mrn]) return MOCK_PATIENT_NAMES[mrn];
    const pool = rosterNames.length ? rosterNames : NAME_POOL;
    return pool[hashStr(String(mrn)) % pool.length];
  };

  /* Every bed the kitchen serves, order or no order. buildOrdersForDate only
     yields tickets, so the "Not Ordered" tab reads the roster instead. */
  const bedRoster = () => {
    const devRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_devices') : null;
    const allDevs: any[] = devRaw ? JSON.parse(devRaw) : [];
    const devices = restrictToWardId && station
      ? allDevs.filter((d: any) =>
          station.rooms.some((r: any) => r.source === 'device' && r.deviceId === d.deviceId)
        )
      : allDevs;
    const occRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_manual_room_occupancy') : null;
    const occupancies: any = occRaw ? JSON.parse(occRaw) : {};
    const dietsList = db.diets.filter((d: any) => d.on).map((d: any) => d.en);
    return devices.map((dv: any) => {
      const occKey = Object.keys(occupancies).find((k) => occupancies[k].mrn === dv.mrn);
      const occ = occKey ? occupancies[occKey] : null;
      const seed = hashStr(String(dv.deviceId));
      return {
        room: String(dv.roomNo).replace(/[A-Za-z]/g, ''),
        bed: String(dv.roomNo).replace(/[^A-Za-z]/g, '') || dv.bedNo,
        name: occ?.name || nameForMrn(dv.mrn),
        diet: occ?.diet || dietsList[seed % dietsList.length] || 'Regular',
        floor: String(dv.floor || ''),
        mrn: dv.mrn,
      };
    });
  };

  // Build a realistic kitchen order list for a given service day, one ticket per
  // device for the ~60% of patients who placed an order. Every order is placed
  // by hand — a bed with no order simply has no ticket, and is chased from the
  // "Not Ordered" tab. Real orders that already live in db.orders
  // (edited/printed/delivered) take precedence and are never overwritten.
  // Yesterday is presented as delivered history.
  const buildOrdersForDate = (dateStr: string) => {
    const past = dateStr < appToday;
    const today = dateStr === appToday;
    const devRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_devices') : null;
    const allDevs: any[] = devRaw ? JSON.parse(devRaw) : [];

    const devices = restrictToWardId && station
      ? allDevs.filter((d: any) =>
          station.rooms.some((r: any) => r.source === 'device' && r.deviceId === d.deviceId)
        )
      : allDevs;

    const occRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_manual_room_occupancy') : null;
    const occupancies: any = occRaw ? JSON.parse(occRaw) : {};

    const dietsList = db.diets.filter((d: any) => d.on).map((d: any) => d.en);
    const mealsToGen: string[] = db.meals; // all services (Breakfast, Lunch, Dinner)

    const devRoomBed = (dv: any) => ({
      roomStr: dv.roomNo.replace(/[A-Za-z]/g, ''),
      bedStr: dv.roomNo.replace(/[^A-Za-z]/g, '') || dv.bedNo,
    });

    // Start from real, user-touched orders for this day that map to a device.
    // Orders placed at the Patient Kiosk may not map to a demo device, so when we
    // aren't restricted to a ward we still include any real order for the date —
    // otherwise a just-placed kiosk order would never appear on the board.
    const list: any[] = db.orders.filter(
      (o: any) =>
        o.date === dateStr &&
        (!restrictToWardId ||
          devices.some((dv: any) => {
            const { roomStr, bedStr } = devRoomBed(dv);
            return o.room === roomStr && o.bed === bedStr;
          }))
    );

    devices.forEach((dv: any, idx: number) => {
      const { roomStr, bedStr } = devRoomBed(dv);

      const occKey = Object.keys(occupancies).find((k) => occupancies[k].mrn === dv.mrn);
      const occ = occKey ? occupancies[occKey] : null;
      const name = occ?.name || nameForMrn(dv.mrn);

      // One ticket per meal service, so the board can be grouped by meal.
      mealsToGen.forEach((meal: string) => {
        // Skip if a real order already covers this device + meal
        const covered = list.some((o: any) => o.room === roomStr && o.bed === bedStr && o.meal === meal);
        if (covered) return;

        const sections = MEAL_SECTIONS[meal] || [];
        const seed = hashStr(dv.deviceId + '|' + dateStr + '|' + meal);

        // Guaranteed sample: first patient's LUNCH on yesterday has a diet change
        const forceSample = dateStr === appYesterday && idx === 0 && meal === 'Lunch';

        let diet = occ?.diet || dietsList[seed % dietsList.length] || 'Regular';
        const didOrder = forceSample ? true : seed % 100 < 60;

        // Demo: ~1 in 5 submitted orders had the patient's diet changed afterwards
        const dietChanged = forceSample ? true : (didOrder && seed % 5 === 0);
        let prevDiet: string | null = null;
        if (forceSample) {
          diet = 'Diabetic';
          prevDiet = 'Regular';
        } else if (dietChanged) {
          prevDiet = dietsList[(seed + 1) % dietsList.length];
          if (prevDiet === diet) prevDiet = dietsList[(seed + 2) % dietsList.length];
        }

        // Nobody is served a meal they did not ask for: no order, no ticket.
        if (!didOrder) return;

        const lines: [string, string][] = sections
          .map((sec: string, si: number) => {
            const dishes = db.dishes.filter((x: any) => x.section === sec && x.on);
            if (dishes.length === 0) return null;
            const pick = dishes[(seed + si * 7) % dishes.length];
            return [sec, pick.en] as [string, string];
          })
          .filter(Boolean) as [string, string][];

        let status: string;
        if (past) status = 'Delivered';
        else if (today) status = ['Submitted', 'Printed', 'Delivered'][seed % 3];
        else status = 'Submitted';

        /* Whether this bed is a child's. Two sources, because neither alone
           covers the board: the patient record's pediatric flag when the name
           resolves to one, and the device's own ward group, which is what
           actually marks a bed as pediatric on the kiosk roster. Without this
           no ticket was ever pediatric, since bed names rarely resolve to a
           patient record at all. */
        const patientRec = (db.patients || []).find(
          (x: any) => String(x.name).toLowerCase() === String(name).toLowerCase()
        );
        const isKidBed = !!patientRec?.pediatric || String(dv.group || '').toLowerCase() === 'kids';

        list.push({
          id: `GEN-${dateStr}-${dv.deviceId}-${meal}`,
          _pediatric: isKidBed,
          orderNo: 1000 + (seed % 9000),
          name,
          room: roomStr,
          bed: bedStr,
          diet,
          meal,
          date: dateStr,
          time: cutoffTime,
          status,
          dietChanged,
          prevDiet,
          lines,
          _deviceId: dv.deviceId,
          _mrn: dv.mrn,
          _floor: dv.floor,
          _building: dv.building,
          _bedNo: dv.bedNo,
          _roomNo: dv.roomNo,
          _group: dv.group,
        });

        // ~1 in 4 rooms also has a companion meal accompanying the patient
        // (uses the same meal's sections so it's meal-appropriate)
        if (seed % 4 === 0) {
          const cLines: [string, string][] = sections
            .map((sec, si) => {
              const dishes = db.dishes.filter((x: any) => x.section === sec && x.on);
              if (dishes.length === 0) return null;
              const pick = dishes[(seed + si * 5 + 3) % dishes.length];
              return [sec, pick.en] as [string, string];
            })
            .filter(Boolean) as [string, string][];
          list.push({
            id: `GEN-${dateStr}-${dv.deviceId}-${meal}-C`,
            orderNo: 1000 + ((seed + 4321) % 9000),
            name: `Companion — ${name}`,
            room: roomStr,
            bed: bedStr,
            diet: 'Regular',
            meal,
            date: dateStr,
            time: cutoffTime,
            status: past ? 'Delivered' : ['Submitted', 'Printed'][seed % 2],
            dietChanged: false,
            prevDiet: null,
            lines: cLines,
            _deviceId: dv.deviceId,
            _mrn: dv.mrn,
            _floor: dv.floor,
            _building: dv.building,
            _bedNo: dv.bedNo,
            _roomNo: dv.roomNo,
            _group: dv.group,
          });
        }
      });
    });

    return list;
  };

  const allOrders = buildOrdersForDate(selectedDate);

  const roomOrders = useMemo(() => {
    if (!station) return [];
    
    return station.rooms.map((room) => {
      const order = allOrders.find(
        (o: any) =>
          o.room.toLowerCase() === room.roomNumber.toLowerCase() &&
          (o.bed || '').toLowerCase() === (room.bed || '').toLowerCase()
      );
      
      let headerColor = '#18355E';
      let icon = BedDouble;
      let typeLabel = room.type || 'Single';

      const num = room.roomNumber.toLowerCase();
      const group = typeLabel.toLowerCase();
      if (group.includes("vip") || num.includes("vip") || num.includes("v")) {
        typeLabel = "VIP";
        headerColor = '#09ADEA';
        icon = Gem;
      } else if (group.includes("royal") || num.includes("royal") || num.includes("r")) {
        typeLabel = "Royal";
        headerColor = '#8B2975';
        icon = Crown;
      } else if (group.includes("isolated") || num.includes("iso") || num.includes("i")) {
        typeLabel = "Single isolated";
        headerColor = '#EEBB2C';
        icon = ShieldAlert;
      } else if (group !== "single") {
        headerColor = "#A0AEC0";
        icon = BedDouble;
      }

      return {
        room,
        order,
        typeLabel,
        headerColor,
        icon,
      };
    });
  }, [station, allOrders]);

  // Pair keys that have a companion order (so we can filter patients with/without one).
  const companionPairKeys = new Set(allOrders.filter(isCompanionOrder).map(pairKey));

  // Filter orders
  const visibleOrdersRaw = allOrders.filter((o: any) => {
    const matchMeal = selectedMeals.length === 0 || selectedMeals.includes(o.meal);
    const matchDiet = selectedDiets.length === 0 || selectedDiets.includes(o.diet);
    const matchWard = selectedWards.length === 0 || selectedWards.includes(o.room);
    const matchStatus = queueStatus === 'all' || o.status === queueStatus;
    const mealFor = String(o.name).toLowerCase().includes('companion') ? 'Companion' : 'Patient';
    const matchMealFor = selectedMealFor.length === 0 || selectedMealFor.includes(mealFor);
    const hasCompanion = companionPairKeys.has(pairKey(o));
    const matchCompanion = companionFilter === 'all' || (companionFilter === 'with' ? hasCompanion : !hasCompanion);
    const q = queueSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      [o.name, o.room, o.bed, `room ${o.room}`, `bed ${o.bed}`, o.meal, o.diet, o.id, String(o.id).replace('ORD-', '')]
        .some((f: any) => String(f || '').toLowerCase().includes(q));
    return matchMeal && matchDiet && matchWard && matchStatus && matchMealFor && matchCompanion && matchSearch;
  });
  // Keep each patient immediately followed by their companion (Option A pairing),
  // preserving the order in which each pair first appears.
  const visibleOrders = (() => {
    const groups = new Map<string, any[]>();
    visibleOrdersRaw.forEach((o: any) => {
      const k = pairKey(o);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(o);
    });
    const out: any[] = [];
    groups.forEach((arr) => {
      arr.sort((a, b) => (isCompanionOrder(a) ? 1 : 0) - (isCompanionOrder(b) ? 1 : 0));
      out.push(...arr);
    });
    return out;
  })();

  const handleSelectAll = (visible: any[]) => {
    const visibleIds = visible.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const counts = allOrders.reduce(
    (acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    { Submitted: 0, Printed: 0, Delivered: 0 },
  );


  // Kitchen Orders — Table view (mirrors the app's existing table pattern)
  const viewKitchenTable = () => {
    const val = (o: any, key: string) => {
      switch (key) {
        case 'order': return o.orderNo || 0;
        case 'name': return String(o.name || '').toLowerCase();
        case 'room': return `${o.room}-${o.bed}`;
        case 'diet': return String(o.diet || '').toLowerCase();
        case 'status': return ({ Submitted: 0, Printed: 1, Delivered: 2 } as any)[o.status] ?? 0;
        default: return 0;
      }
    };
    const sorted = [...visibleOrders].sort((a: any, b: any) => {
      const av = val(a, sort.key), bv = val(b, sort.key);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    // 3-click cycle: asc → desc → back to default (by room).
    const toggleSort = (key: string) =>
      setSort((s) => {
        if (s.key !== key) return { key, dir: 'asc' };
        if (s.dir === 'asc') return { key, dir: 'desc' };
        return { key: 'room', dir: 'asc' };
      });

    const allSel = sorted.length > 0 && sorted.every((o: any) => selectedOrderIds.includes(o.id));

    const allergiesFor = (o: any) => {
      if (String(o.name).toLowerCase().includes('companion')) return [];
      const p = db.patients.find((p: any) => p.name === o.name);
      return p && p.allergies.length ? p.allergies : [];
    };
    const printState = (o: any) =>
      o.status === 'Submitted'
        ? { label: 'Not printed', cls: 'bg-gray-100 text-gray-600 border-gray-200' }
        : { label: 'Printed', cls: 'bg-[#e7f6f0] text-[#1f9e75] border-green-200' };
    const deliveryState = (o: any) =>
      o.status === 'Delivered'
        ? { label: 'Delivered', cls: 'bg-[#e7f6f0] text-[#157F5C] border-green-200' }
        : { label: 'Pending', cls: 'bg-gray-100 text-gray-600 border-gray-200' };

    const Th = ({ label, k, right }: { label: string; k?: string; right?: boolean }) => (
      <th
        onClick={k ? () => toggleSort(k) : undefined}
        className={cx(
          "px-3 py-2 text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif]",
          right ? 'text-right' : 'text-left',
          k && 'cursor-pointer select-none hover:bg-gray-100 transition-colors'
        )}
      >
        <span className={cx("inline-flex items-center gap-2", right && 'justify-end w-full')}>
          {label}
          {k && <TableSortIcon field={k} currentField={sort.key} direction={sort.dir} />}
        </span>
      </th>
    );

    const renderRow = (o: any) => {
      const isCompanion = String(o.name).toLowerCase().includes('companion');
      const allg = allergiesFor(o);
      const items = (o.lines || []).map((l: any) => (Array.isArray(l) ? l[1] : l?.name)).filter(Boolean);
      const ds = deliveryState(o);
      const isSel = selectedOrderIds.includes(o.id);
      return (
        <tr key={o.id} className={cx("border-b border-gray-100 hover:bg-gray-50 transition-colors align-top", isSel && 'bg-[#f5fbfe]')}>
          <td className="px-3 py-3">
            <input type="checkbox" checked={isSel} onChange={() => toggleSelectOrder(o.id)} className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]" />
          </td>
          <td className="px-3 py-3">
            <div className="font-semibold text-[#0a84b1] text-[13px] truncate">#{o.orderNo || o.id.replace('ORD-', '')}</div>
            <div className="text-[11.5px] text-[#9099ab] truncate">{o.meal}</div>
          </td>
          <td className="px-3 py-3">
            <div className="flex flex-wrap items-center gap-1 mb-0.5">
              <span className={cx("inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white", isCompanion ? 'bg-[#4EBEE3]' : 'bg-[#16274D]')}>
                {isCompanion ? 'Companion' : 'Patient'}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F6FC] text-[#0A7C9E]">
                Submitted
              </span>
            </div>
            <div className="font-semibold text-[#16274D] text-[13px] truncate">{o.name}</div>
          </td>
          <td className="px-3 py-3 text-[12.5px] text-[#5d6678]">
            <div className="font-medium text-[#16274D] truncate">Room {o._roomNo || `${o.room}${o.bed || ''}`}</div>
            <div className="text-[11.5px] truncate">Bed {o._bedNo || o.bed || '—'} · Fl {o._floor || '—'} · Bldg {o._building || '—'}</div>
          </td>
          <td className="px-3 py-3 text-[12.5px] font-medium text-[#16274D] truncate">{o.diet}</td>
          <td className="px-3 py-3 text-[12.5px]">
            {allg.length ? (
              <span className="flex items-center gap-1 text-red-600 min-w-0">
                <AlertTriangle size={13} className="shrink-0" />
                <span className="font-medium truncate">{allg.join(', ')}</span>
              </span>
            ) : (<span className="text-gray-400">None</span>)}
          </td>
          <td className="px-3 py-3 text-[12.5px] text-[#5d6678]">
            <button
              type="button"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setMealPopover(mealPopover?.id === o.id ? null : { id: o.id, x: r.left, y: r.bottom });
              }}
              className="text-left w-full group cursor-pointer bg-transparent border-0 p-0 outline-none"
              title="View full meal"
            >
              <div className="font-semibold text-[#16274D] flex items-center gap-1 group-hover:text-[#0a84b1]">
                {items.length} items <ChevronDown size={12} className="text-[#9099ab]" />
              </div>
              <div className="line-clamp-2 leading-snug group-hover:text-[#0a84b1]">{items.join(' · ')}</div>
            </button>
          </td>
          <td className="px-3 py-3">
            {o.status === 'Delivered' ? (
              <button
                type="button"
                onClick={() => undeliverOrder(o)}
                title="Delivered by mistake? Click to revert to pending"
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap bg-[#e7f6f0] text-[#157F5C] border-[#bfe6d4] hover:bg-[#d3f0e2] hover:border-[#9fd9bf] transition-colors cursor-pointer outline-none"
              >
                Delivered
              </button>
            ) : (
              <button
                type="button"
                onClick={() => deliverOrder(o)}
                title="Click to mark as delivered"
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-500 hover:border-gray-300 transition-colors cursor-pointer outline-none"
              >
                Pending
              </button>
            )}
          </td>
          <td className="px-3 py-3 text-[12px]">
            {o.dietChanged ? (
              <span className="inline-flex items-center gap-1 text-[#b9770b] font-semibold" title="Diet changed after submission"><AlertTriangle size={13} className="shrink-0" /> Changed</span>
            ) : (<span className="text-gray-400">None</span>)}
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center justify-end">
              <button
                type="button"
                title="Actions"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRowMenu(rowMenu?.id === o.id ? null : { id: o.id, x: rect.right, y: rect.bottom });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-gray-100 hover:text-[#16274D] transition-colors cursor-pointer border-0 bg-transparent outline-none"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </td>
        </tr>
      );
    };

    // Group-by support (meal / diet / order-for)
    const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner'];
    const groupField = (o: any): string =>
      queueGroupBy === 'meal' ? o.meal
      : queueGroupBy === 'diet' ? String(o.diet || 'Regular')
      : queueGroupBy === 'floor' ? orderFloor(o)
      : String(o.name).toLowerCase().includes('companion') ? 'Companion' : 'Patient';
    const groupKeys =
      queueGroupBy === 'meal'
        ? MEAL_ORDER.filter((m) => sorted.some((o: any) => o.meal === m))
        : Array.from(new Set(sorted.map(groupField))).sort((a, b) => a.localeCompare(b));
    const groups = groupKeys.map((key) => ({ key, rows: sorted.filter((o: any) => groupField(o) === key) }));
    const toggleGroup = (m: string) =>
      setCollapsedMeals((c) => (c.includes(m) ? c.filter((x) => x !== m) : [...c, m]));
    const mealCounts = (rows: any[]) => ({
      total: rows.length,
      printed: rows.filter((r) => r.status === 'Printed').length,
      delivered: rows.filter((r) => r.status === 'Delivered').length,
    });

    return (
      <div>
        {/* Bulk actions — hidden until one or more rows are selected */}
        {selectedOrderIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-4 py-3 bg-[#eaf7fc] border border-[#bfe6f4] rounded-xl">
            <span className="text-[13.5px] font-semibold text-[#16274D]">{selectedOrderIds.length} selected</span>
            <div className="flex gap-2">
              <Btn variant="neutral" onClick={openSheetPreview}><Printer size={16} /> Print tickets</Btn>
              <Btn variant="primary" onClick={bulkDeliver}><Check size={16} /> Mark as Delivered</Btn>
              <Btn variant="neutral" onClick={() => setSelectedOrderIds([])}>Clear</Btn>
            </div>
          </div>
        )}

        {/* Group by selector */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <span className="text-[12px] font-semibold text-[#9099ab]">Group by</span>
          <div className="flex bg-[#f7f8fb] p-1 rounded-[10px] border border-[#e7e9f0]">
            {([
              { g: 'none', label: 'None' },
              { g: 'floor', label: 'Floor' },
              { g: 'meal', label: 'Meal' },
              { g: 'diet', label: 'Diet' },
              { g: 'orderfor', label: 'Order For' },
            ] as const).map(({ g, label }) => (
              <button
                key={g}
                onClick={() => setQueueGroupBy(g)}
                className={cx(
                  'px-3 py-1 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                  queueGroupBy === g ? 'bg-white text-[#16274D] shadow border border-[#e7e9f0]' : 'text-[#5d6678] hover:text-[#16274D]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div>
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '6%' }} />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allSel}
                      onChange={() => handleSelectAll(sorted)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                  </th>
                  <Th label="Order" k="order" />
                  <Th label="Order For" k="name" />
                  <Th label="Location" k="room" />
                  <Th label="Diet" k="diet" />
                  <Th label="Allergies" />
                  <Th label="Meal" />
                  <Th label="Delivery" k="status" />
                  <Th label="Alerts" />
                  <Th label="Actions" right />
                </tr>
              </thead>
              <tbody>
                {queueGroupBy !== 'none'
                  ? groups.flatMap(({ key, rows }) => {
                      const c = mealCounts(rows);
                      const collapsed = collapsedMeals.includes(key);
                      const heading = queueGroupBy === 'diet' ? `${key} diet` : queueGroupBy === 'floor' ? `Floor ${key}` : key;
                      return [
                        <tr key={'grp-' + key} className="bg-[#f8fafc] border-y border-gray-200 cursor-pointer hover:bg-[#f1f5f9]" onClick={() => toggleGroup(key)}>
                          <td colSpan={10} className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {collapsed ? <ChevronRight size={16} className="text-[#5d6678]" /> : <ChevronDown size={16} className="text-[#5d6678]" />}
                              <span className="text-[13.5px] font-bold text-[#16274D]">{heading}</span>
                              <span className="text-[12px] font-medium text-[#5d6678]">
                                — {c.total} total · {c.printed} printed · {c.delivered} delivered
                              </span>
                            </div>
                          </td>
                        </tr>,
                        ...(collapsed ? [] : rows.map(renderRow)),
                      ];
                    })
                  : sorted.map(renderRow)}
                {sorted.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-[#9099ab] text-[13px]">No tickets match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 text-[12.5px] text-[#5d6678]">
            Showing {sorted.length} of {allOrders.length} orders
          </div>
        </div>

        {/* Row actions dropdown (Print / Reprint / Mark as Delivered) */}
        {rowMenu && (() => {
          const o = sorted.find((x: any) => x.id === rowMenu.id);
          if (!o) return null;
          const close = () => setRowMenu(null);
          const item = "w-full text-left px-3.5 py-2 text-[13px] text-[#16274D] hover:bg-[#f5fbfe] cursor-pointer flex items-center gap-2 border-0 bg-transparent outline-none";
          return (
            <>
              <div className="fixed inset-0 z-40" onClick={close} />
              <div
                className="fixed z-50 w-44 rounded-xl border border-[#e7e9f0] bg-white shadow-lg py-1"
                style={{ top: rowMenu.y + 4, left: Math.max(8, rowMenu.x - 176) }}
              >
                {o.status === 'Submitted' ? (
                  <button className={item} onClick={() => { printSingle(o); close(); }}><Printer size={15} className="text-[#0a84b1]" /> Print</button>
                ) : (
                  <button className={item} onClick={() => { printSingle(o); close(); }}><Printer size={15} className="text-[#0a84b1]" /> Reprint</button>
                )}
                {o.status !== 'Delivered' && (
                  <button className={item} onClick={() => { deliverOrder(o); close(); }}><Check size={15} className="text-[#1f9e75]" /> Mark as Delivered</button>
                )}
                <button className={item} onClick={() => { startEdit(o); close(); }}><Edit size={14} className="text-[#5d6678]" /> Edit</button>
              </div>
            </>
          );
        })()}

        {/* Meal popover — full item list per order */}
        {mealPopover && (() => {
          const o = sorted.find((x: any) => x.id === mealPopover.id);
          if (!o) return null;
          const close = () => setMealPopover(null);
          const lines = (o.lines || []).map((l: any) => (Array.isArray(l) ? l : [l?.section, l?.name])) as [string, string][];
          return (
            <>
              <div className="fixed inset-0 z-40" onClick={close} />
              <div
                className="fixed z-50 w-60 max-h-[60vh] overflow-y-auto rounded-xl border border-[#e7e9f0] bg-white shadow-lg"
                style={{ top: mealPopover.y + 4, left: Math.min(mealPopover.x, window.innerWidth - 250) }}
              >
                <div className="px-3.5 py-2.5 border-b border-[#eef1f6] bg-[#f8fafc] flex items-center gap-2">
                  <Utensils size={14} className="text-[#0a84b1]" />
                  <span className="text-[12.5px] font-semibold text-[#16274D]">Meal · {o.meal}</span>
                  <span className="text-[11px] text-[#9099ab] ml-auto">{lines.length} items</span>
                </div>
                <div className="py-1">
                  {lines.map(([sec, dish], i) => (
                    <div key={i} className="px-3.5 py-1.5 flex items-center justify-between gap-3">
                      <span className="text-[13px] text-[#16274D] font-medium">{dish}</span>
                      <span className="text-[10.5px] text-[#9099ab] shrink-0">{sec}</span>
                    </div>
                  ))}
                  {lines.length === 0 && <div className="px-3.5 py-3 text-[12px] text-gray-400 italic">No items</div>}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    );
  };

  // Aggregate a day's ordered items into a flat dish map and a per-ward map,
  // optionally filtered to one meal. Each dish tracks total qty + meal split.
  type DishAgg = Record<string, { total: number; meals: Record<string, number>; section: string }>;
  const summaryDataFor = (dateStr: string, mealFilter: string) => {
    const orders = buildOrdersForDate(dateStr).filter((o: any) => mealFilter === 'All' || o.meal === mealFilter);
    const flat: DishAgg = {};
    const byFloor: Record<string, DishAgg> = {};
    const byWard: Record<string, DishAgg> = {};
    const byDiet: Record<string, DishAgg> = {};
    const bySection: Record<string, DishAgg> = {};
    orders.forEach((o: any) => {
      const floor = orderFloor(o);
      const ward = String(o.room || '—');
      const diet = String(o.diet || 'Regular');
      (o.lines || []).forEach((line: any) => {
        const [sec, dish] = Array.isArray(line) ? [line[0], line[1]] : [line.section, line.name];
        if (!dish) return;
        const section = String(sec || '—');
        const add = (bucket: DishAgg) => {
          bucket[dish] = bucket[dish] || { total: 0, meals: {}, section: sec };
          bucket[dish].total++;
          bucket[dish].meals[o.meal] = (bucket[dish].meals[o.meal] || 0) + 1;
        };
        add(flat);
        byFloor[floor] = byFloor[floor] || {};
        add(byFloor[floor]);
        byWard[ward] = byWard[ward] || {};
        add(byWard[ward]);
        byDiet[diet] = byDiet[diet] || {};
        add(byDiet[diet]);
        bySection[section] = bySection[section] || {};
        add(bySection[section]);
      });
    });
    const totalItems = orders.reduce((n: number, o: any) => n + (o.lines?.length || 0), 0);
    return { orders, flat, byFloor, byWard, byDiet, bySection, totalItems };
  };

  // Sort a dish map's [dish, agg] entries by any table column.
  const sortDishEntries = (agg: DishAgg) => {
    const val = ([dish, v]: [string, any]): string | number => {
      switch (tableSort.key) {
        case 'dish': return dish.toLowerCase();
        case 'section': return String(v.section || '').toLowerCase();
        case 'Breakfast': return v.meals['Breakfast'] || 0;
        case 'Lunch': return v.meals['Lunch'] || 0;
        case 'Dinner': return v.meals['Dinner'] || 0;
        default: return v.total;
      }
    };
    return Object.entries(agg).sort((a, b) => {
      const av = val(a), bv = val(b);
      const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return tableSort.dir === 'asc' ? c : -c;
    });
  };
  const mealSplit = (v: { meals: Record<string, number> }) =>
    ['Breakfast', 'Lunch', 'Dinner'].filter((m) => v.meals[m]).map((m) => `${m} ${v.meals[m]}`).join(' · ');

  // Daily Summary — a full view (its own tab). Date can be today or up to tomorrow.
  /* ── "Not ordered" tab ────────────────────────────────────────────────────
     Who has no order for the chosen service day, so the kitchen can chase them.

     Orders are always placed by hand, so a bed with no ticket for a meal gets
     no tray — the roster is the source of truth for who exists, and the
     tickets say who has ordered.

     Companions: there is no companion roster in the data — a companion only
     exists once they have an order. A bed is therefore treated as having a
     companion when a companion order exists for it on the chosen day or today,
     and any of that day's meals without one is reported as not ordered. */
  const notOrderedRows = useMemo(() => {
    const dayOrders = buildOrdersForDate(missDate);
    const todayOrders = missDate === appToday ? dayOrders : buildOrdersForDate(appToday);
    const rows: any[] = [];

    const patientOrdered = new Set(
      dayOrders.filter((o: any) => !isCompanionOrder(o)).map((o: any) => `${o.room}|${o.bed}|${o.meal}`)
    );
    bedRoster().forEach((b: any) => {
      (db.meals as string[]).forEach((meal: string) => {
        if (patientOrdered.has(`${b.room}|${b.bed}|${meal}`)) return;
        rows.push({
          key: `p|${b.room}|${b.bed}|${meal}`,
          kind: 'Patient',
          name: b.name,
          room: b.room,
          bed: b.bed,
          diet: b.diet,
          meal,
          floor: orderFloor({ room: b.room, _floor: b.floor }),
          ward: orderWard({ room: b.room }),
          mrn: b.mrn,
        });
      });
    });

    const companionBeds = new Map<string, any>();
    [...dayOrders, ...todayOrders].filter(isCompanionOrder).forEach((o: any) => {
      const k = `${o.room}|${o.bed}`;
      if (!companionBeds.has(k)) companionBeds.set(k, o);
    });
    const companionOrdered = new Set(
      dayOrders.filter(isCompanionOrder).map((o: any) => `${o.room}|${o.bed}|${o.meal}`)
    );
    companionBeds.forEach((sample: any, bedKey: string) => {
      (db.meals as string[]).forEach((meal: string) => {
        if (companionOrdered.has(`${bedKey}|${meal}`)) return;
        rows.push({
          key: `c|${bedKey}|${meal}`,
          kind: 'Companion',
          name: basePatientName(sample),
          room: sample.room,
          bed: sample.bed,
          diet: 'Regular',
          meal,
          floor: orderFloor(sample),
          ward: orderWard(sample),
          mrn: sample._mrn,
        });
      });
    });

    const mealOrder = (m: string) => Math.max(0, (db.meals as string[]).indexOf(m));
    return rows.sort(
      (a, b) =>
        String(a.room).localeCompare(String(b.room), undefined, { numeric: true }) ||
        String(a.bed).localeCompare(String(b.bed)) ||
        mealOrder(a.meal) - mealOrder(b.meal) ||
        a.kind.localeCompare(b.kind)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, missDate, appToday, restrictToWardId, station]);

  const notOrderedFiltered = useMemo(() => {
    const q = missSearch.trim().toLowerCase();
    return notOrderedRows.filter((r: any) => {
      const matchSearch =
        !q || [r.name, r.room, r.bed, r.meal, r.diet, r.mrn].some((v) => String(v || '').toLowerCase().includes(q));
      const matchMeal = missMeals.length === 0 || missMeals.includes(r.meal);
      const matchDiet = missDiets.length === 0 || missDiets.includes(r.diet);
      const matchRoom = missRooms.length === 0 || missRooms.includes(r.room);
      const matchFor = missFor.length === 0 || missFor.includes(r.kind);
      return matchSearch && matchMeal && matchDiet && matchRoom && matchFor;
    });
  }, [notOrderedRows, missSearch, missMeals, missDiets, missRooms, missFor]);

  /* One row is one missing meal, so a patient who ordered nothing all day is
     three rows. Head-counts are distinct people; the row count is meals. */
  const distinctPeople = (rows: any[], kind: string) =>
    new Set(rows.filter((r: any) => r.kind === kind).map((r: any) => `${r.room}|${r.bed}|${r.name}`)).size;
  const notOrderedPatients = distinctPeople(notOrderedFiltered, 'Patient');
  const notOrderedCompanions = distinctPeople(notOrderedFiltered, 'Companion');
  const notOrderedPeople =
    distinctPeople(notOrderedRows, 'Patient') + distinctPeople(notOrderedRows, 'Companion');

  const renderNotOrderedPage = () => {
    const groups = new Map<string, any[]>();
    if (missGroupBy === 'none') {
      groups.set('', notOrderedFiltered);
    } else {
      notOrderedFiltered.forEach((r: any) => {
        const k = missGroupBy === 'floor' ? r.floor : missGroupBy === 'ward' ? r.ward : r.meal;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(r);
      });
    }
    const groupLabel = (k: string) =>
      missGroupBy === 'floor' ? `Floor ${k}` : missGroupBy === 'ward' ? `Ward ${k}` : k;

    const row = (r: any) => (
      <div
        key={r.key}
        className="flex items-center gap-3 px-4 py-2.5 border-b border-[#eef0f4] last:border-b-0 hover:bg-[#f9fbfd] transition-colors"
      >
        <span
          className={cx(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white',
            r.kind === 'Companion' ? 'bg-[#4EBEE3]' : 'bg-[#16274D]'
          )}
        >
          {r.kind === 'Companion' ? <User size={16} /> : <BedDouble size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-[#16274D] text-[14px] truncate">{r.name}</span>
            <span
              className={cx(
                'shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white',
                r.kind === 'Companion' ? 'bg-[#4EBEE3]' : 'bg-[#16274D]'
              )}
            >
              {r.kind}
            </span>
          </div>
          <div className="text-[12px] text-[#9099ab] truncate">
            {`Room ${r.room}${r.bed ? ` · Bed ${r.bed}` : ''} · Floor ${r.floor} · ${r.diet}`}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#f0f4f8] text-[#5d6678] text-[12px] font-semibold">
          {r.meal}
        </span>
        <button
          onClick={() => {
            // Hand the kiosk the person whose row was clicked, plus the meal and
            // day this row stands for, so nothing has to be picked twice.
            setKioskPrefill({
              name: r.name,
              room: r.room,
              bed: r.bed,
              diet: r.diet,
              mrn: r.mrn,
              floor: r.floor,
              meal: r.meal,
              day: missDate === appToday ? 'today' : 'tomorrow',
              eater: r.kind,
              returnTo: 'food-kitchen',
              returnLabel: 'Back to Kitchen',
            });
            onNavigate('food-kiosk');
          }}
          title={`Order ${r.meal} for ${r.name} in the patient kiosk`}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-[#d6dae6] hover:bg-[#f7f8fb] text-[#16274D] rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Order
        </button>
      </div>
    );

    return (
      <div className="space-y-4">
        <Card className="!overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D] flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#e0a106]" /> Not ordered ·{' '}
                {missDate === appToday ? 'Today' : 'Tomorrow'}
              </div>
              <div className="text-[13px] text-[#5d6678] mt-0.5">
                {fmtDate(missDate)} · {notOrderedPatients} patient{notOrderedPatients === 1 ? '' : 's'} and{' '}
                {notOrderedCompanions} companion{notOrderedCompanions === 1 ? '' : 's'} with no order ·{' '}
                {notOrderedFiltered.length} meal{notOrderedFiltered.length === 1 ? '' : 's'} to chase
              </div>
              {missDate === appToday && (
                <div className="text-[12px] text-[#9099ab] mt-0.5">
                  Today is for patients admitted after the window closed.
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex bg-[#f7f8fb] p-1 rounded-[10px] border border-[#e7e9f0]">
                {([
                  { d: appToday, label: 'Today' },
                  { d: appTomorrow, label: 'Tomorrow' },
                ] as const).map(({ d, label }) => (
                  <button
                    key={label}
                    onClick={() => setMissDate(d)}
                    className={cx(
                      'px-3.5 py-1.5 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                      missDate === d ? 'bg-white text-[#16274D] shadow border border-[#e7e9f0]' : 'text-[#5d6678] hover:text-[#16274D]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 py-3 bg-[#f8fafc] border-t border-b border-[#e7e9f0] !overflow-visible">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 !overflow-visible">
              <div>
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Search
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9099ab] pointer-events-none" />
                  <input
                    value={missSearch}
                    onChange={(e) => setMissSearch(e.target.value)}
                    placeholder="Search patient, room, MRN…"
                    className="w-full h-[32px] pl-[30px] pr-7 rounded-lg border border-gray-300 text-[11.5px] text-[#16274D] placeholder:text-gray-400 outline-none focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/50 bg-white"
                  />
                  {missSearch && (
                    <button
                      type="button"
                      onClick={() => setMissSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9099ab] hover:text-[#5d6678] cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Meal Type
                </label>
                <MultiSelectDropdown
                  options={db.meals}
                  selectedValues={missMeals}
                  onChange={setMissMeals}
                  placeholder="All Meals"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Diet Type
                </label>
                <MultiSelectDropdown
                  options={db.diets.map((x: any) => x.en)}
                  selectedValues={missDiets}
                  onChange={setMissDiets}
                  placeholder="All Diets"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Room/Ward
                </label>
                <MultiSelectDropdown
                  options={uniqueRooms}
                  selectedValues={missRooms}
                  onChange={setMissRooms}
                  placeholder="All Rooms"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Order For
                </label>
                <MultiSelectDropdown
                  options={['Patient', 'Companion']}
                  selectedValues={missFor}
                  onChange={setMissFor}
                  placeholder="Patient & Companion"
                  className="text-[12px]"
                />
              </div>
            </div>
          </div>

          {/* Group by */}
          <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12.5px] text-[#5d6678]">
              Showing <span className="font-semibold text-[#16274D]">{notOrderedFiltered.length}</span> of{' '}
              {notOrderedRows.length}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-[#9099ab]">Group by</span>
              <div className="flex bg-[#f7f8fb] p-1 rounded-[10px] border border-[#e7e9f0]">
                {([
                  { g: 'none', label: 'None' },
                  { g: 'floor', label: 'Floor' },
                  { g: 'ward', label: 'Ward' },
                  { g: 'meal', label: 'Meal' },
                ] as const).map(({ g, label }) => (
                  <button
                    key={g}
                    onClick={() => setMissGroupBy(g)}
                    className={cx(
                      'px-3 py-1 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                      missGroupBy === g ? 'bg-white text-[#16274D] shadow border border-[#e7e9f0]' : 'text-[#5d6678] hover:text-[#16274D]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {notOrderedFiltered.length === 0 ? (
          <Card>
            <div className="text-center py-[50px] px-5 text-[#5d6678]">
              <CheckCircle2 size={48} className="mx-auto text-[#1f9e75]" />
              <div className="font-semibold text-[#16274D] mt-3">
                {notOrderedRows.length === 0 ? 'Everyone has ordered for tomorrow' : 'No one matches these filters'}
              </div>
              <div className="text-[#5d6678] mt-1">
                {notOrderedRows.length === 0
                  ? 'Every patient and companion has a submitted order for tomorrow.'
                  : 'Clear a filter to see the rest of the list.'}
              </div>
            </div>
          </Card>
        ) : missGroupBy === 'none' ? (
          <Card>{notOrderedFiltered.map(row)}</Card>
        ) : (
          <div className="space-y-3">
            {Array.from(groups.entries()).map(([k, rows]) => (
              <Card key={k}>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#f7f8fb] border-b border-[#e7e9f0]">
                  <span className="font-semibold text-[#16274D] text-[13.5px]">{groupLabel(k)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#e7e9f0] text-[#5d6678] text-[12px] font-semibold tabular-nums">
                    {rows.length}
                  </span>
                </div>
                {rows.map(row)}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSummaryPage = () => {
    const { orders: todayOrders, flat, byFloor, byWard, byDiet, bySection, totalItems } = summaryDataFor(summaryDate, summaryMeal);
    const distinctItems = Object.keys(flat).length;
    // The active grouping's map + how to label/sort its groups.
    const groupCfg: Record<string, { map: Record<string, DishAgg>; icon: any; label: (k: string) => string; numeric?: boolean }> = {
      floor: { map: byFloor, icon: Layers, label: (k) => `Floor ${k}`, numeric: true },
      ward: { map: byWard, icon: BedDouble, label: (k) => `Ward ${k}`, numeric: true },
      diet: { map: byDiet, icon: Salad, label: (k) => `${k} diet` },
      section: { map: bySection, icon: Utensils, label: (k) => k },
    };
    const printedN = todayOrders.filter((o: any) => o.status === 'Printed').length;
    const deliveredN = todayOrders.filter((o: any) => o.status === 'Delivered').length;
    const fulfilled = todayOrders.length ? Math.round(((printedN + deliveredN) / todayOrders.length) * 100) : 0;

    const stats = [
      { label: 'Orders', value: String(todayOrders.length), icon: ClipboardList, c: '#0a84b1', b: '#eaf5fa' },
      { label: 'Total Items', value: String(totalItems), icon: Package, c: '#1f9e75', b: '#e7f6f0' },
      { label: 'Menu Dishes', value: String(distinctItems), icon: Utensils, c: '#7c5cbf', b: '#f0ebfa' },
      { label: 'Prepared', value: fulfilled + '%', icon: TrendingUp, c: '#b9770b', b: '#fbf1de' },
    ];

    const toggleWard = (w: string) =>
      setCollapsedSummary((c) => (c.includes(w) ? c.filter((x) => x !== w) : [...c, w]));

    const isAllMeals = summaryMeal === 'All';

    // 3-click cycle: sort one way → opposite → back to default (Total Items, highest first).
    const toggleSort = (key: string, defaultDir: 'asc' | 'desc' = 'desc') =>
      setTableSort((s) => {
        if (s.key !== key) return { key, dir: defaultDir };
        if (s.dir === defaultDir) return { key, dir: defaultDir === 'desc' ? 'asc' : 'desc' };
        return { key: 'total', dir: 'desc' };
      });

    // Table of dishes: columns adapt to the meal filter (All shows B/L/D + Total).
    const SummaryTable = ({ agg }: { agg: DishAgg }) => {
      const rows = sortDishEntries(agg);
      const th = "px-3 py-2 text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer select-none hover:bg-gray-100 transition-colors";
      const num = "px-3 py-2.5 text-[13px] text-center text-[#5d6678] tabular-nums";
      const SortTh = ({ label, k, align, defaultDir }: { label: string; k: string; align: 'text-left' | 'text-center' | 'text-right'; defaultDir?: 'asc' | 'desc' }) => (
        <th onClick={() => toggleSort(k, defaultDir)} className={cx(th, align)}>
          <span className={cx('inline-flex items-center gap-2', align === 'text-right' && 'justify-end w-full', align === 'text-center' && 'justify-center w-full')}>
            {label}
            <TableSortIcon field={k} currentField={tableSort.key} direction={tableSort.dir} />
          </span>
        </th>
      );
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortTh label="Menu Dishes" k="dish" align="text-left" defaultDir="asc" />
                <SortTh label="Section" k="section" align="text-left" defaultDir="asc" />
                {isAllMeals && <SortTh label="Breakfast" k="Breakfast" align="text-center" />}
                {isAllMeals && <SortTh label="Lunch" k="Lunch" align="text-center" />}
                {isAllMeals && <SortTh label="Dinner" k="Dinner" align="text-center" />}
                <SortTh label="Total Items" k="total" align="text-right" />
              </tr>
            </thead>
            <tbody>
              {rows.map(([dish, v]) => (
                <tr key={dish} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-[13px] font-medium text-[#16274D]">{dish}</td>
                  <td className="px-3 py-2.5 text-[12.5px] text-[#5d6678]">{v.section || '—'}</td>
                  {isAllMeals && <td className={num}>{v.meals['Breakfast'] || '—'}</td>}
                  {isAllMeals && <td className={num}>{v.meals['Lunch'] || '—'}</td>}
                  {isAllMeals && <td className={num}>{v.meals['Dinner'] || '—'}</td>}
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-block min-w-[34px] text-center px-2 py-0.5 rounded-full bg-[#eaf7fc] text-[#0a84b1] font-bold text-[12.5px] tabular-nums">×{v.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const printSummary = () => {
      // Only one thing may be in the print root at a time, or a leftover batch
      // of meal-ticket sheets prints instead of (or alongside) the summary.
      setPrintSheets([]);
      setSummaryPrint(true);
      const clear = () => { setSummaryPrint(false); window.removeEventListener('afterprint', clear); };
      window.addEventListener('afterprint', clear);
      setTimeout(() => window.print(), 150);
      setTimeout(() => setSummaryPrint(false), 4000);
    };

    const isFuture = summaryDate > appToday;

    return (
      <div className="space-y-4">
          {/* Header card: title + date filter + export */}
          <Card className="!overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D] flex items-center gap-2">
                  <Utensils size={18} /> Daily Summary
                </div>
                <div className="text-[13px] text-[#5d6678] mt-0.5">
                  {fmtDate(summaryDate)} · {summaryMeal === 'All' ? 'all meals' : summaryMeal} · prep totals
                  {isFuture && <span className="text-[#0a84b1] font-semibold ml-1">· Upcoming</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 h-[40px] px-3 rounded-[10px] border border-[#e7e9f0] bg-white">
                  <Clock size={15} className="text-[#5d6678] shrink-0" />
                  <input
                    type="date"
                    value={summaryDate}
                    max={appTomorrow}
                    onChange={(e) => e.target.value && setSummaryDate(e.target.value)}
                    className="bg-transparent text-[13px] font-semibold text-[#16274D] outline-none cursor-pointer"
                  />
                  {summaryDate !== appToday && (
                    <button
                      onClick={() => setSummaryDate(appToday)}
                      className="shrink-0 px-2 py-0.5 rounded-[6px] text-[12px] font-semibold text-[#0a84b1] hover:bg-[#eaf5fa] transition-colors cursor-pointer border-none outline-none"
                    >
                      Today
                    </button>
                  )}
                </div>
                <Btn variant="primary" onClick={printSummary}>
                  <Printer size={16} />
                  Print
                </Btn>
              </div>
            </div>

            {/* Meal filter (left) + Group By & Sort (right) */}
            <div className="px-5 pb-4 -mt-1 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Breakfast', 'Lunch', 'Dinner'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSummaryMeal(m)}
                    className={cx(
                      'px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer border outline-none',
                      summaryMeal === m
                        ? 'bg-[#16274D] text-white border-[#16274D]'
                        : 'bg-white text-[#5d6678] border-[#e7e9f0] hover:text-[#16274D]'
                    )}
                  >
                    {m === 'All' ? 'All meals' : m}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#9099ab]">Group by</span>
                <div className="flex bg-[#f7f8fb] p-1 rounded-[10px] border border-[#e7e9f0]">
                  {([
                    { g: 'none', label: 'None' },
                    { g: 'floor', label: 'Floor' },
                    { g: 'section', label: 'Section' },
                    { g: 'diet', label: 'Diet' },
                    { g: 'ward', label: 'Ward' },
                  ] as const).map(({ g, label }) => (
                    <button
                      key={g}
                      onClick={() => setSummaryGroup(g)}
                      className={cx(
                        'px-3 py-1 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                        summaryGroup === g ? 'bg-white text-[#16274D] shadow border border-[#e7e9f0]' : 'text-[#5d6678] hover:text-[#16274D]'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#e7e9f0] shadow-sm p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.b, color: s.c }}>
                    <s.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[22px] font-bold leading-none text-[#16274D]">{s.value}</div>
                    <div className="text-[12px] font-medium mt-1" style={{ color: s.c }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {distinctItems === 0 && (
              <div className="bg-white rounded-2xl border border-[#e7e9f0] p-8 text-center text-[13px] text-gray-400 italic">
                No orders for this day yet.
              </div>
            )}

            {/* Grouped (by section / diet / ward), or one flat list */}
            {distinctItems > 0 && summaryGroup !== 'none' ? (
              (() => {
                const cfg = groupCfg[summaryGroup];
                const GroupIcon = cfg.icon;
                return Object.keys(cfg.map)
                  .sort((a, b) => a.localeCompare(b, undefined, cfg.numeric ? { numeric: true } : undefined))
                  .map((key) => {
                    const dishes = sortDishEntries(cfg.map[key]);
                    const groupTotal = dishes.reduce((n, [, v]) => n + v.total, 0);
                    const collapsed = collapsedSummary.includes(key);
                    return (
                      <div key={key} className="bg-white rounded-2xl border border-[#e7e9f0] shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleWard(key)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors cursor-pointer border-0 bg-transparent outline-none text-left"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#eaf5fa] text-[#0a84b1]">
                            <GroupIcon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-['Poppins',sans-serif] font-semibold text-[15px] text-[#16274D]">{cfg.label(key)}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] text-[#9099ab]">{dishes.length} Menu Dishes</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e7f6f0] text-[#1f9e75] text-[11.5px] font-bold">{groupTotal} Total Items</span>
                            </div>
                          </div>
                          <ChevronDown size={18} className={cx("text-[#9099ab] transition-transform", collapsed && "-rotate-90")} />
                        </button>
                        {!collapsed && (
                          <div className="border-t border-[#eef1f6]">
                            <SummaryTable agg={cfg.map[key]} />
                          </div>
                        )}
                      </div>
                    );
                  });
              })()
            ) : distinctItems > 0 ? (
              <div className="bg-white rounded-2xl border border-[#e7e9f0] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#eef1f6] bg-[#f8fafc]">
                  <span className="text-[13px] font-semibold text-[#16274D]">All items</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[12px] text-[#9099ab]">{distinctItems} Menu Dishes</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e7f6f0] text-[#1f9e75] text-[11.5px] font-bold">{totalItems} Total Items</span>
                  </span>
                </div>
                <SummaryTable agg={flat} />
              </div>
            ) : null}
          </div>

      </div>
    );
  };

  return (
    <FoodPage current="kit" onNavigate={onNavigate}>
      {/* Dynamic styles for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Print root lives at the end of <body> via a portal; hidden on screen */
        #careinn-print-root { display: none; }
        @media print {
          ${printSheets.length > 0 ? '' : '@page { size: A4 portrait; margin: 12mm; }'}
          /* The app has a global rule forcing #root visible (specificity 1,0,2).
             Override it with the SAME selector so only the print root prints. */
          body > div#root,
          body > div[data-name],
          body > div.relative {
            display: none !important;
            visibility: hidden !important;
          }
          body > *:not(#careinn-print-root) { display: none !important; }
          #careinn-print-root {
            display: block !important;
            visibility: visible !important;
            background-color: white;
          }
          #careinn-print-root * { visibility: visible !important; }
          /* Force browsers to actually print background colours (header tint, icon
             chips, bullet dots, diet pills) instead of stripping them. */
          #careinn-print-root,
          #careinn-print-root * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-ticket-page {
            page-break-after: always;
            break-after: page;
            padding: 16px;
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-ticket-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          /* A summary group spans pages; only the individual rows must stay
             whole, and the column head repeats so page 2+ is still readable. */
          #careinn-print-root tr { break-inside: avoid; page-break-inside: avoid; }
          #careinn-print-root thead { display: table-header-group; }
          #careinn-print-root tfoot { display: table-footer-group; }
          /* Never strand a group heading alone at the foot of a page. */
          #careinn-print-root .summary-group-head { break-after: avoid; page-break-after: avoid; }
        }
      `}} />

      {/* One large container with a clear page title (Channel-page pattern) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Page header + tabs (CareSign pattern) */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center shrink-0">
              <ChefHat size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Kitchen
              </h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Review patient meals, dietary alerts, printing and delivery progress.
              </p>
            </div>
            {/* Queue actions live on the title row — they were costing a whole
                band of vertical space in a sub-header that only repeated the
                tab label and the order count. */}
            {mainTab === 'queue' && allOrders.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={openSheetPreview}
                  title={
                    selectedOrderIds.length > 0
                      ? 'Preview and print meal tickets for the selected rows'
                      : 'Preview and print meal tickets for every order on this serving date'
                  }
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-xl text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                  <Printer size={16} />
                  {selectedOrderIds.length > 0 ? `Meal tickets · ${selectedOrderIds.length} selected` : 'Meal tickets'}
                </button>
                <button
                  onClick={() => { setKioskPrefill({ returnTo: 'food-kitchen', returnLabel: 'Back to Kitchen' }); onNavigate('food-kiosk'); }}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#d6dae6] hover:bg-[#f7f8fb] text-[#16274D] rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap"
                >
                  <Plus size={16} />
                  Add order
                </button>
              </div>
            )}
          </div>
          <PillTabs
            tabs={[
              { id: 'summary', label: 'Daily Summary' },
              { id: 'queue', label: 'Kitchen Queue' },
              {
                id: 'missing',
                label: 'Not Ordered',
                /* The count is the point of the tab — it is what tells the
                   kitchen whether anyone still needs chasing. */
                icon: notOrderedPeople > 0 ? (
                  <span
                    className={cx(
                      'min-w-[20px] px-1.5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums',
                      mainTab === 'missing' ? 'bg-white/25 text-white' : 'bg-[#fff4e5] text-[#b4690e]'
                    )}
                  >
                    {notOrderedPeople}
                  </span>
                ) : undefined,
              },
            ]}
            activeTab={mainTab}
            onChange={(id) => setMainTab(id as 'queue' | 'summary' | 'missing')}
          />
        </div>

        {/* Page body */}
        <div className="p-6">

      {mainTab === 'summary' ? (
        renderSummaryPage()
      ) : mainTab === 'missing' ? (
        renderNotOrderedPage()
      ) : (
      <>
      {isHistory && (
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef2fb] border border-[#dbe3f4] text-[#3a4a6b] font-semibold text-[12.5px]">
          <Clock size={14} />
          Viewing history · {dateDisplay} (read-only)
        </div>
      )}

      {allOrders.length === 0 ? (
        <Card>
          <div className="text-center py-[50px] px-5 text-[#5d6678]">
            <ChefHat size={48} className="mx-auto text-[#9099ab]" />
            <div className="font-semibold text-[#16274D] mt-3">No orders yet</div>
            <div className="text-[#5d6678] mt-1">
              Place an order in the patient kiosk and it lands here.
            </div>
            <div className="mt-4 flex justify-center">
              <Btn variant="primary" onClick={() => { setKioskPrefill({ returnTo: 'food-kitchen', returnLabel: 'Back to Kitchen' }); onNavigate('food-kiosk'); }}>
                <Tablet size={16} />
                Open patient kiosk
              </Btn>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Header, Filters, and Bulk Actions Card with !overflow-visible to prevent dropdown clipping */}
          <Card className="mb-5 !overflow-visible">
            <div className="px-5 py-3 border-b border-[#e7e9f0]">
              {/* Workflow status chips, with the view toggle on the same row */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all' as const, label: 'All', count: allOrders.length, color: '#16274D', bg: '#eef1f6' },
                  { key: 'Submitted' as const, label: 'Ordered', count: counts.Submitted, color: '#0A6CA6', bg: '#E7F3FB' },
                  { key: 'Printed' as const, label: 'Printed', count: counts.Printed, color: '#96650A', bg: '#fbf1de' },
                  { key: 'Delivered' as const, label: 'Delivered', count: counts.Delivered, color: '#157F5C', bg: '#e7f6f0' },
                ].map((c) => {
                  const active = queueStatus === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setQueueStatus(active && c.key !== 'all' ? 'all' : c.key)}
                      className={cx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer border outline-none',
                        active ? 'shadow-sm' : 'bg-white hover:bg-[#f8fafc]'
                      )}
                      style={
                        active
                          ? { color: c.color, backgroundColor: c.bg, borderColor: c.color }
                          : { color: '#5d6678', borderColor: '#e7e9f0' }
                      }
                    >
                      <span>{c.label}</span>
                      <span
                        className="min-w-[20px] text-center px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ color: active ? c.color : '#8a94a6', backgroundColor: active ? '#ffffff' : '#eef1f6' }}
                      >
                        {c.count}
                      </span>
                    </button>
                  );
                })}

                {/* Cards/Table view toggle — same row, pushed right */}
                <div className="ml-auto flex bg-[#f7f8fb] p-1 rounded-[10px] border border-[#e7e9f0] shrink-0">
                  {([
                    { key: 'cards' as const, label: 'Cards', icon: LayoutGrid },
                    { key: 'table' as const, label: 'Table', icon: TableIcon },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setViewMode(key)}
                      className={cx(
                        'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                        viewMode === key
                          ? 'bg-white text-[#16274D] shadow border border-[#e7e9f0]'
                          : 'text-[#5d6678] hover:text-[#16274D]'
                      )}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* Multi-Filter Section — filters left, Date on the right */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e7e9f0] !overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 !overflow-visible">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 flex-1 !overflow-visible">
          {/* Search — a cell in the filter grid. The icon is positioned against
              an inner wrapper that holds only the input, so it centres on the
              field instead of guessing an offset past the label. */}
          <div>
            <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
              Search
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9099ab] pointer-events-none" />
              <input
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Search patient, room, order #…"
                className="w-full h-[32px] pl-[30px] pr-7 rounded-lg border border-gray-300 text-[11.5px] text-[#16274D] placeholder:text-gray-400 outline-none focus:border-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/50 bg-white"
              />
              {queueSearch && (
                <button
                  type="button"
                  onClick={() => setQueueSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9099ab] hover:text-[#5d6678] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Meal Type
                </label>
                <MultiSelectDropdown
                  options={db.meals}
                  selectedValues={selectedMeals}
                  onChange={setSelectedMeals}
                  placeholder="All Meals"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Diet Type
                </label>
                <MultiSelectDropdown
                  options={db.diets.map((x: any) => x.en)}
                  selectedValues={selectedDiets}
                  onChange={setSelectedDiets}
                  placeholder="All Diets"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Room/Ward
                </label>
                <MultiSelectDropdown
                  options={uniqueRooms}
                  selectedValues={selectedWards}
                  onChange={setSelectedWards}
                  placeholder="All Rooms"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Order For
                </label>
                <MultiSelectDropdown
                  options={['Patient', 'Companion']}
                  selectedValues={selectedMealFor}
                  onChange={setSelectedMealFor}
                  placeholder="Patient & Companion"
                  className="text-[12px]"
                />
              </div>
              <div className="relative !overflow-visible">
                <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                  Guest
                </label>
                <SingleSelectDropdown
                  size="md"
                  className="text-[12px]"
                  options={[
                    { value: '', label: 'All patients' },
                    { value: 'with', label: 'With guest' },
                    { value: 'without', label: 'Without guest' },
                  ]}
                  value={companionFilter === 'all' ? '' : companionFilter}
                  onChange={(v) => setCompanionFilter((v || 'all') as 'all' | 'with' | 'without')}
                  placeholder="All patients"
                />
              </div>
            </div>
            {/* Date — right side */}
            <div className="lg:w-[240px] shrink-0">
              <label className="block text-[10.5px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">
                Date
              </label>
              <div className="flex items-center gap-1.5 h-[32px] px-2.5 rounded-lg border border-gray-300 bg-white">
                <Clock size={13} className="text-[#5d6678] shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  max={appTomorrow}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-[11.5px] font-semibold text-[#16274D] outline-none cursor-pointer"
                />
                {selectedDate !== appToday ? (
                  <button
                    onClick={() => setSelectedDate(appToday)}
                    className="shrink-0 px-1.5 py-0.5 rounded-[6px] text-[11px] font-semibold text-[#0a84b1] hover:bg-[#eaf5fa] transition-colors cursor-pointer border-none outline-none"
                  >
                    Today
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedDate(appTomorrow)}
                    className="shrink-0 px-1.5 py-0.5 rounded-[6px] text-[11px] font-semibold text-[#0a84b1] hover:bg-[#eaf5fa] transition-colors cursor-pointer border-none outline-none"
                  >
                    Tomorrow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </Card>

      {/* Table view */}
      {viewMode === 'table' && !restrictToWardId ? (
        viewKitchenTable()
      ) : (
      /* Grid of Kitchen Tickets */
      restrictToWardId ?
        /* Grid of Kitchen Cards (Ward view layout) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {roomOrders.map(({ room, order, typeLabel, headerColor, icon: Icon }) => (
            <KitchenCard
              key={room.roomNumber + '_' + (room.bed || '')}
              roomNumber={room.roomNumber + (room.bed || '')}
              type={typeLabel}
              headerColor={headerColor}
              icon={Icon}
              order={order}
              onEdit={() => {
                if (order) {
                  startEdit(order);
                } else {
                  toast('No order placed for this room');
                }
              }}
              onPrint={() => {
                if (order) printSingle(order);
              }}
              onDeliver={() => {
                if (order) advance(order.id);
              }}
            />
          ))}
        </div>
      : visibleOrders.length === 0 ?
        <Card>
          <div className="text-center py-10 px-5 text-[#5d6678]">
            <div className="font-semibold text-[#16274D]">No tickets match this filter</div>
            <div className="text-[13px] mt-1">Try a different status, meal, diet, or room.</div>
          </div>
        </Card>
      :
        /* Select all + grid of Kitchen Tickets — one container */
        <div className="rounded-2xl border border-[#e7e9f0] bg-white overflow-hidden">
          {viewMode === 'cards' && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#f8fafc] border-b border-[#e7e9f0]">
              <label className="inline-flex items-center gap-2.5 text-[13.5px] font-semibold text-[#16274D] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleOrders.length > 0 && visibleOrders.every((o: any) => selectedOrderIds.includes(o.id))}
                  onChange={() => handleSelectAll(visibleOrders)}
                  className="w-4.5 h-4.5 rounded border-2 border-gray-300 cursor-pointer accent-[#4EBEE3]"
                />
                <span>Select all</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {selectedOrderIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#5d6678]">{selectedOrderIds.length} selected</span>
                    <Btn variant="neutral" onClick={openSheetPreview}>
                      <Printer size={16} />
                      Print tickets
                    </Btn>
                    <Btn variant="primary" onClick={bulkDeliver}>
                      <Check size={16} />
                      Mark as Delivered
                    </Btn>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#9099ab]">Group by</span>
                  <div className="flex bg-white p-1 rounded-[10px] border border-[#e7e9f0]">
                    {([
                      { g: 'none', label: 'None' },
                      { g: 'floor', label: 'Floor' },
                      { g: 'ward', label: 'Ward' },
                    ] as const).map(({ g, label }) => (
                      <button
                        key={g}
                        onClick={() => setCardsGroupBy(g)}
                        className={cx(
                          'px-3 py-1 rounded-[8px] text-[12.5px] font-semibold transition-all cursor-pointer border-none outline-none',
                          cardsGroupBy === g ? 'bg-[#eef2f7] text-[#16274D] shadow-sm' : 'text-[#5d6678] hover:text-[#16274D]'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 items-start">
          {(() => {
          const renderInnerCard = ({ o, idx }: { o: any; idx: number }) => {
            const isCompanion = o.name.toLowerCase().includes('companion');
            const info = getDeviceAndOccupancy(o, idx);

            // Categorize lines
            const mealItems: string[] = [];
            const accompaniments: string[] = [];

            (o.lines || []).forEach(([section, dish]: [string, string]) => {
              if (isAccompaniment(section, dish)) {
                accompaniments.push(dish);
              } else {
                mealItems.push(dish);
              }
            });

            // Fetch patient allergies
            const patientObj = db.patients.find((p: any) => p.name === o.name);
            const allergiesList = isCompanion
              ? 'None'
              : patientObj && patientObj.allergies.length > 0
              ? patientObj.allergies.join(', ')
              : 'None';


            // Status badge styling (single source of truth for label + colors)
            const statusMeta =
              o.status === 'Delivered'
                ? { label: 'Delivered', text: '#157F5C', bg: '#e7f6f0' }
                : o.status === 'Printed'
                ? { label: 'Printed', text: '#96650A', bg: '#fbf1de' }
                : { label: 'Ordered', text: '#0A6CA6', bg: '#E7F3FB' };

            const isSelected = selectedOrderIds.includes(o.id);
            const isReal = !o._deviceId;
            const displayName = isCompanion ? basePatientName(o) : (isReal ? o.name : info.patientName);
            const allDishes = [...mealItems, ...accompaniments];
            const timeRange = o.meal === 'Breakfast' ? '8:00 AM – 9:00 AM' : o.meal === 'Lunch' ? '1:00 PM – 2:00 PM' : '7:00 PM – 8:00 PM';

            // Bilingual + diet-colour data (single source of truth = the store).
            const dietClr = dietColor(db, o.diet);
            // Header is a softened (≈88% opacity) wash of the diet's own colour, white text on top.
            const roleStyle = {
              bg: dietClr + 'E0',
              avBg: 'rgba(255,255,255,0.22)',
              avIcon: '#ffffff',
              pillBg: 'rgba(255,255,255,0.92)',
              pillText: dietClr,
            };
            const mealArabic = mealAr(db, o.meal);
            const dietArabic = dietAr(db, o.diet);
            const floorNum = Math.floor(parseInt(o.room, 10) / 100);
            const floor = String(o._floor ?? (patientObj && patientObj.floor) ?? (isNaN(floorNum) ? '' : floorNum));
            const bldg = o.building || (patientObj && patientObj.building) || '';
            const allergyArr: string[] = isCompanion ? (o.allergies || []) : ((patientObj && patientObj.allergies) || o.allergies || []);
            const hasAllergy = allergyArr.length > 0;
            const allergiesEn = hasAllergy ? allergyArr.join(', ') : 'None known';
            const allergiesArText = hasAllergy ? allergyArr.map((a) => allergenAr(db, a) || a).join('، ') : 'لا توجد حساسية معروفة';
            const roomWardEn = `Room ${o.room}${o.bed ? ` · Bed ${o.bed}` : ''} · Floor ${floor}${bldg ? ` · Bldg ${bldg}` : ''}`;
            const roomWardAr = `غرفة ${o.room}${o.bed ? ` · سرير ${o.bed}` : ''} · الدور ${floor}${bldg ? ` · المبنى ${bldg}` : ''}`;
            const roleLabel = isCompanion ? 'Guest' : 'Patient';
            const roleLabelAr = isCompanion ? 'مرافق' : 'مريض';
            const expanded = expandedCards.includes(o.id);

            // One bilingual label/value row in the detail table.
            const detailRow = (
              Icon: any,
              en: string, ar: string,
              valEn: string, valAr: string,
              valColor?: string,
            ) => (
              <div className="flex items-start justify-between gap-3 px-3.5 py-2 border-t border-[#eef1f6]">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} className="text-[#9099ab] shrink-0" />
                  <div className="leading-tight min-w-0">
                    <div className="text-[11.5px] font-semibold text-[#5d6678]">{en}</div>
                    <div className="text-[10px] text-[#a2abbb]" dir="rtl">{ar}</div>
                  </div>
                </div>
                <div className="text-right leading-tight min-w-0">
                  <div className="text-[12px] font-semibold" style={{ color: valColor || '#16274D' }}>{valEn}</div>
                  <div className="text-[10px] text-[#a2abbb]" dir="rtl">{valAr}</div>
                </div>
              </div>
            );

            return (
              <div
                key={o.id}
                id={`korder-${o.id}`}
                className={cx(
                  "rounded-[14px] border bg-white overflow-hidden flex flex-col transition-all",
                  focusOrderId === o.id
                    ? "border-[#4EBEE3] ring-4 ring-[#4EBEE3]/40 shadow-lg"
                    : isSelected ? "border-[#4EBEE3] ring-1 ring-[#4EBEE3] shadow-sm" : "border-[#e7e9f0] hover:shadow-md"
                )}
              >
                {/* Header — clickable summary; click toggles the details open/closed */}
                <button
                  type="button"
                  onClick={() => setExpandedCards((prev) => (prev.includes(o.id) ? prev.filter((x) => x !== o.id) : [...prev, o.id]))}
                  className="text-left w-full cursor-pointer border-0 p-0"
                  style={{ backgroundColor: roleStyle.bg }}
                  aria-expanded={expanded}
                >
                  <div className="flex items-start gap-3 p-3.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: roleStyle.avBg, color: roleStyle.avIcon }}>
                      <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-bold text-white">{roleLabel}</span>
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90"
                              style={{ color: statusMeta.text }}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                          <div className="font-bold text-white text-[15px] truncate mt-1">
                            {displayName}
                          </div>
                          <div className="text-[11px] text-white/80 mt-0.5 truncate">{roomWardEn}</div>
                        </div>
                        <div className="flex items-start gap-2 shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-[13.5px] text-white">
                              {o.orderNo || o.id.replace('ORD-', '')}
                            </div>
                            <span
                              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold"
                              style={{ color: roleStyle.pillText, backgroundColor: roleStyle.pillBg }}
                            >
                              {o.meal}
                            </span>
                          </div>
                          <ChevronDown size={18} className={cx("text-white/80 mt-0.5 transition-transform", expanded && "rotate-180")} />
                        </div>
                      </div>

                      {/* Prominent diet tag + allergies (always visible) */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-white"
                          style={{ color: dietClr }}
                        >
                          <Salad size={12} /> {o.diet}
                        </span>
                        {hasAllergy ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-bold text-[#C0392B] bg-white">
                            <AlertTriangle size={12} strokeWidth={2.5} /> {allergiesEn}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white bg-white/20">
                            No known allergies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Diet-change alert */}
                {o.dietChanged && (
                  <div className="flex items-center gap-2 mx-3.5 mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#fbf1de] text-[#b9770b]">
                    <AlertTriangle size={13} className="shrink-0" strokeWidth={2.5} />
                    <span className="text-[11.5px] font-semibold">
                      Diet changed after order submission{o.prevDiet ? ` · ${o.prevDiet} → ${o.diet}` : ''}
                    </span>
                  </div>
                )}

                {/* Expanded details */}
                {expanded && (
                  <>
                    {/* Delivery + meal items band */}
                    <div className="px-3.5 py-2.5 border-t border-[#eef1f6]">
                      <div className="flex items-center gap-2 text-[12.5px] text-[#5d6678]">
                        <Clock size={14} className="text-[#9099ab] shrink-0" />
                        <span>Delivery: <span className="font-semibold text-[#16274D]">{timeRange}</span> · {fmtDate(o.date)}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-2 text-[12.5px]">
                        <Utensils size={14} className="text-[#9099ab] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[#5d6678]">Meal items ({allDishes.length}): </span>
                          <span className="text-[#16274D] font-medium">
                            {allDishes.length > 0 ? allDishes.join(', ') : 'None selected'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bilingual detail table (no Companion Status) */}
                    <div>
                      {detailRow(Utensils, 'Meal Type', 'نوع الوجبة', o.meal, mealArabic)}
                      {detailRow(Salad, 'Diet Type', 'نوع النظام الغذائي', o.diet, dietArabic, dietClr)}
                      {detailRow(BedDouble, 'Room / Ward', 'الغرفة / الجناح', roomWardEn, roomWardAr)}
                      {detailRow(AlertTriangle, 'Allergies', 'الحساسية', allergiesEn, allergiesArText, hasAllergy ? '#C0392B' : '#16274D')}
                    </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-t border-[#eef1f6] bg-[#fbfcfe]">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: isCompanion ? '#0a84b1' : '#16274D', backgroundColor: isCompanion ? '#eaf7fc' : '#eef2f7' }}
                  >
                    {roleLabel}
                    <span className="font-medium normal-case" dir="rtl">{roleLabelAr}</span>
                  </span>
                  <div className="flex items-center gap-2">
                  {o.status === 'Submitted' && (
                    <Btn variant="accent" onClick={() => printSingle(o)}>
                      <Printer size={16} />
                      Print
                    </Btn>
                  )}
                  {o.status === 'Printed' && (
                    <>
                      <Btn variant="neutral" onClick={() => printSingle(o)} title="Reprint Ticket">
                        <Printer size={16} />
                        Reprint
                      </Btn>
                      <Btn variant="primary" onClick={() => advance(o.id)}>
                        <Check size={16} />
                        Mark Delivered
                      </Btn>
                    </>
                  )}
                  {o.status === 'Delivered' && (
                    <Btn variant="neutral" onClick={() => printSingle(o)} title="Reprint Ticket">
                      <Printer size={16} />
                      Reprint
                    </Btn>
                  )}
                  </div>
                </div>
                  </>
                )}
              </div>
            );
          };

          // A pair = a patient card + its companion card (when present), wrapped in one
          // container with a shared Room · Bed · Floor header, matching the ticket style.
          const renderPair = (group: { o: any; idx: number }[]) => {
            const patientEntry = group.find((g) => !isCompanionOrder(g.o)) || null;
            const companionEntry = group.find((g) => isCompanionOrder(g.o)) || null;
            const anchor = patientEntry || companionEntry!;   // for location + key
            const po = anchor.o;
            const pInfo = getDeviceAndOccupancy(po, anchor.idx);
            const pIsReal = !po._deviceId;
            const pairLabel = patientEntry && companionEntry ? 'Patient & Companion' : patientEntry ? 'Patient' : 'Companion';
            const baseLoc = pIsReal ? `Room ${po.room}${po.bed ? ` · Bed ${po.bed}` : ''}` : pInfo.locationDetails;
            const loc = /floor/i.test(baseLoc) ? baseLoc : `${baseLoc} · Floor ${orderFloor(po)}`;
            const pairIds = group.map((g) => g.o.id);
            const allSel = pairIds.length > 0 && pairIds.every((id) => selectedOrderIds.includes(id));

            // Grayed-out placeholder shown when a patient has no companion order.
            // It stretches to the patient card's height (grid stretch) and centres the
            // "No order placed for a guest" message.
            const emptyCard = (role: 'Patient' | 'Guest') => (
              <div className="rounded-[14px] border border-dashed border-[#dfe3ea] bg-[#f6f7f9] overflow-hidden flex flex-col h-full">
                <div className="flex items-start gap-3 p-3.5 bg-[#eceef2]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#dfe3ea] text-[#9aa3b2] shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-bold text-[#9099ab]">{role}</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#e3e6ec] text-[#9099ab]">
                        No order
                      </span>
                    </div>
                    <div className="font-bold text-[#aab2c0] text-[15px] mt-1">{role === 'Guest' ? 'No guest order' : 'No patient order'}</div>
                    <div className="text-[11px] text-[#b6bdc9] mt-0.5 truncate">{loc}</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center py-6 text-center">
                  <div>
                    <div className="text-[12.5px] font-medium text-[#9099ab]">No order placed for a guest</div>
                    <div className="text-[11px] text-[#b6bdc9] mt-0.5" dir="rtl">لا يوجد طلب مرافق</div>
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={'pair-' + pairKey(po)}
                className="rounded-[18px] border border-[#dbe7f2] bg-gradient-to-b from-[#f3f8fc] to-[#eef4fa] p-3 xl:col-span-2"
              >
                {/* Shared header */}
                <div className="flex items-center gap-2.5 px-1 pb-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderIds((prev) => (allSel ? prev.filter((id) => !pairIds.includes(id)) : Array.from(new Set([...prev, ...pairIds]))))}
                    className="shrink-0 focus:outline-none cursor-pointer p-0 bg-transparent border-0"
                    title="Select ticket(s)"
                  >
                    <div className={cx(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      allSel ? "bg-[#4EBEE3] border-[#4EBEE3] text-white" : "bg-white border-gray-300 hover:border-[#4EBEE3] text-transparent"
                    )}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#16274D]">
                    <MapPin size={14} className="text-[#5d6678]" />
                    {loc}
                  </div>
                </div>
                {/* Patient (left) + companion (right); grayed placeholder when missing.
                    Stretch so the "No order" placeholder matches the patient card's height;
                    real pairs keep natural (independent) heights. */}
                <div className={cx("grid gap-3 grid-cols-1 lg:grid-cols-2", (patientEntry && companionEntry) ? "items-start" : "items-stretch")}>
                  {patientEntry ? renderInnerCard(patientEntry) : emptyCard('Patient')}
                  {companionEntry ? renderInnerCard(companionEntry) : emptyCard('Guest')}
                </div>
              </div>
            );
          };

          // Group the ordered ticket list into pairs (patient followed by its companion).
          const entries = visibleOrders.map((o: any, idx: number) => ({ o, idx }));
          const pairMap = new Map<string, { o: any; idx: number }[]>();
          const pairOrder: string[] = [];
          entries.forEach((e) => {
            const k = pairKey(e.o);
            if (!pairMap.has(k)) { pairMap.set(k, []); pairOrder.push(k); }
            pairMap.get(k)!.push(e);
          });
          const pairs = pairOrder.map((k) => {
            const g = pairMap.get(k)!;
            return [...g].sort((a, b) => (isCompanionOrder(a.o) ? 1 : 0) - (isCompanionOrder(b.o) ? 1 : 0));
          });

          if (cardsGroupBy === 'none') return pairs.map(renderPair);

          const keyOf = (g: { o: any; idx: number }[]) => {
            const patient = g.find((e) => !isCompanionOrder(e.o)) || g[0];
            return cardsGroupBy === 'floor' ? orderFloor(patient.o) : orderWard(patient.o);
          };
          const keys = Array.from(new Set(pairs.map(keyOf))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
          return keys.flatMap((k) => {
            const groups = pairs.filter((g) => keyOf(g) === k);
            const ck = 'card:' + cardsGroupBy + ':' + k;
            const collapsed = collapsedMeals.includes(ck);
            const label = cardsGroupBy === 'floor' ? `Floor ${k}` : `Ward ${k}`;
            const groupIds = groups.flat().map((e) => e.o.id);
            const allGroupSel = groupIds.length > 0 && groupIds.every((id) => selectedOrderIds.includes(id));
            return [
              <div
                key={'h-' + k}
                className="xl:col-span-2 flex items-center gap-2.5 rounded-lg bg-[#f8fafc] border border-gray-200 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={allGroupSel}
                  onChange={() => setSelectedOrderIds((prev) => (allGroupSel ? prev.filter((id) => !groupIds.includes(id)) : Array.from(new Set([...prev, ...groupIds]))))}
                  title={`Select all in ${label}`}
                  className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer accent-[#4EBEE3]"
                />
                <button
                  type="button"
                  onClick={() => setCollapsedMeals((c) => (c.includes(ck) ? c.filter((x) => x !== ck) : [...c, ck]))}
                  className="flex items-center gap-2 flex-1 text-left cursor-pointer bg-transparent border-0 p-0 outline-none"
                >
                  {collapsed ? <ChevronRight size={16} className="text-[#5d6678]" /> : <ChevronDown size={16} className="text-[#5d6678]" />}
                  <span className="text-[13.5px] font-bold text-[#16274D]">{label}</span>
                  <span className="text-[12px] font-medium text-[#5d6678]">— {groups.length} ticket{groups.length === 1 ? '' : 's'}</span>
                </button>
              </div>,
              ...(collapsed ? [] : groups.map(renderPair)),
            ];
          });
          })()}
          </div>
        </div>
      )}
      </>
      )}
      </>
      )}
        </div>
      </div>

      {/* Print rendering area (hidden on screen, visible during browser print) */}
      {typeof document !== 'undefined' && createPortal(
        <div id="careinn-print-root">
          {printSheets.length > 0 && (
            <>
              <MealTicketPrintStyles cutGuides={cutGuides} />
              {printSheets.map((sh) => <MealSheet key={sh.key} sheet={sh} cutGuides={cutGuides} />)}
            </>
          )}
          {summaryPrint && (() => {
            const { orders, flat, byFloor, byWard, byDiet, bySection, totalItems } = summaryDataFor(summaryDate, summaryMeal);
            const printAll = summaryMeal === 'All';
            const printTable = (agg: any) => (
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-[#16274D] text-left text-[#5d6678]">
                    <th className="py-1 pr-2">Menu Dishes</th>
                    <th className="py-1 px-2">Section</th>
                    {printAll && <th className="py-1 px-2 text-center">Breakfast</th>}
                    {printAll && <th className="py-1 px-2 text-center">Lunch</th>}
                    {printAll && <th className="py-1 px-2 text-center">Dinner</th>}
                    <th className="py-1 pl-2 text-right">Total Items</th>
                  </tr>
                </thead>
                <tbody>
                  {sortDishEntries(agg).map(([dish, v]: any) => (
                    <tr key={dish} className="border-b border-[#eef1f6]">
                      <td className="py-1 pr-2 text-[#16274D] font-medium">{dish}</td>
                      <td className="py-1 px-2 text-[#5d6678]">{v.section || '—'}</td>
                      {printAll && <td className="py-1 px-2 text-center">{v.meals['Breakfast'] || '—'}</td>}
                      {printAll && <td className="py-1 px-2 text-center">{v.meals['Lunch'] || '—'}</td>}
                      {printAll && <td className="py-1 px-2 text-center">{v.meals['Dinner'] || '—'}</td>}
                      <td className="py-1 pl-2 text-right font-bold text-[#16274D]">{v.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
            const printGroup: Record<string, { map: Record<string, DishAgg>; label: (k: string) => string; numeric?: boolean }> = {
              floor: { map: byFloor, label: (k) => `Floor ${k}`, numeric: true },
              ward: { map: byWard, label: (k) => `Ward ${k}`, numeric: true },
              diet: { map: byDiet, label: (k) => `${k} diet` },
              section: { map: bySection, label: (k) => k },
            };
            const pg = printGroup[summaryGroup];
            const groups = pg
              ? Object.keys(pg.map).sort((a, b) => a.localeCompare(b, undefined, pg.numeric ? { numeric: true } : undefined)).map((k) => ({ label: pg.label(k), agg: pg.map[k] }))
              : [{ label: 'All items', agg: flat }];
            return (
              <div className="print-ticket-page" style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className="border-b-2 border-[#16274D] pb-2 mb-4">
                  <div className="font-['Poppins',sans-serif] font-bold text-[20px] text-[#16274D]">Daily Summary — Kitchen Prep Sheet</div>
                  <div className="text-[12px] text-[#5d6678] mt-1">
                    {fmtDate(summaryDate)} · {summaryMeal === 'All' ? 'All meals' : summaryMeal} · {orders.length} orders · {totalItems} items
                  </div>
                </div>
                {Object.keys(flat).length === 0 && <div className="text-[12px] text-gray-400 italic">No orders for this day.</div>}
                {groups.map((g) => {
                  const total = Object.values(g.agg).reduce((n: number, v: any) => n + v.total, 0);
                  return (
                    <div key={g.label} className="mb-4">
                      <div className="font-bold text-[13.5px] text-[#16274D] mb-1 summary-group-head">{g.label} <span className="text-[#9099ab] font-normal">({total})</span></div>
                      {printTable(g.agg)}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>,
        document.body
      )}
      {/* Meal-ticket preview — true-size sheets scaled to fit, so what you see
          is geometrically what prints. */}
      {sheetPreviewOpen && (
        <div
          className="fixed inset-0 bg-[#16274D]/55 z-50 flex flex-col"
          onClick={() => setSheetPreviewOpen(false)}
        >
          <div
            className="bg-white m-4 rounded-2xl shadow-xl flex flex-col flex-1 min-h-0 font-['Poppins',sans-serif]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#eef0f4]">
              <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center shrink-0">
                <Printer size={19} className="text-[#4EBEE3]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[18px] font-semibold text-[#16274D]">Meal tickets — {fmtDate(selectedDate)}</h2>
                <p className="text-[13px] text-[#5d6678]">
                  {printSheets.length} sheet{printSheets.length === 1 ? '' : 's'} ·{' '}
                  {selectedOrderIds.length > 0
                    ? `from ${selectedOrderIds.length} selected row${selectedOrderIds.length === 1 ? '' : 's'}`
                    : 'all orders for this day'}{' '}
                  · one A4 landscape page per recipient, ordered by floor, room and bed
                </p>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[#16274D] cursor-pointer select-none mr-2">
                <input
                  type="checkbox"
                  checked={cutGuides}
                  onChange={() => setCutGuides((v) => !v)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] cursor-pointer"
                />
                Cutting guides
              </label>
              <Btn variant="primary" onClick={printSheetBatch}><Printer size={16} /> Print</Btn>
              <button
                onClick={() => setSheetPreviewOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-[#eef0f4] p-5">
              <MealTicketPrintStyles cutGuides={cutGuides} />
              {/* Scaled so a 297mm sheet fits the dialog; transform keeps the
                  real mm geometry intact underneath. */}
              <div className="mt-preview" style={{ transform: 'scale(0.62)', transformOrigin: 'top center' }}>
                {printSheets.map((sh) => <MealSheet key={sh.key} sheet={sh} cutGuides={cutGuides} />)}
              </div>
            </div>
          </div>
        </div>
      )}
      {editingOrder && renderEditModal()}
    </FoodPage>
  );
}
