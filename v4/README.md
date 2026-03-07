# Budget App v4.0 — Cyber Edition

![Version](https://img.shields.io/badge/version-4.0.0-cyan)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![License](https://img.shields.io/badge/license-MIT-green)

A personal budget projection tool rebuilt from the ground up as a React + Vite single-page application. Enter recurring bills, income sources, one-off expenses, and debt accounts to get a day-by-day cash flow projection across up to 12 months.

---

## Tech Stack

| Layer | Library / Tool |
|-------|---------------|
| UI Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 (CSS-first, `@tailwindcss/vite` plugin) |
| State Management | Zustand |
| Animations | Framer Motion |
| Date Utilities | date-fns |
| Icons | lucide-react |
| Notifications | react-hot-toast |

---

## Features

### Dashboard
- **Hero Balance Card** — current checking balance with emerald/rose glow based on balance health
- **Quick Stats Row** — estimated monthly income, monthly bills, and total debt at a glance
- **Lowest Balance by Month** — staggered cards showing the lowest projected balance for each month in the projection window, color-coded by balance health

### Ledger
- Day-by-day running balance projection table
- Income rows highlighted in emerald, expense rows in rose, adjustment rows color-coded by sign
- End-of-month bill handling (bills due on day 31 trigger on the last day of shorter months)

### Add / Edit (Command Center)
- **5-tab interface**: Bills · Income · Adhoc · Debt · Adjustments
- Inline edit and delete for all entries (no page navigation)
- **AmountInput** — type math expressions like `1200+50` or `500*2`; evaluates on blur
- **CategoryManager** — add custom categories inline without leaving the form
- **Account Settings** — always visible at the top: account name, starting balance, start date, projection length

### Debt Tracker
- Sortable debt table with balance, APR, min payment, actual payment, payoff estimate
- **Bill-to-Debt Linking** — link any recurring bill to a debt account; the bill amount syncs automatically to the debt's actual monthly payment
- **Asset Equity Bars** — for Auto Loan and Mortgage debts with an asset value set, visualizes equity vs. outstanding balance
- **Debt Breakdown Donut Chart** — shows each debt type's share of total debt

### Charts
- Monthly cash flow bar chart
- Spending by category visualization

### Guide Me Wizard
A 6-step onboarding assistant that walks new users through budget setup:

1. **Initial Setup** — account name, starting balance, start date, projection length. Optionally wipe all data and start fresh.
2. **Income Sources** — add recurring income streams one at a time; session additions appear above the form.
3. **Debt Accounts** — add loans and credit cards; asset value field appears for Auto Loan and Mortgage types. Skippable.
4. **Recurring Bills** — add monthly bills with optional debt linking and custom categories.
5. **One-Off Items** — add upcoming single expenses or expected credits. Skippable.
6. **Review** — stat cards summarizing everything added. "Start Over" rolls back all wizard session data after confirmation. "Complete" saves and shows a success toast.

**Snapshot / Rollback**: When the wizard opens it captures the current data state (array lengths + scalar values). "Start Over" truncates entries back to those lengths and restores scalar values — leaving any pre-existing data intact.

### Import / Export
- Export all data to a JSON file (compatible with v3.x format)
- Import any v3.x or v4.x JSON export — backward compatible
- JSON round-trip verified: all field names and float values preserved exactly

### Print Stylesheet
`@media print` rules hide navigation, buttons, and modals; reset backgrounds to white; and keep color accents for readability on paper.

---

## Quick Start

```bash
# 1. Install dependencies
cd v4
npm install

# 2. Start dev server (http://localhost:5173)
npm run dev

# 3. Production build (output → v4/dist/)
npm run build

# 4. Preview production build locally
npm run preview
```

---

## Project Structure

```
v4/
├── src/
│   ├── components/
│   │   ├── charts/        # ChartsView
│   │   ├── dashboard/     # HeroBalanceCard, LowestBalanceCards, QuickStatsRow
│   │   ├── debt/          # DebtView, DebtTable, EquityBars, DebtDonut
│   │   ├── inputs/        # InputsView, BillForm, IncomeForm, AdhocForm,
│   │   │                  #   DebtForm, AdjustmentForm, CategoryManager
│   │   ├── layout/        # AppShell, DesktopSidebar, MobileBottomNav
│   │   ├── ledger/        # LedgerView
│   │   ├── shared/        # AmountInput, ColorBalance, ConfirmDialog,
│   │   │                  #   EmptyState, Toast
│   │   └── wizard/        # GuideMe, WizardProgress, WizardStep
│   ├── hooks/
│   │   └── useRunningTotals.js   # Core projection engine (hook wrapper)
│   ├── store/
│   │   └── budgetStore.js        # Zustand store — all state + actions
│   ├── utils/
│   │   ├── engine.js             # Projection engine, math expression parser
│   │   ├── fileIO.js             # downloadJSON, readJSONFile
│   │   └── formatters.js        # formatCurrency, formatDate
│   ├── index.css                 # Tailwind import + custom tokens + print styles
│   └── main.jsx
├── roundtrip_test.mjs            # JSON round-trip verification script
├── vite.config.js
└── package.json
```

---

## Guide Me Wizard — Detailed Docs

### Opening the Wizard
Click **Guide Me** (wand icon) in the desktop sidebar or mobile menu.

### Step Navigation
- **Next / Back** buttons move between steps
- Completed steps (green circles) are clickable — jump back to any earlier step
- Active step circle scales up with a spring animation for visual emphasis

### Start Fresh vs Start Over
| Action | What it does |
|--------|-------------|
| **Start Fresh** (Step 1) | Wipes ALL data (bills, income, debts, everything) and begins with a blank slate. Requires confirmation. |
| **Start Over** (Step 6) | Removes only entries added during this wizard session; restores pre-wizard scalar values. Does NOT affect pre-existing data. Requires confirmation. |

### Skippable Steps
Steps 3 (Debt) and 5 (One-Off Items) have a "Skip this step" link if you have nothing to add.

---

## Data Format (JSON Export)

```json
{
  "accountName": "Primary Checking",
  "accountBalance": 5000,
  "startDate": "2026-03-01T00:00:00.000Z",
  "projectionLength": 6,
  "categories": ["Housing", "Utilities", ...],
  "bills": [
    { "name": "Rent", "date": 1, "amount": 1500, "category": "Housing", "linkedDebtId": null }
  ],
  "incomeEntries": [
    { "name": "Salary", "amount": 2500, "frequency": "Bi-weekly", "startDate": "2026-03-07" }
  ],
  "adhocExpenses": [
    { "name": "Car registration", "date": "2026-04-15", "amount": 180, "category": "Auto" }
  ],
  "runningBudgetAdjustments": [
    { "event": "Tax refund", "date": "2026-04-01", "amount": 1200 }
  ],
  "debtEntries": [
    {
      "id": "abc123",
      "name": "Visa",
      "type": "Credit Card",
      "balance": 3400,
      "apr": 24.99,
      "minPayment": 68,
      "actualPayment": 200,
      "loanLength": 0,
      "assetValue": 0
    }
  ]
}
```

**Backward compatibility**: v3.x exports missing `id` and `assetValue` on debt entries import cleanly — IDs are auto-generated and `assetValue` defaults to `0`.

---

## FAQ

**Q: Where is my data stored?**
A: In `localStorage` in your browser. Nothing is sent to a server.

**Q: Is the v4 data format compatible with v3.x?**
A: Yes. Export from v3.x and import into v4. Export from v4 and import back into v3.x (debt entries will have extra `id` and `assetValue` fields, which v3.x ignores).

**Q: What does "Bill due on day 31" mean in shorter months?**
A: Bills with a due day greater than the last day of a given month automatically trigger on the last day of that month (e.g., day 31 → Feb 28/29, Apr 30).

**Q: Can I link a bill to a debt account?**
A: Yes. In the Bills tab, enable "Link to Debt Account" and select the debt. The bill amount will automatically mirror the debt's actual monthly payment and stay in sync when you edit the debt.

**Q: What math does AmountInput support?**
A: `+`, `-`, `*`, `/`, `()`, and `$` stripping. For example: `1200+50`, `500*2`, `(800+200)/2`. Invalid expressions show a red ring.

**Q: How do I print the ledger?**
A: Use your browser's print function (`Ctrl/Cmd + P`). Navigation, buttons, and modals are hidden; backgrounds reset to white; color accents are preserved.

---

## Recently Completed

- [x] v4.0 — Full React + Vite rewrite (Cyber Edition)
  - Zustand state management, Framer Motion animations
  - 5-tab Command Center with inline CRUD
  - Guide Me wizard as React portal with snapshot/rollback
  - Math expression input, custom categories
  - Debt equity bars, donut chart
  - JSON round-trip verification
  - Print stylesheet
  - Mobile bottom nav with 44px touch targets
