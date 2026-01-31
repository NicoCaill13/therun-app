/**
 * Date formatting utilities.
 * Centralized date formatting functions to ensure consistency across the app.
 */

/**
 * Format options for date display.
 */
interface FormatEventDateOptions {
  /**
   * Whether to include the year in the formatted date.
   * @default false for today/tomorrow, true for other dates only when year differs
   */
  includeYear?: boolean;
}

/**
 * Formats an event date string into a human-readable format.
 * Handles "today", "tomorrow" special cases.
 * 
 * @param dateString - ISO 8601 date string
 * @param options - Formatting options
 * @returns Formatted date string in French locale
 * 
 * @example
 * formatEventDate('2026-01-31T14:00:00Z') // "Aujourd'hui a 14:00"
 * formatEventDate('2026-02-01T10:00:00Z') // "Demain a 10:00"
 * formatEventDate('2026-02-15T09:00:00Z') // "samedi 15 fevrier a 09:00"
 */
export function formatEventDate(dateString: string, options?: FormatEventDateOptions): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const time = date.toLocaleTimeString('fr-FR', timeOptions);

  if (isToday) {
    return `Aujourd'hui a ${time}`;
  }

  if (isTomorrow) {
    return `Demain a ${time}`;
  }

  const includeYear = options?.includeYear ?? (date.getFullYear() !== now.getFullYear());

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(includeYear && { year: 'numeric' }),
  };

  const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
  return `${formattedDate} a ${time}`;
}

/**
 * Formats a completed date into a simple date string.
 * Used for displaying when an event was completed/closed.
 * 
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string in French locale
 * 
 * @example
 * formatCompletedDate('2026-01-30T15:00:00Z') // "30 janvier 2026"
 */
export function formatCompletedDate(dateString: string): string {
  const date = new Date(dateString);
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('fr-FR', dateOptions);
}

/**
 * Formats a date to show only the time.
 * 
 * @param dateString - ISO 8601 date string
 * @returns Formatted time string in French locale
 * 
 * @example
 * formatTime('2026-01-31T14:30:00Z') // "14:30"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Checks if a date is in the past.
 * 
 * @param dateString - ISO 8601 date string
 * @returns True if the date is before now
 */
export function isDateInPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Checks if a date is today.
 * 
 * @param dateString - ISO 8601 date string
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
  return new Date(dateString).toDateString() === new Date().toDateString();
}

/**
 * Checks if a date is tomorrow.
 * 
 * @param dateString - ISO 8601 date string
 * @returns True if the date is tomorrow
 */
export function isTomorrow(dateString: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(dateString).toDateString() === tomorrow.toDateString();
}
