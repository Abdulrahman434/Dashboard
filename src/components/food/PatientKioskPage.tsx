import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ChefHat,
  Info,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  Utensils,
  Sun,
  Moon,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, resolve, ruleText, updateFood, nextOrderId, getLiveSet, takeKioskPrefill } from './foodStore';
import { cx, Btn, Badge, Card, CardHead, Bar, Note, FoodPage } from './foodAtoms';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

type Stage = 'context' | 'order' | 'review' | 'done';

interface KioskState {
  stage: Stage;
  patientIdx: number;
  eater: 'Patient' | 'Guest';
  meal: string;
  day: string;
  sel: Record<string, string[]>;
}

// Real weekday codes for "today" / "tomorrow" (JS getDay: 0=Sun..6=Sat).
const JS_DAY_CODE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayCode = () => JS_DAY_CODE[new Date().getDay()];
const tomorrowCode = () => JS_DAY_CODE[(new Date().getDay() + 1) % 7];
// ISO (YYYY-MM-DD) for a serving-day code — the Kitchen board keys tickets by ISO date.
const isoForCode = (code: string): string => {
  const base = new Date();
  base.setDate(base.getDate() + (code === tomorrowCode() ? 1 : 0));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(base.getDate())}`;
};

const freshContext = (): KioskState => ({
  stage: 'context',
  patientIdx: -1,
  eater: 'Patient',
  meal: 'Lunch',
  day: todayCode(),
  sel: {},
});

export default function PatientKioskPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db: any = useFood();
  // Patients order from whichever menu set is currently Published — not a
  // fixed/global menu — so publishing a new set immediately changes what's
  // offered here.
  const liveSet = getLiveSet(db);
  const activeMenu = liveSet.menu;
  // Meals offered come from the live (published) set, not the global list.
  const liveMeals: string[] = (liveSet.meals && liveSet.meals.length) ? liveSet.meals : db.meals;
  const [kiosk, setKiosk] = useState<KioskState>(freshContext);
  const [patientOpen, setPatientOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientWard, setPatientWard] = useState('All');
  const [patientFloor, setPatientFloor] = useState('All');
  const [trayConfirm, setTrayConfirm] = useState(false);
  // Ward = the room's hundreds group (e.g. Room 312 → Ward 300), for quick filtering.
  const wardOf = (room: any): string => {
    const n = parseInt(String(room), 10);
    return Number.isFinite(n) ? String(Math.floor(n / 100) * 100) : '—';
  };
  const wardOptions = Array.from(new Set((db.patients || []).map((p: any) => wardOf(p.room)))).sort();
  const floorOptions = Array.from(new Set((db.patients || []).map((p: any) => String(p.floor || '—')))).sort();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  /* Where the kiosk was opened from, so there is always a way out. The kiosk
     is otherwise a dead end once you arrive from another page. */
  const [returnTo, setReturnTo] = useState<{ route: string; label: string } | null>(null);
  const k = kiosk;

  /* Arriving from the Kitchen's "Not Ordered" tab: the row that was clicked
     names the patient, the meal and the day, so none of it is picked twice.
     The kitchen board is driven by the bed/device roster, which can hold
     patients this roster doesn't have yet — add them rather than dropping the
     hand-off, otherwise the button silently does nothing for those rows. */
  useEffect(() => {
    const pre = takeKioskPrefill();
    if (!pre) return;
    if (pre.returnTo) setReturnTo({ route: pre.returnTo, label: pre.returnLabel || 'Back' });
    const name = pre.name;
    if (!name) return;

    let idx = (db.patients || []).findIndex(
      (p: any) => String(p.name).toLowerCase() === name.toLowerCase()
    );
    if (idx < 0) {
      idx = (db.patients || []).length;
      updateFood((draft: any) => {
        draft.patients.push({
          name,
          room: pre.room || '',
          bed: pre.bed || '',
          floor: pre.floor || '',
          building: '',
          diet: pre.diet || 'Regular',
          allergies: [],
          mrn: pre.mrn || '',
          nameAr: '',
        });
      });
    }
    setKiosk((kk) => ({
      ...kk,
      stage: 'context',
      patientIdx: idx,
      eater: pre.eater === 'Guest' ? 'Guest' : 'Patient',
      meal: pre.meal || kk.meal,
      day: pre.day === 'today' ? todayCode() : tomorrowCode(),
      sel: {},
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same helpers the Kitchen ticket uses, so the confirmation card matches the print.
  const isAccompaniment = (section: string, dishName: string) => {
    const sec = section.toLowerCase();
    const dish = dishName.toLowerCase();
    if (sec === 'drinks' || sec === 'baked breads') return true;
    if (dish.includes('cheese platter') || dish === 'bread' || dish === 'milk') return true;
    return false;
  };
  const fmtDate = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  const mealWindow = (meal: string) =>
    meal === 'Breakfast' ? '8:00 AM – 9:00 AM' : meal === 'Lunch' ? '1:00 PM – 2:00 PM' : '7:00 PM – 8:00 PM';
  // Friendly per-meal icon + resting color (selected state is always brand cyan).
  const mealIcon = (m: string) => (m === 'Breakfast' ? Sun : m === 'Dinner' ? Moon : Utensils);
  const mealTint = (m: string) =>
    m === 'Breakfast' ? 'bg-[#fdf3e0] text-[#c98a1a]' : m === 'Dinner' ? 'bg-[#efeafe] text-[#6d4fc4]' : 'bg-[#e6f6fc] text-[#1d7da3]';

  // ---- Bilingual helpers (patient screen is EN + AR) ----
  const MEAL_AR: Record<string, string> = { Breakfast: 'الإفطار', Lunch: 'الغداء', Dinner: 'العشاء' };
  const EATER_AR: Record<string, string> = { Patient: 'المريض', Guest: 'المرافق' };
  const secAr = (name: string): string => (db.sections.find((s: any) => s.en === name)?.ar) || '';
  const dietAr = (name: string): string => (db.diets.find((d: any) => d.en === name)?.ar) || '';
  const mealAr = (name: string): string => (db.mealMeta?.[name]?.ar) || MEAL_AR[name] || '';
  // Bilingual heading: English on top, Arabic underneath — both clearly readable.
  const Bi = ({ en, ar, className }: { en: string; ar: any; className?: string }) => (
    <span className={cx('inline-flex flex-col leading-snug', className)}>
      <span>{en}</span>
      {ar ? <span className="text-[15px] font-medium text-[#5d6678]" dir="rtl">{ar}</span> : null}
    </span>
  );
  // Compact stacked label for chips/buttons (centered).
  const BiMini = ({ en, ar }: { en: string; ar: string }) => (
    <span className="inline-flex flex-col items-center leading-snug gap-0.5 py-0.5">
      <span>{en}</span>
      {ar ? <span className="text-[13px] font-medium opacity-90" dir="rtl">{ar}</span> : null}
    </span>
  );

  // Show the serving day as Today / Tomorrow (system style), falling back to the code.
  const dayLabel = (code: string): string =>
    code === todayCode() ? 'Today' : code === tomorrowCode() ? 'Tomorrow' : code;

  const curDiet = (kk: KioskState): string =>
    kk.eater === 'Guest' ? 'Regular' : db.patients[kk.patientIdx].diet;

  // ---- Reusable tile ----
  function Tile({ on, disabled, onClick, children }: any) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cx(
          'flex items-start gap-2.5 rounded-[12px] text-left w-full transition-colors',
          on
            ? 'border-2 border-[#4EBEE3] bg-[#eaf7fc] p-3'
            : 'border border-[#d6dae6] bg-white p-3',
          disabled
            ? 'opacity-55 cursor-not-allowed bg-[#f7f8fb]'
            : 'cursor-pointer hover:border-[#4EBEE3]',
        )}
      >
        <span
          className={cx(
            'shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
            on ? 'bg-[#4EBEE3]' : 'border border-[#d6dae6]',
          )}
        >
          {on && <Check size={13} className="text-[#16274D]" />}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
      </button>
    );
  }

  // ---- kPick ----
  function kPick(sn: string, item: string) {
    const diet = curDiet(k);
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    const sec: any = cfg.find((s: any) => s.sec === sn);
    let arr = k.sel[sn] ? [...k.sel[sn]] : [];
    if (arr.includes(item)) {
      arr = arr.filter((x) => x !== item);
    } else if (sec && sec.max && arr.length >= sec.max) {
      if (sec.max === 1) {
        arr = [item];
      } else {
        toast('Choose up to ' + sec.max + ' in ' + sn);
        return;
      }
    } else {
      arr = [...arr, item];
    }
    setKiosk((kk) => ({ ...kk, sel: { ...kk.sel, [sn]: arr } }));
  }

  // ---- kConfirm ----
  function kConfirm() {
    const p = db.patients[k.patientIdx];
    const diet = curDiet(k);
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    const lines: { name: string; section: string }[] = [];
    cfg.forEach((sec: any) => {
      if (sec.forAll) return;
      (k.sel[sec.sec] || []).forEach((item) => lines.push({ name: item, section: sec.sec }));
    });
    cfg.forEach((sec: any) => {
      if (!sec.forAll) return;
      sec.items.forEach((en: string) => {
        const dish: any = db.dishes.find((z: any) => z.en === en && z.on);
        if (dish) lines.push({ name: dish.en, section: sec.sec });
      });
    });
    const t = new Date();
    const time =
      String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    const orderId = nextOrderId();
    setLastOrderId(orderId);
    updateFood((d: any) => {
      d.orders.unshift({
        id: orderId,
        name: k.eater === 'Guest' ? `Guest — ${p.name}` : p.name,
        eater: k.eater,
        room: p.room,
        bed: p.bed,
        diet,
        meal: k.meal,
        date: isoForCode(k.day),
        time,
        status: 'Submitted',
        lines: lines.map((l) => [l.section, l.name]),
      });
    });
    setTrayConfirm(false);
    setKiosk((kk) => ({ ...kk, stage: 'done' }));
  }

  // =========================================================
  // STAGE: context
  // =========================================================
  const kioskContext = () => (
    <Card>
      {/* One header row: page identity on the left, menu/serving meta on the
          right. It used to be a page header stacked on top of a CardHead that
          repeated the same context, which cost ~180px before any control. */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#e7e9f0]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center shrink-0">
            <Utensils size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[18px] leading-tight font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Patient Kiosk · <span className="text-[#5d6678]">Who is ordering?</span>
            </h1>
            <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]" dir="rtl">من يطلب؟</p>
          </div>
        </div>
        <div className="text-[13px] text-[#5d6678] text-right shrink-0 hidden sm:block">
          {`Menu: ${liveSet.name} · Serving ${dayLabel(k.day)} · closes ${db.win.close}`}
        </div>
      </div>
      <div className="p-3.5 sm:p-4 bg-[#f6f8fc] space-y-3">
        {/* Patient, eater and serving day sit on one row — they are three short
            choices, not three sections. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-3">
        <div className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-3.5">
        <div className="font-semibold text-[#16274D] mb-1.5"><Bi en="Patient" ar="المريض" /></div>
        {(() => {
          const p = k.patientIdx >= 0 ? db.patients[k.patientIdx] : null;
          return (
            <div className="relative">
              <button
                type="button"
                onClick={() => { setPatientOpen((o) => !o); setPatientQuery(''); setPatientWard('All'); setPatientFloor('All'); }}
                className={cx(
                  'w-full flex items-center gap-3 rounded-[12px] border bg-white px-3.5 py-2.5 text-left transition-colors cursor-pointer',
                  patientOpen ? 'border-[#4EBEE3] ring-1 ring-[#4EBEE3]/30' : 'border-[#d6dae6] hover:border-[#4EBEE3]',
                )}
              >
                <span className={cx('w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[14px] shrink-0', p ? 'bg-[#4EBEE3]/15 text-[#1d7da3]' : 'bg-[#f0f4f8] text-[#9099ab]')}>
                  {p ? initials(p.name) : <User size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  {p ? (
                    <>
                      <span className="block font-semibold text-[#16274D] text-[15px] truncate">{p.name}</span>
                      <span className="block text-[12.5px] text-[#9099ab] truncate">
                        {`Room ${p.room} · Bed ${p.bed} · ${p.diet}`}
                        {p.allergies.length ? <span className="text-[#c0392b]">{` · allergy: ${p.allergies.join(', ')}`}</span> : null}
                      </span>
                    </>
                  ) : (
                    <span className="block font-semibold text-[#9099ab] text-[15px]">Select patient · اختر المريض</span>
                  )}
                </span>
                <ChevronDown size={18} className={cx('text-[#9099ab] shrink-0 transition-transform', patientOpen && 'rotate-180')} />
              </button>
              {patientOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPatientOpen(false)} />
                  <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white rounded-[12px] border border-[#e0e4ee] shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-[#eef0f4] flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9099ab] pointer-events-none" />
                        <input
                          autoFocus
                          value={patientQuery}
                          onChange={(e) => setPatientQuery(e.target.value)}
                          placeholder="Search patient, room or bed…"
                          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] outline-none"
                        />
                      </div>
                      <select
                        value={patientFloor}
                        onChange={(e) => setPatientFloor(e.target.value)}
                        className="shrink-0 py-2 px-2.5 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] outline-none"
                        title="Filter by floor"
                      >
                        <option value="All">All floors</option>
                        {floorOptions.map((f) => <option key={f} value={f}>Floor {f}</option>)}
                      </select>
                      <select
                        value={patientWard}
                        onChange={(e) => setPatientWard(e.target.value)}
                        className="shrink-0 py-2 px-2.5 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] outline-none"
                        title="Filter by ward"
                      >
                        <option value="All">All wards</option>
                        {wardOptions.map((w) => <option key={w} value={w}>Ward {w}</option>)}
                      </select>
                    </div>
                    <div className="max-h-[260px] overflow-auto py-1">
                    {(() => {
                      const q = patientQuery.trim().toLowerCase();
                      const list = db.patients
                        .map((op: any, i: number) => ({ op, i }))
                        .filter(({ op }: any) => patientWard === 'All' || wardOf(op.room) === patientWard)
                        .filter(({ op }: any) => patientFloor === 'All' || String(op.floor || '—') === patientFloor)
                        .filter(({ op }: any) => !q || [op.name, `room ${op.room}`, `bed ${op.bed}`, op.diet].some((f: any) => String(f || '').toLowerCase().includes(q)));
                      if (list.length === 0) return <div className="px-3.5 py-6 text-center text-[13px] text-[#9099ab]">No patients match “{patientQuery}”.</div>;
                      return list.map(({ op, i }: any) => {
                      const on = k.patientIdx === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setKiosk((kk) => ({ ...kk, patientIdx: i, sel: {} })); setPatientOpen(false); }}
                          className={cx('w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors', on ? 'bg-[#eaf7fc]' : 'hover:bg-[#f7f8fb]')}
                        >
                          <span className="w-9 h-9 rounded-full bg-[#4EBEE3]/15 text-[#1d7da3] flex items-center justify-center font-semibold text-[13px] shrink-0">
                            {initials(op.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-[#19233a] truncate">{op.name}</span>
                            <span className="block text-[12px] text-[#9099ab] truncate">
                              {`Room ${op.room} · Bed ${op.bed} · ${op.diet}`}
                              {op.allergies.length ? <span className="text-[#c0392b]">{` · allergy: ${op.allergies.join(', ')}`}</span> : null}
                            </span>
                          </span>
                          {on && <Check size={16} className="text-[#4EBEE3] shrink-0" strokeWidth={3} />}
                        </button>
                      );
                      });
                    })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}
        </div>

          {/* Who is this meal for? */}
          <div className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-3.5">
            <div className="font-semibold text-[#16274D] mb-2"><Bi en="Who is this meal for?" ar="لمن هذه الوجبة؟" /></div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { e: 'Patient', icon: User, en: 'Patient', ar: 'المريض' },
                { e: 'Guest', icon: Users, en: 'Guest', ar: 'المرافق' },
              ] as const).map(({ e, icon: Icon, en, ar }) => {
                const on = k.eater === e;
                return (
                  <button
                    key={e}
                    onClick={() => setKiosk((kk) => ({ ...kk, eater: e, sel: {} }))}
                    className={cx(
                      'relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                      on ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 ring-1 ring-[#4EBEE3]/30' : 'border-[#e7e9f0] bg-white hover:border-[#4EBEE3]/60',
                    )}
                  >
                    <span className={cx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', on ? 'bg-[#4EBEE3] text-white' : 'bg-[#f0f4f8] text-[#5d6678]')}>
                      <Icon size={17} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-[#16274D] text-[13.5px] leading-tight">{en}</span>
                      <span className="block text-[11.5px] text-[#9099ab]" dir="rtl">{ar}</span>
                    </span>
                    {on && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4EBEE3] text-white flex items-center justify-center"><Check size={11} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-[#5d6678] mt-2 leading-snug flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#1f9e75] shrink-0" />
              {k.patientIdx < 0
                ? 'Select a patient to see diet & allergy info.'
                : k.eater === 'Guest'
                ? `${db.patients[k.patientIdx].name.split(' ')[0]}’s companion · Regular diet · no restrictions`
                : `${db.patients[k.patientIdx].diet} diet · allergy-checked`}
            </p>
          </div>

          {/* Serving day */}
          <div className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-3.5">
            <div className="font-semibold text-[#16274D] mb-2"><Bi en="Serving day" ar="يوم التقديم" /></div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { code: todayCode(), en: 'Today', ar: 'اليوم' },
                { code: tomorrowCode(), en: 'Tomorrow', ar: 'غداً' },
              ]).map((d) => {
                const on = k.day === d.code;
                return (
                  <button
                    key={d.en}
                    onClick={() => setKiosk((kk) => ({ ...kk, day: d.code, sel: {} }))}
                    className={cx(
                      'relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                      on ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 ring-1 ring-[#4EBEE3]/30' : 'border-[#e7e9f0] bg-white hover:border-[#4EBEE3]/60',
                    )}
                  >
                    <span className={cx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', on ? 'bg-[#4EBEE3] text-white' : 'bg-[#f0f4f8] text-[#5d6678]')}>
                      <Calendar size={17} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-[#16274D] text-[13.5px] leading-tight">{d.en} · {d.code}</span>
                      <span className="block text-[11.5px] text-[#9099ab]" dir="rtl">{d.ar}</span>
                    </span>
                    {on && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4EBEE3] text-white flex items-center justify-center"><Check size={11} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Select a meal */}
        <div className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm p-3.5">
          <div className="font-semibold text-[#16274D] mb-2"><Bi en="Select a meal" ar="اختر الوجبة" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {liveMeals.map((m: string) => {
              const on = k.meal === m;
              const Icon = mealIcon(m);
              return (
                <button
                  key={m}
                  onClick={() => setKiosk((kk) => ({ ...kk, meal: m, sel: {} }))}
                  className={cx(
                    'flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all cursor-pointer',
                    on ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 ring-1 ring-[#4EBEE3]/30' : 'border-[#e7e9f0] bg-white hover:border-[#4EBEE3]/60',
                  )}
                >
                  <span className={cx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', on ? 'bg-[#4EBEE3] text-white' : mealTint(m))}>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[#16274D] text-[15px] truncate">{m}</span>
                    {mealAr(m) && <span className="block text-[13.5px] font-medium text-[#5d6678] truncate" dir="rtl">{mealAr(m)}</span>}
                  </span>
                  {on
                    ? <span className="w-5 h-5 rounded-full bg-[#4EBEE3] text-white flex items-center justify-center shrink-0"><Check size={13} strokeWidth={3} /></span>
                    : <ChevronRight size={18} className="text-[#c3c9d6] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Bar>
        <div className="flex-1" />
        {k.patientIdx < 0 ? (
          <Btn variant="accent" lg disabled>
            <BiMini en="Select a patient first" ar="اختر مريضًا أولًا" />
          </Btn>
        ) : !liveMeals.includes(k.meal) ? (
          <Btn variant="accent" lg disabled>
            <BiMini en="Select a meal" ar="اختر الوجبة" />
          </Btn>
        ) : (
          <Btn variant="accent" lg onClick={() => setKiosk((kk) => ({ ...kk, stage: 'order' }))}>
            <BiMini en="Start order" ar="ابدأ الطلب" /> <ArrowRight size={16} />
          </Btn>
        )}
      </Bar>
    </Card>
  );

  // =========================================================
  // STAGE: order
  // =========================================================
  const kioskOrder = () => {
    const p = db.patients[k.patientIdx];
    const diet = curDiet(k);
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    // Which of the patient's allergens a dish contains (empty when ordering for a companion).
    const conflicts = (x: any): string[] => (k.eater === 'Patient' ? (x.allergens || []).filter((a: string) => p.allergies.includes(a)) : []);
    // A dish is blocked when ordering for the patient and it contains one of their allergens.
    const isBlocked = (x: any) => conflicts(x).length > 0;
    // Safe (selectable) dishes remaining in a section after the allergy filter.
    const safeCountFor = (sec: any) =>
      (sec.items || [])
        .map((en: string) => db.dishes.find((z: any) => z.en === en && z.on))
        .filter(Boolean)
        .filter((x: any) => !isBlocked(x)).length;
    // A required section is satisfied when it has enough picks OR has no allergy-safe
    // option at all (so the patient can't be blocked from continuing).
    const ready = cfg.every((s: any) =>
      s.forAll || !s.min ? true : (k.sel[s.sec] || []).length >= s.min || safeCountFor(s) === 0,
    );
    const count = Object.values(k.sel).reduce((a: number, arr: any) => a + arr.length, 0);

    const mealBanner = (db.mealMeta && db.mealMeta[k.meal] && db.mealMeta[k.meal].landscape) || '';
    return (
      <Card>
        {mealBanner && (
          <div className="relative aspect-[16/5] w-full overflow-hidden">
            <img src={mealBanner} alt={k.meal} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16274D]/70 to-transparent" />
            <div className="absolute bottom-2.5 left-5 text-white font-semibold text-[18px] drop-shadow">{k.meal}</div>
          </div>
        )}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#16274D] text-white">
          <span className="shrink-0 w-11 h-11 rounded-full bg-[#4EBEE3]/25 flex items-center justify-center font-semibold">
            {initials(p.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold flex items-center gap-2 flex-wrap">
              {p.name}
              {k.eater === 'Guest' && (
                <span className="bg-[#4EBEE3] text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full">Guest · مرافق</span>
              )}
            </div>
            <div className="text-[12.5px] text-[#bcd0ee]">
              {k.eater === 'Guest' ? 'Guest · ' : ''}{`Room ${p.room} · Bed ${p.bed} · ${k.meal} · ${dayLabel(k.day)}`}
            </div>
          </div>
          <span className="bg-[#4EBEE3]/25 text-white text-[12px] px-2.5 py-[3px] rounded-[7px]">
            {diet}{dietAr(diet) ? <span dir="rtl"> · {dietAr(diet)}</span> : null}
          </span>
        </div>

        <div className="px-5 py-2">
          {cfg.map((sec: any, si: number) => {
            const selArr = k.sel[sec.sec] || [];
            const items = sec.items
              .map((en: string) => db.dishes.find((z: any) => z.en === en && z.on))
              .filter(Boolean);
            return (
              <div key={si}>
                <div className="flex items-baseline justify-between mt-5 mb-2">
                  <span className="font-semibold text-[#19233a]"><Bi en={sec.sec} ar={secAr(sec.sec)} /></span>
                  <span className="text-[12.5px] text-[#5d6678]">
                    {ruleText(sec)}
                    {!sec.forAll && sec.max ? (
                      <>
                        {' · '}
                        <span className="font-bold text-[#1d7da3]">{`${selArr.length} of ${sec.max}`}</span>
                      </>
                    ) : null}
                  </span>
                </div>

                {sec.forAll ? (
                  <Note tone="ok" icon={<Check size={18} />}>
                    {`${items.map((x: any) => x.en).join(', ') || '—'} — served with every tray.`}
                  </Note>
                ) : items.length === 0 ? (
                  <div className="text-[13px] text-[#5d6678] py-1">No items available.</div>
                ) : items.every((x: any) => conflicts(x).length > 0) && k.eater === 'Patient' ? (
                  <Note tone="warn" icon={<ShieldCheck size={18} />}>
                    {`No allergy-safe option here for ${p.name} — this section is left empty and flagged for the kitchen.`}
                    <span dir="rtl"> · لا يوجد خيار آمن — سيُترك فارغًا ويُبلَّغ المطبخ.</span>
                  </Note>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((x: any, xi: number) => {
                      const conf = conflicts(x);
                      if (conf.length > 0) {
                        return (
                          <Tile key={xi} disabled>
                            <span className="block font-medium text-[#19233a]">{x.en}</span>
                            <span className="block text-[12px] text-[#c0392b]">
                              {`Contains ${conf.join(', ')}`}
                            </span>
                          </Tile>
                        );
                      }
                      return (
                        <Tile
                          key={xi}
                          on={selArr.includes(x.en)}
                          onClick={() => kPick(sec.sec, x.en)}
                        >
                          <span className="block font-medium text-[#19233a] text-[14.5px]">{x.en}</span>
                          <span className="block text-[14px] font-medium text-[#5d6678]" dir="rtl">
                            {x.ar || '—'}
                          </span>
                        </Tile>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        </div>

        <Bar>
          <Btn variant="neutral" onClick={() => setKiosk((kk) => ({ ...kk, stage: 'context' }))}>
            <BiMini en="Back" ar="رجوع" />
          </Btn>
          <div className="flex-1" />
          {ready ? (
            <Btn variant="accent" lg onClick={() => setKiosk((kk) => ({ ...kk, stage: 'review' }))}>
              <BiMini en={`Review order (${count})`} ar="مراجعة الطلب" /> <ArrowRight size={16} />
            </Btn>
          ) : (
            <Btn variant="accent" lg disabled>
              <BiMini en="Pick required items" ar="اختر العناصر المطلوبة" />
            </Btn>
          )}
        </Bar>
      </Card>
    );
  };

  // =========================================================
  // STAGE: review
  // =========================================================
  const kioskReview = () => {
    const p = db.patients[k.patientIdx];
    const diet = curDiet(k);
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    const lines: { name: string; section: string }[] = [];
    cfg.forEach((sec: any) => {
      if (sec.forAll) return;
      (k.sel[sec.sec] || []).forEach((item) => lines.push({ name: item, section: sec.sec }));
    });
    cfg.forEach((sec: any) => {
      if (!sec.forAll) return;
      sec.items.forEach((en: string) => {
        const dish: any = db.dishes.find((z: any) => z.en === en && z.on);
        if (dish) lines.push({ name: dish.en, section: sec.sec });
      });
    });

    return (
      <Card>
        <CardHead
          title={<span className="inline-flex items-center gap-2 flex-wrap"><Bi en="Review order" ar="مراجعة الطلب" />{k.eater === 'Guest' && <span className="bg-[#4EBEE3] text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full">Guest · مرافق</span>}</span>}
          sub={`${k.eater === 'Guest' ? 'Guest · ' : ''}${p.name} · Room ${p.room}-${p.bed} · ${k.meal} · ${dayLabel(k.day)}`}
          right={<Badge tone="info">{diet}{dietAr(diet) ? ` · ${dietAr(diet)}` : ''}</Badge>}
        />
        <div>
          {lines.map((ln, i) => {
            const dish: any = db.dishes.find((z: any) => z.en === ln.name);
            return (
              <div
                key={i}
                className={cx(
                  'flex justify-between items-center px-5 py-2 text-[13.5px]',
                  i < lines.length - 1 && 'border-b border-dashed border-[#e7e9f0]',
                )}
              >
                <span className="min-w-0 leading-snug">
                  <span className="block text-[#19233a] text-[14px]">{ln.name}</span>
                  {dish?.ar ? <span className="block text-[13.5px] font-medium text-[#5d6678]" dir="rtl">{dish.ar}</span> : null}
                </span>
                <span className="text-right leading-snug whitespace-nowrap">
                  <span className="block text-[13px] text-[#5d6678]">{ln.section}</span>
                  {secAr(ln.section) ? <span className="block text-[12.5px] font-medium text-[#9099ab]" dir="rtl">{secAr(ln.section)}</span> : null}
                </span>
              </div>
            );
          })}
        </div>
        <div className="px-5 pt-3">
          <Note tone="ok" icon={<ShieldCheck size={18} />}>
            {`No allergy conflicts — checked against ${p.name}'s record.`} · لا تعارض مع الحساسية.
          </Note>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={() => setKiosk((kk) => ({ ...kk, stage: 'order' }))}>
            <BiMini en="Back" ar="رجوع" />
          </Btn>
          <div className="flex-1" />
          <Btn variant="primary" lg onClick={() => setTrayConfirm(true)}>
            <Check size={16} /> <BiMini en="Confirm order" ar="تأكيد الطلب" />
          </Btn>
        </Bar>
      </Card>
    );
  };

  // =========================================================
  // STAGE: done
  // =========================================================
  const kioskDone = () => {
    const p = db.patients[k.patientIdx];
    return (
      <Card>
        <div className="p-[46px] text-center">
          <div className="w-16 h-16 rounded-full bg-[#e7f6f0] text-[#1f9e75] flex items-center justify-center mx-auto">
            <CheckCircle2 size={34} />
          </div>
          <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D] mt-4">
            Order confirmed · تم تأكيد الطلب
          </div>
          <div className="text-[13.5px] text-[#5d6678] mt-1">
            {`${k.eater === 'Guest' ? 'Guest of ' : ''}${p.name} · ${k.meal} ${dayLabel(k.day).toLowerCase()} · sent to the kitchen`}
          </div>
          <div className="flex justify-center gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setKiosk(freshContext())}>
              <Plus size={16} /> <BiMini en="New order" ar="طلب جديد" />
            </Btn>
            <Btn variant="accent" onClick={() => {
              if (lastOrderId) { try { sessionStorage.setItem('careinn-kitchen-focus', lastOrderId); } catch { /* ignore */ } }
              onNavigate('food-kitchen');
            }}>
              <ChefHat size={16} /> See it in the kitchen
            </Btn>
          </div>
        </div>
      </Card>
    );
  };

  // =========================================================
  // Tray confirmation — same card as the printed kitchen ticket
  // =========================================================
  const trayConfirmModal = () => {
    const p = db.patients[k.patientIdx];
    const diet = curDiet(k);
    const isCompanion = k.eater === 'Guest';
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    const mealItems: string[] = [];
    const accompaniments: string[] = [];
    const pushLine = (section: string, dish: string) =>
      (isAccompaniment(section, dish) ? accompaniments : mealItems).push(dish);
    cfg.forEach((sec: any) => {
      if (sec.forAll) return;
      (k.sel[sec.sec] || []).forEach((item) => pushLine(sec.sec, item));
    });
    cfg.forEach((sec: any) => {
      if (!sec.forAll) return;
      sec.items.forEach((en: string) => {
        const dish: any = db.dishes.find((z: any) => z.en === en && z.on);
        if (dish) pushLine(sec.sec, dish.en);
      });
    });
    const allergies = isCompanion ? 'None' : (p.allergies.length ? p.allergies.join(', ') : 'None');
    const location = `Room ${p.room}${p.bed ? ` · Bed ${p.bed}` : ''}`;
    const headerBg = isCompanion ? 'bg-[#eaf7fc]' : 'bg-[#f4f7fb]';
    const avatarBg = isCompanion ? 'bg-[#4EBEE3]' : 'bg-[#16274D]';

    return (
      <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={() => setTrayConfirm(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] max-h-[92vh] flex flex-col font-['Poppins',sans-serif]" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 pt-5 pb-3 text-center">
            <div className="font-semibold text-[18px] text-[#16274D]">Confirm this tray · تأكيد الصينية</div>
            <p className="text-[13px] text-[#5d6678] mt-1">This is the ticket the kitchen will receive. · هذه هي البطاقة التي سيستلمها المطبخ.</p>
          </div>
          <div className="px-5 pb-2 overflow-auto">
            <div className="border border-[#e7e9f0] rounded-[14px] bg-white overflow-hidden">
              {/* Ticket Header */}
              <div className={cx('flex items-center justify-between p-4 border-b border-[#e7e9f0]', headerBg)}>
                <div className="flex items-center">
                  <div className={cx('w-11 h-11 rounded-full flex items-center justify-center text-white', avatarBg)}>
                    <User size={20} />
                  </div>
                  <div className="ml-3.5 text-left">
                    <div className="font-bold text-[#16274D] text-[15px]">
                      {isCompanion ? 'For Companion' : `For ${p.name}`} <span className="text-[#9099ab] font-medium">· {location}</span>
                    </div>
                    <div className="text-[12px] text-[#5d6678] font-medium mt-1">
                      Diet: {diet} · Allergies: {allergies}
                    </div>
                  </div>
                </div>
              </div>
              {/* Delivery Row */}
              <div className="p-4 flex justify-between items-start border-b border-[#e7e9f0]">
                <div className="flex items-center gap-2 text-[11.5px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                  <Clock size={15} className="text-[#9099ab]" /><span>Delivery Time</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#16274D] text-[14px]">{k.meal} ({mealWindow(k.meal)})</div>
                  <div className="text-[12.5px] text-[#5d6678] mt-0.5">{fmtDate(k.day) === k.day ? dayLabel(k.day) : fmtDate(k.day)}</div>
                </div>
              </div>
              {/* Meal Items Row */}
              <div className="p-4 flex justify-between items-start border-b border-[#e7e9f0]">
                <div className="flex items-center gap-2 text-[11.5px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                  <Utensils size={15} className="text-[#9099ab]" /><span>Your Meal Items</span>
                </div>
                <div className="text-right font-medium text-[#16274D] text-[14px] space-y-1 max-w-[300px]">
                  {mealItems.map((dish, di) => <div key={di}>{dish}</div>)}
                  {mealItems.length === 0 && <div className="text-gray-400 italic">None selected</div>}
                </div>
              </div>
              {/* Extras Row */}
              <div className="p-4 flex justify-between items-start">
                <div className="flex items-center gap-2 text-[11.5px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                  <CheckCircle2 size={15} className="text-[#9099ab]" /><span>Comes With Meal</span>
                </div>
                <div className="text-right font-medium text-[#16274D] text-[14px] space-y-1 max-w-[300px]">
                  {accompaniments.map((dish, di) => <div key={di}>{dish}</div>)}
                  {accompaniments.length === 0 && <div className="text-gray-400 italic">None</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-[#eef0f4] p-4 flex items-center justify-between">
            <Btn variant="neutral" onClick={() => setTrayConfirm(false)}>
              <BiMini en="Back" ar="رجوع" />
            </Btn>
            <Btn variant="primary" lg onClick={kConfirm}>
              <Check size={16} /> <BiMini en="Confirm & send to kitchen" ar="تأكيد وإرسال للمطبخ" />
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FoodPage current="kiosk" onNavigate={onNavigate} narrow>
      {returnTo && (
        <button
          onClick={() => onNavigate(returnTo.route)}
          className="mb-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] border border-[#d6dae6] bg-white hover:bg-[#f7f8fb] text-[#16274D] text-[13px] font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          {returnTo.label}
        </button>
      )}
      {k.stage === 'context' && kioskContext()}
      {k.stage === 'order' && kioskOrder()}
      {k.stage === 'review' && kioskReview()}
      {k.stage === 'done' && kioskDone()}
      {trayConfirm && trayConfirmModal()}
    </FoodPage>
  );
}
