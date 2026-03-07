import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useBudgetStore from '../../store/budgetStore.js';
import { calculateTotalExpenses } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';
import EmptyState from '../shared/EmptyState.jsx';
import { BarChart3 } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-slate-100">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function ExpensesBarChart() {
  const state = useBudgetStore(s => ({
    bills: s.bills, adhocExpenses: s.adhocExpenses,
    debtEntries: s.debtEntries, projectionLength: s.projectionLength,
  }));

  const data = useMemo(() => {
    const totals = calculateTotalExpenses(state);
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [state]);

  if (data.length === 0) {
    return <EmptyState icon={BarChart3} message="No expense data to display" />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 80, left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 10 }}
          angle={-40}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
        <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
