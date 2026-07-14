import { useEffect, useState } from 'react';
import {
  Salad,
  AlertTriangle,
  Info,
  Upload,
  Download,
  Plus,
  Search,
  ImagePlus,
  ShieldCheck,
  GripVertical,
  ArrowUpDown,
  PlugZap,
  Clock,
  X,
  Check,
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

type View = 'dishes' | 'dish' | 'reflists';
type RefTab = 'sections' | 'diets' | 'allergens' | 'meals';
type Mode = 'dishes' | 'reflists';

const blankDish = () => ({ en: '', ar: '', section: 'Mains', allergens: [] as string[], on: true });

export default function FoodLibraryPage({
  onNavigate,
  mode,
}: {
  onNavigate: (route: string) => void;
  mode: Mode;
}) {
  const db = useFood();
  const [view, setView] = useState<View>(mode);
  // Dashboard renders this same component instance for both sidebar entries
  // ('food-dishes' / 'food-reflists') — React only swaps props on navigation,
  // it doesn't remount. Re-sync the root view whenever the route's mode changes.
  useEffect(() => {
    setView(mode);
  }, [mode]);
  const [tab, setTab] = useState<RefTab>('sections');
  const [dishIdx, setDishIdx] = useState<number | null>(null);
  const [form, setForm] = useState<any>(blankDish());
  const [importOpen, setImportOpen] = useState(false);
  const [dishSearch, setDishSearch] = useState('');
  // Inline "add new" state for the dish form (section + allergen).
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [addingAllergen, setAddingAllergen] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');

  // Reference List Add Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    en: '',
    ar: '',
    code: '',
    active: true,
  });

  // ---- navigation helpers --------------------------------------------------

  const openDish = (i: number | null) => {
    setDishIdx(i);
    setForm(i != null ? { ...blankDish(), ...db.dishes[i] } : blankDish());
    setAddingSection(false);
    setNewSection('');
    setAddingAllergen(false);
    setNewAllergen('');
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

  // Add a brand-new section from inside the dish form — saved to the shared
  // library (db.sections) so it appears everywhere, then selected on this dish.
  const commitSection = () => {
    const name = (newSection || '').trim();
    if (!name) {
      toast('Enter a section name');
      return;
    }
    const exists = db.sections.some((s: any) => s.en.toLowerCase() === name.toLowerCase());
    if (!exists) updateFood((d: any) => d.sections.push({ en: name, ar: '', on: true }));
    patchForm({ section: name });
    setAddingSection(false);
    setNewSection('');
    toast(exists ? 'Section already exists — selected' : `Section “${name}” added to library`);
  };

  // Add a brand-new allergen from inside the dish form — saved to db.allergens
  // (used by the safety check) and tagged on this dish.
  const commitAllergen = () => {
    const name = (newAllergen || '').trim();
    if (!name) {
      toast('Enter an allergen name');
      return;
    }
    const exists = db.allergens.some((a: string) => a.toLowerCase() === name.toLowerCase());
    if (!exists) updateFood((d: any) => d.allergens.push(name));
    setForm((f: any) => ({
      ...f,
      allergens: f.allergens.some((x: string) => x.toLowerCase() === name.toLowerCase())
        ? f.allergens
        : [...f.allergens, name],
    }));
    setAddingAllergen(false);
    setNewAllergen('');
    toast(exists ? 'Allergen already exists — tagged' : `Allergen “${name}” added to library`);
  };

  const handleSave = (keepOpen: boolean) => {
    const enName = (addForm.en || '').trim();
    if (!enName) {
      toast.error('English name is required');
      return;
    }

    let success = false;
    updateFood((d: any) => {
      if (tab === 'sections') {
        const arName = (addForm.ar || '').trim();
        const exists = d.sections.some((x: any) => x.en.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        d.sections.push({ en: enName, ar: arName, on: addForm.active });
        success = true;
      } else if (tab === 'diets') {
        const arName = (addForm.ar || '').trim();
        const exists = d.diets.some((x: any) => x.en.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        d.diets.push({ en: enName, ar: arName, his: (addForm.code || '').trim(), on: addForm.active });
        success = true;
      } else if (tab === 'allergens') {
        const exists = d.allergens.some((x: string) => x.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        d.allergens.push(enName);
        success = true;
      } else if (tab === 'meals') {
        const exists = d.meals.some((x: string) => x.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        d.meals.push(enName);
        success = true;
      }
    });

    if (success) {
      toast.success(`${enName} added successfully`);
      if (keepOpen) {
        setAddForm({ en: '', ar: '', code: '', active: true });
      } else {
        setAddModalOpen(false);
      }
    } else {
      toast.error(`${enName} already exists`);
    }
  };

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
  // DISHES LIST
  // ==========================================================================

  const q = dishSearch.trim().toLowerCase();
  const dishRows = db.dishes
    .map((dish: any, i: number) => ({ dish, i }))
    .filter(({ dish }: any) =>
      !q ? true : (dish.en || '').toLowerCase().includes(q) || (dish.ar || '').includes(dishSearch.trim()),
    );

  const viewDishes = (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Menu Dishes</h1>
          <div className="text-[14px] text-[#6B7280]">{db.dishes.length} dishes in the library</div>
        </div>
        <div className="flex gap-2">
          <Btn variant="neutral" onClick={() => setImportOpen(true)}>
            <Upload size={16} className="text-[#5d6678]" />
            Import
          </Btn>
          <Btn variant="primary" onClick={() => openDish(null)}>
            <Plus size={16} />
            Add dish
          </Btn>
        </div>
      </div>

      <Card>
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 h-[38px] px-3 border border-[#e7e9f0] rounded-[10px] focus-within:border-[#4EBEE3] transition-colors">
            <Search size={16} className="text-[#9099ab] flex-shrink-0" />
            <input
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
              placeholder="Search dishes by name"
              className="flex-1 bg-transparent outline-none text-[13.5px] text-[#19233a] placeholder:text-[#9099ab]"
            />
            {dishSearch && (
              <button
                onClick={() => setDishSearch('')}
                className="text-[#9099ab] hover:text-[#5d6678] cursor-pointer flex-shrink-0"
                title="Clear"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {dishRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 px-5">
              <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
                <Salad size={26} />
              </div>
              <div className="font-semibold text-[#16274D]">
                {q ? 'No dishes match your search' : 'No dishes yet'}
              </div>
              <div className="text-[13px] text-[#5d6678] mt-1">
                {q ? 'Try a different name, or clear the search.' : 'Add your first dish to the library.'}
              </div>
            </div>
          ) : (
            dishRows.map(({ dish, i }: any) => (
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
            ))
          )}
        </div>
      </Card>
    </>
  );

  // ==========================================================================
  // DISH FORM
  // ==========================================================================

  const editing = dishIdx != null;
  const inputCls = 'w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors';
  const labelCls = 'block text-[13px] text-[#5d6678] mb-1.5';
  const iconAdd = 'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border border-[#d6dae6] text-[#1d7da3] hover:bg-[#f7f8fb] hover:border-[#4EBEE3] cursor-pointer flex-shrink-0 transition-colors';
  const iconConfirm = 'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border border-[#4EBEE3] bg-[#4EBEE3] text-white hover:bg-[#3da5ca] cursor-pointer flex-shrink-0 transition-colors';
  const iconCancel = 'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border border-[#d6dae6] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer flex-shrink-0 transition-colors';

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
            {addingSection ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className={inputCls}
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitSection();
                    if (e.key === 'Escape') {
                      setAddingSection(false);
                      setNewSection('');
                    }
                  }}
                  placeholder="New section name"
                />
                <button type="button" onClick={commitSection} title="Add section" className={iconConfirm}>
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingSection(false);
                    setNewSection('');
                  }}
                  title="Cancel"
                  className={iconCancel}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <SingleSelectDropdown
                    options={db.sections.map((s: any) => s.en)}
                    value={form.section}
                    onChange={(v: string) => patchForm({ section: v })}
                  />
                </div>
                <button type="button" onClick={() => setAddingSection(true)} title="Add new section" className={iconAdd}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Allergens</label>
          <div className="flex flex-wrap gap-2 items-center">
            {db.allergens.map((a: string) => (
              <Chip key={a} on={form.allergens.includes(a)} onClick={() => toggleFormAllergen(a)}>
                {a}
              </Chip>
            ))}
            {addingAllergen ? (
              <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-[20px] border border-[#4EBEE3] bg-white">
                <input
                  autoFocus
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAllergen();
                    if (e.key === 'Escape') {
                      setAddingAllergen(false);
                      setNewAllergen('');
                    }
                  }}
                  placeholder="New allergen"
                  className="w-[110px] bg-transparent outline-none text-[13px] text-[#19233a]"
                />
                <button
                  type="button"
                  onClick={commitAllergen}
                  title="Add allergen"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4EBEE3] text-white hover:bg-[#3da5ca] cursor-pointer flex-shrink-0"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingAllergen(false);
                    setNewAllergen('');
                  }}
                  title="Cancel"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAddingAllergen(true)}
                title="Add new allergen"
                className="inline-flex items-center gap-1 text-[13px] px-[13px] py-2 rounded-[20px] border border-dashed border-[#d6dae6] text-[#5d6678] hover:border-[#4EBEE3] hover:text-[#1d7da3] cursor-pointer transition-colors"
              >
                <Plus size={14} />
                New
              </button>
            )}
          </div>
          <div className="text-[12px] text-[#9099ab] mt-2">
            New sections and allergens are saved to the library and available everywhere.
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
        title="Reference Lists"
        right={
          <Btn
            variant="primary"
            onClick={() => {
              setAddForm({ en: '', ar: '', code: '', active: true });
              setAddModalOpen(true);
            }}
          >
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
      <Card className="max-w-[540px] w-full">
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

  const refListAddModal = addModalOpen && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
      onClick={() => setAddModalOpen(false)}
    >
      <Card className="max-w-[480px] w-full" onClick={(e) => e.stopPropagation()}>
        <CardHead
          title={addLabel[tab]}
          sub={`Add a new ${tab.slice(0, -1)} to the library`}
          right={
            <button
              onClick={() => setAddModalOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          }
        />
        <div className="p-5 flex flex-col gap-4">
          {tab === 'sections' && (
            <>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Section Name (English)</label>
                <input
                  type="text"
                  value={addForm.en}
                  onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a]"
                  placeholder="e.g. Appetizers"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium text-right">Section Name (Arabic)</label>
                <input
                  type="text"
                  value={addForm.ar}
                  onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right"
                  placeholder="اسم القسم"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#e7e9f0] mt-1 pt-3">
                <span className="text-[13.5px] font-medium text-[#19233a]">Activate</span>
                <Toggle
                  on={addForm.active}
                  onClick={() => setAddForm((f) => ({ ...f, active: !f.active }))}
                />
              </div>
            </>
          )}

          {tab === 'diets' && (
            <>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Diet Name (English)</label>
                <input
                  type="text"
                  value={addForm.en}
                  onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a]"
                  placeholder="e.g. Diabetic Diet"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium text-right">Diet Name (Arabic)</label>
                <input
                  type="text"
                  value={addForm.ar}
                  onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right"
                  placeholder="اسم الحمية الغذائية"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">HL7 Code (HIS Code)</label>
                <input
                  type="text"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-mono"
                  placeholder="e.g. DIAB_01"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#e7e9f0] mt-1 pt-3">
                <span className="text-[13.5px] font-medium text-[#19233a]">Active</span>
                <Toggle
                  on={addForm.active}
                  onClick={() => setAddForm((f) => ({ ...f, active: !f.active }))}
                />
              </div>
            </>
          )}

          {tab === 'allergens' && (
            <div>
              <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Allergen Name</label>
              <input
                type="text"
                value={addForm.en}
                onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a]"
                placeholder="e.g. Peanut"
                autoFocus
              />
            </div>
          )}

          {tab === 'meals' && (
            <div>
              <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Meal Name</label>
              <input
                type="text"
                value={addForm.en}
                onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a]"
                placeholder="e.g. Afternoon Tea"
                autoFocus
              />
            </div>
          )}
        </div>
        <Bar>
          <Btn variant="neutral" onClick={() => setAddModalOpen(false)}>
            Cancel
          </Btn>
          <div className="flex-grow" />
          <Btn
            variant="neutral"
            onClick={() => handleSave(true)}
            className="border-[#d6dae6] hover:bg-[#f7f8fb] text-[#19233a]"
          >
            Save & Add Another
          </Btn>
          <Btn variant="primary" onClick={() => handleSave(false)}>
            Save & Close
          </Btn>
        </Bar>
      </Card>
    </div>
  );

  return (
    <FoodPage>
      {view === 'dishes' && viewDishes}
      {view === 'dish' && viewDishForm}
      {view === 'reflists' && viewRefLists}
      {importModal}
      {refListAddModal}
    </FoodPage>
  );
}
