import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import AmountInput from '../shared/AmountInput.jsx';
import CategoryManager from './CategoryManager.jsx';

const EMPTY = { name: '', date: '', amount: 0, category: '' };

/**
 * AdhocForm — add/edit one-time (adhoc) expenses.
 */
export default function AdhocForm({ editIndex = null, onDone }) {
  const adhocExpenses = useBudgetStore(s => s.adhocExpenses);
  const categories    = useBudgetStore(s => s.categories);
  const addAdhoc      = useBudgetStore(s => s.addAdhoc);
  const updateAdhoc   = useBudgetStore(s => s.updateAdhoc);

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editIndex !== null && adhocExpenses[editIndex]) {
      setForm({ ...adhocExpenses[editIndex] });
    } else {
      setForm(EMPTY);
    }
  }, [editIndex, adhocExpenses]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Expense name is required'); return; }
    if (!form.date)        { toast.error('Date is required'); return; }
    if (form.amount <= 0)  { toast.error('Amount must be greater than 0'); return; }

    const expense = {
      name:     form.name.trim(),
      date:     form.date,
      amount:   form.amount,
      category: form.category,
    };

    if (editIndex !== null) {
      updateAdhoc(editIndex, expense);
      toast.success('Expense updated');
    } else {
      addAdhoc(expense);
      toast.success('Expense added');
    }
    setForm(EMPTY);
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Expense Name</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Car Registration"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Amount ($)</label>
          <AmountInput
            value={form.amount}
            onChange={v => set('amount', v)}
            className="w-full"
            placeholder="0.00"
          />
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-slate-900
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          >
            <option value="">— Select —</option>
            {[...categories].sort().map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <CategoryManager onSelect={cat => set('category', cat)} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-xl text-sm font-semibold
                     hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)]"
        >
          {editIndex !== null ? 'Update Expense' : 'Add Expense'}
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
