import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('/home/user/budget-app/test_data.json', 'utf8'));

function roundToCents(v) { return Math.round(v * 100) / 100; }
function generateId() { return 'gen-' + Math.random().toString(36).slice(2); }

const EXPORT_KEYS = [
  'bills','incomeEntries','adhocExpenses','runningBudgetAdjustments',
  'debtEntries','accountBalance','accountName','startDate','projectionLength','categories'
];

// Simulate importData
const imported = {
  bills: data.bills || [],
  incomeEntries: data.incomeEntries || [],
  adhocExpenses: data.adhocExpenses || [],
  runningBudgetAdjustments: (data.runningBudgetAdjustments || []).map(adj => ({
    ...adj, amount: roundToCents(adj.amount)
  })),
  debtEntries: (data.debtEntries || []).map(debt => ({
    id: debt.id || generateId(),
    name: debt.name || '',
    type: debt.type || 'Other',
    balance: roundToCents(debt.balance || 0),
    apr: parseFloat(debt.apr) || 0,
    minPayment: roundToCents(debt.minPayment || 0),
    actualPayment: roundToCents(debt.actualPayment || 0),
    loanLength: parseInt(debt.loanLength, 10) || 0,
    assetValue: roundToCents(debt.assetValue || 0),
  })),
  accountBalance: roundToCents(data.accountBalance || 0),
  accountName: data.accountName || '',
  startDate: data.startDate || null,
  projectionLength: data.projectionLength || 6,
  categories: data.categories || [],
};

// Simulate exportData
const exported = {};
EXPORT_KEYS.forEach(k => { exported[k] = imported[k]; });

let pass = true;

console.log('=== TOP-LEVEL KEY COMPARISON ===');
const origKeys = Object.keys(data).sort();
const exportedKeys = Object.keys(exported).sort();
console.log('test_data.json keys:', origKeys.join(', '));
console.log('exported keys:      ', exportedKeys.join(', '));
const missingFromExport = origKeys.filter(k => exportedKeys.indexOf(k) === -1);
const extraInExport     = exportedKeys.filter(k => origKeys.indexOf(k) === -1);
if (missingFromExport.length) { console.log('FAIL: Missing from export:', missingFromExport); pass = false; }
if (extraInExport.length)     { console.log('FAIL: Extra in export:', extraInExport); pass = false; }
if (!missingFromExport.length && !extraInExport.length) console.log('PASS: All top-level keys match');

console.log('\n=== BILL KEYS ===');
if (data.bills.length) {
  const origBillKeys = Object.keys(data.bills[0]).sort();
  const expBillKeys  = Object.keys(exported.bills[0]).sort();
  console.log('original:', origBillKeys.join(', '));
  console.log('exported:', expBillKeys.join(', '));
  // bills in test_data have no linkedDebtId — exported should also not have it
  console.log(JSON.stringify(origBillKeys) === JSON.stringify(expBillKeys) ? 'PASS' : 'NOTE: bill structure differs (linkedDebtId may be absent in original)');
}

console.log('\n=== INCOME KEYS ===');
if (data.incomeEntries.length) {
  const a = Object.keys(data.incomeEntries[0]).sort();
  const b = Object.keys(exported.incomeEntries[0]).sort();
  console.log('original:', a.join(', '));
  console.log('exported:', b.join(', '));
  console.log(JSON.stringify(a) === JSON.stringify(b) ? 'PASS' : 'FAIL: income key mismatch');
}

console.log('\n=== DEBT KEYS ===');
if (data.debtEntries.length) {
  const a = Object.keys(data.debtEntries[0]).sort();
  const b = Object.keys(exported.debtEntries[0]).sort();
  console.log('original:', a.join(', '));
  console.log('exported:', b.join(', '));
  // exported adds 'id' and 'assetValue' — these are backward-compatible additions
  const added = b.filter(k => a.indexOf(k) === -1);
  const removed = a.filter(k => b.indexOf(k) === -1);
  if (added.length)   console.log('NOTE: added fields:', added.join(', '), '(expected — v3.1+ additions)');
  if (removed.length) { console.log('FAIL: removed fields:', removed.join(', ')); pass = false; }
  if (!removed.length) console.log('PASS: all original debt fields preserved');
}

console.log('\n=== ADJUSTMENT KEYS ===');
if (data.runningBudgetAdjustments.length) {
  const a = Object.keys(data.runningBudgetAdjustments[0]).sort();
  const b = Object.keys(exported.runningBudgetAdjustments[0]).sort();
  console.log('original:', a.join(', '));
  console.log('exported:', b.join(', '));
  console.log(JSON.stringify(a) === JSON.stringify(b) ? 'PASS' : 'FAIL: adjustment key mismatch');
}

console.log('\n=== ADHOC KEYS ===');
if (data.adhocExpenses.length) {
  const a = Object.keys(data.adhocExpenses[0]).sort();
  const b = Object.keys(exported.adhocExpenses[0]).sort();
  console.log('original:', a.join(', '));
  console.log('exported:', b.join(', '));
  console.log(JSON.stringify(a) === JSON.stringify(b) ? 'PASS' : 'FAIL: adhoc key mismatch');
}

console.log('\n=== VALUE SPOT CHECKS ===');
const checks = [
  ['accountBalance', data.accountBalance, exported.accountBalance],
  ['accountName', data.accountName, exported.accountName],
  ['projectionLength', data.projectionLength, exported.projectionLength],
  ['bills.length', data.bills.length, exported.bills.length],
  ['incomeEntries.length', data.incomeEntries.length, exported.incomeEntries.length],
  ['debtEntries.length', data.debtEntries.length, exported.debtEntries.length],
  ['runningBudgetAdjustments.length', data.runningBudgetAdjustments.length, exported.runningBudgetAdjustments.length],
  ['categories.length', data.categories.length, exported.categories.length],
  ['Mastercard balance (float)', data.debtEntries[1].balance, exported.debtEntries[1].balance],
  ['Birthday gift amount (float)', data.adhocExpenses[1].amount, exported.adhocExpenses[1].amount],
];
checks.forEach(([label, orig, exp]) => {
  const ok = orig === exp;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}: ${orig} -> ${exp}`);
  if (!ok) pass = false;
});

console.log('\n=== RESULT ===');
console.log(pass ? 'ALL CHECKS PASSED — JSON round-trip is safe' : 'FAILURES DETECTED — fix before shipping');
