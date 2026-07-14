import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Wand2,
  Plus,
  ChefHat,
  Info,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, resolve, ruleText, DAYS, updateFood, nextOrderId, getLiveSet } from './foodStore';
import { cx, Btn, Badge, Chip, Card, CardHead, Bar, Note, FoodPage } from './foodAtoms';

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
  eater: 'Patient' | 'Companion';
  meal: string;
  day: string;
  sel: Record<string, string[]>;
}

const freshContext = (): KioskState => ({
  stage: 'context',
  patientIdx: 0,
  eater: 'Patient',
  meal: 'Lunch',
  day: 'Wed',
  sel: {},
});

export default function PatientKioskPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db: any = useFood();
  // Patients order from whichever menu set is currently Published — not a
  // fixed/global menu — so publishing a new set immediately changes what's
  // offered here.
  const activeMenu = getLiveSet(db).menu;
  const [kiosk, setKiosk] = useState<KioskState>(freshContext);
  const k = kiosk;

  const curDiet = (kk: KioskState): string =>
    kk.eater === 'Companion' ? 'Regular' : db.patients[kk.patientIdx].diet;

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

  // ---- kAutoFill ----
  function kAutoFill() {
    const p = db.patients[k.patientIdx];
    const diet = curDiet(k);
    const cfg = resolve(activeMenu, diet, k.meal, k.day);
    setKiosk((kk) => {
      const sel = { ...kk.sel };
      cfg.forEach((sec: any) => {
        if (sec.forAll || !(sec.min > 0)) return;
        if ((sel[sec.sec] || []).length > 0) return;
        const def = sec.def;
        if (!def) return;
        const dish: any = db.dishes.find((z: any) => z.en === def && z.on);
        const blocked =
          dish && kk.eater === 'Patient'
            ? dish.allergens.some((a: string) => p.allergies.includes(a))
            : false;
        if (blocked) return;
        sel[sec.sec] = [def];
      });
      return { ...kk, sel };
    });
    toast('Filled empty sections with defaults');
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
    updateFood((d: any) => {
      d.orders.unshift({
        id: nextOrderId(),
        name: k.eater === 'Companion' ? 'Companion' : p.name,
        room: p.room,
        bed: p.bed,
        diet,
        meal: k.meal,
        date: k.day,
        time,
        status: 'Submitted',
        lines: lines.map((l) => [l.section, l.name]),
      });
    });
    setKiosk((kk) => ({ ...kk, stage: 'done' }));
  }

  // =========================================================
  // STAGE: context
  // =========================================================
  const kioskContext = () => (
    <Card>
      <CardHead
        title="Who is ordering?"
        sub={`Serving ${k.day} · ordering closes ${db.win.close}`}
      />
      <div className="p-5">
        <div className="font-semibold text-[#16274D] mb-2">Patient</div>
        <div className="grid gap-2">
          {db.patients.map((p: any, i: number) => (
            <Tile
              key={i}
              on={k.patientIdx === i}
              onClick={() => setKiosk((kk) => ({ ...kk, patientIdx: i, sel: {} }))}
            >
              <span className="block font-medium text-[#19233a]">{p.name}</span>
              <span className="block text-[12.5px] text-[#9099ab]">
                {`Room ${p.room} · Bed ${p.bed} · ${p.diet}${
                  p.allergies.length ? ' · allergy: ' + p.allergies.join(', ') : ''
                }`}
              </span>
            </Tile>
          ))}
        </div>

        <div className="font-semibold text-[#16274D] mt-5 mb-2">Ordering for</div>
        <div className="flex flex-wrap gap-2">
          {(['Patient', 'Companion'] as const).map((e) => (
            <Chip
              key={e}
              on={k.eater === e}
              onClick={() => setKiosk((kk) => ({ ...kk, eater: e, sel: {} }))}
            >
              {e}
            </Chip>
          ))}
        </div>
        {k.eater === 'Companion' && (
          <div className="mt-2">
            <Note tone="info" icon={<Info size={18} />}>
              Companion meals always use the Regular diet.
            </Note>
          </div>
        )}

        <div className="font-semibold text-[#16274D] mt-5 mb-2">Serving day</div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d: string) => (
            <Chip
              key={d}
              on={k.day === d}
              onClick={() => setKiosk((kk) => ({ ...kk, day: d, sel: {} }))}
            >
              {d}
            </Chip>
          ))}
        </div>

        <div className="font-semibold text-[#16274D] mt-5 mb-2">Meal</div>
        <div className="flex flex-wrap gap-2">
          {db.meals.map((m: string) => (
            <Chip
              key={m}
              on={k.meal === m}
              onClick={() => setKiosk((kk) => ({ ...kk, meal: m, sel: {} }))}
            >
              {m}
            </Chip>
          ))}
        </div>
      </div>
      <Bar>
        <div className="flex-1" />
        <Btn variant="accent" lg onClick={() => setKiosk((kk) => ({ ...kk, stage: 'order' }))}>
          Start order <ArrowRight size={16} />
        </Btn>
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
    const ready = cfg.every((s: any) =>
      s.forAll || !s.min ? true : (k.sel[s.sec] || []).length >= s.min,
    );
    const count = Object.values(k.sel).reduce((a: number, arr: any) => a + arr.length, 0);

    return (
      <Card>
        <div className="flex items-center gap-3 px-5 py-4 bg-[#16274D] text-white">
          <span className="shrink-0 w-11 h-11 rounded-full bg-[#4EBEE3]/25 flex items-center justify-center font-semibold">
            {initials(p.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{p.name}</div>
            <div className="text-[12.5px] text-[#bcd0ee]">
              {`Room ${p.room} · Bed ${p.bed} · ${k.meal} · ${k.day}`}
            </div>
          </div>
          <span className="bg-[#4EBEE3]/25 text-white text-[12px] px-2.5 py-[3px] rounded-[7px]">
            {diet}
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
                  <span className="font-semibold text-[#19233a]">{sec.sec}</span>
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
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((x: any, xi: number) => {
                      const conflicts = x.allergens.filter((a: string) => p.allergies.includes(a));
                      const blocked = conflicts.length > 0 && k.eater === 'Patient';
                      if (blocked) {
                        return (
                          <Tile key={xi} disabled>
                            <span className="block font-medium text-[#19233a]">{x.en}</span>
                            <span className="block text-[12px] text-[#c0392b]">
                              {`Contains ${conflicts.join(', ')}`}
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
                          <span className="block font-medium text-[#19233a]">{x.en}</span>
                          <span className="block text-[12px] text-[#9099ab]" dir="rtl">
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

          <div className="mt-4">
            <Btn variant="neutral" onClick={kAutoFill} className="w-full">
              <Wand2 size={16} /> Auto-fill empty sections with defaults
            </Btn>
          </div>
        </div>

        <Bar>
          <Btn variant="neutral" onClick={() => setKiosk((kk) => ({ ...kk, stage: 'context' }))}>
            Back
          </Btn>
          <div className="flex-1" />
          {ready ? (
            <Btn variant="accent" lg onClick={() => setKiosk((kk) => ({ ...kk, stage: 'review' }))}>
              {`Review order (${count})`} <ArrowRight size={16} />
            </Btn>
          ) : (
            <Btn variant="accent" lg disabled>
              Pick required items
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
          title="Review order"
          sub={`${p.name} · Room ${p.room}-${p.bed} · ${k.meal} · ${k.day}`}
          right={<Badge tone="info">{diet}</Badge>}
        />
        <div>
          {lines.map((ln, i) => (
            <div
              key={i}
              className={cx(
                'flex justify-between px-5 py-1.5 text-[13.5px]',
                i < lines.length - 1 && 'border-b border-dashed border-[#e7e9f0]',
              )}
            >
              <span className="text-[#19233a]">{ln.name}</span>
              <span className="text-[#5d6678]">{ln.section}</span>
            </div>
          ))}
        </div>
        <div className="px-5 pt-3">
          <Note tone="ok" icon={<ShieldCheck size={18} />}>
            {`No allergy conflicts — checked against ${p.name}'s record.`}
          </Note>
        </div>
        <Bar>
          <Btn variant="neutral" onClick={() => setKiosk((kk) => ({ ...kk, stage: 'order' }))}>
            Back
          </Btn>
          <div className="flex-1" />
          <Btn variant="primary" lg onClick={kConfirm}>
            <Check size={16} /> Confirm order
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
            Order confirmed
          </div>
          <div className="text-[13.5px] text-[#5d6678] mt-1">
            {`${p.name} · ${k.meal} tomorrow · sent to the kitchen`}
          </div>
          <div className="flex justify-center gap-2 mt-5">
            <Btn variant="neutral" onClick={() => setKiosk(freshContext())}>
              <Plus size={16} /> New order
            </Btn>
            <Btn variant="accent" onClick={() => onNavigate('food-kitchen')}>
              <ChefHat size={16} /> See it in the kitchen
            </Btn>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <FoodPage current="kiosk" onNavigate={onNavigate} narrow>
      {k.stage === 'context' && kioskContext()}
      {k.stage === 'order' && kioskOrder()}
      {k.stage === 'review' && kioskReview()}
      {k.stage === 'done' && kioskDone()}
    </FoodPage>
  );
}
