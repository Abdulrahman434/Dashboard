import { Fragment, useEffect, useState } from 'react';
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
  Pencil,
  Trash2,
  ListChecks,
  ChevronDown,
  Settings,
  Power,
  PowerOff,
  Utensils,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood, ruleText, ruleTextAr, mealServingTime } from './foodStore';
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
  MiniSeg,
  Stepper,
} from './foodAtoms';
import { SingleSelectDropdown } from '../UnifiedDropdown';
import TableSortIcon from '../TableSortIcon';
import PillTabs from '../PillTabs';
import DishImportWizard from './DishImportWizard';

type View = 'dishes' | 'dish' | 'reflists';
type RefTab = 'sections' | 'diets' | 'allergens' | 'meals';
type Mode = 'dishes' | 'reflists';

const blankDish = () => ({ en: '', ar: '', section: 'Mains', allergens: [] as string[], on: true });

// Default Arabic labels for the built-in allergens & meals (data stays plain
// strings; editable overrides live in db.allergenAr / db.mealMeta).
// Default when a diet has no print colour yet — deliberately a neutral slate so
// an unconfigured diet looks unset on the ticket rather than plausibly styled.
const DIET_COLOR_FALLBACK = '#475569';
// Starting points for the picker; any hex is still allowed.
const DIET_COLOR_PRESETS = [
  '#6B3FA0', '#1F5C93', '#1E6B4D', '#A81E5F',
  '#9A7620', '#2E7D7B', '#C05A2E', '#8C5E2A',
  '#B03A48', '#475569',
];
const ALLERGEN_AR: Record<string, string> = {
  Milk: 'حليب', Egg: 'بيض', Gluten: 'جلوتين', Nuts: 'مكسرات', Fish: 'سمك',
  Shellfish: 'محار', Soy: 'صويا', Sesame: 'سمسم', Peanut: 'فول سوداني',
};
const MEAL_AR: Record<string, string> = { Breakfast: 'الإفطار', Lunch: 'الغداء', Dinner: 'العشاء' };

// Read an image File, downscale it to `maxDim` on its longest side, and return
// a compressed base64 data URL — keeps the in-memory store small and fast.
// Downscale to maxDim and encode as JPEG, lowering quality until the result is
// under maxBytes (default 400 KB) so stored meal images stay small.
function shrinkImage(file: File, maxDim: number, maxBytes = 400 * 1024): Promise<string> {
  const dataUrlBytes = (u: string) => Math.round((u.length - (u.indexOf(',') + 1)) * 0.75);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(String(reader.result)); return; }
        ctx.drawImage(img, 0, 0, w, h);
        let q = 0.85;
        let out = canvas.toDataURL('image/jpeg', q);
        while (dataUrlBytes(out) > maxBytes && q > 0.4) {
          q -= 0.1;
          out = canvas.toDataURL('image/jpeg', q);
        }
        resolve(out);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

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
  const [dishSort, setDishSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [dishToDelete, setDishToDelete] = useState<number | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [filterSection, setFilterSection] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAllergen, setFilterAllergen] = useState('All');
  const [dishGroupBy, setDishGroupBy] = useState<'none' | 'section' | 'allergen' | 'status'>('none');
  const [collapsedDishGroups, setCollapsedDishGroups] = useState<string[]>([]);
  const toggleDishGroup = (key: string) =>
    setCollapsedDishGroups((c) => (c.includes(key) ? c.filter((x) => x !== key) : [...c, key]));
  const [refToDelete, setRefToDelete] = useState<{ kind: RefTab; idx: number } | null>(null);
  const [refSel, setRefSel] = useState<Set<number>>(new Set());
  const [refBulkMenuOpen, setRefBulkMenuOpen] = useState(false);
  const [refBulkDeleteOpen, setRefBulkDeleteOpen] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  const [refSort, setRefSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  // Inline "add new" state for the dish form (section + allergen).
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [addingAllergen, setAddingAllergen] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');

  // Reference List Add Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({
    en: '',
    ar: '',
    code: '',
    active: true,
    min: 1,
    max: 1,
    forAll: false,
    regular: '',
    landscape: '',
    start: '',
    end: '',
    color: DIET_COLOR_FALLBACK,
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
        const exists = d.sections.some((x: any, i: number) => i !== editIdx && x.en.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        const rule = addForm.forAll
          ? { min: 0, max: 1, forAll: true }
          : { min: addForm.min, max: addForm.max, forAll: false };
        if (editIdx != null) {
          d.sections[editIdx] = { ...d.sections[editIdx], en: enName, ar: arName, on: addForm.active, ...rule };
        } else {
          d.sections.push({ en: enName, ar: arName, on: addForm.active, ...rule });
        }
        success = true;
      } else if (tab === 'diets') {
        const arName = (addForm.ar || '').trim();
        const exists = d.diets.some((x: any, i: number) => i !== editIdx && x.en.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        const color = (addForm.color || DIET_COLOR_FALLBACK).trim();
        if (editIdx != null) {
          d.diets[editIdx] = { ...d.diets[editIdx], en: enName, ar: arName, his: (addForm.code || '').trim(), on: addForm.active, color };
        } else {
          d.diets.push({ en: enName, ar: arName, his: (addForm.code || '').trim(), on: addForm.active, color });
        }
        success = true;
      } else if (tab === 'allergens') {
        const exists = d.allergens.some((x: string, i: number) => i !== editIdx && x.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        if (!d.allergenAr) d.allergenAr = {};
        const arName = (addForm.ar || '').trim();
        if (editIdx != null) {
          const oldName = d.allergens[editIdx];
          d.allergens[editIdx] = enName;
          if (oldName && oldName !== enName) delete d.allergenAr[oldName];
        } else {
          d.allergens.push(enName);
        }
        if (arName) d.allergenAr[enName] = arName; else delete d.allergenAr[enName];
        success = true;
      } else if (tab === 'meals') {
        const exists = d.meals.some((x: string, i: number) => i !== editIdx && x.toLowerCase() === enName.toLowerCase());
        if (exists) return;
        if (!d.mealMeta) d.mealMeta = {};
        const meta = { ar: (addForm.ar || '').trim(), regular: addForm.regular || '', landscape: addForm.landscape || '', start: (addForm.start || '').trim(), end: (addForm.end || '').trim() };
        if (editIdx != null) {
          const oldName = d.meals[editIdx];
          d.meals[editIdx] = enName;
          if (oldName && oldName !== enName) delete d.mealMeta[oldName];
        } else {
          d.meals.push(enName);
        }
        d.mealMeta[enName] = meta;
        success = true;
      }
    });

    if (success) {
      toast.success(editIdx != null ? `${enName} updated` : `${enName} added successfully`);
      if (keepOpen && editIdx == null) {
        setAddForm({ en: '', ar: '', code: '', active: true, min: 1, max: 1, forAll: false, regular: '', landscape: '', start: '', end: '', color: DIET_COLOR_FALLBACK });
      } else {
        setAddModalOpen(false);
        setEditIdx(null);
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

    // Editing an existing dish — save straight away.
    if (dishIdx != null) {
      updateFood((d: any) => {
        d.dishes[dishIdx] = { ...d.dishes[dishIdx], ...tmp };
      });
      setView('dishes');
      toast('Dish saved');
      return;
    }

    // Adding a new dish — detect duplicate name (case-insensitive) and handle it
    // the same way as the Excel import: offer to merge missing data or skip.
    const isDup = db.dishes.some(
      (x: any) => String(x.en).trim().toLowerCase() === en.toLowerCase()
    );
    if (isDup) {
      setImportPreview({
        news: [],
        dups: [{
          en,
          ar: (tmp.ar || '').trim(),
          ur: (tmp.ur || '').trim(),
          section: (tmp.section || '').trim(),
          allergens: (tmp.allergens || []).filter(Boolean),
          on: tmp.on !== false,
        }],
      });
      setView('dishes');
      return;
    }

    updateFood((d: any) => d.dishes.push({ ...tmp }));
    setView('dishes');
    toast('Dish saved');
  };

  // ---- import: handled by the DishImportWizard component -------------------

  // ==========================================================================
  // DISHES LIST
  // ==========================================================================

  const q = dishSearch.trim().toLowerCase();
  const dishRows = db.dishes
    .map((dish: any, i: number) => ({ dish, i }))
    .filter(({ dish }: any) =>
      !q ? true : (dish.en || '').toLowerCase().includes(q) || (dish.ar || '').includes(dishSearch.trim()),
    )
    .filter(({ dish }: any) => filterSection === 'All' || dish.section === filterSection)
    .filter(({ dish }: any) => filterStatus === 'All' || (filterStatus === 'Active' ? dish.on : !dish.on))
    .filter(({ dish }: any) => filterAllergen === 'All' || (dish.allergens || []).includes(filterAllergen));
  const dishFiltersActive = filterSection !== 'All' || filterStatus !== 'All' || filterAllergen !== 'All';
  if (dishSort) {
    const dsVal = ({ dish }: any): string | number => {
      switch (dishSort.key) {
        case 'en': return String(dish.en || '').toLowerCase();
        case 'ar': return String(dish.ar || '').toLowerCase();
        case 'section': return String(dish.section || '').toLowerCase();
        case 'allergens': return (dish.allergens || []).length;
        case 'on': return dish.on ? 1 : 0;
        default: return 0;
      }
    };
    dishRows.sort((a: any, b: any) => {
      const av = dsVal(a), bv = dsVal(b);
      const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dishSort.dir === 'asc' ? c : -c;
    });
  }
  const dishToggleSort = (key: string) =>
    setDishSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });

  const visibleDishIdx = dishRows.map((r: any) => r.i);
  const allDishesSelected = visibleDishIdx.length > 0 && visibleDishIdx.every((i: number) => selectedDishes.has(i));
  const toggleSelectAllDishes = () =>
    setSelectedDishes((prev) => {
      if (allDishesSelected) { const n = new Set(prev); visibleDishIdx.forEach((i: number) => n.delete(i)); return n; }
      return new Set([...prev, ...visibleDishIdx]);
    });

  const renderDishRow = ({ dish, i }: any) => (
    <tr
      key={i}
      className={cx('border-b border-gray-100 hover:bg-gray-50 transition-colors', selectedDishes.has(i) && 'bg-[#4EBEE3]/5')}
    >
      <td className="px-5 py-3.5">
        <input
          type="checkbox"
          checked={selectedDishes.has(i)}
          onChange={() => toggleDishSelect(i)}
          className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
        />
      </td>
      <td className="px-5 py-3.5 font-medium text-[#19233a] text-[13.5px]">{dish.en}</td>
      <td className="px-5 py-3.5 text-[13px]">
        {dish.ar ? (
          <span className="text-[#5d6678]" dir="rtl">{dish.ar}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[#b9770b]">
            <AlertTriangle size={13} /> Arabic name missing
          </span>
        )}
      </td>
      <td className="px-5 py-3.5"><Tag>{dish.section}</Tag></td>
      <td className="px-5 py-3.5">
        {dish.allergens && dish.allergens.length > 0 ? (
          <span className="text-[12px] px-[9px] py-[3px] rounded-[7px] bg-[#fbf1de] text-[#b9770b] whitespace-nowrap">
            {dish.allergens.join(' · ')}
          </span>
        ) : (
          <span className="text-[12.5px] text-gray-400">None</span>
        )}
      </td>
      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <Toggle
          on={dish.on}
          onClick={() => updateFood((d: any) => { d.dishes[i].on = !d.dishes[i].on; })}
        />
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => openDish(i)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-gray-100 hover:text-[#16274D] transition-colors cursor-pointer"
            title="Edit dish"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDishToDelete(i)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#b91c1c] hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete dish"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );

  const confirmDeleteDish = () => {
    if (dishToDelete == null) return;
    const idx = dishToDelete;
    updateFood((d: any) => {
      d.dishes.splice(idx, 1);
    });
    setDishToDelete(null);
  };

  // ---- bulk selection + actions on the dishes table ----
  const toggleDishSelect = (i: number) =>
    setSelectedDishes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  const bulkSetActive = (on: boolean) => {
    updateFood((d: any) => { selectedDishes.forEach((i) => { if (d.dishes[i]) d.dishes[i].on = on; }); });
    setSelectedDishes(new Set());
  };
  const confirmBulkDeleteDishes = () => {
    const idxs = Array.from(selectedDishes).sort((a, b) => b - a);
    updateFood((d: any) => { idxs.forEach((i) => d.dishes.splice(i, 1)); });
    setSelectedDishes(new Set());
    setBulkDeleteOpen(false);
  };

  const openEditSection = (s: any, i: number) => {
    setEditIdx(i);
    setAddForm({ en: s.en, ar: s.ar || '', code: '', active: s.on, min: s.min ?? 1, max: s.max ?? 1, forAll: !!s.forAll, regular: '', landscape: '', start: '', end: '', color: DIET_COLOR_FALLBACK });
    setAddModalOpen(true);
  };
  const openEditDiet = (dt: any, i: number) => {
    setEditIdx(i);
    setAddForm({ en: dt.en, ar: dt.ar || '', code: dt.his || '', active: dt.on, min: 1, max: 1, forAll: false, regular: '', landscape: '', start: '', end: '', color: dt.color || DIET_COLOR_FALLBACK });
    setAddModalOpen(true);
  };
  const openEditName = (name: string, i: number) => {
    setEditIdx(i);
    setAddForm({ en: name, ar: '', code: '', active: true, min: 1, max: 1, forAll: false, regular: '', landscape: '', start: '', end: '', color: DIET_COLOR_FALLBACK });
    setAddModalOpen(true);
  };
  const openEditAllergen = (name: string, i: number) => {
    setEditIdx(i);
    const ar = (db.allergenAr && db.allergenAr[name]) || ALLERGEN_AR[name] || '';
    setAddForm({ en: name, ar, code: '', active: true, min: 1, max: 1, forAll: false, regular: '', landscape: '', start: '', end: '', color: DIET_COLOR_FALLBACK });
    setAddModalOpen(true);
  };
  const openEditMeal = (name: string, i: number) => {
    setEditIdx(i);
    const meta = (db.mealMeta && db.mealMeta[name]) || {};
    const svc = mealServingTime(db, name);
    setAddForm({ en: name, ar: meta.ar || MEAL_AR[name] || '', code: '', active: true, min: 1, max: 1, forAll: false, regular: meta.regular || '', landscape: meta.landscape || '', start: svc.start, end: svc.end });
    setAddModalOpen(true);
  };
  const refDeleteLabel = (): string => {
    if (!refToDelete) return '';
    const { kind, idx } = refToDelete;
    if (kind === 'sections') return db.sections[idx]?.en ?? '';
    if (kind === 'diets') return db.diets[idx]?.en ?? '';
    if (kind === 'allergens') return db.allergens[idx] ?? '';
    return db.meals[idx] ?? '';
  };
  const confirmDeleteRef = () => {
    if (!refToDelete) return;
    const { kind, idx } = refToDelete;
    updateFood((d: any) => {
      d[kind].splice(idx, 1);
    });
    setRefToDelete(null);
  };

  // ---- Reference Lists selection + bulk actions (per current tab) ----
  const switchRefTab = (t: RefTab) => { setTab(t); setRefSel(new Set()); setRefBulkMenuOpen(false); setRefSearch(''); setRefSort(null); };
  const refToggleSort = (key: string) =>
    setRefSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  const refHasStatus = tab === 'sections' || tab === 'diets';
  const toggleRefSelect = (i: number) =>
    setRefSel((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const toggleSelectAllRef = (idxs: number[]) =>
    setRefSel((prev) => {
      const allSel = idxs.length > 0 && idxs.every((i) => prev.has(i));
      if (allSel) { const n = new Set(prev); idxs.forEach((i) => n.delete(i)); return n; }
      return new Set([...prev, ...idxs]);
    });
  const bulkSetRefActive = (on: boolean) => {
    updateFood((d: any) => { refSel.forEach((i) => { if (d[tab][i]) d[tab][i].on = on; }); });
    setRefSel(new Set());
  };
  const confirmRefBulkDelete = () => {
    const idxs = Array.from(refSel).sort((a, b) => b - a);
    updateFood((d: any) => { idxs.forEach((i) => d[tab].splice(i, 1)); });
    setRefSel(new Set());
    setRefBulkDeleteOpen(false);
  };

  const viewDishes = (
    <>
      <Card>
        <div className="flex items-start gap-3 md:gap-4 px-5 pt-5 pb-4 border-b border-[#eef0f4]">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
            <Salad size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Menu Dishes</h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">{db.dishes.length} dishes in the library</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {selectedDishes.size > 0 ? (
              <>
                <span className="text-[13px] text-[#5d6678] font-medium mr-1">{selectedDishes.size} selected</span>
                <div className="relative">
                  <button
                    onClick={() => setBulkMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium shadow-sm cursor-pointer"
                  >
                    <Settings size={16} strokeWidth={2} />
                    Quick Actions
                    <ChevronDown size={16} strokeWidth={2} className={cx('transition-transform', bulkMenuOpen && 'rotate-180')} />
                  </button>
                  {bulkMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBulkMenuOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden font-['Poppins',sans-serif]">
                        {selectedDishes.size === 1 && (
                          <button
                            onClick={() => { const i = [...selectedDishes][0]; setBulkMenuOpen(false); setSelectedDishes(new Set()); openDish(i); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                              <Pencil size={16} className="text-[#4EBEE3]" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => { bulkSetActive(true); setBulkMenuOpen(false); }}
                          className={cx('w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left', selectedDishes.size === 1 && 'border-t border-gray-100')}
                        >
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <Power size={16} className="text-green-600" strokeWidth={2} />
                          </div>
                          <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Activate</span>
                        </button>
                        <button
                          onClick={() => { bulkSetActive(false); setBulkMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                        >
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <PowerOff size={16} className="text-gray-600" strokeWidth={2} />
                          </div>
                          <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Deactivate</span>
                        </button>
                        <div className="border-t-2 border-gray-200 my-1" />
                        <button
                          onClick={() => { setBulkDeleteOpen(true); setBulkMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                            <Trash2 size={16} className="text-red-600" strokeWidth={2} />
                          </div>
                          <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedDishes(new Set()); setBulkMenuOpen(false); }}
                  className="px-3 py-2.5 text-[#5d6678] hover:text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setImportOpen(true)}
                  className="px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-[#16274D] rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  <Upload size={18} strokeWidth={2} className="text-[#5d6678]" /> Import
                </button>
                <button
                  onClick={() => openDish(null)}
                  className="px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium"
                >
                  <Plus size={18} strokeWidth={2} /> Add dish
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
            />
            {dishSearch && (
              <button
                onClick={() => setDishSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters + Group by (Kitchen filter design) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 !overflow-visible">
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Section</label>
              <SingleSelectDropdown
                options={['All', ...db.sections.map((s: any) => s.en)]}
                value={filterSection}
                onChange={setFilterSection}
                placeholder="All sections"
              />
            </div>
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Status</label>
              <SingleSelectDropdown
                options={['All', 'Active', 'Inactive']}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All statuses"
              />
            </div>
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Allergen</label>
              <SingleSelectDropdown
                options={['All', ...db.allergens]}
                value={filterAllergen}
                onChange={setFilterAllergen}
                placeholder="All allergens"
              />
            </div>
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Group by</label>
              <SingleSelectDropdown
                options={[
                  { value: 'none', label: 'No grouping' },
                  { value: 'section', label: 'Section' },
                  { value: 'allergen', label: 'Allergen' },
                  { value: 'status', label: 'Status' },
                ]}
                value={dishGroupBy}
                onChange={(v: string) => setDishGroupBy(v as 'none' | 'section' | 'allergen' | 'status')}
                placeholder="No grouping"
              />
            </div>
          </div>
          {dishFiltersActive && (
            <button
              onClick={() => { setFilterSection('All'); setFilterStatus('All'); setFilterAllergen('All'); }}
              className="mt-2 text-[12.5px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] cursor-pointer"
            >
              Clear filters
            </button>
          )}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-5 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allDishesSelected}
                        onChange={toggleSelectAllDishes}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                      />
                    </th>
                    {[
                      { label: 'Name (EN)', k: 'en' },
                      { label: 'Name (AR)', k: 'ar' },
                      { label: 'Section', k: 'section' },
                      { label: 'Allergens', k: 'allergens' },
                      { label: 'Status', k: 'on' },
                    ].map(({ label, k }) => (
                      <th
                        key={k}
                        onClick={() => dishToggleSort(k)}
                        className="px-5 py-3 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                      >
                        <span className="inline-flex items-center gap-2">
                          {label}
                          <TableSortIcon field={k} currentField={dishSort?.key || ''} direction={dishSort?.dir || 'asc'} />
                        </span>
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dishGroupBy !== 'none'
                    ? (() => {
                        const groupKey = (r: any): string => {
                          if (dishGroupBy === 'section') return r.dish.section || 'Uncategorized';
                          if (dishGroupBy === 'status') return r.dish.on ? 'Active' : 'Inactive';
                          // allergen: group by the primary (first) allergen, or "No allergens"
                          return (r.dish.allergens && r.dish.allergens.length) ? r.dish.allergens[0] : 'No allergens';
                        };
                        const groups: Record<string, any[]> = {};
                        dishRows.forEach((r: any) => {
                          const k = groupKey(r);
                          (groups[k] ||= []).push(r);
                        });
                        // Sort: real groups A–Z; "No allergens"/"Inactive" last.
                        const order = (k: string) => (k === 'No allergens' || k === 'Inactive' ? 1 : 0);
                        return Object.entries(groups)
                          .sort((a, b) => order(a[0]) - order(b[0]) || a[0].localeCompare(b[0]))
                          .map(([key, rowsInGroup]: any) => {
                            const collapsed = collapsedDishGroups.includes(key);
                            return (
                            <Fragment key={key}>
                              <tr
                                className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleDishGroup(key)}
                              >
                                <td colSpan={7} className="px-5 py-2 text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                                  <span className="inline-flex items-center gap-2">
                                    <ChevronDown size={15} className={cx('text-[#5d6678] transition-transform', collapsed && '-rotate-90')} />
                                    {key} <span className="text-[#9099ab] font-normal">· {rowsInGroup.length}</span>
                                  </span>
                                </td>
                              </tr>
                              {!collapsed && rowsInGroup.map(renderDishRow)}
                            </Fragment>
                            );
                          });
                      })()
                    : dishRows.map(renderDishRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </>
  );

  // ==========================================================================
  // DISH FORM
  // ==========================================================================

  const editing = dishIdx != null;
  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#19233a] outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] transition-colors";
  const labelCls = "block text-[13px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]";
  const iconAdd = 'w-[42px] h-[42px] flex items-center justify-center rounded-lg border border-gray-200 text-[#1d7da3] hover:bg-[#f7f8fb] hover:border-[#4EBEE3] cursor-pointer flex-shrink-0 transition-colors';
  const iconConfirm = 'w-[42px] h-[42px] flex items-center justify-center rounded-lg border border-[#4EBEE3] bg-[#4EBEE3] text-white hover:bg-[#3da5ca] cursor-pointer flex-shrink-0 transition-colors';
  const iconCancel = 'w-[42px] h-[42px] flex items-center justify-center rounded-lg border border-gray-200 text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer flex-shrink-0 transition-colors';
  const dishSecHead = (Icon: any, title: string, sub: string) => (
    <div className="flex items-center gap-3 mb-3.5">
      <div className="w-9 h-9 rounded-xl bg-[#4EBEE3]/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#4EBEE3]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-[#16274D]">{title}</h3>
        <p className="text-[12.5px] text-[#5d6678]">{sub}</p>
      </div>
    </div>
  );

  const viewDishForm = (
    <Card>
      <CardHead
        back={{ label: 'Dishes', onClick: () => setView('dishes') }}
        title={editing ? 'Edit dish' : 'Add dish'}
      />
      <div className="p-5 space-y-4 bg-[#f6f8fc]">
        {/* Dish details */}
        <section className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-4">
          {dishSecHead(FileText, 'Dish details', 'Name, language and section for this dish.')}
          <div className="flex gap-4">
            <button
              type="button"
              className="w-[96px] h-[96px] flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-[#9099ab] hover:bg-[#f7f8fb] hover:border-[#4EBEE3] cursor-pointer transition-colors"
            >
              <ImagePlus size={24} />
              <span className="text-[12px] font-medium">Add photo</span>
            </button>
            <div className="flex-1 space-y-3.5">
              <div>
                <label className={labelCls}>Name (English) <span className="text-[#dc2626]">*</span></label>
                <input
                  className={inputCls}
                  value={form.en}
                  onChange={(e) => patchForm({ en: e.target.value })}
                  placeholder="e.g. Grilled chicken"
                />
              </div>
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
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Section <span className="text-[#dc2626]">*</span></label>
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
        </section>

        {/* Allergens */}
        <section className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-4">
          {dishSecHead(ShieldCheck, 'Allergens', "Tagged allergens are checked against each patient's record.")}
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
          <p className="text-[12px] text-[#9099ab] mt-2.5 flex items-start gap-1.5">
            <ShieldCheck size={14} className="text-[#1f9e75] shrink-0 mt-0.5" />
            <span>Tagged allergens are cross-checked against each patient before an order is allowed. New sections &amp; allergens are saved to the library.</span>
          </p>
        </section>

        {/* Status */}
        <section className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[#16274D] text-[14px]">Active</div>
              <div className="text-[12.5px] text-[#5d6678] mt-0.5">
                Inactive dishes stay in the library but can't be added to a menu.
              </div>
            </div>
            <Toggle on={form.on} onClick={() => patchForm({ on: !form.on })} />
          </div>
        </section>
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


  const cbCls = 'w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]';
  const modalInput = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#19233a] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]";
  // Image upload — matches the Assets Hub style (dashed dropzone → filled row).
  const imageUploader = (label: string, shape: 'square' | 'wide', value: string, maxDim: number, onChange: (v: string) => void) => {
    const inputId = `meal-img-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const onFile = async (e: any) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try { onChange(await shrinkImage(file, maxDim)); }
      catch { toast.error('Could not read that image'); }
    };
    const wide = shape === 'wide';
    const hint = '1600 × 1200 px (4:3) · JPEG, under 400 KB';
    const aspect = 'aspect-[4/3]';
    return (
      <div className={wide ? 'flex-1 min-w-[240px]' : 'w-[220px] shrink-0'}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">{label}</span>
          <Info size={14} className="text-gray-400" />
          <span className="text-red-500 text-[13px]">*</span>
        </div>
        {value ? (
          <>
            <div className={cx('relative rounded-lg overflow-hidden border border-gray-200', aspect)}>
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white hover:bg-white text-[#dc2626] flex items-center justify-center shadow-sm cursor-pointer"
                title="Remove image"
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-2">{hint}</p>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className={cx('flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/60 hover:border-[#4EBEE3] hover:bg-[#f7fbfd] transition-colors cursor-pointer text-center px-4', aspect)}
          >
            <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
              <UploadCloud size={22} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Click to upload</p>
              <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">{hint}</p>
            </div>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" id={inputId} />
          </label>
        )}
      </div>
    );
  };
  const refThCls = "px-5 py-3 text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif]";
  const arNameCell = (text: string) =>
    text
      ? <span className="text-[13px] text-[#5d6678]" dir="rtl">{text}</span>
      : <span className="text-[13px] text-gray-300">—</span>;
  // One reusable Assets-Hub-style table for a reference-list tab.
  // Entries carry their ORIGINAL index so search-filtering keeps select/edit/delete correct.
  const refTable = (
    entries: { item: any; idx: number }[],
    columns: { label: string; cell: (item: any, i: number) => any; className?: string; sortKey?: string; sortVal?: (item: any, i: number) => string | number }[],
    onEdit: (item: any, i: number) => void,
    emptyLabel: string,
  ) => {
    // Column sort (3-click cycle asc → desc → normal), keeps original idx attached.
    if (refSort) {
      const col = columns.find((c) => c.sortKey === refSort.key);
      if (col && col.sortVal) {
        entries = [...entries].sort((a, b) => {
          const av = col.sortVal!(a.item, a.idx), bv = col.sortVal!(b.item, b.idx);
          const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return refSort!.dir === 'asc' ? c : -c;
        });
      }
    }
    const visIdx = entries.map((e) => e.idx);
    const allChecked = visIdx.length > 0 && visIdx.every((i) => refSel.has(i));
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-5 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={() => toggleSelectAllRef(visIdx)} className={cbCls} />
              </th>
              {columns.map((c) => (
                c.sortKey ? (
                  <th key={c.label} onClick={() => refToggleSort(c.sortKey!)} className={cx(refThCls, c.className || 'text-left', 'cursor-pointer select-none hover:bg-gray-100 transition-colors')}>
                    <span className={cx('inline-flex items-center gap-2', c.className === 'text-right' && 'flex-row-reverse')}>
                      {c.label}
                      <TableSortIcon field={c.sortKey} currentField={refSort?.key || ''} direction={refSort?.dir || 'asc'} />
                    </span>
                  </th>
                ) : (
                  <th key={c.label} className={cx(refThCls, c.className || 'text-left')}>{c.label}</th>
                )
              ))}
              <th className="px-5 py-3 text-right text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif] w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={columns.length + 2} className="px-5 py-10 text-center text-[13px] text-gray-400">{emptyLabel}</td></tr>
            )}
            {entries.map(({ item, idx }) => (
              <tr key={idx} className={cx('border-b border-gray-100 hover:bg-gray-50 transition-colors', refSel.has(idx) && 'bg-[#4EBEE3]/5')}>
                <td className="px-5 py-3.5">
                  <input type="checkbox" checked={refSel.has(idx)} onChange={() => toggleRefSelect(idx)} className={cbCls} />
                </td>
                {columns.map((c) => <td key={c.label} className={cx('px-5 py-3.5', c.className)}>{c.cell(item, idx)}</td>)}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => onEdit(item, idx)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-gray-100 hover:text-[#16274D] transition-colors cursor-pointer" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setRefToDelete({ kind: tab, idx })} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#b91c1c] hover:bg-red-50 transition-colors cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Build filtered {item, idx} entries for the current tab's search.
  const refEntries = (items: any[], text: (item: any) => string) => {
    const q = refSearch.trim().toLowerCase();
    return items
      .map((item: any, idx: number) => ({ item, idx }))
      .filter(({ item }) => !q || text(item).toLowerCase().includes(q));
  };

  const viewRefLists = (
    <Card>
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center shrink-0">
            <ListChecks size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Reference Lists
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage the sections, diets, allergens and meals used across menus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {refSel.size > 0 && (
              <>
                <span className="text-[13px] text-[#5d6678] font-medium mr-1">{refSel.size} selected</span>
                <div className="relative">
                  <button
                    onClick={() => setRefBulkMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium shadow-sm cursor-pointer"
                  >
                    <Settings size={16} strokeWidth={2} /> Quick Actions
                    <ChevronDown size={16} strokeWidth={2} className={cx('transition-transform', refBulkMenuOpen && 'rotate-180')} />
                  </button>
                  {refBulkMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setRefBulkMenuOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden font-['Poppins',sans-serif]">
                        {refHasStatus && (
                          <>
                            <button onClick={() => { bulkSetRefActive(true); setRefBulkMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Power size={16} className="text-green-600" strokeWidth={2} /></div>
                              <span className="text-[13px] font-medium text-[#16274D]">Activate</span>
                            </button>
                            <button onClick={() => { bulkSetRefActive(false); setRefBulkMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100">
                              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><PowerOff size={16} className="text-gray-600" strokeWidth={2} /></div>
                              <span className="text-[13px] font-medium text-[#16274D]">Deactivate</span>
                            </button>
                            <div className="border-t-2 border-gray-200 my-1" />
                          </>
                        )}
                        <button onClick={() => { setRefBulkDeleteOpen(true); setRefBulkMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><Trash2 size={16} className="text-red-600" strokeWidth={2} /></div>
                          <span className="text-[13px] font-medium text-[#16274D]">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            <Btn
              variant="primary"
              onClick={() => {
                setEditIdx(null);
                setAddForm({ en: '', ar: '', code: '', active: true, min: 1, max: 1, forAll: false, regular: '', landscape: '', start: '', end: '', color: DIET_COLOR_FALLBACK });
                setAddModalOpen(true);
              }}
            >
              <Plus size={16} />
              {addLabel[tab]}
            </Btn>
          </div>
        </div>
        <PillTabs
          tabs={[
            { id: 'sections', label: 'Sections' },
            { id: 'diets', label: 'Diets' },
            { id: 'allergens', label: 'Allergens' },
            { id: 'meals', label: 'Meals' },
          ]}
          activeTab={tab}
          onChange={(id) => switchRefTab(id as RefTab)}
        />
      </div>

      {/* Search bar — Assets Hub style */}
      <div className="px-5 pt-4 pb-1">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            value={refSearch}
            onChange={(e) => { setRefSearch(e.target.value); setRefSel(new Set()); }}
            placeholder={`Search ${tab}...`}
            className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
          />
          {refSearch && (
            <button
              onClick={() => setRefSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Clear"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2" />

      {tab === 'sections' && (
        <>
          {refTable(
            refEntries(db.sections, (s: any) => `${s.en} ${s.ar || ''}`),
            [
              { label: 'Name (EN)', sortKey: 'en', sortVal: (s: any) => String(s.en || '').toLowerCase(), cell: (s: any) => <span className="font-medium text-[#19233a] text-[13.5px]">{s.en}</span> },
              { label: 'Name (AR)', className: 'text-right', sortKey: 'ar', sortVal: (s: any) => String(s.ar || ''), cell: (s: any) => arNameCell(s.ar) },
              { label: 'Rule', sortKey: 'rule', sortVal: (s: any) => (s.forAll ? 99 : (s.max ?? 1)), cell: (s: any) => {
                const rule = { forAll: !!s.forAll, min: s.min ?? 1, max: s.max ?? 1 };
                return (
                  <div className="leading-tight inline-block">
                    <div className="text-[13px] text-[#5d6678] whitespace-nowrap">{ruleText(rule)}</div>
                    <div className="text-[12px] text-[#9099ab] whitespace-nowrap text-left" dir="rtl">{ruleTextAr(rule)}</div>
                  </div>
                );
              } },
              { label: 'Status', sortKey: 'on', sortVal: (s: any) => (s.on ? 1 : 0), cell: (s: any, i: number) => (
                <Toggle on={s.on} onClick={() => updateFood((d: any) => { d.sections[i].on = !d.sections[i].on; })} />
              ) },
            ],
            (s: any, i: number) => openEditSection(s, i),
            refSearch ? 'No sections match your search.' : 'No sections yet.',
          )}
          <div className="p-5">
            <Note tone="info" icon={<ArrowUpDown size={16} />}>
              Drag to reorder — this is the order sections appear on the patient screen.
            </Note>
          </div>
        </>
      )}

      {tab === 'diets' && (
        <>
          {refTable(
            refEntries(db.diets, (dt: any) => `${dt.en} ${dt.ar || ''} ${dt.his || ''}`),
            [
              { label: 'Name (EN)', sortKey: 'en', sortVal: (dt: any) => String(dt.en || '').toLowerCase(), cell: (dt: any) => <span className="font-medium text-[#19233a] text-[13.5px]">{dt.en}</span> },
              { label: 'Name (AR)', className: 'text-right', sortKey: 'ar', sortVal: (dt: any) => String(dt.ar || ''), cell: (dt: any) => arNameCell(dt.ar) },
              { label: 'HIS code', sortKey: 'his', sortVal: (dt: any) => String(dt.his || '').toLowerCase(), cell: (dt: any) => <Badge tone="info" className="font-mono">{dt.his}</Badge> },
              { label: 'Print colour', sortKey: 'color', sortVal: (dt: any) => String(dt.color || ''), cell: (dt: any) => {
                const c = dt.color || DIET_COLOR_FALLBACK;
                const set = !!dt.color;
                return (
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-black/10 shrink-0" style={{ backgroundColor: c }} />
                    <span className={cx('text-[12.5px] font-mono uppercase', set ? 'text-[#5d6678]' : 'text-[#9099ab] italic')}>
                      {c}{!set && ' (unset)'}
                    </span>
                  </span>
                );
              } },
              { label: 'Status', sortKey: 'on', sortVal: (dt: any) => (dt.on ? 1 : 0), cell: (dt: any, i: number) => (
                <Toggle on={dt.on} onClick={() => updateFood((d: any) => { d.diets[i].on = !d.diets[i].on; })} />
              ) },
            ],
            (dt: any, i: number) => openEditDiet(dt, i),
            refSearch ? 'No diets match your search.' : 'No diets yet.',
          )}
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
          {refTable(
            refEntries(db.allergens, (a: string) => `${a} ${(db.allergenAr?.[a]) || ALLERGEN_AR[a] || ''}`),
            [
              { label: 'Name (EN)', sortKey: 'en', sortVal: (a: string) => a.toLowerCase(), cell: (a: string) => <span className="font-medium text-[#19233a] text-[13.5px]">{a}</span> },
              { label: 'Name (AR)', className: 'text-right', sortKey: 'ar', sortVal: (a: string) => String((db.allergenAr?.[a]) || ALLERGEN_AR[a] || ''), cell: (a: string) => arNameCell((db.allergenAr?.[a]) || ALLERGEN_AR[a] || '') },
              { label: 'Used by', sortKey: 'used', sortVal: (a: string) => db.dishes.filter((x: any) => x.allergens && x.allergens.includes(a)).length, cell: (a: string) => <Badge tone="mute">{db.dishes.filter((x: any) => x.allergens && x.allergens.includes(a)).length} dishes</Badge> },
            ],
            (a: string, i: number) => openEditAllergen(a, i),
            refSearch ? 'No allergens match your search.' : 'No allergens yet.',
          )}
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
          {refTable(
            refEntries(db.meals, (m: string) => `${m} ${(db.mealMeta?.[m]?.ar) || MEAL_AR[m] || ''}`),
            [
              { label: 'Meal', sortKey: 'en', sortVal: (m: string) => m.toLowerCase(), cell: (m: string) => {
                const img = db.mealMeta?.[m]?.regular;
                return (
                  <div className="flex items-center gap-3">
                    {img
                      ? <img src={img} alt={m} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      : <div className="w-10 h-10 rounded-lg bg-[#f7f8fb] border border-gray-200 flex items-center justify-center text-[#c3c9d6]"><ImagePlus size={16} /></div>}
                    <span className="font-medium text-[#19233a] text-[13.5px]">{m}</span>
                  </div>
                );
              } },
              { label: 'Name (AR)', className: 'text-right', sortKey: 'ar', sortVal: (m: string) => String((db.mealMeta?.[m]?.ar) || MEAL_AR[m] || ''), cell: (m: string) => arNameCell((db.mealMeta?.[m]?.ar) || MEAL_AR[m] || '') },
              { label: 'Serving time', sortKey: 'serving', sortVal: (m: string) => mealServingTime(db, m).start, cell: (m: string) => {
                const svc = mealServingTime(db, m);
                const set = !!(db.mealMeta?.[m]?.start || db.mealMeta?.[m]?.end);
                return (
                  <span className={cx('text-[13px] whitespace-nowrap', set ? 'text-[#5d6678]' : 'text-[#9099ab] italic')}>
                    {svc.start} – {svc.end}{!set && ' (default)'}
                  </span>
                );
              } },
              { label: 'Order', sortKey: 'order', sortVal: (_m: string, i: number) => i, cell: (_m: string, i: number) => <span className="text-[13px] text-[#5d6678] whitespace-nowrap">order #{i + 1}</span> },
            ],
            (m: string, i: number) => openEditMeal(m, i),
            refSearch ? 'No meals match your search.' : 'No meals yet.',
          )}
          <div className="p-5">
            <Note tone="info" icon={<Clock size={16} />}>
              The serving window above is what prints on the meal ticket. The ordering cut-off is separate — meals share one in this hospital, set inside each menu set.
            </Note>
          </div>
        </>
      )}
    </Card>
  );

  // ==========================================================================
  // IMPORT MODAL
  // ==========================================================================

  const sectionIcon = (Icon: any) => (
    <div className="w-10 h-10 rounded-xl bg-[#4EBEE3]/10 flex items-center justify-center shrink-0">
      <Icon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
    </div>
  );
  const mealEditModal = addModalOpen && tab === 'meals' && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
      onClick={() => { setAddModalOpen(false); setEditIdx(null); }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] max-h-[92vh] flex flex-col font-['Poppins',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-[#eef0f4]">
          {sectionIcon(Utensils)}
          <div className="flex-1">
            <h2 className="text-[20px] font-semibold text-[#16274D]">{editIdx != null ? 'Edit meal' : 'Add meal'}</h2>
            <p className="text-[13.5px] text-[#5d6678]">{editIdx != null ? "Update this meal's details and images." : 'Add a new meal with its details and images.'}</p>
          </div>
          <button onClick={() => { setAddModalOpen(false); setEditIdx(null); }} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* Meal details */}
          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              {sectionIcon(FileText)}
              <h3 className="text-[16px] font-semibold text-[#16274D]">Meal details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0f1729] mb-1.5">Name (English) <span className="text-red-500">*</span></label>
                <input type="text" value={addForm.en} onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))} className={modalInput} placeholder="e.g. Afternoon Tea" autoFocus />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#0f1729] mb-1.5 text-right">Name (Arabic) <span className="text-red-500">*</span></label>
                <input type="text" value={addForm.ar} onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))} className={cx(modalInput, 'text-right')} placeholder="اسم الوجبة" dir="rtl" />
              </div>
            </div>
          </section>

          {/* Serving window — the time the meal reaches the patient, printed on
              every meal ticket. Distinct from the ordering cut-off, which is
              set per menu set. */}
          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              {sectionIcon(Clock)}
              <div>
                <h3 className="text-[16px] font-semibold text-[#16274D]">Serving window</h3>
                <p className="text-[13px] text-[#5d6678]">Printed on the meal ticket. This is when the meal is served, not the ordering cut-off.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0f1729] mb-1.5">Starts</label>
                <input type="text" value={addForm.start} onChange={(e) => setAddForm((f) => ({ ...f, start: e.target.value }))} className={modalInput} placeholder="e.g. 8:00 AM" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#0f1729] mb-1.5">Ends</label>
                <input type="text" value={addForm.end} onChange={(e) => setAddForm((f) => ({ ...f, end: e.target.value }))} className={modalInput} placeholder="e.g. 9:00 AM" />
              </div>
            </div>
          </section>

          {/* Meal images */}
          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              {sectionIcon(ImageIcon)}
              <h3 className="text-[16px] font-semibold text-[#16274D]">Meal images</h3>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              {imageUploader('Regular image', 'square', addForm.regular, 1600, (v) => setAddForm((f) => ({ ...f, regular: v })))}
              {imageUploader('Landscape image', 'wide', addForm.landscape, 1600, (v) => setAddForm((f) => ({ ...f, landscape: v })))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-[#eef0f4] p-4 flex items-center justify-between">
          <button onClick={() => { setAddModalOpen(false); setEditIdx(null); }} className="h-[42px] px-5 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Cancel</button>
          <button onClick={() => handleSave(false)} className="h-[42px] px-5 inline-flex items-center gap-2 rounded-[10px] bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white text-[14px] font-medium cursor-pointer">
            {editIdx != null ? 'Save changes' : 'Add meal'} <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );

  const refListAddModal = addModalOpen && tab !== 'meals' && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
      onClick={() => { setAddModalOpen(false); setEditIdx(null); }}
    >
      <Card className="max-w-[480px] w-full" onClick={(e) => e.stopPropagation()}>
        <CardHead
          title={editIdx != null ? `Edit ${tab.slice(0, -1)}` : addLabel[tab]}
          sub={editIdx != null ? `Update this ${tab.slice(0, -1)}` : `Add a new ${tab.slice(0, -1)} to the library`}
          right={
            <button
              onClick={() => { setAddModalOpen(false); setEditIdx(null); }}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          }
        />
        <div className="p-5 flex flex-col gap-4">
          {tab === 'sections' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Name (English)</label>
                  <input
                    type="text"
                    value={addForm.en}
                    onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                    className={modalInput}
                    placeholder="e.g. Appetizers"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif] text-right">Name (Arabic)</label>
                  <input
                    type="text"
                    value={addForm.ar}
                    onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                    className={cx(modalInput, 'text-right')}
                    placeholder="اسم القسم"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#eef0f4]">
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1 font-['Poppins',sans-serif]">Default rule</label>
                <p className="text-[12px] text-[#9099ab] mb-2.5">Applied automatically when this section is added to a menu set.</p>
                <MiniSeg
                  options={[
                    { value: 'choice', label: 'Patient choice' },
                    { value: 'all', label: 'For all' },
                  ]}
                  value={addForm.forAll ? 'all' : 'choice'}
                  onChange={(v: string) => setAddForm((f) => ({ ...f, forAll: v === 'all' }))}
                />
                {!addForm.forAll ? (
                  <div className="mt-3 rounded-lg bg-[#f7f8fb] border border-[#eef0f4] px-4 py-3">
                    <p className="text-[12.5px] text-[#5d6678] mb-2.5">How many items can the patient choose from this section?</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#16274D] w-8">Min</span>
                        <Stepper
                          value={addForm.min}
                          onDec={() => setAddForm((f) => ({ ...f, min: Math.max(0, Math.min(f.max, f.min - 1)) }))}
                          onInc={() => setAddForm((f) => ({ ...f, min: Math.max(0, Math.min(f.max, f.min + 1)) }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#16274D] w-8">Max</span>
                        <Stepper
                          value={addForm.max}
                          onDec={() => setAddForm((f) => { const max = Math.max(1, f.max - 1); return { ...f, max, min: Math.min(f.min, max) }; })}
                          onInc={() => setAddForm((f) => ({ ...f, max: Math.min(5, f.max + 1) }))}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-[12.5px] text-[#5d6678] rounded-lg bg-[#f7f8fb] border border-[#eef0f4] px-4 py-3">
                    Every patient receives all items in this section — no choice needed.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#eef0f4]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#19233a]">Status</div>
                  <div className="text-[12px] text-[#9099ab]">{addForm.active ? 'Active — available in menus' : 'Inactive — hidden from menus'}</div>
                </div>
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
              <div className="border-t border-[#e7e9f0] mt-1 pt-3">
                <label className="block text-[12px] text-[#5d6678] mb-1 font-medium">Print colour</label>
                <p className="text-[12px] text-[#9099ab] mb-2">
                  Used for this diet's meal tickets. Pediatric decoration is separate — a child on
                  this diet still gets the playful ticket.
                </p>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={addForm.color}
                    onChange={(e) => setAddForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-[46px] h-[38px] p-1 border border-[#d6dae6] rounded-[8px] bg-white cursor-pointer shrink-0"
                    title="Pick a colour"
                  />
                  <input
                    type="text"
                    value={addForm.color}
                    onChange={(e) => setAddForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-[110px] h-[38px] px-3 border border-[#d6dae6] rounded-[8px] bg-white text-[13.5px] text-[#19233a] font-mono uppercase"
                    placeholder="#6B3FA0"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {DIET_COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAddForm((f) => ({ ...f, color: c }))}
                        title={c}
                        className={cx(
                          'w-[22px] h-[22px] rounded-[6px] cursor-pointer transition-transform hover:scale-110',
                          addForm.color.toLowerCase() === c.toLowerCase()
                            ? 'ring-2 ring-offset-1 ring-[#16274D]'
                            : 'border border-black/10',
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                {/* Shows the colour doing its actual job, not just as a swatch. */}
                <div className="mt-3 rounded-[8px] overflow-hidden border border-[#e7e9f0] max-w-[300px]">
                  <div className="px-3 py-2 text-white text-[13px] font-semibold flex items-center justify-between" style={{ backgroundColor: addForm.color }}>
                    <span>BREAKFAST</span>
                    <span dir="rtl">افطار</span>
                  </div>
                  <div className="px-3 py-1.5 text-[12px] flex items-center justify-between" style={{ backgroundColor: addForm.color + '14', color: addForm.color }}>
                    <span className="font-semibold uppercase">{addForm.en || 'Diet name'}</span>
                    <span dir="rtl" className="font-semibold">{addForm.ar || 'اسم الحمية'}</span>
                  </div>
                </div>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Name (English)</label>
                <input
                  type="text"
                  value={addForm.en}
                  onChange={(e) => setAddForm((f) => ({ ...f, en: e.target.value }))}
                  className={modalInput}
                  placeholder="e.g. Peanut"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif] text-right">Name (Arabic)</label>
                <input
                  type="text"
                  value={addForm.ar}
                  onChange={(e) => setAddForm((f) => ({ ...f, ar: e.target.value }))}
                  className={cx(modalInput, 'text-right')}
                  placeholder="اسم مسبب الحساسية"
                  dir="rtl"
                />
              </div>
            </div>
          )}

        </div>
        <Bar>
          <Btn variant="neutral" onClick={() => { setAddModalOpen(false); setEditIdx(null); }}>
            Cancel
          </Btn>
          <div className="flex-grow" />
          {editIdx == null && (
            <Btn
              variant="neutral"
              onClick={() => handleSave(true)}
              className="border-[#d6dae6] hover:bg-[#f7f8fb] text-[#19233a]"
            >
              Save & Add Another
            </Btn>
          )}
          <Btn variant="primary" onClick={() => handleSave(false)}>
            {editIdx != null ? 'Save changes' : 'Save & Close'}
          </Btn>
        </Bar>
      </Card>
    </div>
  );

  const deleteDishModal = dishToDelete != null && db.dishes[dishToDelete] && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5"
      onClick={() => setDishToDelete(null)}
    >
      <Card className="max-w-[420px] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#b91c1c] shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">Delete dish</h3>
              <p className="text-[13.5px] text-[#5d6678] mt-1">
                Are you sure you want to delete <b className="text-[#16274D]">{db.dishes[dishToDelete].en}</b>? This can’t be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setDishToDelete(null)}>Cancel</Btn>
            <button
              onClick={confirmDeleteDish}
              className="px-4 h-[38px] inline-flex items-center gap-2 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const bulkDeleteDishModal = bulkDeleteOpen && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5"
      onClick={() => setBulkDeleteOpen(false)}
    >
      <Card className="max-w-[420px] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#b91c1c] shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Delete {selectedDishes.size} dish{selectedDishes.size > 1 ? 'es' : ''}
              </h3>
              <p className="text-[13.5px] text-[#5d6678] mt-1">
                Are you sure you want to delete the {selectedDishes.size} selected dish{selectedDishes.size > 1 ? 'es' : ''}? This can’t be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setBulkDeleteOpen(false)}>Cancel</Btn>
            <button
              onClick={confirmBulkDeleteDishes}
              className="px-4 h-[38px] inline-flex items-center gap-2 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Delete ({selectedDishes.size})
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const deleteRefModal = refToDelete && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5"
      onClick={() => setRefToDelete(null)}
    >
      <Card className="max-w-[420px] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#b91c1c] shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Delete {refToDelete.kind.slice(0, -1)}
              </h3>
              <p className="text-[13.5px] text-[#5d6678] mt-1">
                Are you sure you want to delete <b className="text-[#16274D]">{refDeleteLabel()}</b>? This can’t be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setRefToDelete(null)}>Cancel</Btn>
            <button
              onClick={confirmDeleteRef}
              className="px-4 h-[38px] inline-flex items-center gap-2 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const refBulkDeleteModal = refBulkDeleteOpen && (
    <div
      className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5"
      onClick={() => setRefBulkDeleteOpen(false)}
    >
      <Card className="max-w-[420px] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#b91c1c] shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Delete {refSel.size} {tab.slice(0, -1)}{refSel.size > 1 ? 's' : ''}
              </h3>
              <p className="text-[13.5px] text-[#5d6678] mt-1">
                Are you sure you want to delete the selected {tab}? This can’t be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setRefBulkDeleteOpen(false)}>Cancel</Btn>
            <button
              onClick={confirmRefBulkDelete}
              className="px-4 h-[38px] inline-flex items-center gap-2 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Delete ({refSel.size})
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <FoodPage>
      {view === 'dishes' && viewDishes}
      {view === 'dish' && viewDishForm}
      {view === 'reflists' && viewRefLists}
      <DishImportWizard open={importOpen} onClose={() => setImportOpen(false)} />
      {deleteDishModal}
      {bulkDeleteDishModal}
      {deleteRefModal}
      {refBulkDeleteModal}
      {refListAddModal}
      {mealEditModal}
    </FoodPage>
  );
}
