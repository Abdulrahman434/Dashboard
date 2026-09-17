/**
 * MealTicketSheet — the printed meal-order sheet.
 *
 * One A4 landscape page per recipient: 297mm x 210mm divided into three fixed
 * 99mm columns, cut apart after printing. Column order is Dinner, Lunch,
 * Breakfast from the left and must NOT follow the Arabic text direction — the
 * paper is cut at fixed positions, so the sheet is pinned to LTR and only the
 * text inside each ticket flips.
 *
 * All geometry is in physical mm with border-box sizing, so the 5.5mm padding
 * sits inside the 99mm column rather than widening it.
 */

import type { Sheet, Ticket } from './mealTicket';
import { fmtServingDate, timeRangeEn, timeRangeAr, hospitalNames, toArabicDigits } from './mealTicket';
import { HeaderSparkles, PediatricBackdrop } from './MealTicketDecor';

export const SHEET_W_MM = 297;
export const SHEET_H_MM = 210;
export const COL_W_MM = 99;
export const PAD_MM = 5.5;

/**
 * Print stylesheet. Rendered once alongside the sheets.
 *
 * `margin: 0` on @page plus zero body margin is what makes 3x99mm land exactly
 * on the page edges; any browser default margin would scale the whole thing.
 */
export function MealTicketPrintStyles({ cutGuides }: { cutGuides: boolean }) {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @page { size: A4 landscape; margin: 0; }

      .mt-sheet {
        width: ${SHEET_W_MM}mm;
        height: ${SHEET_H_MM}mm;
        display: flex;
        box-sizing: border-box;
        background: #fff;
        /* Fixed column order regardless of the Arabic content inside. */
        direction: ltr;
        overflow: hidden;
      }
      /* Content always paints above the pediatric backdrop. */
      .mt-ticket > * { position: relative; z-index: 1; }
      .mt-ticket > .mt-backdrop { z-index: 0; }
      .mt-ticket {
        position: relative;
        flex: 0 0 ${COL_W_MM}mm;
        width: ${COL_W_MM}mm;
        height: ${SHEET_H_MM}mm;
        padding: ${PAD_MM}mm;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: 'Noto Sans Arabic', 'Poppins', system-ui, sans-serif;
        color: #16274D;
      }
      /* Cutting guides sit ON the 99mm and 198mm boundaries. Optional, so the
         same sheet can go through pre-perforated paper unmarked. */
      .mt-sheet.mt-guides .mt-ticket + .mt-ticket {
        border-left: 0.3mm dashed #b9c0cc;
      }

      @media print {
        html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        /* Every sheet is its own page; no trailing blank page after the last. */
        .mt-sheet { page-break-after: always; break-after: page; }
        .mt-sheet:last-child { page-break-after: avoid; break-after: avoid; }
        /* Header tints and the allergy strip must actually print. */
        .mt-sheet, .mt-sheet * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }

      /* On screen the sheet is shown at true size inside a scaled wrapper, so
         what you preview is geometrically what prints. */
      .mt-preview { display: flex; flex-direction: column; align-items: center; gap: 6mm; }
      .mt-preview .mt-sheet {
        box-shadow: 0 2px 14px rgba(22,39,77,0.14);
        border: 1px solid #e7e9f0;
      }
    `}} />
  );
}

/** One A4 landscape page: three tickets for one recipient. */
export function MealSheet({ sheet, cutGuides = true, hospital }: { sheet: Sheet; cutGuides?: boolean; hospital?: { en: string; ar: string } }) {
  const name = hospital ?? hospitalNames();
  return (
    <div className={`mt-sheet${cutGuides ? ' mt-guides' : ''}`}>
      {sheet.tickets.map((t) => (
        <MealTicket key={t.key} sheet={sheet} ticket={t} hospital={name} />
      ))}
    </div>
  );
}

/** A single 99mm meal ticket — everything needed to identify it after cutting. */
export function MealTicket({ sheet, ticket, hospital }: { sheet: Sheet; ticket: Ticket; hospital?: { en: string; ar: string } }) {
  const c = sheet.dietColor;
  const hosp = hospital ?? hospitalNames();
  const kid = sheet.pediatric;
  // A pediatric ticket drops the diet's colour block — the menu is the fun part,
  // not the diet — and gets a white header with the illustrated backdrop instead.
  // The diet colour still marks the group rules so the kitchen can read the diet.
  const bandBg = kid ? '#FFFFFF' : c;
  const bandFg = kid ? '#16274D' : '#FFFFFF';
  const bandBorder = kid ? `0.4mm solid ${c}33` : 'none';
  const hasAllergies = sheet.allergies.length > 0;

  // A label/value pair with the English on the left and Arabic on the right,
  // the pattern the whole ticket is built from.
  const Row = ({ labelEn, labelAr, en, ar, gap = '1.4mm' }: any) => (
    <div style={{ marginTop: gap }}>
      <div style={S.rowLine}>
        <span style={S.label}>{labelEn}</span>
        <span dir="rtl" style={S.label}>{labelAr}</span>
      </div>
      <div style={S.rowLine}>
        <span style={S.value}>{en}</span>
        <span dir="rtl" style={S.value}>{ar}</span>
      </div>
    </div>
  );

  return (
    <div className="mt-ticket" style={{ position: 'relative' }}>
      {kid && <PediatricBackdrop />}
      {/* Order number reads as the ticket stub — first thing on the ticket. */}
      <div style={S.stub}>
        <span style={S.orderNo}>{ticket.orderNo ? `ORDER #${ticket.orderNo}` : 'NO ORDER'}</span>
      </div>

      {/* Meal — the diet colour band */}
      <div style={{ ...S.band, background: bandBg, color: bandFg, border: bandBorder }}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={S.mealEn}>{ticket.meal.toUpperCase()}</span>
          {kid && <HeaderSparkles onLight />}
        </span>
        <span dir="rtl" style={S.mealAr}>{ticket.mealAr}</span>
      </div>

      {/* Diet */}
      <div style={{ ...S.dietBand, background: kid ? '#F7F8FB' : c + '14', color: kid ? '#5d6678' : c }}>
        <span style={S.dietEn}>{sheet.diet.toUpperCase()}</span>
        <span dir="rtl" style={S.dietAr}>{sheet.dietAr}</span>
      </div>

      {/* Serving time */}
      <Row
        labelEn="SERVING TIME" labelAr="وقت التقديم"
        en={timeRangeEn(ticket.servingStart, ticket.servingEnd)}
        ar={timeRangeAr(ticket.servingStart, ticket.servingEnd)}
        gap="1.6mm"
      />

      {/* Serving date */}
      <div style={{ ...S.rowLine, marginTop: '1.5mm' }}>
        <span style={S.label}>SERVING DATE</span>
        <span dir="rtl" style={S.label}>تاريخ التقديم</span>
      </div>
      <div style={{ ...S.rowLine, marginTop: '0.2mm' }}>
        <span style={{ ...S.value, fontWeight: 700 }}>{fmtServingDate(sheet.servingDate)}</span>
        <span dir="rtl" style={{ ...S.value, fontWeight: 700 }}>{toArabicDigits(fmtServingDate(sheet.servingDate))}</span>
      </div>

      {/* Recipient — role tags on their own line, each sitting above the name
          in its own language, so either side reads top-down on its own. */}
      <div style={{ ...S.rowLine, marginTop: '1.4mm', alignItems: 'center' }}>
        <span style={{ ...S.chip, background: c + '1A', color: c }}>{sheet.role.toUpperCase()}</span>
        <span dir="rtl" style={{ ...S.chip, background: c + '1A', color: c }}>{sheet.roleAr}</span>
      </div>
      <div style={{ ...S.rowLine, marginTop: '0.7mm' }}>
        <span style={S.name}>{sheet.name}</span>
        <span dir="rtl" style={S.name}>{sheet.nameAr}</span>
      </div>
      {sheet.mrn && (
        <div style={{ ...S.rowLine, marginTop: '0.6mm' }}>
          <span style={S.label}>{sheet.mrnLabel} <span style={S.mrn}>{sheet.mrn}</span></span>
          <span dir="rtl" style={S.label}>{sheet.mrnLabelAr}</span>
        </div>
      )}

      {/* Floor / room / bed */}
      <div style={S.locStrip}>
        {[
          ['FLOOR', 'الدور', sheet.floor],
          ['ROOM', 'الغرفة', sheet.room],
          ['BED', 'السرير', sheet.bed],
        ].map(([en, ar, val], i) => (
          <div key={en as string} style={{ ...S.locCell, borderLeft: i ? '0.25mm solid #e7e9f0' : 'none' }}>
            <span style={S.locLabel}>{en}</span>
            <span style={S.locValue}>{val || '—'}</span>
            <span dir="rtl" style={S.locLabel}>{ar}</span>
          </div>
        ))}
      </div>

      {/* Allergies — compact red strip, light type, every allergy always shown */}
      <div style={{ ...S.allergy, background: hasAllergies ? '#FDEEEE' : '#f7f8fb' }}>
        <div style={S.rowLine}>
          <span style={{ ...S.allergyText, color: hasAllergies ? '#C0392B' : '#7A8597' }}>
            Allergies: {hasAllergies ? sheet.allergies.map((a) => a.en).join(' · ') : 'None known'}
          </span>
          <span dir="rtl" style={{ ...S.allergyText, color: hasAllergies ? '#C0392B' : '#7A8597' }}>
            الحساسية: {hasAllergies ? sheet.allergies.map((a) => a.ar || a.en).join('، ') : 'لا توجد حساسية معروفة'}
          </span>
        </div>
      </div>

      {/* Ordered items, under their own menu sections */}
      <div style={{ flex: '1 1 auto', minHeight: 0, marginTop: '1.5mm', overflow: 'hidden' }}>
        {ticket.missing ? (
          <div style={S.noOrder}>
            <div>No order placed</div>
            <div dir="rtl">لم يتم تقديم طلب</div>
          </div>
        ) : (
          ticket.groups.map((g, gi) => (
            <div key={gi} style={{ marginTop: gi ? '1.4mm' : 0 }}>
              <div style={{ ...S.rowLine, alignItems: 'center', borderLeft: `0.8mm solid ${c}`, paddingLeft: '1.6mm' }}>
                <span style={{ ...S.groupEn, color: c }}>{g.en}</span>
                {g.forAll && <span style={{ ...S.forAll, color: c, background: c + '14' }}>For All · للجميع</span>}
                <span dir="rtl" style={{ ...S.groupAr, color: c }}>{g.ar || g.en}</span>
              </div>
              {g.items.map((it, ii) => (
                // Rules separate items *within* a group; the last one has none,
                // so no line dangles above the next group header or the footer.
                <div key={ii} style={{ ...S.item, borderBottom: ii === g.items.length - 1 ? 'none' : S.item.borderBottom }}>
                  <span style={S.itemEn}>{it.en}</span>
                  <span dir="rtl" style={S.itemAr}>{it.ar || ''}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer — hospital identity, both languages */}
      <div style={S.footer}>
        <span style={S.hospital}>{hosp.en}</span>
        {hosp.ar && <span dir="rtl" style={S.hospital}>{hosp.ar}</span>}
      </div>
    </div>
  );
}

/** Ticket type scale, in mm so it survives the print pipeline unscaled. */
const S: Record<string, any> = {
  band: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2mm 3mm', borderRadius: '1mm' },
  mealEn: { fontSize: '4.6mm', fontWeight: 700, letterSpacing: '0.02em' },
  mealAr: { fontSize: '4.6mm', fontWeight: 700 },
  dietBand: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '1.2mm 3mm', marginTop: '0.6mm' },
  dietEn: { fontSize: '2.9mm', fontWeight: 700 },
  dietAr: { fontSize: '2.9mm', fontWeight: 700 },
  rowLine: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1.5mm' },
  label: { fontSize: '2.1mm', color: '#7A8597', letterSpacing: '0.04em', fontWeight: 400 },
  value: { fontSize: '2.9mm', fontWeight: 600, color: '#16274D' },
  mrn: { fontWeight: 600, color: '#16274D' },
  name: { fontSize: '3.7mm', fontWeight: 700, color: '#16274D', lineHeight: 1.15, overflowWrap: 'anywhere' },
  chip: { display: 'inline-block', padding: '0.5mm 1.5mm', borderRadius: '0.8mm', fontSize: '2.1mm', fontWeight: 700, letterSpacing: '0.03em', whiteSpace: 'nowrap', flexShrink: 0 },
  nameGroup: { display: 'inline-flex', alignItems: 'center', gap: '1.4mm', minWidth: 0 },
  locStrip: { display: 'flex', marginTop: '1.2mm', border: '0.25mm solid #e7e9f0', borderRadius: '1mm' },
  locCell: { flex: 1, padding: '0.7mm 1.4mm', minWidth: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1mm' },
  locLabel: { fontSize: '1.9mm', color: '#9099ab', letterSpacing: '0.04em' },
  locValue: { fontSize: '2.9mm', fontWeight: 700, color: '#16274D' },
  allergy: { marginTop: '1.1mm', padding: '0.8mm 2mm', borderRadius: '0.8mm' },
  allergyText: { fontSize: '2.3mm', fontWeight: 400, lineHeight: 1.3, overflowWrap: 'anywhere' },
  groupEn: { fontSize: '2.7mm', fontWeight: 700 },
  groupAr: { fontSize: '2.7mm', fontWeight: 700 },
  forAll: { fontSize: '1.9mm', fontWeight: 700, padding: '0.3mm 1.2mm', borderRadius: '0.6mm', whiteSpace: 'nowrap' },
  item: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1.5mm', padding: '0.65mm 0 0.65mm 2.4mm', borderBottom: '0.2mm solid #f0f2f6' },
  itemEn: { fontSize: '2.8mm', color: '#16274D', overflowWrap: 'anywhere' },
  itemAr: { fontSize: '2.8mm', color: '#16274D', overflowWrap: 'anywhere', textAlign: 'right' },
  noOrder: { display: 'flex', justifyContent: 'space-between', fontSize: '2.5mm', color: '#9099ab', fontStyle: 'italic', padding: '2mm 0' },
  footer: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '0.25mm solid #e7e9f0', paddingTop: '1.2mm', marginTop: '1.2mm' },
  orderNo: { fontSize: '2.6mm', fontWeight: 700, color: '#16274D' },
  hospital: { fontSize: '2.4mm', color: '#5d6678', overflowWrap: 'anywhere' },
  stub: { display: 'flex', justifyContent: 'flex-start', marginBottom: '1mm', position: 'relative', zIndex: 1 },
};
