import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import AmountInput from '../shared/AmountInput.jsx';
import CategoryManager from './CategoryManager.jsx';

const EMPTY = { name: '', date: 1, amount: 0, category: '', linkedDebtId: null };

/**
 * BillForm — add/edit recurring bills.
 * Props:
 *   editIndex {number|null} — index of bill being edited (null = add mode)
 *   onDone    {fn}          — called after save or cancel
 */
export default function BillForm({ editIndex = null, onDone }) {
  const bills       = useBudgetStore(s => s.bills);
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const categories  = useBudgetStore(s => s.categories);
  const addBill     = useBudgetStore(s => s.addBill);
  const updateBill  = useBudgetStore(s => s.updateBill);

  const [form, setForm] = useState(EMPTY);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    if (editIndex !== null && bills[editIndex]) {
      const b = bills[editIndex];
      setForm({ ...b });
      setLinked(!!b.linkedDebtId);
    } else {
      setForm(EMPTY);
      setLinked(false);
    }
  }, [editIndex, bills]);

  // When debt link changes, sync amount from debt
  useEffect(() => {
    if (linked && form.linkedDebtId) {
      const debt = debtEntries.find(d => d.id === form.linkedDebtId);
      if (debt) setForm(f => ({ ...f, amount: debt.actualPayment }));
    }
  }, [form.linkedDebtId, linked, debtEntries]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Bill name is required'); return; }
    if (form.amount <= 0)  { toast.error('Amount must be greater than 0'); return; }

    const bill = {
      name:        form.name.trim(),
      date:        Number(form.date),
      amount:      form.amount,
      category:    form.category,
      linkedDebtId: linked ? form.linkedDebtId : null,
    };

    if (editIndex !== null) {
      updateBill(editIndex, bill);
      toast.success('Bill updated');
    } else {
      addBill(bill);
      toast.success('Bill added');
    }
    setForm(EMPTY);
    setLinked(false);
    onDone?.();
  }

  const linkedDebt = linked && form.linkedDebtId
    ? debtEntries.find(d => d.id === form.linkedDebtId)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Bill Name</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Electric Bill"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Day of month */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Day of Month (1–31)</label>
          <input
            type="number"
            min={1}
            max={31}
            value={form.date}
            onChange={e => set('date', Number(e.target.value))}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Category */}
        <div>
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

        {/* Debt link checkbox */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={linked}
              onChange={e => {
                setLinked(e.target.checked);
                if (!e.target.checked) set('linkedDebtId', null);
              }}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
            Link amount to a debt account
          </label>
        </div>

        {/* Debt selector (visible when linked) */}
        {linked && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Linked Debt Account</label>
            <select
              value={form.linkedDebtId || ''}
              onChange={e => set('linkedDebtId', e.target.value || null)}
              className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-slate-900
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            >
              <option value="">— Select Debt —</option>
              {debtEntries.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Amount {linked && linkedDebt ? <span className="text-cyan-400/70">(synced from debt)</span> : ''}
          </label>
          <AmountInput
            value={form.amount}
            onChange={v => set('amount', v)}
            disabled={!!(linked && linkedDebt)}
            className={`w-full ${linked && linkedDebt ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-xl text-sm font-semibold
                     hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)]"
        >
          {editIndex !== null ? 'Update Bill' : 'Add Bill'}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setLinked(false); onDone?.(); }}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
