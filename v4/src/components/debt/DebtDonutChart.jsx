import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useBudgetStore from '../../store/budgetStore.js';
import { DEBT_TYPE_COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import EmptyState from '../shared/EmptyState.jsx';
import { PieChart as PieIcon } from 'lucide-react';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-300">{name}</p>
      <p className="font-semibold text-slate-100">{formatCurrency(value)}</p>
    </div>
  );
}

export default function DebtDonutChart() {
  const debtEntries = useBudgetStore(s => s.debtEntries);

  const { data, total } = useMemo(() => {
    const byType = {};
    debtEntries.forEach(d => {
      byType[d.type] = (byType[d.type] || 0) + d.balance;
    });
    const data = Object.entries(byType).map(([type, value]) => ({
      name: type,
      value,
      color: DEBT_TYPE_COLORS[type] || '#94a3b8',
    }));
    const total = debtEntries.reduce((s, d) => s + d.balance, 0);
    return { data, total };
  }, [debtEntries]);

  if (data.length === 0) {
    return (
      <div className="card-neu p-5">
        <EmptyState icon={PieIcon} message="No debt accounts to chart" />
      </div>
    );
  }

  return (
    <div className="card-neu p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Debt by Type</h3>
      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="72%"
              dataKey="value"
              strokeWidth={0}
            >
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center text */}
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
              style={{ fill: '#94a3b8', fontSize: '11px' }}>Total</text>
            <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle"
              style={{ fill: '#f1f5f9', fontSize: '15px', fontWeight: '700' }}>
              {formatCurrency(total)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
