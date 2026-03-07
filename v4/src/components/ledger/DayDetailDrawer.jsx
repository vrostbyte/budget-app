import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import useBudgetStore from '../../store/budgetStore.js';
import { isBillOnDate, isIncomeOnDate, isAdhocExpenseOnDate, getBillEffectiveAmount } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';
import ColorBalance from '../shared/ColorBalance.jsx';

function DrawerContent({ day, onClose, isMobile }) {
  const bills        = useBudgetStore(s => s.bills);
  const incomeEntries = useBudgetStore(s => s.incomeEntries);
  const adhocExpenses = useBudgetStore(s => s.adhocExpenses);
  const debtEntries  = useBudgetStore(s => s.debtEntries);

  const events = useMemo(() => {
    if (!day) return { income: [], expenses: [] };
    const income = incomeEntries
      .filter(inc => isIncomeOnDate(inc, day.date))
      .map(inc => ({ name: inc.name, amount: inc.amount, type: 'income' }));
    const bills_ = bills
      .filter(b => isBillOnDate(b, day.date))
      .map(b => ({ name: b.name, amount: getBillEffectiveAmount(b, debtEntries), type: 'bill' }));
    const adhoc_ = adhocExpenses
      .filter(e => isAdhocExpenseOnDate(e, day.date))
      .map(e => ({ name: e.name, amount: e.amount, type: 'adhoc' }));
    return { income, expenses: [...bills_, ...adhoc_] };
  }, [day, bills, incomeEntries, adhocExpenses, debtEntries]);

  const totalIncome   = events.income.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = events.expenses.reduce((s, e) => s + e.amount, 0);

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 py-16">
        <Calendar className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm">Select a day to see details</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Day Detail</p>
          <h3 className="text-base font-semibold text-slate-100 mt-0.5">
            {format(day.date, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* Balance */}
      <div className="card-neu-inset p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Running Balance</p>
        <ColorBalance value={day.balance} className="text-2xl" />
        <p className={`text-sm mt-1 font-medium tabular-nums ${
          day.dailyNet > 0 ? 'text-emerald-400' : day.dailyNet < 0 ? 'text-rose-400' : 'text-slate-500'
        }`}>
          {day.dailyNet === 0 ? 'No change' : (day.dailyNet > 0 ? '+' : '') + formatCurrency(day.dailyNet) + ' net'}
        </p>
      </div>

      {/* Income */}
      {events.income.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</p>
          </div>
          <div className="space-y-1.5">
            {events.income.map((e, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
                <span className="text-sm text-slate-300 truncate">{e.name}</span>
                <span className="text-sm font-semibold text-emerald-400 tabular-nums ml-2">{formatCurrency(e.amount)}</span>
              </div>
            ))}
            {events.income.length > 1 && (
              <div className="flex justify-between px-3 py-1">
                <span className="text-xs text-slate-500">Total income</span>
                <span className="text-xs font-semibold text-emerald-400 tabular-nums">{formatCurrency(totalIncome)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expenses */}
      {events.expenses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</p>
          </div>
          <div className="space-y-1.5">
            {events.expenses.map((e, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-rose-400/5 border border-rose-400/10">
                <span className="text-sm text-slate-300 truncate">{e.name}</span>
                <span className="text-sm font-semibold text-rose-400 tabular-nums ml-2">-{formatCurrency(e.amount)}</span>
              </div>
            ))}
            {events.expenses.length > 1 && (
              <div className="flex justify-between px-3 py-1">
                <span className="text-xs text-slate-500">Total expenses</span>
                <span className="text-xs font-semibold text-rose-400 tabular-nums">{formatCurrency(totalExpenses)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {events.income.length === 0 && events.expenses.length === 0 && (
        <p className="text-sm text-slate-600 text-center py-4">No activity on this day</p>
      )}
    </div>
  );
}

export default function DayDetailDrawer({ selectedDay, onClose, isMobile = false }) {
  if (isMobile) {
    return (
      <AnimatePresence>
        {selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-slate-900
                         border-t border-slate-700/50 max-h-[80vh] overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-600" />
              </div>
              <DrawerContent day={selectedDay} onClose={onClose} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: always-visible right pane
  return (
    <div className="card-neu h-full min-h-[400px] overflow-hidden flex flex-col">
      <DrawerContent day={selectedDay} onClose={onClose} isMobile={false} />
    </div>
  );
}
