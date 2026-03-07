/**
 * Zustand store — single source of truth for the v4.0 budget app.
 *
 * Data-state keys EXACTLY mirror the legacy JSON export schema:
 *   bills, incomeEntries, adhocExpenses, runningBudgetAdjustments,
 *   debtEntries, accountBalance, accountName, startDate,
 *   projectionLength, categories
 *
 * UI-state keys are excluded from exportData().
 */
import { create } from 'zustand';
import { roundToCents, generateId, getBillEffectiveAmount } from '../utils/engine.js';
import { DEFAULT_CATEGORIES } from '../utils/constants.js';

// ============================================================
// Sample data — v3.3.1 comprehensive set
// Dates are computed relative to "now" so the projection always
// starts in the current period, matching the legacy app behaviour.
// ============================================================
function buildSampleData() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat

  // Last Friday (for Bi-weekly paycheck A)
  const lastFriday = new Date(now);
  lastFriday.setDate(now.getDate() - ((dayOfWeek + 2) % 7));

  // Second Friday (for Bi-weekly paycheck B, one week later)
  const secondFriday = new Date(lastFriday);
  secondFriday.setDate(lastFriday.getDate() + 7);

  // First of current month (for Monthly income)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Tax refund: ~42 days from today
  const taxDate = new Date(now);
  taxDate.setDate(now.getDate() + 42);

  // Car registration: ~62 days from today
  const regDate = new Date(now);
  regDate.setDate(now.getDate() + 62);

  // Anniversary dinner: ~31 days from today
  const dinnerDate = new Date(now);
  dinnerDate.setDate(now.getDate() + 31);

  function fmt(d) {
    return d.toISOString().split('T')[0];
  }

  return {
    bills: [
      { name: 'Mortgage Payment',               date: 1,  amount: 1650.00, category: 'Housing',                  linkedDebtId: 'sample-debt-6' },
      { name: 'Health Insurance',               date: 1,  amount: 320.00,  category: 'Insurance',                linkedDebtId: null },
      { name: 'Childcare',                      date: 1,  amount: 850.00,  category: 'Childcare',                linkedDebtId: null },
      { name: 'Grocery Budget',                 date: 3,  amount: 600.00,  category: 'Groceries',                linkedDebtId: null },
      { name: 'Auto Loan Payment',              date: 5,  amount: 385.00,  category: 'Transportation',           linkedDebtId: 'sample-debt-3' },
      { name: 'Car Insurance',                  date: 5,  amount: 168.00,  category: 'Insurance',                linkedDebtId: null },
      { name: 'Internet',                       date: 8,  amount: 79.99,   category: 'Utilities',                linkedDebtId: null },
      { name: 'Credit Card Payment - Chase',    date: 10, amount: 150.00,  category: 'Debt Payments',            linkedDebtId: 'sample-debt-1' },
      { name: 'Electric Bill',                  date: 12, amount: 185.00,  category: 'Utilities',                linkedDebtId: null },
      { name: 'Credit Card Payment - Discover', date: 15, amount: 75.00,   category: 'Debt Payments',            linkedDebtId: 'sample-debt-2' },
      { name: 'Streaming Services',             date: 15, amount: 45.97,   category: 'Subscriptions/Memberships',linkedDebtId: null },
      { name: 'Water/Sewer',                    date: 18, amount: 75.00,   category: 'Utilities',                linkedDebtId: null },
      { name: 'Student Loan Payment',           date: 20, amount: 350.00,  category: 'Debt Payments',            linkedDebtId: 'sample-debt-4' },
      { name: 'Personal Loan Payment',          date: 22, amount: 150.00,  category: 'Debt Payments',            linkedDebtId: 'sample-debt-5' },
      { name: 'Phone Bill',                     date: 25, amount: 145.00,  category: 'Utilities',                linkedDebtId: null },
    ],
    incomeEntries: [
      { name: 'Paycheck - Primary',    amount: 1850.00, frequency: 'Bi-weekly', startDate: fmt(lastFriday)   },
      { name: 'Paycheck - Secondary',  amount: 1425.00, frequency: 'Bi-weekly', startDate: fmt(secondFriday) },
      { name: 'Side Business Revenue', amount: 400.00,  frequency: 'Monthly',   startDate: fmt(monthStart)   },
    ],
    adhocExpenses: [
      { name: 'Car Registration Renewal', date: fmt(regDate),    amount: 285.00, category: 'Transportation'    },
      { name: 'Anniversary Dinner',       date: fmt(dinnerDate), amount: 150.00, category: 'Dining Out/Takeout' },
    ],
    runningBudgetAdjustments: [
      { date: fmt(taxDate), amount: 2800.00, event: 'Tax Refund' },
    ],
    debtEntries: [
      { id: 'sample-debt-1', name: 'Chase Sapphire',      type: 'Credit Card',   balance: 6200.00,   apr: 22.99, minPayment: 124.00,  actualPayment: 150.00,  loanLength: 0,   assetValue: 0       },
      { id: 'sample-debt-2', name: 'Discover It',         type: 'Credit Card',   balance: 1450.00,   apr: 18.49, minPayment: 29.00,   actualPayment: 75.00,   loanLength: 0,   assetValue: 0       },
      { id: 'sample-debt-3', name: 'Auto Loan - Toyota',  type: 'Auto Loan',     balance: 18500.00,  apr: 5.49,  minPayment: 385.00,  actualPayment: 385.00,  loanLength: 60,  assetValue: 22000   },
      { id: 'sample-debt-4', name: 'Federal Student Loan',type: 'Student Loan',  balance: 32000.00,  apr: 4.99,  minPayment: 320.00,  actualPayment: 350.00,  loanLength: 120, assetValue: 0       },
      { id: 'sample-debt-5', name: 'Personal Loan - CU',  type: 'Personal Loan', balance: 4800.00,   apr: 9.99,  minPayment: 145.00,  actualPayment: 150.00,  loanLength: 36,  assetValue: 0       },
      { id: 'sample-debt-6', name: 'Home Mortgage',       type: 'Mortgage',      balance: 245000.00, apr: 6.75,  minPayment: 1590.00, actualPayment: 1650.00, loanLength: 360, assetValue: 310000  },
    ],
    accountBalance: 4250.00,
    accountName: 'Household Checking',
    startDate: new Date().toISOString(),
    projectionLength: 6,
    categories: [
      'Charity/Donations',
      'Childcare',
      'Debt Payments',
      'Dining Out/Takeout',
      'Education',
      'Entertainment',
      'Groceries',
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
    ],
  };
}

// ============================================================
// Default (empty) state
// ============================================================
const DEFAULT_STATE = {
  // --- DATA (exported) ---
  bills: [],
  incomeEntries: [],
  adhocExpenses: [],
  runningBudgetAdjustments: [],
  debtEntries: [],
  accountBalance: 0,
  accountName: '',
  startDate: null,
  projectionLength: 6,
  categories: [...DEFAULT_CATEGORIES],

  // --- UI (NOT exported) ---
  activeTab: 'dashboard',
  wizardOpen: false,
  wizardStep: 1,
};

// Keys that belong in the exported JSON (must match legacy schema exactly)
const EXPORT_KEYS = [
  'bills',
  'incomeEntries',
  'adhocExpenses',
  'runningBudgetAdjustments',
  'debtEntries',
  'accountBalance',
  'accountName',
  'startDate',
  'projectionLength',
  'categories',
];

// ============================================================
// Store
// ============================================================
const useBudgetStore = create((set, get) => ({
  ...DEFAULT_STATE,

  // ──────────────────────────────────────────────────────────
  // BILLS
  // ──────────────────────────────────────────────────────────
  addBill: (bill) =>
    set(state => ({ bills: [...state.bills, bill] })),

  updateBill: (index, bill) =>
    set(state => {
      const bills = [...state.bills];
      bills[index] = bill;
      return { bills };
    }),

  deleteBill: (index) =>
    set(state => ({ bills: state.bills.filter((_, i) => i !== index) })),

  // ──────────────────────────────────────────────────────────
  // INCOME ENTRIES
  // ──────────────────────────────────────────────────────────
  addIncome: (income) =>
    set(state => ({ incomeEntries: [...state.incomeEntries, income] })),

  updateIncome: (index, income) =>
    set(state => {
      const incomeEntries = [...state.incomeEntries];
      incomeEntries[index] = income;
      return { incomeEntries };
    }),

  deleteIncome: (index) =>
    set(state => ({ incomeEntries: state.incomeEntries.filter((_, i) => i !== index) })),

  // ──────────────────────────────────────────────────────────
  // ADHOC EXPENSES
  // ──────────────────────────────────────────────────────────
  addAdhoc: (expense) =>
    set(state => ({ adhocExpenses: [...state.adhocExpenses, expense] })),

  updateAdhoc: (index, expense) =>
    set(state => {
      const adhocExpenses = [...state.adhocExpenses];
      adhocExpenses[index] = expense;
      return { adhocExpenses };
    }),

  deleteAdhoc: (index) =>
    set(state => ({ adhocExpenses: state.adhocExpenses.filter((_, i) => i !== index) })),

  // ──────────────────────────────────────────────────────────
  // RUNNING BUDGET ADJUSTMENTS
  // ──────────────────────────────────────────────────────────
  addAdjustment: (adjustment) =>
    set(state => ({
      runningBudgetAdjustments: [...state.runningBudgetAdjustments, adjustment],
    })),

  updateAdjustment: (index, adjustment) =>
    set(state => {
      const runningBudgetAdjustments = [...state.runningBudgetAdjustments];
      runningBudgetAdjustments[index] = adjustment;
      return { runningBudgetAdjustments };
    }),

  deleteAdjustment: (index) =>
    set(state => ({
      runningBudgetAdjustments: state.runningBudgetAdjustments.filter((_, i) => i !== index),
    })),

  // ──────────────────────────────────────────────────────────
  // DEBT ENTRIES
  // ──────────────────────────────────────────────────────────
  addDebt: (debt) =>
    set(state => ({
      debtEntries: [...state.debtEntries, { ...debt, id: debt.id || generateId() }],
    })),

  updateDebt: (index, debt) =>
    set(state => {
      const debtEntries = [...state.debtEntries];
      debtEntries[index] = debt;
      // Sync any bills linked to this debt
      const updatedBills = state.bills.map(bill => {
        if (bill.linkedDebtId === debt.id) {
          return { ...bill, amount: debt.actualPayment };
        }
        return bill;
      });
      return { debtEntries, bills: updatedBills };
    }),

  deleteDebt: (index) =>
    set(state => {
      const debt = state.debtEntries[index];
      if (!debt) return {};

      // Unlink bills and freeze their last-known amounts before removing the debt
      const updatedBills = state.bills.map(bill => {
        if (bill.linkedDebtId === debt.id) {
          return {
            ...bill,
            amount: getBillEffectiveAmount(bill, state.debtEntries),
            linkedDebtId: null,
          };
        }
        return bill;
      });

      return {
        debtEntries: state.debtEntries.filter((_, i) => i !== index),
        bills: updatedBills,
      };
    }),

  // ──────────────────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────────────────
  addCategory: (category) =>
    set(state => {
      if (state.categories.includes(category)) return {};
      return { categories: [...state.categories, category] };
    }),

  deleteCategory: (category) =>
    set(state => ({ categories: state.categories.filter(c => c !== category) })),

  // ──────────────────────────────────────────────────────────
  // ACCOUNT SETTINGS
  // ──────────────────────────────────────────────────────────
  setAccountBalance: (accountBalance) => set({ accountBalance }),
  setAccountName: (accountName) => set({ accountName }),
  setStartDate: (startDate) => set({ startDate }),
  setProjectionLength: (projectionLength) => set({ projectionLength }),

  // ──────────────────────────────────────────────────────────
  // SYNC — keep linked bill amounts in step with their debts
  // ──────────────────────────────────────────────────────────
  syncLinkedBillAmounts: () =>
    set(state => {
      let changed = false;
      const bills = state.bills.map(bill => {
        if (!bill.linkedDebtId) return bill;
        const debt = state.debtEntries.find(d => d.id === bill.linkedDebtId);
        if (debt && bill.amount !== debt.actualPayment) {
          changed = true;
          return { ...bill, amount: debt.actualPayment };
        }
        return bill;
      });
      return changed ? { bills } : {};
    }),

  // ──────────────────────────────────────────────────────────
  // UI STATE
  // ──────────────────────────────────────────────────────────
  setActiveTab: (activeTab) => set({ activeTab }),
  setWizardOpen: (wizardOpen) => set({ wizardOpen }),
  setWizardStep: (wizardStep) => set({ wizardStep }),

  // ──────────────────────────────────────────────────────────
  // I/O
  // ──────────────────────────────────────────────────────────

  /**
   * Return a plain JS object with ONLY the data keys (no UI state).
   * The shape EXACTLY matches the legacy JSON export schema.
   */
  exportData: () => {
    const state = get();
    const data = {};
    EXPORT_KEYS.forEach(key => {
      data[key] = state[key];
    });
    return data;
  },

  /**
   * Parse incoming JSON, merge missing keys with defaults,
   * apply roundToCents to all money values,
   * generate IDs for debts missing them, then set state.
   *
   * @param {object} json  — parsed JSON object from a file import
   */
  importData: (json) => {
    const fixedAdjustments = (json.runningBudgetAdjustments || []).map(adj => ({
      ...adj,
      amount: roundToCents(adj.amount),
    }));

    const fixedDebts = (json.debtEntries || []).map(debt => ({
      id: debt.id || generateId(),
      name: debt.name || '',
      type: debt.type || 'Other',
      balance: roundToCents(debt.balance || 0),
      apr: parseFloat(debt.apr) || 0,
      minPayment: roundToCents(debt.minPayment || 0),
      actualPayment: roundToCents(debt.actualPayment || 0),
      loanLength: parseInt(debt.loanLength, 10) || 0,
      assetValue: roundToCents(debt.assetValue || 0),
    }));

    set({
      bills: json.bills || [],
      incomeEntries: json.incomeEntries || [],
      adhocExpenses: json.adhocExpenses || [],
      runningBudgetAdjustments: fixedAdjustments,
      debtEntries: fixedDebts,
      accountBalance: roundToCents(json.accountBalance || 0),
      accountName: json.accountName || '',
      startDate: json.startDate || null,
      projectionLength: json.projectionLength || 6,
      categories: json.categories || [...DEFAULT_CATEGORIES],
    });
  },

  /**
   * Reset all data to defaults (equivalent to legacy resetAll / localStorage.clear()).
   */
  resetAll: () => set({ ...DEFAULT_STATE, categories: [...DEFAULT_CATEGORIES] }),

  /**
   * Load the comprehensive v3.3.1 sample data set.
   * Dates are computed relative to the current date so the projection
   * is always in the current period.
   */
  loadSampleData: () => {
    const sample = buildSampleData();
    set({
      bills: sample.bills,
      incomeEntries: sample.incomeEntries,
      adhocExpenses: sample.adhocExpenses,
      runningBudgetAdjustments: sample.runningBudgetAdjustments,
      debtEntries: sample.debtEntries,
      accountBalance: sample.accountBalance,
      accountName: sample.accountName,
      startDate: sample.startDate,
      projectionLength: sample.projectionLength,
      categories: sample.categories,
    });
  },
}));

export default useBudgetStore;
