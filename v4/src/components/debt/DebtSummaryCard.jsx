import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useBudgetStore from '../../store/budgetStore.js';
import { calculatePayoffMonths, formatPayoffMonths } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';

function Metric({ label, value, colorClass = 'text-slate-100', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="card-neu-inset px-4 py-3"
    >
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${colorClass}`}>{value}</p>
    </motion.div>
  );
}

export default function DebtSummaryCard() {
  const debtEntries = useBudgetStore(s => s.debtEntries);

  const metrics = useMemo(() => {
    if (debtEntries.length === 0) return null;
    const totalDebt        = debtEntries.reduce((s, d) => s + d.balance, 0);
    const totalMin         = debtEntries.reduce((s, d) => s + d.minPayment, 0);
    const totalActual      = debtEntries.reduce((s, d) => s + d.actualPayment, 0);
    const weightedApr      = totalDebt > 0
      ? debtEntries.reduce((s, d) => s + d.apr * d.balance, 0) / totalDebt
      : 0;

    let maxMonths = 0;
    let hasInfinite = false;
    debtEntries.forEach(d => {
      const m = calculatePayoffMonths(d.balance, d.apr, d.actualPayment);
      if (m === Infinity) { hasInfinite = true; }
      else if (m > maxMonths) { maxMonths = m; }
    });

    let debtFreeDate = 'N/A';
    if (hasInfinite) {
      debtFreeDate = 'Never (↑ payments)';
    } else if (maxMonths > 0) {
      const future = new Date();
      future.setMonth(future.getMonth() + maxMonths);
      debtFreeDate = future.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    return { totalDebt, totalMin, totalActual, weightedApr, count: debtEntries.length, debtFreeDate };
  }, [debtEntries]);

  if (!metrics) {
    return (
      <div className="card-neu p-5">
        <p className="text-slate-500 text-sm text-center py-4">No debt accounts yet</p>
      </div>
    );
  }

  return (
    <div className="card-neu p-5 space-y-3">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Debt Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric index={0} label="Total Debt"          value={formatCurrency(metrics.totalDebt)}    colorClass="text-rose-400" />
        <Metric index={1} label="Min Payments/mo"     value={formatCurrency(metrics.totalMin)}      colorClass="text-amber-400" />
        <Metric index={2} label="Actual Payments/mo"  value={formatCurrency(metrics.totalActual)}   colorClass="text-slate-100" />
        <Metric index={3} label="Weighted APR"        value={`${metrics.weightedApr.toFixed(2)}%`}  colorClass="text-fuchsia-400" />
        <Metric index={4} label="Accounts"            value={metrics.count}                         colorClass="text-cyan-400" />
        <Metric index={5} label="Debt-Free Est."      value={metrics.debtFreeDate}                  colorClass="text-emerald-400" />
      </div>
    </div>
  );
}
