import { useMemo } from 'react';
import useBudgetStore from '../../store/budgetStore.js';
import { formatCurrency } from '../../utils/formatters.js';

function EquityBar({ name, balance, assetValue, isConsolidated = false }) {
  const underwater = balance > assetValue;
  const debtPct    = Math.min((balance / assetValue) * 100, 100);
  const equityPct  = underwater ? 0 : ((assetValue - balance) / assetValue) * 100;
  const equityAmt  = assetValue - balance;

  const label = isConsolidated
    ? (underwater
        ? `All Asset Debts — underwater by ${formatCurrency(Math.abs(equityAmt))}`
        : `All Asset Debts — ${formatCurrency(equityAmt)} total equity`)
    : (underwater
        ? `${name} — underwater by ${formatCurrency(Math.abs(equityAmt))}`
        : `${name} — ${formatCurrency(equityAmt)} equity`);

  return (
    <div className="space-y-1">
      <p className={`text-xs font-medium truncate ${isConsolidated ? 'text-slate-300' : 'text-slate-400'}`}>
        {label}
      </p>
      <div className={`flex h-3 rounded-full overflow-hidden ${isConsolidated ? 'h-4' : ''}`}
           style={{ background: '#1e293b' }}>
        {/* Debt portion (red) */}
        <div
          style={{ width: `${debtPct.toFixed(2)}%`, background: '#fb7185' }}
          className="h-full transition-all duration-500"
        />
        {/* Equity portion (green) */}
        {!underwater && (
          <div
            style={{ width: `${equityPct.toFixed(2)}%`, background: '#34d399' }}
            className="h-full transition-all duration-500"
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Debt: {formatCurrency(balance)}</span>
        <span>Value: {formatCurrency(assetValue)}</span>
      </div>
    </div>
  );
}

export default function AssetEquityBars() {
  const debtEntries = useBudgetStore(s => s.debtEntries);

  const assetDebts = useMemo(
    () => debtEntries.filter(d =>
      (d.type === 'Auto Loan' || d.type === 'Mortgage') && d.assetValue > 0
    ),
    [debtEntries]
  );

  if (assetDebts.length === 0) return null;

  const consolidated = assetDebts.length >= 2 ? {
    balance:    assetDebts.reduce((s, d) => s + d.balance, 0),
    assetValue: assetDebts.reduce((s, d) => s + d.assetValue, 0),
  } : null;

  return (
    <div className="card-neu p-5 space-y-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        Asset-Backed Debt Overview
      </h3>
      {consolidated && (
        <EquityBar
          name="All"
          balance={consolidated.balance}
          assetValue={consolidated.assetValue}
          isConsolidated
        />
      )}
      <div className="space-y-4">
        {assetDebts.map(d => (
          <EquityBar key={d.id} name={d.name} balance={d.balance} assetValue={d.assetValue} />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm" style={{ background: '#fb7185' }} />Debt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm" style={{ background: '#34d399' }} />Equity
        </span>
      </div>
    </div>
  );
}
