/**
 * nurseStationService
 * --------------------------------------------------------------------------
 * Thin, swappable CRUD service for Nurse Station Wards.
 *
 * INTERIM PERSISTENCE: localStorage (key `careinn_nurse_stations`).
 * This mirrors the existing dashboard persistence convention used by the
 * Device Manager (see CareInnPage.tsx — `careinn_devices`).
 *
 * ⚠️ A real backend endpoint is REQUIRED for production. Every method below is
 * marked with `// TODO(backend)` at the persistence call site so the swap to a
 * real API is mechanical: keep the same method signatures, replace the
 * localStorage read/write with a fetch to the Nurse Station endpoint.
 *
 * Devices are NOT duplicated here — they are read from the single source of
 * truth that powers the Device Manager table: `localStorage['careinn_devices']`.
 */

const STATIONS_KEY = 'careinn_nurse_stations';
const DEVICES_KEY = 'careinn_devices'; // single source of truth (Device Manager)

/** Custom event so the sidebar / User Roles / Manage tab re-read after a write. */
export const NURSE_STATIONS_EVENT = 'careinn:nurse-stations-changed';

export type RoomSource = 'device' | 'manual';

export interface Room {
  source: RoomSource;
  deviceId?: string; // present only when source === 'device'
  roomNumber: string;
  bed: string;
  floor: string;
  building: string;
  poc: string;
  stationId: string;
}

export interface Station {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  description?: string;
  rooms: Room[];
}

/** Shape of a device row as stored by the Device Manager (CareInnPage). */
export interface DeviceRow {
  id: string;
  deviceId: string;
  mrn: string;
  roomNo: string;
  bedNo: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  server: string;
  isConnected: boolean;
  isActive: boolean;
  tag: string;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStations(): Station[] {
  if (typeof window === 'undefined') return [];
  // TODO(backend): replace with GET /nurse-stations
  return safeParse<Station[]>(localStorage.getItem(STATIONS_KEY), []);
}

function writeStations(stations: Station[]): void {
  if (typeof window === 'undefined') return;
  // TODO(backend): replace with the appropriate POST/PUT/DELETE /nurse-stations call
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
  window.dispatchEvent(new CustomEvent(NURSE_STATIONS_EVENT));
}

/** Monotonic-ish id without Math.random (kept deterministic-friendly). */
function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}
let idCounter = 0;

export const nurseStationService = {
  /** Read all devices from the Device Manager's single source of truth. */
  listDevices(): DeviceRow[] {
    if (typeof window === 'undefined') return [];
    return safeParse<DeviceRow[]>(localStorage.getItem(DEVICES_KEY), []);
  },

  list(): Station[] {
    return readStations();
  },

  get(id: string): Station | undefined {
    return readStations().find((s) => s.id === id);
  },

  /** deviceId -> stationId map, for "device already assigned elsewhere" checks. */
  deviceAssignments(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const s of readStations()) {
      for (const r of s.rooms) {
        if (r.source === 'device' && r.deviceId) map[r.deviceId] = s.id;
      }
    }
    return map;
  },

  create(input: { name: string; building?: string; floor?: string; description?: string }): Station {
    const stations = readStations();
    const station: Station = {
      id: makeId('ns'),
      name: input.name.trim(),
      building: input.building?.trim() || undefined,
      floor: input.floor?.trim() || undefined,
      description: input.description?.trim() || undefined,
      rooms: [],
    };
    writeStations([...stations, station]);
    return station;
  },

  update(
    id: string,
    patch: Partial<Pick<Station, 'name' | 'building' | 'floor' | 'description'>>,
  ): Station | undefined {
    const stations = readStations();
    let updated: Station | undefined;
    const next = stations.map((s) => {
      if (s.id !== id) return s;
      updated = {
        ...s,
        ...patch,
        name: (patch.name ?? s.name).trim(),
      };
      return updated;
    });
    writeStations(next);
    return updated;
  },

  remove(id: string): void {
    writeStations(readStations().filter((s) => s.id !== id));
  },

  /** Check name uniqueness (case-insensitive), optionally excluding one id. */
  isNameTaken(name: string, excludeId?: string): boolean {
    const n = name.trim().toLowerCase();
    return readStations().some((s) => s.id !== excludeId && s.name.trim().toLowerCase() === n);
  },

  /** Attach an existing Device Manager device to a station as a room. */
  assignDevice(stationId: string, device: DeviceRow): Station | undefined {
    const stations = readStations();
    let updated: Station | undefined;
    const next = stations.map((s) => {
      if (s.id !== stationId) return s;
      if (s.rooms.some((r) => r.source === 'device' && r.deviceId === device.deviceId)) {
        updated = s; // already attached — no-op
        return s;
      }
      const room: Room = {
        source: 'device',
        deviceId: device.deviceId,
        roomNumber: device.roomNo,
        bed: device.bedNo,
        floor: device.floor,
        building: device.building,
        poc: device.poc,
        stationId,
      };
      updated = { ...s, rooms: [...s.rooms, room] };
      return updated;
    });
    writeStations(next);
    return updated;
  },

  /** Detach a device-backed room from a station. */
  unassignDevice(stationId: string, deviceId: string): Station | undefined {
    const stations = readStations();
    let updated: Station | undefined;
    const next = stations.map((s) => {
      if (s.id !== stationId) return s;
      updated = {
        ...s,
        rooms: s.rooms.filter((r) => !(r.source === 'device' && r.deviceId === deviceId)),
      };
      return updated;
    });
    writeStations(next);
    return updated;
  },

  /** Add a manual room (no device) to a station. */
  addRoom(
    stationId: string,
    input: { roomNumber: string; bed: string; floor: string; building: string; poc: string },
  ): Station | undefined {
    const stations = readStations();
    let updated: Station | undefined;
    const next = stations.map((s) => {
      if (s.id !== stationId) return s;
      const room: Room = {
        source: 'manual',
        roomNumber: input.roomNumber.trim(),
        bed: input.bed.trim(),
        floor: input.floor.trim(),
        building: input.building.trim(),
        poc: input.poc.trim(),
        stationId,
      };
      updated = { ...s, rooms: [...s.rooms, room] };
      return updated;
    });
    writeStations(next);
    return updated;
  },

  /** Remove a manual room by its index within the station's rooms array. */
  removeRoomAt(stationId: string, roomIndex: number): Station | undefined {
    const stations = readStations();
    let updated: Station | undefined;
    const next = stations.map((s) => {
      if (s.id !== stationId) return s;
      updated = { ...s, rooms: s.rooms.filter((_, i) => i !== roomIndex) };
      return updated;
    });
    writeStations(next);
    return updated;
  },
};
