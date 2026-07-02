import { useState } from 'react';
import {
  ArrowLeft, Plus, Copy, Eye, Settings, ClipboardList, ListChecks, ListTree,
  RefreshCw, Clock, CheckCircle2, ChevronRight, ChevronLeft, X, CheckCheck,
  Lightbulb, Rocket, Calendar, ChevronDown, Building2, Search, Check,
  AlertTriangle, Salad,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useFood, updateFood, resolve, ruleText, DAYS,
} from './foodStore';
import {
  cx, Btn, Toggle, Chip, StatusBadge, Tag, Note, Metric, Stepper,
  MiniSeg, Card, CardHead, Bar, rowCls, ContextBar, FoodPage,
} from './foodAtoms';

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

  const onCtx = (key: string, val: string) => {
    setCtx((c) => ({ ...c, [key]: val }));
    setItemSec(0);
  };

  // ---- navigation helpers ----
  const openWizard = (s: number) => { setStep(s); setSub('wizard'); };

  // ============================================================
  // SETS LIST
  // ============================================================
  function viewSets() {
    return (
      <Card>
        <CardHead
          title="Menu sets"
          sub={`${db.sets.length} sets in this hospital`}
          right={
            <Btn variant="primary" onClick={() => { setSetId('standard'); setStep(1); setSub('wizard'); }}>
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
    updateFood((d: any) => {
      d.sets.unshift({
        id: 'dup' + Date.now(),
        name: 'Standard week (copy)',
        status: 'Draft',
        sub: 'Duplicated · edit and publish',
        edited: 'just now',
      });
    });
    setSub('list');
    toast('Menu set duplicated');
  }

  function viewSetOverview() {
    const set = db.sets.find((x: any) => x.id === setId) || db.sets[0];

    const rows = [
      { icon: Settings, name: 'Basics', sub: 'Standard week · active since 1 Jun', step: 1 },
      { icon: ClipboardList, name: 'Diets and meals', sub: `${db.diets.length} conditions · breakfast, lunch, dinner`, step: 2 },
      { icon: ListChecks, name: 'Sections and rules', sub: 'Per diet and meal · choose-one, choose-two, required', step: 3 },
      { icon: ListTree, name: 'Items and defaults', sub: 'Dishes assigned per section · defaults set', step: 4 },
      { icon: RefreshCw, name: 'Apply across days and diets', sub: 'Copy one setup to every diet', step: 5 },
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
          sub={`Fakeeh Hospital · edited ${set.edited}`}
          right={
            <>
              <Btn variant="neutral" onClick={dupSet}><Copy size={16} /> Duplicate</Btn>
              <Btn variant="accent" onClick={() => onNavigate('food-kiosk')}><Eye size={16} /> Preview</Btn>
            </>
          }
        />
        <div className="grid grid-cols-4 gap-3 p-5">
          <Metric label="Diets" value={db.diets.length} />
          <Metric label="Meals" value={db.meals.length} />
          <Metric label="Sections" value={db.menu.Regular.Lunch.length} />
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
      const cfg = d.menu[ctx.diet][ctx.meal];
      fn(cfg, d);
    });
  };

  function menuMode(i: number, forAll: boolean) {
    menuMutate((cfg) => {
      const s = cfg[i];
      s.forAll = forAll;
      if (forAll) s.required = false;
    });
  }

  function menuStep(i: number, field: 'min' | 'max', delta: number) {
    menuMutate((cfg) => {
      const s = cfg[i];
      if (field === 'min') {
        const next = Math.max(0, Math.min((s.max || 1), s.min + delta));
        s.min = next;
        if (next >= 1) s.required = true;
        if (next === 0) s.required = false;
      } else {
        const next = Math.max(1, Math.min(5, s.max + delta));
        s.max = next;
        if (s.min > next) s.min = next;
      }
    });
  }

  function menuFlag(i: number, field: 'required' | 'confirm') {
    menuMutate((cfg) => {
      const s = cfg[i];
      if (field === 'required') {
        s.required = !s.required;
        s.min = s.required ? Math.max(1, s.min) : 0;
      } else {
        s.confirm = !s.confirm;
      }
    });
  }

  function menuRemove(i: number) {
    menuMutate((cfg) => { cfg.splice(i, 1); });
    // read back after commit via functional state
    const cfg = db.menu[ctx.diet][ctx.meal];
    if (itemSec >= cfg.length - 1) setItemSec(0);
  }

  function menuAdd(name: string) {
    menuMutate((cfg, d) => {
      const items = d.dishes.filter((x: any) => x.section === name && x.on).map((x: any) => x.en);
      const days: any = {};
      DAYS.forEach((dy: string) => { days[dy] = { items: [...items], def: items[0] || null }; });
      cfg.push({ sec: name, min: 0, max: 1, required: false, confirm: false, forAll: false, days });
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

  function itemSecNav(delta: number) {
    const cfg = db.menu[ctx.diet][ctx.meal];
    setItemSec((itemSec + delta + cfg.length) % cfg.length);
  }

  function applyAcrossDays() {
    let n = 0;
    updateFood((d: any) => {
      const cfg = d.menu[ctx.diet][ctx.meal];
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
      d.diets.forEach((dt: any) => {
        if (dt.en === ctx.diet || !applyTargets?.[dt.en]) return;
        n++;
        d.menu[dt.en][ctx.meal] = structuredClone(d.menu[ctx.diet][ctx.meal]);
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
  function computeBad() {
    const bad: string[] = [];
    db.meals.forEach((meal: string) => {
      DAYS.forEach((day: string) => {
        resolve(db, 'Regular', meal, day).forEach((s: any) => {
          if (!s.forAll && s.min > 0) {
            const cnt = s.items.filter((en: string) => {
              const dd = db.dishes.find((z: any) => z.en === en);
              return dd && dd.on;
            }).length;
            if (cnt < s.min) bad.push(day + ' ' + meal + ' · ' + s.sec);
          }
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

  function fauxInput(label: string, value: string, icon?: any, muted?: boolean) {
    const Icon = icon;
    return (
      <div>
        <div className="text-[12px] text-[#5d6678] mb-1.5">{label}</div>
        <div className="h-[38px] px-3 border border-[#d6dae6] rounded-[10px] flex items-center justify-between">
          <span className={muted ? 'text-[#9099ab] text-[14px]' : 'text-[#19233a] text-[14px]'}>{value}</span>
          {Icon ? <Icon size={16} className="text-[#9099ab]" /> : null}
        </div>
      </div>
    );
  }

  function step1() {
    return (
      <div className="p-5 flex flex-col gap-3.5">
        {fauxInput('Menu set name', 'Standard week')}
        {fauxInput('Hospital', 'Fakeeh Hospital', ChevronDown)}
        <div className="grid grid-cols-2 gap-3.5">
          {fauxInput('Active from', '1 Jun 2026', Calendar)}
          {fauxInput('Active to', 'No end date', Calendar, true)}
        </div>
      </div>
    );
  }

  function step2() {
    return (
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-2.5">
          <div className="font-medium text-[#16274D]">Diet conditions</div>
          <div className="text-[13px] text-[#5d6678]">{db.diets.length} selected</div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {db.diets.map((dt: any) => (
            <Chip key={dt.en} on square checkbox>{dt.en}</Chip>
          ))}
        </div>
        <div className="font-medium text-[#16274D] mt-5 mb-2.5">Meal types</div>
        <div className="grid grid-cols-3 gap-2.5">
          {db.meals.map((m: string) => (
            <Chip key={m} on square checkbox>{m}</Chip>
          ))}
        </div>
      </div>
    );
  }

  function step3() {
    const cfg = db.menu[ctx.diet][ctx.meal];
    const used = new Set(cfg.map((s: any) => s.sec));
    const meal = ctx.meal;
    // unused active sections: derive from dishes' sections not already used
    const allSections: string[] = Array.from(new Set(db.dishes.map((x: any) => x.section)));
    const unused = allSections.filter((s) => !used.has(s));

    return (
      <div>
        <ContextBar ctx={ctx} onCtx={onCtx} db={db} />
        {cfg.map((s: any, i: number) => (
          <div key={i} className="px-5 py-3.5 border-t border-[#e7e9f0]">
            <div className="flex items-center justify-between">
              <div className="font-medium text-[#19233a]">{s.sec}</div>
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-[#5d6678]">Required</span>
                    <Toggle on={s.required} onClick={() => menuFlag(i, 'required')} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-[#5d6678]">Confirm skip</span>
                    <Toggle on={s.confirm} onClick={() => menuFlag(i, 'confirm')} />
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
    const cfg = db.menu[ctx.diet][ctx.meal];
    const sec = cfg[Math.min(itemSec, cfg.length - 1)];
    const secIdx = Math.min(itemSec, cfg.length - 1);
    const dc = sec.days[ctx.day];
    const inSec = db.dishes.filter((x: any) => x.section === sec.sec);

    return (
      <div>
        <ContextBar withDay ctx={ctx} onCtx={onCtx} db={db} />
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
        <ContextBar withDay ctx={ctx} onCtx={onCtx} db={db} />
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
      </div>
    );
  }

  function step6() {
    const rows: any[] = [
      { name: 'Order for', desc: 'Which service day this covers', right: <Tag>{db.win.serviceDay}</Tag> },
      { name: 'Opens', desc: 'When the ordering window opens', right: <Tag><Clock size={14} /> {db.win.open}</Tag> },
      { name: 'Closes (cutoff)', desc: 'Last moment to place or edit', right: <Tag><Clock size={14} /> {db.win.close}</Tag> },
      { name: 'Same window for all meals', desc: 'Use one window across breakfast, lunch, dinner', key: 'sameAll' },
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
          <Metric label="Sections (lunch)" value={db.menu.Regular.Lunch.length} />
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

  function viewWizard() {
    const nextLabels: Record<number, string> = {
      1: 'Next: diets and meals',
      2: 'Next',
      3: 'Next',
      4: 'Next',
      5: 'Next',
      6: 'Next',
    };

    return (
      <Card>
        <CardHead eyebrow={'Step ' + step + ' of 7'} title={STEP_TITLES[step]} />
        {wizardBody()}
        <Bar>
          {step === 1 ? (
            <Btn variant="neutral" onClick={() => setSub('overview')}>Close</Btn>
          ) : (
            <Btn variant="neutral" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</Btn>
          )}
          <div className="flex-1" />
          {step === 5 ? (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#5d6678]">
                {applyMode === 'days'
                  ? `Will update ${DAYS.filter((dy: string) => dy !== ctx.day && (applyDays || {})[dy]).length} days`
                  : `Will update ${db.diets.filter((dt: any) => dt.en !== ctx.diet && (applyTargets || {})[dt.en]).length} diets`}
              </span>
              <Btn variant="accent" onClick={applyMode === 'days' ? applyAcrossDays : applyAcross}>
                <CheckCheck size={16} /> Apply
              </Btn>
              <Btn variant="primary" onClick={() => setStep(6)}>Next <ChevronRight size={16} /></Btn>
            </div>
          ) : step === 7 ? null : (
            <Btn variant="primary" onClick={() => setStep(step + 1)}>{nextLabels[step] || 'Next'} <ChevronRight size={16} /></Btn>
          )}
        </Bar>
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
