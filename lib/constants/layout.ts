import { DESKTOP_BREAKPOINT } from '@/lib/constants/breakpoints';

/** Horizontal padding for shell + top nav (mobile), in px. */
export const SHELL_PADDING_X_MOBILE = 24;

/** Horizontal padding for shell + top nav (desktop), in px. */
export const SHELL_PADDING_X_DESKTOP = 40;

export function shellHorizontalPadding(screenWidth: number): number {
  return screenWidth >= DESKTOP_BREAKPOINT ? SHELL_PADDING_X_DESKTOP : SHELL_PADDING_X_MOBILE;
}
