import { useState, useEffect, useMemo } from 'react';
import {
  Monitor,
  Search,
  Trash2,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Wifi,
  WifiOff,
  Users,
  ArrowUpDown,
  Check,
  UserCheck,
  Maximize2,
  Eye,
  Sparkles,
  X,
  BedDouble,
  Venus,
  Mars,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import PillTabs from './PillTabs';
import { SingleSelectDropdown } from './UnifiedDropdown';
import {
  careSignTypeService,
  careSignEventService,
  careSignDeviceService,
  CARESIGN_EVENT,
  type CareSignType,
  type CareSignEvent,
  type CareSignDevice,
} from '../services/careSignService';

// ── Helpers ──────────────────────────────────────────────────────────────

type CareSignTab = 'type' | 'events' | 'device';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDateDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Component ────────────────────────────────────────────────────────────

export default function CareSignPage() {
  const [activeTab, setActiveTab] = useState<CareSignTab>('type');

  // Data
  const [types, setTypes] = useState<CareSignType[]>([]);
  const [events, setEvents] = useState<CareSignEvent[]>([]);
  const [devices, setDevices] = useState<CareSignDevice[]>([]);

  const reload = () => {
    setTypes(careSignTypeService.list());
    setEvents(careSignEventService.list());
    setDevices(careSignDeviceService.list());
  };

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener(CARESIGN_EVENT, handler);
    return () => window.removeEventListener(CARESIGN_EVENT, handler);
  }, []);

  // ── Tabs config ──
  const tabs = [
    { id: 'type', label: 'CareSign Type' },
    { id: 'events', label: 'CareSign Events' },
    { id: 'device', label: 'CareSign Device' },
  ];

  return (
    <div className="p-4 md:p-8 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#EBF8FC] flex items-center justify-center">
          <Monitor size={24} className="text-[#4EBEE3]" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#16274D]">CareSign</h1>
          <p className="text-[13px] text-[#637381]">Manage CareSign types, events, and devices</p>
        </div>
      </div>

      {/* Tabs */}
      <PillTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as CareSignTab)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'type' && <TypeTab types={types} onReload={reload} />}
        {activeTab === 'events' && <EventsTab types={types} events={events} onReload={reload} />}
        {activeTab === 'device' && <DeviceTab types={types} devices={devices} onReload={reload} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: CareSign Type
// ═══════════════════════════════════════════════════════════════════════════

function TypeTab({ types, onReload }: { types: CareSignType[]; onReload: () => void }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState<CareSignType | null>(null);

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    careSignTypeService.remove(id);
    toast.success('CareSign Type deleted');
    onReload();
  };

  return (
    <>
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search caresign types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
          />
        </div>
        <button
          onClick={() => { setEditType(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-xl text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={16} />
          New Caresign Type
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="rounded border-gray-300" disabled />
              </th>
              <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#637381] uppercase tracking-wider">Caresign Type</th>
              <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#637381] uppercase tracking-wider">Color</th>
              <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#637381] uppercase tracking-wider">Layout</th>
              <th className="text-right px-4 py-3 text-[12px] font-semibold text-[#637381] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[14px] text-gray-400">
                  No CareSign types found
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditType(t); setShowModal(true); }}
                      className="text-[13px] font-medium text-[#4EBEE3] hover:underline"
                    >
                      {t.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-[13px] text-[#16274D]">{t.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#16274D]">{t.layout}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400 hover:text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <TypeModal
          existing={editType}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            if (editType) {
              careSignTypeService.update(editType.id, data);
              toast.success('CareSign Type updated');
            } else {
              careSignTypeService.create(data);
              toast.success('CareSign Type created');
            }
            onReload();
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function TypeModal({
  existing,
  onClose,
  onSave,
}: {
  existing: CareSignType | null;
  onClose: () => void;
  onSave: (data: Omit<CareSignType, 'id'>) => void;
}) {
  const [name, setName] = useState(existing?.name || '');
  const [color, setColor] = useState(existing?.color || '#2696bc');
  const [layout, setLayout] = useState(existing?.layout || 'Burjeel layout');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md font-['Poppins',sans-serif]">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#16274D]">
            {existing ? 'Edit CareSign Type' : 'New CareSign Type'}
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suite Room"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Layout</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors bg-white"
            >
              <option value="Burjeel layout">Burjeel layout</option>
              <option value="Standard layout">Standard layout</option>
              <option value="Compact layout">Compact layout</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (name.trim()) onSave({ name: name.trim(), color, layout }); }}
            disabled={!name.trim()}
            className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors text-[14px] font-medium shadow-sm disabled:opacity-50"
          >
            {existing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2: CareSign Events
// ═══════════════════════════════════════════════════════════════════════════

function EventsTab({
  types,
  events,
  onReload,
}: {
  types: CareSignType[];
  events: CareSignEvent[];
  onReload: () => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState('General');
  const [selectedTypeId, setSelectedTypeId] = useState(types[0]?.id || '');
  const [calendarView, setCalendarView] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateISO(today.getFullYear(), today.getMonth(), today.getDate())
  );

  // Update selectedTypeId if types change
  useEffect(() => {
    if (types.length > 0 && !types.find((t) => t.id === selectedTypeId)) {
      setSelectedTypeId(types[0].id);
    }
  }, [types, selectedTypeId]);

  const selectedType = types.find((t) => t.id === selectedTypeId);

  // Filter events by selected group + type
  const filteredEvents = events.filter(
    (e) => e.group === selectedGroup && e.typeId === selectedTypeId
  );

  // Stats
  const totalEvents = filteredEvents.length;
  const mainEvents = filteredEvents.filter((e) => e.isMainEvent).length;
  const nonMainEvents = totalEvents - mainEvents;
  const integrated = filteredEvents.filter((e) => e.integrated).length;
  const nonIntegrated = totalEvents - integrated;

  // Events on selected date
  const eventsOnDate = filteredEvents.filter((e) => e.date === selectedDate);

  // Calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month info for leading days
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calendarCells: { day: number; isCurrentMonth: boolean; dateISO: string }[] = [];
  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarCells.push({ day: d, isCurrentMonth: false, dateISO: formatDateISO(prevYear, prevMonth, d) });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true, dateISO: formatDateISO(viewYear, viewMonth, d) });
  }
  // Trailing days
  const remaining = 42 - calendarCells.length;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, isCurrentMonth: false, dateISO: formatDateISO(nextYear, nextMonth, d) });
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const handleToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(formatDateISO(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const groupOptions = ['General', 'VIP'];
  const typeOptions = types.map((t) => t.name);

  const handleDeleteEvent = (id: string) => {
    careSignEventService.remove(id);
    toast.success('Event deleted');
    onReload();
  };

  return (
    <>
      {/* Subheader */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[16px] font-semibold text-[#16274D]">
            {selectedGroup} – {selectedType?.name || 'Schedule'}
          </h2>
          <p className="text-[12px] text-[#637381]">
            Manage caresign events for {selectedGroup} group with {selectedType?.name || '—'} type
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#637381]">Groups:</span>
            <SingleSelectDropdown
              options={groupOptions}
              value={selectedGroup}
              onChange={setSelectedGroup}
              placeholder="Group"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#637381]">CareSign Types:</span>
            <SingleSelectDropdown
              options={typeOptions}
              value={selectedType?.name || ''}
              onChange={(name) => {
                const t = types.find((tp) => tp.name === name);
                if (t) setSelectedTypeId(t.id);
              }}
              placeholder="Type"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-xl text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Add New Event
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'EVENTS', value: totalEvents, color: '#4EBEE3' },
          { label: 'MAIN EVENTS', value: mainEvents, color: '#4EBEE3' },
          { label: 'NON MAIN', value: nonMainEvents, color: '#F59E0B' },
          { label: 'INTEGRATED', value: integrated, color: '#10B981' },
          { label: 'NON INTEGRATED', value: nonIntegrated, color: '#EF4444' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-semibold text-[#637381] uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-[24px] font-bold text-[#16274D]">{stat.value}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
              <Calendar size={18} style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar */}
        <div className="flex-1 bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[11px] font-semibold text-[#637381] uppercase tracking-wider">SCHEDULE CALENDAR</p>
              <p className="text-[15px] font-semibold text-[#16274D]">
                {selectedGroup} Weekly Schedule
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#637381]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4EBEE3]" /> Event</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Main Event</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={16} className="text-[#637381]" />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={16} className="text-[#637381]" />
              </button>
              <button onClick={handleToday} className="px-3 py-1 text-[12px] font-medium text-[#637381] hover:bg-gray-100 rounded-lg transition-colors">
                Today
              </button>
              <span className="text-[15px] font-semibold text-[#16274D] ml-2">
                {MONTHS[viewMonth]} {viewYear}
              </span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['Month', 'Week', 'Day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                    calendarView === v
                      ? 'bg-[#4EBEE3] text-white shadow-sm'
                      : 'text-[#637381] hover:text-[#16274D]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 text-center">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-[11px] font-semibold text-[#637381] uppercase tracking-wider border-b border-gray-200">
                {d}
              </div>
            ))}
            {calendarCells.map((cell, idx) => {
              const cellEvents = filteredEvents.filter((e) => e.date === cell.dateISO);
              const isToday =
                cell.isCurrentMonth &&
                cell.day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              const isSelected = cell.dateISO === selectedDate;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateISO)}
                  className={`relative min-h-[72px] p-1.5 border-b border-r border-gray-100 text-left transition-colors hover:bg-[#EBF8FC]/50 ${
                    !cell.isCurrentMonth ? 'text-gray-300' : 'text-[#16274D]'
                  } ${isSelected ? 'bg-[#EBF8FC] ring-1 ring-[#4EBEE3]/30' : ''}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-[12px] font-medium rounded-full ${
                      isToday ? 'bg-[#4EBEE3] text-white' : ''
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cellEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap">
                      {cellEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${ev.isMainEvent ? 'bg-[#F59E0B]' : 'bg-[#4EBEE3]'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule View sidebar */}
        <div className="w-full lg:w-[280px] bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm self-start">
          <p className="text-[11px] font-semibold text-[#637381] uppercase tracking-wider mb-1">SCHEDULE VIEW</p>
          <p className="text-[15px] font-semibold text-[#16274D] mb-0.5">
            {formatDateDisplay(selectedDate)}
          </p>
          <p className="text-[11px] text-[#637381] mb-4">
            {selectedGroup} / {selectedType?.name || '—'}
          </p>

          {eventsOnDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EBF8FC] flex items-center justify-center mb-3">
                <Calendar size={22} className="text-[#4EBEE3]" />
              </div>
              <p className="text-[13px] font-medium text-[#16274D] mb-1">Select an event</p>
              <p className="text-[11px] text-[#637381] leading-relaxed max-w-[200px]">
                Click any event on the calendar to view its details here. This side panel can be reused for notifications, appointments, and other calendar based pages.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {eventsOnDate.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg border border-gray-200 hover:border-[#4EBEE3]/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${ev.isMainEvent ? 'bg-[#F59E0B]' : 'bg-[#4EBEE3]'}`} />
                      <span className="text-[13px] font-medium text-[#16274D]">{ev.title}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                  <div className="ml-4 mt-1 flex items-center gap-2 text-[11px] text-[#637381]">
                    {ev.isMainEvent && (
                      <span className="px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded text-[10px] font-medium">Main</span>
                    )}
                    {ev.integrated && (
                      <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded text-[10px] font-medium">Integrated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <EventModal
          types={types}
          defaultGroup={selectedGroup}
          defaultTypeId={selectedTypeId}
          defaultDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            careSignEventService.create(data);
            toast.success('Event created');
            onReload();
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

function EventModal({
  types,
  defaultGroup,
  defaultTypeId,
  defaultDate,
  onClose,
  onSave,
}: {
  types: CareSignType[];
  defaultGroup: string;
  defaultTypeId: string;
  defaultDate: string;
  onClose: () => void;
  onSave: (data: Omit<CareSignEvent, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [isMainEvent, setIsMainEvent] = useState(false);
  const [integrated, setIntegrated] = useState(false);
  const [group, setGroup] = useState(defaultGroup);
  const [typeId, setTypeId] = useState(defaultTypeId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md font-['Poppins',sans-serif]">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#16274D]">Add New Event</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">Group</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors bg-white"
              >
                <option value="General">General</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] mb-1.5">CareSign Type</label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#4EBEE3] transition-colors bg-white"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMainEvent}
                onChange={(e) => setIsMainEvent(e.target.checked)}
                className="rounded border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3]"
              />
              <span className="text-[13px] text-[#16274D]">Main Event</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={integrated}
                onChange={(e) => setIntegrated(e.target.checked)}
                className="rounded border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3]"
              />
              <span className="text-[13px] text-[#16274D]">Integrated</span>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim() && date) {
                onSave({ title: title.trim(), date, isMainEvent, typeId, group, integrated });
              }
            }}
            disabled={!title.trim() || !date}
            className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors text-[14px] font-medium shadow-sm disabled:opacity-50"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Human Stickman Gender Pictograms (Matching Exact Approved Design) ─────

export function FemaleIconSVG({ className = "w-12 h-16", color = "#E91E63" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-label="Female">
      <circle cx="50" cy="22" r="18" fill={color} />
      <path
        d="M32,50 C32,45 38,42 50,42 C62,42 68,45 68,50 L78,88 C79,92 73,94 70,90 L60,74 L56,74 L56,132 C56,137 44,137 44,132 L44,74 L40,74 L30,90 C27,94 21,92 22,88 Z"
        fill={color}
      />
    </svg>
  );
}

export function MaleIconSVG({ className = "w-12 h-16", color = "#00A3E0" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-label="Male">
      <circle cx="50" cy="22" r="18" fill={color} />
      <path
        d="M26,50 C26,45 32,42 50,42 C68,42 74,45 74,50 L74,85 C74,89 69,89 66,85 L66,74 L56,74 L56,132 C56,137 44,137 44,132 L44,74 L34,74 L34,85 C31,89 26,89 26,85 Z"
        fill={color}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARE SIGN DOOR DISPLAY HARDWARE SCREEN PREVIEW (INPATIENT SIGNAGE)
// ═══════════════════════════════════════════════════════════════════════════

export function CareSignDoorDisplayScreen({
  roomNumber,
  roomType,
  status,
  gender = 'Female',
  bgColor = '#7B113A',
  patientId,
  isFullScreen = false,
}: {
  roomNumber: string;
  roomType: string;
  status: 'Available' | 'Occupied';
  gender?: 'Female' | 'Male';
  bgColor?: string;
  patientId?: string;
  isFullScreen?: boolean;
}) {
  const isOccupied = status === 'Occupied';
  const isFemale = (gender || '').toLowerCase() === 'female';

  return (
    <div className={`relative transition-all duration-300 ${isFullScreen ? 'w-full max-w-5xl' : 'w-full'}`}>
      {/* Wall Tablet Hardware Frame Mockup */}
      <div className="bg-[#181a20] border-[6px] sm:border-[10px] border-[#2b2e3b] rounded-[2rem] p-2.5 sm:p-4 shadow-2xl relative shadow-purple-950/20">
        
        {/* Top Hardware Bezel: Status LED + Camera Lens */}
        <div className="flex items-center justify-between px-4 pb-2 text-gray-500 select-none">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${!isOccupied ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-[10px] font-mono tracking-widest text-gray-400">CARESIGN DISPLAY PK-15</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-black/80 border border-gray-700 shadow-inner flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-900/50" />
          </div>
          <span className="text-[10px] font-mono text-gray-400">1080p OLED</span>
        </div>

        {/* Physical Display Panel Surface (Dynamic Background Color from CareSignType) */}
        <div
          className="rounded-xl p-5 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between relative overflow-hidden text-white font-['Poppins',sans-serif] shadow-inner select-none transition-colors duration-300"
          style={{ backgroundColor: bgColor || '#7B113A' }}
        >
          
          {/* Top Header Bar inside Display Screen */}
          <div className="flex items-center justify-between gap-4 z-10">
            {/* Burjeel Hospital Branding Logo */}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[#E0C38C] text-[11px] sm:text-[13px] font-semibold tracking-widest font-serif mb-0.5">
                برجيل
              </span>
              <span className="text-white text-lg sm:text-2xl font-bold tracking-tight font-sans">
                burjeel
              </span>
              <span className="text-white/80 text-[8px] sm:text-[10px] font-medium tracking-wider -mt-0.5">
                Hospital by Burjeel Holdings
              </span>
            </div>

            {/* Top Right Status Pill Badge */}
            <div className="bg-white rounded-full px-4 sm:px-5 py-1.5 sm:py-2 shadow-lg flex items-center gap-2 border border-white/20">
              <span className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${!isOccupied ? 'bg-[#10B981]' : 'bg-[#D9381E]'}`} />
              <span className="text-[#16274D] font-bold text-xs sm:text-sm tracking-wide">
                • {isOccupied ? 'Occupied' : 'Available'}
              </span>
            </div>
          </div>

          {/* Main Grid: 2 Equal White Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-6 flex-1 items-stretch z-10">
            
            {/* Left Card: ROOM INFO */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-start shadow-xl border border-white/40 min-h-[220px]">
              <div>
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-widest block">
                  ROOM INFO
                </span>
                <div className="w-8 h-1 rounded-full mt-1.5" style={{ backgroundColor: bgColor || '#7B113A' }} />
              </div>

              <div className="w-full text-center py-2 sm:py-4">
                <span className="text-6xl sm:text-7xl font-extrabold block tracking-tight" style={{ color: bgColor || '#7B113A' }}>
                  {roomNumber || '305'}
                </span>
                <span className="text-[#16274D] font-bold text-xl sm:text-2xl mt-2 block">
                  {roomType || 'Suite Room'}
                </span>
              </div>

              {/* Bottom Pill on Left Card */}
              {isOccupied ? (
                <div className="w-full bg-[#F7EBEF] py-2.5 px-4 rounded-xl text-center font-extrabold text-xs sm:text-sm tracking-wider uppercase" style={{ color: bgColor || '#7B113A' }}>
                  • OCCUPIED
                </div>
              ) : (
                <div className="w-full bg-emerald-50 text-[#16A34A] py-2.5 px-4 rounded-xl text-center font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                  • AVAILABLE
                </div>
              )}
            </div>

            {/* Right Card: PATIENT GENDER (when Occupied) vs AVAILABLE (when Available) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-center text-center shadow-xl border border-white/40 min-h-[220px]">
              {isOccupied ? (
                <>
                  <div className="w-full text-left">
                    <span className="text-gray-400 font-semibold text-xs uppercase tracking-widest block">
                      PATIENT GENDER
                    </span>
                    <div className="w-8 h-1 rounded-full mt-1.5" style={{ backgroundColor: bgColor || '#7B113A' }} />
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-3">
                    {isFemale ? (
                      <>
                        <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-[#FDE8EF] flex items-center justify-center mb-3 shadow-sm border border-pink-100">
                          <FemaleIconSVG className="w-12 sm:w-14 h-16 sm:h-18" color="#E91E63" />
                        </div>
                        <h2 className="text-[#16274D] text-2xl sm:text-3xl font-extrabold tracking-wider">
                          FEMALE
                        </h2>
                      </>
                    ) : (
                      <>
                        <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-[#E3F2FD] flex items-center justify-center mb-3 shadow-sm border border-blue-100">
                          <MaleIconSVG className="w-12 sm:w-14 h-16 sm:h-18" color="#00A3E0" />
                        </div>
                        <h2 className="text-[#16274D] text-2xl sm:text-3xl font-extrabold tracking-wider">
                          MALE
                        </h2>
                      </>
                    )}
                  </div>
                  <div className="w-full h-1" />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-[#E6F7EF] flex items-center justify-center mb-3 sm:mb-4 border border-emerald-100 shadow-sm">
                    <Check className="w-14 sm:w-16 h-14 sm:h-16 text-[#16A34A]" strokeWidth={3.5} />
                  </div>
                  <h2 className="text-[#16274D] text-2xl sm:text-3xl font-extrabold tracking-wider">
                    AVAILABLE
                  </h2>
                  <p className="text-gray-400 font-medium text-xs sm:text-sm mt-1">
                    Ready for admission
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Ambient Glow / Footer info */}
          <div className="flex items-center justify-between text-[10px] text-white/50 border-t border-white/10 pt-2 z-10">
            <span>CAREINN DIGISIGN v2.4</span>
            <span>REAL-TIME HARDWARE SYNC</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3: CareSign Device
// ═══════════════════════════════════════════════════════════════════════════

type DeviceSortField = 'deviceId' | 'room' | 'bed' | 'bldg' | 'floor' | 'poc' | 'group' | 'careSignTypeId' | 'isConnected' | 'patientId' | 'status';

function DeviceTab({
  types,
  devices,
  onReload,
}: {
  types: CareSignType[];
  devices: CareSignDevice[];
  onReload: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('All Groups');
  const [filterType, setFilterType] = useState('All Types');
  const [sortField, setSortField] = useState<DeviceSortField>('room');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Live Door Display Preview state for Nurses
  const [selectedDevice, setSelectedDevice] = useState<CareSignDevice | null>(devices[0] || null);
  const [previewStatus, setPreviewStatus] = useState<'Available' | 'Occupied'>(
    devices[0]?.status || 'Available'
  );
  const [previewGender, setPreviewGender] = useState<'Female' | 'Male'>(
    devices[0]?.gender || 'Female'
  );
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);

  // Synchronize preview when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      setPreviewStatus(selectedDevice.status || 'Available');
      setPreviewGender(selectedDevice.gender || 'Female');
    }
  }, [selectedDevice]);

  // Keep selectedDevice fresh if devices list reloads
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    } else if (selectedDevice) {
      const fresh = devices.find((d) => d.id === selectedDevice.id);
      if (fresh) setSelectedDevice(fresh);
    }
  }, [devices]);

  // Stats
  const totalDevices = devices.length;
  const connected = devices.filter((d) => d.isConnected).length;
  const disconnected = totalDevices - connected;
  const withPatients = devices.filter((d) => d.patientId !== 'No Patient').length;

  // Type color & name helpers
  const selectedTypeObj = types.find((t) => t.id === selectedDevice?.careSignTypeId);
  const selectedBgColor = selectedTypeObj?.color || '#7B113A';
  const typeName = (id: string) => types.find((t) => t.id === id)?.name || 'Suite Room';

  // Groups list
  const allGroups = useMemo(() => {
    const set = new Set(devices.map((d) => d.group));
    return ['All Groups', ...Array.from(set)];
  }, [devices]);

  const allTypes = useMemo(() => {
    return ['All Types', ...types.map((t) => t.name)];
  }, [types]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = devices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.deviceId.toLowerCase().includes(q) ||
          d.room.toLowerCase().includes(q) ||
          d.patientId.toLowerCase().includes(q) ||
          d.bed.toLowerCase().includes(q)
      );
    }
    if (filterGroup !== 'All Groups') list = list.filter((d) => d.group === filterGroup);
    if (filterType !== 'All Types') {
      const t = types.find((tp) => tp.name === filterType);
      if (t) list = list.filter((d) => d.careSignTypeId === t.id);
    }

    // Sort
    list = [...list].sort((a, b) => {
      let av: string | boolean = (a[sortField] || '') as any;
      let bv: string | boolean = (b[sortField] || '') as any;
      if (typeof av === 'boolean') { av = av ? '1' : '0'; bv = bv ? '1' : '0'; }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [devices, search, filterGroup, filterType, types, sortField, sortDir]);

  const handleSort = (field: DeviceSortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSaveStatusToDevice = () => {
    if (!selectedDevice) return;
    careSignDeviceService.update(selectedDevice.id, {
      status: previewStatus,
      gender: previewGender,
      patientId: previewStatus === 'Available' ? 'No Patient' : (selectedDevice.patientId !== 'No Patient' ? selectedDevice.patientId : 'PAT2005'),
    });
    toast.success(`Door signage updated to ${previewStatus} (${previewGender})`, {
      description: `Room ${selectedDevice.room} display synchronized`,
    });
    onReload();
  };

  const handleToggleRowStatus = (d: CareSignDevice) => {
    const nextStatus = d.status === 'Available' ? 'Occupied' : 'Available';
    careSignDeviceService.update(d.id, {
      status: nextStatus,
      patientId: nextStatus === 'Available' ? 'No Patient' : (d.patientId !== 'No Patient' ? d.patientId : 'PAT2005'),
    });
    toast.success(`Room ${d.room} updated to ${nextStatus}`, {
      description: 'Door display updated live',
    });
    onReload();
  };

  const SortHeader = ({ field, label }: { field: DeviceSortField; label: string }) => (
    <th
      className="text-left px-3 py-3 text-[11px] font-semibold text-[#637381] uppercase tracking-wider cursor-pointer select-none hover:text-[#4EBEE3] transition-colors whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={sortField === field ? 'text-[#4EBEE3]' : 'text-gray-300'} />
      </span>
    </th>
  );

  return (
    <>
      {/* ── NURSE DOOR DISPLAY LIVE PREVIEW BANNER & INTERACTIVE CONTROLLER ── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} style={{ color: selectedBgColor }} />
              <h2 className="text-[17px] font-bold text-[#16274D]">
                Door Display Hardware Live Preview
              </h2>
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Nurse preview of the physical wall tablet outside the room. Toggle status & gender to preview look & feel before updating hardware.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Select Device Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-600">Select Room:</span>
              <select
                value={selectedDevice?.id || ''}
                onChange={(e) => {
                  const dev = devices.find((d) => d.id === e.target.value);
                  if (dev) setSelectedDevice(dev);
                }}
                className="px-3 py-2 border-2 border-gray-200 rounded-xl text-[13px] font-semibold text-[#16274D] bg-gray-50 focus:outline-none focus:border-[#4EBEE3]"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    Room {d.room} ({d.status || 'Available'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Switcher Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setPreviewStatus('Available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  previewStatus === 'Available'
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                Available
              </button>
              <button
                onClick={() => setPreviewStatus('Occupied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  previewStatus === 'Occupied'
                    ? 'bg-[#7B113A] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                Occupied
              </button>
            </div>

            {/* Patient Gender Switcher Toggle (when Occupied) */}
            {previewStatus === 'Occupied' && (
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setPreviewGender('Female')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    previewGender === 'Female'
                      ? 'bg-[#C2185B] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Venus size={13} />
                  Female
                </button>
                <button
                  onClick={() => setPreviewGender('Male')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    previewGender === 'Male'
                      ? 'bg-[#1976D2] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mars size={13} />
                  Male
                </button>
              </div>
            )}

            {/* Apply & Fullscreen Buttons */}
            <button
              onClick={handleSaveStatusToDevice}
              className="px-4 py-2 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              style={{ backgroundColor: selectedBgColor }}
            >
              Push to Hardware Display
            </button>

            <button
              onClick={() => setShowFullScreenModal(true)}
              className="p-2 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              title="Fullscreen Door Signage Preview"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Live Door Display Screen Graphic Component */}
        <div className="max-w-4xl mx-auto">
          <CareSignDoorDisplayScreen
            roomNumber={selectedDevice?.room || '305'}
            roomType={typeName(selectedDevice?.careSignTypeId || '')}
            status={previewStatus}
            gender={previewGender}
            bgColor={selectedBgColor}
            patientId={selectedDevice?.patientId}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL DEVICES', value: totalDevices, color: '#4EBEE3', icon: Monitor },
          { label: 'CONNECTED', value: connected, color: '#10B981', icon: Wifi },
          { label: 'DISCONNECTED', value: disconnected, color: '#EF4444', icon: WifiOff },
          { label: 'WITH PATIENTS', value: withPatients, color: '#8B5CF6', icon: Users },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: stat.color }}>{stat.label}</p>
                <p className="text-[26px] font-bold text-[#16274D]">{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                <StatIcon size={18} style={{ color: stat.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by device ID, room, patient ID, bed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] text-[#16274D] placeholder-gray-400 focus:outline-none focus:border-[#4EBEE3] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#637381]">Group:</span>
          <SingleSelectDropdown
            options={allGroups}
            value={filterGroup}
            onChange={setFilterGroup}
            placeholder="All Groups"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#637381]">Type:</span>
          <SingleSelectDropdown
            options={allTypes}
            value={filterType}
            onChange={setFilterType}
            placeholder="All Types"
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <SortHeader field="deviceId" label="Device ID" />
              <SortHeader field="room" label="Room" />
              <SortHeader field="bed" label="Bed" />
              <SortHeader field="bldg" label="Bldg" />
              <SortHeader field="floor" label="Floor" />
              <SortHeader field="poc" label="POC" />
              <SortHeader field="group" label="Group" />
              <SortHeader field="careSignTypeId" label="CareSign Type" />
              <SortHeader field="status" label="Door Status" />
              <SortHeader field="isConnected" label="Connection" />
              <SortHeader field="patientId" label="Patient ID" />
              <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#637381] uppercase tracking-wider">Preview / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-12 text-[14px] text-gray-400">
                  No CareSign devices found
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className={`border-b border-gray-100 hover:bg-gray-50/60 transition-colors ${selectedDevice?.id === d.id ? 'bg-[#EBF8FC]/40' : ''}`}>
                  <td className="px-3 py-3">
                    <span className="text-[13px] font-medium text-[#4EBEE3]">{d.deviceId}</span>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-bold text-[#16274D]">Room {d.room}</td>
                  <td className="px-3 py-3 text-[13px] text-[#16274D]">{d.bed}</td>
                  <td className="px-3 py-3 text-[13px] text-[#16274D]">{d.bldg}</td>
                  <td className="px-3 py-3 text-[13px] text-[#16274D]">{d.floor}</td>
                  <td className="px-3 py-3 text-[13px] text-[#16274D]">{d.poc}</td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 bg-[#EBF8FC] text-[#4EBEE3] rounded text-[12px] font-medium">{d.group}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[12px] font-medium">{typeName(d.careSignTypeId)}</span>
                  </td>

                  {/* Door Signage Status Badge + Toggle */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleToggleRowStatus(d)}
                      title="Click to toggle status (Available ↔ Occupied)"
                      className="cursor-pointer group"
                    >
                      {d.status === 'Available' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#10B981] border border-emerald-200 rounded-full text-[11px] font-bold group-hover:scale-105 transition-transform">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                          • Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-[#7B113A] border border-rose-200 rounded-full text-[11px] font-bold group-hover:scale-105 transition-transform">
                          <span className="w-2 h-2 rounded-full bg-[#7B113A]" />
                          • Occupied
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    {d.isConnected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-[#10B981] rounded-full text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-[#EF4444] rounded-full text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                        Disconnected
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#637381] italic">{d.patientId}</td>

                  {/* Actions */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedDevice(d);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 bg-[#4EBEE3]/10 hover:bg-[#4EBEE3]/20 text-[#4EBEE3] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Preview this room door signage"
                      >
                        <Eye size={13} />
                        Preview
                      </button>

                      <button
                        onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-[#637381]" />
                      </button>
                      {menuOpen === d.id && (
                        <div className="absolute right-8 top-2 bg-white rounded-lg shadow-lg border-2 border-gray-200 py-1 z-20 w-36">
                          <button
                            onClick={() => {
                              careSignDeviceService.remove(d.id);
                              toast.success('Device removed');
                              onReload();
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Delete Device
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fullscreen Hardware Display Preview Modal */}
      {showFullScreenModal && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setShowFullScreenModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 text-sm font-semibold"
            >
              <X size={24} />
              Close Preview
            </button>

            <CareSignDoorDisplayScreen
              roomNumber={selectedDevice?.room || '305'}
              roomType={typeName(selectedDevice?.careSignTypeId || '')}
              status={previewStatus}
              gender={previewGender}
              bgColor={selectedBgColor}
              patientId={selectedDevice?.patientId}
              isFullScreen={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
