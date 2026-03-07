import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generateId } from '../../utils/engine.js';
import useBudgetStore from '../../store/budgetStore.js';
import AmountInput from '../shared/AmountInput.jsx';
import { DEBT_TYPES } from '../../utils/constants.js';

const ASSET_DEBT_TYPES = new Set(['Auto Loan', 'Mortgage']);

const EMPTY = {
  id: '',
  name: '',
  type: 'Credit Card',
  balance: 0,
  apr: 0,
  minPayment: 0,
  actualPayment: 0,
  loanLength: 0,
  assetValue: 0,
};

/**
 * DebtForm — add/edit debt accounts.
 * Shows Est. Asset Value field only for Auto Loan and Mortgage.
 */
export default function DebtForm({ editIndex = null, onDone }) {
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const addDebt     = useBudgetStore(s => s.addDebt);
  const updateDebt  = useBudgetStore(s => s.updateDebt);

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editIndex !== null && debtEntries[editIndex]) {
      setForm({ ...debtEntries[editIndex] });
    } else {
      setForm({ ...EMPTY, id: generateId() });
    }
  }, [editIndex, debtEntries]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())    { toast.error('Debt name is required'); return; }
    if (form.balance <= 0)    { toast.error('Balance must be greater than 0'); return; }
    if (form.apr < 0)         { toast.error('APR cannot be negative'); return; }
    if (form.minPayment < 0)  { toast.error('Min payment cannot be negative'); return; }
    if (form.actualPayment <= 0) { toast.error('Actual payment must be greater than 0'); return; }

    const debt = {
      id:            form.id || generateId(),
      name:          form.name.trim(),
      type:          form.type,
      balance:       form.balance,
      apr:           parseFloat(form.apr) || 0,
      minPayment:    form.minPayment,
      actualPayment: form.actualPayment,
      loanLength:    parseInt(form.loanLength, 10) || 0,
      assetValue:    ASSET_DEBT_TYPES.has(form.type) ? form.assetValue : 0,
    };

    if (editIndex !== null) {
      updateDebt(editIndex, debt);
      toast.success('Debt updated');
    } else {
      addDebt(debt);
      toast.success('Debt added');
    }
    setForm({ ...EMPTY, id: generateId() });
    onDone?.();
  }

  const isAsset = ASSET_DEBT_TYPES.has(form.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Account Name</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Chase Sapphire"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Debt Type</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-slate-900
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          >
            {DEBT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Balance */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Current Balance ($)</label>
          <AmountInput
            value={form.balance}
            onChange={v => set('balance', v)}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        {/* APR */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">APR (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.apr}
            onChange={e => set('apr', parseFloat(e.target.value) || 0)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Min Payment */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Min Payment ($)</label>
          <AmountInput
            value={form.minPayment}
            onChange={v => set('minPayment', v)}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        {/* Actual Payment */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Actual Payment ($)</label>
          <AmountInput
            value={form.actualPayment}
            onChange={v => set('actualPayment', v)}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        {/* Loan Length */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Loan Length (months) <span className="text-slate-600 font-normal">— 0 = revolving</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.loanLength}
            onChange={e => set('loanLength', parseInt(e.target.value, 10) || 0)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Est. Asset Value — only for Auto Loan / Mortgage */}
        {isAsset && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Est. Asset Value ($)</label>
            <AmountInput
              value={form.assetValue}
              onChange={v => set('assetValue', v)}
              className="w-full"
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-xl text-sm font-semibold
                     hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)]"
        >
          {editIndex !== null ? 'Update Debt' : 'Add Debt'}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            onClick={() => { setForm({ ...EMPTY, id: generateId() }); onDone?.(); }}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
