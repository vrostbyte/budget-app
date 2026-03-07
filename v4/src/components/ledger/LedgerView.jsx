import { useState } from 'react';
import { LayoutList, Table2 } from 'lucide-react';
import LedgerFeed from './LedgerFeed.jsx';
import LedgerTable from './LedgerTable.jsx';
import DayDetailDrawer from './DayDetailDrawer.jsx';

export default function LedgerView() {
  const [selectedDay, setSelectedDay]   = useState(null);
  const [tableMode, setTableMode]       = useState(false);
  const [hideEmpty, setHideEmpty]       = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);  // mobile only

  function handleSelectDay(day) {
    setSelectedDay(day);
    setDrawerOpen(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="px-4 md:px-6 py-3 border-b border-slate-700/50 flex items-center justify-between gap-3 shrink-0">
        <h2 className="text-sm font-semibold text-slate-300">Running Budget Ledger</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-cyan-400"
              checked={hideEmpty}
              onChange={e => setHideEmpty(e.target.checked)}
            />
            Activity only
          </label>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={() => setTableMode(false)}
              className={`p-1.5 rounded-md transition-colors ${!tableMode ? 'bg-slate-700 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              aria-label="Feed view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTableMode(true)}
              className={`p-1.5 rounded-md transition-colors ${tableMode ? 'bg-slate-700 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              aria-label="Table view"
            >
              <Table2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: split pane; Mobile: single col */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_380px]">
        {/* Left: feed or table */}
        <div className="overflow-y-auto p-4 md:p-5">
          {tableMode ? (
            <LedgerTable selectedDay={selectedDay} onSelectDay={handleSelectDay} />
          ) : (
            <LedgerFeed selectedDay={selectedDay} onSelectDay={handleSelectDay} hideEmpty={hideEmpty} />
          )}
        </div>

        {/* Right: persistent detail pane (desktop only) */}
        <div className="hidden md:block border-l border-slate-700/50 overflow-y-auto p-4">
          <DayDetailDrawer selectedDay={selectedDay} onClose={() => setSelectedDay(null)} />
        </div>
      </div>

      {/* Mobile modal drawer */}
      <DayDetailDrawer
        selectedDay={drawerOpen ? selectedDay : null}
        onClose={() => setDrawerOpen(false)}
        isMobile
      />
    </div>
  );
}
