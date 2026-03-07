import { motion } from 'framer-motion';
import useBudgetStore from '../../store/budgetStore.js';
import ColorBalance from '../shared/ColorBalance.jsx';

export default function HeroBalanceCard() {
  const accountBalance = useBudgetStore(s => s.accountBalance);
  const accountName    = useBudgetStore(s => s.accountName);

  const label = accountName ? `${accountName} (Checking)` : 'Current Checking Balance';

  const glowClass =
    accountBalance > 100 ? 'glow-emerald' :
    accountBalance > 0   ? '' :
                           'glow-rose';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card-neu p-6 ${glowClass}`}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      <ColorBalance value={accountBalance} large />
      <div className="mt-4 h-px bg-slate-700/40" />
      <p className="mt-3 text-xs text-slate-600">
        Starting balance — set via Add / Edit tab
      </p>
    </motion.div>
  );
}
