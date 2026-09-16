import { Fragment, useState } from 'react';
import {
  Plus, Copy, Eye, Settings, ClipboardList, ListTree,
  Clock, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, X, CheckCheck,
  Lightbulb, Rocket, Building2, Search, Check,
  AlertTriangle, Salad, Download, Upload, Filter, Pencil, Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useFood, updateFood, resolve, ruleText, DAYS, buildMenu, sectionRule, getLiveSet,
} from './foodStore';
import {
  cx, Btn, Toggle, Chip, StatusBadge, Tag, Badge, Note, Metric, Stepper,
  MiniSeg, Card, CardHead, Bar, rowCls, ContextBar, FoodPage,
} from './foodAtoms';
import { MultiSelectDropdown, SingleSelectDropdown } from '../UnifiedDropdown';
import PillTabs from '../PillTabs';
import TableSortIcon from '../TableSortIcon';

const GROUP_OPTIONS = ['Kids', 'Adults', 'VIP'];
const PER_PAGE = 10;
const DAY_LABELS: Record<string, string> = {
  Sat: 'Saturday', Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday',
};
const SECTION_DOT: Record<string, string> = {
  Mains: '#4EBEE3', 'Side orders': '#8b5cf6', Dessert: '#ec4899', Soup: '#22c55e', Salad: '#eab308', Drinks: '#0ea5e9',
  Cereals: '#f97316', Eggs: '#f59e0b', 'Baked breads': '#a855f7', Dairy: '#06b6d4',
};

interface MenuRow {
  rowNum: number;
  day: string;
  meal: string;
  diet: string;
  section: string;
  item: string;
  def: string;
  errors: string[];
}

function groupsLabel(groups: string[] | undefined): string {
  const g = groups || [];
  if (g.length === GROUP_OPTIONS.length) return 'All Groups';
  if (g.length > 0) return g.join(', ');
  return 'No Groups';
}

// The ordering times are stored as display strings ("4:00 PM"); an <input type="time">
// needs 24h "HH:MM". These convert between the two so the field shows/edits correctly.
function to24h(s: string): string {
  if (!s) return '';
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(s.trim());
  if (!m) return '';
  let h = +m[1];
  const ap = m[3];
  if (ap) { const pm = ap.toUpperCase() === 'PM'; if (h === 12) h = pm ? 12 : 0; else if (pm) h += 12; }
  return String(h).padStart(2, '0') + ':' + m[2];
}
function to12h(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return hhmm || '';
  let h = +m[1];
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m[2]} ${ap}`;
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
  const [menuSort, setMenuSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [addingRow, setAddingRow] = useState(false);
  const [draft, setDraft] = useState<{ day: string; meal: string; diet: string; item: string }>({ day: DAYS[0], meal: '', diet: '', item: '' });
  const [editRuleKey, setEditRuleKey] = useState<string | null>(null);
  // Draft of the rule being edited — applied only on Save, discarded on Close.
  const [editRuleDraft, setEditRuleDraft] = useState<{ forAll: boolean; min: number; max: number } | null>(null);
  // Row multi-select for bulk edit / delete.
  const [menuSel, setMenuSel] = useState<Set<string>>(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<{ day: string; meal: string; diet: string }>({ day: '', meal: '', diet: '' });
  const [bulkRule, setBulkRule] = useState<{ mode: 'keep' | 'choice' | 'all'; min: number; max: number }>({ mode: 'keep', min: 1, max: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [filterDay, setFilterDay] = useState('All');
  const [filterMeal, setFilterMeal] = useState('All');
  const [filterDiet, setFilterDiet] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [setSearch, setSetSearch] = useState('');
  const [setsSort, setSetsSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [setsBulkMenuOpen, setSetsBulkMenuOpen] = useState(false);
  const [setsBulkDeleteOpen, setSetsBulkDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  // Menu-items CSV import review (step 4)
  const [menuImport, setMenuImport] = useState<MenuRow[] | null>(null);
  const [menuImportName, setMenuImportName] = useState('');
  const [menuImportView, setMenuImportView] = useState<'all' | 'errors'>('all');
  const [menuImportPage, setMenuImportPage] = useState(1);
  const MENU_IMPORT_PER_PAGE = 50;

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
        nameAr: '',
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
    const liveId = getLiveSet(db)?.id;
    const q = setSearch.trim().toLowerCase();
    let sets = q
      ? db.sets.filter((s: any) =>
          String(s.name || '').toLowerCase().includes(q) ||
          String(s.nameAr || '').includes(setSearch.trim()) ||
          String(s.sub || '').toLowerCase().includes(q))
      : db.sets;
    if (setsSort) {
      const val = (s: any): string => {
        switch (setsSort.key) {
          case 'name': return String(s.name || '').toLowerCase();
          case 'nameAr': return String(s.nameAr || '');
          case 'status': return String(s.status || '');
          case 'edited': return String(s.edited || '');
          default: return '';
        }
      };
      sets = [...sets].sort((a: any, b: any) => {
        const c = val(a).localeCompare(val(b));
        return setsSort.dir === 'asc' ? c : -c;
      });
    }
    const toggleSetsSort = (key: string) =>
      setSetsSort((s) => {
        if (!s || s.key !== key) return { key, dir: 'asc' };
        if (s.dir === 'asc') return { key, dir: 'desc' };
        return null;
      });
    const cbCls = 'w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]';
    const visIds = sets.map((s: any) => s.id);
    const allSelected = visIds.length > 0 && visIds.every((id: string) => selectedSets.has(id));
    const toggleSetSelect = (id: string) => setSelectedSets((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    const toggleSelectAllSets = () => setSelectedSets((prev) => (allSelected ? new Set() : new Set(visIds)));
    const bulkDeleteSets = () => {
      updateFood((d: any) => { d.sets = d.sets.filter((s: any) => !selectedSets.has(s.id)); });
      setSelectedSets(new Set());
      setSetsBulkDeleteOpen(false);
    };
    const duplicateSet = (id: string) => {
      const nid = 'dup' + Date.now();
      updateFood((d: any) => {
        const src = d.sets.find((s: any) => s.id === id);
        if (!src) return;
        d.sets.unshift({ ...structuredClone(src), id: nid, name: `${src.name} (copy)`, status: 'Draft', sub: 'Duplicated · edit and publish', edited: 'just now' });
      });
      setSelectedSets(new Set());
      setSetsBulkMenuOpen(false);
      toast('Menu set duplicated');
    };
    const th = "px-5 py-3 text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif]";
    const SortTh = ({ label, k, align }: { label: string; k: string; align?: string }) => (
      <th onClick={() => toggleSetsSort(k)} className={cx(th, align || 'text-left', 'cursor-pointer select-none hover:bg-gray-100 transition-colors')}>
        <span className={cx('inline-flex items-center gap-2', align === 'text-right' && 'flex-row-reverse')}>
          {label}
          <TableSortIcon field={k} currentField={setsSort?.key || ''} direction={setsSort?.dir || 'asc'} />
        </span>
      </th>
    );
    return (
      <Card>
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Menu Sets
              </h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Build and publish the weekly menus served to patients.
              </p>
            </div>
            {selectedSets.size > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#5d6678] font-medium mr-1">{selectedSets.size} selected</span>
                <div className="relative">
                  <button
                    onClick={() => setSetsBulkMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium shadow-sm cursor-pointer"
                  >
                    <Settings size={16} strokeWidth={2} /> Quick Actions
                    <ChevronDown size={16} strokeWidth={2} className={cx('transition-transform', setsBulkMenuOpen && 'rotate-180')} />
                  </button>
                  {setsBulkMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSetsBulkMenuOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-[100] overflow-hidden font-['Poppins',sans-serif]">
                        {selectedSets.size === 1 && (
                          <button onClick={() => { const id = [...selectedSets][0]; setSetsBulkMenuOpen(false); setSelectedSets(new Set()); setSetId(id); openWizard(1); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center"><Eye size={16} className="text-[#4EBEE3]" strokeWidth={2} /></div>
                            <span className="text-[13px] font-medium text-[#16274D]">Open</span>
                          </button>
                        )}
                        {selectedSets.size === 1 && (
                          <button onClick={() => duplicateSet([...selectedSets][0])} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100">
                            <div className="w-8 h-8 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center"><Copy size={16} className="text-[#4EBEE3]" strokeWidth={2} /></div>
                            <span className="text-[13px] font-medium text-[#16274D]">Duplicate</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Only one set can be live, so publishing goes through the
                            // publish flow for the first selected set.
                            const id = [...selectedSets][0];
                            setSetsBulkMenuOpen(false);
                            setSelectedSets(new Set());
                            setSetId(id);
                            openWizard(1);
                            setPublishOpen(true);
                          }}
                          className={cx('w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left', selectedSets.size === 1 && 'border-t border-gray-100')}
                        >
                          <div className="w-8 h-8 bg-[#e7f6f0] rounded-lg flex items-center justify-center"><Rocket size={16} className="text-[#157f5c]" strokeWidth={2} /></div>
                          <span className="text-[13px] font-medium text-[#16274D]">Publish</span>
                        </button>
                        <button onClick={() => { setSetsBulkDeleteOpen(true); setSetsBulkMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100">
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><Trash2 size={16} className="text-red-600" strokeWidth={2} /></div>
                          <span className="text-[13px] font-medium text-[#16274D]">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button onClick={() => { setSelectedSets(new Set()); setSetsBulkMenuOpen(false); }} className="px-3 py-2.5 text-[#5d6678] hover:text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium cursor-pointer">Cancel</button>
              </div>
            ) : (
              <Btn variant="primary" onClick={createSet}>
                <Plus size={16} /> Create menu set
              </Btn>
            )}
          </div>
          {liveId && (
            <div className="flex items-center gap-2.5 mb-4 rounded-xl border border-[#bfe6d4] bg-[#e7f6f0] px-4 py-2.5">
              <CheckCircle2 size={17} className="text-[#157f5c] shrink-0" />
              <span className="text-[13px] text-[#157f5c]">
                <b>Live now:</b> {db.sets.find((s: any) => s.id === liveId)?.name} — this is the menu patients are ordering from.
              </span>
            </div>
          )}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={setSearch}
              onChange={(e) => setSetSearch(e.target.value)}
              placeholder="Search menu sets..."
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
            />
            {setSearch && (
              <button
                onClick={() => setSetSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <ClipboardList size={26} />
            </div>
            <div className="font-semibold text-[#16274D]">No menu sets match your search</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Try a different name, or clear the search.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAllSets} className={cbCls} />
                  </th>
                  <SortTh label="Name (EN)" k="name" />
                  <SortTh label="Name (AR)" k="nameAr" align="text-right" />
                  <SortTh label="Status" k="status" />
                  <SortTh label="Last edited" k="edited" align="text-right" />
                  <th className={cx(th, 'text-right w-20')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sets.map((s: any) => (
                  <tr
                    key={s.id}
                    onClick={() => { setSetId(s.id); openWizard(1); }}
                    className={cx('border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer', selectedSets.has(s.id) && 'bg-[#4EBEE3]/5')}
                  >
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedSets.has(s.id)} onChange={() => toggleSetSelect(s.id)} className={cbCls} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#19233a] text-[13.5px] flex items-center gap-2">
                        {s.name}
                        {s.id === liveId && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#157f5c] bg-[#e7f6f0] border border-[#bfe6d4] rounded-full px-1.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#157f5c]" /> LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[12.5px] text-[#5d6678]">{s.sub}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {s.nameAr
                        ? <span className="text-[13px] text-[#5d6678]" dir="rtl">{s.nameAr}</span>
                        : <span className="text-[13px] text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-right text-[12.5px] text-[#5d6678] whitespace-nowrap">{s.edited}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => { setSetId(s.id); openWizard(1); setPublishOpen(true); }}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#157f5c] hover:bg-[#e7f6f0] transition-colors cursor-pointer"
                          title={s.status === 'Published' ? 'Re-publish menu set' : 'Publish menu set'}
                        >
                          <Rocket size={15} />
                        </button>
                        <button
                          onClick={() => { setSetId(s.id); openWizard(1); }}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#5d6678] hover:bg-gray-100 hover:text-[#16274D] transition-colors cursor-pointer"
                          title="Edit menu set"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => { setSelectedSets(new Set([s.id])); setSetsBulkDeleteOpen(true); }}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#b91c1c] hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete menu set"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Bar>
          <Copy size={16} className="text-[#9099ab]" />
          <span className="text-[13px] text-[#5d6678]">Duplicate a published set to start next season in seconds.</span>
        </Bar>
        {setsBulkDeleteOpen && (
          <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={() => setSetsBulkDeleteOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-[420px] w-full font-['Poppins',sans-serif]" onClick={(e) => e.stopPropagation()}>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#b91c1c] shrink-0"><Trash2 size={18} /></div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-[#16274D]">Delete {selectedSets.size} menu set{selectedSets.size > 1 ? 's' : ''}</h3>
                    <p className="text-[13.5px] text-[#5d6678] mt-1">Are you sure you want to delete the selected menu set{selectedSets.size > 1 ? 's' : ''}? This can’t be undone.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => setSetsBulkDeleteOpen(false)} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Cancel</button>
                  <button onClick={bulkDeleteSets} className="px-4 h-[38px] inline-flex items-center gap-2 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-medium cursor-pointer">
                    <Trash2 size={15} /> Delete ({selectedSets.size})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
    openWizard(1);
    toast('Menu set duplicated');
  }

  // Publish flow — readiness checks + final publish (opened from the wizard header)
  function publishModal(set: any, published: boolean) {
    const bad = computeBad();
    const missing = db.dishes.filter((x: any) => !x.ar).length;
    const checks = [
      {
        ok: bad.length === 0,
        step: 4,
        title: bad.length === 0 ? 'Every required section has enough dishes' : `${bad.length} required section(s) need more dishes`,
        detail: bad.length === 0 ? 'All choose-two / required sections are satisfied' : bad.slice(0, 3).join(', ') + (bad.length > 3 ? '…' : ''),
      },
      { ok: true, step: 6, title: 'Ordering window set', detail: `Opens ${db.win.open}, closes ${db.win.close}, ${db.win.serviceDay.toLowerCase()}` },
      { ok: missing === 0, step: 4, title: `${missing} dishes missing an Arabic name`, detail: missing === 0 ? 'All translations present' : "Won't block publishing — they show in English only until added" },
    ];
    return (
      <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={() => setPublishOpen(false)}>
        <Card className="max-w-[520px] w-full" onClick={(e: any) => e.stopPropagation()}>
          <CardHead
            title={published ? 'Re-publish menu set' : 'Publish menu set'}
            sub={set.name}
            right={
              <button onClick={() => setPublishOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors">
                <X size={18} />
              </button>
            }
          />
          {checks.map((c, i) => (
            <button
              key={i}
              onClick={() => { setPublishOpen(false); openWizard(c.step); }}
              className={cx(rowCls, 'items-start w-full text-left cursor-pointer hover:bg-[#f7f8fb] transition-colors')}
            >
              <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: c.ok ? '#e7f6f0' : '#fbf1de', color: c.ok ? '#1f9e75' : '#b9770b' }}>
                {c.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#19233a]">{c.title}</div>
                <div className="text-[13px] text-[#5d6678]">{c.detail}</div>
              </div>
              <ChevronRight size={16} className="text-[#9099ab] shrink-0 mt-0.5" />
            </button>
          ))}
          <div className="p-5">
            <Btn variant="primary" lg disabled={bad.length > 0} onClick={bad.length > 0 ? undefined : publishSet} className="w-full justify-center">
              <Rocket size={18} /> {bad.length > 0 ? 'Fix required sections to publish' : published ? 'Re-publish to bedside' : 'Publish to bedside'}
            </Btn>
            <div className="text-[12px] text-[#5d6678] text-center mt-2.5">
              Goes live for the next ordering window · patients order from {db.win.open}
            </div>
          </div>
        </Card>
      </div>
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
    const headers = ['Day', 'Meal Type', 'Diet', 'Section', 'Dish', 'Default'];
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
    link.setAttribute('download', `${db.sets.find((x: any) => x.id === setId)?.name || 'menu_set'}_dishes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Menu exported successfully');
  }

  // Valid option sets for this set / library (used to validate & edit rows).
  const validDay = (v: string) => DAYS.includes(v as any);
  const validMeal = (v: string) => (currentSet.meals || db.meals).includes(v);
  const validDiet = (v: string) => (currentSet.diets || db.diets.map((x: any) => x.en)).includes(v);
  const validSection = (v: string) => db.sections.some((s: any) => s.en === v);
  const validDish = (v: string) => db.dishes.some((x: any) => x.en === v);
  const canonical = (list: string[], v: string) => list.find((x) => x.toLowerCase() === (v || '').trim().toLowerCase()) || (v || '').trim();

  function validateMenuRow(r: MenuRow): string[] {
    const e: string[] = [];
    if (!r.item) e.push('Dish is empty');
    else if (!validDish(r.item)) e.push(`Dish "${r.item}" is not in the library`);
    if (!validDay(r.day)) e.push(`Day "${r.day}" is invalid`);
    if (!validMeal(r.meal)) e.push(`Meal "${r.meal}" is not in this set`);
    if (!validDiet(r.diet)) e.push(`Diet "${r.diet}" is not in this set`);
    if (!validSection(r.section)) e.push(`Section "${r.section}" is not valid`);
    if (r.def && !['yes', 'no'].includes(r.def.trim().toLowerCase())) e.push('Default must be Yes or No');
    return e;
  }

  function importMenuFromCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '').replace(/^﻿/, '');
      const lines = parseCSV(text);
      if (lines.length < 2) { toast.error('The file is empty or has no rows.'); return; }
      const header = lines[0].map((h) => h.trim().toLowerCase());
      // Column 5 is the dish. Accept both "Dish" (new) and "Food Item" (legacy files).
      const colOk = (i: number, ...allowed: string[]) => allowed.includes(header[i]);
      const headerOk =
        colOk(0, 'day') && colOk(1, 'meal type') && colOk(2, 'diet') &&
        colOk(3, 'section') && colOk(4, 'dish', 'food item') && colOk(5, 'default');
      if (!headerOk) {
        toast.error('Column headers must be: Day, Meal Type, Diet, Section, Dish, Default');
        return;
      }
      const rows: MenuRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const c = lines[i];
        if (!c || c.every((x) => !String(x).trim())) continue;
        const row: MenuRow = {
          rowNum: i + 1,
          day: canonical(DAYS as any, c[0] || ''),
          meal: canonical(currentSet.meals || db.meals, c[1] || ''),
          diet: canonical(currentSet.diets || db.diets.map((x: any) => x.en), c[2] || ''),
          section: canonical(db.sections.map((s: any) => s.en), c[3] || ''),
          item: canonical(db.dishes.map((x: any) => x.en), c[4] || ''),
          def: (c[5] || 'No').trim(),
          errors: [],
        };
        row.errors = validateMenuRow(row);
        rows.push(row);
      }
      const hasErrs = rows.some((r) => r.errors.length > 0);
      setMenuImportName(file.name);
      setMenuImportView(hasErrs ? 'errors' : 'all');
      setMenuImportPage(1);
      setMenuImport(rows);
    };
    reader.readAsText(file);
  }

  // Live edit of a review row → re-validate.
  const editMenuRow = (rowNum: number, patch: Partial<MenuRow>) =>
    setMenuImport((prev) => (prev || []).map((r) => {
      if (r.rowNum !== rowNum) return r;
      const m = { ...r, ...patch };
      m.errors = validateMenuRow(m);
      return m;
    }));

  // Apply the valid rows — REPLACING every (diet · meal · day · section) they
  // cover, so removed rows actually disappear (not merge-only).
  function applyMenuImport() {
    const rows = (menuImport || []).filter((r) => r.errors.length === 0);
    updateFood((d: any) => {
      const dSet = d.sets.find((s: any) => s.id === setId);
      // 1) Clear the day-slots that appear in the file (covered combos).
      const covered = new Set<string>();
      rows.forEach((r) => covered.add(`${r.diet}|${r.meal}|${r.day}|${r.section}`));
      rows.forEach((r) => {
        if (!dSet.menu[r.diet]) dSet.menu[r.diet] = {};
        if (!dSet.menu[r.diet][r.meal]) dSet.menu[r.diet][r.meal] = [];
        const cfg = dSet.menu[r.diet][r.meal];
        let sec = cfg.find((x: any) => x.sec === r.section);
        if (!sec) {
          const daysObj: any = {}; DAYS.forEach((dy) => { daysObj[dy] = { items: [], def: null }; });
          const rule = sectionRule(d, r.section);
          sec = { sec: r.section, min: rule.min, max: rule.max, forAll: rule.forAll, days: daysObj };
          cfg.push(sec);
        }
        const key = `${r.diet}|${r.meal}|${r.day}|${r.section}`;
        if (covered.has(key)) { covered.delete(key); sec.days[r.day] = { items: [], def: null }; }
      });
      // 2) Add each row's item.
      rows.forEach((r) => {
        const sec = dSet.menu[r.diet][r.meal].find((x: any) => x.sec === r.section);
        if (!sec) return;
        if (!sec.days[r.day].items.includes(r.item)) sec.days[r.day].items.push(r.item);
        if (r.def.trim().toLowerCase() === 'yes') sec.days[r.day].def = r.item;
      });
    });
    const added = rows.length;
    const skipped = (menuImport || []).length - added;
    setMenuImport(null);
    toast.success(`Imported ${added} row${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} skipped` : ''}`);
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
      // Only one set is live at a time — publishing this one retires any other.
      d.sets.forEach((x: any) => {
        if (x.id === setId) { x.status = 'Published'; x.edited = 'just now'; }
        else if (x.status === 'Published') x.status = 'Draft';
      });
    });
    openWizard(1);
    setPublishOpen(false);
    toast('Published to bedside · now the live menu');
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
    4: 'Sections, dishes and defaults',
    5: 'Apply across',
    6: 'Ordering window',
    7: 'Review and publish',
  };

  const textInputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#19233a] bg-white focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] transition-colors";

  function step1() {
    return (
      <div className="p-5 flex flex-col gap-3.5 !overflow-visible">
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Menu set name (English)</div>
            <input
              className={textInputCls}
              value={currentSet.name}
              onChange={(e) => patchSet({ name: e.target.value })}
              placeholder="e.g. Standard week"
            />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#5d6678] mb-1.5 text-right font-['Poppins',sans-serif]">Menu set name (Arabic)</div>
            <input
              className={cx(textInputCls, 'text-right')}
              value={currentSet.nameAr || ''}
              onChange={(e) => patchSet({ nameAr: e.target.value })}
              placeholder="اسم قائمة الطعام"
              dir="rtl"
            />
          </div>
        </div>
        <div>
          <div className="text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Groups</div>
          <MultiSelectDropdown
            options={GROUP_OPTIONS}
            selectedValues={currentSet.groups || []}
            onChange={(vals: string[]) => patchSet({ groups: vals })}
            placeholder="Select groups"
          />
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Active from</div>
            <input
              type="date"
              className={textInputCls}
              value={currentSet.activeFrom || ''}
              onChange={(e) => patchSet({ activeFrom: e.target.value })}
            />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Active to</div>
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

  function toggleAllDiets() {
    const all: string[] = db.diets.map((dt: any) => dt.en);
    const allOn = (currentSet.diets || []).length === all.length;
    if (allOn) {
      patchSet({ diets: [all[0]] });
      if (ctx.diet !== all[0]) onCtx('diet', all[0]);
    } else {
      patchSet({ diets: all });
    }
  }

  function toggleAllMeals() {
    const all: string[] = [...db.meals];
    const allOn = (currentSet.meals || []).length === all.length;
    if (allOn) {
      patchSet({ meals: [all[0]] });
      if (ctx.meal !== all[0]) onCtx('meal', all[0]);
    } else {
      patchSet({ meals: all });
    }
  }

  function step2() {
    const selDiets: string[] = currentSet.diets || [];
    const selMeals: string[] = currentSet.meals || [];
    // Clean left-aligned checklist row: checkbox left, label next to it.
    const checkRow = (label: string, on: boolean, onClick: () => void) => (
      <button
        key={label}
        onClick={onClick}
        className={cx(
          'flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-xl border transition-colors cursor-pointer',
          on ? 'border-[#4EBEE3] bg-[#4EBEE3]/8 ring-1 ring-[#4EBEE3]/30' : 'border-[#e7e9f0] bg-white hover:bg-[#f7f8fb]',
        )}
      >
        <span className={cx('w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0', on ? 'bg-[#4EBEE3] border-[#4EBEE3]' : 'border-gray-300')}>
          {on && <Check size={13} className="text-white" strokeWidth={3} />}
        </span>
        <span className={cx('text-[14px]', on ? 'font-semibold text-[#16274D]' : 'font-medium text-[#19233a]')}>{label}</span>
      </button>
    );
    const sectionHead = (title: string, count: number, all: boolean, toggleAll: () => void) => (
      <div className="flex items-center gap-2 mb-2.5">
        <div className="font-semibold text-[#16274D] font-['Poppins',sans-serif]">{title}</div>
        <div className="text-[13px] text-[#5d6678]">· {count} selected</div>
        <button onClick={toggleAll} className="ml-auto text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] cursor-pointer">
          {all ? 'Clear all' : 'Select all'}
        </button>
      </div>
    );
    return (
      <div className="p-5">
        {sectionHead('Diets', selDiets.length, selDiets.length === db.diets.length, toggleAllDiets)}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {db.diets.map((dt: any) => checkRow(dt.en, selDiets.includes(dt.en), () => toggleSetDiet(dt.en)))}
        </div>
        <div className="mt-6">
          {sectionHead('Meals', selMeals.length, selMeals.length === db.meals.length, toggleAllMeals)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {db.meals.map((m: string) => checkRow(m, selMeals.includes(m), () => toggleSetMeal(m)))}
        </div>
      </div>
    );
  }

  function step4() {
    const dietOptions: string[] = currentSet.diets || [];
    const mealOptions: string[] = currentSet.meals || [];
    const allRows = flattenRows();
    const q = menuSearch.trim().toLowerCase();
    const filteredRows = allRows.filter((r) =>
      (filterDay === 'All' || r.day === filterDay)
      && (filterMeal === 'All' || r.meal === filterMeal)
      && (filterDiet === 'All' || r.diet === filterDiet)
      && (!q || [r.item, r.section, r.meal, r.diet, DAY_LABELS[r.day], r.day].some((f: any) => String(f || '').toLowerCase().includes(q)))
    );
    // Optional column sort (Assets-Hub style; null = natural order)
    const sortVal = (r: any): string | number => {
      switch (menuSort?.key) {
        case 'day': return DAYS.indexOf(r.day);
        case 'meal': return String(r.meal || '').toLowerCase();
        case 'diet': return String(r.diet || '').toLowerCase();
        case 'item': return String(r.item || '').toLowerCase();
        case 'section': return String(r.section || '').toLowerCase();
        case 'allergies': return String((db.dishes.find((x: any) => x.en === r.item)?.allergens?.[0]) || '').toLowerCase();
        default: return 0;
      }
    };
    const rows = menuSort
      ? [...filteredRows].sort((a, b) => {
          const av = sortVal(a), bv = sortVal(b);
          const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return menuSort.dir === 'asc' ? c : -c;
        })
      : filteredRows;
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const pageSafe = Math.min(page, totalPages);
    const pageRows = rows.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);
    const ruleKey = (r: any) => `${r.diet}|${r.meal}|${r.section}`;
    const dayFromLabel = (label: string) => Object.keys(DAY_LABELS).find((k) => DAY_LABELS[k] === label);
    const filtersActive = filterDay !== 'All' || filterMeal !== 'All' || filterDiet !== 'All' || menuSearch.trim() !== '';

    // 3-click column sort: asc → desc → normal (Assets-Hub style)
    const menuToggleSort = (key: string) =>
      setMenuSort((s) => {
        if (!s || s.key !== key) return { key, dir: 'asc' };
        if (s.dir === 'asc') return { key, dir: 'desc' };
        return null;
      });
    const SortTh = ({ label, k, first, right }: { label: string; k: string; first?: boolean; right?: boolean }) => (
      <th
        onClick={() => menuToggleSort(k)}
        className={cx(first ? 'px-5' : 'px-3', 'py-2 font-medium cursor-pointer select-none hover:bg-gray-100 transition-colors', right && 'text-right')}
      >
        <span className={cx('inline-flex items-center gap-2', right && 'justify-end w-full')}>
          {label}
          <TableSortIcon field={k} currentField={menuSort?.key || ''} direction={menuSort?.dir || 'asc'} />
        </span>
      </th>
    );

    const rowKey = (r: any) => `${r.diet}|${r.meal}|${r.day}|${r.section}|${r.item}`;
    // The section rule is shared across a section's rows, so its editor is shown
    // only once (under the first row of that section on the page).
    const shownEditor = new Set<string>();

    // One data row (+ the section's rule-editor once), with a leading select checkbox.
    const renderMenuRow = (r: any) => {
      const dish = db.dishes.find((x: any) => x.en === r.item);
      const allergen = dish?.allergens?.[0];
      const key = rowKey(r);
      const sel = menuSel.has(key);
      const rk = ruleKey(r);
      const showEditor = editRuleKey === rk && !shownEditor.has(rk);
      if (showEditor) shownEditor.add(rk);
      return (
        <Fragment key={key}>
          <tr className={cx('border-b border-[#e7e9f0] hover:bg-[#f7f8fb]', sel && 'bg-[#eaf7fc]')}>
            <td className="px-5 py-2.5">
              <input
                type="checkbox"
                checked={sel}
                onChange={() => setMenuSel((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer accent-[#4EBEE3]"
              />
            </td>
            <td className="px-3 py-2.5">
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
              <span className="text-[#19233a]">{r.item}</span>
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
                  className={cx('p-1.5 rounded transition-colors', showEditor || editRuleKey === rk ? 'bg-[#eaf7fc] text-[#0a7c9e]' : 'hover:bg-[#eaf7fc] text-[#5d6678]')}
                  onClick={() => {
                    if (editRuleKey === rk) { setEditRuleKey(null); setEditRuleDraft(null); }
                    else { setEditRuleKey(rk); setEditRuleDraft({ forAll: r.rule.forAll, min: r.rule.min, max: r.rule.max }); }
                  }}
                  title="Edit this section's rule (applies to every day)"
                  aria-label="Edit rule"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-[#fcebe9] text-[#c0392b]"
                  onClick={() => deleteRowItem(r.diet, r.meal, r.section, r.day, r.item)}
                  aria-label="Remove dish"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
          {showEditor && (
            <tr className="bg-[#f7f8fb] border-b border-[#e7e9f0]">
              <td colSpan={9} className="px-5 py-3">
                {(() => {
                  const d = editRuleDraft || { forAll: r.rule.forAll, min: r.rule.min, max: r.rule.max };
                  return (
                    <div className="flex flex-wrap items-center gap-3.5">
                      <span className="text-[13px] font-medium text-[#16274D]">Rule for {r.section} ({r.diet} · {r.meal}) <span className="font-normal text-[#9099ab]">· applies to every day</span></span>
                      <MiniSeg
                        options={[
                          { value: 'choice', label: 'Patient choice' },
                          { value: 'all', label: 'For all' },
                        ]}
                        value={d.forAll ? 'all' : 'choice'}
                        onChange={(v: string) => setEditRuleDraft((p) => ({ ...(p || d), forAll: v === 'all' }))}
                      />
                      {!d.forAll && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] text-[#5d6678]">Min</span>
                            <Stepper
                              value={d.min}
                              onDec={() => setEditRuleDraft((p) => { const c = p || d; return { ...c, min: Math.max(0, Math.min(c.max || 1, c.min - 1)) }; })}
                              onInc={() => setEditRuleDraft((p) => { const c = p || d; return { ...c, min: Math.max(0, Math.min(c.max || 1, c.min + 1)) }; })}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] text-[#5d6678]">Max</span>
                            <Stepper
                              value={d.max}
                              onDec={() => setEditRuleDraft((p) => { const c = p || d; return { ...c, max: Math.max(1, c.max - 1) }; })}
                              onInc={() => setEditRuleDraft((p) => { const c = p || d; return { ...c, max: Math.min(5, c.max + 1) }; })}
                            />
                          </div>
                        </>
                      )}
                      <span className="text-[13px] text-[#5d6678]">{ruleText(d)}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Save"
                          className="p-1.5 rounded hover:bg-[#e7f6f0] text-[#157f5c] transition-colors"
                          onClick={() => {
                            setSectionRule(r.diet, r.meal, r.section, d.forAll ? { forAll: true } : { forAll: false, min: d.min, max: d.max });
                            setEditRuleKey(null); setEditRuleDraft(null); toast('Rule saved');
                          }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          title="Close without saving"
                          className="p-1.5 rounded hover:bg-gray-100 text-[#5d6678] transition-colors"
                          onClick={() => { setEditRuleKey(null); setEditRuleDraft(null); }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </td>
            </tr>
          )}
        </Fragment>
      );
    };

    // Bulk edit — move all selected rows to a new day / meal / diet (blank = keep).
    const applyBulkEdit = () => {
      const keys = [...menuSel];
      const ruleTargets = new Set<string>();
      keys.forEach((k) => {
        const [dt, ml, dy, sc, it] = k.split('|');
        const to = { diet: bulkEdit.diet || dt, meal: bulkEdit.meal || ml, day: bulkEdit.day || dy };
        if (to.diet !== dt || to.meal !== ml || to.day !== dy) moveRowItem(it, { diet: dt, meal: ml, day: dy }, to);
        ruleTargets.add(`${to.diet}|${to.meal}|${sc}`);
      });
      if (bulkRule.mode !== 'keep') {
        ruleTargets.forEach((t) => {
          const [dt, ml, sc] = t.split('|');
          setSectionRule(dt, ml, sc, bulkRule.mode === 'all'
            ? { forAll: true }
            : { forAll: false, min: bulkRule.min, max: bulkRule.max });
        });
      }
      setBulkEditOpen(false);
      setMenuSel(new Set());
      toast(`Updated ${keys.length} dish${keys.length === 1 ? '' : 'es'}`);
    };
    const bulkEditModal = () => {
      const fldLabel = "block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]";
      const noChange = !bulkEdit.day && !bulkEdit.meal && !bulkEdit.diet && bulkRule.mode === 'keep';
      return (
        <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={() => setBulkEditOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[460px] font-['Poppins',sans-serif] !overflow-visible" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#eef0f4] flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#16274D]">Edit {menuSel.size} selected</h2>
                <p className="text-[13px] text-[#5d6678]">Move them to a new day, meal, or diet. Leave “Keep” to not change it.</p>
              </div>
              <button onClick={() => setBulkEditOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 !overflow-visible">
              <div className="relative !overflow-visible">
                <label className={fldLabel}>Day</label>
                <SingleSelectDropdown
                  options={['Keep', ...DAYS.map((dy) => DAY_LABELS[dy])]}
                  value={bulkEdit.day ? DAY_LABELS[bulkEdit.day] : 'Keep'}
                  onChange={(v: string) => setBulkEdit((p) => ({ ...p, day: v === 'Keep' ? '' : (dayFromLabel(v) || '') }))}
                />
              </div>
              <div className="relative !overflow-visible">
                <label className={fldLabel}>Meal</label>
                <SingleSelectDropdown
                  options={['Keep', ...mealOptions]}
                  value={bulkEdit.meal || 'Keep'}
                  onChange={(v: string) => setBulkEdit((p) => ({ ...p, meal: v === 'Keep' ? '' : v }))}
                />
              </div>
              <div className="relative !overflow-visible">
                <label className={fldLabel}>Diet</label>
                <SingleSelectDropdown
                  options={['Keep', ...dietOptions]}
                  value={bulkEdit.diet || 'Keep'}
                  onChange={(v: string) => setBulkEdit((p) => ({ ...p, diet: v === 'Keep' ? '' : v }))}
                />
              </div>
            </div>
            <div className="px-5 pb-5">
              <label className={fldLabel}>Section rule</label>
              <div className="flex flex-wrap items-center gap-4">
                <MiniSeg
                  options={[
                    { value: 'keep', label: 'Keep' },
                    { value: 'choice', label: 'Patient choice' },
                    { value: 'all', label: 'For all' },
                  ]}
                  value={bulkRule.mode}
                  onChange={(v: string) => setBulkRule((p) => ({ ...p, mode: v as any }))}
                />
                {bulkRule.mode === 'choice' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-[#5d6678]">Min</span>
                      <Stepper value={bulkRule.min} onDec={() => setBulkRule((p) => ({ ...p, min: Math.max(0, Math.min(p.max || 1, p.min - 1)) }))} onInc={() => setBulkRule((p) => ({ ...p, min: Math.max(0, Math.min(p.max || 1, p.min + 1)) }))} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-[#5d6678]">Max</span>
                      <Stepper value={bulkRule.max} onDec={() => setBulkRule((p) => ({ ...p, max: Math.max(1, p.max - 1) }))} onInc={() => setBulkRule((p) => ({ ...p, max: Math.min(5, p.max + 1) }))} />
                    </div>
                  </>
                )}
              </div>
              <p className="text-[11.5px] text-[#9099ab] mt-1.5">Applies to the section(s) of the selected dishes.</p>
            </div>
            <div className="border-t border-[#eef0f4] p-4 flex items-center justify-between">
              <Btn variant="neutral" onClick={() => setBulkEditOpen(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={applyBulkEdit} className={noChange ? 'opacity-50 pointer-events-none' : ''}>Apply to {menuSel.size}</Btn>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e7e9f0]">
          <div>
            <div className="font-medium text-[#19233a]">Menu Dishes</div>
            <div className="text-[13px] text-[#5d6678]">Manage the menu dishes served for each day</div>
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
          </div>
        </div>

        {(
          <div className="px-5 py-4 bg-[#f8fafc] border-t border-b border-[#e7e9f0] !overflow-visible">
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9099ab] pointer-events-none" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => { setMenuSearch(e.target.value); setPage(1); }}
                placeholder="Search menu dishes, section, meal type or diet…"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-[13.5px] bg-white focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] outline-none"
              />
              {menuSearch && (
                <button
                  type="button"
                  onClick={() => { setMenuSearch(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9099ab] hover:text-[#5d6678]"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 !overflow-visible">
              <div className="relative">
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Day</label>
                <SingleSelectDropdown
                  options={['All', ...DAYS.map((dy) => DAY_LABELS[dy])]}
                  value={filterDay === 'All' ? 'All' : DAY_LABELS[filterDay]}
                  onChange={(v: string) => { setFilterDay(v === 'All' ? 'All' : (dayFromLabel(v) || 'All')); setPage(1); }}
                />
              </div>
              <div className="relative">
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Meal Type</label>
                <SingleSelectDropdown
                  options={['All', ...mealOptions]}
                  value={filterMeal}
                  onChange={(v: string) => { setFilterMeal(v); setPage(1); }}
                />
              </div>
              <div className="relative">
                <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">Diet</label>
                <SingleSelectDropdown
                  options={['All', ...dietOptions]}
                  value={filterDiet}
                  onChange={(v: string) => { setFilterDiet(v); setPage(1); }}
                />
              </div>
            </div>
            {filtersActive && (
              <div className="mt-3">
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#0a84b1] hover:underline"
                  onClick={() => { setFilterDay('All'); setFilterMeal('All'); setFilterDiet('All'); setMenuSearch(''); setPage(1); }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {menuSel.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#eaf7fc] border-t border-[#bfe6f4]">
            <span className="text-[13px] font-semibold text-[#16274D]">{menuSel.size} selected</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setBulkEdit({ day: '', meal: '', diet: '' }); setBulkRule({ mode: 'keep', min: 1, max: 1 }); setBulkEditOpen(true); }}
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[10px] bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white text-[13px] font-medium cursor-pointer transition-colors"
              >
                <Pencil size={15} /> Edit selected
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = menuSel.size;
                  menuSel.forEach((k) => { const [dt, ml, dy, sc, it] = k.split('|'); deleteRowItem(dt, ml, sc, dy, it); });
                  setMenuSel(new Set());
                  toast(`Removed ${n} dish${n === 1 ? '' : 'es'}`);
                }}
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[13px] font-medium cursor-pointer transition-colors"
              >
                <Trash2 size={15} /> Delete
              </button>
              <button type="button" className="text-[13px] font-medium text-[#5d6678] hover:text-[#16274D]" onClick={() => setMenuSel(new Set())}>Cancel</button>
            </div>
          </div>
        )}

        {total === 0 && !addingRow ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#9099ab] border-t border-[#e7e9f0]">
            <Salad size={28} />
            <div className="text-[13px]">No menu dishes yet — add a row to get started.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-[11px] text-gray-600 font-['Poppins',sans-serif]">
                  <th className="px-5 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={pageRows.length > 0 && pageRows.every((r) => menuSel.has(rowKey(r)))}
                      onChange={() => setMenuSel((s) => {
                        const n = new Set(s);
                        const keys = pageRows.map(rowKey);
                        const all = keys.every((k) => n.has(k));
                        keys.forEach((k) => (all ? n.delete(k) : n.add(k)));
                        return n;
                      })}
                      className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer accent-[#4EBEE3]"
                    />
                  </th>
                  <SortTh label="Day" k="day" />
                  <SortTh label="Meal Type" k="meal" />
                  <SortTh label="Diet" k="diet" />
                  <SortTh label="Menu Dishes" k="item" />
                  <SortTh label="Section" k="section" />
                  <SortTh label="Allergies" k="allergies" />
                  <th className="px-3 py-2 font-medium">Default?</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addingRow && (
                  <tr className="border-b border-[#e7e9f0] bg-[#eaf7fc]">
                    <td className="px-5 py-2.5"></td>
                    <td className="px-3 py-2.5">
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
                          searchable
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
                {pageRows.map(renderMenuRow)}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <Bar>
            <span className="text-[13px] text-[#5d6678]">
              Showing {(pageSafe - 1) * PER_PAGE + 1} to {Math.min(pageSafe * PER_PAGE, total)} of {total} dishes
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

        {bulkEditOpen && bulkEditModal()}
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

    const timeCls = "w-[150px] px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#19233a] bg-white focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] transition-colors cursor-pointer";
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
            value={to24h(db.win.open)}
            onChange={(e) => updateFood((d: any) => { d.win.open = to12h(e.target.value); })}
            className={timeCls}
          />
        ),
      },
      {
        name: 'Closes (cutoff)',
        desc: 'Last moment to place or edit',
        right: (
          <input
            type="time"
            value={to24h(db.win.close)}
            onChange={(e) => updateFood((d: any) => { d.win.close = to12h(e.target.value); })}
            className={timeCls}
          />
        ),
      },
      { name: 'Auto-fill default if no order', desc: 'Fall back to the default dish when no choice made', key: 'autoDefault' },
      { name: 'Allow edits until cutoff', desc: 'Patients can change their order before it closes', key: 'allowEdit' },
    ];
    return (
      <div className="p-5">
        <div className="rounded-xl border border-gray-200 overflow-hidden !overflow-visible">
          {rows.map((r, i) => (
            <div key={i} className={cx('flex items-center gap-4 px-4 py-3.5', i < rows.length - 1 && 'border-b border-gray-100')}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#19233a] text-[14px]">{r.name}</div>
                <div className="text-[12.5px] text-[#5d6678]">{r.desc}</div>
              </div>
              {r.right ? r.right : (
                <Toggle on={db.win[r.key]} onClick={() => updateFood((d: any) => { d.win[r.key] = !d.win[r.key]; })} />
              )}
            </div>
          ))}
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
    const published = set.status === 'Published';

    // Set-specific counts (not the whole library).
    const setSections = new Set<string>();
    const setDishes = new Set<string>();
    (set.diets || []).forEach((diet: string) => (set.meals || []).forEach((meal: string) => {
      const cfg = (currentMenu[diet]?.[meal]) || (currentMenu.Regular?.[meal]) || [];
      cfg.forEach((sec: any) => {
        setSections.add(sec.sec);
        DAYS.forEach((day: string) => (sec.days?.[day]?.items || []).forEach((en: string) => setDishes.add(en)));
      });
    }));
    const statCard = (label: string, value: number) => (
      <div className="rounded-[10px] px-[15px] py-[13px] bg-[#f7f8fb]">
        <div className="text-[12.5px] text-[#5d6678]">{label}</div>
        <div className="text-[23px] font-semibold mt-0.5 font-['Poppins',sans-serif] text-[#16274D]">{value}</div>
      </div>
    );

    return (
      <Card className={step === 1 ? '!overflow-visible' : undefined}>
        <CardHead
          back={{ label: 'Menu sets', onClick: () => setSub('list') }}
          title={<>{set.name}{set.nameAr ? <span className="text-[#9099ab] font-normal text-[16px] mr-1" dir="rtl"> · {set.nameAr}</span> : null} <StatusBadge status={set.status} /></>}
          sub={`${groupsLabel(set.groups)} · edited ${set.edited}`}
          right={
            <>
              <Btn variant="neutral" onClick={dupSet}><Copy size={16} /> Duplicate</Btn>
              <Btn variant="accent" onClick={() => onNavigate('food-kiosk')}><Eye size={16} /> Preview</Btn>
              <Btn variant="primary" onClick={() => setPublishOpen(true)}>
                <Rocket size={16} /> {published ? 'Re-publish' : 'Publish'}
              </Btn>
            </>
          }
        />
        <div className="grid grid-cols-4 gap-3 px-5 pt-5 pb-2">
          {statCard('Diets', (set.diets || []).length)}
          {statCard('Meals', (set.meals || []).length)}
          {statCard('Sections', setSections.size)}
          {statCard('Dishes', setDishes.size)}
        </div>
        <div className="px-3 pt-2 flex items-end justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <PillTabs
              tabs={[1, 2, 4, 6].map((s) => ({ id: String(s), label: STEP_TITLES[s] }))}
              activeTab={String(step)}
              onChange={(id) => setStep(Number(id))}
            />
          </div>
          {step === 4 && (
            <div className="flex gap-2 pb-1 pr-2">
              <Btn variant="neutral" onClick={exportMenuToCSV}>
                <Download size={15} /> Export
              </Btn>
              <label className="inline-flex items-center justify-center gap-2 h-[38px] px-[15px] text-[13.5px] rounded-[10px] border border-[#d6dae6] bg-white hover:bg-[#f7f8fb] text-[#19233a] font-medium cursor-pointer transition-colors">
                <Upload size={15} /> Import
                <input type="file" accept=".csv" onChange={importMenuFromCSV} className="hidden" />
              </label>
            </div>
          )}
        </div>
        {wizardBody()}
        {publishOpen && publishModal(set, published)}
      </Card>
    );
  }

  // ============================================================
  return (
    <FoodPage current="set" onNavigate={onNavigate}>
      {sub === 'list' && viewSets()}
      {sub === 'wizard' && viewWizard()}
      {menuImport && menuImportModal()}
    </FoodPage>
  );

  function menuImportModal() {
    const rows = menuImport || [];
    const valid = rows.filter((r) => r.errors.length === 0);
    const errs = rows.filter((r) => r.errors.length > 0);
    const th = "px-3 py-2 text-left text-[11px] font-medium text-gray-600 font-['Poppins',sans-serif]";
    const cellSel = "w-full bg-transparent rounded px-1.5 py-1 text-[13px] text-[#19233a] outline-none border border-transparent hover:border-[#e0e4ee] focus:border-[#4EBEE3] focus:bg-white cursor-pointer";
    const sel = (val: string, opts: string[], onCh: (v: string) => void, bad: boolean) => (
      <select value={opts.includes(val) ? val : ''} onChange={(e) => onCh(e.target.value)} className={cx(cellSel, bad && 'border-[#f0c0c0]')}>
        <option value="" disabled>Choose…</option>
        {!opts.includes(val) && val && <option value={val}>{val} (invalid)</option>}
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    const dishOpts = db.dishes.map((x: any) => x.en);
    const sectionOpts = db.sections.map((s: any) => s.en);
    const dietOpts = currentSet.diets || db.diets.map((x: any) => x.en);
    const mealOpts = currentSet.meals || db.meals;
    // Only ~50 rows are ever mounted, so big files stay fast.
    const viewRows = menuImportView === 'errors' ? errs : rows;
    const impTotalPages = Math.max(1, Math.ceil(viewRows.length / MENU_IMPORT_PER_PAGE));
    const impPageSafe = Math.min(menuImportPage, impTotalPages);
    const pagedRows = viewRows.slice((impPageSafe - 1) * MENU_IMPORT_PER_PAGE, impPageSafe * MENU_IMPORT_PER_PAGE);
    return (
      <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={() => setMenuImport(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-[920px] max-h-[90vh] flex flex-col font-['Poppins',sans-serif]" onClick={(e) => e.stopPropagation()}>
          <div className="p-5 border-b border-[#eef0f4] flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#16274D]">Review menu import</h2>
              <p className="text-[13.5px] text-[#5d6678]">{menuImportName} · fix any highlighted rows, then import.</p>
            </div>
            <button onClick={() => setMenuImport(null)} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer"><X size={18} /></button>
          </div>
          <div className="px-5 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => { setMenuImportView('all'); setMenuImportPage(1); }} className={cx('rounded-xl border px-4 py-3 text-left transition-colors', menuImportView === 'all' ? 'border-[#4EBEE3] ring-1 ring-[#4EBEE3]/30 bg-[#4EBEE3]/5' : 'border-[#e7e9f0] hover:bg-[#f7f8fb] cursor-pointer')}><div className="text-[12.5px] text-[#5d6678]">Rows found</div><div className="text-[22px] font-semibold text-[#16274D]">{rows.length}</div></button>
              <div className="rounded-xl border border-[#e7e9f0] px-4 py-3"><div className="text-[12.5px] text-[#5d6678]">Will import</div><div className="text-[22px] font-semibold text-[#157f5c]">{valid.length}</div></div>
              <button onClick={() => { setMenuImportView(errs.length ? 'errors' : 'all'); setMenuImportPage(1); }} className={cx('rounded-xl border px-4 py-3 text-left transition-colors', menuImportView === 'errors' ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]/20 bg-red-50/50' : 'border-[#e7e9f0] hover:bg-[#f7f8fb] cursor-pointer')}><div className="text-[12.5px] text-[#5d6678]">Need fixing {errs.length > 0 && <span className="text-[#b91c1c]">— tap to review</span>}</div><div className="text-[22px] font-semibold text-[#b91c1c]">{errs.length}</div></button>
            </div>
            <p className="text-[12px] text-[#9099ab] mt-2">Importing replaces the day’s items for each diet · meal · section in the file — removed rows disappear. Tip: click any cell to fix it.</p>
            <div className="mt-3 flex items-center gap-5 border-b border-gray-200">
              <button
                onClick={() => { setMenuImportView('all'); setMenuImportPage(1); }}
                className={cx('px-1 pb-2 text-[13.5px] font-medium border-b-2 -mb-px transition-colors cursor-pointer', menuImportView === 'all' ? 'border-[#4EBEE3] text-[#16274D]' : 'border-transparent text-[#5d6678] hover:text-[#16274D]')}
              >
                All rows <span className={cx('ml-1 text-[11px] px-1.5 py-0.5 rounded-full', menuImportView === 'all' ? 'bg-[#4EBEE3]/15 text-[#0a7c9e]' : 'bg-[#f2f4f8] text-[#9099ab]')}>{rows.length}</span>
              </button>
              <button
                onClick={() => { setMenuImportView('errors'); setMenuImportPage(1); }}
                className={cx('px-1 pb-2 text-[13.5px] font-medium border-b-2 -mb-px transition-colors cursor-pointer', menuImportView === 'errors' ? 'border-[#b91c1c] text-[#16274D]' : 'border-transparent text-[#5d6678] hover:text-[#16274D]')}
              >
                Need fixing <span className={cx('ml-1 text-[11px] px-1.5 py-0.5 rounded-full', menuImportView === 'errors' ? 'bg-[#b91c1c]/12 text-[#b91c1c]' : 'bg-[#f2f4f8] text-[#9099ab]')}>{errs.length}</span>
              </button>
            </div>
          </div>
          <div className="px-5 py-3 overflow-auto">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0"><tr>
                  <th className={cx(th, 'w-10')}>Row</th><th className={th}>Day</th><th className={th}>Meal</th><th className={th}>Diet</th><th className={th}>Section</th><th className={th}>Dish</th><th className={th}>Default</th>
                </tr></thead>
                <tbody>
                  {viewRows.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-[13px] text-[#157f5c]">All rows are valid — nothing left to fix. 🎉</td></tr>
                  )}
                  {pagedRows.map((r) => {
                    const bad = r.errors.length > 0;
                    return (
                      <Fragment key={r.rowNum}>
                        <tr className={cx('border-b border-gray-100', bad && 'bg-[#fff7f7]')}>
                          <td className="px-3 py-1.5 text-[12px] text-gray-400">{r.rowNum}</td>
                          <td className="px-2 py-1">{sel(r.day, DAYS as any, (v) => editMenuRow(r.rowNum, { day: v }), bad)}</td>
                          <td className="px-2 py-1">{sel(r.meal, mealOpts, (v) => editMenuRow(r.rowNum, { meal: v }), bad)}</td>
                          <td className="px-2 py-1">{sel(r.diet, dietOpts, (v) => editMenuRow(r.rowNum, { diet: v }), bad)}</td>
                          <td className="px-2 py-1">{sel(r.section, sectionOpts, (v) => editMenuRow(r.rowNum, { section: v }), bad)}</td>
                          <td className="px-2 py-1">{sel(r.item, dishOpts, (v) => editMenuRow(r.rowNum, { item: v }), bad)}</td>
                          <td className="px-2 py-1">{sel(r.def || 'No', ['Yes', 'No'], (v) => editMenuRow(r.rowNum, { def: v }), false)}</td>
                        </tr>
                        {bad && <tr className="bg-[#fff7f7] border-b border-gray-100"><td></td><td colSpan={6} className="px-3 pb-2 pt-0 text-[12px] text-[#b91c1c]">{r.errors.join(' · ')}</td></tr>}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {impTotalPages > 1 && (
              <div className="flex items-center justify-between mt-3 text-[13px] text-[#5d6678]">
                <span>
                  Showing {(impPageSafe - 1) * MENU_IMPORT_PER_PAGE + 1}–{Math.min(impPageSafe * MENU_IMPORT_PER_PAGE, viewRows.length)} of {viewRows.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMenuImportPage((p) => Math.max(1, p - 1))}
                    disabled={impPageSafe <= 1}
                    className={cx('h-8 px-3 rounded-lg border text-[13px]', impPageSafe <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#d6dae6] text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer')}
                  >
                    Prev
                  </button>
                  <span className="px-1">Page {impPageSafe} / {impTotalPages}</span>
                  <button
                    onClick={() => setMenuImportPage((p) => Math.min(impTotalPages, p + 1))}
                    disabled={impPageSafe >= impTotalPages}
                    className={cx('h-8 px-3 rounded-lg border text-[13px]', impPageSafe >= impTotalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#d6dae6] text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer')}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto border-t border-[#eef0f4] p-4 flex items-center justify-between">
            <button onClick={() => setMenuImport(null)} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Cancel</button>
            <button
              onClick={applyMenuImport}
              disabled={valid.length === 0}
              className={cx('h-[38px] px-5 rounded-[10px] text-[14px] font-medium text-white', valid.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#4EBEE3] hover:bg-[#3DA5CA] cursor-pointer')}
            >
              Import {valid.length} row{valid.length === 1 ? '' : 's'}{errs.length ? ` · skip ${errs.length}` : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }
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
