/**
 * Unit tests for careSuiteService — run with `npm test` (Node's built-in
 * test runner; Node strips the TypeScript types natively).
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ---- minimal browser shims (the service reads window/localStorage at call time)
const store = new Map<string, string>();
(globalThis as any).window = globalThis;
(globalThis as any).dispatchEvent = () => true; // write() notifies listeners via window.dispatchEvent
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import {
  careSuiteService as cs,
  categoryDisplayEn,
  categoryDisplayAr,
} from './careSuiteService.ts';

const K = {
  seeded: 'careinn_caresuite_seeded_v5',
  categories: 'careinn_caresuite_categories',
  library: 'careinn_caresuite_library',
  teams: 'careinn_caresuite_teams',
  requests: 'careinn_caresuite_requests',
};

const put = (key: string, value: unknown) => store.set(key, JSON.stringify(value));
const get = (key: string) => JSON.parse(store.get(key) || 'null');
const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

const item = (id: string, categoryId: string | null, extra: Record<string, unknown> = {}) => ({
  id,
  nameEn: id,
  nameAr: '',
  type: 'Service Request',
  priority: 'Low',
  categoryId,
  active: true,
  ...extra,
});

beforeEach(() => {
  store.clear();
  store.set(K.seeded, '1'); // never run the demo seed in tests
  put(K.categories, [
    { id: 'A', nameEn: 'A', nameAr: 'أ' },
    { id: 'B', nameEn: 'B' },
  ]);
  put(K.library, [item('x1', 'A'), item('y1', 'B'), item('x2', 'A')]);
  put(K.teams, [
    { id: 't1', name: 'Team 1', categoryIds: ['A', 'B'], roomDeviceIds: [], defaultAssignedUserId: null },
  ]);
  put(K.requests, [
    {
      id: 'r1', libraryItemId: 'x1', room: '101', status: 'Sent', priority: 'Low',
      createdAt: 1, lastStatusChangeAt: 1, assignedTeamId: 't1', assignedUserId: null,
      history: [{ status: 'Sent', timestamp: 1 }],
    },
  ]);
});

test('legacy categories load with defaults', () => {
  const cats = cs.listCategories();
  assert.deepEqual(ids(cats), ['A', 'B']);
  assert.ok(cats.every((c) => c.active === true));
  const [a, b] = cats;
  assert.equal(categoryDisplayEn(b), 'B');
  assert.equal(categoryDisplayAr(a), 'أ');
  assert.equal(categoryDisplayAr(b), '');
});

test('display names override the internal name', () => {
  cs.updateCategory('A', { displayNameEn: 'I Need Something', displayNameAr: 'أحتاج إلى شيء' });
  const a = cs.listCategories().find((c) => c.id === 'A')!;
  assert.equal(a.nameEn, 'A');
  assert.equal(categoryDisplayEn(a), 'I Need Something');
  assert.equal(categoryDisplayAr(a), 'أحتاج إلى شيء');
});

test('createCategory appends to the end of the order', () => {
  const c = cs.createCategory({ nameEn: 'C', displayNameEn: 'Room Care' });
  assert.deepEqual(ids(cs.listCategories()), ['A', 'B', c.id]);
  assert.equal(c.active, true);
});

test('setCategoryOrder reorders without touching teams', () => {
  const teamsBefore = store.get(K.teams);
  cs.setCategoryOrder(['B', 'A']);
  assert.deepEqual(ids(cs.listCategories()), ['B', 'A']);
  assert.equal(store.get(K.teams), teamsBefore);
});

test('item order is scoped per category', () => {
  cs.setCategoryItemOrder('A', ['x2', 'x1', 'y1']);
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x2', 'x1']);
  assert.deepEqual(ids(cs.listCategoryItems('B')), ['y1']);
  const byId = Object.fromEntries(cs.listLibrary().map((i) => [i.id, i.categoryId]));
  assert.deepEqual(byId, { x1: 'A', y1: 'B', x2: 'A' });
});

test('moving an item appends it to the new category', () => {
  cs.updateLibraryItem('x1', { categoryId: 'B' });
  assert.deepEqual(ids(cs.listCategoryItems('B')), ['y1', 'x1']);
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x2']);
});

test('editing an item without changing its category keeps its position', () => {
  cs.setCategoryItemOrder('A', ['x2', 'x1']);
  cs.updateLibraryItem('x2', { nameEn: 'renamed', categoryId: 'A' });
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x2', 'x1']);
});

test('createLibraryItem appends to the end of its category', () => {
  const n = cs.createLibraryItem(item('ignored', 'A') as any);
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x1', 'x2', n.id]);
});

test('inactive category hidden from patient menu and restored in order', () => {
  cs.setCategoryItemOrder('A', ['x2', 'x1']);
  cs.updateCategory('A', { active: false });
  assert.deepEqual(ids(cs.listPatientMenu()), ['B']);
  // items themselves are untouched
  assert.ok(cs.listCategoryItems('A').every((i) => i.active));
  cs.updateCategory('A', { active: true });
  const a = cs.listPatientMenu().find((c) => c.id === 'A')!;
  assert.deepEqual(ids(a.items), ['x2', 'x1']);
});

test('patient menu uses display names and category order', () => {
  cs.updateCategory('B', { displayNameEn: 'Room Care', displayNameAr: 'العناية بالغرفة' });
  cs.setCategoryOrder(['B', 'A']);
  const menu = cs.listPatientMenu();
  assert.deepEqual(ids(menu), ['B', 'A']);
  assert.equal(menu[0].displayNameEn, 'Room Care');
  assert.equal(menu[0].displayNameAr, 'العناية بالغرفة');
  assert.equal(menu[1].displayNameEn, 'A');
});

test('patient menu excludes uncategorized, archived and inactive items', () => {
  put(K.library, [
    item('x1', 'A'),
    item('x2', 'A', { archived: true }),
    item('x3', 'A', { active: false }),
    item('u1', null),
  ]);
  const menu = cs.listPatientMenu();
  assert.deepEqual(ids(menu.find((c) => c.id === 'A')!.items), ['x1']);
  assert.ok(menu.every((c) => !c.items.some((i) => i.id === 'u1')));
});

test('listCategoryItems excludes archived items', () => {
  put(K.library, [item('x1', 'A'), item('x2', 'A', { archived: true })]);
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x1']);
  assert.equal(cs.listLibrary().length, 2); // history lookups still see it
});

test('categoryUsage counts non-archived items and teams', () => {
  put(K.library, [item('x1', 'A'), item('x2', 'A', { archived: true }), item('y1', 'B')]);
  assert.deepEqual(cs.categoryUsage('A'), { items: 1, teams: 1, users: 0 });
});

// ---- Task 2: deleting a category ----------------------------------------

const MODES = [
  { mode: 'delete-items' },
  { mode: 'move-items', targetCategoryId: 'B' },
  { mode: 'uncategorize' },
] as const;

for (const opts of MODES) {
  test(`deleteCategory (${opts.mode}) strips team associations and removes the category`, () => {
    cs.deleteCategory('A', opts as any);
    assert.deepEqual(cs.listTeams()[0].categoryIds, ['B']);
    assert.deepEqual(ids(cs.listCategories()), ['B']);
  });

  test(`deleteCategory (${opts.mode}) leaves requests untouched and resolvable`, () => {
    const before = store.get(K.requests);
    cs.deleteCategory('A', opts as any);
    assert.equal(store.get(K.requests), before);
    for (const r of cs.listRequests()) {
      assert.ok(cs.listLibrary().some((i) => i.id === r.libraryItemId), `request ${r.id} lost its item`);
    }
  });
}

test('delete-items archives but keeps records', () => {
  cs.deleteCategory('A', { mode: 'delete-items' });
  const x1 = cs.listLibrary().find((i) => i.id === 'x1')!;
  assert.equal(x1.archived, true);
  assert.equal(cs.listCategoryItems('A').length, 0);
  assert.equal(cs.listLibrary().find((i) => i.id === 'y1')!.archived, undefined);
});

test('move-items appends to target and keeps other fields', () => {
  put(K.library, [
    item('x1', 'A', { type: 'Issue', priority: 'High', active: false }),
    item('y1', 'B'),
    item('x2', 'A'),
  ]);
  cs.setCategoryItemOrder('A', ['x2', 'x1']);
  cs.deleteCategory('A', { mode: 'move-items', targetCategoryId: 'B' });
  assert.deepEqual(ids(cs.listCategoryItems('B')), ['y1', 'x2', 'x1']);
  const x1 = cs.listLibrary().find((i) => i.id === 'x1')!;
  assert.deepEqual(
    { type: x1.type, priority: x1.priority, active: x1.active, nameEn: x1.nameEn, categoryId: x1.categoryId },
    { type: 'Service', priority: 'High', active: false, nameEn: 'x1', categoryId: 'B' },
  );
});

test('move-items rejects a missing or same target', () => {
  assert.throws(() => cs.deleteCategory('A', { mode: 'move-items', targetCategoryId: 'nope' }), /target category/);
  assert.throws(() => cs.deleteCategory('A', { mode: 'move-items', targetCategoryId: 'A' }), /target category/);
  assert.deepEqual(ids(cs.listCategories()), ['A', 'B']); // nothing deleted
});

test('uncategorize sets categoryId null and hides items from the patient menu', () => {
  cs.deleteCategory('A', { mode: 'uncategorize' });
  const lib = cs.listLibrary();
  assert.equal(lib.find((i) => i.id === 'x1')!.categoryId, null);
  assert.equal(lib.find((i) => i.id === 'x1')!.archived, undefined);
  const menuItems = cs.listPatientMenu().flatMap((c) => ids(c.items));
  assert.ok(!menuItems.includes('x1') && !menuItems.includes('x2'));
});

// ---- final review fixes ----------------------------------------------------

test('removeLibraryItem archives the item so request history still resolves', () => {
  cs.removeLibraryItem('x1');
  const x1 = cs.listLibrary().find((i) => i.id === 'x1');
  assert.ok(x1, 'record kept for request history');
  assert.equal(x1!.archived, true);
  assert.deepEqual(ids(cs.listCategoryItems('A')), ['x2']);
  assert.ok(!cs.listPatientMenu().some((c) => c.items.some((i) => i.id === 'x1')));
});

const USERS = 'careinn_users';
const seedUsers = () =>
  put(USERS, [
    { id: 'u1', username: 'Jane', teamCategoryId: 'A' },
    { id: 'u2', username: 'Sam', teamCategoryId: 'B' },
    { id: 'u3', username: 'Lee' },
  ]);

test('categoryUsage counts users linked to the category', () => {
  seedUsers();
  assert.equal(cs.categoryUsage('A').users, 1);
  assert.equal(cs.categoryUsage('B').users, 1);
});

for (const opts of MODES) {
  test(`deleteCategory (${opts.mode}) clears the deleted category from users only`, () => {
    seedUsers();
    cs.deleteCategory('A', opts as any);
    const users = get(USERS);
    assert.equal(users.find((u: any) => u.id === 'u1').teamCategoryId, undefined);
    assert.equal(users.find((u: any) => u.id === 'u2').teamCategoryId, 'B');
    assert.equal(users.find((u: any) => u.id === 'u1').username, 'Jane');
  });
}

test('demo seed: every seeded user points at a seeded category', async () => {
  store.clear(); // fresh install: both seeds run
  const { userService } = await import('./userService.ts');
  const catIds = new Set(cs.listCategories().map((c) => c.id));
  const linked = userService.listUsers().filter((u) => u.teamCategoryId);
  assert.ok(linked.length > 0);
  for (const u of linked) assert.ok(catIds.has(u.teamCategoryId!), `${u.username} -> ${u.teamCategoryId}`);
});

// ---- patient-screen look per category ----------------------------------------

test('legacy categories get patient-screen defaults', () => {
  const [a] = cs.listCategories();
  assert.equal(a.tone, 'primary');
  assert.equal(a.cardStyle, 'image');
  assert.equal(a.allowMultiple, false);
});

test('category look settings persist', () => {
  cs.updateCategory('A', {
    tone: 'alert', cardStyle: 'icon', allowMultiple: true, icon: 'wrench',
    subheadingEn: 'Tell us what needs attention.', subheadingAr: 'أخبرنا بما يحتاج إلى اهتمام.',
  });
  const a = cs.listCategories().find((c) => c.id === 'A')!;
  assert.deepEqual(
    [a.tone, a.cardStyle, a.allowMultiple, a.icon, a.subheadingAr],
    ['alert', 'icon', true, 'wrench', 'أخبرنا بما يحتاج إلى اهتمام.'],
  );
});

test('createCategory accepts look settings', () => {
  const c = cs.createCategory({ nameEn: 'C', tone: 'alert', cardStyle: 'icon', allowMultiple: true, icon: 'sparkles' });
  const got = cs.listCategories().find((x) => x.id === c.id)!;
  assert.deepEqual([got.tone, got.cardStyle, got.allowMultiple, got.icon], ['alert', 'icon', true, 'sparkles']);
});

test('patient menu carries look settings; the display name is the heading', () => {
  cs.updateCategory('A', { displayNameEn: 'Room Care', displayNameAr: 'العناية بالغرفة', tone: 'primary', cardStyle: 'icon', icon: 'sparkles' });
  cs.updateCategory('B', { subheadingEn: 'Tap what you would like us to bring.', allowMultiple: true });
  const [a, b] = cs.listPatientMenu();
  assert.deepEqual(
    { displayNameEn: a.displayNameEn, displayNameAr: a.displayNameAr, tone: a.tone, cardStyle: a.cardStyle, allowMultiple: a.allowMultiple, icon: a.icon, subheadingEn: a.subheadingEn },
    { displayNameEn: 'Room Care', displayNameAr: 'العناية بالغرفة', tone: 'primary', cardStyle: 'icon', allowMultiple: false, icon: 'sparkles', subheadingEn: '' },
  );
  assert.equal(b.subheadingEn, 'Tap what you would like us to bring.');
  assert.equal(b.allowMultiple, true);
  assert.equal(b.icon, '');
});

test('patient menu has no separate heading, even for data saved with one', () => {
  put(K.categories, [{ id: 'A', nameEn: 'A', displayNameEn: 'Room Care', headingEn: 'Room care request' }]);
  const [a] = cs.listPatientMenu();
  assert.equal('headingEn' in a, false);
  assert.equal('headingAr' in a, false);
  assert.equal(a.displayNameEn, 'Room Care');
});

test('items keep an icon name alongside their image', () => {
  cs.updateLibraryItem('x1', { icon: 'bed' });
  assert.equal(cs.listLibrary().find((i) => i.id === 'x1')!.icon, 'bed');
});

// ---- types: Amenity / Service ----------------------------------------------------

test('legacy types read as Amenity / Service without rewriting storage', () => {
  put(K.library, [item('a', 'A', { type: 'Service Request' }), item('b', 'A', { type: 'Issue' }), item('c', 'A', { type: 'Service' })]);
  const before = store.get(K.library);
  assert.deepEqual(cs.listLibrary().map((i) => i.type), ['Amenity', 'Service', 'Service']);
  assert.equal(store.get(K.library), before);
});

test('saving an item stores the converted type', () => {
  put(K.library, [item('a', 'A', { type: 'Issue' })]);
  cs.updateLibraryItem('a', { nameEn: 'renamed' });
  assert.equal(get(K.library)[0].type, 'Service');
});

// ---- groups: several per item ------------------------------------------------------

test('items read their groups as a list; "All" or none means every group', () => {
  put(K.library, [item('a', 'A', { group: 'Kids' }), item('b', 'A', { group: 'All' }), item('c', 'A'), item('d', 'A', { groups: ['Kids', 'VIP'] })]);
  assert.deepEqual(cs.listLibrary().map((i) => i.groups), [['Kids'], [], [], ['Kids', 'VIP']]);
});

// ---- icons: custom SVG + missing icons ---------------------------------------------

test('itemsMissingIcon lists visible items with neither a library icon nor an uploaded one', () => {
  put(K.library, [
    item('a', 'A', { icon: 'bed' }),
    item('b', 'A', { iconSvg: 'data:image/svg+xml;base64,PHN2Zy8+' }),
    item('c', 'A'),
    item('d', 'A', { archived: true }),
    item('e', 'B'),
  ]);
  assert.deepEqual(ids(cs.itemsMissingIcon('A')), ['c']);
});

test('patient menu items carry the uploaded icon', () => {
  put(K.library, [item('a', 'A', { iconSvg: 'data:image/svg+xml;base64,PHN2Zy8+' })]);
  assert.equal(cs.listPatientMenu()[0].items[0].iconSvg, 'data:image/svg+xml;base64,PHN2Zy8+');
});
