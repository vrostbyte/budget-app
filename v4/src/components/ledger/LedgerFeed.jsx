import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRunningTotals } from '../../hooks/useRunningTotals.js';
import ColorBalance from '../shared/ColorBalance.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { ScrollText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

function DayCard({ item, index, isSelected, onClick }) {
  const hasActivity = item.event !== '';
  const netColor =
    item.dailyNet > 0 ? 'text-emerald-400' :
    item.dailyNet < 0 ? 'text-rose-400'    :
                        'text-slate-500';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.008, 0.3), duration: 0.18 }}
      onClick={() => onClick(item)}
      className={`w-full text-left rounded-xl px-4 py-3 border transition-all duration-150
                  ${isSelected
                    ? 'bg-slate-800 border-cyan-400/40 glow-cyan'
                    : hasActivity
                      ? 'card-neu hover:bg-slate-800'
                      : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/60'
                  }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-xs font-medium mb-0.5 ${hasActivity ? 'text-slate-300' : 'text-slate-600'}`}>
            {format(item.date, 'EEE, MMM d, yyyy')}
          </p>
          <p className={`text-sm truncate ${hasActivity ? 'text-slate-200' : 'text-slate-600'}`}>
            {item.event || '—'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xs font-semibold tabular-nums ${netColor}`}>
            {item.dailyNet !== 0 ? (item.dailyNet > 0 ? '+' : '') + formatCurrency(item.dailyNet) : '—'}
          </p>
          <ColorBalance value={item.balance} className="text-sm" />
        </div>
      </div>
    </motion.button>
  );
}

export default function LedgerFeed({ selectedDay, onSelectDay, hideEmpty = false }) {
  const runningTotals = useRunningTotals();

  if (runningTotals.length === 0) {
    return (
      <div className="card-neu">
        <EmptyState icon={ScrollText} message="No projection — set a start date and add entries" />
      </div>
    );
  }

  const days = hideEmpty ? runningTotals.filter(d => d.event !== '') : runningTotals;

  return (
    <div className="space-y-1.5">
      {days.map((item, i) => (
        <DayCard
          key={item.date.toISOString()}
          item={item}
          index={i}
          isSelected={selectedDay?.date?.toDateString() === item.date.toDateString()}
          onClick={onSelectDay}
        />
      ))}
    </div>
  );
}
