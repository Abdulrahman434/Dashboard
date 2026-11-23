/**
 * The whole lucide library keyed by its official kebab-case names. Imported
 * only through loadAllIcons() (dynamic import), so it ships as its own chunk
 * that loads when the icon picker opens — the dashboard's main bundle is unchanged.
 *
 * lucideIconNames.json is generated from node_modules/lucide-react/dist/esm/icons
 * (one file per official name). Regenerate after upgrading lucide-react; the
 * patient app should use the same lucide version.
 */
import { icons, type LucideIcon } from 'lucide-react';
import names from './lucideIconNames.json';

const toPascal = (kebab: string) => kebab.replace(/(\w)(\w*)(_|-|\s*)/g, (_m, a: string, b: string) => a.toUpperCase() + b.toLowerCase());

export const ALL_ICONS: Record<string, LucideIcon> = {};
const seen = new Set<LucideIcon>();
for (const n of names as string[]) {
  const C = (icons as Record<string, LucideIcon>)[toPascal(n)];
  if (C && !seen.has(C)) {
    seen.add(C); // first (canonical) name wins over aliases
    ALL_ICONS[n] = C;
  }
}
