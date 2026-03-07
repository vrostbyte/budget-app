/**
 * Application-wide constants — ported from legacy app.js v3.3.1
 */

// ============================================================
// Default Categories
// Matches the default category list from the legacy app's loadData() fallback.
// ============================================================
export const DEFAULT_CATEGORIES = [
  'Charity/Donations',
  'Childcare',
  'Debt Payments',
  'Dining Out/Takeout',
  'Education',
  'Entertainment',
  'Healthcare',
  'Hobbies/Recreation',
  'Housing',
  'Insurance',
  'Personal Care',
  'Pets',
  'Savings/Investments',
  'Subscriptions/Memberships',
  'Transportation',
  'Travel',
  'Utilities',
  'Misc/Other',
  'Credit Card Payment',
  'Student Loans',
];

// ============================================================
// Debt Types
// ============================================================
export const DEBT_TYPES = [
  'Credit Card',
  'Auto Loan',
  'Personal Loan',
  'Student Loan',
  'Mortgage',
  'Medical Debt',
  'Other',
];

// ============================================================
// Debt Type → Chart Color Map
// Used by DebtDonutChart (Recharts) and AssetEquityBars.
// ============================================================
export const DEBT_TYPE_COLORS = {
  'Credit Card':   '#fb7185', // rose-400
  'Medical Debt':  '#f97316', // orange-500
  'Personal Loan': '#fbbf24', // amber-400
  'Student Loan':  '#34d399', // emerald-400
  'Auto Loan':     '#22d3ee', // cyan-400
  'Mortgage':      '#3b82f6', // blue-500
  'Other':         '#94a3b8', // slate-400
};

// ============================================================
// Income Frequencies
// ============================================================
export const INCOME_FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'];

// ============================================================
// Projection Length Range
// ============================================================
export const PROJECTION_LENGTH_MIN = 1;
export const PROJECTION_LENGTH_MAX = 12;
