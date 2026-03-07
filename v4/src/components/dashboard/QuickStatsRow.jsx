import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Receipt, CreditCard } from 'lucide-react';
import useBudgetStore from '../../store/budgetStore.js';
import { getBillEffectiveAmount } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';

function StatChip({ icon: Icon, label, value, colorClass = 'text-slate-100', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.2 }}
      className="card-neu-inset flex items-center gap-3 px-4 py-3 min-w-0"
    >
      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-sm font-semibold tabular-nums ${colorClass}`}>{value}</p>
      </div>
    </motion.div>
  );
}

export default function QuickStatsRow() {
  const incomeEntries    = useBudgetStore(s => s.incomeEntries);
  const bills            = useBudgetStore(s => s.bills);
  const debtEntries      = useBudgetStore(s => s.debtEntries);
  const projectionLength = useBudgetStore(s => s.projectionLength);

  const stats = useMemo(() => {
    const monthlyIncome = incomeEntries.reduce((sum, inc) => {
      switch (inc.frequency) {
        case 'Weekly':    return sum + inc.amount * (52 / 12);
        case 'Bi-weekly': return sum + inc.amount * (26 / 12);
        case 'Monthly':   return sum + inc.amount;
        case 'One-time':  return sum + inc.amount / Math.max(projectionLength, 1);
        default:          return sum;
      }
    }, 0);
    const monthlyBills = bills.reduce((sum, b) => sum + getBillEffectiveAmount(b, debtEntries), 0);
    const totalDebt = debtEntries.reduce((sum, d) => sum + d.balance, 0);
    return { monthlyIncome, monthlyBills, totalDebt };
  }, [incomeEntries, bills, debtEntries, projectionLength]);

  return (
    <div className="flex flex-col gap-3">
      <StatChip index={0} icon={TrendingUp} label="Est. Monthly Income"
        value={formatCurrency(stats.monthlyIncome)} colorClass="text-emerald-400" />
      <StatChip index={1} icon={Receipt} label="Monthly Bills"
        value={formatCurrency(stats.monthlyBills)} colorClass="text-rose-400" />
      <StatChip index={2} icon={CreditCard} label="Total Debt"
        value={formatCurrency(stats.totalDebt)}
        colorClass={stats.totalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'} />
    </div>
  );
}
