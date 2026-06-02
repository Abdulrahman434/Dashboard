import React, { useMemo, useState } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Check,
  DoorOpen,
  MonitorSmartphone,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useNurseStations } from '../../hooks/useNurseStations';
import {
  nurseStationService,
  type Station,
  type DeviceRow,
} from '../../services/nurseStationService';

interface NurseStationManagePageProps {
  /** When set (from the sidebar station entry or a table row), show that station. */
  focusStationId?: string | null;
  /** Navigate to another sidebar route — used to open a station's own entry. */
  onNavigate?: (item: string) => void;
}

const PRIMARY = 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white';

export default function NurseStationManagePage({
  focusStationId,
  onNavigate,
}: NurseStationManagePageProps) {
  const { stations } = useNurseStations();

  // Station add/edit modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null);

  // When focused (via the station's own sidebar/table navigation), show that
  // station's page. Otherwise the Manage tab shows ONLY the stations table.
  const selectedStation = useMemo(
    () => (focusStationId ? stations.find((s) => s.id === focusStationId) || null : null),
    [stations, focusStationId],
  );

  const deviceCount = (s: Station) => s.rooms.filter((r) => r.source === 'device').length;

  const openAdd = () => {
    setEditingStation(null);
    setIsFormOpen(true);
  };
  const openEdit = (s: Station) => {
    setEditingStation(s);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    nurseStationService.remove(deleteTarget.id);
    toast.success('Nurse Station deleted', { description: deleteTarget.name, duration: 2000 });
    setDeleteTarget(null);
  };

  // ---- Station page (its own navigation tab — no back button) ------------
  if (selectedStation) {
    return <StationDetail station={selectedStation} />;
  }

  // ---- List view (the Manage tab) ----------------------------------------
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Stethoscope size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Nurse Stations
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Create wards, assign device rooms, and add manual rooms
          </p>
        </div>
        {stations.length > 0 && (
          <button
            onClick={openAdd}
            className={`px-4 py-2.5 ${PRIMARY} rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium`}
          >
            <Plus size={18} strokeWidth={2} />
            Add Nurse Station Ward
          </button>
        )}
      </div>

      {stations.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <Stethoscope className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No nurse stations yet
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Create your first Nurse Station Ward to start assigning rooms and devices
          </p>
          <button
            onClick={openAdd}
            className={`${PRIMARY} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]`}
          >
            <Plus className="w-4 h-4" />
            Add Nurse Station Ward
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Station Name
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Devices
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onNavigate?.(`ns:${s.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                          {s.name}
                        </span>
                        {(s.building || s.floor) && (
                          <span className="text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
                            {[s.building && `Bldg ${s.building}`, s.floor && `Floor ${s.floor}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#4EBEE3]/10 text-[#4EBEE3] font-['Poppins',sans-serif]">
                        {s.rooms.length} room{s.rooms.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-[#16274D] font-['Poppins',sans-serif]">
                        {deviceCount(s)} device{deviceCount(s) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors p-2 rounded-lg hover:bg-[#4EBEE3]/10"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormOpen && (
        <StationFormModal editing={editingStation} onClose={() => setIsFormOpen(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Nurse Station"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will remove the ward and all its room assignments. Devices themselves are not affected.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* Station add / edit modal                                                   */
/* ========================================================================= */
function StationFormModal({
  editing,
  onClose,
}: {
  editing: Station | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [building, setBuilding] = useState(editing?.building ?? '');
  const [floor, setFloor] = useState(editing?.floor ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Station Name is required');
      return;
    }
    if (nurseStationService.isNameTaken(trimmed, editing?.id)) {
      setError('A station with this name already exists');
      return;
    }
    if (editing) {
      nurseStationService.update(editing.id, { name: trimmed, building, floor, description });
      toast.success('Nurse Station updated', { description: trimmed, duration: 2000 });
    } else {
      nurseStationService.create({ name: trimmed, building, floor, description });
      toast.success('Nurse Station created', { description: trimmed, duration: 2000 });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              {editing ? 'Edit Nurse Station Ward' : 'Add Nurse Station Ward'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Station Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Cardiology Ward A"
              className={inputClass}
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Building">
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g., 01"
                className={inputClass}
              />
            </Field>
            <Field label="Floor">
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g., 03"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this ward"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          {error && (
            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`${PRIMARY} px-6 py-2 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {editing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Station detail — assign devices + manual rooms                             */
/* ========================================================================= */
function StationDetail({ station }: { station: Station }) {
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
  const [isManualRoomOpen, setIsManualRoomOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<number | null>(null);

  const assignedDeviceIds = new Set(
    station.rooms.filter((r) => r.source === 'device' && r.deviceId).map((r) => r.deviceId!),
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Stethoscope size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {station.name}
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            {station.rooms.length} room{station.rooms.length !== 1 ? 's' : ''} ·{' '}
            {station.rooms.filter((r) => r.source === 'device').length} from devices ·{' '}
            {station.rooms.filter((r) => r.source === 'manual').length} manual
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDevicePickerOpen(true)}
            className="px-4 py-2.5 border border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            <MonitorSmartphone size={18} strokeWidth={2} />
            Pick from Devices
          </button>
          <button
            onClick={() => setIsManualRoomOpen(true)}
            className={`px-4 py-2.5 ${PRIMARY} rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium`}
          >
            <Plus size={18} strokeWidth={2} />
            Add new room
          </button>
        </div>
      </div>

      {/* Rooms table */}
      {station.rooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <DoorOpen className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No rooms assigned
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] text-center max-w-md">
            Pick existing devices from the Device Manager, or add a manual room with no device.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Room', 'Bed', 'Floor', 'Building', 'POC', 'Source', 'Device ID', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {station.rooms.map((r, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                      {r.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                      {r.bed}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                      {r.floor}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                      {r.building}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                      {r.poc}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] ${
                          r.source === 'device'
                            ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                            : 'bg-gray-100 text-[#16274D]'
                        }`}
                      >
                        {r.source === 'device' ? 'Device' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
                      {r.deviceId || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setRemoveTarget(i)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Remove room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isDevicePickerOpen && (
        <DevicePickerModal
          station={station}
          assignedDeviceIds={assignedDeviceIds}
          onClose={() => setIsDevicePickerOpen(false)}
        />
      )}

      {isManualRoomOpen && (
        <ManualRoomModal station={station} onClose={() => setIsManualRoomOpen(false)} />
      )}

      {removeTarget !== null && (
        <ConfirmDialog
          title="Remove room"
          message="Remove this room from the station? If it is backed by a device, the device itself is not deleted."
          confirmLabel="Remove"
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => {
            nurseStationService.removeRoomAt(station.id, removeTarget);
            setRemoveTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* Way 1 — Device picker (reads the Device Manager single source of truth)    */
/* ========================================================================= */
function DevicePickerModal({
  station,
  assignedDeviceIds,
  onClose,
}: {
  station: Station;
  assignedDeviceIds: Set<string>;
  onClose: () => void;
}) {
  const devices = useMemo<DeviceRow[]>(() => nurseStationService.listDevices(), []);
  const assignedElsewhere = useMemo(() => {
    const map = nurseStationService.deviceAssignments();
    // exclude devices assigned to *this* station (those are just "already selected")
    const set = new Set<string>();
    for (const [deviceId, stId] of Object.entries(map)) {
      if (stId !== station.id) set.add(deviceId);
    }
    return set;
  }, [station.id]);

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const filtered = devices.filter((d) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      d.deviceId.toLowerCase().includes(q) ||
      d.roomNo.toLowerCase().includes(q) ||
      d.poc.toLowerCase().includes(q) ||
      d.building.toLowerCase().includes(q)
    );
  });

  const toggle = (d: DeviceRow) => {
    if (assignedDeviceIds.has(d.deviceId)) return; // already on this station
    if (assignedElsewhere.has(d.deviceId)) {
      toast.error('Device already assigned', {
        description: `${d.deviceId} belongs to another station`,
        duration: 2500,
      });
      return;
    }
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(d.deviceId) ? next.delete(d.deviceId) : next.add(d.deviceId);
      return next;
    });
  };

  const handleAssign = () => {
    let count = 0;
    for (const d of devices) {
      if (picked.has(d.deviceId)) {
        nurseStationService.assignDevice(station.id, d);
        count++;
      }
    }
    if (count > 0) {
      toast.success(`${count} device${count !== 1 ? 's' : ''} assigned`, {
        description: station.name,
        duration: 2000,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <MonitorSmartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Pick from Device Manager
              </h2>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                {picked.size} selected · single source of truth: Device Manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Device ID, Room, POC, Building..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[13px]"
            />
          </div>
        </div>

        {/* Device list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                No devices found in the Device Manager. Add devices there first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((d) => {
                const onThisStation = assignedDeviceIds.has(d.deviceId);
                const elsewhere = assignedElsewhere.has(d.deviceId);
                const isPicked = picked.has(d.deviceId);
                const disabled = onThisStation || elsewhere;
                return (
                  <button
                    key={d.deviceId}
                    type="button"
                    onClick={() => toggle(d)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors font-['Poppins',sans-serif] ${
                      disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
                        : isPicked
                          ? 'border-[#4EBEE3] bg-[#4EBEE3]/5'
                          : 'border-gray-200 hover:border-[#4EBEE3]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        onThisStation || isPicked
                          ? 'bg-[#4EBEE3] border-[#4EBEE3]'
                          : 'border-gray-300'
                      }`}
                    >
                      {(onThisStation || isPicked) && (
                        <Check size={14} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#16274D] truncate">
                        {d.deviceId}
                      </div>
                      <div className="text-[12px] text-[#6B7280] truncate">
                        Room {d.roomNo} · Bed {d.bedNo} · Bldg {d.building} · Floor {d.floor} · POC{' '}
                        {d.poc}
                      </div>
                    </div>
                    {onThisStation && (
                      <span className="text-[11px] text-[#4EBEE3] font-medium shrink-0">
                        On this station
                      </span>
                    )}
                    {elsewhere && (
                      <span className="text-[11px] text-amber-600 font-medium shrink-0">
                        Assigned elsewhere
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={picked.size === 0}
            className={`${PRIMARY} px-6 py-2 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Assign {picked.size > 0 ? `(${picked.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Way 2 — Manual room (fields IN ORDER: Room, Bed, Floor, Building, POC, NS)  */
/* ========================================================================= */
function ManualRoomModal({ station, onClose }: { station: Station; onClose: () => void }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [bed, setBed] = useState('');
  const [floor, setFloor] = useState('');
  const [building, setBuilding] = useState('');
  const [poc, setPoc] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!roomNumber.trim()) {
      setError('Room Number is required');
      return;
    }
    nurseStationService.addRoom(station.id, { roomNumber, bed, floor, building, poc });
    toast.success('Room added', { description: `Room ${roomNumber.trim()}`, duration: 2000 });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <DoorOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Add new room
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — field order is fixed: Room, Bed, Floor, Building, POC, Nurse Station */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Room Number" required>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => {
                setRoomNumber(e.target.value);
                setError('');
              }}
              placeholder="e.g., 305A"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="Bed Number">
            <input
              type="text"
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              placeholder="e.g., 01"
              className={inputClass}
            />
          </Field>
          <Field label="Floor">
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g., 03"
              className={inputClass}
            />
          </Field>
          <Field label="Building">
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g., 01"
              className={inputClass}
            />
          </Field>
          <Field label="POC">
            <input
              type="text"
              value={poc}
              onChange={(e) => setPoc(e.target.value)}
              placeholder="e.g., 1A"
              className={inputClass}
            />
          </Field>
          <Field label="Nurse Station">
            <input
              type="text"
              value={station.name}
              readOnly
              disabled
              className={`${inputClass} bg-gray-50 text-[#6B7280] cursor-not-allowed`}
            />
          </Field>
          {error && (
            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!roomNumber.trim()}
            className={`${PRIMARY} px-6 py-2 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Small shared bits                                                          */
/* ========================================================================= */
const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {title}
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
