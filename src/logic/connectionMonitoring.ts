/**
 * Utilities for connection status monitoring and interval management.
 */

// Connection check interval constraints (in seconds)
export const MIN_CHECK_INTERVAL = 30;
export const MAX_CHECK_INTERVAL = 300;
export const DEFAULT_CHECK_INTERVAL = 60;

/**
 * Clamps the connection check interval to valid bounds.
 * Ensures interval stays between MIN and MAX, defaults to DEFAULT if invalid.
 *
 * @param value - The interval value to validate (in seconds)
 * @returns Clamped interval value between MIN_CHECK_INTERVAL and MAX_CHECK_INTERVAL
 */
export function clampCheckInterval(value: number): number {
  // Guard: Return default for invalid numbers
  if (isNaN(value) || !isFinite(value)) {
    return DEFAULT_CHECK_INTERVAL;
  }

  // Clamp to valid range
  return Math.max(MIN_CHECK_INTERVAL, Math.min(MAX_CHECK_INTERVAL, value));
}

/**
 * Converts milliseconds to seconds.
 *
 * @param ms - Milliseconds value
 * @returns Seconds value
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Converts seconds to milliseconds.
 *
 * @param seconds - Seconds value
 * @returns Milliseconds value
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Determines if connection checks should run based on app visibility.
 * Checks are paused when the app is minimized or hidden.
 *
 * @param visibilityState - The document.visibilityState value
 * @returns true if checks should run, false if paused
 */
export function shouldRunConnectionCheck(
  visibilityState: DocumentVisibilityState,
): boolean {
  return visibilityState === "visible";
}
