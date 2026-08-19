import { useSyncExternalStore } from 'react';

/**
 * foodStore — in-memory data + menu logic for the Food Management feature.
 *
 * This is a demo/prototype store (no Supabase): a single module-level `db`
 * object with a tiny external-store subscription so any component can read it
 * with useFood() and mutate it with updateFood(draft => { ... }). Because the
 * whole thing is prototype data, updateFood deep-clones then applies an
 * imperative mutator — keeping ports of the original logic simple.
 */

export const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export const MEAL_SECTIONS: Record<string, string[]> = {
  Breakfast: ['Cereals', 'Eggs', 'Baked breads', 'Dairy', 'Drinks'],
  Lunch: ['Soup', 'Salad', 'Mains', 'Side orders', 'Dessert', 'Drinks'],
  Dinner: ['Soup', 'Salad', 'Mains', 'Side orders', 'Dessert', 'Drinks'],
};

// Per-section selection rule (min/max picks, served-to-all), read off the
// section's own library entry (db.sections) so it's configured once in
// Reference Lists and reused as the default everywhere that section is
// added to a menu set. Falls back to "choose one" if the section isn't in
// the library yet (e.g. a legacy section referenced only by old data).
export function sectionRule(db: any, sectionName: string): { min: number; max: number; forAll: boolean } {
  const s = db.sections.find((x: any) => x.en === sectionName);
  if (s && s.forAll) return { min: 0, max: 1, forAll: true };
  if (s) return { min: s.min ?? 1, max: s.max ?? 1, forAll: false };
  return { min: 1, max: 1, forAll: false };
}

function d(en: string, ar: string, section: string, allergens: string[]): any {
  return { en, ar, section, allergens, on: true };
}

function SEED(): any {
  return {
    allergens: ['Milk', 'Egg', 'Gluten', 'Nuts', 'Fish', 'Shellfish', 'Soy', 'Sesame', 'Peanut'],
    meals: ['Breakfast', 'Lunch', 'Dinner'],
    win: { serviceDay: 'Tomorrow only', open: '4:00 PM', close: '8:00 PM', sameAll: true, autoDefault: true, allowEdit: true },
    sections: [
      { en: 'Cereals', ar: 'حبوب الإفطار', on: true, min: 1, max: 1, forAll: false },
      { en: 'Eggs', ar: 'بيض', on: true, min: 1, max: 1, forAll: false },
      { en: 'Baked breads', ar: 'مخبوزات', on: true, min: 1, max: 1, forAll: false },
      { en: 'Dairy', ar: 'ألبان', on: true, min: 1, max: 1, forAll: false },
      { en: 'Soup', ar: 'شوربة', on: true, min: 1, max: 1, forAll: false },
      { en: 'Salad', ar: 'سلطة', on: true, min: 1, max: 1, forAll: false },
      { en: 'Mains', ar: 'الأطباق الرئيسية', on: true, min: 1, max: 1, forAll: false },
      { en: 'Side orders', ar: 'أطباق جانبية', on: true, min: 1, max: 1, forAll: false },
      { en: 'Dessert', ar: 'حلويات', on: true, min: 1, max: 1, forAll: false },
      { en: 'Drinks', ar: 'مشروبات', on: true, min: 0, max: 1, forAll: true },
    ],
    diets: [
      { en: 'Regular', ar: 'عادي', his: '577365', reg: true, on: true },
      { en: 'Diabetic', ar: 'سكري', his: '577365-DM', on: true },
      { en: 'Low sodium', ar: 'قليل الصوديوم', his: '577365-LS', on: true },
      { en: 'Low potassium', ar: 'قليل البوتاسيوم', his: '577365-LK', on: true },
      { en: 'Soft diet', ar: 'طعام طري', his: '577365-SOFT', on: true },
      { en: 'Chemotherapy', ar: 'علاج كيماوي', his: '577365-CH', on: true },
      { en: 'Kids', ar: 'أطفال', his: '577365-KD', on: true },
      { en: 'OB / maternity', ar: 'ولادة', his: '577365-OB', on: true },
    ],
    dishes: [
      d('Cornflakes', 'رقائق الذرة', 'Cereals', ['Gluten']),
      d('Bran flakes', 'رقائق النخالة', 'Cereals', ['Gluten']),
      d('Muesli', 'موسلي', 'Cereals', ['Gluten', 'Nuts']),
      d('Rice krispies', 'رقائق الأرز', 'Cereals', ['Gluten']),
      d('Boiled eggs', 'بيض مسلوق', 'Eggs', ['Egg']),
      d('Scrambled eggs', 'بيض مخفوق', 'Eggs', ['Egg', 'Milk']),
      d('Omelette', 'أومليت', 'Eggs', ['Egg']),
      d('Arabic bread', 'خبز عربي', 'Baked breads', ['Gluten']),
      d('Brown toast', 'توست أسمر', 'Baked breads', ['Gluten']),
      d('Croissant', 'كرواسون', 'Baked breads', ['Gluten', 'Milk', 'Egg']),
      d('Plain yogurt', 'زبادي سادة', 'Dairy', ['Milk']),
      d('Labneh', 'لبنة', 'Dairy', ['Milk']),
      d('Fruit yogurt', 'زبادي بالفواكه', 'Dairy', ['Milk']),
      d('Lentil soup', 'شوربة عدس', 'Soup', []),
      d('Vegetable soup', 'شوربة خضار', 'Soup', []),
      d('Chicken soup', 'شوربة دجاج', 'Soup', []),
      d('Garden salad', 'سلطة خضراء', 'Salad', []),
      d('Tabbouleh', 'تبولة', 'Salad', ['Gluten']),
      d('Fattoush', 'فتوش', 'Salad', ['Gluten']),
      d('Greek salad', 'سلطة يونانية', 'Salad', ['Milk']),
      d('Grilled chicken', 'دجاج مشوي', 'Mains', []),
      d('Baked fish', 'سمك بالفرن', 'Mains', ['Fish']),
      d('Beef stew', 'يخنة لحم', 'Mains', []),
      d('Vegetable biryani', 'برياني خضار', 'Mains', []),
      d('Steamed rice', 'أرز مطهو', 'Mains', []),
      d('Grilled salmon', 'سلمون مشوي', 'Mains', ['Fish']),
      d('Steamed vegetables', 'خضار مطهوة', 'Side orders', []),
      d('Mashed potato', 'بطاطس مهروسة', 'Side orders', ['Milk']),
      d('French fries', 'بطاطس مقلية', 'Side orders', []),
      d('Sauteed greens', 'خضار سوتيه', 'Side orders', []),
      d('Fruit salad', 'سلطة فواكه', 'Dessert', []),
      d('Sugar-free jelly', 'جيلي خالٍ من السكر', 'Dessert', []),
      d('Rice pudding', 'أرز بالحليب', 'Dessert', ['Milk']),
      d('Chocolate cake', 'كيكة شوكولاتة', 'Dessert', ['Gluten', 'Egg', 'Milk']),
      d('Water', 'ماء', 'Drinks', []),
      d('Orange juice', 'عصير برتقال', 'Drinks', []),
      d('Apple juice', 'عصير تفاح', 'Drinks', []),
      d('Laban', 'لبن', 'Drinks', ['Milk']),
      d('Arabic coffee', 'قهوة عربية', 'Drinks', []),
    ],
    sets: [
      { id: 'standard', name: 'Standard week', status: 'Published', sub: 'All 8 diets · breakfast, lunch, dinner · live since 1 Jun', edited: '2d ago', groups: ['Kids', 'Adults', 'VIP'], activeFrom: '2026-06-01', activeTo: '' },
      { id: 'ramadan', name: 'Ramadan 2026', status: 'Draft', sub: '8 diets · suhoor and iftar · not published yet', edited: '5h ago', groups: ['Kids', 'Adults', 'VIP'], activeFrom: '', activeTo: '' },
      { id: 'eid', name: 'Eid special', status: 'Scheduled', sub: '8 diets · 3 meals · starts 16 Jun', edited: '1w ago', groups: ['Kids', 'Adults', 'VIP'], activeFrom: '2026-06-16', activeTo: '' },
    ],
    patients: [
      { name: 'Ahmed Al-Salem', room: '312', bed: 'A', diet: 'Low sodium', allergies: [] },
      { name: 'Sara Hassan', room: '305', bed: 'B', diet: 'Diabetic', allergies: ['Nuts'] },
      { name: 'Khalid Al-Otaibi', room: '210', bed: 'A', diet: 'Soft diet', allergies: ['Milk'] },
      { name: 'Maryam Saleh', room: '418', bed: 'C', diet: 'Regular', allergies: ['Fish', 'Shellfish'] },
    ],
    orders: [
      {
        id: 'ORD-1042', name: 'Fatima Noor', room: '401', bed: 'A', diet: 'Diabetic', meal: 'Lunch', date: 'Today', time: '11:40', status: 'Submitted',
        lines: [['Soup', 'Vegetable soup'], ['Mains', 'Grilled chicken'], ['Mains', 'Steamed rice'], ['Dessert', 'Sugar-free jelly'], ['Drinks', 'Water']],
      },
      {
        id: 'ORD-1041', name: 'Omar Said', room: '208', bed: 'B', diet: 'Regular', meal: 'Lunch', date: 'Today', time: '11:22', status: 'Printed',
        lines: [['Soup', 'Lentil soup'], ['Mains', 'Beef stew'], ['Mains', 'Vegetable biryani'], ['Side orders', 'French fries'], ['Drinks', 'Orange juice']],
      },
    ],
  };
}

// Which dishes seed a section for a given diet (Diabetic desserts limited to sugar-free / fruit).
function dishesSeed(db: any, sn: string, diet: string): string[] {
  let l = db.dishes.filter((x: any) => x.section === sn && x.on);
  if (diet === 'Diabetic' && sn === 'Dessert') l = l.filter((x: any) => /sugar|fruit/i.test(x.en));
  return l.map((x: any) => x.en);
}

// Build the full menu tree: diet -> meal -> [ section config with per-day items + default ].
export function buildMenu(db: any): any {
  const m: any = {};
  db.diets.forEach((dt: any) => {
    m[dt.en] = {};
    db.meals.forEach((meal: string) => {
      m[dt.en][meal] = MEAL_SECTIONS[meal].map((sn) => {
        const r = sectionRule(db, sn);
        const items = dishesSeed(db, sn, dt.en);
        const days: any = {};
        DAYS.forEach((dy) => {
          days[dy] = { items: [...items], def: r.forAll ? null : items[0] || null };
        });
        return { sec: sn, min: r.min || 0, max: r.forAll ? null : r.max || 1, forAll: !!r.forAll, days };
      });
    });
  });
  return m;
}

export function initDB(): any {
  const db = SEED();
  db.sets.forEach((s: any) => {
    // Each menu set owns its own independent menu tree — editing one set
    // never touches another's dishes/rules, and a brand-new set truly starts
    // fresh. Likewise, which diets/meals a set covers is per-set (a "Kids
    // only" set might not need Chemotherapy), defaulting to everything.
    s.menu = buildMenu(db);
    s.diets = db.diets.map((dt: any) => dt.en);
    s.meals = [...db.meals];
  });
  return db;
}

// The menu set patients actually order from / kitchen actually serves —
// whichever set is Published, falling back to the first set if none are.
export function getLiveSet(db: any): any {
  return db.sets.find((s: any) => s.status === 'Published') || db.sets[0];
}

// Flatten a diet/meal/day into concrete sections + their items + default for
// that day. `menu` is a single set's menu tree (e.g. `someSet.menu`), not db.
export function resolve(menu: any, diet: string, meal: string, day: string): any[] {
  const base = menu[diet] && menu[diet][meal] ? menu[diet][meal] : menu['Regular'][meal];
  return base.map((s: any) => {
    const dd = s.days[day] || { items: [], def: null };
    return { ...s, items: dd.items, def: dd.def };
  });
}

export function ruleText(s: any): string {
  if (s.forAll) return 'Served to everyone';
  if (s.min >= 1 && s.max > 1) return 'Choose ' + s.max + ' · required';
  if (s.min >= 1 && s.max === 1) return 'Choose one · required';
  if (s.max > 1) return 'Choose up to ' + s.max;
  return 'Choose one · optional';
}

// ---- external store --------------------------------------------------------

let db: any = initDB();
let nextOrder = 1043;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return db;
}

/** Read the live db in a component (re-renders on change). */
export function useFood(): any {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Mutate the db: receives a deep clone to mutate imperatively, then commits. */
export function updateFood(fn: (draft: any) => void) {
  const next = structuredClone(db);
  fn(next);
  db = next;
  emit();
}

/** Reset all demo data back to the seed. */
export function resetFood() {
  db = initDB();
  nextOrder = 1043;
  emit();
}

/** Next order id (e.g. "ORD-1043"), auto-incrementing. */
export function nextOrderId(): string {
  return 'ORD-' + nextOrder++;
}
