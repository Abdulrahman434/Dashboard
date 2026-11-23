/**
 * How the stored presets look. The patient app should map the same names to
 * its own values; these are the dashboard preview's equivalents. Sizes are
 * relative (em) so content scales with the screen's base font size.
 */
import type { Align, LineHeight, Size, Spacing, Tone } from '../../../services/hospitalProfileService';

export const SIZE_EM: Record<Size, string> = { sm: '0.875em', md: '1em', lg: '1.25em', xl: '1.6em' };
export const SIZE_LABEL: Record<Size, string> = { sm: 'Small', md: 'Normal', lg: 'Large', xl: 'Heading' };

export const TONE_LABEL: Record<Tone, string> = { text: 'Text', muted: 'Muted', brand: 'Brand', alert: 'Alert red', success: 'Green' };
export const toneColor = (tone: Tone, brand: string): string =>
  ({ text: '#16274D', muted: '#6B7280', brand, alert: '#E5484D', success: '#1F9E75' })[tone];

export const LINE_HEIGHT: Record<LineHeight, number> = { tight: 1.3, normal: 1.6, relaxed: 1.9 };
export const LINE_HEIGHT_LABEL: Record<LineHeight, string> = { tight: 'Compact', normal: 'Normal', relaxed: 'Relaxed' };

/** Space after a paragraph or list. */
export const SPACING_EM: Record<Spacing, string> = { none: '0', sm: '0.4em', md: '0.9em', lg: '1.5em' };
export const SPACING_LABEL: Record<Spacing, string> = { none: 'None', sm: 'Small', md: 'Medium', lg: 'Large' };

export const ALIGN_LABEL: Record<Align, string> = { start: 'Align to start', center: 'Centre', end: 'Align to end' };
