/**
 * Formatting utilities — date-fns for dates, standard Intl for currency.
 * Do NOT import React here — this file is framework-agnostic.
 */
import { format, parseISO } from 'date-fns';

// ============================================================
// Currency
// ============================================================

/**
 * Format a number as US currency string.
 * @param {number} n
 * @returns {string}  e.g. "$1,234.56"
 */
export function formatCurrency(n) {
  const num = typeof n === 'number' ? n : parseFloat(n) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ============================================================
// Dates
// ============================================================

/**
 * Format a Date object or ISO string for display in the ledger.
 * e.g. "Mon, Mar 10, 2025"
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return format(d, 'EEE, MMM d, yyyy');
}

/**
 * Format a Date object as "MMM yyyy" (e.g. "Mar 2025").
 * Used for lowest-balance-by-month display.
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function formatMonthYear(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return format(d, 'MMMM yyyy');
}

/**
 * Format a "YYYY-MM-DD" string for display (e.g. "Mon, Mar 10, 2025").
 *
 * @param {string} dateStr  "YYYY-MM-DD"
 * @returns {string}
 */
export function formatDateString(dateStr) {
  if (!dateStr) return '';
  // parseISO is timezone-safe for date-only strings when used with date-fns
  return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
}

// ============================================================
// Payoff Display
// (mirror of formatPayoffMonths in engine.js for use in formatter contexts)
// ============================================================

/**
 * Format payoff months for display.
 * Infinity → "Never", 0 → "Paid", else "X yr Y mo"
 *
 * @param {number} months
 * @returns {string}
 */
export function formatPayoffMonths(months) {
  if (months === Infinity || isNaN(months)) return 'Never';
  if (months <= 0) return 'Paid';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${months} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}

// ============================================================
// Filename timestamp (used by fileIO)
// ============================================================

/**
 * Returns a timestamp string for filenames: "20250310_143022"
 * @returns {string}
 */
export function getCurrentDateTimeString() {
  return format(new Date(), 'yyyyMMdd_HHmmss');
}
