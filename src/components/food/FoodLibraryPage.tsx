import { useState } from 'react';
import {
  Salad,
  LayoutGrid,
  Stethoscope,
  AlertTriangle,
  Coffee,
  Calendar,
  Info,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  ImagePlus,
  ShieldCheck,
  GripVertical,
  ArrowUpDown,
  PlugZap,
  Clock,
  X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood } from './foodStore';
import {
  cx,
  Btn,
  Toggle,
  Chip,
  Badge,
  Tag,
  Note,
  Card,
  CardHead,
  Bar,
  rowCls,
  FoodPage,
} from './foodAtoms';
import { SingleSelectDropdown } from '../UnifiedDropdown';

type View = 'library' | 'dishes' | 'dish' | 'reflists';
type RefTab = 'sections' | 'diets' | 'allergens' | 'meals';

const blankDish = () => ({ en: '', ar: '', section: 'Mains', allergens: [] as string[], on: true });

export default function FoodLibraryPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db = useFood();
  const [view, setView] = useState<View>('library');
  const [tab, setTab] = useState<RefTab>('sections');
  const [dishIdx, setDishIdx] = useState<number | null>(null);
  const [form, setForm] = useState<any>(blankDish());
  const [importOpen, setImportOpen] = useState(false);

  // ---- navigation helpers --------------------------------------------------

  const openReflists = (t: RefTab) => {
    setTab(t);
    setView('reflists');
  };

  const openDish = (i: number | null) => {
    setDishIdx(i);
    setForm(i != null ? { ...blankDish(), ...db.dishes[i] } : blankDish());
    setView('dish');
  };

  const patchForm = (p: any) => setForm((f: any) => ({ ...f, ...p }));

  const toggleFormAllergen = (a: string) =>
    setForm((f: any) => ({
      ...f,
      allergens: f.allergens.includes(a)
        ? f.allergens.filter((x: string) => x !== a)
        : [...f.allergens, a],
    }));

  const saveDish = () => {
    const en = (form.en || '').trim();
    if (!en) {
      toast('Enter a dish name');
      return;
    }
    const tmp = { ...form, en };
    updateFood((d: any) => {
      if (dishIdx != null) d.dishes[dishIdx] = { ...d.dishes[dishIdx], ...tmp };
      else d.dishes.push({ ...tmp });
    });
    setView('dishes');
    toast('Dish saved');
  };

  // ---- import --------------------------------------------------------------

  const downloadSample = () => {
    const rows = [
      'name_en,name_ar,name_ur,section,allergens,active',
      'Croissant,كرواسون,,Baked breads,Gluten;Milk;Egg,Yes',
    ];
    const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'careinn-dishes-sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const importFile = (e: any) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').replace(/^﻿/, '');
      const lines = text.split(/\r?\n/).slice(1);
      let n = 0;
      updateFood((d: any) => {
        lines.forEach((line) => {
          if (!line.trim()) return;
          const c = line.split(',');
          const name = (c[0] || '').trim();
          if (!name) return;
          d.dishes.push({
            en: name,
            ar: (c[1] || '').trim(),
            ur: (c[2] || '').trim(),
            section: (c[3] || '').trim() || 'Mains',
            allergens: (c[4] || '')
              .split(';')
              .map((s: string) => s.trim())
              .filter(Boolean),
            on: (c[5] || 'Yes').trim().toLowerCase() !== 'no',
          });
          n++;
        });
      });
      setImportOpen(false);
      toast('Imported ' + n + ' dishes');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================================================
  // LIBRARY HUB
  // ==========================================================================

  const libcard = (
    icon: any,
    name: string,
    count: string,
    onClick: () => void,
    green?: boolean,
  ) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 text-left p-4 rounded-[12px] border border-[#e7e9f0] bg-white hover:bg-[#f7f8fb] hover:border-[#d6dae6] cursor-pointer transition-colors"
    >
      <span
        className={cx(
          'w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0',
          green ? 'bg-[#e7f6f0] text-[#1f9e75]' : 'bg-[#eaf7fc] text-[#1d7da3]',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[#19233a]">{name}</span>
        <span className="block text-[13px] text-[#5d6678] mt-0.5">{count}</span>
      </span>
    </button>
  );

  const viewLibrary = (
    <Card>
      <CardHead title="Food library" sub="Fakeeh Hospital · set up once, reuse everywhere" />
      <div className="grid grid-cols-2 gap-3 p-5">
        {libcard(
          <Salad size={20} />,
          'Dishes',
          `${db.dishes.length} items · names, photos, allergens`,
          () => setView('dishes'),
        )}
        {libcard(
          <LayoutGrid size={20} />,
          'Sections',
          `${db.sections.length} groups · soup, mains, drinks…`,
          () => openReflists('sections'),
        )}
        {libcard(
          <Stethoscope size={20} />,
          'Diets',
          `${db.diets.length} conditions · linked to HIS codes`,
          () => openReflists('diets'),
        )}
        {libcard(
          <AlertTriangle size={20} />,
          'Allergens',
          `${db.allergens.length} tags · used for safety checks`,
          () => openReflists('allergens'),
        )}
        {libcard(
          <Coffee size={20} />,
          'Meals',
          `${db.meals.length} types · breakfast, lunch, dinner`,
          () => openReflists('meals'),
        )}
        {libcard(
          <Calendar size={20} />,
          'Menu sets',
          'Arrange the library into menus',
          () => onNavigate('food-sets'),
          true,
        )}
      </div>
      <Bar>
        <div className="flex items-start gap-2.5 text-[13px] text-[#5d6678]">
          <Info size={16} className="flex-shrink-0 mt-0.5 text-[#9099ab]" />
          <span>
            Build the library first, then a menu set just picks from it — nothing is typed twice.
          </span>
        </div>
      </Bar>
    </Card>
  );

  // ==========================================================================
  // DISHES LIST
  // ==========================================================================

  const viewDishes = (
    <Card>
      <CardHead
        back={{ label: 'Library', onClick: () => setView('library') }}
        title="Dishes"
        sub={`${db.dishes.length} dishes`}
        right={
          <>
            <Btn variant="neutral" onClick={() => setImportOpen(true)}>
              <Upload size={16} />
              Import
            </Btn>
            <Btn variant="primary" onClick={() => openDish(null)}>
              <Plus size={16} />
              Add dish
            </Btn>
          </>
        }
      />
      <div className="flex gap-2.5 px-5 pb-4">
        <div className="flex-1 flex items-center gap-2 h-[38px] px-3 border border-[#e7e9f0] rounded-[10px] text-[#9099ab]">
          <Search size={16} />
          <span className="text-[13.5px]">Search dishes</span>
        </div>
        <Tag>
          <Filter size={13} />
          All sections
        </Tag>
      </div>
      <div>
        {db.dishes.map((dish: any, i: number) => (
          <div
            key={i}
            onClick={() => openDish(i)}
            className={cx(rowCls, 'cursor-pointer hover:bg-[#f7f8fb] transition-colors')}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#19233a] truncate">{dish.en}</div>
              {dish.ar ? (
                <div className="text-[13px] text-[#9099ab] truncate" dir="rtl">
                  {dish.ar}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[13px] text-[#b9770b] mt-0.5">
                  <AlertTriangle size={13} />
                  Arabic name missing
                </div>
              )}
            </div>
            {dish.allergens && dish.allergens.length > 0 && (
              <span className="text-[12px] px-[9px] py-[3px] rounded-[7px] bg-[#fbf1de] text-[#b9770b] whitespace-nowrap">
                {dish.allergens.join(' · ')}
              </span>
            )}
            <Tag>{dish.section}</Tag>
            <Toggle
              on={dish.on}
              onClick={(e: any) => {
                e.stopPropagation();
                updateFood((d: any) => {
                  d.dishes[i].on = !d.dishes[i].on;
                });
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );

  // ==========================================================================
  // DISH FORM
  // ==========================================================================

  const editing = dishIdx != null;
  const inputCls = 'w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors';
  const labelCls = 'block text-[13px] text-[#5d6678] mb-1.5';

  const viewDishForm = (
    <Card>
      <CardHead
        back={{ label: 'Dishes', onClick: () => setView('dishes') }}
        title={editing ? 'Edit dish' : 'Add dish'}
      />
      <div className="p-5">
        <div className="flex gap-4">
          <button
            type="button"
            className="w-[84px] h-[84px] flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed border-[#d6dae6] text-[#9099ab] hover:bg-[#f7f8fb] hover:border-[#4EBEE3] cursor-pointer transition-colors"
          >
            <ImagePlus size={22} />
            <span className="text-[12px]">Photo</span>
          </button>
          <div className="flex-1">
            <label className={labelCls}>Name (English)</label>
            <input
              className={inputCls}
              value={form.en}
              onChange={(e) => patchForm({ en: e.target.value })}
              placeholder="e.g. Grilled chicken"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelCls}>Name (Arabic)</label>
            <input
              className={inputCls}
              dir="rtl"
              value={form.ar}
              onChange={(e) => patchForm({ ar: e.target.value })}
              placeholder="اسم الطبق"
            />
          </div>
          <div>
            <label className={labelCls}>Section</label>
            <SingleSelectDropdown
              options={db.sections.map((s: any) => s.en)}
              value={form.section}
              onChange={(v: string) => patchForm({ section: v })}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Allergens</label>
          <div className="flex flex-wrap gap-2">
            {db.allergens.map((a: string) => (
              <Chip key={a} on={form.allergens.includes(a)} onClick={() => toggleFormAllergen(a)}>
                {a}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e7e9f0]">
          <div>
            <div className="font-medium text-[#19233a]">Active</div>
            <div className="text-[13px] text-[#5d6678] mt-0.5">
              Inactive dishes stay in the library but can't be added to a menu.
            </div>
          </div>
          <Toggle on={form.on} onClick={() => patchForm({ on: !form.on })} />
        </div>

        <div className="mt-4">
          <Note tone="ok" icon={<ShieldCheck size={16} />}>
            Allergens you tag here are cross-checked against each patient's record before an order is
            allowed.
          </Note>
        </div>
      </div>
      <Bar>
        <Btn variant="neutral" onClick={() => setView('dishes')}>
          Cancel
        </Btn>
        <Btn variant="primary" onClick={saveDish}>
          Save dish
        </Btn>
      </Bar>
    </Card>
  );

  // ==========================================================================
  // REFERENCE LISTS
  // ==========================================================================

  const addLabel: Record<RefTab, string> = {
    sections: 'Add section',
    diets: 'Add diet',
    allergens: 'Add allergen',
    meals: 'Add meal',
  };

  const segBtn = (t: RefTab, label: string) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={cx(
        'flex-1 px-3 py-[7px] rounded-[8px] text-[13px] cursor-pointer transition-colors',
        tab === t ? 'bg-white text-[#19233a] font-semibold shadow' : 'text-[#5d6678] hover:text-[#19233a]',
      )}
    >
      {label}
    </button>
  );

  const colLabel = 'text-[12px] text-[#9099ab] font-medium';

  const viewRefLists = (
    <Card>
      <CardHead
        back={{ label: 'Library', onClick: () => setView('library') }}
        title="Reference lists"
        right={
          <Btn variant="primary" onClick={() => toast('New row added (demo)')}>
            <Plus size={16} />
            {addLabel[tab]}
          </Btn>
        }
      />
      <div className="flex gap-1 bg-[#f7f8fb] p-1 rounded-[10px] mx-5 my-4">
        {segBtn('sections', 'Sections')}
        {segBtn('diets', 'Diets')}
        {segBtn('allergens', 'Allergens')}
        {segBtn('meals', 'Meals')}
      </div>

      {tab === 'sections' && (
        <>
          <div className="flex items-center gap-3 px-5 py-2">
            <span className="w-4" />
            <span className={cx(colLabel, 'flex-1')}>Section</span>
            <span className={colLabel}>Used in</span>
            <span className={cx(colLabel, 'w-[34px] text-right')}>On</span>
          </div>
          {db.sections.map((s: any, i: number) => (
            <div key={i} className={rowCls}>
              <GripVertical size={16} className="text-[#9099ab] cursor-grab flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#19233a]">{s.en}</div>
                <div className="text-[13px] text-[#9099ab]" dir="rtl">
                  {s.ar}
                </div>
              </div>
              <div className="text-[13px] text-[#5d6678] whitespace-nowrap">{8 + i * 2} menus</div>
              <Toggle
                on={s.on}
                onClick={() =>
                  updateFood((d: any) => {
                    d.sections[i].on = !d.sections[i].on;
                  })
                }
              />
            </div>
          ))}
          <div className="p-5">
            <Note tone="info" icon={<ArrowUpDown size={16} />}>
              Drag to reorder — this is the order sections appear on the patient screen.
            </Note>
          </div>
        </>
      )}

      {tab === 'diets' && (
        <>
          <div className="flex items-center gap-3 px-5 py-2">
            <span className={cx(colLabel, 'flex-1')}>Diet</span>
            <span className={colLabel}>HIS code</span>
            <span className={cx(colLabel, 'w-[34px] text-right')}>On</span>
          </div>
          {db.diets.map((dt: any, i: number) => (
            <div key={i} className={rowCls}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#19233a]">{dt.en}</div>
                <div className="text-[13px] text-[#9099ab]" dir="rtl">
                  {dt.ar}
                </div>
              </div>
              <Badge tone="info" className="font-mono">
                {dt.his}
              </Badge>
              <Toggle
                on={dt.on}
                onClick={() =>
                  updateFood((d: any) => {
                    d.diets[i].on = !d.diets[i].on;
                  })
                }
              />
            </div>
          ))}
          <div className="p-5">
            <Note tone="info" icon={<PlugZap size={16} />}>
              The HIS code is how a doctor's diet order automatically picks the right menu for each
              patient.
            </Note>
          </div>
        </>
      )}

      {tab === 'allergens' && (
        <>
          {db.allergens.map((a: string, i: number) => {
            const count = db.dishes.filter(
              (x: any) => x.allergens && x.allergens.includes(a),
            ).length;
            return (
              <div key={i} className={rowCls}>
                <div className="flex-1 min-w-0 font-medium text-[#19233a]">{a}</div>
                <Badge tone="mute">{count} dishes</Badge>
              </div>
            );
          })}
          <div className="p-5">
            <Note tone="warn" icon={<AlertTriangle size={16} />}>
              Allergens drive the safety check — a dish tagged here is blocked for any patient who
              lists that allergy.
            </Note>
          </div>
        </>
      )}

      {tab === 'meals' && (
        <>
          {db.meals.map((m: string, i: number) => (
            <div key={i} className={rowCls}>
              <div className="flex-1 min-w-0 font-medium text-[#19233a]">{m}</div>
              <div className="text-[13px] text-[#5d6678] whitespace-nowrap">order #{i + 1}</div>
            </div>
          ))}
          <div className="p-5">
            <Note tone="info" icon={<Clock size={16} />}>
              Meals share one ordering window in this hospital — set it inside each menu set.
            </Note>
          </div>
        </>
      )}
    </Card>
  );

  // ==========================================================================
  // IMPORT MODAL
  // ==========================================================================

  const importModal = importOpen && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
      onClick={() => setImportOpen(false)}
    >
      <Card className="max-w-[540px] w-full" >
        <div onClick={(e) => e.stopPropagation()}>
          <CardHead
            title="Import dishes"
            sub="Upload a CSV with these columns"
            right={
              <button
                onClick={() => setImportOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            }
          />
          <div className="p-5">
            <div className="border border-[#e7e9f0] rounded-[10px] overflow-hidden font-mono text-[12.5px]">
              <div className="bg-[#eef1f7] text-[#16274D] font-semibold px-3 py-2.5 overflow-x-auto whitespace-nowrap">
                name_en, name_ar, name_ur, section, allergens, active
              </div>
              <div className="px-3 py-2.5 text-[#5d6678] border-t border-[#e7e9f0] whitespace-nowrap overflow-x-auto">
                Croissant, كرواسون, , Baked breads, Gluten;Milk;Egg, Yes
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 text-[13px] text-[#5d6678] list-disc pl-5">
              <li>
                Multiple <b>allergens</b> are separated by <code className="font-mono">;</code>
              </li>
              <li>
                <b>section</b> must match a library section exactly
              </li>
              <li>
                <b>active</b> is <code className="font-mono">Yes</code> or{' '}
                <code className="font-mono">No</code>
              </li>
              <li>
                <b>name_ur</b> (Urdu) is optional
              </li>
            </ul>

            <div className="mt-4">
              <Note tone="info" icon={<Info size={16} />}>
                Rows with a blank name are skipped. Existing dishes are kept — imported dishes are
                added to the library.
              </Note>
            </div>
          </div>
          <Bar>
            <Btn variant="neutral" onClick={downloadSample}>
              <Download size={16} />
              Download sample CSV
            </Btn>
            <label className="inline-flex items-center justify-center gap-2 rounded-[10px] font-medium cursor-pointer transition-colors font-['Poppins',sans-serif] h-[38px] px-[15px] text-[13.5px] border border-[#4EBEE3] bg-[#4EBEE3] text-white hover:bg-[#3da5ca]">
              <Upload size={16} />
              Choose CSV file
              <input type="file" accept=".csv" className="hidden" onChange={importFile} />
            </label>
          </Bar>
        </div>
      </Card>
    </div>
  );

  // ==========================================================================

  return (
    <FoodPage current="lib" onNavigate={onNavigate}>
      {view === 'library' && viewLibrary}
      {view === 'dishes' && viewDishes}
      {view === 'dish' && viewDishForm}
      {view === 'reflists' && viewRefLists}
      {importModal}
    </FoodPage>
  );
}
