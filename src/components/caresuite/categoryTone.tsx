/**
 * Category colour on the patient screen. A category stores only a tone
 * ("primary" | "alert"); "primary" resolves to the client's brand colour from
 * Identity Settings, so a rebrand needs no category edits. The shading around
 * icons (circle, card wash) is derived from that one colour in code — this is
 * the same recipe the patient app should use.
 */
import { useEffect, useState } from 'react';
import type { CategoryTone } from '../../services/careSuiteService';

const IDENTITY_KEY = 'careinn-identity-settings'; // written by IdentitySettingsPage
export const DEFAULT_PRIMARY = '#4EBEE3';
export const ALERT_RED = '#E5484D';

function readPrimary(): string {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    const c = raw ? JSON.parse(raw)?.primaryColor : null;
    return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : DEFAULT_PRIMARY;
  } catch {
    return DEFAULT_PRIMARY;
  }
}

/** The client's brand primary, kept in sync if Identity Settings change in another tab. */
export function useBrandPrimary(): string {
  const [c, setC] = useState(readPrimary);
  useEffect(() => {
    const on = () => setC(readPrimary());
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);
  return c;
}

export const toneColor = (tone: CategoryTone | undefined, primary: string) => (tone === 'alert' ? ALERT_RED : primary);

/** #rrggbb + alpha (0–1) → rgba() */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Icon in a tinted circle on a washed card top — the patient "icon card" look, at any size. */
export function ToneIconTile({ color, children, size = 56 }: { color: string; children: React.ReactNode; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: alpha(color, 0.12), boxShadow: `0 0 0 ${Math.round(size / 14)}px ${alpha(color, 0.06)}`, color }}
    >
      {children}
    </span>
  );
}
