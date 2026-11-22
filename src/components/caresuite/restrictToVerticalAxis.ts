import type { Modifier } from '@dnd-kit/core';

/** Lock drags to the vertical axis (same as @dnd-kit/modifiers, which isn't installed). */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });
