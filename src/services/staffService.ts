/**
 * staffService
 * --------------------------------------------------------------------------
 * Thin, swappable CRUD service for hospital Staff (nurses and doctors).
 *
 * INTERIM PERSISTENCE: localStorage (key `careinn_staff`).
 * This mirrors the existing dashboard persistence convention used by the
 * Nurse Station service (see nurseStationService.ts).
 *
 * ⚠️ A real backend endpoint is REQUIRED for production. Every method below is
 * marked with `// TODO(backend)` at the persistence call site so the swap to a
 * real API is mechanical: keep the same method signatures, replace the
 * localStorage read/write with a fetch to the Staff endpoint.
 */

const STAFF_KEY = 'careinn_staff';

/** Custom event so any consumer re-reads after a write. */
export const STAFF_EVENT = 'careinn:staff-changed';

export interface StaffMember {
  id: string;
  name: string;
  image: string;   // URL or empty string
  department: string;
  type: 'Doctor' | 'Nurse';
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStaff(): StaffMember[] {
  if (typeof window === 'undefined') return [];
  // TODO(backend): replace with GET /staff
  return safeParse<StaffMember[]>(localStorage.getItem(STAFF_KEY), []);
}

function writeStaff(staff: StaffMember[]): void {
  if (typeof window === 'undefined') return;
  // TODO(backend): replace with the appropriate POST/PUT/DELETE /staff call
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  window.dispatchEvent(new CustomEvent(STAFF_EVENT));
}

/** Monotonic-ish id without Math.random (kept deterministic-friendly). */
let idCounter = 0;
function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

export const staffService = {
  list(): StaffMember[] {
    return readStaff();
  },

  get(id: string): StaffMember | undefined {
    return readStaff().find((s) => s.id === id);
  },

  create(input: { name: string; image: string; department: string; type: 'Doctor' | 'Nurse' }): StaffMember {
    const staff = readStaff();
    const member: StaffMember = {
      id: makeId('staff'),
      name: input.name.trim(),
      image: input.image.trim(),
      department: input.department.trim(),
      type: input.type,
    };
    writeStaff([...staff, member]);
    return member;
  },

  update(
    id: string,
    patch: Partial<Pick<StaffMember, 'name' | 'image' | 'department' | 'type'>>,
  ): StaffMember | undefined {
    const staff = readStaff();
    let updated: StaffMember | undefined;
    const next = staff.map((m) => {
      if (m.id !== id) return m;
      updated = {
        ...m,
        ...patch,
        name: (patch.name ?? m.name).trim(),
        image: (patch.image ?? m.image).trim(),
        department: (patch.department ?? m.department).trim(),
      };
      return updated;
    });
    writeStaff(next);
    return updated;
  },

  remove(id: string): void {
    writeStaff(readStaff().filter((m) => m.id !== id));
  },

  /** Check name uniqueness (case-insensitive), optionally excluding one id. */
  isNameTaken(name: string, excludeId?: string): boolean {
    const n = name.trim().toLowerCase();
    return readStaff().some((m) => m.id !== excludeId && m.name.trim().toLowerCase() === n);
  },
};
