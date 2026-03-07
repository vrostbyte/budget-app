import DebtSummaryCard from './DebtSummaryCard.jsx';
import DebtDonutChart from './DebtDonutChart.jsx';
import AssetEquityBars from './AssetEquityBars.jsx';
import DebtTable from './DebtTable.jsx';

export default function DebtView() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <DebtSummaryCard />
        <DebtDonutChart />
      </div>
      <AssetEquityBars />
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Debt Accounts
        </h2>
        <DebtTable />
      </div>
    </div>
  );
}
