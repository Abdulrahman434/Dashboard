/**
 * careSignService
 * --------------------------------------------------------------------------
 * CRUD service for the CareSign device-management module: CareSign Types,
 * CareSign Events (calendar-based), and CareSign Devices.
 *
 * INTERIM PERSISTENCE: localStorage (mirrors careSuiteService.ts pattern).
 *
 * ⚠️ A real backend is required for production. Every persistence call is
 * marked // TODO(backend) so the swap is mechanical.
 */

const CS_TYPES_KEY = 'careinn_caresign_types';
const CS_EVENTS_KEY = 'careinn_caresign_events';
const CS_DEVICES_KEY = 'careinn_caresign_devices';
const CS_SEEDED_KEY = 'careinn_caresign_seeded_v1';

/** Custom event so other components can react to CareSign data changes. */
export const CARESIGN_EVENT = 'careinn:caresign-changed';

// ── Types ────────────────────────────────────────────────────────────────

export interface CareSignType {
  id: string;
  name: string;
  color: string;    // hex, e.g. "#2696bc"
  layout: string;   // e.g. "Burjeel layout"
}

export interface CareSignEvent {
  id: string;
  title: string;
  date: string;         // ISO date string "YYYY-MM-DD"
  isMainEvent: boolean;
  typeId: string;        // → CareSignType.id
  group: string;         // e.g. "General"
  integrated: boolean;
}

export interface CareSignDevice {
  id: string;
  deviceId: string;
  room: string;
  bed: string;
  bldg: string;
  floor: string;
  poc: string;
  group: string;
  careSignTypeId: string;  // → CareSignType.id
  isConnected: boolean;
  patientId: string;
  status: 'Available' | 'Occupied';
  gender?: 'Female' | 'Male';
}

// ── Helpers ──────────────────────────────────────────────────────────────

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data)); // TODO(backend)
  window.dispatchEvent(new Event(CARESIGN_EVENT));
}

// ── Seed Data ────────────────────────────────────────────────────────────

export function initializeCareSignData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(CS_SEEDED_KEY)) return;

  // Seed 1 default CareSign Type
  const defaultType: CareSignType = {
    id: 'cstype-1',
    name: 'Suite Room',
    color: '#2696bc',
    layout: 'Burjeel layout',
  };
  localStorage.setItem(CS_TYPES_KEY, JSON.stringify([defaultType]));

  // Seed 0 events (empty calendar)
  localStorage.setItem(CS_EVENTS_KEY, JSON.stringify([]));

  // Seed 10 dummy CareSign devices
  const groups = ['General', 'VIP'];
  const careSignDevices: CareSignDevice[] = Array.from({ length: 10 }, (_, i) => ({
    id: `csd-${i + 1}`,
    deviceId: `${Math.random().toString(16).slice(2, 14)}`,
    room: `${305 + i}`,
    bed: i < 2 ? 'Nil' : `${(i % 4) + 1}`.padStart(2, '0'),
    bldg: i < 2 ? 'Nil' : `${(i % 3) + 1}`.padStart(2, '0'),
    floor: i < 2 ? 'Nil' : `${(i % 5) + 1}`.padStart(2, '0'),
    poc: i < 2 ? 'Nil' : ['1A', '2B', '3C', '4A'][i % 4],
    group: groups[i % 2],
    careSignTypeId: 'cstype-1',
    isConnected: i >= 3,           // first 3 disconnected
    patientId: i % 2 === 1 ? `PAT${(2000 + i).toString()}` : 'No Patient',
    status: i % 2 === 1 ? 'Occupied' : 'Available',
    gender: i % 4 === 1 ? 'Female' : 'Male',
  }));
  localStorage.setItem(CS_DEVICES_KEY, JSON.stringify(careSignDevices));

  localStorage.setItem(CS_SEEDED_KEY, 'true');
}

// ── CareSign Types CRUD ──────────────────────────────────────────────────

function loadTypes(): CareSignType[] {
  return safeParse<CareSignType[]>(localStorage.getItem(CS_TYPES_KEY), []);
}

export const careSignTypeService = {
  list(): CareSignType[] {
    return loadTypes();
  },

  get(id: string): CareSignType | undefined {
    return loadTypes().find((t) => t.id === id);
  },

  create(data: Omit<CareSignType, 'id'>): CareSignType {
    const types = loadTypes();
    const newType: CareSignType = { id: uid(), ...data };
    types.push(newType);
    persist(CS_TYPES_KEY, types);
    return newType;
  },

  update(id: string, patch: Partial<Omit<CareSignType, 'id'>>): CareSignType | null {
    const types = loadTypes();
    const idx = types.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    types[idx] = { ...types[idx], ...patch };
    persist(CS_TYPES_KEY, types);
    return types[idx];
  },

  remove(id: string): boolean {
    const types = loadTypes();
    const filtered = types.filter((t) => t.id !== id);
    if (filtered.length === types.length) return false;
    persist(CS_TYPES_KEY, filtered);
    return true;
  },
};

// ── CareSign Events CRUD ─────────────────────────────────────────────────

function loadEvents(): CareSignEvent[] {
  return safeParse<CareSignEvent[]>(localStorage.getItem(CS_EVENTS_KEY), []);
}

export const careSignEventService = {
  list(): CareSignEvent[] {
    return loadEvents();
  },

  create(data: Omit<CareSignEvent, 'id'>): CareSignEvent {
    const events = loadEvents();
    const newEvent: CareSignEvent = { id: uid(), ...data };
    events.push(newEvent);
    persist(CS_EVENTS_KEY, events);
    return newEvent;
  },

  update(id: string, patch: Partial<Omit<CareSignEvent, 'id'>>): CareSignEvent | null {
    const events = loadEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...patch };
    persist(CS_EVENTS_KEY, events);
    return events[idx];
  },

  remove(id: string): boolean {
    const events = loadEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    persist(CS_EVENTS_KEY, filtered);
    return true;
  },
};

// ── CareSign Devices CRUD ────────────────────────────────────────────────

function loadDevices(): CareSignDevice[] {
  const raw = safeParse<CareSignDevice[]>(localStorage.getItem(CS_DEVICES_KEY), []);
  return raw.map((d, i) => ({
    ...d,
    status: d.status || (d.patientId && d.patientId !== 'No Patient' ? 'Occupied' : 'Available'),
    gender: d.gender || (i % 2 === 1 ? 'Female' : 'Male'),
  }));
}

export const careSignDeviceService = {
  list(): CareSignDevice[] {
    return loadDevices();
  },

  get(id: string): CareSignDevice | undefined {
    return loadDevices().find((d) => d.id === id);
  },

  create(data: Omit<CareSignDevice, 'id'>): CareSignDevice {
    const devices = loadDevices();
    const newDevice: CareSignDevice = { id: uid(), ...data };
    devices.push(newDevice);
    persist(CS_DEVICES_KEY, devices);
    return newDevice;
  },

  update(id: string, patch: Partial<Omit<CareSignDevice, 'id'>>): CareSignDevice | null {
    const devices = loadDevices();
    const idx = devices.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    devices[idx] = { ...devices[idx], ...patch };
    persist(CS_DEVICES_KEY, devices);
    return devices[idx];
  },

  remove(id: string): boolean {
    const devices = loadDevices();
    const filtered = devices.filter((d) => d.id !== id);
    if (filtered.length === devices.length) return false;
    persist(CS_DEVICES_KEY, filtered);
    return true;
  },
};
