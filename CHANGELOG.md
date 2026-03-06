# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [3.3.0] - 2026-03-06

### Added
- **"Guide Me" Onboarding Wizard** — A step-by-step budget setup assistant accessible from the top of the Menu dropdown. Opens as a floating modal overlay styled like a standalone desktop application window (blue title bar, drop shadow, rounded corners). Guides users through 6 steps:
  1. **Initial Setup** — Sets start date, projection length, account name, and current balance.
  2. **Income Sources** — Add multiple income entries one at a time (name, amount, frequency, start date). Each entry is saved immediately to `incomeEntries[]`.
  3. **Debt Accounts** — Add multiple debt entries (creditor, type, balance, APR, min/actual payments, term). Est. Asset Value field shown conditionally for Auto Loan and Mortgage types. "Skip this step" link available.
  4. **Monthly Expenses** — Add recurring bills with optional debt account linking (mirrors existing bill form UX). "+ Add Category" inline button. Linked bills show a 🔗 icon.
  5. **One-Off Items** — Add one-time income adjustments or adhoc expenses by date. "Skip this step" link available.
  6. **Review & Complete** — Displays stat cards summarizing account, income sources, debts, bills, and one-off items with totals. "Start Over" clears wizard-entered data after confirmation. "Complete" closes wizard and calls `updateDisplay()`.
- **Progress Bar** — Persistent 6-circle progress indicator at the bottom of the wizard window. Current step is highlighted blue, completed steps are green and clickable (navigate back), future steps are gray.
- **Continuous Saving** — `saveData()` is called after each entry addition and after Step 1, so no data is lost if the browser is closed mid-wizard.
- **Mobile Full-Screen Mode** — On screens ≤768px the wizard expands to fill the full viewport (100vw × 100vh); progress labels are hidden to conserve space.
- **Wizard Toast** — A brief green toast notification appears when the wizard is completed successfully.

### Technical
- All wizard HTML added to `index.html` as a new `#guide-me-modal` element (uses `.wizard-modal` class, not the shared `.modal` class, to allow `display:flex` centering).
- All wizard CSS appended to `styles.css` under the `/* Guide Me Wizard */` section.
- All wizard JS added to `app.js` inside the existing `DOMContentLoaded` wrapper, reusing `saveData()`, `parseMathExpression()`, `generateId()`, `getBillEffectiveAmount()`, `isAssetDebtType()`, `updateDisplay()`, `populateBillDebtDropdown()`, `populateCategories()`, and `roundToCents()`.

---

## [3.2.0] - 2026-03-06

### Added
- **Debt Breakdown Donut Chart** — A doughnut chart below the Debt Summary card displays each debt type's share of total debt, color-coded by quality: hot reds (Credit Card, Medical Debt), neutral amber/green (Personal Loan, Student Loan), and cool blues (Auto Loan, Mortgage). Total debt is rendered in bold inside the center cutout.
- **Asset Equity Bars** — Horizontal progress bars for Auto Loan and Mortgage debts that have an estimated asset value. The full bar width represents the asset's total value; the red fill shows what is owed; the green fill shows equity. Loans where the balance exceeds the asset value display a fully red "underwater" bar with a labeled deficit. A bold consolidated bar summarizes all qualifying debts when two or more are present.
- **Est. Asset Value field** — Optional input on Auto Loan and Mortgage debt entries. Shown/hidden automatically based on the selected debt type in both the Add Debt form and the Edit modal.
- **Asset Summary Metrics** — When asset-backed debts have a value set, the Debt Summary card gains "Est. Total Asset Value" and "Net Asset Equity" rows.

### Changed
- **Debt Summary Card** — Dynamically gains asset-value rows when applicable; no visual change for users without asset-backed debts.

### Data Compatibility
- Fully backward compatible. Existing JSON exports without `assetValue` import cleanly; the equity bars simply do not render for those entries.

---

## [3.1.0] - 2026-03-06

### Added
- **Bill-to-Debt Linking** — Any recurring bill can be linked to a debt account. The bill amount automatically mirrors the debt's actual monthly payment and stays in sync whenever the debt is edited.
- **Stable Debt IDs** — Each debt entry now carries a UUID. Existing data receives auto-generated IDs on first load or import, with no disruption to existing records.
- **Chain Icon** — Linked bills display a 🔗 icon in the Bills table for quick visual identification.

### Changed
- **Add Bill Form** — Added a "Link to Debt Account" checkbox that reveals a dropdown selector and disables the amount input (replaced by a live preview of the linked payment amount).
- **Edit Bill Modal** — Includes the same link dropdown pre-selected to the current linked debt, with an inline read-only toggle on the amount field.
- **Delete Debt** — Deleting a debt automatically unlinks any associated bills and freezes their last-known payment amount, so the running budget remains accurate.

### Improved
- **`generateId()`** — UUID helper added for stable entity references across all debt entries.
- **`getBillEffectiveAmount(bill)`** — Returns the live payment amount from a linked debt, or falls back to the stored bill amount for unlinked bills.
- **`syncLinkedBillAmounts()`** — Called after every debt save to propagate payment changes to all linked bills.
- **`unlinkBillsForDebt(debtId)`** — Cleanly severs all bill links before a debt is deleted, preserving the last-known amount.

### Data Compatibility
- Fully backward compatible. Existing JSON exports without `id` or `linkedDebtId` fields import correctly; IDs are auto-generated and `linkedDebtId` defaults to `null`.

---

## [3.0.0] - 2024-12-11

### 🎉 Major Release

Version 3.0 represents a significant stability and quality update, focusing on bug fixes, code reliability, and developer experience improvements.

### Fixed
- **Delete Button Click Target**: Fixed silent failure when clicking the trash icon instead of the button itself. Now properly detects clicks on both the icon and button.
- **Floating Point Precision**: Eliminated JavaScript floating point errors (e.g., `-98.61999999999999` → `-98.62`). All financial calculations now round to cents.
- **Monthly Income/Bills on 31st**: Fixed edge case where income or bills set for the 31st wouldn't trigger in shorter months. Now correctly triggers on the last day of February, April, June, September, and November.
- **Import Data Precision**: Imported data now automatically corrects any floating point precision issues from older exports.

### Added
- **Delete Confirmation Dialogs**: All delete actions now prompt for confirmation with the item name displayed.
- **Empty State Messages**: Tables and charts display helpful messages when no data is present instead of appearing blank.
- **Print Stylesheet**: Added CSS rules for clean printing—hides navigation, forms, and modals when printing.
- **Developer Documentation**: Added `.github/copilot-instructions.md` for AI-assisted development workflow.
- **Comprehensive README**: Complete rewrite with detailed user guide, FAQ, and technical documentation.

### Changed
- **Default Income Frequency**: Changed default dropdown selection to "Bi-weekly" as the most common pay frequency.
- **Sample Data**: Updated to use current dates instead of hardcoded 2024 dates.
- **Default Categories**: Added "Credit Card Payment" and "Student Loans" to the default category list.
- **Form Placeholders**: Added hint text showing math expression support (e.g., "100+50").
- **Footer**: Now displays version number for easy reference.

### Improved
- **Code Quality**: Added `roundToCents()` helper function applied consistently throughout all financial calculations.
- **UI Polish**: Added hover states to collapsible card headers, improved focus states on form inputs for accessibility.
- **Mobile Experience**: Improved responsive breakpoints and touch target sizes.
- **Error Handling**: Better validation and user feedback throughout the application.

---

## [1.6.0] - 2024-12-10

### Added
- **Savings Feature Reintroduction & Enhancements:**
  - **Savings Accounts**: Users can create multiple savings accounts with optional savings goals.
  - **Savings Contributions**: Supports both ad hoc and recurring contributions from Checking to Savings.
  - **Collapsible Savings Table**: Day-by-day savings balances can be expanded/collapsed.
  - **Savings Goal Tracking**: Displays progress percentage and remaining amount toward goals.

- **Improved Editing for Running Budget:**
  - Editing a running budget entry now **replaces** the existing event text instead of appending.

### Removed
- **Expenses by Category Pie Chart**: Removed to streamline visualization options.

### Changed
- **Event Name Handling**: Adjustments' `event` field now overrides daily event descriptions to prevent duplication.

---

## [1.5.0] - 2024-12-03

### Added
- **Running Budget Row Editing**: Edit individual entries directly from the Running Budget table via modal.
- **Data Import/Export Enhancements**: Updated export to include both JSON and CSV formats.

### Removed
- **Savings Features**: Temporarily removed all savings-related functionality to simplify the application.

### Changed
- **User Interface**: Updated forms and tables to remove savings-related sections.
- **Codebase Cleanup**: Refactored to remove unused savings-related code.

### Fixed
- **Data Consistency**: Import/export functions correctly handle datasets without savings data.

---

## [1.4.0] - 2024-11-30

### Added
- **Savings Goal Tracking System**: Add savings accounts with names, balances, and allocate excess funds.
- **Export to CSV Option**: Additional export format for spreadsheet compatibility.
- **Expenses by Category Pie Chart**: Visual representation of spending by category.

### Changed
- **Table Formatting**: Restored 1px borders and light grey backgrounds for readability.

### Fixed
- **General Enhancements**: Improved code structure and comments.

---

## [1.3.0] - 2024-11-20

### Added
- **Expanded Expense Categories**: 18 default categories covering common expense types.
- **Custom Category Management**: "Add Category" button for user-defined categories with localStorage persistence.
- **Running Budget Enhancements**: Income highlighting, improved date formatting.
- **Contact Section**: Added to README with email and GitHub links.
- **.gitignore File**: Excludes unnecessary files from repository.

### Changed
- **Date Parsing**: Fixed time zone shift issues for accurate date handling.
- **README Documentation**: Complete rewrite with detailed sections.

### Fixed
- **Git Commit Issue**: Resolved HEAD ref update timeout errors.

---

## [1.2.0] - 2024-11-15

### Added
- Initial public release with core budgeting features.
- Recurring bills and income tracking.
- Ad-hoc expense logging.
- Running budget projection.
- Chart.js visualizations.
- JSON import/export.

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (3.x.x): Significant changes, potential breaking changes to data format
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, minor improvements

---

## Upgrade Notes

### Upgrading to 3.0.0

1. **Export your data first** using Menu → Export Data (JSON)
2. Replace all files (`index.html`, `app.js`, `styles.css`)
3. Refresh the browser
4. Your data in localStorage will be preserved
5. Import your backup if needed

### Data Compatibility

Version 3.0 is fully backward compatible with data from versions 1.x. No data migration required.
