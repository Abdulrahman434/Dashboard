/**
 * mealTicket — turns kitchen orders into printable meal-ticket data.
 *
 * Pure data, no JSX: given the store and a day's orders it resolves everything
 * a printed ticket shows (bilingual labels, diet colour, allergies, grouped
 * items) and arranges recipients into one sheet each. The renderer stays
 * presentational, and this stays runnable outside React for verification.
 */

import {
  dietColor, dietAr, sectionAr, allergenAr, mealAr, mealServingTime, patientByName,
} from './foodStore';

// Column order on the sheet is fixed left-to-right and must not follow the
// Arabic text direction — the paper is cut at fixed positions.
export const SHEET_MEALS = ['Dinner', 'Lunch', 'Breakfast'] as const;

export type TicketGroup = {
  en: string;
  ar: string;
  forAll: boolean;
  items: { en: string; ar: string }[];
};

export type Ticket = {
  key: string;
  meal: string;
  mealAr: string;
  servingStart: string;
  servingEnd: string;
  orderNo: string;
  groups: TicketGroup[];
  missing: boolean;      // no order exists for this recipient + meal
};

export type Sheet = {
  key: string;
  role: 'Patient' | 'Guest';
  roleAr: string;
  name: string;
  nameAr: string;
  mrn: string;
  mrnLabel: string;      // "MRN" for a patient, "Patient MRN" for a companion
  mrnLabelAr: string;
  floor: string;
  room: string;
  bed: string;
  diet: string;
  dietAr: string;
  dietColor: string;
  pediatric: boolean;
  allergies: { en: string; ar: string }[];
  servingDate: string;
  tickets: Ticket[];     // always SHEET_MEALS.length, in that order
  sortKey: string;
};

// Accepts either word so orders created before the rename still pair up.
const GUEST_RE = /^(?:companion|guest)\s*[—–-]\s*/i;

export function isCompanionOrder(o: any): boolean {
  return GUEST_RE.test(String(o.name || '')) || /companion|guest/i.test(String(o.name || ''));
}

// The patient a companion order belongs to — companions are named after them.
export function basePatientNameOf(o: any): string {
  return String(o.name || '').replace(GUEST_RE, '').replace(/'s (?:companion|guest)$/i, '').trim();
}

// A recipient is one person on one bed: the patient, or their companion. Both
// get their own sheet, and the companion's sheet follows the patient's.
function recipientKey(o: any): string {
  const person = isCompanionOrder(o) ? `C:${basePatientNameOf(o)}` : `P:${o.name}`;
  return `${o.room}|${o.bed}|${person}`;
}

// Room numbers sort numerically ("9" before "10"); pad so a plain string
// compare still orders them correctly.
const pad = (v: any) => String(v ?? '').padStart(6, '0');

function groupLines(db: any, lines: [string, string][]): TicketGroup[] {
  const out: TicketGroup[] = [];
  (lines || []).forEach(([sec, dish]) => {
    // Consecutive lines in the same section are one group, so the menu's own
    // ordering survives onto the ticket instead of being re-sorted.
    let g = out.length > 0 && out[out.length - 1].en === sec ? out[out.length - 1] : null;
    if (!g) {
      const s = (db.sections || []).find((x: any) => x.en === sec);
      g = { en: sec, ar: sectionAr(db, sec), forAll: !!(s && s.forAll), items: [] };
      out.push(g);
    }
    const d = (db.dishes || []).find((x: any) => x.en === dish);
    g.items.push({ en: dish, ar: (d && d.ar) || '' });
  });
  return out;
}

/**
 * Group a day's orders into one sheet per recipient.
 *
 * `orders` should already be the list for `servingDate` — the same list the
 * Kitchen board shows, so print reflects exactly what was reviewed on screen.
 */
export function buildSheets(db: any, orders: any[], servingDate: string): Sheet[] {
  const byRecipient = new Map<string, any[]>();
  orders
    .filter((o: any) => o.date === servingDate)
    .forEach((o: any) => {
      const k = recipientKey(o);
      if (!byRecipient.has(k)) byRecipient.set(k, []);
      byRecipient.get(k)!.push(o);
    });

  const sheets: Sheet[] = [];

  byRecipient.forEach((group, key) => {
    const first = group[0];
    const companion = isCompanionOrder(first);
    const baseName = companion ? basePatientNameOf(first) : String(first.name || '');
    const patient = patientByName(db, baseName) || {};

    // A companion's diet and allergies come from their OWN order, never the
    // patient's — they are a different person eating a different meal.
    const diet = companion ? String(first.diet || 'Regular') : String(first.diet || patient.diet || 'Regular');
    const allergyNames: string[] = companion
      ? (first.allergies || [])
      : (patient.allergies || first.allergies || []);

    const floor = String(first._floor ?? patient.floor ?? '');
    const room = String(first.room ?? patient.room ?? '');
    const bed = String(first.bed ?? patient.bed ?? '');

    const tickets: Ticket[] = SHEET_MEALS.map((meal) => {
      const o = group.find((x: any) => x.meal === meal);
      const svc = mealServingTime(db, meal);
      return {
        key: `${key}|${meal}`,
        meal,
        mealAr: mealAr(db, meal),
        servingStart: svc.start,
        servingEnd: svc.end,
        orderNo: o ? String(o.orderNo || String(o.id).replace(/^\w+-/, '')) : '',
        groups: o ? groupLines(db, o.lines) : [],
        missing: !o,
      };
    });

    sheets.push({
      key,
      role: companion ? 'Guest' : 'Patient',
      roleAr: companion ? 'مرافق' : 'مريض',
      // 'Guest of' rather than 'Companion of' — the role chip already says
      // GUEST, and the longer word pushed the name onto a second line.
      name: companion ? `Guest of ${baseName}` : baseName,
      nameAr: companion
        ? `مرافق ${patient.nameAr || baseName}`
        : (patient.nameAr || baseName),
      mrn: String(first._mrn || patient.mrn || ''),
      mrnLabel: companion ? 'Patient MRN' : 'MRN',
      mrnLabelAr: companion ? 'ملف المريض' : 'رقم الملف الطبي',
      floor,
      room,
      bed,
      diet,
      dietAr: dietAr(db, diet),
      dietColor: dietColor(db, diet),
      // Pediatric decoration is an explicit flag — the order's own (set from the
      // patient record or the bed's ward group) or the patient record's — never
      // inferred from the diet. A companion is an adult guest, so never decorated.
      pediatric: !companion && (first._pediatric ?? !!patient.pediatric),
      allergies: allergyNames.map((a: string) => ({ en: a, ar: allergenAr(db, a) })),
      servingDate,
      tickets,
      // Floor, then room, then bed — with the patient's sheet immediately
      // followed by their companion's ("0" sorts before "1").
      sortKey: [pad(floor), pad(room), pad(bed), companion ? '1' : '0'].join('|'),
    });
  });

  return sheets.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

// ---- bilingual formatting ---------------------------------------------------

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Western digits -> Arabic-Indic, as the printed design uses. */
export function toArabicDigits(v: string | number): string {
  return String(v).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** '2026-09-17' -> '17 SEP 2026'. Anything unparseable passes through. */
export function fmtServingDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  return `${Number(m[3])} ${MONTHS_EN[Number(m[2]) - 1]} ${m[1]}`;
}

/** '8:00 AM' + '9:00 AM' -> '8:00 - 9:00 AM' (meridiem stated once). */
export function timeRangeEn(start: string, end: string): string {
  if (!start && !end) return '';
  if (!end) return start;
  const sm = /(AM|PM)\s*$/i.exec(start);
  const em = /(AM|PM)\s*$/i.exec(end);
  // Drop the leading meridiem only when both ends share it.
  const s = sm && em && sm[1].toUpperCase() === em[1].toUpperCase()
    ? start.replace(/\s*(AM|PM)\s*$/i, '')
    : start;
  return `${s} - ${end}`;
}

/** Same range in Arabic: Arabic-Indic digits + صباحا / مساء. */
export function timeRangeAr(start: string, end: string): string {
  const word = (t: string) => {
    const m = /(AM|PM)\s*$/i.exec(String(t || ''));
    return m ? (m[1].toUpperCase() === 'AM' ? 'صباحا' : 'مساء') : '';
  };
  const strip = (t: string) => toArabicDigits(String(t || '').replace(/\s*(AM|PM)\s*$/i, '').trim());
  if (!end) return [strip(start), word(start)].filter(Boolean).join(' ');
  const ws = word(start);
  const we = word(end);
  // A window crossing noon has to state both halves, or "١١:٣٠ - ١:٠٠ مساء"
  // would read as though it started in the afternoon.
  if (ws && we && ws !== we) return `${strip(start)} ${ws} - ${strip(end)} ${we}`;
  return [`${strip(start)} - ${strip(end)}`, we || ws].filter(Boolean).join(' ');
}

/**
 * Hospital name for the ticket footer, from Identity Settings.
 *
 * Guarded for non-browser contexts (server render, tests) and for a corrupt
 * value, so a print never fails over branding.
 */
export function hospitalNames(
  fallbackEn = 'CareInn Hospital',
  fallbackAr = '',
): { en: string; ar: string } {
  try {
    if (typeof localStorage === 'undefined') return { en: fallbackEn, ar: fallbackAr };
    const raw = localStorage.getItem('careinn-identity-settings');
    if (!raw) return { en: fallbackEn, ar: fallbackAr };
    const cfg = JSON.parse(raw) || {};
    const pick = (v: any, fb: string) => (typeof v === 'string' && v.trim() ? v.trim() : fb);
    return { en: pick(cfg.hospitalName, fallbackEn), ar: pick(cfg.hospitalNameAr, fallbackAr) };
  } catch {
    return { en: fallbackEn, ar: fallbackAr };
  }
}
