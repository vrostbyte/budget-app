import { format } from 'date-fns';
import { useRunningTotals } from '../../hooks/useRunningTotals.js';
import EmptyState from '../shared/EmptyState.jsx';
import { ScrollText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function LedgerTable({ selectedDay, onSelectDay }) {
  const runningTotals = useRunningTotals();

  if (runningTotals.length === 0) {
    return <EmptyState icon={ScrollText} message="No data to display" />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/80">
            <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Date</th>
            <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Events</th>
            <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Daily Net</th>
            <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody>
          {runningTotals.map(item => {
            const isSelected = selectedDay?.date?.toDateString() === item.date.toDateString();
            const hasActivity = item.event !== '';
            const netColor =
              item.dailyNet > 0 ? 'text-emerald-400' :
              item.dailyNet < 0 ? 'text-rose-400'    : 'text-slate-500';
            const balColor =
              item.balance > 100 ? 'text-emerald-400' :
              item.balance > 0   ? 'text-amber-400'   : 'text-rose-400';

            return (
              <tr
                key={item.date.toISOString()}
                onClick={() => onSelectDay(item)}
                className={`border-b border-slate-800/50 cursor-pointer transition-colors duration-100
                            ${isSelected ? 'bg-slate-700/60' : hasActivity ? 'hover:bg-slate-800/60' : 'opacity-50 hover:opacity-80 hover:bg-slate-800/30'}`}
              >
                <td className="px-4 py-2 text-slate-400 whitespace-nowrap text-xs">
                  {format(item.date, 'EEE, MMM d, yyyy')}
                </td>
                <td className="px-4 py-2 text-slate-300 max-w-xs truncate">{item.event || '—'}</td>
                <td className={`px-4 py-2 text-right tabular-nums font-medium ${netColor}`}>
                  {item.dailyNet !== 0 ? (item.dailyNet > 0 ? '+' : '') + formatCurrency(item.dailyNet) : '—'}
                </td>
                <td className={`px-4 py-2 text-right tabular-nums font-semibold ${balColor}`}>
                  {formatCurrency(item.balance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
