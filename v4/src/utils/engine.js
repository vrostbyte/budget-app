/**
 * Budget Calculation Engine
 * Framework-agnostic pure functions — no React imports.
 * Ported from legacy app.js v3.3.1
 */

// ============================================================
// Rounding
// ============================================================

/**
 * Round to 2 decimal places to fix floating-point precision issues.
 */
export function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

// ============================================================
// Safe Math Expression Parser
// Replaces legacy new Function() eval with a recursive-descent parser.
// Supports: +, -, *, /, (), decimal numbers, $ sign (stripped).
// ============================================================

export function parseMathExpression(rawValue) {
  let cleaned = String(rawValue).replace(/\$/g, '');
  cleaned = cleaned.replace(/[^0-9+\-*\\/().]/g, '');
  if (!cleaned) return 0;

  let pos = 0;

  function parseExpr() {
    let left = parseTerm();
    while (pos < cleaned.length && (cleaned[pos] === '+' || cleaned[pos] === '-')) {
      const op = cleaned[pos++];
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (pos < cleaned.length && (cleaned[pos] === '*' || cleaned[pos] === '/')) {
      const op = cleaned[pos++];
      const right = parseFactor();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parseFactor() {
    // Unary minus
    if (cleaned[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    // Parenthesized expression
    if (cleaned[pos] === '(') {
      pos++; // consume '('
      const val = parseExpr();
      if (pos < cleaned.length && cleaned[pos] === ')') pos++; // consume ')'
      return val;
    }
    // Number literal
    const start = pos;
    while (pos < cleaned.length && /[0-9.]/.test(cleaned[pos])) pos++;
    const numStr = cleaned.slice(start, pos);
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  }

  try {
    const result = parseExpr();
    if (typeof result !== 'number' || isNaN(result)) return 0;
    return roundToCents(result);
  } catch (err) {
    console.warn('Failed to parse math expression:', rawValue);
    return roundToCents(parseFloat(rawValue) || 0);
  }
}

// ============================================================
// Date Utilities
// ============================================================

/**
 * Parse a "YYYY-MM-DD" string into a local Date object (avoids timezone shift).
 */
export function parseDateInput(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Generate a unique ID. Uses crypto.randomUUID if available.
 */
export function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ============================================================
// Bill / Debt Helpers
// ============================================================

/**
 * Returns the effective amount for a bill:
 * if linked to a debt, use the debt's actualPayment; otherwise use bill.amount.
 *
 * @param {object} bill
 * @param {object[]} debtEntries
 */
export function getBillEffectiveAmount(bill, debtEntries) {
  if (!bill.linkedDebtId) return bill.amount;
  const debt = debtEntries.find(d => d.id === bill.linkedDebtId);
  return debt ? debt.actualPayment : bill.amount;
}

// ============================================================
// Date-Matching Helpers
// ============================================================

/**
 * Returns true if an income entry should trigger on the given date.
 * Handles Weekly, Bi-weekly, Monthly (with end-of-month fallback), and One-time.
 *
 * @param {object} income  — must have .startDate ("YYYY-MM-DD"), .frequency
 * @param {Date}   date
 */
export function isIncomeOnDate(income, date) {
  const incomeStartDate = parseDateInput(income.startDate);
  if (incomeStartDate > date) return false;

  const diffTime = date - incomeStartDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  switch (income.frequency) {
    case 'Weekly':
      return diffDays % 7 === 0;

    case 'Bi-weekly':
      return diffDays % 14 === 0;

    case 'Monthly': {
      const incomeDay = incomeStartDate.getDate();
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      if (incomeDay > lastDayOfMonth) {
        return date.getDate() === lastDayOfMonth;
      }
      return incomeDay === date.getDate();
    }

    case 'One-time':
      return incomeStartDate.toDateString() === date.toDateString();

    default:
      return false;
  }
}

/**
 * Returns true if a bill (with integer day-of-month) should trigger on the given date.
 * Bills set to the 31st trigger on the last day of shorter months.
 *
 * @param {object} bill — must have .date (integer 1–31)
 * @param {Date}   date
 */
export function isBillOnDate(bill, date) {
  const billDay = bill.date;
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  if (billDay > lastDayOfMonth) {
    return date.getDate() === lastDayOfMonth;
  }
  return billDay === date.getDate();
}

/**
 * Returns true if an adhoc expense falls on the given date.
 *
 * @param {object} expense — must have .date ("YYYY-MM-DD")
 * @param {Date}   date
 */
export function isAdhocExpenseOnDate(expense, date) {
  const expenseDate = parseDateInput(expense.date);
  return expenseDate.toDateString() === date.toDateString();
}

/**
 * Collects all event names (bill names, income names, adhoc expense names) for a given date.
 * Returns them as a " + " joined string.
 *
 * @param {Date}     date
 * @param {object}   state  — must contain { bills, incomeEntries, adhocExpenses }
 */
export function getEventsForDate(date, state) {
  const { bills = [], incomeEntries = [], adhocExpenses = [] } = state;
  const events = [];

  bills.forEach(bill => {
    if (isBillOnDate(bill, date)) events.push(bill.name);
  });
  incomeEntries.forEach(income => {
    if (isIncomeOnDate(income, date)) events.push(income.name);
  });
  adhocExpenses.forEach(expense => {
    if (isAdhocExpenseOnDate(expense, date)) events.push(expense.name);
  });

  return events.join(' + ');
}

// ============================================================
// Core Projection Engine
// ============================================================

/**
 * The heart of the app. Iterates day-by-day from startDate to
 * startDate + projectionLength months, computing running balance.
 *
 * @param {object} state — full store data state
 * @returns {Array<{date: Date, event: string, dailyNet: number, balance: number}>}
 */
export function calculateRunningTotals(state) {
  const {
    bills = [],
    incomeEntries = [],
    adhocExpenses = [],
    runningBudgetAdjustments = [],
    debtEntries = [],
    accountBalance = 0,
    startDate,
    projectionLength = 1,
  } = state;

  if (!startDate) return [];

  let currentDate = new Date(startDate);
  const runningTotals = [];
  let currentBalance = accountBalance;

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + projectionLength);

  while (currentDate <= endDate) {
    // --- Income ---
    let dailyIncome = 0;
    incomeEntries.forEach(income => {
      if (isIncomeOnDate(income, currentDate)) {
        dailyIncome += income.amount;
      }
    });

    // --- Expenses ---
    let dailyExpenses = 0;
    bills.forEach(bill => {
      if (isBillOnDate(bill, currentDate)) {
        dailyExpenses += getBillEffectiveAmount(bill, debtEntries);
      }
    });
    adhocExpenses.forEach(expense => {
      if (isAdhocExpenseOnDate(expense, currentDate)) {
        dailyExpenses += expense.amount;
      }
    });

    let dailyNet = roundToCents(dailyIncome - dailyExpenses);

    // --- Running Budget Adjustment override ---
    const adjustment = runningBudgetAdjustments.find(adj => {
      const adjDate = parseDateInput(adj.date);
      return adjDate.toDateString() === currentDate.toDateString();
    });

    let eventDescription = getEventsForDate(currentDate, { bills, incomeEntries, adhocExpenses });

    if (adjustment) {
      if (adjustment.amount !== undefined) {
        dailyNet = roundToCents(adjustment.amount);
        currentBalance =
          (runningTotals.length > 0
            ? runningTotals[runningTotals.length - 1].balance
            : accountBalance) + dailyNet;
      }
      if (adjustment.event) {
        eventDescription = adjustment.event;
      }
    } else {
      currentBalance += dailyNet;
    }

    currentBalance = roundToCents(currentBalance);

    runningTotals.push({
      date: new Date(currentDate),
      event: eventDescription,
      dailyNet,
      balance: currentBalance,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return runningTotals;
}

// ============================================================
// Debt / Payoff Calculations
// ============================================================

/**
 * Standard amortization formula: n = -log(1 - (r*P/M)) / log(1+r)
 * Returns Infinity if the payment never covers interest or balance ≤ 0.
 *
 * @param {number} balance
 * @param {number} apr         — annual percentage rate (e.g. 22.99)
 * @param {number} monthlyPayment
 * @returns {number}           — months to payoff (ceil), or Infinity
 */
export function calculatePayoffMonths(balance, apr, monthlyPayment) {
  if (monthlyPayment <= 0 || balance <= 0) return Infinity;

  const monthlyRate = apr / 100 / 12;
  const monthlyInterest = balance * monthlyRate;

  if (monthlyPayment <= monthlyInterest) return Infinity;

  // 0% APR — simple division
  if (apr === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const months =
    -Math.log(1 - (monthlyRate * balance) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Format payoff months for display.
 * Infinity → "Never", 0 → "Paid", else "X yr Y mo" or "Y mo"
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
// Chart Calculation Helpers
// ============================================================

/**
 * Calculate total expense per bill/adhoc name over the projection period.
 *
 * @param {object} state
 * @returns {object}  { [name]: totalAmount }
 */
export function calculateTotalExpenses(state) {
  const { bills = [], adhocExpenses = [], debtEntries = [], projectionLength = 1 } = state;
  const expenseTotals = {};

  bills.forEach(bill => {
    const key = bill.name;
    expenseTotals[key] = roundToCents(
      (expenseTotals[key] || 0) + getBillEffectiveAmount(bill, debtEntries) * projectionLength
    );
  });
  adhocExpenses.forEach(expense => {
    const key = expense.name;
    expenseTotals[key] = roundToCents((expenseTotals[key] || 0) + expense.amount);
  });

  return expenseTotals;
}

/**
 * Calculate total expense per category over the projection period.
 *
 * @param {object} state
 * @returns {object}  { [category]: totalAmount }
 */
export function calculateExpensesByCategory(state) {
  const { bills = [], adhocExpenses = [], debtEntries = [], projectionLength = 1 } = state;
  const categoryTotals = {};

  bills.forEach(bill => {
    const category = bill.category || 'Misc/Other';
    categoryTotals[category] = roundToCents(
      (categoryTotals[category] || 0) + getBillEffectiveAmount(bill, debtEntries) * projectionLength
    );
  });
  adhocExpenses.forEach(expense => {
    const category = expense.category || 'Misc/Other';
    categoryTotals[category] = roundToCents((categoryTotals[category] || 0) + expense.amount);
  });

  return categoryTotals;
}
