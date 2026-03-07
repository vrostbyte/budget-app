import { useState } from 'react';
import { Sparkles, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import { parseMathExpression } from '../../utils/engine.js';

export default function InputsView() {
  const loadSampleData   = useBudgetStore(s => s.loadSampleData);
  const resetAll         = useBudgetStore(s => s.resetAll);
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
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Sample data CTA */}
      <div className="card-neu p-6 text-center space-y-3 glow-cyan border border-cyan-400/10">
        <Sparkles className="w-8 h-8 text-fuchsia-400 mx-auto" />
        <h2 className="text-base font-semibold text-slate-100">Try the Sample Data</h2>
        <p className="text-sm text-slate-400">
          Loads a comprehensive v3.3.1 dataset — 6 debts, 15 bills, 3 income streams, adhoc expenses and a tax refund adjustment.
        </p>
        <button
          onClick={() => { loadSampleData(); toast.success('Sample data loaded!'); }}
          className="px-5 py-2.5 bg-cyan-400 text-slate-900 rounded-xl font-semibold text-sm
                     hover:bg-cyan-300 transition-colors shadow-[0_0_16px_rgba(34,211,238,0.3)]"
        >
          Load Sample Data
        </button>
        <button
          onClick={() => { if (window.confirm('Reset all data?')) { resetAll(); toast.success('Data reset'); } }}
          className="block mx-auto text-xs text-slate-600 hover:text-rose-400 transition-colors mt-1"
        >
          Reset all data
        </button>
      </div>

      {/* Account settings */}
      <div className="card-neu p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Account Settings</h3>
        </div>

        <div className="space-y-3">
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
            <div className="flex gap-2">
              <input
                className="card-neu-inset flex-1 px-3 py-2 text-sm text-slate-100 bg-transparent
                           focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                onBlur={handleBalanceSave}
                placeholder="e.g. 2500"
              />
            </div>
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
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>1 mo</span><span>12 mo</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        Full bill/income/debt forms coming in Phase 4 (Inputs)
      </p>
    </div>
  );
}
