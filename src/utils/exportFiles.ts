/** Shared helpers for CSV / file exports. */

export type CsvCell = string | number | null | undefined;

/**
 * Make a cell safe against spreadsheet formula injection: text that starts with
 * =, +, -, @, tab or CR gets a leading apostrophe so Excel/Sheets treat it as text.
 */
export function neutraliseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Convert one cell to its CSV text (RFC-4180 quoting, formula-safe). Numbers are left as-is. */
function csvCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  const text = typeof cell === 'number' ? String(cell) : neutraliseFormula(cell);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Build CSV text from rows: comma separated, CRLF line endings, RFC-4180 quoting
 * (cells with commas, quotes or newlines are quoted, quotes doubled), formula-injection safe.
 * The UTF-8 BOM is added by `downloadFile`/`CSV_BOM`, not here.
 */
export function toCsv(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/** UTF-8 byte order mark so Excel detects UTF-8 (needed for Arabic text). */
export const CSV_BOM = '﻿';

/** Trigger a browser download of `content` (string or Blob) as `name`. */
export function downloadFile(name: string, content: string | Blob, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download rows as an Excel-friendly CSV (UTF-8 with BOM). */
export function downloadCsv(name: string, rows: CsvCell[][]): void {
  downloadFile(name, CSV_BOM + toCsv(rows), 'text/csv;charset=utf-8');
}

/** Local date as YYYY-MM-DD. */
export function localDateStamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Local date-time as `YYYY-MM-DD HH:mm` (ISO-like, local time). */
export function localDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${localDateStamp(d)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Make a string safe for use in a file name. */
export function slugForFile(s: string): string {
  return s.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'export';
}
