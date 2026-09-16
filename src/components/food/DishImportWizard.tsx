import { Fragment, useMemo, useState } from 'react';
import {
  X, Upload, Download, Check, AlertTriangle, Loader2, CheckCircle2,
  Plus, RefreshCw, ListChecks,
} from 'lucide-react';
import { useFood, updateFood } from './foodStore';

// ============================================================================
// Dish Import Wizard — 3 steps: Upload → Review → Import
// Matches the CareInn import-flow design, wired to the real dish data model
// (en / ar / ur / section / allergens[] / on).
// ============================================================================

type Step = 'upload' | 'validating' | 'review' | 'importing' | 'complete';
type Strategy = 'add' | 'update' | 'review';
type Decision = 'keep' | 'update';

interface ParsedRow {
  rowNum: number;
  en: string;
  ar: string;
  ur: string;
  section: string;
  allergens: string[];
  allergensRaw: string;
  on: boolean;
  activeRaw: string;
  errors: { field: string; value: string; fix: string }[];
}

// Validate every row (also recomputes duplicates across the whole file).
// Used at parse time and again after any inline edit in the review.
function validateAll(rows: ParsedRow[], validSections: string[]): ParsedRow[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const errors: ParsedRow['errors'] = [];
    const en = row.en.trim();
    if (!en) errors.push({ field: 'name_en', value: 'Blank', fix: 'Enter an English dish name.' });
    if (row.section && !validSections.some((s) => s.toLowerCase() === row.section.trim().toLowerCase()))
      errors.push({ field: 'section', value: row.section, fix: 'Pick a section from the list.' });
    if (!row.section && en) errors.push({ field: 'section', value: 'Blank', fix: 'Pick a section from the list.' });
    if ((row.allergensRaw || '').includes(',')) errors.push({ field: 'allergens', value: row.allergensRaw, fix: 'Separate allergens with ;' });
    if (row.activeRaw && !['yes', 'no'].includes(row.activeRaw.trim().toLowerCase()))
      errors.push({ field: 'active', value: row.activeRaw, fix: 'Use Yes or No.' });
    if (en) {
      const key = en.toLowerCase();
      if (seen.has(key)) errors.push({ field: 'name_en', value: `Duplicate of row ${seen.get(key)}`, fix: 'Remove or rename one row.' });
      else seen.set(key, row.rowNum);
    }
    return { ...row, errors };
  });
}

function splitAllergens(raw: string): string[] {
  return raw.split(';').map((x) => x.trim()).filter(Boolean);
}

const CYAN = '#4EBEE3';
const NAVY = '#16274D';

// --- tiny CSV parser (handles quoted fields with embedded commas) -----------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((c) => c.trim() !== '')) rows.push(row); }
  return rows;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a.map((x) => x.toLowerCase()));
  return b.every((x) => sa.has(x.toLowerCase()));
}

function download(name: string, content: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export default function DishImportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const db: any = useFood();
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; rows: number; sizeKB: number } | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [strategy, setStrategy] = useState<Strategy>('add');
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [reviewTab, setReviewTab] = useState<'all' | 'new' | 'existing' | 'errors'>('all');
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, added: 0, updated: 0, kept: 0, failed: 0 });
  const [result, setResult] = useState({ added: 0, updated: 0, kept: 0, skipped: 0, libraryTotal: 0 });

  const validSections: string[] = (db.sections || []).map((s: any) => s.en);

  const reset = () => {
    setStep('upload'); setPendingFile(null); setFileInfo(null); setRows([]); setStrategy('add');
    setDecisions({}); setReviewTab('all'); setSkipInvalid(true); setConfirmOpen(false);
    setProgress({ done: 0, total: 0, added: 0, updated: 0, kept: 0, failed: 0 });
    setResult({ added: 0, updated: 0, kept: 0, skipped: 0, libraryTotal: 0 });
  };
  const close = () => { reset(); onClose(); };

  // Stage a file (from drop or picker) without processing it yet — the footer
  // "Choose CSV file" button stays disabled until a file is staged.
  const stageFile = (file: File) => {
    if (!/\.csv$/i.test(file.name)) { alert('Please choose a .csv file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File is larger than 10 MB.'); return; }
    setPendingFile(file);
  };

  // ---- parse + validate ----------------------------------------------------
  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('File is larger than 10 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const grid = parseCsv(String(reader.result || ''));
      if (grid.length === 0) { alert('The file is empty.'); return; }
      const header = grid[0].map((h) => h.trim().toLowerCase());
      const col = (name: string, fallback: number) => {
        const i = header.indexOf(name);
        return i >= 0 ? i : fallback;
      };
      const ci = {
        en: col('name_en', 0), ar: col('name_ar', 1), ur: col('name_ur', 2),
        section: col('section', 3), allergens: col('allergens', 4), active: col('active', 5),
      };
      const parsed: ParsedRow[] = [];
      for (let r = 1; r < grid.length; r++) {
        const cells = grid[r];
        const rowNum = r + 1; // header = row 1
        const en = (cells[ci.en] || '').trim();
        const ar = (cells[ci.ar] || '').trim();
        const ur = (cells[ci.ur] || '').trim();
        const section = (cells[ci.section] || '').trim();
        const allergenCell = (cells[ci.allergens] || '').trim();
        const activeRaw = (cells[ci.active] || '').trim();
        parsed.push({
          rowNum, en, ar, ur, section,
          allergens: splitAllergens(allergenCell), allergensRaw: allergenCell,
          on: activeRaw.toLowerCase() !== 'no', activeRaw, errors: [],
        });
      }
      setFileInfo({ name: file.name, rows: parsed.length, sizeKB: Math.max(1, Math.round(file.size / 1024)) });
      setRows(validateAll(parsed, validSections));
      setStep('validating');
      // brief, honest validation beat
      setTimeout(() => setStep('review'), 750);
    };
    reader.readAsText(file);
  };

  // ---- derived: classify rows ---------------------------------------------
  const dishByName = useMemo(() => {
    const m = new Map<string, any>();
    (db.dishes || []).forEach((x: any) => m.set(String(x.en).trim().toLowerCase(), x));
    return m;
  }, [db.dishes]);

  const valid = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);
  const newRows = valid.filter((r) => !dishByName.has(r.en.toLowerCase()));
  const existingRows = valid
    .filter((r) => dishByName.has(r.en.toLowerCase()))
    .map((r) => {
      const ex = dishByName.get(r.en.toLowerCase());
      const changed =
        (!!r.section && r.section !== ex.section) ||
        !sameSet(ex.allergens || [], r.allergens) ||
        ex.on !== r.on ||
        (!!r.ar && r.ar !== ex.ar) ||
        (!!r.ur && r.ur !== ex.ur);
      return { row: r, ex, changed };
    });

  // Inline edit a row in the review, then re-validate the whole file.
  const editRow = (rowNum: number, patch: Partial<ParsedRow>) => {
    setRows((prev) => validateAll(prev.map((r) => {
      if (r.rowNum !== rowNum) return r;
      const m = { ...r, ...patch };
      if (patch.allergensRaw !== undefined) m.allergens = splitAllergens(patch.allergensRaw);
      if (patch.activeRaw !== undefined) m.on = patch.activeRaw.trim().toLowerCase() !== 'no';
      return m;
    }), validSections));
  };

  const setAllDecisions = (d: Decision) => setDecisions((m) => {
    const n = { ...m };
    existingRows.filter((e) => e.changed).forEach((e) => { n[e.row.rowNum] = d; });
    return n;
  });

  const decisionFor = (rowNum: number, changed: boolean): Decision => {
    if (!changed) return 'keep';
    if (decisions[rowNum]) return decisions[rowNum];
    if (strategy === 'update') return 'update';
    if (strategy === 'review') return decisions[rowNum] || 'update';
    return 'keep'; // add-only
  };

  const updates = existingRows.filter((e) => e.changed && decisionFor(e.row.rowNum, true) === 'update');
  const keeps = existingRows.filter((e) => !(e.changed && decisionFor(e.row.rowNum, true) === 'update'));
  const changedExisting = existingRows.filter((e) => e.changed);
  const allChangedUpdate = changedExisting.length > 0 && changedExisting.every((e) => decisionFor(e.row.rowNum, true) === 'update');

  // ---- run import ----------------------------------------------------------
  const runImport = () => {
    setConfirmOpen(false);
    const total = newRows.length + updates.length;
    setStep('importing');
    setProgress({ done: 0, total, added: 0, updated: 0, kept: keeps.length, failed: 0 });

    // simulate live progress, then commit
    let done = 0; let added = 0; let updated = 0;
    const queue = [...newRows.map((r) => ({ kind: 'new', r })), ...updates.map((e) => ({ kind: 'upd', e }))];
    const tick = () => {
      const batch = Math.max(1, Math.ceil(queue.length / 12));
      for (let i = 0; i < batch && done < queue.length; i++) {
        const item: any = queue[done];
        if (item.kind === 'new') added++; else updated++;
        done++;
      }
      setProgress((p) => ({ ...p, done, added, updated }));
      if (done < queue.length) setTimeout(tick, 90);
      else commit();
    };
    const commit = () => {
      updateFood((d: any) => {
        newRows.forEach((r) => d.dishes.push({
          en: r.en, ar: r.ar, ur: r.ur, section: r.section || 'Mains', allergens: r.allergens, on: r.on,
        }));
        updates.forEach((e) => {
          const ex = d.dishes.find((x: any) => String(x.en).trim().toLowerCase() === e.row.en.toLowerCase());
          if (!ex) return;
          if (e.row.section) ex.section = e.row.section;
          ex.allergens = e.row.allergens;
          ex.on = e.row.on;
          if (e.row.ar) ex.ar = e.row.ar;
          if (e.row.ur) ex.ur = e.row.ur;
        });
      });
      setResult({
        added: newRows.length, updated: updates.length, kept: keeps.length,
        skipped: skipInvalid ? errorRows.length : 0,
        libraryTotal: (db.dishes || []).length + newRows.length,
      });
      setStep('complete');
    };
    setTimeout(tick, 200);
  };

  const primaryImport = () => {
    if (errorRows.length > 0 && !skipInvalid) return;
    if (updates.length > 0) setConfirmOpen(true);
    else runImport();
  };

  if (!open) return null;

  // ---- shared UI bits ------------------------------------------------------
  // Full-width step bar that spans the whole card.
  const stepper = (active: 1 | 2 | 3) => {
    const items = [{ n: 1, label: 'Upload' }, { n: 2, label: 'Review' }, { n: 3, label: 'Import' }];
    return (
      <div className="flex items-center w-full">
        {items.map((it, i) => (
          <Fragment key={it.n}>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-semibold"
                style={
                  active > it.n
                    ? { background: '#22c55e', color: 'white' }
                    : active === it.n
                      ? { background: CYAN, color: 'white' }
                      : { background: '#eef1f7', color: '#9099ab' }
                }
              >
                {active > it.n ? <Check size={13} /> : it.n}
              </span>
              <span className={`text-[13px] font-medium ${active >= it.n ? 'text-[#16274D]' : 'text-[#9099ab]'}`}>{it.label}</span>
            </div>
            {i < items.length - 1 && <span className={`flex-1 h-px mx-3 ${active > it.n ? 'bg-[#22c55e]' : 'bg-[#e0e4ee]'}`} />}
          </Fragment>
        ))}
      </div>
    );
  };

  const closeBtn = (
    <button onClick={close} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors">
      <X size={18} />
    </button>
  );

  const statCard = (label: string, value: number | string, color?: string) => (
    <div className="rounded-xl border border-[#e7e9f0] px-4 py-3">
      <div className="text-[12.5px] text-[#5d6678]">{label}</div>
      <div className="text-[22px] font-semibold mt-0.5 font-['Poppins',sans-serif]" style={{ color: color || NAVY }}>{value}</div>
    </div>
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================
  const wrap = (maxW: string, children: any) => (
    <div className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-50 p-5" onClick={close}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxW} max-h-[90vh] flex flex-col font-['Poppins',sans-serif]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  // ---------- STEP 1: UPLOAD ----------
  if (step === 'upload') {
    return wrap('max-w-[640px]', (
      <>
        <div className="p-6 pb-4 border-b border-[#eef0f4]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#16274D]">Import dishes</h2>
              <p className="text-[13.5px] text-[#5d6678]">Upload a CSV file to add dishes to the library.</p>
            </div>
            {closeBtn}
          </div>
          <div className="mt-4">{stepper(1)}</div>
        </div>
        <div className="p-6">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) stageFile(f); }}
            className={`block rounded-xl border-2 border-dashed cursor-pointer transition-colors px-6 py-10 text-center ${dragOver ? 'border-[#4EBEE3] bg-[#4EBEE3]/5' : pendingFile ? 'border-[#4EBEE3] bg-[#f7fbfd]' : 'border-[#d6dae6] hover:border-[#4EBEE3] hover:bg-[#f7fbfd]'}`}
          >
            {pendingFile ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#e7f6f0] flex items-center justify-center mx-auto mb-3 text-[#157f5c]">
                  <Check size={26} />
                </div>
                <div className="text-[16px] font-semibold text-[#16274D]">{pendingFile.name}</div>
                <div className="text-[12.5px] text-[#9099ab] mt-1">{Math.max(1, Math.round(pendingFile.size / 1024))} KB · click to choose a different file</div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center mx-auto mb-3 text-[#4EBEE3]">
                  <Upload size={24} />
                </div>
                <div className="text-[16px] font-semibold text-[#16274D]">Choose a CSV file or drag it here</div>
                <div className="text-[12.5px] text-[#9099ab] mt-1">Maximum file size 10 MB</div>
              </>
            )}
            <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) stageFile(f); e.target.value = ''; }} />
          </label>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#f7f8fb] px-4 py-3">
            <span className="text-[13px] text-[#5d6678]">Use the sample template to avoid formatting errors.</span>
            <button
              onClick={() => download('careinn-dishes-sample.csv', 'name_en,name_ar,name_ur,section,allergens,active\nCroissant,كرواسون,,Baked breads,Gluten;Milk;Egg,Yes')}
              className="text-[13px] font-semibold text-[#4EBEE3] hover:underline cursor-pointer whitespace-nowrap"
            >
              Download sample CSV
            </button>
          </div>

        </div>
        <div className="mt-auto border-t border-[#eef0f4] p-4 flex items-center justify-between">
          <button onClick={close} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Cancel</button>
          <button
            onClick={() => { if (pendingFile) handleFile(pendingFile); }}
            disabled={!pendingFile}
            className={`h-[38px] px-5 rounded-[10px] text-[14px] font-medium text-white transition-colors ${pendingFile ? 'bg-[#4EBEE3] hover:bg-[#3da5ca] cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Continue
          </button>
        </div>
      </>
    ));
  }

  // ---------- STEP 2 (loading): VALIDATING ----------
  if (step === 'validating') {
    const checks = ['Columns', 'Required fields', 'Checking references', 'Existing dishes'];
    return wrap('max-w-[640px]', (
      <>
        <div className="p-6 pb-4 border-b border-[#eef0f4]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#16274D]">Import dishes</h2>
              <p className="text-[13.5px] text-[#5d6678]">The file is being checked before anything is added.</p>
            </div>
            {closeBtn}
          </div>
          <div className="mt-4">{stepper(1)}</div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between rounded-xl border border-[#e7e9f0] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#4EBEE3]/10 text-[#4EBEE3] flex items-center justify-center text-[11px] font-bold">CSV</div>
              <div>
                <div className="font-semibold text-[#16274D] text-[14px]">{fileInfo?.name}</div>
                <div className="text-[12px] text-[#9099ab]">{fileInfo?.rows} rows · {fileInfo?.sizeKB} KB</div>
              </div>
            </div>
            <span className="text-[11.5px] px-2.5 py-1 rounded-md bg-[#e5f6fc] text-[#0a7c9e] font-semibold">Uploaded</span>
          </div>
          <div className="flex flex-col items-center py-8">
            <Loader2 size={40} className="text-[#4EBEE3] animate-spin" />
            <div className="text-[16px] font-semibold text-[#16274D] mt-4">Validating your file…</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Checking required fields, reference values and existing dishes.</div>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {checks.map((c, i) => (
                <span key={c} className={`text-[12px] px-3 py-1.5 rounded-lg font-medium ${i < 2 ? 'bg-[#e7f6f0] text-[#157f5c]' : 'bg-[#f2f4f8] text-[#5d6678]'}`}>
                  {i < 2 ? '✓ ' : ''}{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </>
    ));
  }

  // ---------- STEP 3: IMPORTING ----------
  if (step === 'importing') {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 100;
    return wrap('max-w-[640px]', (
      <>
        <div className="p-6 pb-4 border-b border-[#eef0f4]">
          <div>
            <h2 className="text-[20px] font-semibold text-[#16274D]">Importing dishes</h2>
            <p className="text-[13.5px] text-[#5d6678]">Your validated rows are now being added to the library.</p>
          </div>
          <div className="mt-4">{stepper(3)}</div>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center">
            <Loader2 size={40} className="text-[#4EBEE3] animate-spin" />
            <div className="text-[16px] font-semibold text-[#16274D] mt-4">Importing {progress.done} of {progress.total} rows…</div>
            <div className="text-[13px] text-[#5d6678] mt-1">Please keep this window open until the import is complete.</div>
          </div>
          <div className="mt-5">
            <div className="h-2 rounded-full bg-[#eef1f7] overflow-hidden">
              <div className="h-full bg-[#4EBEE3] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[12px] text-[#5d6678] mt-1.5">
              <span>Processing dishes</span><span>{pct}%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5">
            {statCard('Added', progress.added)}
            {statCard('Updated', progress.updated)}
            {statCard('Kept', progress.kept)}
            {statCard('Failed', progress.failed, '#b91c1c')}
          </div>
        </div>
      </>
    ));
  }

  // ---------- COMPLETE ----------
  if (step === 'complete') {
    return wrap('max-w-[680px]', (
      <>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center text-white"><Check size={30} /></div>
          <h2 className="text-[22px] font-semibold text-[#16274D] mt-4">Import complete</h2>
          <p className="text-[13.5px] text-[#5d6678] mt-1">All valid rows were processed. Invalid rows were skipped and saved in the report.</p>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-3 gap-3">
            {statCard('Added', result.added, CYAN)}
            {statCard('Updated', result.updated, '#96650a')}
            {statCard('Kept unchanged', result.kept)}
          </div>
          <div className="mt-4 rounded-xl bg-[#e7f6f0] text-[#157f5c] text-center text-[14px] font-semibold py-3">
            Your library now contains {result.libraryTotal} dishes.
          </div>
        </div>
        <div className="mt-6 border-t border-[#eef0f4] p-4 flex items-center justify-between">
          <button
            onClick={() => download('careinn-import-report.csv', importReportCsv(result))}
            className="h-[38px] px-4 inline-flex items-center gap-2 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer"
          >
            <Download size={15} /> Download import report
          </button>
          <button onClick={close} className="h-[38px] px-6 rounded-[10px] bg-[#4EBEE3] hover:bg-[#3da5ca] text-white text-[14px] font-medium cursor-pointer">Done</button>
        </div>
      </>
    ));
  }

  // ---------- STEP 2: REVIEW ----------
  const hasErrors = errorRows.length > 0;
  const hasExisting = existingRows.length > 0;
  const title = hasErrors ? 'Fix import errors' : 'Review import';
  const sub = hasErrors
    ? `${errorRows.length} row${errorRows.length === 1 ? '' : 's'} contain values that cannot be imported.`
    : hasExisting
      ? `Choose how the ${existingRows.length} existing dishes should be handled.`
      : 'All rows are valid and ready to be added.';

  // Keep the active tab valid even after a tab is hidden (tabs shown depend on
  // the chosen strategy: New under "add", Existing under "update").
  const effTab: typeof reviewTab =
    reviewTab === 'existing' && !(strategy === 'update' && hasExisting) ? 'all'
      : reviewTab === 'new' && strategy !== 'add' ? 'all'
        : reviewTab === 'errors' && !hasErrors ? 'all'
          : reviewTab;

  const tabBtn = (id: typeof reviewTab, label: string, count: number) => (
    <button
      onClick={() => setReviewTab(id)}
      className={`px-1 pb-2 text-[13.5px] font-medium border-b-2 -mb-px transition-colors ${effTab === id ? 'border-[#4EBEE3] text-[#16274D]' : 'border-transparent text-[#5d6678] hover:text-[#16274D]'}`}
    >
      {label} <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${effTab === id ? 'bg-[#4EBEE3]/15 text-[#0a7c9e]' : 'bg-[#f2f4f8] text-[#9099ab]'}`}>{count}</span>
    </button>
  );

  const resultBadge = (kind: string) => {
    const map: Record<string, string> = {
      New: 'bg-[#e7f3fb] text-[#0a6ca6]', Update: 'bg-[#fbf1de] text-[#96650a]',
      Keep: 'bg-[#eef1f7] text-[#5d6678]', Error: 'bg-[#fde8e8] text-[#b91c1c]',
    };
    return <span className={`text-[11.5px] px-2 py-0.5 rounded-md font-medium ${map[kind]}`}>{kind}</span>;
  };

  const th = "text-left text-[11px] font-medium text-gray-600 px-3 py-2";
  const td = "px-3 py-2.5 text-[13px] text-[#19233a]";
  const cellInp = "w-full min-w-[80px] bg-transparent rounded px-1.5 py-1 text-[13px] text-[#19233a] outline-none border border-transparent hover:border-[#e0e4ee] focus:border-[#4EBEE3] focus:bg-white transition-colors";

  // Row for the "All rows" / "New dishes" / "Errors" tables.
  // readOnly = show a plain preview (used in Add mode, where you only add — no editing);
  // editable = inputs (used in the Errors tab and Update mode).
  const editableRow = (r: ParsedRow, readOnly = false) => {
    const bad = r.errors.length > 0;
    const isNew = !!r.en && !dishByName.has(r.en.toLowerCase());
    const ex = existingRows.find((e) => e.row.rowNum === r.rowNum);
    const kind = bad ? 'Error' : isNew ? 'New' : (ex && ex.changed && decisionFor(r.rowNum, true) === 'update' ? 'Update' : 'Keep');
    const activeVal = r.activeRaw && !['yes', 'no'].includes(r.activeRaw.trim().toLowerCase()) ? '' : (r.on ? 'Active' : 'Inactive');
    return (
      <Fragment key={r.rowNum}>
        <tr className={cx('border-b border-gray-100', bad && 'bg-[#fff7f7]')}>
          <td className={cx(td, 'text-gray-400 w-10')}>{r.rowNum}</td>
          {readOnly ? (
            <>
              <td className={cx(td, 'font-medium')}>{r.en || <span className="text-gray-400">Unnamed</span>}</td>
              <td className={cx(td, 'text-[#5d6678]')} dir="rtl">{r.ar || '—'}</td>
              <td className={cx(td, 'text-[#5d6678]')}>{r.section || '—'}</td>
              <td className={cx(td, 'text-[#5d6678]')}>{r.allergensRaw || <span className="text-gray-400">None</span>}</td>
              <td className={cx(td, 'text-[#5d6678]')}>{activeVal || '—'}</td>
            </>
          ) : (
            <>
              <td className="px-2 py-1.5"><input className={cellInp} value={r.en} placeholder="Dish name" onChange={(e) => editRow(r.rowNum, { en: e.target.value })} /></td>
              <td className="px-2 py-1.5"><input dir="rtl" className={cellInp} value={r.ar} placeholder="—" onChange={(e) => editRow(r.rowNum, { ar: e.target.value })} /></td>
              <td className="px-2 py-1.5">
                <select className={cx(cellInp, 'cursor-pointer')} value={r.section} onChange={(e) => editRow(r.rowNum, { section: e.target.value })}>
                  <option value="">Choose…</option>
                  {validSections.map((s) => <option key={s} value={s}>{s}</option>)}
                  {r.section && !validSections.some((s) => s.toLowerCase() === r.section.toLowerCase()) && <option value={r.section}>{r.section} (invalid)</option>}
                </select>
              </td>
              <td className="px-2 py-1.5"><input className={cellInp} value={r.allergensRaw} placeholder="e.g. Gluten; Milk" onChange={(e) => editRow(r.rowNum, { allergensRaw: e.target.value })} /></td>
              <td className="px-2 py-1.5">
                <select className={cx(cellInp, 'cursor-pointer')} value={activeVal} onChange={(e) => editRow(r.rowNum, { activeRaw: e.target.value === 'Active' ? 'Yes' : 'No' })}>
                  <option value="" disabled>Choose…</option>
                  <option>Active</option><option>Inactive</option>
                </select>
              </td>
            </>
          )}
          <td className={cx(td, 'w-16')}>{resultBadge(kind)}</td>
        </tr>
        {bad && (
          <tr className="bg-[#fff7f7] border-b border-gray-100">
            <td></td>
            <td colSpan={6} className="px-3 pb-2 pt-0 text-[12px] text-[#b91c1c]">
              {r.errors.map((er) => er.fix).join(' · ')}{readOnly ? ' — fix it in the Errors tab' : ''}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return wrap('max-w-[980px]', (
    <>
      <div className="p-6 pb-4 border-b border-[#eef0f4]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#16274D]">{title}</h2>
            <p className="text-[13.5px] text-[#5d6678]">{sub}</p>
          </div>
          {closeBtn}
        </div>
        <div className="mt-4">{stepper(2)}</div>
      </div>

      <div className="px-6 pt-4 overflow-y-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {statCard('Rows found', rows.length)}
          {statCard('New dishes', newRows.length, CYAN)}
          {statCard('Existing', existingRows.length, '#96650a')}
          {statCard('Errors', errorRows.length, '#b91c1c')}
        </div>

        {/* Context banner */}
        {!hasErrors && !hasExisting && (
          <div className="mt-4 rounded-xl bg-[#e7f6f0] text-[#157f5c] text-[13.5px] px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> No existing dishes or validation issues were found.
          </div>
        )}
        {!hasErrors && hasExisting && (
          <div className="mt-4 rounded-xl bg-[#fbf7e8] text-[#96650a] text-[13.5px] px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Existing dishes will not be overwritten unless you choose to update them.
          </div>
        )}

        {/* Strategy chooser (only when existing dishes present and no errors focus) */}
        {hasExisting && (
          <div className="mt-4">
            <div className="text-[13.5px] font-semibold text-[#16274D] mb-2">How should existing dishes be handled?</div>
            <div className="space-y-2">
              {([
                { id: 'add', icon: Plus, tint: '#157f5c', bg: '#e7f6f0', title: 'Add new dishes only', desc: `Add the ${newRows.length} new dishes. Existing dishes are not touched.`, effect: 'Existing: unchanged', effTint: '#157f5c', effBg: '#e7f6f0', rec: true },
                { id: 'update', icon: RefreshCw, tint: '#96650a', bg: '#fbf1de', title: 'Update existing and add new', desc: `Add the ${newRows.length} new dishes and overwrite changed fields on existing ones.`, effect: 'Existing: overwritten', effTint: '#96650a', effBg: '#fbf1de' },
              ] as const).map((o) => {
                const Icon = o.icon;
                const on = strategy === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setStrategy(o.id); setDecisions({}); setReviewTab(o.id === 'update' ? 'existing' : 'new'); }}
                    className={`w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${on ? 'border-[#4EBEE3] bg-[#4EBEE3]/5 ring-1 ring-[#4EBEE3]/40' : 'border-[#e7e9f0] hover:bg-[#f7f8fb]'}`}
                  >
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: o.bg, color: o.tint }}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="font-semibold text-[#16274D] text-[14px]">{o.title}</span>
                      <span className="block text-[12.5px] text-[#5d6678] mt-0.5">{o.desc}</span>
                    </span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? 'border-[#4EBEE3]' : 'border-gray-300'}`}>
                      {on && <span className="w-2 h-2 rounded-full bg-[#4EBEE3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Live result of the selected choice — updates instantly so the
                difference between Add / Update / Review is visible. */}
            <div className="mt-3 rounded-xl bg-[#f7f8fb] border border-[#e7e9f0] px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px]">
              <span className="font-semibold text-[#16274D]">This will:</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0a6ca6]" /><b className="text-[#16274D]">{newRows.length}</b> added</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#96650a]" /><b className="text-[#16274D]">{updates.length}</b> updated</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5d6678]" /><b className="text-[#16274D]">{keeps.length}</b> kept unchanged</span>
              {updates.length === 0 && existingRows.length > 0 && (
                <span className="text-[12px] text-[#9099ab]">— nothing to update, so this matches “Add new only”.</span>
              )}
            </div>
            <p className="text-[12px] text-[#9099ab] mt-2">Existing dishes are matched by their English dish name.</p>
          </div>
        )}

        {/* Tabs + table — simple case shows just "All rows"; the interactive
            per-row "Review existing" tab only appears when the user opts into it. */}
        <div className="mt-5 border-b border-gray-200 flex items-center gap-5">
          {tabBtn('all', 'All rows', rows.length)}
          {strategy === 'add' && tabBtn('new', 'New dishes', newRows.length)}
          {strategy === 'update' && hasExisting && tabBtn('existing', 'Existing changes', existingRows.filter((e) => e.changed).length)}
          {hasErrors && tabBtn('errors', 'Errors', errorRows.length)}
          <span className="ml-auto text-[12px] text-[#9099ab] pb-2">Tip: click any cell to edit before importing</span>
        </div>

        {effTab === 'existing' && changedExisting.length > 0 && (
          <p className="mt-3 text-[12px] text-[#9099ab]">Tick the dishes you want to overwrite with the file's values. Unticked dishes keep their current version.</p>
        )}

        <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden mb-2">
          <div className="max-h-[240px] overflow-y-auto">
            {effTab === 'errors' ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0"><tr>
                  <th className={cx(th, 'w-10')}>Row</th><th className={th}>Name (EN)</th><th className={th}>Name (AR)</th><th className={th}>Section</th><th className={th}>Allergens</th><th className={th}>Status</th><th className={cx(th, 'w-16')}>Result</th>
                </tr></thead>
                <tbody>
                  {errorRows.length === 0 && <tr><td className={td} colSpan={7}><span className="text-[#157f5c]">All errors fixed — nothing left to correct. 🎉</span></td></tr>}
                  {errorRows.map((r) => editableRow(r))}
                </tbody>
              </table>
            ) : effTab === 'existing' ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0"><tr>
                  <th className={th}>Dish</th><th className={th}>Current</th><th className={th}>Imported</th>
                  <th className={cx(th, 'w-28')}>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={allChangedUpdate} onChange={(ev) => setAllDecisions(ev.target.checked ? 'update' : 'keep')} className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] cursor-pointer" />
                      Select all
                    </label>
                  </th>
                </tr></thead>
                <tbody>
                  {existingRows.filter((e) => e.changed).length === 0 && (
                    <tr><td className={td} colSpan={4}><span className="text-[#157f5c]">All {existingRows.length} matched dishes are identical — nothing to change.</span></td></tr>
                  )}
                  {existingRows.filter((e) => e.changed).map((e) => {
                    const dec = decisionFor(e.row.rowNum, e.changed);
                    const cur = `${(e.ex.allergens || []).join(' + ') || 'None'} · ${e.ex.section} · ${e.ex.on ? 'Active' : 'Inactive'}`;
                    const imp = `${e.row.allergens.join(' + ') || 'None'} · ${e.row.section} · ${e.row.on ? 'Active' : 'Inactive'}`;
                    return (
                      <tr key={e.row.rowNum} className="border-b border-gray-100">
                        <td className={td}><div className="font-medium">{e.row.en}</div><div className="text-[11px] text-gray-400">Row {e.row.rowNum}</div></td>
                        <td className={cx(td, 'text-[#5d6678]', dec !== 'update' && 'font-medium text-[#16274D]')}>{cur}</td>
                        <td className={cx(td, dec === 'update' ? 'text-[#96650a] font-medium' : 'text-gray-400 line-through')}>{imp}</td>
                        <td className={td}>
                          <select
                            value={dec}
                            onChange={(ev) => setDecisions((m) => ({ ...m, [e.row.rowNum]: ev.target.value as 'update' | 'keep' }))}
                            className={cx(
                              'px-2.5 py-1 rounded-lg border text-[12.5px] font-medium cursor-pointer focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] outline-none',
                              dec === 'update' ? 'border-[#4EBEE3] text-[#0a7c9e] bg-[#4EBEE3]/5' : 'border-[#e7e9f0] text-[#5d6678] bg-white'
                            )}
                          >
                            <option value="update">Update</option>
                            <option value="keep">Keep</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0"><tr>
                  <th className={cx(th, 'w-10')}>Row</th><th className={th}>Name (EN)</th><th className={th}>Name (AR)</th><th className={th}>Section</th><th className={th}>Allergens</th><th className={th}>Status</th><th className={cx(th, 'w-16')}>Result</th>
                </tr></thead>
                <tbody>
                  {(effTab === 'new' ? newRows : rows).length === 0 && <tr><td className={td} colSpan={7}><span className="text-gray-400">{effTab === 'new' ? 'No new dishes in the file.' : 'No rows found in the file.'}</span></td></tr>}
                  {(effTab === 'new' ? newRows : rows).map((r) => editableRow(r, strategy === 'add'))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {hasErrors && (
          <label className="mt-2 mb-4 flex items-center gap-2.5 rounded-xl bg-[#fbf7e8] px-4 py-3 cursor-pointer">
            <input type="checkbox" checked={skipInvalid} onChange={(e) => setSkipInvalid(e.target.checked)} className="w-4 h-4 rounded accent-[#4EBEE3]" />
            <span className="text-[13px] text-[#5d6678]">Skip these {errorRows.length} invalid rows and import the {valid.length} valid rows. Add the skipped rows later using the error report.</span>
          </label>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#eef0f4] p-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button onClick={reset} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Change file</button>
          {hasErrors && (
            <button onClick={() => download('careinn-error-report.csv', errorReportCsv(errorRows))} className="h-[38px] px-4 inline-flex items-center gap-2 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">
              <Download size={15} /> Download error report
            </button>
          )}
        </div>
        <button
          onClick={primaryImport}
          disabled={hasErrors && !skipInvalid}
          className={`h-[38px] px-5 rounded-[10px] text-[14px] font-medium text-white transition-colors ${hasErrors && !skipInvalid ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#4EBEE3] hover:bg-[#3da5ca] cursor-pointer'}`}
        >
          {hasErrors
            ? `Import ${newRows.length + updates.length} valid rows`
            : updates.length > 0
              ? `Continue · ${newRows.length} new + ${updates.length} updates`
              : `Import ${newRows.length} dish${newRows.length === 1 ? '' : 'es'}`}
        </button>
      </div>

      {/* Confirm updates (nested) */}
      {confirmOpen && (
        <div className="absolute inset-0 bg-[#16274D]/40 flex items-center justify-center rounded-2xl" onClick={() => setConfirmOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#fbf1de] text-[#96650a] flex items-center justify-center text-[24px] font-bold">!</div>
              <h3 className="text-[18px] font-semibold text-[#16274D] mt-3">Confirm updates</h3>
              <p className="text-[13px] text-[#5d6678] mt-1">{updates.length} existing dishes have changes selected. They will be updated together with {newRows.length} new dishes.</p>
            </div>
            <div className="mt-4 rounded-xl border border-[#e7e9f0] divide-y divide-[#eef1f6] text-[13px]">
              <div className="flex justify-between px-4 py-2.5"><span className="text-[#5d6678]">Existing dishes updated</span><span className="font-semibold text-[#16274D]">{updates.length}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-[#5d6678]">Existing dishes kept</span><span className="font-semibold text-[#16274D]">{keeps.length}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-[#5d6678]">New dishes added</span><span className="font-semibold text-[#16274D]">{newRows.length}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-[#5d6678]">Photos and menu-set assignments</span><span className="font-semibold text-[#157f5c]">Kept unchanged</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <button onClick={() => setConfirmOpen(false)} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] text-[14px] font-medium text-[#19233a] hover:bg-[#f7f8fb] cursor-pointer">Back to review</button>
              <button onClick={runImport} className="h-[38px] px-5 rounded-[10px] bg-[#4EBEE3] hover:bg-[#3da5ca] text-white text-[14px] font-medium cursor-pointer">Update {updates.length} and import {newRows.length}</button>
            </div>
          </div>
        </div>
      )}
    </>
  ));
}

// tiny classnames helper (local, avoids importing from foodAtoms)
function cx(...a: (string | false | undefined)[]) { return a.filter(Boolean).join(' '); }

function errorReportCsv(errorRows: ParsedRow[]): string {
  const lines = ['row,dish,field,imported_value,how_to_fix'];
  errorRows.forEach((r) => r.errors.forEach((e) => {
    lines.push([r.rowNum, `"${r.en || 'Unnamed dish'}"`, e.field, `"${e.value}"`, `"${e.fix}"`].join(','));
  }));
  return lines.join('\n');
}
function importReportCsv(result: { added: number; updated: number; kept: number; skipped: number; libraryTotal: number }): string {
  return ['metric,count', `Added,${result.added}`, `Updated,${result.updated}`, `Kept unchanged,${result.kept}`, `Invalid skipped,${result.skipped}`, `Library total,${result.libraryTotal}`].join('\n');
}
