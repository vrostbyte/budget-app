import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import AmountInput from '../shared/AmountInput.jsx';

const EMPTY = { date: '', amount: 0, event: '' };

/**
 * AdjustmentForm — add/edit running balance adjustments (credits or debits).
 * Positive amount = credit (e.g. tax refund). Negative = debit.
 */
export default function AdjustmentForm({ editIndex = null, onDone }) {
  const adjustments    = useBudgetStore(s => s.runningBudgetAdjustments);
  const addAdjustment  = useBudgetStore(s => s.addAdjustment);
  const updateAdjustment = useBudgetStore(s => s.updateAdjustment);

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editIndex !== null && adjustments[editIndex]) {
      setForm({ ...adjustments[editIndex] });
    } else {
      setForm(EMPTY);
    }
  }, [editIndex, adjustments]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date)        { toast.error('Date is required'); return; }
    if (form.amount === 0) { toast.error('Amount cannot be zero'); return; }
    if (!form.event.trim()) { toast.error('Event description is required'); return; }

    const adj = {
      date:   form.date,
      amount: form.amount,
      event:  form.event.trim(),
    };

    if (editIndex !== null) {
      updateAdjustment(editIndex, adj);
      toast.success('Adjustment updated');
    } else {
      addAdjustment(adj);
      toast.success('Adjustment added');
    }
    setForm(EMPTY);
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Event description */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Event Description</label>
          <input
            value={form.event}
            onChange={e => set('event', e.target.value)}
            placeholder="e.g. Tax Refund"
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
          <label className="block text-xs text-slate-500 mb-1">
            Amount ($) <span className="text-slate-600 font-normal">— negative to subtract</span>
          </label>
          <AmountInput
            value={form.amount}
            onChange={v => set('amount', v)}
            className="w-full"
            placeholder="e.g. 2800 or -500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-xl text-sm font-semibold
                     hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)]"
        >
          {editIndex !== null ? 'Update Adjustment' : 'Add Adjustment'}
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
