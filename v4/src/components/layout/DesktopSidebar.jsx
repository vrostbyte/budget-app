import { useState } from 'react';
import { LayoutDashboard, ScrollText, PlusCircle, Landmark, BarChart3,
         Download, Upload, RotateCcw, Sparkles } from 'lucide-react';
import useBudgetStore from '../../store/budgetStore.js';
import { downloadJSON } from '../../utils/fileIO.js';
import { readJSONFile } from '../../utils/fileIO.js';
import toast from 'react-hot-toast';
import ConfirmDialog from '../shared/ConfirmDialog.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'ledger',    label: 'Ledger',     Icon: ScrollText },
  { id: 'add',       label: 'Add / Edit', Icon: PlusCircle },
  { id: 'debt',      label: 'Debt',       Icon: Landmark },
  { id: 'charts',    label: 'Charts',     Icon: BarChart3 },
];

export default function DesktopSidebar() {
  const activeTab    = useBudgetStore(s => s.activeTab);
  const setActiveTab = useBudgetStore(s => s.setActiveTab);
  const exportData   = useBudgetStore(s => s.exportData);
  const importData   = useBudgetStore(s => s.importData);
  const resetAll     = useBudgetStore(s => s.resetAll);
  const loadSampleData = useBudgetStore(s => s.loadSampleData);

  const [resetConfirm, setResetConfirm] = useState(false);

  function handleExport() {
    downloadJSON(exportData());
    toast.success('Data exported');
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async e => {
      try {
        const data = await readJSONFile(e.target.files[0]);
        importData(data);
        toast.success('Data imported successfully');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    input.click();
  }

  return (
    <>
      <ConfirmDialog
        open={resetConfirm}
        message="Reset all data? This cannot be undone."
        confirmLabel="Reset"
        onConfirm={() => { resetAll(); setResetConfirm(false); toast.success('Data reset'); }}
        onCancel={() => setResetConfirm(false)}
      />
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-slate-900
                        border-r border-slate-700/50 z-30 select-none">
        {/* App title */}
        <div className="px-5 py-6 border-b border-slate-700/50">
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">
            <span className="text-cyan-400">◈</span> Budget App
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">v4.0 — Cyber Edition</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                            font-medium transition-all duration-150
                            ${active
                              ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent'
                            }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 pt-3 border-t border-slate-700/50 space-y-1">
          <button
            onClick={() => { loadSampleData(); toast.success('Sample data loaded'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400
                       hover:text-fuchsia-400 hover:bg-slate-800 transition-all duration-150"
          >
            <Sparkles className="w-4 h-4" /> Load Sample Data
          </button>
          <button
            onClick={handleImport}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400
                       hover:text-cyan-400 hover:bg-slate-800 transition-all duration-150"
          >
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400
                       hover:text-emerald-400 hover:bg-slate-800 transition-all duration-150"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button
            onClick={() => setResetConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400
                       hover:text-rose-400 hover:bg-slate-800 transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </aside>
    </>
  );
}
