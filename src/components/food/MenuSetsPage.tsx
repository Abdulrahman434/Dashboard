import { Fragment, useState } from 'react';
import {
  Plus, Copy, Eye, Settings, ClipboardList, ListTree,
  Clock, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, X, CheckCheck,
  Lightbulb, Rocket, Building2, Search, Check,
  AlertTriangle, Salad, Download, Upload, Filter, Pencil, Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useFood, updateFood, resolve, ruleText, DAYS, buildMenu, sectionRule,
} from './foodStore';
import {
  cx, Btn, Toggle, Chip, StatusBadge, Tag, Badge, Note, Metric, Stepper,
  MiniSeg, Card, CardHead, Bar, rowCls, ContextBar, FoodPage,
} from './foodAtoms';
import { MultiSelectDropdown, SingleSelectDropdown } from '../UnifiedDropdown';

const GROUP_OPTIONS = ['Kids', 'Adults', 'VIP'];
const PER_PAGE = 10;
const DAY_LABELS: Record<string, string> = {
  Sat: 'Saturday', Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday',
};
const SECTION_DOT: Record<string, string> = {
  Mains: '#4EBEE3', 'Side orders': '#8b5cf6', Dessert: '#ec4899', Soup: '#22c55e', Salad: '#eab308', Drinks: '#0ea5e9',
  Cereals: '#f97316', Eggs: '#f59e0b', 'Baked breads': '#a855f7', Dairy: '#06b6d4',
};

function groupsLabel(groups: string[] | undefined): string {
  const g = groups || [];
  if (g.length === GROUP_OPTIONS.length) return 'All Groups';
  if (g.length > 0) return g.join(', ');
  return 'No Groups';
}

export default function MenuSetsPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db: any = useFood();

  const [sub, setSub] = useState<'list' | 'overview' | 'wizard'>('list');
  const [setId, setSetId] = useState('standard');
  const [step, setStep] = useState(1);
  const [ctx, setCtx] = useState<{ diet: string; meal: string; day: string }>({ diet: 'Regular', meal: 'Lunch', day: 'Wed' });
  const [applyTargets, setApplyTargets] = useState<Record<string, boolean> | null>(null);
  const [applyDays, setApplyDays] = useState<Record<string, boolean> | null>(null);
  const [applyMode, setApplyMode] = useState<'days' | 'diets'>('days');

  // Items table state (step 4)
  const [page, setPage] = useState(1);
  const [addingRow, setAddingRow] = useState(false);
  const [draft, setDraft] = useState<{ day: string; meal: string; diet: string; item: string }>({ day: DAYS[0], meal: '', diet: '', item: '' });
  const [editRuleKey, setEditRuleKey] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDay, setFilterDay] = useState('All');
  const [filterMeal, setFilterMeal] = useState('All');
  const [filterDiet, setFilterDiet] = useState('All');

  const onCtx = (key: string, val: string) => {
    setCtx((c) => ({ ...c, [key]: val }));
  };

  // Every menu set owns its own independent menu tree — this is the one
  // currently open in Overview/Wizard. All reads/writes below are scoped to
  // it via setId, so editing one set never touches another's dishes/rules.
  const currentSet = db.sets.find((x: any) => x.id === setId) || db.sets[0];
  const currentMenu = currentSet.menu;

  // Patch top-level fields (name, groups, dates, …) on the set being edited.
  const patchSet = (fields: Record<string, any>) => {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      Object.assign(dSet, fields);
    });
  };

  // ---- navigation helpers ----
  const openWizard = (s: number) => { setStep(s); setSub('wizard'); };

  function createSet() {
    const id = 'set' + Date.now();
    updateFood((d: any) => {
      d.sets.unshift({
        id,
        name: 'New menu set',
        status: 'Draft',
        sub: 'not published yet',
        edited: 'just now',
        groups: [...GROUP_OPTIONS],
        activeFrom: '',
        activeTo: '',
        diets: d.diets.map((dt: any) => dt.en),
        meals: [...d.meals],
        menu: buildMenu(d),
      });
    });
    setSetId(id);
    setStep(1);
    setSub('wizard');
  }

  // ============================================================
  // SETS LIST
  // ============================================================
  function viewSets() {
    return (
      <Card>
        <CardHead
          title="Menu sets"
          sub={`${db.sets.length} sets`}
          right={
            <Btn variant="primary" onClick={createSet}>
              <Plus size={16} /> Create menu set
            </Btn>
          }
        />
        <div className="flex gap-2.5 px-5 py-3.5">
          <Tag><Building2 size={14} /> Fakeeh Hospital</Tag>
          <div className="flex-1 flex items-center gap-2 h-[34px] px-3 border border-[#e7e9f0] rounded-[10px] text-[13px] text-[#9099ab]">
            <Search size={14} /> Search menu sets
          </div>
        </div>
        {db.sets.map((s: any) => (
          <div key={s.id} className={cx(rowCls, 'cursor-pointer')} onClick={() => { setSetId(s.id); setSub('overview'); }}>
            <div className="flex-1">
              <div className="font-medium text-[#19233a]">{s.name}</div>
              <div className="text-[13px] text-[#5d6678]">{s.sub}</div>
            </div>
            <StatusBadge status={s.status} />
            <div className="text-[12px] text-[#5d6678] text-right" style={{ width: 70 }}>{s.edited}</div>
          </div>
        ))}
        <Bar>
          <Copy size={16} className="text-[#9099ab]" />
          <span className="text-[13px] text-[#5d6678]">Duplicate a published set to start next season in seconds.</span>
        </Bar>
      </Card>
    );
  }

  // ============================================================
  // SET OVERVIEW
  // ============================================================
  function dupSet() {
    const id = 'dup' + Date.now();
    updateFood((d: any) => {
      const source = d.sets.find((s: any) => s.id === setId) || d.sets[0];
      d.sets.unshift({
        ...structuredClone(source),
        id,
        name: `${source.name} (copy)`,
        status: 'Draft',
        sub: 'Duplicated · edit and publish',
        edited: 'just now',
      });
    });
    setSetId(id);
    setSub('overview');
    toast('Menu set duplicated');
  }

  function viewSetOverview() {
    const set = currentSet;

    const rows = [
      { icon: Settings, name: 'Basics', sub: `${set.name}${set.activeFrom ? ' · active from ' + set.activeFrom : ' · no active date set'}`, step: 1 },
      { icon: ClipboardList, name: 'Diets and meals', sub: `${(set.diets || []).length} conditions · ${(set.meals || []).join(', ')}`, step: 2 },
      { icon: ListTree, name: 'Sections, items and defaults', sub: 'Add sections, set rules, and choose dishes per day', step: 4 },
      { icon: Clock, name: 'Ordering window', sub: `Opens ${db.win.open}, closes ${db.win.close}`, step: 6 },
      {
        icon: CheckCircle2,
        name: 'Review and publish',
        sub: set.status === 'Published' ? 'Published · all sections valid' : 'Not published yet',
        step: 7,
        badge: set.status === 'Published' ? 'Live' : set.status,
      },
    ];

    return (
      <Card>
        <CardHead
          back={{ label: 'Menu sets', onClick: () => setSub('list') }}
          title={<>{set.name} <StatusBadge status={set.status} /></>}
          sub={`${groupsLabel(set.groups)} · edited ${set.edited}`}
          right={
            <>
              <Btn variant="neutral" onClick={dupSet}><Copy size={16} /> Duplicate</Btn>
              <Btn variant="accent" onClick={() => onNavigate('food-kiosk')}><Eye size={16} /> Preview</Btn>
            </>
          }
        />
        <div className="grid grid-cols-4 gap-3 p-5">
          <Metric label="Diets" value={(set.diets || []).length} />
          <Metric label="Meals" value={(set.meals || []).length} />
          <Metric label="Sections" value={currentMenu.Regular.Lunch.length} />
          <Metric label="Dishes" value={db.dishes.length} />
        </div>
        <div className="px-5 py-2 text-[12px] text-[#9099ab] uppercase tracking-wide">Setup — tap any area to edit</div>
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className={cx(rowCls, 'cursor-pointer')} onClick={() => openWizard(r.step)}>
              <div
                className="flex items-center justify-center rounded-[8px] bg-[#f7f8fb]"
                style={{ width: 34, height: 34 }}
              >
                <Icon size={17} className="text-[#5d6678]" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-[#19233a]">{r.name}</div>
                <div className="text-[13px] text-[#5d6678]">{r.sub}</div>
              </div>
              {r.badge ? <StatusBadge status={r.badge} /> : <ChevronRight size={18} className="text-[#9099ab]" />}
            </div>
          );
        })}
      </Card>
    );
  }

  // ============================================================
  // WIZARD — step handlers
  // ============================================================
  // Items table mutators (step 4) — all address a section by its name within
  // a given diet+meal, not by array index, so they stay correct even as rows
  // move between days/meals/diets and sections get created on first use.
  function ensureSection(dSet: any, diet: string, meal: string, sectionName: string, refDb: any): any {
    const cfg = dSet.menu[diet][meal];
    let sec = cfg.find((s: any) => s.sec === sectionName);
    if (!sec) {
      const days: any = {};
      DAYS.forEach((dy: string) => { days[dy] = { items: [], def: null }; });
      const r = sectionRule(refDb, sectionName);
      sec = { sec: sectionName, min: r.min, max: r.max, forAll: r.forAll, days };
      cfg.push(sec);
    }
    return sec;
  }

  function addRowItem(diet: string, meal: string, day: string, en: string) {
    const dish = db.dishes.find((x: any) => x.en === en);
    if (!dish) return;
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const sec = ensureSection(dSet, diet, meal, dish.section, d);
      if (!sec.days[day].items.includes(en)) sec.days[day].items.push(en);
    });
  }

  function moveRowItem(en: string, from: { diet: string; meal: string; day: string }, to: { diet: string; meal: string; day: string }) {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const dish = d.dishes.find((x: any) => x.en === en);
      if (!dish) return;
      const srcCfg = dSet.menu[from.diet]?.[from.meal];
      const srcSec = srcCfg?.find((s: any) => s.sec === dish.section);
      if (srcSec && srcSec.days[from.day]) {
        const idx = srcSec.days[from.day].items.indexOf(en);
        if (idx >= 0) srcSec.days[from.day].items.splice(idx, 1);
        if (srcSec.days[from.day].def === en) srcSec.days[from.day].def = null;
      }
      const dstSec = ensureSection(dSet, to.diet, to.meal, dish.section, d);
      if (!dstSec.days[to.day].items.includes(en)) dstSec.days[to.day].items.push(en);
    });
  }

  function setRowDefault(diet: string, meal: string, section: string, day: string, en: string, on: boolean) {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const sec = dSet.menu[diet][meal].find((s: any) => s.sec === section);
      if (!sec) return;
      const dc = sec.days[day];
      if (on) dc.def = en;
      else if (dc.def === en) dc.def = null;
    });
  }

  function deleteRowItem(diet: string, meal: string, section: string, day: string, en: string) {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const sec = dSet.menu[diet][meal].find((s: any) => s.sec === section);
      if (!sec) return;
      const dc = sec.days[day];
      const idx = dc.items.indexOf(en);
      if (idx >= 0) dc.items.splice(idx, 1);
      if (dc.def === en) dc.def = null;
    });
  }

  function setSectionRule(diet: string, meal: string, section: string, patch: Record<string, any>) {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const sec = dSet.menu[diet][meal].find((s: any) => s.sec === section);
      if (!sec) return;
      Object.assign(sec, patch);
    });
  }

  function flattenRows() {
    const rows: any[] = [];
    (currentSet.diets || []).forEach((diet: string) => {
      (currentSet.meals || []).forEach((meal: string) => {
        const cfg = currentMenu[diet]?.[meal] || [];
        cfg.forEach((sec: any) => {
          DAYS.forEach((day: string) => {
            const dc = sec.days[day];
            (dc?.items || []).forEach((en: string) => {
              rows.push({ diet, meal, day, section: sec.sec, item: en, isDefault: dc.def === en, rule: sec });
            });
          });
        });
      });
    });
    return rows;
  }

  function exportMenuToCSV() {
    const headers = ['Day', 'Meal Type', 'Diet', 'Section', 'Food Item', 'Default'];
    const rows = [headers];
    const diets = db.diets.map((d: any) => d.en);
    const meals = db.meals;

    diets.forEach((diet: string) => {
      meals.forEach((meal: string) => {
        const cfg = currentMenu[diet]?.[meal] || [];
        cfg.forEach((sec: any) => {
          DAYS.forEach((day: string) => {
            const dc = sec.days?.[day];
            if (dc && dc.items) {
              dc.items.forEach((item: string) => {
                const isDefault = dc.def === item ? 'Yes' : 'No';
                const escapedItem = item.includes(',') || item.includes('"') 
                  ? `"${item.replace(/"/g, '""')}"` 
                  : item;
                const escapedSection = sec.sec.includes(',') || sec.sec.includes('"') 
                  ? `"${sec.sec.replace(/"/g, '""')}"` 
                  : sec.sec;
                rows.push([day, meal, diet, escapedSection, escapedItem, isDefault]);
              });
            }
          });
        });
      });
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${db.sets.find((x: any) => x.id === setId)?.name || 'menu_set'}_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Menu exported successfully');
  }

  function importMenuFromCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = parseCSV(text);
      if (lines.length < 2) {
        toast.error('Invalid or empty CSV file');
        return;
      }

      const header = lines[0].map(h => h.trim().toLowerCase());
      const expected = ['day', 'meal type', 'diet', 'section', 'food item', 'default'];
      const matchesHeader = expected.every((val, idx) => header[idx] === val);

      if (!matchesHeader) {
        toast.error('CSV headers must match: Day, Meal Type, Diet, Section, Food Item, Default');
        return;
      }

      updateFood((d: any) => {
        const dSet = d.sets.find((s: any) => s.id === setId);
        const clearedKeys = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          if (row.length < 5) continue;

          const day = row[0];
          const mealType = row[1];
          const diet = row[2];
          const section = row[3];
          const foodItem = row[4];
          const isDefaultVal = row[5] || 'No';

          const dishExists = d.dishes.some((x: any) => x.en.toLowerCase() === foodItem.toLowerCase());
          if (!dishExists) {
            continue;
          }

          if (!DAYS.includes(day as any)) continue;
          if (!d.meals.includes(mealType)) continue;
          if (!d.diets.some((dt: any) => dt.en === diet)) continue;

          const sectionExists = d.sections.some((x: any) => x.en.toLowerCase() === section.toLowerCase());
          if (!sectionExists) continue;

          if (!dSet.menu[diet]) dSet.menu[diet] = {};
          if (!dSet.menu[diet][mealType]) dSet.menu[diet][mealType] = [];

          const cfg = dSet.menu[diet][mealType];
          let sec = cfg.find((x: any) => x.sec.toLowerCase() === section.toLowerCase());
          
          if (!sec) {
            const actualSectionName = d.sections.find((x: any) => x.en.toLowerCase() === section.toLowerCase())?.en || section;
            const daysObj: any = {};
            DAYS.forEach((dy) => {
              daysObj[dy] = { items: [], def: null };
            });
            const r = sectionRule(d, actualSectionName);
            sec = { sec: actualSectionName, min: r.min, max: r.max, forAll: r.forAll, days: daysObj };
            cfg.push(sec);
          }

          const key = `${diet}|${mealType}|${day}|${sec.sec}`;
          if (!clearedKeys.has(key)) {
            clearedKeys.add(key);
            if (sec.days && sec.days[day]) {
              sec.days[day].items = [];
              sec.days[day].def = null;
            }
          }

          if (sec.days && sec.days[day]) {
            const actualItemName = d.dishes.find((x: any) => x.en.toLowerCase() === foodItem.toLowerCase())?.en || foodItem;
            if (!sec.days[day].items.includes(actualItemName)) {
              sec.days[day].items.push(actualItemName);
            }
            if (isDefaultVal.trim().toLowerCase() === 'yes') {
              sec.days[day].def = actualItemName;
            }
          }
        }
      });

      toast.success('Menu imported successfully');
      e.target.value = '';
    };

    reader.readAsText(file);
  }

  function applyAcrossDays() {
    let n = 0;
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const cfg = dSet.menu[ctx.diet][ctx.meal];
      DAYS.forEach((dy: string) => {
        if (dy === ctx.day || !applyDays?.[dy]) return;
        n++;
        cfg.forEach((s: any) => { s.days[dy] = structuredClone(s.days[ctx.day]); });
      });
    });
    toast(`Copied ${ctx.day} items to ${n} days`);
  }

  function applyAcross() {
    let n = 0;
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      d.diets.forEach((dt: any) => {
        if (dt.en === ctx.diet || !applyTargets?.[dt.en]) return;
        n++;
        dSet.menu[dt.en][ctx.meal] = structuredClone(dSet.menu[ctx.diet][ctx.meal]);
      });
    });
    toast(`Copied ${ctx.diet} setup to ${n} diets`);
  }

  function publishSet() {
    updateFood((d: any) => {
      const s = d.sets.find((x: any) => x.id === setId);
      if (s) s.status = 'Published';
    });
    setSub('overview');
    toast('Published to bedside');
  }

  // ---- validation for review step ----
  // Checks every diet/meal/day in THIS set's menu — not a fixed 'Regular'
  // diet — so publishing catches gaps anywhere in the set being reviewed.
  function computeBad() {
    const bad: string[] = [];
    const activeDiets = db.diets.filter((dt: any) => (currentSet.diets || []).includes(dt.en));
    const activeMeals = (currentSet.meals || []).length ? currentSet.meals : db.meals;
    activeDiets.forEach((dt: any) => {
      activeMeals.forEach((meal: string) => {
        DAYS.forEach((day: string) => {
          resolve(currentMenu, dt.en, meal, day).forEach((s: any) => {
            if (!s.forAll && s.min > 0) {
              const cnt = s.items.filter((en: string) => {
                const dd = db.dishes.find((z: any) => z.en === en);
                return dd && dd.on;
              }).length;
              if (cnt < s.min) bad.push(`${dt.en} · ${day} ${meal} · ${s.sec}`);
            }
          });
        });
      });
    });
    return bad;
  }

  // ============================================================
  // WIZARD steps content
  // ============================================================
  const STEP_TITLES: Record<number, string> = {
    1: 'Basics',
    2: 'Diets and meals',
    4: 'Sections, items and defaults',
    5: 'Apply across',
    6: 'Ordering window',
    7: 'Review and publish',
  };

  const textInputCls = 'w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors text-[14px] text-[#19233a] bg-white';

  function step1() {
    return (
      <div className="p-5 flex flex-col gap-3.5 !overflow-visible">
        <div>
          <div className="text-[12px] text-[#5d6678] mb-1.5">Menu set name</div>
          <input
            className={textInputCls}
            value={currentSet.name}
            onChange={(e) => patchSet({ name: e.target.value })}
            placeholder="e.g. Standard week"
          />
        </div>
        <div>
          <div className="text-[12px] text-[#5d6678] mb-1.5">Groups</div>
          <MultiSelectDropdown
            options={GROUP_OPTIONS}
            selectedValues={currentSet.groups || []}
            onChange={(vals: string[]) => patchSet({ groups: vals })}
            placeholder="Select groups"
          />
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="text-[12px] text-[#5d6678] mb-1.5">Active from</div>
            <input
              type="date"
              className={textInputCls}
              value={currentSet.activeFrom || ''}
              onChange={(e) => patchSet({ activeFrom: e.target.value })}
            />
          </div>
          <div>
            <div className="text-[12px] text-[#5d6678] mb-1.5">Active to</div>
            <input
              type="date"
              className={textInputCls}
              value={currentSet.activeTo || ''}
              onChange={(e) => patchSet({ activeTo: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  function toggleSetDiet(en: string) {
    const list: string[] = currentSet.diets || [];
    const on = list.includes(en);
    if (on && list.length <= 1) {
      toast('A menu set needs at least one diet');
      return;
    }
    patchSet({ diets: on ? list.filter((x) => x !== en) : [...list, en] });
    if (on && ctx.diet === en) {
      const next = (currentSet.diets || []).find((x: string) => x !== en);
      if (next) onCtx('diet', next);
    }
  }

  function toggleSetMeal(m: string) {
    const list: string[] = currentSet.meals || [];
    const on = list.includes(m);
    if (on && list.length <= 1) {
      toast('A menu set needs at least one meal');
      return;
    }
    patchSet({ meals: on ? list.filter((x) => x !== m) : [...list, m] });
    if (on && ctx.meal === m) {
      const next = (currentSet.meals || []).find((x: string) => x !== m);
      if (next) onCtx('meal', next);
    }
  }

  function step2() {
    const selDiets: string[] = currentSet.diets || [];
    const selMeals: string[] = currentSet.meals || [];
    return (
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-2.5">
          <div className="font-medium text-[#16274D]">Diet conditions</div>
          <div className="text-[13px] text-[#5d6678]">{selDiets.length} selected</div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {db.diets.map((dt: any) => (
            <Chip key={dt.en} on={selDiets.includes(dt.en)} square checkbox onClick={() => toggleSetDiet(dt.en)}>
              {dt.en}
            </Chip>
          ))}
        </div>
        <div className="font-medium text-[#16274D] mt-5 mb-2.5">Meal types</div>
        <div className="grid grid-cols-3 gap-2.5">
          {db.meals.map((m: string) => (
            <Chip key={m} on={selMeals.includes(m)} square checkbox onClick={() => toggleSetMeal(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  function step4() {
    const dietOptions: string[] = currentSet.diets || [];
    const mealOptions: string[] = currentSet.meals || [];
    const allRows = flattenRows();
    const rows = allRows.filter((r) =>
      (filterDay === 'All' || r.day === filterDay)
      && (filterMeal === 'All' || r.meal === filterMeal)
      && (filterDiet === 'All' || r.diet === filterDiet)
    );
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const pageSafe = Math.min(page, totalPages);
    const pageRows = rows.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);
    const ruleKey = (r: any) => `${r.diet}|${r.meal}|${r.section}`;
    const dayFromLabel = (label: string) => Object.keys(DAY_LABELS).find((k) => DAY_LABELS[k] === label);
    const filtersActive = filterDay !== 'All' || filterMeal !== 'All' || filterDiet !== 'All';

    return (
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e7e9f0]">
          <div>
            <div className="font-medium text-[#19233a]">Menu items</div>
            <div className="text-[13px] text-[#5d6678]">Manage the menu items served for each day</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn
              variant="primary"
              onClick={() => {
                setDraft({
                  day: filterDay !== 'All' ? filterDay : DAYS[0],
                  meal: filterMeal !== 'All' ? filterMeal : (mealOptions[0] || ''),
                  diet: filterDiet !== 'All' ? filterDiet : (dietOptions[0] || ''),
                  item: '',
                });
                setAddingRow(true);
              }}
            >
              <Plus size={15} /> Add Row
            </Btn>
            <Btn variant="neutral">
              Bulk Actions <ChevronDown size={14} />
            </Btn>
            <button
              type="button"
              className={cx(
                'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border bg-white hover:bg-[#f7f8fb]',
                filtersActive ? 'border-[#4EBEE3] text-[#1d7da3]' : 'border-[#d6dae6] text-[#5d6678]',
              )}
              aria-label="Filter"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={15} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-[#f7f8fb] border-t border-[#e7e9f0]">
            <div className="w-[150px]">
              <SingleSelectDropdown
                options={['All', ...DAYS.map((dy) => DAY_LABELS[dy])]}
                value={filterDay === 'All' ? 'All' : DAY_LABELS[filterDay]}
                onChange={(v: string) => { setFilterDay(v === 'All' ? 'All' : (dayFromLabel(v) || 'All')); setPage(1); }}
              />
            </div>
            <div className="w-[130px]">
              <SingleSelectDropdown
                options={['All', ...mealOptions]}
                value={filterMeal}
                onChange={(v: string) => { setFilterMeal(v); setPage(1); }}
              />
            </div>
            <div className="w-[150px]">
              <SingleSelectDropdown
                options={['All', ...dietOptions]}
                value={filterDiet}
                onChange={(v: string) => { setFilterDiet(v); setPage(1); }}
              />
            </div>
            {filtersActive && (
              <button
                type="button"
                className="text-[13px] text-[#5d6678] hover:text-[#16274D]"
                onClick={() => { setFilterDay('All'); setFilterMeal('All'); setFilterDiet('All'); setPage(1); }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {total === 0 && !addingRow ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#9099ab] border-t border-[#e7e9f0]">
            <Salad size={28} />
            <div className="text-[13px]">No menu items yet — add a row to get started.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] text-[#9099ab] border-t border-b border-[#e7e9f0] bg-[#f7f8fb]">
                  <th className="px-5 py-2.5 font-medium">Day</th>
                  <th className="px-3 py-2.5 font-medium">Meal Type</th>
                  <th className="px-3 py-2.5 font-medium">Diet</th>
                  <th className="px-3 py-2.5 font-medium">Meal Item</th>
                  <th className="px-3 py-2.5 font-medium">Section</th>
                  <th className="px-3 py-2.5 font-medium">Allergies</th>
                  <th className="px-3 py-2.5 font-medium">Default?</th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addingRow && (
                  <tr className="border-b border-[#e7e9f0] bg-[#eaf7fc]">
                    <td className="px-5 py-2.5">
                      <div className="w-[130px]">
                        <SingleSelectDropdown
                          options={DAYS.map((dy) => DAY_LABELS[dy])}
                          value={DAY_LABELS[draft.day]}
                          onChange={(v: string) => setDraft((p) => ({ ...p, day: dayFromLabel(v) || p.day }))}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="w-[110px]">
                        <SingleSelectDropdown options={mealOptions} value={draft.meal} onChange={(v: string) => setDraft((p) => ({ ...p, meal: v }))} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="w-[130px]">
                        <SingleSelectDropdown options={dietOptions} value={draft.diet} onChange={(v: string) => setDraft((p) => ({ ...p, diet: v }))} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5" colSpan={2}>
                      <div className="w-[220px]">
                        <SingleSelectDropdown
                          options={db.dishes.map((x: any) => x.en)}
                          value={draft.item}
                          onChange={(v: string) => setDraft((p) => ({ ...p, item: v }))}
                          placeholder="Choose a dish…"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[#9099ab]">—</td>
                    <td className="px-3 py-2.5 text-[#9099ab]">—</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Btn
                          variant="primary"
                          className="!h-[30px] !px-2.5 !text-[12px]"
                          onClick={() => {
                            if (!draft.item || !draft.diet || !draft.meal) {
                              toast.error('Pick day, meal type, diet and a dish');
                              return;
                            }
                            addRowItem(draft.diet, draft.meal, draft.day, draft.item);
                            setAddingRow(false);
                          }}
                        >
                          Save
                        </Btn>
                        <button type="button" className="p-1.5 rounded hover:bg-white text-[#9099ab]" onClick={() => setAddingRow(false)} aria-label="Cancel">
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {pageRows.map((r) => {
                  const dish = db.dishes.find((x: any) => x.en === r.item);
                  const allergen = dish?.allergens?.[0];
                  const key = `${r.diet}|${r.meal}|${r.day}|${r.section}|${r.item}`;
                  return (
                    <Fragment key={key}>
                      <tr className="border-b border-[#e7e9f0] hover:bg-[#f7f8fb]">
                        <td className="px-5 py-2.5">
                          <div className="w-[130px]">
                            <SingleSelectDropdown
                              options={DAYS.map((dy) => DAY_LABELS[dy])}
                              value={DAY_LABELS[r.day]}
                              onChange={(v: string) => {
                                const nd = dayFromLabel(v);
                                if (nd && nd !== r.day) moveRowItem(r.item, { diet: r.diet, meal: r.meal, day: r.day }, { diet: r.diet, meal: r.meal, day: nd });
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="w-[110px]">
                            <SingleSelectDropdown
                              options={mealOptions}
                              value={r.meal}
                              onChange={(v: string) => { if (v !== r.meal) moveRowItem(r.item, { diet: r.diet, meal: r.meal, day: r.day }, { diet: r.diet, meal: v, day: r.day }); }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="w-[130px]">
                            <SingleSelectDropdown
                              options={dietOptions}
                              value={r.diet}
                              onChange={(v: string) => { if (v !== r.diet) moveRowItem(r.item, { diet: r.diet, meal: r.meal, day: r.day }, { diet: v, meal: r.meal, day: r.day }); }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[34px] h-[34px] rounded-[8px] bg-[#f7f8fb] flex items-center justify-center flex-shrink-0">
                              <Salad size={16} className="text-[#9099ab]" />
                            </div>
                            <span className="text-[#19233a]">{r.item}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-[#5d6678]">
                            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: SECTION_DOT[r.section] || '#9099ab' }} />
                            {r.section}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {allergen ? <Badge tone="warn">{allergen}</Badge> : <Badge tone="ok">None</Badge>}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Toggle on={r.isDefault} onClick={() => setRowDefault(r.diet, r.meal, r.section, r.day, r.item, !r.isDefault)} />
                            <span className="text-[13px] text-[#5d6678]">{r.isDefault ? 'Yes' : 'No'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-[#eaf7fc] text-[#5d6678]"
                              onClick={() => setEditRuleKey(editRuleKey === ruleKey(r) ? null : ruleKey(r))}
                              aria-label="Edit rule"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-[#fcebe9] text-[#c0392b]"
                              onClick={() => deleteRowItem(r.diet, r.meal, r.section, r.day, r.item)}
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editRuleKey === ruleKey(r) && (
                        <tr className="bg-[#f7f8fb] border-b border-[#e7e9f0]">
                          <td colSpan={8} className="px-5 py-3">
                            <div className="flex flex-wrap items-center gap-3.5">
                              <span className="text-[13px] font-medium text-[#16274D]">Rule for {r.section} ({r.diet} · {r.meal})</span>
                              <MiniSeg
                                options={[
                                  { value: 'choice', label: 'Patient choice' },
                                  { value: 'all', label: 'Served to all' },
                                ]}
                                value={r.rule.forAll ? 'all' : 'choice'}
                                onChange={(v: string) => setSectionRule(r.diet, r.meal, r.section, { forAll: v === 'all' })}
                              />
                              {!r.rule.forAll && (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] text-[#5d6678]">Min</span>
                                    <Stepper
                                      value={r.rule.min}
                                      onDec={() => setSectionRule(r.diet, r.meal, r.section, { min: Math.max(0, Math.min(r.rule.max || 1, r.rule.min - 1)) })}
                                      onInc={() => setSectionRule(r.diet, r.meal, r.section, { min: Math.max(0, Math.min(r.rule.max || 1, r.rule.min + 1)) })}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] text-[#5d6678]">Max</span>
                                    <Stepper
                                      value={r.rule.max}
                                      onDec={() => setSectionRule(r.diet, r.meal, r.section, { max: Math.max(1, r.rule.max - 1) })}
                                      onInc={() => setSectionRule(r.diet, r.meal, r.section, { max: Math.min(5, r.rule.max + 1) })}
                                    />
                                  </div>
                                </>
                              )}
                              <span className="text-[13px] text-[#5d6678]">{ruleText(r.rule)}</span>
                              <button type="button" className="ml-auto text-[13px] text-[#5d6678] hover:text-[#16274D]" onClick={() => setEditRuleKey(null)}>
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <Bar>
            <span className="text-[13px] text-[#5d6678]">
              Showing {(pageSafe - 1) * PER_PAGE + 1} to {Math.min(pageSafe * PER_PAGE, total)} of {total} items
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage(pageSafe - 1)}
                className="w-[30px] h-[30px] rounded-[8px] border border-[#d6dae6] bg-white disabled:opacity-40 flex items-center justify-center"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[13px] px-2">{pageSafe} / {totalPages}</span>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage(pageSafe + 1)}
                className="w-[30px] h-[30px] rounded-[8px] border border-[#d6dae6] bg-white disabled:opacity-40 flex items-center justify-center"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </Bar>
        )}
      </div>
    );
  }

  function step5() {
    // lazy init
    if (applyTargets === null) {
      const t: Record<string, boolean> = {};
      db.diets.forEach((dt: any) => { t[dt.en] = true; });
      setApplyTargets(t);
    }
    if (applyDays === null) {
      const t: Record<string, boolean> = {};
      DAYS.forEach((dy: string) => { t[dy] = dy !== ctx.day; });
      setApplyDays(t);
    }
    const at = applyTargets || {};
    const ad = applyDays || {};

    const nDays = DAYS.filter((dy: string) => dy !== ctx.day && ad[dy]).length;
    const nDiets = db.diets.filter((dt: any) => dt.en !== ctx.diet && at[dt.en]).length;

    return (
      <div>
        <ContextBar withDay ctx={ctx} onCtx={onCtx} db={db} diets={currentSet.diets} meals={currentSet.meals} />
        <div className="p-5">
          <MiniSeg
            options={[
              { value: 'days', label: 'Across days' },
              { value: 'diets', label: 'Across diets' },
            ]}
            value={applyMode}
            onChange={(v: string) => setApplyMode(v as any)}
          />

          {applyMode === 'days' ? (
            <>
              <div className="mt-4">
                <Note icon={<Copy size={16} />}>
                  Copies the dishes set for <b>{ctx.diet} · {ctx.meal} · {ctx.day}</b> into the other days you tick. Rules stay shared.
                </Note>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                {DAYS.map((dy: string) => {
                  const isSource = dy === ctx.day;
                  return (
                    <div key={dy} style={isSource ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
                      <Chip
                        on={isSource ? true : !!ad[dy]}
                        square
                        checkbox
                        onClick={isSource ? undefined : () => setApplyDays((p) => ({ ...(p || {}), [dy]: !(p || {})[dy] }))}
                      >
                        {dy}{isSource ? ' · source' : ''}
                      </Chip>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Note tone="warn" icon={<Lightbulb size={16} />}>
                  Only the genuinely different days need hand-editing — copy the repeats, then tweak the exceptions.
                </Note>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4">
                <Note icon={<Copy size={16} />}>
                  Copies the whole <b>{ctx.diet} · {ctx.meal}</b> setup — rules and all seven days — into the diets you tick.
                </Note>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                {db.diets.map((dt: any) => {
                  const isSource = dt.en === ctx.diet;
                  return (
                    <div key={dt.en} style={isSource ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
                      <Chip
                        on={isSource ? true : !!at[dt.en]}
                        square
                        checkbox
                        onClick={isSource ? undefined : () => setApplyTargets((p) => ({ ...(p || {}), [dt.en]: !(p || {})[dt.en] }))}
                      >
                        {dt.en}{isSource ? ' · source' : ''}
                      </Chip>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <Bar>
          <span className="text-[13px] text-[#5d6678]">
            {applyMode === 'days'
              ? `Will update ${DAYS.filter((dy: string) => dy !== ctx.day && (applyDays || {})[dy]).length} days`
              : `Will update ${db.diets.filter((dt: any) => dt.en !== ctx.diet && (applyTargets || {})[dt.en]).length} diets`}
          </span>
          <Btn variant="accent" onClick={applyMode === 'days' ? applyAcrossDays : applyAcross}>
            <CheckCheck size={16} /> Apply
          </Btn>
        </Bar>
      </div>
    );
  }

  function step6() {
    const serviceDayOptions = [
      'Tomorrow only',
      'Whole week starting Sunday',
      'Whole week starting Monday',
      'Whole week starting Tuesday',
      'Whole week starting Wednesday',
      'Whole week starting Thursday',
      'Whole week starting Friday',
      'Whole week starting Saturday',
    ];

    const rows: any[] = [
      {
        name: 'Order for',
        desc: 'Which service day this covers',
        right: (
          <div className="w-[240px]">
            <SingleSelectDropdown
              options={serviceDayOptions}
              value={db.win.serviceDay || 'Tomorrow only'}
              onChange={(v: string) => updateFood((d: any) => { d.win.serviceDay = v; })}
            />
          </div>
        ),
      },
      {
        name: 'Opens',
        desc: 'When the ordering window opens',
        right: (
          <input
            type="time"
            value={db.win.open}
            onChange={(e) => updateFood((d: any) => { d.win.open = e.target.value; })}
            className="h-[36px] px-3 border border-[#d6dae6] rounded-[8px] text-[13.5px] text-[#19233a] focus:outline-none focus:border-[#1d7da3] bg-white cursor-pointer"
          />
        ),
      },
      {
        name: 'Closes (cutoff)',
        desc: 'Last moment to place or edit',
        right: (
          <input
            type="time"
            value={db.win.close}
            onChange={(e) => updateFood((d: any) => { d.win.close = e.target.value; })}
            className="h-[36px] px-3 border border-[#d6dae6] rounded-[8px] text-[13.5px] text-[#19233a] focus:outline-none focus:border-[#1d7da3] bg-white cursor-pointer"
          />
        ),
      },
      { name: 'Auto-fill default if no order', desc: 'Fall back to the default dish when no choice made', key: 'autoDefault' },
      { name: 'Allow edits until cutoff', desc: 'Patients can change their order before it closes', key: 'allowEdit' },
    ];
    return (
      <div>
        {rows.map((r, i) => (
          <div key={i} className={cx(rowCls, 'cursor-default')}>
            <div className="flex-1">
              <div className="font-medium text-[#19233a]">{r.name}</div>
              <div className="text-[13px] text-[#5d6678]">{r.desc}</div>
            </div>
            {r.right ? r.right : (
              <Toggle on={db.win[r.key]} onClick={() => updateFood((d: any) => { d.win[r.key] = !d.win[r.key]; })} />
            )}
          </div>
        ))}
      </div>
    );
  }

  function step7() {
    const bad = computeBad();
    const badOk = bad.length === 0;
    const missing = db.dishes.filter((x: any) => !x.ar).length;

    const checks = [
      {
        ok: badOk,
        title: badOk ? 'Every required section has enough items' : `${bad.length} required section(s) need more items`,
        detail: badOk
          ? 'All choose-two / required sections are satisfied'
          : bad.slice(0, 3).join(', ') + (bad.length > 3 ? '…' : ''),
      },
      {
        ok: true,
        title: 'Ordering window set',
        detail: `Opens ${db.win.open}, closes ${db.win.close}, ${db.win.serviceDay.toLowerCase()}`,
      },
      {
        ok: missing === 0,
        title: `${missing} dishes missing an Arabic name`,
        detail: missing === 0 ? 'All translations present' : "Won't block publishing — they show in English only until added",
      },
    ];

    return (
      <div>
        <div className="grid grid-cols-3 gap-3 p-5">
          <Metric label="Menus" value={db.diets.length * db.meals.length * DAYS.length} />
          <Metric label="Sections (lunch)" value={currentMenu.Regular.Lunch.length} />
          <Metric label="Dishes" value={db.dishes.length} />
        </div>
        {checks.map((c, i) => (
          <div key={i} className={cx(rowCls, 'items-start')}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 24,
                height: 24,
                background: c.ok ? '#e7f6f0' : '#fbf1de',
                color: c.ok ? '#1f9e75' : '#b9770b',
              }}
            >
              {c.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#19233a]">{c.title}</div>
              <div className="text-[13px] text-[#5d6678]">{c.detail}</div>
            </div>
          </div>
        ))}
        <div className="p-5">
          <Btn
            variant="primary"
            lg
            disabled={bad.length > 0}
            onClick={bad.length > 0 ? undefined : publishSet}
            className="w-full justify-center"
          >
            <Rocket size={18} /> {bad.length > 0 ? 'Fix required sections to publish' : 'Publish to bedside'}
          </Btn>
          <div className="text-[12px] text-[#5d6678] text-center mt-2.5">
            Goes live for the next ordering window · patients order from {db.win.open}
          </div>
        </div>
      </div>
    );
  }

  function wizardBody() {
    switch (step) {
      case 1: return step1();
      case 2: return step2();
      case 4: return step4();
      case 5: return step5();
      case 6: return step6();
      case 7: return step7();
      default: return null;
    }
  }

  const segBtn = (s: number) => (
    <button
      key={s}
      onClick={() => setStep(s)}
      className={cx(
        'flex-1 min-w-[120px] px-3 py-[7px] rounded-[8px] text-[13px] cursor-pointer transition-colors whitespace-nowrap',
        step === s ? 'bg-white text-[#19233a] font-semibold shadow' : 'text-[#5d6678] hover:text-[#19233a]',
      )}
    >
      {STEP_TITLES[s]}
    </button>
  );

  function viewWizard() {
    const set = db.sets.find((x: any) => x.id === setId) || db.sets[0];

    return (
      <Card className={step === 1 ? '!overflow-visible' : undefined}>
        <CardHead
          back={{ label: 'Overview', onClick: () => setSub('overview') }}
          title={set.name}
          sub={STEP_TITLES[step]}
          right={step === 4 ? (
            <div className="flex gap-2">
              <Btn variant="neutral" onClick={exportMenuToCSV}>
                <Download size={15} /> Export Excel (CSV)
              </Btn>
              <label className="inline-flex items-center justify-center gap-2 h-[38px] px-[15px] text-[13.5px] rounded-[10px] border border-[#d6dae6] bg-white hover:bg-[#f7f8fb] text-[#19233a] font-medium cursor-pointer transition-colors">
                <Upload size={15} /> Import Excel (CSV)
                <input type="file" accept=".csv" onChange={importMenuFromCSV} className="hidden" />
              </label>
            </div>
          ) : null}
        />
        <div className="flex flex-wrap gap-1 bg-[#f7f8fb] p-1 rounded-[10px] mx-5 my-4">
          {[1, 2, 4, 6, 7].map(segBtn)}
        </div>
        {wizardBody()}
      </Card>
    );
  }

  // ============================================================
  return (
    <FoodPage current="set" onNavigate={onNavigate}>
      {sub === 'list' && viewSets()}
      {sub === 'overview' && viewSetOverview()}
      {sub === 'wizard' && viewWizard()}
    </FoodPage>
  );
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    lines.push(row);
  }
  return lines;
}
