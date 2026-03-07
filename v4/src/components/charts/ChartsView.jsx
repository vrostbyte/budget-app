import ExpensesBarChart from './ExpensesBarChart.jsx';
import CategoryBarChart from './CategoryBarChart.jsx';

export default function ChartsView() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      <div className="card-neu p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Expenses Breakdown (Projection Period)
        </h3>
        <ExpensesBarChart />
      </div>
      <div className="card-neu p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Expenses by Category (Projection Period)
        </h3>
        <CategoryBarChart />
      </div>
    </div>
  );
}
