/**
 * careSuiteService
 * --------------------------------------------------------------------------
 * CRUD service for the CareSuite request-management module: Team Categories,
 * Library items, Workflow steps, Teams (+ room assignment), and Requests.
 *
 * INTERIM PERSISTENCE: localStorage (mirrors nurseStationService.ts exactly).
 * A Team's assigned rooms come from the SAME source of truth as the Device
 * Manager / Nurse Station (`careinn_devices`) — real registered devices, not
 * mock data. Teams may share rooms (no exclusivity).
 *
 * ⚠️ A real backend is required for production. Every persistence call is
 * marked // TODO(backend) so the swap is mechanical.
 */

const CATEGORIES_KEY = 'careinn_caresuite_categories';
const LIBRARY_KEY = 'careinn_caresuite_library';
const WORKFLOW_KEY = 'careinn_caresuite_workflow';
const TEAMS_KEY = 'careinn_caresuite_teams';
const REQUESTS_KEY = 'careinn_caresuite_requests';
const SEEDED_KEY = 'careinn_caresuite_seeded_v5';
const DEVICES_KEY = 'careinn_devices'; // single source of truth (Device Manager)

/** Custom event so the sidebar / User Roles / dashboards re-read after a write. */
export const CARESUITE_EVENT = 'careinn:caresuite-changed';

export type RequestType = 'Service Request' | 'Issue';
export type Priority = 'High' | 'Medium' | 'Low';

export interface TeamCategory {
  id: string;
  nameEn: string;
  nameAr?: string;
}

export interface LibraryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  image?: string;
  type: RequestType;
  priority: Priority;
  categoryId: string | null; // -> TeamCategory.id
  active: boolean;
  group?: string;
}

export interface WorkflowStep {
  id: string;
  status: string;
  allowedMinutes: number | null; // nullable "Allowed Period"
  escalationMinutes: number | null; // "Escalation after period"
}

/** Shape of a device row as stored by the Device Manager (mirrors nurseStationService.DeviceRow). */
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

export interface Team {
  id: string;
  name: string;
  categoryIds: string[]; // a team may cover more than one category
  roomDeviceIds: string[]; // real device ids; teams may share rooms
  defaultAssignedUserId: string | null;
}

export interface CSHistoryEvent {
  status: string;
  timestamp: number;
}

export interface CSRequest {
  id: string;
  libraryItemId: string;
  room: string; // display label (e.g. "304-A")
  comment?: string;
  status: string; // matches a WorkflowStep.status
  priority: Priority;
  createdAt: number;
  lastStatusChangeAt: number;
  assignedTeamId: string | null;
  assignedUserId: string | null; // nullable — "to be filled by user", not editable yet
  history: CSHistoryEvent[];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let idCounter = 0;
function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return safeParse<T>(localStorage.getItem(key), fallback);
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  // TODO(backend): replace with the appropriate POST/PUT/DELETE call
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CARESUITE_EVENT));
}

// ---- one-time demo seed (only if nothing has been saved yet) --------------

function seedIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const categories: TeamCategory[] = [
    { id: 'cat-housekeeping', nameEn: 'Housekeeping', nameAr: 'التدبير المنزلي' },
    { id: 'cat-maintenance', nameEn: 'Maintenance', nameAr: 'الصيانة' },
    { id: 'cat-it', nameEn: 'IT Support', nameAr: 'الدعم الفني' },
  ];

  const library: LibraryItem[] = [
    { id: 'lib-towel', nameEn: 'Extra towel', nameAr: 'منشفة إضافية', type: 'Service Request', priority: 'Low', categoryId: 'cat-housekeeping', active: true },
    { id: 'lib-water', nameEn: 'Water bottle', nameAr: 'زجاجة ماء', type: 'Service Request', priority: 'Low', categoryId: 'cat-housekeeping', active: true },
    { id: 'lib-clean', nameEn: 'Room cleaning', nameAr: 'تنظيف الغرفة', type: 'Service Request', priority: 'Medium', categoryId: 'cat-housekeeping', active: true },
    { id: 'lib-pillow', nameEn: 'Extra pillow', nameAr: 'وسادة إضافية', type: 'Service Request', priority: 'Low', categoryId: 'cat-housekeeping', active: true },
    { id: 'lib-ac', nameEn: 'Air conditioning', nameAr: 'التكييف', type: 'Issue', priority: 'High', categoryId: 'cat-maintenance', active: true },
    { id: 'lib-plumbing', nameEn: 'Toilet / plumbing', nameAr: 'السباكة', type: 'Issue', priority: 'High', categoryId: 'cat-maintenance', active: true },
    { id: 'lib-lights', nameEn: 'Lights', nameAr: 'الإضاءة', type: 'Issue', priority: 'Medium', categoryId: 'cat-maintenance', active: true },
    { id: 'lib-tv', nameEn: 'TV not working', nameAr: 'التلفاز لا يعمل', type: 'Issue', priority: 'Medium', categoryId: 'cat-it', active: true },
    { id: 'lib-wifi', nameEn: 'Wi-Fi / tablet issue', nameAr: 'مشكلة في الواي فاي', type: 'Issue', priority: 'Medium', categoryId: 'cat-it', active: true },
  ];

  const workflow: WorkflowStep[] = [
    { id: 'wf-sent', status: 'Sent', allowedMinutes: 10, escalationMinutes: 15 },
    { id: 'wf-accepted', status: 'Accepted', allowedMinutes: 20, escalationMinutes: 30 },
    { id: 'wf-progress', status: 'In Progress', allowedMinutes: 45, escalationMinutes: 60 },
    { id: 'wf-delivered', status: 'Delivered', allowedMinutes: null, escalationMinutes: null },
  ];

  const teams: Team[] = [
    { id: 'team-hk-f4', name: 'Housekeeping F4', categoryIds: ['cat-housekeeping'], roomDeviceIds: ['1', '21', '26'], defaultAssignedUserId: null },
    { id: 'team-hk-f3', name: 'Housekeeping F3', categoryIds: ['cat-housekeeping', 'cat-maintenance'], roomDeviceIds: ['7', '13', '2'], defaultAssignedUserId: null },
  ];

  const now = Date.now();
  const requests: CSRequest[] = [
    { 
      id: 'req-1', libraryItemId: 'lib-clean', room: '304A', status: 'Sent', priority: 'Medium', createdAt: now - 4 * 60000, lastStatusChangeAt: now - 4 * 60000, assignedTeamId: 'team-hk-f4', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: now - 4 * 60000 }] 
    },
    { 
      id: 'req-2', libraryItemId: 'lib-ac', room: '301B', comment: 'Blowing warm air since this morning.', status: 'Accepted', priority: 'High', createdAt: now - 40 * 60000, lastStatusChangeAt: now - 22 * 60000, assignedTeamId: 'team-hk-f3', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: now - 40 * 60000 }, { status: 'Accepted', timestamp: now - 22 * 60000 }] 
    },
    { 
      id: 'req-3', libraryItemId: 'lib-towel', room: '305A', status: 'In Progress', priority: 'Low', createdAt: now - 20 * 60000, lastStatusChangeAt: now - 12 * 60000, assignedTeamId: 'team-hk-f4', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: now - 20 * 60000 }, { status: 'Accepted', timestamp: now - 16 * 60000 }, { status: 'In Progress', timestamp: now - 12 * 60000 }] 
    },
    { 
      id: 'req-4', libraryItemId: 'lib-plumbing', room: '302C', comment: 'Sink is clogged.', status: 'Sent', priority: 'High', createdAt: now - 2 * 60000, lastStatusChangeAt: now - 2 * 60000, assignedTeamId: 'team-hk-f3', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: now - 2 * 60000 }] 
    },
    { 
      id: 'req-5', libraryItemId: 'lib-pillow', room: '300A', status: 'Delivered', priority: 'Low', createdAt: now - 90 * 60000, lastStatusChangeAt: now - 60 * 60000, assignedTeamId: 'team-hk-f4', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: now - 90 * 60000 }, { status: 'Accepted', timestamp: now - 80 * 60000 }, { status: 'In Progress', timestamp: now - 70 * 60000 }, { status: 'Delivered', timestamp: now - 60 * 60000 }] 
    },
  ];

  write(CATEGORIES_KEY, categories);
  write(LIBRARY_KEY, library);
  write(WORKFLOW_KEY, workflow);
  write(TEAMS_KEY, teams);
  write(REQUESTS_KEY, requests);
  localStorage.setItem(SEEDED_KEY, '1');
}

export const careSuiteService = {
  /** Read all devices from the Device Manager's single source of truth. */
  listDevices(): DeviceRow[] {
    if (typeof window === 'undefined') return [];
    return safeParse<DeviceRow[]>(localStorage.getItem(DEVICES_KEY), []);
  },

  // ---- Team Categories ------------------------------------------------
  listCategories(): TeamCategory[] {
    seedIfEmpty();
    return read<TeamCategory[]>(CATEGORIES_KEY, []);
  },
  createCategory(input: { nameEn: string; nameAr?: string }): TeamCategory {
    const cats = this.listCategories();
    const cat: TeamCategory = { id: makeId('cat'), nameEn: input.nameEn.trim(), nameAr: input.nameAr?.trim() || undefined };
    write(CATEGORIES_KEY, [...cats, cat]);
    return cat;
  },
  updateCategory(id: string, patch: Partial<Pick<TeamCategory, 'nameEn' | 'nameAr'>>): void {
    write(CATEGORIES_KEY, this.listCategories().map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },
  removeCategory(id: string): void {
    write(CATEGORIES_KEY, this.listCategories().filter((c) => c.id !== id));
  },

  // ---- Library items ----------------------------------------------------
  listLibrary(): LibraryItem[] {
    seedIfEmpty();
    return read<LibraryItem[]>(LIBRARY_KEY, []);
  },
  createLibraryItem(input: Omit<LibraryItem, 'id'>): LibraryItem {
    const items = this.listLibrary();
    const item: LibraryItem = { ...input, id: makeId('lib') };
    write(LIBRARY_KEY, [...items, item]);
    return item;
  },
  updateLibraryItem(id: string, patch: Partial<Omit<LibraryItem, 'id'>>): void {
    write(LIBRARY_KEY, this.listLibrary().map((i) => (i.id === id ? { ...i, ...patch } : i)));
  },
  removeLibraryItem(id: string): void {
    write(LIBRARY_KEY, this.listLibrary().filter((i) => i.id !== id));
  },

  // ---- Workflow -----------------------------------------------------------
  listWorkflow(): WorkflowStep[] {
    seedIfEmpty();
    return read<WorkflowStep[]>(WORKFLOW_KEY, []);
  },
  createWorkflowStep(input: Omit<WorkflowStep, 'id'>): WorkflowStep {
    const steps = this.listWorkflow();
    const step: WorkflowStep = { ...input, id: makeId('wf') };
    write(WORKFLOW_KEY, [...steps, step]);
    return step;
  },
  updateWorkflowStep(id: string, patch: Partial<Omit<WorkflowStep, 'id'>>): void {
    write(WORKFLOW_KEY, this.listWorkflow().map((s) => (s.id === id ? { ...s, ...patch } : s)));
  },
  removeWorkflowStep(id: string): void {
    write(WORKFLOW_KEY, this.listWorkflow().filter((s) => s.id !== id));
  },
  moveWorkflowStep(id: string, dir: -1 | 1): void {
    const steps = this.listWorkflow();
    const idx = steps.findIndex((s) => s.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[idx], next[j]] = [next[j], next[idx]];
    write(WORKFLOW_KEY, next);
  },

  // ---- Teams (+ room assignment) ------------------------------------------
  listTeams(): Team[] {
    seedIfEmpty();
    return read<Team[]>(TEAMS_KEY, []);
  },
  getTeam(id: string): Team | undefined {
    return this.listTeams().find((t) => t.id === id);
  },
  createTeam(input: { name: string; categoryIds: string[]; defaultAssignedUserId?: string | null }): Team {
    const teams = this.listTeams();
    const team: Team = {
      id: makeId('team'),
      name: input.name.trim(),
      categoryIds: input.categoryIds,
      roomDeviceIds: [],
      defaultAssignedUserId: input.defaultAssignedUserId ?? null,
    };
    write(TEAMS_KEY, [...teams, team]);
    return team;
  },
  updateTeam(id: string, patch: Partial<Pick<Team, 'name' | 'categoryIds' | 'defaultAssignedUserId'>>): void {
    write(TEAMS_KEY, this.listTeams().map((t) => (t.id === id ? { ...t, ...patch } : t)));
  },
  removeTeam(id: string): void {
    write(TEAMS_KEY, this.listTeams().filter((t) => t.id !== id));
    write(REQUESTS_KEY, this.listRequests().map((r) => (r.assignedTeamId === id ? { ...r, assignedTeamId: null } : r)));
  },
  isTeamNameTaken(name: string, excludeId?: string): boolean {
    const n = name.trim().toLowerCase();
    return this.listTeams().some((t) => t.id !== excludeId && t.name.trim().toLowerCase() === n);
  },
  /** Attach a real registered device (room) to a team. Rooms may be shared across teams. */
  assignRoom(teamId: string, deviceId: string): void {
    const teams = this.listTeams();
    write(TEAMS_KEY, teams.map((t) => {
      if (t.id !== teamId) return t;
      if (t.roomDeviceIds.includes(deviceId)) return t;
      return { ...t, roomDeviceIds: [...t.roomDeviceIds, deviceId] };
    }));
  },
  unassignRoom(teamId: string, deviceId: string): void {
    const teams = this.listTeams();
    write(TEAMS_KEY, teams.map((t) => (t.id === teamId ? { ...t, roomDeviceIds: t.roomDeviceIds.filter((d) => d !== deviceId) } : t)));
  },
  /** deviceId -> team ids currently covering that room (rooms may be shared). */
  teamsForDevice(deviceId: string): Team[] {
    return this.listTeams().filter((t) => t.roomDeviceIds.includes(deviceId));
  },

  // ---- Requests -------------------------------------------------------------
  listRequests(): CSRequest[] {
    seedIfEmpty();
    return read<CSRequest[]>(REQUESTS_KEY, []);
  },
  createRequest(input: Omit<CSRequest, 'id' | 'createdAt' | 'lastStatusChangeAt'> & { createdAt?: number }): CSRequest {
    const reqs = this.listRequests();
    const now = input.createdAt ?? Date.now();
    const req: CSRequest = { 
      ...input, 
      id: makeId('req'), 
      createdAt: now, 
      lastStatusChangeAt: now,
      history: input.history ?? [{ status: input.status, timestamp: now }]
    };
    write(REQUESTS_KEY, [...reqs, req]);
    return req;
  },
  /** Advance/change a request's status — resets the "time in status" clock. */
  setRequestStatus(id: string, status: string): void {
    write(REQUESTS_KEY, this.listRequests().map((r) => {
      if (r.id !== id) return r;
      const now = Date.now();
      return { 
        ...r, 
        status, 
        lastStatusChangeAt: now,
        history: [...(r.history || []), { status, timestamp: now }]
      };
    }));
  },
  assignRequestTeam(id: string, teamId: string | null): void {
    write(REQUESTS_KEY, this.listRequests().map((r) => (r.id === id ? { ...r, assignedTeamId: teamId } : r)));
  },
  assignRequestUser(id: string, userId: string | null): void {
    write(REQUESTS_KEY, this.listRequests().map((r) => (r.id === id ? { ...r, assignedUserId: userId } : r)));
  },
};
