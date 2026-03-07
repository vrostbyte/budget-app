import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { TrendingDown } from 'lucide-react';
import { useRunningTotals } from '../../hooks/useRunningTotals.js';
import ColorBalance from '../shared/ColorBalance.jsx';
import EmptyState from '../shared/EmptyState.jsx';

export default function LowestBalanceCards() {
  const runningTotals = useRunningTotals();

  const monthlyLows = useMemo(() => {
    const map = {};
    runningTotals.forEach(item => {
      const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key] || item.balance < map[key].balance) {
        map[key] = { date: new Date(item.date), balance: item.balance };
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [runningTotals]);

  if (monthlyLows.length === 0) {
    return (
      <div className="card-neu">
        <EmptyState icon={TrendingDown} message="No projection — set a start date and add entries" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Lowest Balance by Month
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory
                      md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0">
        {monthlyLows.map((item, i) => {
          const borderColor =
            item.balance > 100 ? 'border-emerald-400/20' :
            item.balance > 0   ? 'border-amber-400/20'   :
                                 'border-rose-400/20';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={`card-neu p-4 shrink-0 w-44 md:w-auto snap-start border ${borderColor}`}
            >
              <p className="text-xs font-semibold text-slate-400 mb-1 truncate">
                {format(item.date, 'MMMM yyyy')}
              </p>
              <ColorBalance value={item.balance} className="text-lg" />
              <p className="text-[11px] text-slate-600 mt-1">
                {format(item.date, 'EEE, MMM d')}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
