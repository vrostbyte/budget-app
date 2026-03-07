import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import AmountInput from '../shared/AmountInput.jsx';
import { INCOME_FREQUENCIES } from '../../utils/constants.js';

const EMPTY = { name: '', amount: 0, frequency: 'Bi-weekly', startDate: '' };

/**
 * IncomeForm — add/edit income entries.
 */
export default function IncomeForm({ editIndex = null, onDone }) {
  const incomeEntries = useBudgetStore(s => s.incomeEntries);
  const addIncome     = useBudgetStore(s => s.addIncome);
  const updateIncome  = useBudgetStore(s => s.updateIncome);

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editIndex !== null && incomeEntries[editIndex]) {
      setForm({ ...incomeEntries[editIndex] });
    } else {
      setForm(EMPTY);
    }
  }, [editIndex, incomeEntries]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Income name is required'); return; }
    if (form.amount <= 0)  { toast.error('Amount must be greater than 0'); return; }

    const income = {
      name:      form.name.trim(),
      amount:    form.amount,
      frequency: form.frequency,
      startDate: form.startDate,
    };

    if (editIndex !== null) {
      updateIncome(editIndex, income);
      toast.success('Income updated');
    } else {
      addIncome(income);
      toast.success('Income added');
    }
    setForm(EMPTY);
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Income Name</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Paycheck - Primary"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Amount per Occurrence ($)</label>
          <AmountInput
            value={form.amount}
            onChange={v => set('amount', v)}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Frequency</label>
          <select
            value={form.frequency}
            onChange={e => set('frequency', e.target.value)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-slate-900
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          >
            {INCOME_FREQUENCIES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-xl text-sm font-semibold
                     hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)]"
        >
          {editIndex !== null ? 'Update Income' : 'Add Income'}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            onClick={() => { setForm(EMPTY); onDone?.(); }}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
