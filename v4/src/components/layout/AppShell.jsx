import { AnimatePresence, motion } from 'framer-motion';
import useBudgetStore from '../../store/budgetStore.js';
import DesktopSidebar from './DesktopSidebar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import DashboardView from '../dashboard/DashboardView.jsx';
import LedgerView from '../ledger/LedgerView.jsx';
import InputsView from '../inputs/InputsView.jsx';
import DebtView from '../debt/DebtView.jsx';
import ChartsView from '../charts/ChartsView.jsx';
import Toast from '../shared/Toast.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.12, ease: 'easeIn' } },
};

function TabContent({ activeTab }) {
  switch (activeTab) {
    case 'dashboard': return <DashboardView />;
    case 'ledger':    return <LedgerView />;
    case 'add':       return <InputsView />;
    case 'debt':      return <DebtView />;
    case 'charts':    return <ChartsView />;
    default:          return <DashboardView />;
  }
}

export default function AppShell() {
  const activeTab = useBudgetStore(s => s.activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toast />
      <DesktopSidebar />

      {/* Main content area — offset by sidebar on desktop */}
      <main className="md:pl-60 pb-16 md:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            <TabContent activeTab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileBottomNav />
    </div>
  );
}
