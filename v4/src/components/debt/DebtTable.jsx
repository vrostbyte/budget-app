import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import { calculatePayoffMonths, formatPayoffMonths } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';
import EmptyState from '../shared/EmptyState.jsx';
import ConfirmDialog from '../shared/ConfirmDialog.jsx';
import { Landmark } from 'lucide-react';

const COLUMNS = [
  { key: 'name',          label: 'Name' },
  { key: 'type',          label: 'Type' },
  { key: 'balance',       label: 'Balance',       numeric: true },
  { key: 'apr',           label: 'APR %',         numeric: true },
  { key: 'minPayment',    label: 'Min Pmt',        numeric: true },
  { key: 'actualPayment', label: 'Actual Pmt',    numeric: true },
  { key: 'payoffMonths',  label: 'Payoff',        numeric: true },
];

function SortIcon({ col, sortCol, sortDir }) {
  if (col !== sortCol) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-cyan-400" />
    : <ChevronDown className="w-3 h-3 text-cyan-400" />;
}

export default function DebtTable() {
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const deleteDebt  = useBudgetStore(s => s.deleteDebt);
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [confirm, setConfirm] = useState({ open: false, index: null });

  function handleSort(key) {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
  }

  const sorted = useMemo(() => {
    return [...debtEntries].map((d, i) => ({ ...d, _i: i })).sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'payoffMonths':
          av = calculatePayoffMonths(a.balance, a.apr, a.actualPayment);
          bv = calculatePayoffMonths(b.balance, b.apr, b.actualPayment);
          if (av === Infinity && bv === Infinity) return 0;
          if (av === Infinity) return 1;
          if (bv === Infinity) return -1;
          break;
        case 'balance':       av = a.balance;       bv = b.balance;       break;
        case 'apr':           av = a.apr;           bv = b.apr;           break;
        case 'minPayment':    av = a.minPayment;    bv = b.minPayment;    break;
        case 'actualPayment': av = a.actualPayment; bv = b.actualPayment; break;
        case 'type':          av = a.type;          bv = b.type;          break;
        default:              av = a.name.toLowerCase(); bv = b.name.toLowerCase();
      }
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [debtEntries, sortCol, sortDir]);

  if (debtEntries.length === 0) {
    return <EmptyState icon={Landmark} message="No debt accounts added yet" />;
  }

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message="Delete this debt account? Linked bills will be unlinked and their amounts frozen."
        onConfirm={() => {
          deleteDebt(confirm.index);
          setConfirm({ open: false, index: null });
          toast.success('Debt deleted');
        }}
        onCancel={() => setConfirm({ open: false, index: null })}
      />
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-900/80">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-2.5 text-xs text-slate-500 font-medium cursor-pointer
                              hover:text-slate-300 transition-colors select-none
                              ${col.numeric ? 'text-right' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {!col.numeric && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                    {col.label}
                    {col.numeric && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-xs text-slate-500 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(debt => {
              const months = calculatePayoffMonths(debt.balance, debt.apr, debt.actualPayment);
              const payoffClass = months === Infinity ? 'text-rose-400' : months <= 12 ? 'text-emerald-400' : 'text-slate-300';
              return (
                <tr key={debt.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 text-slate-200 font-medium">{debt.name}</td>
                  <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{debt.type}</td>
                  <td className="px-4 py-2.5 text-right text-rose-400 tabular-nums font-medium">{formatCurrency(debt.balance)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300 tabular-nums">{debt.apr.toFixed(2)}%</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums">{formatCurrency(debt.minPayment)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300 tabular-nums font-medium">{formatCurrency(debt.actualPayment)}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${payoffClass}`}>{formatPayoffMonths(months)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setConfirm({ open: true, index: debt._i })}
                      className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
