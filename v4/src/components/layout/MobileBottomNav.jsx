import { LayoutDashboard, ScrollText, PlusCircle, Landmark, BarChart3 } from 'lucide-react';
import useBudgetStore from '../../store/budgetStore.js';

const NAV_ITEMS = [
  { id: 'dashboard', Icon: LayoutDashboard, label: 'Home' },
  { id: 'ledger',    Icon: ScrollText,      label: 'Ledger' },
  { id: 'add',       Icon: PlusCircle,      label: 'Add',   fab: true },
  { id: 'debt',      Icon: Landmark,        label: 'Debt' },
  { id: 'charts',    Icon: BarChart3,       label: 'Charts' },
];

export default function MobileBottomNav() {
  const activeTab    = useBudgetStore(s => s.activeTab);
  const setActiveTab = useBudgetStore(s => s.setActiveTab);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900
                    border-t border-slate-700/50
                    shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ id, Icon, label, fab }) => {
          const active = activeTab === id;
          if (fab) {
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-label={label}
                className={`flex items-center justify-center w-12 h-12 rounded-full
                            transition-all duration-200 -mt-4
                            ${active
                              ? 'bg-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                              : 'bg-cyan-400/80 text-slate-900 hover:bg-cyan-400'
                            }`}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-label={label}
              className="flex flex-col items-center gap-1 px-3 py-1 min-h-[44px] min-w-[44px] justify-center"
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-150
                            ${active ? 'text-cyan-400' : 'text-slate-500'}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-150
                            ${active ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
