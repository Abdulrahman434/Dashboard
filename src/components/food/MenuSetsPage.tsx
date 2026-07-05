import { useState } from 'react';
import {
  Plus, Copy, Eye, Settings, ClipboardList, ListChecks, ListTree,
  RefreshCw, Clock, CheckCircle2, ChevronRight, ChevronLeft, X, CheckCheck,
  Lightbulb, Rocket, Calendar, Building2, Search, Check,
  AlertTriangle, Salad, GripVertical, Download, Upload,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useFood, updateFood, resolve, ruleText, DAYS, buildMenu,
} from './foodStore';
import {
  cx, Btn, Toggle, Chip, StatusBadge, Tag, Note, Metric, Stepper,
  MiniSeg, Card, CardHead, Bar, rowCls, ContextBar, FoodPage,
} from './foodAtoms';
import { MultiSelectDropdown, SingleSelectDropdown } from '../UnifiedDropdown';

const GROUP_OPTIONS = ['Kids', 'Adults', 'VIP'];

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
  const [itemSec, setItemSec] = useState(0);
  const [applyTargets, setApplyTargets] = useState<Record<string, boolean> | null>(null);
  const [applyDays, setApplyDays] = useState<Record<string, boolean> | null>(null);
  const [applyMode, setApplyMode] = useState<'days' | 'diets'>('days');

  // Drag and drop state
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Add dish state
  const [newDishEn, setNewDishEn] = useState('');
  const [newDishAr, setNewDishAr] = useState('');
  const [showAddDish, setShowAddDish] = useState(false);

  const onCtx = (key: string, val: string) => {
    setCtx((c) => ({ ...c, [key]: val }));
    setItemSec(0);
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
      { icon: ListChecks, name: 'Sections and rules', sub: 'Per diet and meal · choose-one, choose-two, required', step: 3 },
      { icon: ListTree, name: 'Items and defaults', sub: 'Dishes assigned per section · defaults set', step: 4 },
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
  const menuMutate = (fn: (cfg: any[], d: any) => void) => {
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      const cfg = dSet.menu[ctx.diet][ctx.meal];
      fn(cfg, d);
    });
  };

  function menuMode(i: number, forAll: boolean) {
    menuMutate((cfg) => {
      const s = cfg[i];
      s.forAll = forAll;
    });
  }

  function menuStep(i: number, field: 'min' | 'max', delta: number) {
    menuMutate((cfg) => {
      const s = cfg[i];
      if (field === 'min') {
        const next = Math.max(0, Math.min((s.max || 1), s.min + delta));
        s.min = next;
      } else {
        const next = Math.max(1, Math.min(5, s.max + delta));
        s.max = next;
        if (s.min > next) s.min = next;
      }
    });
  }

  function menuRemove(i: number) {
    menuMutate((cfg) => { cfg.splice(i, 1); });
    // read back after commit via functional state
    const cfg = currentMenu[ctx.diet][ctx.meal];
    if (itemSec >= cfg.length - 1) setItemSec(0);
  }

  function menuMove(i: number, dir: -1 | 1) {
    menuMutate((cfg) => {
      if (i + dir < 0 || i + dir >= cfg.length) return;
      const temp = cfg[i];
      cfg[i] = cfg[i + dir];
      cfg[i + dir] = temp;
    });
  }

  function applyMealAcrossDiets() {
    let n = 0;
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      d.diets.forEach((dt: any) => {
        if (dt.en === ctx.diet) return;
        n++;
        dSet.menu[dt.en][ctx.meal] = structuredClone(dSet.menu[ctx.diet][ctx.meal]);
      });
    });
    toast(`Copied ${ctx.meal} rules to ${n} other diets`);
  }

  function menuAdd(name: string) {
    menuMutate((cfg, d) => {
      const items = d.dishes.filter((x: any) => x.section === name && x.on).map((x: any) => x.en);
      const days: any = {};
      DAYS.forEach((dy: string) => { days[dy] = { items: [...items], def: items[0] || null }; });
      cfg.push({ sec: name, min: 1, max: 1, forAll: false, days });
    });
  }

  function toggleItem(i: number, en: string) {
    menuMutate((cfg) => {
      const dc = cfg[i].days[ctx.day];
      const idx = dc.items.indexOf(en);
      if (idx >= 0) {
        dc.items.splice(idx, 1);
        if (dc.def === en) dc.def = null;
      } else {
        dc.items.push(en);
      }
    });
  }

  function setDef(i: number, en: string) {
    menuMutate((cfg) => {
      const dc = cfg[i].days[ctx.day];
      if (!dc.items.includes(en)) dc.items.push(en);
      dc.def = en;
    });
  }

  function addDishToSection(sectionName: string, secIdx: number) {
    if (!newDishEn.trim()) {
      toast.error('English name is required');
      return;
    }
    
    const exists = db.dishes.some((x: any) => x.en.toLowerCase() === newDishEn.trim().toLowerCase());
    if (exists) {
      toast.error('Dish already exists');
      return;
    }

    updateFood((d: any) => {
      const trimmedEn = newDishEn.trim();
      const trimmedAr = newDishAr.trim();
      
      d.dishes.push({
        en: trimmedEn,
        ar: trimmedAr,
        section: sectionName,
        allergens: [],
        on: true
      });

      const dSet = d.sets.find((s: any) => s.id === setId);
      const cfg = dSet.menu[ctx.diet][ctx.meal];
      const sec = cfg[secIdx];
      if (sec && sec.days && sec.days[ctx.day]) {
        sec.days[ctx.day].items.push(trimmedEn);
      }
    });

    toast.success(`Added ${newDishEn} to ${sectionName}`);
    setNewDishEn('');
    setNewDishAr('');
    setShowAddDish(false);
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
            sec = { sec: actualSectionName, min: 1, max: 1, forAll: false, days: daysObj };
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

  function itemSecNav(delta: number) {
    const cfg = currentMenu[ctx.diet][ctx.meal];
    setItemSec((itemSec + delta + cfg.length) % cfg.length);
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
    3: 'Sections and rules',
    4: 'Items and defaults',
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

  function step3() {
    const cfg = currentMenu[ctx.diet][ctx.meal];
    const used = new Set(cfg.map((s: any) => s.sec));
    const meal = ctx.meal;
    // unused active sections: derive from dishes' sections not already used
    const allSections: string[] = Array.from(new Set(db.dishes.map((x: any) => x.section)));
    const unused = allSections.filter((s) => !used.has(s));

    const handleDragStart = (e: React.DragEvent, i: number) => {
      setDragItem(i);
      e.dataTransfer.effectAllowed = 'move';
      // Make it slightly transparent while dragging
      (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnter = (i: number) => {
      setDragOverItem(i);
    };

    const handleDragEnd = (e: React.DragEvent) => {
      (e.target as HTMLElement).style.opacity = '1';
      if (dragItem !== null && dragOverItem !== null && dragItem !== dragOverItem) {
        menuMutate((draft) => {
          const item = draft.splice(dragItem, 1)[0];
          draft.splice(dragOverItem, 0, item);
        });
      }
      setDragItem(null);
      setDragOverItem(null);
    };

    return (
      <div>
        <ContextBar ctx={ctx} onCtx={onCtx} db={db} diets={currentSet.diets} meals={currentSet.meals} />
        <div className="flex justify-end px-5 py-2">
          <Btn variant="neutral" onClick={applyMealAcrossDiets}>
            <Copy size={14} /> Apply to all diets for {ctx.meal}
          </Btn>
        </div>
        {cfg.map((s: any, i: number) => (
          <div 
            key={i} 
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={cx(
              "px-5 py-3.5 border-t border-[#e7e9f0] bg-white transition-all cursor-move",
              dragOverItem === i ? "border-t-2 border-t-[#1d7da3] bg-[#f7f8fb]" : ""
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-[#9099ab] cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} />
                </div>
                <div className="font-medium text-[#19233a]">{s.sec}</div>
              </div>
              <button
                className="p-1 rounded hover:bg-[#f7f8fb] text-[#9099ab]"
                onClick={() => menuRemove(i)}
                aria-label="Remove section"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3.5 items-center mt-2.5">
              <MiniSeg
                options={[
                  { value: 'choice', label: 'Patient choice' },
                  { value: 'all', label: 'Served to all' },
                ]}
                value={s.forAll ? 'all' : 'choice'}
                onChange={(v: string) => menuMode(i, v === 'all')}
              />
              {!s.forAll && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-[#5d6678]">Min</span>
                    <Stepper value={s.min} onDec={() => menuStep(i, 'min', -1)} onInc={() => menuStep(i, 'min', 1)} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-[#5d6678]">Max</span>
                    <Stepper value={s.max} onDec={() => menuStep(i, 'max', -1)} onInc={() => menuStep(i, 'max', 1)} />
                  </div>
                </>
              )}
            </div>
            <div className="text-[13px] text-[#5d6678] mt-2">
              {ruleText(s)}{s.forAll ? '' : ' · dishes set per day in the next step'}
            </div>
          </div>
        ))}
        {unused.length > 0 && (
          <div className="px-5 py-3.5 border-t border-[#e7e9f0]">
            <select
              className="w-full h-[38px] px-3 rounded-[10px] border border-dashed border-[#d6dae6] bg-transparent text-[14px] text-[#5d6678]"
              value=""
              onChange={(e) => { if (e.target.value) menuAdd(e.target.value); }}
            >
              <option value="">+ Add a section…</option>
              {unused.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
    );
  }

  function step4() {
    const cfg = currentMenu[ctx.diet][ctx.meal];
    const sec = cfg[Math.min(itemSec, cfg.length - 1)];
    const secIdx = Math.min(itemSec, cfg.length - 1);
    const dc = sec.days[ctx.day];
    const inSec = db.dishes.filter((x: any) => x.section === sec.sec);

    return (
      <div>
        <ContextBar withDay ctx={ctx} onCtx={onCtx} db={db} diets={currentSet.diets} meals={currentSet.meals} />
        <div className="flex items-center justify-between px-5 py-3 bg-[#f7f8fb] border-t border-[#e7e9f0]">
          <Btn variant="neutral" onClick={() => itemSecNav(-1)}><ChevronLeft size={16} /></Btn>
          <div className="text-[13px] text-center">
            <span className="font-medium text-[#19233a]">{sec.sec}</span>
            <span className="text-[#5d6678]">{` · ${secIdx + 1}/${cfg.length} · ${dc.items.length} on ${ctx.day}`}</span>
          </div>
          <Btn variant="neutral" onClick={() => itemSecNav(1)}><ChevronRight size={16} /></Btn>
        </div>
        {inSec.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#9099ab]">
            <Salad size={28} />
            <div className="text-[13px]">No dishes in this section — add some in the library.</div>
          </div>
        ) : (
          inSec.map((x: any) => {
            const included = dc.items.includes(x.en);
            const isDef = dc.def === x.en;
            return (
              <div key={x.en} className={rowCls}>
                <Toggle on={included} onClick={() => toggleItem(secIdx, x.en)} />
                <div className="flex-1">
                  <div className="text-[#19233a] text-[14px]">{x.en}</div>
                  <div className="text-[13px] text-[#5d6678]" dir="rtl">{x.ar || '—'}</div>
                </div>
                <div className="text-right" style={{ width: 84 }}>
                  {included ? (
                    <button
                      className={cx(
                        'text-[13px]',
                        isDef ? 'text-[#1d7da3] font-semibold' : 'text-[#9099ab]'
                      )}
                      onClick={() => setDef(secIdx, x.en)}
                    >
                      {isDef ? '★ default' : 'set default'}
                    </button>
                  ) : (
                    <span className="text-[13px] text-[#9099ab]">—</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Inline Add Dish Form */}
        <div className="px-5 py-3 border-t border-[#e7e9f0]">
          {showAddDish ? (
            <div className="flex flex-col gap-2.5 bg-[#f7f8fb] p-3 rounded-[10px] border border-[#e7e9f0]">
              <div className="text-[13px] font-semibold text-[#16274D]">Add Dish to {sec.sec}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="English Name (e.g. Sunny side up)"
                  value={newDishEn}
                  onChange={(e) => setNewDishEn(e.target.value)}
                  className="flex-1 h-[36px] px-3 border border-[#d6dae6] rounded-[8px] text-[13px] bg-white text-[#19233a] focus:outline-none focus:border-[#1d7da3]"
                />
                <input
                  type="text"
                  placeholder="Arabic Name (Optional)"
                  value={newDishAr}
                  onChange={(e) => setNewDishAr(e.target.value)}
                  className="flex-1 h-[36px] px-3 border border-[#d6dae6] rounded-[8px] text-[13px] bg-white text-[#19233a] focus:outline-none focus:border-[#1d7da3] text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Btn variant="neutral" className="!h-[32px] !rounded-[8px] !text-[12.5px] !px-3" onClick={() => { setShowAddDish(false); setNewDishEn(''); setNewDishAr(''); }}>
                  Cancel
                </Btn>
                <Btn variant="primary" className="!h-[32px] !rounded-[8px] !text-[12.5px] !px-3" onClick={() => addDishToSection(sec.sec, secIdx)}>
                  Save Dish
                </Btn>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDish(true)}
              className="w-full h-[38px] px-3 rounded-[10px] border border-dashed border-[#d6dae6] hover:border-[#1d7da3] bg-transparent text-[13px] text-[#5d6678] hover:text-[#1d7da3] font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus size={14} /> Add new dish to {sec.sec}
            </button>
          )}
        </div>

        <div className="p-5">
          <Note icon={<Calendar size={16} />}>
            You're editing <b>{ctx.day}</b>. Each day holds its own dishes; the rule above is shared across the week. Copy a day to others in the next step.
          </Note>
        </div>
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
      case 3: return step3();
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
          {[1, 2, 3, 4, 6, 7].map(segBtn)}
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
