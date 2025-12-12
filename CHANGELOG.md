# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
