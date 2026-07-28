import { useEffect, useRef, useState } from 'react';
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
  PlugZap,
  Clock,
  X,
  Check,
  Trash2,
  RefreshCw,
  Pencil,
  Image as ImageIcon,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood, resetFood } from './foodStore';
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
  FoodPage,
} from './foodAtoms';
import { SingleSelectDropdown, MultiSelectDropdown } from '../UnifiedDropdown';
import PillTabs from '../PillTabs';

type View = 'dishes' | 'reflists';
type RefTab = 'sections' | 'diets' | 'allergens' | 'meals';
type Mode = 'dishes' | 'reflists';

const blankDish = () => ({ en: '', ar: '', section: 'Mains', allergens: [] as string[], on: true, photo: '' });

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
    setDishModalOpen(false);
  }, [mode]);
  const [tab, setTab] = useState<RefTab>('sections');
  const [dishIdx, setDishIdx] = useState<number | null>(null);
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [form, setForm] = useState<any>(blankDish());
  const [importOpen, setImportOpen] = useState(false);
  const [dishSearch, setDishSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editingField, setEditingField] = useState<{ i: number; field: 'en' | 'ar' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filterSections, setFilterSections] = useState<string[]>([]);
  const [filterAllergens, setFilterAllergens] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
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
  // Reference list inline editing — the tab is part of the key so switching
  // tabs can never leave a stale editor open on a row of the previous list.
  const [refEdit, setRefEdit] = useState<{ tab: RefTab; i: number; field: 'en' | 'ar' | 'his' } | null>(null);
  const [refEditValue, setRefEditValue] = useState('');
  // Row indexes are per-tab, so the selection is cleared whenever the tab changes.
  const [refSelected, setRefSelected] = useState<number[]>([]);
  const [refSearch, setRefSearch] = useState('');
  const [refStatuses, setRefStatuses] = useState<string[]>([]);

  // ---- navigation helpers --------------------------------------------------

  const openDish = (i: number | null) => {
    setDishIdx(i);
    setForm(i != null ? { ...blankDish(), ...db.dishes[i] } : blankDish());
    setAddingSection(false);
    setNewSection('');
    setAddingAllergen(false);
    setNewAllergen('');
    setDishModalOpen(true);
  };

  const closeDish = () => setDishModalOpen(false);

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
        d.allergensAr = { ...(d.allergensAr || {}), [enName]: (addForm.ar || '').trim() };
        success = true;
      } else if (tab === 'meals') {
        const exists = d.meals.some((x: string) => x.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        d.meals.push(enName);
        d.mealsAr = { ...(d.mealsAr || {}), [enName]: (addForm.ar || '').trim() };
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

  // ---- reference list inline editing --------------------------------------
  // The add modal only creates rows, so inline editing is the only way to
  // correct an existing entry.

  const refRowValue = (t: RefTab, i: number, field: 'en' | 'ar' | 'his'): string => {
    if (t === 'sections') return db.sections[i]?.[field] || '';
    if (t === 'diets') return db.diets[i]?.[field] || '';
    if (t === 'allergens') {
      const name = db.allergens[i] || '';
      return field === 'ar' ? db.allergensAr?.[name] || '' : name;
    }
    const meal = db.meals[i] || '';
    return field === 'ar' ? db.mealsAr?.[meal] || '' : meal;
  };

  const refNames = (t: RefTab): string[] =>
    t === 'sections' ? db.sections.map((s: any) => s.en)
      : t === 'diets' ? db.diets.map((x: any) => x.en)
      : t === 'allergens' ? db.allergens
      : db.meals;

  const startRefEdit = (i: number, field: 'en' | 'ar' | 'his', currentValue: string) => {
    setRefEdit({ tab, i, field });
    setRefEditValue(currentValue || '');
  };

  const cancelRefEdit = () => {
    setRefEdit(null);
    setRefEditValue('');
  };

  const saveRefEdit = () => {
    if (!refEdit) return;
    const { tab: t, i, field } = refEdit;
    const val = refEditValue.trim();
    const prev = refRowValue(t, i, field);
    const done = () => {
      setRefEdit(null);
      setRefEditValue('');
    };

    if (val === prev) {
      done();
      return;
    }
    // Only the English name is required — Arabic and the HIS code may be blank.
    if (field === 'en' && !val) {
      toast.error('Name is required');
      done();
      return;
    }
    if (field === 'en' && refNames(t).some((n, idx) => idx !== i && n.toLowerCase() === val.toLowerCase())) {
      toast.error(`${val} already exists`);
      done();
      return;
    }

    updateFood((d: any) => {
      if (t === 'sections') {
        // Dishes and every set's menu tree reference the section by name, so
        // carry the rename across both or the section drops out of the menus.
        if (field === 'en') {
          d.dishes.forEach((x: any) => { if (x.section === prev) x.section = val; });
          d.sets.forEach((set: any) => {
            Object.values(set.menu || {}).forEach((byMeal: any) => {
              Object.values(byMeal).forEach((secs: any) => {
                secs.forEach((sec: any) => { if (sec.sec === prev) sec.sec = val; });
              });
            });
          });
        }
        d.sections[i][field] = val;
      } else if (t === 'diets') {
        // Menu sets key their menu tree by diet name and list the diets they
        // cover by name — both have to follow the rename.
        if (field === 'en') {
          d.sets.forEach((set: any) => {
            if (Array.isArray(set.diets)) set.diets = set.diets.map((x: string) => (x === prev ? val : x));
            if (set.menu && set.menu[prev]) {
              set.menu[val] = set.menu[prev];
              delete set.menu[prev];
            }
          });
        }
        d.diets[i][field] = val;
      } else if (t === 'allergens') {
        if (field === 'ar') {
          d.allergensAr = { ...(d.allergensAr || {}), [d.allergens[i]]: val };
        } else {
          // Same for allergen tags — a rename must not orphan the safety check.
          d.dishes.forEach((x: any) => {
            if (x.allergens) x.allergens = x.allergens.map((a: string) => (a === prev ? val : a));
          });
          d.allergens[i] = val;
          // Carry the Arabic label over to the new key.
          const map = { ...(d.allergensAr || {}) };
          if (map[prev] !== undefined) {
            map[val] = map[prev];
            delete map[prev];
            d.allergensAr = map;
          }
        }
      } else {
        if (field === 'ar') {
          d.mealsAr = { ...(d.mealsAr || {}), [d.meals[i]]: val };
        } else {
          // Meals are a second key inside each set's menu tree (diet -> meal).
          d.sets.forEach((set: any) => {
            if (Array.isArray(set.meals)) set.meals = set.meals.map((x: string) => (x === prev ? val : x));
            Object.values(set.menu || {}).forEach((byMeal: any) => {
              if (byMeal[prev]) {
                byMeal[val] = byMeal[prev];
                delete byMeal[prev];
              }
            });
          });
          d.meals[i] = val;
          const map = { ...(d.mealsAr || {}) };
          if (map[prev] !== undefined) {
            map[val] = map[prev];
            delete map[prev];
            d.mealsAr = map;
          }
        }
      }
    });
    done();
    toast.success('Updated successfully');
  };

  // ---- reference list search / filter --------------------------------------

  // Only sections and diets carry an on/off state — allergens and meals don't,
  // so the status filter is hidden (and skipped) on those two tabs.
  const refHasStatus = tab === 'sections' || tab === 'diets';
  const refStatusOf = (i: number): boolean =>
    tab === 'sections' ? !!db.sections[i]?.on : !!db.diets[i]?.on;

  const refQ = refSearch.trim().toLowerCase();
  // Rows carry their index in the store, not their index after filtering, so
  // inline edit / select / delete keep pointing at the right entry.
  const refRows: number[] = refNames(tab)
    .map((_: string, i: number) => i)
    .filter((i: number) => {
      if (refQ) {
        const en = refRowValue(tab, i, 'en').toLowerCase();
        const ar = refRowValue(tab, i, 'ar');
        if (!en.includes(refQ) && !ar.includes(refSearch.trim())) return false;
      }
      if (refHasStatus && refStatuses.length > 0) {
        if (!refStatuses.includes(refStatusOf(i) ? 'Active' : 'Inactive')) return false;
      }
      return true;
    });

  const refFiltered = refQ.length > 0 || refStatuses.length > 0;

  // How many menus a section feeds: every diet × meal slot across every menu
  // set whose section list includes it.
  const menuUseCount = (sectionName: string): number => {
    let n = 0;
    db.sets.forEach((set: any) => {
      Object.values(set.menu || {}).forEach((byMeal: any) => {
        Object.values(byMeal).forEach((secs: any) => {
          if (Array.isArray(secs) && secs.some((sec: any) => sec.sec === sectionName)) n++;
        });
      });
    });
    return n;
  };

  // ---- reference list selection + delete -----------------------------------

  const refAllSelected = refRows.length > 0 && refSelected.length === refRows.length;

  const toggleRefRow = (i: number) =>
    setRefSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const toggleRefAll = () =>
    setRefSelected((prev) => (prev.length === refRows.length ? [] : [...refRows]));

  // Deleting only shrinks the reference list and the menu sets built from it.
  // Dishes keep the name they already carry, so a dish never silently loses its
  // section or, more importantly, an allergy tag the safety check relies on.
  const deleteRefIndexes = (idxs: number[]) => {
    const t = tab;
    const ordered = [...idxs].sort((a, b) => b - a);
    updateFood((d: any) => {
      ordered.forEach((i) => {
        if (t === 'sections') {
          const name = d.sections[i].en;
          d.sections.splice(i, 1);
          d.sets.forEach((set: any) => {
            Object.values(set.menu || {}).forEach((byMeal: any) => {
              Object.keys(byMeal).forEach((meal) => {
                byMeal[meal] = byMeal[meal].filter((sec: any) => sec.sec !== name);
              });
            });
          });
        } else if (t === 'diets') {
          const name = d.diets[i].en;
          d.diets.splice(i, 1);
          d.sets.forEach((set: any) => {
            if (Array.isArray(set.diets)) set.diets = set.diets.filter((x: string) => x !== name);
            if (set.menu) delete set.menu[name];
          });
        } else if (t === 'allergens') {
          const name = d.allergens[i];
          d.allergens.splice(i, 1);
          if (d.allergensAr) delete d.allergensAr[name];
        } else {
          const name = d.meals[i];
          d.meals.splice(i, 1);
          d.sets.forEach((set: any) => {
            if (Array.isArray(set.meals)) set.meals = set.meals.filter((x: string) => x !== name);
            Object.values(set.menu || {}).forEach((byMeal: any) => {
              delete byMeal[name];
            });
          });
        }
      });
    });
    cancelRefEdit();
    setRefSelected([]);
  };

  const deleteRefRow = (i: number) => {
    const name = refNames(tab)[i] || 'Entry';
    deleteRefIndexes([i]);
    toast(`${name} deleted`);
  };

  const deleteRefSelected = () => {
    if (!refSelected.length) return;
    const count = refSelected.length;
    deleteRefIndexes(refSelected);
    toast(`${count} ${count > 1 ? 'entries' : 'entry'} deleted`);
  };

  // Read the picked image as a data URL. The food store is in-memory only, so
  // this lives for the session — no localStorage quota to worry about.
  const pickPhoto = (e: any) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patchForm({ photo: String(reader.result || '') });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveDish = (keepOpen: boolean) => {
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
    toast('Dish saved');
    if (keepOpen) {
      // Fall back to "add" mode so the next save appends instead of
      // overwriting the dish we just stored.
      setDishIdx(null);
      setForm(blankDish());
      setAddingSection(false);
      setNewSection('');
      setAddingAllergen(false);
      setNewAllergen('');
    } else {
      setDishModalOpen(false);
    }
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
    .filter(({ dish }: any) => {
      if (q && !(dish.en || '').toLowerCase().includes(q) && !(dish.ar || '').includes(dishSearch.trim())) return false;
      if (filterSections.length > 0 && !filterSections.includes(dish.section)) return false;
      if (filterAllergens.length > 0 && !(dish.allergens || []).some((a: string) => filterAllergens.includes(a))) return false;
      if (filterStatuses.length > 0) {
        const isActive = dish.on ? 'Active' : 'Inactive';
        if (!filterStatuses.includes(isActive)) return false;
      }
      return true;
    });

  const handleRowSelect = (i: number) => {
    setSelectedRows(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === dishRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(dishRows.map(({ i }: any) => i));
    }
  };

  // ---- inline editing (names only — everything else is edited in the dish form) ----

  const startInlineEdit = (i: number, field: 'en' | 'ar', currentValue: string) => {
    setEditingField({ i, field });
    setEditValue(currentValue || '');
  };

  const handleInlinePhoto = (e: any, i: number) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateFood((d: any) => {
        d.dishes[i].photo = String(reader.result || '');
      });
      toast.success('Photo updated');
    };
    reader.readAsDataURL(file);
  };

  const saveInlineEdit = () => {
    if (!editingField) return;
    const { i, field } = editingField;
    const val = editValue.trim();
    if (field === 'en' && !val) {
      toast.error('Dish name is required');
      setEditingField(null);
      setEditValue('');
      return;
    }
    updateFood((d: any) => {
      d.dishes[i][field] = val;
    });
    setEditingField(null);
    setEditValue('');
    toast.success('Updated successfully');
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Rows open the dish form when you click anywhere that isn't an interactive
  // control. The one case that shouldn't is clicking away from an open inline
  // editor — that click is a dismissal, not a request to open the form. mousedown
  // runs before the input's blur, so it's where the pre-blur state is still readable.
  const editorWasOpen = useRef(false);
  const openDishFromRow = (i: number) => {
    if (editorWasOpen.current) {
      editorWasOpen.current = false;
      return;
    }
    openDish(i);
  };

  const handleDeleteRow = (i: number) => {
    const name = db.dishes[i]?.en || 'Dish';
    updateFood((d: any) => {
      d.dishes.splice(i, 1);
    });
    setSelectedRows(prev => prev.filter(x => x !== i).map(x => (x > i ? x - 1 : x)));
    toast(`${name} deleted`);
  };

  const handleDeleteSelected = () => {
    if (!selectedRows.length) return;
    const count = selectedRows.length;
    // Remove in descending order so indexes don't shift
    const sorted = [...selectedRows].sort((a, b) => b - a);
    updateFood((d: any) => {
      sorted.forEach(idx => d.dishes.splice(idx, 1));
    });
    setSelectedRows([]);
    toast(`${count} dish${count > 1 ? 'es' : ''} deleted`);
  };

  const hasSelectedRows = selectedRows.length > 0;
  const inlineInputCls = "w-full px-2 py-1 border border-[#4EBEE3] rounded text-[13px] font-['Poppins',sans-serif] text-[#19233a] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20";

  const sectionOptions = db.sections.map((s: any) => ({ value: s.en, label: s.en }));
  const allergenOptions = db.allergens.map((a: string) => ({ value: a, label: a }));
  const statusOptions = [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }];
  const hasActiveFilters = filterSections.length > 0 || filterAllergens.length > 0 || filterStatuses.length > 0;

  const viewDishes = (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Menu Dishes</h1>
          <div className="text-[14px] text-[#6B7280]">{db.dishes.length} dishes in the library</div>
        </div>
        <div className="flex gap-2">
          {hasSelectedRows && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
            >
              <Trash2 size={16} strokeWidth={2} />
              Delete ({selectedRows.length})
            </button>
          )}
          <Btn
            variant="neutral"
            onClick={() => { resetFood(); toast('Demo data reset'); }}
            title="Reset demo data"
            className="!px-2.5"
          >
            <RefreshCw size={16} className="text-[#5d6678]" />
          </Btn>
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

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={dishSearch}
            onChange={(e) => setDishSearch(e.target.value)}
            placeholder="Search dishes by name..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
          />
        </div>
        <div className="flex-1" />
        <MultiSelectDropdown
          options={sectionOptions}
          selectedValues={filterSections}
          onChange={setFilterSections}
          placeholder="Section"
          className="min-w-[160px]"
          showSelectAll={false}
        />
        <MultiSelectDropdown
          options={allergenOptions}
          selectedValues={filterAllergens}
          onChange={setFilterAllergens}
          placeholder="Allergens"
          className="min-w-[160px]"
          showSelectAll={false}
        />
        <MultiSelectDropdown
          options={statusOptions}
          selectedValues={filterStatuses}
          onChange={setFilterStatuses}
          placeholder="Status"
          className="min-w-[140px]"
          showSelectAll={false}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {dishRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <Salad size={26} />
            </div>
            <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              {q || hasActiveFilters ? 'No dishes match your filters' : 'No dishes yet'}
            </div>
            <div className="text-[13px] text-[#5d6678] mt-1">
              {q || hasActiveFilters
                ? 'Try adjusting filters, or clear the search.'
                : 'Add your first dish to the library.'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4 text-left" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={dishRows.length > 0 && selectedRows.length === dishRows.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]" style={{ width: '76px' }}>
                    Photo
                  </th>
                  <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Dish Name (EN)
                  </th>
                  <th className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Dish Name (AR)
                  </th>
                  <th className="py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Allergens
                  </th>
                  <th className="py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Section
                  </th>
                  <th className="py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                    Active
                  </th>
                  <th className="py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]" style={{ width: '96px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {dishRows.map(({ dish, i }: any) => (
                  <tr
                    key={i}
                    onMouseDown={() => { editorWasOpen.current = editingField != null; }}
                    onClick={() => openDishFromRow(i)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(i)}
                        onChange={() => handleRowSelect(i)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="relative block w-11 h-11 cursor-pointer group"
                        title={dish.photo ? 'Change photo' : 'Add photo'}
                      >
                        {dish.photo ? (
                          <img
                            src={dish.photo}
                            alt=""
                            className="w-11 h-11 rounded-[8px] object-cover border border-[#e7e9f0]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-[8px] bg-[#f7f8fb] border border-[#eef1f7] flex items-center justify-center text-[#c3c9d6]">
                            <ImageIcon size={17} />
                          </div>
                        )}
                        <span className="absolute inset-0 rounded-[8px] bg-[#16274D]/55 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Pencil size={14} />
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleInlinePhoto(e, i)}
                        />
                      </label>
                    </td>
                    <td className="py-3.5 px-4">
                      {editingField?.i === i && editingField.field === 'en' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit();
                            if (e.key === 'Escape') cancelInlineEdit();
                          }}
                          autoFocus
                          className={inlineInputCls}
                        />
                      ) : (
                        <span
                          onClick={(e) => { e.stopPropagation(); startInlineEdit(i, 'en', dish.en); }}
                          className="cursor-pointer hover:text-[#4EBEE3] transition-colors font-medium text-[#19233a] text-[13.5px] font-['Poppins',sans-serif]"
                        >
                          {dish.en}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {editingField?.i === i && editingField.field === 'ar' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit();
                            if (e.key === 'Escape') cancelInlineEdit();
                          }}
                          autoFocus
                          dir="rtl"
                          className={inlineInputCls}
                        />
                      ) : dish.ar ? (
                        <span
                          onClick={(e) => { e.stopPropagation(); startInlineEdit(i, 'ar', dish.ar); }}
                          dir="rtl"
                          className="inline-block cursor-pointer hover:text-[#4EBEE3] transition-colors text-[13px] text-[#5d6678] font-['Poppins',sans-serif]"
                        >
                          {dish.ar}
                        </span>
                      ) : (
                        <span
                          onClick={(e) => { e.stopPropagation(); startInlineEdit(i, 'ar', ''); }}
                          className="inline-flex items-center gap-1.5 text-[12px] text-[#b9770b] cursor-pointer hover:text-[#4EBEE3] transition-colors"
                        >
                          <AlertTriangle size={13} />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {dish.allergens && dish.allergens.length > 0 ? (
                        <span className="inline-flex items-center text-[12px] px-[9px] py-[3px] rounded-[7px] bg-[#fbf1de] text-[#b9770b] whitespace-nowrap">
                          {dish.allergens.join(' · ')}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#9099ab]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Tag>{dish.section}</Tag>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block" onClick={(e) => e.stopPropagation()}>
                        <Toggle
                          on={dish.on}
                          onClick={() => {
                            updateFood((d: any) => {
                              d.dishes[i].on = !d.dishes[i].on;
                            });
                          }}
                        />
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDish(i); }}
                          className="p-1.5 hover:bg-[#4EBEE3]/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={14} className="text-[#4EBEE3]" strokeWidth={2} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRow(i); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  // ==========================================================================
  // DISH FORM
  // ==========================================================================

  const editing = dishIdx != null;
  // Inputs don't inherit font-family, so Poppins has to be set explicitly here
  // or the fields render in the system font while the dropdown beside them
  // renders in Poppins. Size/colour match SingleSelectDropdown's trigger.
  const inputCls = "w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors font-['Poppins',sans-serif] text-[14px] text-[#16274D] placeholder:text-gray-400";
  // leading + mb are pinned so the label block is exactly 24px tall — the photo
  // square offsets by that to line up with the English name input's top border.
  const labelCls = 'block text-[13px] leading-[18px] text-[#5d6678] mb-1.5';
  const sectionLabelCls = 'block text-[13.5px] font-medium text-[#19233a] mb-2';
  // Both add buttons omit an explicit height: their flex parent stretches them
  // to the row height, so they always match the control sitting next to them
  // (the section dropdown / the allergen chips) even if that height changes.
  const addNewBtn = 'w-[38px] self-stretch inline-flex items-center justify-center rounded-[10px] border border-dashed border-[#bcdce8] bg-white text-[#1d7da3] hover:bg-[#f2fafd] hover:border-[#4EBEE3] cursor-pointer flex-shrink-0 transition-colors';
  const addChipBtn = 'w-[38px] self-stretch inline-flex items-center justify-center rounded-full border border-dashed border-[#d6dae6] text-[#5d6678] hover:border-[#4EBEE3] hover:text-[#1d7da3] cursor-pointer transition-colors';
  const iconConfirm = 'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border border-[#4EBEE3] bg-[#4EBEE3] text-white hover:bg-[#3da5ca] cursor-pointer flex-shrink-0 transition-colors';
  const iconCancel = 'w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border border-[#d6dae6] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer flex-shrink-0 transition-colors';

  const dishModal = dishModalOpen && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
      onClick={closeDish}
    >
      <Card
        className="max-w-[1040px] w-full max-h-[90vh] flex flex-col"
        onClick={(e: any) => e.stopPropagation()}
      >
      <CardHead
        title={editing ? 'Edit dish' : 'Add dish'}
        sub={editing ? 'Update this dish in the library' : 'Add a new dish to the library'}
        right={
          <button
            onClick={closeDish}
            className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        }
      />
      <div className="p-5 flex-1 min-h-0 overflow-y-auto">
        <div className="flex gap-6">
          {/* ---- main column: photo, names, section, allergens ---- */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-4">
              {/* Photo is deliberately quiet — a filled tile, not a dashed
                  drop-zone, so it reads as secondary to the name fields. */}
              <div className="w-[132px] flex-shrink-0 mt-6">
                {form.photo ? (
                  <>
                    <div className="relative w-[132px] h-[110px] rounded-[10px] overflow-hidden border border-[#e7e9f0]">
                      <img src={form.photo} alt="" className="w-full h-full object-cover" />
                      <label
                        title="Change photo"
                        className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/95 shadow-sm text-[#5d6678] hover:text-[#1d7da3] cursor-pointer transition-colors"
                      >
                        <Pencil size={13} />
                        <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
                      </label>
                    </div>
                    <label className="block mt-2 text-center text-[12.5px] text-[#1d7da3] hover:underline cursor-pointer">
                      Change photo
                      <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
                    </label>
                  </>
                ) : (
                  <label className="w-[132px] h-[110px] flex flex-col items-center justify-center gap-1.5 rounded-[10px] bg-[#f7f8fb] border border-[#eef1f7] text-[#9099ab] hover:bg-[#eef1f7] hover:text-[#5d6678] cursor-pointer transition-colors">
                    <ImagePlus size={22} />
                    <span className="text-[12px]">Add photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
                  </label>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Name (English) <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      className={inputCls}
                      value={form.en}
                      onChange={(e) => patchForm({ en: e.target.value })}
                      placeholder="e.g. Grilled chicken"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Name (Arabic) <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      className={inputCls}
                      dir="rtl"
                      value={form.ar}
                      onChange={(e) => patchForm({ ar: e.target.value })}
                      placeholder="اسم الطبق"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelCls}>
                    Section <span className="text-[#EF4444]">*</span>
                  </label>
                  {addingSection ? (
                    <div className="flex gap-2 max-w-[460px]">
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
                      <div className="w-full max-w-[330px]">
                        <SingleSelectDropdown
                          options={db.sections.map((s: any) => s.en)}
                          value={form.section}
                          onChange={(v: string) => patchForm({ section: v })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddingSection(true)}
                        title="Add new section"
                        className={addNewBtn}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className={sectionLabelCls}>Allergens</label>
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
                      className="w-[110px] bg-transparent outline-none text-[13px] text-[#19233a] font-['Poppins',sans-serif]"
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
                    className={addChipBtn}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="text-[12px] text-[#9099ab] mt-2.5">
                New sections and allergens are saved to the library for future use.
              </div>
            </div>
          </div>

          {/* ---- side column: availability + safety note ---- */}
          <div className="w-[290px] flex-shrink-0 border-l border-[#e7e9f0] pl-6">
            <div className="text-[14px] font-semibold text-[#16274D]">Dish availability</div>
            <div className="text-[13px] text-[#5d6678] mt-1 leading-[20px]">
              Active dishes can be added to menus. Inactive dishes remain in the library.
            </div>
            <div className="flex items-center gap-2.5 mt-3.5">
              <Toggle on={form.on} onClick={() => patchForm({ on: !form.on })} />
              <span className="text-[13px] text-[#5d6678]">{form.on ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-4">
              <Note tone="ok" icon={<ShieldCheck size={16} />}>
                Selected allergens are cross-checked against each patient's allergy record before an
                order can be placed.
              </Note>
            </div>
          </div>
        </div>
      </div>
      <Bar>
        <Btn variant="neutral" onClick={closeDish}>
          Cancel
        </Btn>
        <div className="flex-grow" />
        <Btn variant="neutral" onClick={() => saveDish(true)}>
          Save & Add Another
        </Btn>
        <Btn variant="primary" onClick={() => saveDish(false)}>
          Save dish
        </Btn>
      </Bar>
      </Card>
    </div>
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

  const refTabs = [
    { id: 'sections', label: 'Sections' },
    { id: 'diets', label: 'Diets' },
    { id: 'allergens', label: 'Allergens' },
    { id: 'meals', label: 'Meals' },
  ];

  // Table chrome shared with the dishes table above.
  const thLeft = "py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]";
  const thCenter = "py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]";
  const tdCls = 'py-3.5 px-4';
  const refTableCls = 'bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm';
  const refRowCls = 'hover:bg-[#F8FAFC] transition-colors';

  // One editable cell: click the value to swap it for an input in place.
  const refCell = (
    i: number,
    field: 'en' | 'ar' | 'his',
    display: any,
    opts: { rtl?: boolean; mono?: boolean; block?: boolean } = {},
  ) => {
    const isEditing = refEdit?.tab === tab && refEdit.i === i && refEdit.field === field;
    if (isEditing) {
      return (
        <input
          type="text"
          value={refEditValue}
          onChange={(e) => setRefEditValue(e.target.value)}
          onBlur={saveRefEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRefEdit();
            if (e.key === 'Escape') cancelRefEdit();
          }}
          autoFocus
          dir={opts.rtl ? 'rtl' : undefined}
          className={cx(inlineInputCls, opts.mono && 'font-mono', opts.rtl && 'text-right')}
        />
      );
    }
    return (
      <span
        onClick={() => startRefEdit(i, field, refRowValue(tab, i, field))}
        dir={opts.rtl ? 'rtl' : undefined}
        className={cx(
          opts.block === false ? 'inline-block' : 'block',
          // dir="rtl" would otherwise right-align the box; keep Arabic sitting
          // where the dishes table puts it so the two tables read alike.
          opts.rtl && 'text-left',
          'cursor-pointer hover:text-[#4EBEE3] transition-colors',
        )}
        title="Click to edit"
      >
        {display}
      </span>
    );
  };

  const nameCls = "font-medium text-[#19233a] text-[13.5px] font-['Poppins',sans-serif]";
  const arCls = "text-[13px] text-[#5d6678] font-['Poppins',sans-serif]";
  const missingAr = (
    <span className="flex items-center gap-1.5 text-[12px] text-[#b9770b]">
      <AlertTriangle size={13} />
      Missing
    </span>
  );
  const checkboxCls =
    'w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer';

  // Selection + delete chrome is identical on all four tabs.
  const refCheckHead = (
    <th className={thLeft} style={{ width: '50px' }}>
      <input type="checkbox" checked={refAllSelected} onChange={toggleRefAll} className={checkboxCls} />
    </th>
  );
  const refActionsHead = (
    <th className={thCenter} style={{ width: '96px' }}>
      Actions
    </th>
  );
  const refCheckCell = (i: number) => (
    <td className={tdCls}>
      <input
        type="checkbox"
        checked={refSelected.includes(i)}
        onChange={() => toggleRefRow(i)}
        className={checkboxCls}
      />
    </td>
  );
  const refActionsCell = (i: number) => (
    <td className={tdCls}>
      <div className="flex items-center justify-center">
        <button
          onClick={() => deleteRefRow(i)}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 size={14} className="text-red-500" strokeWidth={2} />
        </button>
      </div>
    </td>
  );
  const refEmpty = (
    <div className="flex flex-col items-center justify-center text-center py-14 px-5">
      <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
        <Salad size={26} />
      </div>
      <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">
        {refFiltered ? `No ${tab} match your filters` : `No ${tab} yet`}
      </div>
      <div className="text-[13px] text-[#5d6678] mt-1">
        {refFiltered
          ? 'Try adjusting filters, or clear the search.'
          : `Add your first entry with ${addLabel[tab]}.`}
      </div>
    </div>
  );
  // The Arabic cell renders the same three ways everywhere: value, or the amber
  // "Missing" badge, or an input once it's being edited.
  const refArCell = (i: number, value: string) => (
    <td className={tdCls}>
      {refCell(i, 'ar', value ? <span className={arCls}>{value}</span> : missingAr, { rtl: !!value })}
    </td>
  );

  const viewRefLists = (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Reference Lists</h1>
          <div className="text-[14px] text-[#6B7280]">
            The shared lists every dish and menu is built from
          </div>
        </div>
        <div className="flex gap-2">
          {refSelected.length > 0 && (
            <button
              onClick={deleteRefSelected}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
            >
              <Trash2 size={16} strokeWidth={2} />
              Delete ({refSelected.length})
            </button>
          )}
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
        </div>
      </div>

      <PillTabs
        tabs={refTabs}
        activeTab={tab}
        onChange={(id) => {
          cancelRefEdit();
          setRefSelected([]);
          setRefSearch('');
          setRefStatuses([]);
          setTab(id as RefTab);
        }}
        className="mb-5"
      />

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={refSearch}
            onChange={(e) => {
              setRefSearch(e.target.value);
              setRefSelected([]);
            }}
            placeholder={`Search ${tab} by name...`}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] font-['Poppins',sans-serif]"
          />
        </div>
        <div className="flex-1" />
        {refHasStatus && (
          <MultiSelectDropdown
            options={statusOptions}
            selectedValues={refStatuses}
            onChange={(v: string[]) => {
              setRefStatuses(v);
              setRefSelected([]);
            }}
            placeholder="Status"
            className="min-w-[140px]"
            showSelectAll={false}
          />
        )}
      </div>

      {tab === 'sections' && (
        <>
          <div className={refTableCls}>
            {refRows.length === 0 ? refEmpty : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    {refCheckHead}
                    <th className={thLeft}>Section Name (EN)</th>
                    <th className={thLeft}>Section Name (AR)</th>
                    <th className={thCenter}>Used in</th>
                    <th className={thCenter} style={{ width: '90px' }}>
                      Active
                    </th>
                    {refActionsHead}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {refRows.map((i: number) => {
                    const s = db.sections[i];
                    const count = menuUseCount(s.en);
                    return (
                      <tr key={i} className={refRowCls}>
                        {refCheckCell(i)}
                        <td className={tdCls}>
                          {refCell(i, 'en', <span className={nameCls}>{s.en}</span>)}
                        </td>
                        {refArCell(i, s.ar)}
                        <td className={cx(tdCls, 'text-center')}>
                          <Badge tone="mute">
                            {count} menu{count === 1 ? '' : 's'}
                          </Badge>
                        </td>
                        <td className={cx(tdCls, 'text-center')}>
                          <div className="flex justify-center">
                            <Toggle
                              on={s.on}
                              onClick={() =>
                                updateFood((d: any) => {
                                  d.sections[i].on = !d.sections[i].on;
                                })
                              }
                            />
                          </div>
                        </td>
                        {refActionsCell(i)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
          <div className="mt-4">
            <Note tone="info" icon={<Info size={16} />}>
              Sections appear on the patient screen in the order listed here.
            </Note>
          </div>
        </>
      )}

      {tab === 'diets' && (
        <>
          <div className={refTableCls}>
            {refRows.length === 0 ? refEmpty : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    {refCheckHead}
                    <th className={thLeft}>Diet Name (EN)</th>
                    <th className={thLeft}>Diet Name (AR)</th>
                    <th className={thCenter}>HIS Code</th>
                    <th className={thCenter} style={{ width: '90px' }}>
                      Active
                    </th>
                    {refActionsHead}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {refRows.map((i: number) => {
                    const dt = db.diets[i];
                    return (
                    <tr key={i} className={refRowCls}>
                      {refCheckCell(i)}
                      <td className={tdCls}>
                        {refCell(i, 'en', <span className={nameCls}>{dt.en}</span>)}
                      </td>
                      {refArCell(i, dt.ar)}
                      <td className={cx(tdCls, 'text-center')}>
                        {refCell(
                          i,
                          'his',
                          dt.his ? (
                            <Badge tone="info" className="font-mono">
                              {dt.his}
                            </Badge>
                          ) : (
                            <span className="text-[12px] text-[#9099ab]">—</span>
                          ),
                          { mono: true, block: false },
                        )}
                      </td>
                      <td className={cx(tdCls, 'text-center')}>
                        <div className="flex justify-center">
                          <Toggle
                            on={dt.on}
                            onClick={() =>
                              updateFood((d: any) => {
                                d.diets[i].on = !d.diets[i].on;
                              })
                            }
                          />
                        </div>
                      </td>
                      {refActionsCell(i)}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
          <div className="mt-4">
            <Note tone="info" icon={<PlugZap size={16} />}>
              The HIS code is how a doctor's diet order automatically picks the right menu for each
              patient.
            </Note>
          </div>
        </>
      )}

      {tab === 'allergens' && (
        <>
          <div className={refTableCls}>
            {refRows.length === 0 ? refEmpty : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    {refCheckHead}
                    <th className={thLeft}>Allergen (EN)</th>
                    <th className={thLeft}>Allergen (AR)</th>
                    <th className={thCenter} style={{ width: '160px' }}>
                      Used in
                    </th>
                    {refActionsHead}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {refRows.map((i: number) => {
                    const a = db.allergens[i];
                    const count = db.dishes.filter(
                      (x: any) => x.allergens && x.allergens.includes(a),
                    ).length;
                    return (
                      <tr key={i} className={refRowCls}>
                        {refCheckCell(i)}
                        <td className={tdCls}>
                          {refCell(i, 'en', <span className={nameCls}>{a}</span>)}
                        </td>
                        {refArCell(i, db.allergensAr?.[a] || '')}
                        <td className={cx(tdCls, 'text-center')}>
                          <Badge tone="mute">
                            {count} dish{count === 1 ? '' : 'es'}
                          </Badge>
                        </td>
                        {refActionsCell(i)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
          <div className="mt-4">
            <Note tone="warn" icon={<AlertTriangle size={16} />}>
              Allergens drive the safety check — a dish tagged here is blocked for any patient who
              lists that allergy.
            </Note>
          </div>
        </>
      )}

      {tab === 'meals' && (
        <>
          <div className={refTableCls}>
            {refRows.length === 0 ? refEmpty : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    {refCheckHead}
                    <th className={thLeft}>Meal (EN)</th>
                    <th className={thLeft}>Meal (AR)</th>
                    <th className={thCenter} style={{ width: '160px' }}>
                      Order
                    </th>
                    {refActionsHead}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {refRows.map((i: number) => {
                    const m = db.meals[i];
                    return (
                    <tr key={i} className={refRowCls}>
                      {refCheckCell(i)}
                      <td className={tdCls}>
                        {refCell(i, 'en', <span className={nameCls}>{m}</span>)}
                      </td>
                      {refArCell(i, db.mealsAr?.[m] || '')}
                      <td className={cx(tdCls, 'text-center')}>
                        <span className="text-[13px] text-[#5d6678]">#{i + 1}</span>
                      </td>
                      {refActionsCell(i)}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
          <div className="mt-4">
            <Note tone="info" icon={<Clock size={16} />}>
              Meals share one ordering window in this hospital — set it inside each menu set.
            </Note>
          </div>
        </>
      )}
    </>
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
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-['Poppins',sans-serif]"
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
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right font-['Poppins',sans-serif]"
                  placeholder="مثال: المقبلات"
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
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-['Poppins',sans-serif]"
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
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right font-['Poppins',sans-serif]"
                  placeholder="مثال: حمية مرضى السكري"
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
            <>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Allergen Name (English)</label>
                <input
                  type="text"
                  value={addForm.en}
                  onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-['Poppins',sans-serif]"
                  placeholder="e.g. Peanut"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium text-right">Allergen Name (Arabic)</label>
                <input
                  type="text"
                  value={addForm.ar}
                  onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right font-['Poppins',sans-serif]"
                  placeholder="مثال: فول سوداني"
                  dir="rtl"
                />
              </div>
            </>
          )}

          {tab === 'meals' && (
            <>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Meal Name (English)</label>
                <input
                  type="text"
                  value={addForm.en}
                  onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-['Poppins',sans-serif]"
                  placeholder="e.g. Afternoon Tea"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium text-right">Meal Name (Arabic)</label>
                <input
                  type="text"
                  value={addForm.ar}
                  onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] text-right font-['Poppins',sans-serif]"
                  placeholder="مثال: شاي العصر"
                  dir="rtl"
                />
              </div>
            </>
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
            Save
          </Btn>
        </Bar>
      </Card>
    </div>
  );

  return (
    <FoodPage>
      {view === 'dishes' && viewDishes}
      {view === 'reflists' && viewRefLists}
      {dishModal}
      {importModal}
      {refListAddModal}
    </FoodPage>
  );
}
