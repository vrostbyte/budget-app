import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Receipt, TrendingUp, Zap, Landmark, SlidersHorizontal,
         Pencil, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import { parseMathExpression } from '../../utils/engine.js';
import BillForm from './BillForm.jsx';
import IncomeForm from './IncomeForm.jsx';
import AdhocForm from './AdhocForm.jsx';
import DebtForm from './DebtForm.jsx';
import AdjustmentForm from './AdjustmentForm.jsx';
import ConfirmDialog from '../shared/ConfirmDialog.jsx';

const TABS = [
  { id: 'bills',      label: 'Bills',      Icon: Receipt         },
  { id: 'income',     label: 'Income',     Icon: TrendingUp      },
  { id: 'adhoc',      label: 'Adhoc',      Icon: Zap             },
  { id: 'debt',       label: 'Debt',       Icon: Landmark        },
  { id: 'adjustment', label: 'Adjustments',Icon: SlidersHorizontal },
];

const SLIDE = {
  initial:  { opacity: 0, x: 20 },
  animate:  { opacity: 1, x: 0  },
  exit:     { opacity: 0, x: -20 },
  transition: { duration: 0.18 },
};

// ─── Small list-row actions ───────────────────────────────────
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-1 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Bills list ───────────────────────────────────────────────
function BillsList({ onEdit }) {
  const bills       = useBudgetStore(s => s.bills);
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const deleteBill  = useBudgetStore(s => s.deleteBill);
  const [confirm, setConfirm] = useState({ open: false, index: null });

  if (bills.length === 0) return <p className="text-sm text-slate-600 text-center py-4">No bills yet</p>;

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this bill? This cannot be undone."
        onConfirm={() => { deleteBill(confirm.index); setConfirm({ open: false, index: null }); toast.success('Bill deleted'); }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="space-y-1">
        {bills.map((bill, i) => {
          const linked = bill.linkedDebtId
            ? debtEntries.find(d => d.id === bill.linkedDebtId)
            : null;
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{bill.name}</p>
                <p className="text-xs text-slate-500">
                  Day {bill.date} · {bill.category || 'Uncategorized'}
                  {linked && <span className="text-cyan-400/70"> · linked to {linked.name}</span>}
                </p>
              </div>
              <span className="text-sm text-rose-400 tabular-nums font-medium shrink-0">
                {formatCurrency(bill.amount)}
              </span>
              <RowActions onEdit={() => onEdit(i)} onDelete={() => setConfirm({ open: true, index: i })} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Income list ──────────────────────────────────────────────
function IncomeList({ onEdit }) {
  const incomeEntries = useBudgetStore(s => s.incomeEntries);
  const deleteIncome  = useBudgetStore(s => s.deleteIncome);
  const [confirm, setConfirm] = useState({ open: false, index: null });

  if (incomeEntries.length === 0) return <p className="text-sm text-slate-600 text-center py-4">No income entries yet</p>;

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this income entry?"
        onConfirm={() => { deleteIncome(confirm.index); setConfirm({ open: false, index: null }); toast.success('Income deleted'); }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="space-y-1">
        {incomeEntries.map((inc, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate">{inc.name}</p>
              <p className="text-xs text-slate-500">{inc.frequency} · from {inc.startDate || '—'}</p>
            </div>
            <span className="text-sm text-emerald-400 tabular-nums font-medium shrink-0">
              {formatCurrency(inc.amount)}
            </span>
            <RowActions onEdit={() => onEdit(i)} onDelete={() => setConfirm({ open: true, index: i })} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Adhoc list ───────────────────────────────────────────────
function AdhocList({ onEdit }) {
  const adhocExpenses = useBudgetStore(s => s.adhocExpenses);
  const deleteAdhoc   = useBudgetStore(s => s.deleteAdhoc);
  const [confirm, setConfirm] = useState({ open: false, index: null });

  if (adhocExpenses.length === 0) return <p className="text-sm text-slate-600 text-center py-4">No adhoc expenses yet</p>;

  const sorted = [...adhocExpenses].map((e, i) => ({ ...e, _i: i })).sort((a, b) => a.date < b.date ? -1 : 1);

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this expense?"
        onConfirm={() => { deleteAdhoc(confirm.index); setConfirm({ open: false, index: null }); toast.success('Expense deleted'); }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="space-y-1">
        {sorted.map(exp => (
          <div key={exp._i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate">{exp.name}</p>
              <p className="text-xs text-slate-500">{exp.date} · {exp.category || 'Uncategorized'}</p>
            </div>
            <span className="text-sm text-rose-400 tabular-nums font-medium shrink-0">
              {formatCurrency(exp.amount)}
            </span>
            <RowActions onEdit={() => onEdit(exp._i)} onDelete={() => setConfirm({ open: true, index: exp._i })} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Debt list ────────────────────────────────────────────────
function DebtList({ onEdit }) {
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const deleteDebt  = useBudgetStore(s => s.deleteDebt);
  const [confirm, setConfirm] = useState({ open: false, index: null });

  if (debtEntries.length === 0) return <p className="text-sm text-slate-600 text-center py-4">No debt accounts yet</p>;

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this debt account? Linked bills will be unlinked and their amounts frozen."
        onConfirm={() => { deleteDebt(confirm.index); setConfirm({ open: false, index: null }); toast.success('Debt deleted'); }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="space-y-1">
        {debtEntries.map((debt, i) => (
          <div key={debt.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate">{debt.name}</p>
              <p className="text-xs text-slate-500">{debt.type} · {debt.apr}% APR</p>
            </div>
            <span className="text-sm text-rose-400 tabular-nums font-medium shrink-0">
              {formatCurrency(debt.balance)}
            </span>
            <RowActions onEdit={() => onEdit(i)} onDelete={() => setConfirm({ open: true, index: i })} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Adjustments list ─────────────────────────────────────────
function AdjustmentList({ onEdit }) {
  const adjustments    = useBudgetStore(s => s.runningBudgetAdjustments);
  const deleteAdjustment = useBudgetStore(s => s.deleteAdjustment);
  const [confirm, setConfirm] = useState({ open: false, index: null });

  if (adjustments.length === 0) return <p className="text-sm text-slate-600 text-center py-4">No adjustments yet</p>;

  const sorted = [...adjustments].map((a, i) => ({ ...a, _i: i })).sort((a, b) => a.date < b.date ? -1 : 1);

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this adjustment?"
        onConfirm={() => { deleteAdjustment(confirm.index); setConfirm({ open: false, index: null }); toast.success('Adjustment deleted'); }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="space-y-1">
        {sorted.map(adj => (
          <div key={adj._i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate">{adj.event}</p>
              <p className="text-xs text-slate-500">{adj.date}</p>
            </div>
            <span className={`text-sm tabular-nums font-medium shrink-0 ${adj.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
            </span>
            <RowActions onEdit={() => onEdit(adj._i)} onDelete={() => setConfirm({ open: true, index: adj._i })} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Account Settings (from original InputsView) ───────────────
function AccountSettings() {
  const accountBalance   = useBudgetStore(s => s.accountBalance);
  const accountName      = useBudgetStore(s => s.accountName);
  const startDate        = useBudgetStore(s => s.startDate);
  const projectionLength = useBudgetStore(s => s.projectionLength);
  const setAccountBalance   = useBudgetStore(s => s.setAccountBalance);
  const setAccountName      = useBudgetStore(s => s.setAccountName);
  const setStartDate        = useBudgetStore(s => s.setStartDate);
  const setProjectionLength = useBudgetStore(s => s.setProjectionLength);

  const [balanceInput, setBalanceInput] = useState(accountBalance.toString());

  function handleBalanceSave() {
    const val = parseMathExpression(balanceInput);
    setAccountBalance(val);
    setBalanceInput(val.toString());
    toast.success('Balance updated');
  }

  const startDateStr = startDate
    ? (typeof startDate === 'string' ? startDate.split('T')[0] : new Date(startDate).toISOString().split('T')[0])
    : '';

  return (
    <div className="card-neu p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Account Settings</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Account Name</label>
          <input
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="e.g. Household Checking"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Starting Balance ($)</label>
          <input
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            value={balanceInput}
            onChange={e => setBalanceInput(e.target.value)}
            onBlur={handleBalanceSave}
            placeholder="e.g. 2500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
          <input
            type="date"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            value={startDateStr}
            onChange={e => setStartDate(e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Projection Length ({projectionLength} months)</label>
          <input
            type="range"
            min={1}
            max={12}
            value={projectionLength}
            onChange={e => setProjectionLength(Number(e.target.value))}
            className="w-full accent-cyan-400 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
            <span>1 mo</span><span>12 mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab content map ──────────────────────────────────────────
function TabContent({ tabId, editIndex, onEdit, onDone }) {
  switch (tabId) {
    case 'bills':
      return (
        <div className="space-y-5">
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {editIndex !== null ? 'Edit Bill' : 'Add Bill'}
            </h3>
            <BillForm editIndex={editIndex} onDone={onDone} />
          </div>
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recurring Bills</h3>
            <BillsList onEdit={onEdit} />
          </div>
        </div>
      );
    case 'income':
      return (
        <div className="space-y-5">
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {editIndex !== null ? 'Edit Income' : 'Add Income'}
            </h3>
            <IncomeForm editIndex={editIndex} onDone={onDone} />
          </div>
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Income Streams</h3>
            <IncomeList onEdit={onEdit} />
          </div>
        </div>
      );
    case 'adhoc':
      return (
        <div className="space-y-5">
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {editIndex !== null ? 'Edit Expense' : 'Add One-Time Expense'}
            </h3>
            <AdhocForm editIndex={editIndex} onDone={onDone} />
          </div>
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">One-Time Expenses</h3>
            <AdhocList onEdit={onEdit} />
          </div>
        </div>
      );
    case 'debt':
      return (
        <div className="space-y-5">
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {editIndex !== null ? 'Edit Debt Account' : 'Add Debt Account'}
            </h3>
            <DebtForm editIndex={editIndex} onDone={onDone} />
          </div>
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Debt Accounts</h3>
            <DebtList onEdit={onEdit} />
          </div>
        </div>
      );
    case 'adjustment':
      return (
        <div className="space-y-5">
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {editIndex !== null ? 'Edit Adjustment' : 'Add Balance Adjustment'}
            </h3>
            <AdjustmentForm editIndex={editIndex} onDone={onDone} />
          </div>
          <div className="card-neu p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Adjustments</h3>
            <AdjustmentList onEdit={onEdit} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ─── Main view ────────────────────────────────────────────────
export default function InputsView() {
  const [activeTab, setActiveTab] = useState('bills');
  const [editIndex, setEditIndex] = useState(null);

  function handleEdit(index) {
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDone() {
    setEditIndex(null);
  }

  function handleTabChange(id) {
    setActiveTab(id);
    setEditIndex(null);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Account settings always visible */}
      <AccountSettings />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 card-neu rounded-2xl overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                          whitespace-nowrap transition-all duration-150 flex-1 justify-center
                          ${active
                            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content with animation */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...SLIDE}>
          <TabContent
            tabId={activeTab}
            editIndex={editIndex}
            onEdit={handleEdit}
            onDone={handleDone}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
