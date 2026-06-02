/**
 * ThemeContext (dashboard shim)
 * --------------------------------------------------------------------------
 * The bedside UI was ported from the CareInn kiosk app, which used a large
 * multi-hospital ThemeContext. The dashboard only needs one theme whose tokens
 * match the dashboard design system (CareInn blue #4EBEE3, navy #16274D,
 * Poppins). This shim exposes the same useTheme()/TEXT_STYLE surface the ported
 * components rely on.
 */

export const TYPE_SCALE = {
  sm: "14px",
  base: "18px",
  md: "22px",
  lg: "26px",
  xl: "30px",
  "2xl": "34px",
} as const;

export const WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const LEADING = {
  none: 1.0,
  tight: 1.1,
  compact: 1.2,
  snug: 1.3,
  normal: 1.5,
} as const;

export const TEXT_STYLE = {
  pageTitle: { fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, lineHeight: LEADING.snug, letterSpacing: "-0.3px" },
  sectionTitle: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.snug, letterSpacing: "-0.2px" },
  cardTitle: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.compact, letterSpacing: "0px" },
  subtitle: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.compact, letterSpacing: "0px" },
  body: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.normal, lineHeight: LEADING.normal, letterSpacing: "0px" },
  bodyEmphasis: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.normal, letterSpacing: "0px" },
  label: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: LEADING.snug, letterSpacing: "0.2px" },
  caption: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, lineHeight: LEADING.compact, letterSpacing: "0px" },
  micro: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: LEADING.none, letterSpacing: "0.3px" },
  pill: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: 1.2, letterSpacing: "0px" },
  button: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.none, letterSpacing: "0px" },
  buttonSm: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.none, letterSpacing: "0px" },
  helper: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.normal, lineHeight: LEADING.compact, letterSpacing: "0px" },
  display: { fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, lineHeight: LEADING.tight, letterSpacing: "-0.5px" },
} as const;

const FONT = "'Poppins', sans-serif";

export const dashboardTheme = {
  id: "careinn-dashboard",
  fontFamily: FONT,
  fontFamilyAr: "'Almarai', 'Poppins', sans-serif",
  fontFamilyMono: "'Roboto Mono', monospace",

  primary: "#4EBEE3",
  primaryDark: "#3DA5CA",
  primaryLight: "#7FD2EC",
  primarySubtle: "rgba(78,190,227,0.10)",

  accent: "#16274D",
  accentSubtle: "rgba(22,39,77,0.06)",

  background: "#F4F6F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",
  panelBg: "rgba(255,255,255,0.9)",

  textHeading: "#16274D",
  textBody: "#374151",
  textNormal: "#16274D",
  textMuted: "#6B7280",
  textDisabled: "#9CA3AF",
  textInverse: "#FFFFFF",
  textInverseMuted: "rgba(255,255,255,0.72)",

  borderDefault: "#E5E7EB",
  borderSubtle: "#F1F5F9",

  success: "#22C55E",
  successSubtle: "rgba(34,197,94,0.10)",
  error: "#EF4444",
  errorSubtle: "rgba(239,68,68,0.10)",
  warning: "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.10)",

  radiusSm: "8px",
  radiusMd: "12px",
  radiusLg: "16px",
  radiusFull: "9999px",
} as const;

export type Theme = typeof dashboardTheme;

/** Same shape the ported components consume: const { theme } = useTheme(). */
export function useTheme() {
  return { theme: dashboardTheme, locale: "en" as const };
}