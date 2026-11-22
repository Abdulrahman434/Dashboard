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

/**
 * One category record serves two purposes:
 *  - `nameEn` is the internal Name (Team Assignment dropdowns, Items Manager).
 *  - `displayNameEn` / `displayNameAr` are shown on the patient-facing screen.
 * Every field added after v5 is optional and defaulted at read time, so
 * already-stored data needs no migration.
 */
export interface TeamCategory {
  id: string;
  nameEn: string;
  /** Legacy Arabic name — used as the Arabic display name when `displayNameAr` is unset. */
  nameAr?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  /** Shown on the patient-facing screen. Default true. Never affects routing. */
  active?: boolean;
  /** Position on the patient-facing screen (ascending). */
  order?: number;
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
  /** Position within its own category (ascending). Never affects routing. */
  order?: number;
  /**
   * Removed from management and the patient screen, but the record is kept so
   * existing requests (which reference it by id) stay readable.
   */
  archived?: boolean;
}

/** What the patient-facing app reads: active categories in order, each with its visible items in order. */
export interface PatientMenuCategory {
  id: string;
  displayNameEn: string;
  displayNameAr: string;
  items: LibraryItem[];
}

/** What happens to a deleted category's items. */
export type DeleteCategoryMode =
  | { mode: 'delete-items' }
  | { mode: 'move-items'; targetCategoryId: string }
  | { mode: 'uncategorize' };

export function categoryDisplayEn(c: TeamCategory): string {
  return c.displayNameEn || c.nameEn;
}

export function categoryDisplayAr(c: TeamCategory): string {
  return c.displayNameAr || c.nameAr || '';
}

const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

/** Defaults for records stored before ordering / Active existed: order = stored position, active = true. */
function normaliseCategories(cats: TeamCategory[]): TeamCategory[] {
  return cats
    .map((c, i) => ({ ...c, active: c.active ?? true, order: c.order ?? i }))
    .sort(byOrder);
}

function normaliseItems(items: LibraryItem[]): LibraryItem[] {
  return items.map((it, i) => ({ ...it, order: it.order ?? i }));
}

/** Next free position at the end of a category's items. */
function nextItemOrder(items: LibraryItem[], categoryId: string | null): number {
  const inCat = items.filter((i) => i.categoryId === categoryId);
  return inCat.length ? Math.max(...inCat.map((i) => i.order ?? 0)) + 1 : 0;
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
    { id: 'cat-need', nameEn: 'I Need Something', displayNameEn: 'I Need Something', displayNameAr: 'أحتاج إلى شيء', active: true, order: 0 },
    { id: 'cat-room-care', nameEn: 'Room Care', displayNameEn: 'Room Care', displayNameAr: 'العناية بالغرفة', active: true, order: 1 },
    { id: 'cat-issue', nameEn: 'Report an Issue', displayNameEn: 'Report an Issue', displayNameAr: 'أبلغ عن مشكلة', active: true, order: 2 },
  ];

  const library: LibraryItem[] = [
    { id: 'lib-towel', nameEn: 'Extra towel', nameAr: 'منشفة إضافية', type: 'Service Request', priority: 'Low', categoryId: 'cat-need', active: true },
    { id: 'lib-water', nameEn: 'Water bottle', nameAr: 'زجاجة ماء', type: 'Service Request', priority: 'Low', categoryId: 'cat-need', active: true },
    { id: 'lib-clean', nameEn: 'Room cleaning', nameAr: 'تنظيف الغرفة', type: 'Service Request', priority: 'Medium', categoryId: 'cat-room-care', active: true },
    { id: 'lib-pillow', nameEn: 'Extra pillow', nameAr: 'وسادة إضافية', type: 'Service Request', priority: 'Low', categoryId: 'cat-need', active: true },
    { id: 'lib-ac', nameEn: 'Air conditioning', nameAr: 'التكييف', type: 'Issue', priority: 'High', categoryId: 'cat-issue', active: true },
    { id: 'lib-plumbing', nameEn: 'Toilet / plumbing', nameAr: 'السباكة', type: 'Issue', priority: 'High', categoryId: 'cat-issue', active: true },
    { id: 'lib-lights', nameEn: 'Lights', nameAr: 'الإضاءة', type: 'Issue', priority: 'Medium', categoryId: 'cat-issue', active: true },
    { id: 'lib-tv', nameEn: 'TV not working', nameAr: 'التلفاز لا يعمل', type: 'Issue', priority: 'Medium', categoryId: 'cat-issue', active: true },
    { id: 'lib-wifi', nameEn: 'Wi-Fi / tablet issue', nameAr: 'مشكلة في الواي فاي', type: 'Issue', priority: 'Medium', categoryId: 'cat-issue', active: true },
  ];

  const workflow: WorkflowStep[] = [
    { id: 'wf-sent', status: 'Sent', allowedMinutes: 10, escalationMinutes: 15 },
    { id: 'wf-accepted', status: 'Accepted', allowedMinutes: 20, escalationMinutes: 30 },
    { id: 'wf-progress', status: 'In Progress', allowedMinutes: 45, escalationMinutes: 60 },
    { id: 'wf-delivered', status: 'Delivered', allowedMinutes: null, escalationMinutes: null },
  ];

  const teams: Team[] = [
    { id: 'team-hk-f4', name: 'Housekeeping F4', categoryIds: ['cat-need', 'cat-room-care'], roomDeviceIds: ['1', '21', '26'], defaultAssignedUserId: null },
    { id: 'team-hk-f3', name: 'Housekeeping F3', categoryIds: ['cat-need', 'cat-room-care', 'cat-issue'], roomDeviceIds: ['7', '13', '2'], defaultAssignedUserId: null },
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
  /** Categories in patient-facing order, with defaults applied. */
  listCategories(): TeamCategory[] {
    seedIfEmpty();
    return normaliseCategories(read<TeamCategory[]>(CATEGORIES_KEY, []));
  },
  createCategory(input: { nameEn: string; displayNameEn?: string; displayNameAr?: string; active?: boolean }): TeamCategory {
    const cats = this.listCategories();
    const cat: TeamCategory = {
      id: makeId('cat'),
      nameEn: input.nameEn.trim(),
      displayNameEn: input.displayNameEn?.trim() || undefined,
      displayNameAr: input.displayNameAr?.trim() || undefined,
      active: input.active ?? true,
      order: cats.length ? Math.max(...cats.map((c) => c.order ?? 0)) + 1 : 0,
    };
    write(CATEGORIES_KEY, [...cats, cat]);
    return cat;
  },
  updateCategory(
    id: string,
    patch: Partial<Pick<TeamCategory, 'nameEn' | 'nameAr' | 'displayNameEn' | 'displayNameAr' | 'active'>>,
  ): void {
    write(CATEGORIES_KEY, this.listCategories().map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },
  /**
   * Delete a category. Every mode removes the category and strips it from all
   * teams' `categoryIds`; requests are never modified. Its items are archived
   * (records kept for request history), moved to the end of another category,
   * or left uncategorized (hidden from patients until reassigned).
   */
  deleteCategory(id: string, opts: DeleteCategoryMode): void {
    const cats = this.listCategories();
    if (opts.mode === 'move-items') {
      const target = opts.targetCategoryId;
      if (target === id || !cats.some((c) => c.id === target)) {
        throw new Error('deleteCategory: target category must be another existing category');
      }
    }
    const items = this.listLibrary();
    const moving = this.listCategoryItems(id).map((i) => i.id); // saved order
    const base = opts.mode === 'move-items' ? nextItemOrder(items, opts.targetCategoryId) : 0;
    write(LIBRARY_KEY, items.map((i) => {
      if (i.categoryId !== id) return i;
      if (opts.mode === 'delete-items') return { ...i, archived: true };
      if (opts.mode === 'uncategorize') return { ...i, categoryId: null };
      const pos = moving.indexOf(i.id);
      // archived items follow the category id too, so history lookups stay consistent
      return { ...i, categoryId: opts.targetCategoryId, order: base + (pos < 0 ? moving.length : pos) };
    }));
    write(TEAMS_KEY, this.listTeams().map((t) =>
      t.categoryIds.includes(id) ? { ...t, categoryIds: t.categoryIds.filter((c) => c !== id) } : t,
    ));
    write(CATEGORIES_KEY, cats.filter((c) => c.id !== id));
  },
  isCategoryNameTaken(name: string, excludeId?: string): boolean {
    const n = name.trim().toLowerCase();
    return this.listCategories().some((c) => c.id !== excludeId && c.nameEn.trim().toLowerCase() === n);
  },
  /** Patient-facing order only — team assignments and items are untouched. */
  setCategoryOrder(orderedIds: string[]): void {
    const pos = new Map(orderedIds.map((id, i) => [id, i]));
    const cats = this.listCategories();
    // ids missing from the list keep their relative order after the listed ones
    const next = cats.map((c, i) => ({ ...c, order: pos.has(c.id) ? pos.get(c.id)! : orderedIds.length + i }));
    write(CATEGORIES_KEY, next.sort(byOrder).map((c, i) => ({ ...c, order: i })));
  },
  /** Non-archived item / team counts that reference a category. */
  categoryUsage(id: string): { items: number; teams: number } {
    return {
      items: this.listLibrary().filter((i) => i.categoryId === id && !i.archived).length,
      teams: this.listTeams().filter((t) => t.categoryIds.includes(id)).length,
    };
  },
  /** The contract for the patient-facing app: active categories, display names, visible items, saved order. */
  listPatientMenu(): PatientMenuCategory[] {
    return this.listCategories()
      .filter((c) => c.active)
      .map((c) => ({
        id: c.id,
        displayNameEn: categoryDisplayEn(c),
        displayNameAr: categoryDisplayAr(c),
        items: this.listCategoryItems(c.id).filter((i) => i.active),
      }));
  },

  // ---- Library items ----------------------------------------------------
  /**
   * Every item, archived ones included — request history resolves item names
   * through this. Management screens filter `archived` themselves.
   */
  listLibrary(): LibraryItem[] {
    seedIfEmpty();
    return normaliseItems(read<LibraryItem[]>(LIBRARY_KEY, []));
  },
  /** One category's non-archived items in their saved order. */
  listCategoryItems(categoryId: string): LibraryItem[] {
    return this.listLibrary()
      .filter((i) => i.categoryId === categoryId && !i.archived)
      .sort(byOrder);
  },
  /** Writes `order` for this category's items only; ids from other categories are ignored. */
  setCategoryItemOrder(categoryId: string, orderedItemIds: string[]): void {
    const inCat = new Set(this.listCategoryItems(categoryId).map((i) => i.id));
    const listed = orderedItemIds.filter((id) => inCat.has(id));
    const rest = this.listCategoryItems(categoryId).map((i) => i.id).filter((id) => !listed.includes(id));
    const pos = new Map([...listed, ...rest].map((id, i) => [id, i]));
    write(LIBRARY_KEY, this.listLibrary().map((i) => (pos.has(i.id) ? { ...i, order: pos.get(i.id)! } : i)));
  },
  createLibraryItem(input: Omit<LibraryItem, 'id'>): LibraryItem {
    const items = this.listLibrary();
    const item: LibraryItem = { ...input, id: makeId('lib'), order: nextItemOrder(items, input.categoryId) };
    write(LIBRARY_KEY, [...items, item]);
    return item;
  },
  /** A change of category appends the item to the end of its new category; nothing else about order changes. */
  updateLibraryItem(id: string, patch: Partial<Omit<LibraryItem, 'id'>>): void {
    const items = this.listLibrary();
    write(LIBRARY_KEY, items.map((i) => {
      if (i.id !== id) return i;
      const moved = 'categoryId' in patch && patch.categoryId !== i.categoryId;
      const { order: _ignored, ...rest } = patch;
      return { ...i, ...rest, ...(moved ? { order: nextItemOrder(items, patch.categoryId ?? null) } : {}) };
    }));
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
