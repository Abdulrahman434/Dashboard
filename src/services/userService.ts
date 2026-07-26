/**
 * userService.ts
 * --------------------------------------------------------------------------
 * CRUD service for the Users module (Control Panel and CareSuite).
 *
 * INTERIM PERSISTENCE: localStorage
 *
 * ⚠️ A real backend is required for production.
 */

const USERS_KEY = 'careinn_users';
const SEEDED_KEY = 'careinn_users_seeded';

export const USER_EVENT = 'careinn:users-changed';

export interface User {
  id: string;
  username: string;
  userRole: string;
  department?: string;
  teamCategoryId?: string; // -> CareSuite TeamCategory.id, optional
  image?: string; // base64 or URL
  userType?: 'Doctor' | 'Nurse' | 'Staff';
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return safeParse<T>(localStorage.getItem(key), fallback);
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(USER_EVENT));
}

function seedIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const users: User[] = [
    { id: 'user-1', username: 'John Doe', userRole: 'IT', department: 'IT Support', userType: 'Staff' },
    { id: 'user-2', username: 'Jane Smith', userRole: 'Nurse Station', department: 'Housekeeping', teamCategoryId: 'cat-housekeeping', userType: 'Nurse' },
    { id: 'user-3', username: 'Mike Johnson', userRole: 'PX', department: 'Patient Experience', userType: 'Staff' },
    { id: 'user-4', username: 'Sarah Williams', userRole: 'Nurse Station', department: 'Maintenance', teamCategoryId: 'cat-maintenance', userType: 'Nurse' },
  ];

  write(USERS_KEY, users);
  localStorage.setItem(SEEDED_KEY, '1');
}

export const userService = {
  listUsers(): User[] {
    seedIfEmpty();
    return read<User[]>(USERS_KEY, []);
  },
  createUser(input: Omit<User, 'id'>): User {
    const users = this.listUsers();
    const user: User = { ...input, id: `user-${Date.now()}` };
    write(USERS_KEY, [...users, user]);
    return user;
  },
  updateUser(id: string, patch: Partial<Omit<User, 'id'>>): void {
    write(USERS_KEY, this.listUsers().map((u) => (u.id === id ? { ...u, ...patch } : u)));
  },
  removeUser(id: string): void {
    write(USERS_KEY, this.listUsers().filter((u) => u.id !== id));
  },
};
