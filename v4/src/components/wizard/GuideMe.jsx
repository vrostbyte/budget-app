import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import useBudgetStore from '../../store/budgetStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import { parseMathExpression } from '../../utils/engine.js';
import WizardProgress from './WizardProgress.jsx';
import WizardStep from './WizardStep.jsx';
import BillForm from '../inputs/BillForm.jsx';
import IncomeForm from '../inputs/IncomeForm.jsx';
import AdhocForm from '../inputs/AdhocForm.jsx';
import AdjustmentForm from '../inputs/AdjustmentForm.jsx';
import DebtForm from '../inputs/DebtForm.jsx';
import AmountInput from '../shared/AmountInput.jsx';
import ConfirmDialog from '../shared/ConfirmDialog.jsx';

const STEP_LABELS = ['Initial Setup', 'Income', 'Debt', 'Expenses', 'One-Offs', 'Review'];
const TOTAL_STEPS = 6;

function captureSnapshot(state) {
  return {
    billsLen:   state.bills.length,
    incomeLen:  state.incomeEntries.length,
    adhocLen:   state.adhocExpenses.length,
    debtLen:    state.debtEntries.length,
    adjustLen:  state.runningBudgetAdjustments.length,
    accountBalance: state.accountBalance,
    accountName:    state.accountName,
    startDate:      state.startDate,
    projectionLength: state.projectionLength,
  };
}

// ─── Step 1: Initial Setup ────────────────────────────────────
function Step1({ onStartFresh }) {
  const accountBalance   = useBudgetStore(s => s.accountBalance);
  const accountName      = useBudgetStore(s => s.accountName);
  const startDate        = useBudgetStore(s => s.startDate);
  const projectionLength = useBudgetStore(s => s.projectionLength);
  const setAccountBalance   = useBudgetStore(s => s.setAccountBalance);
  const setAccountName      = useBudgetStore(s => s.setAccountName);
  const setStartDate        = useBudgetStore(s => s.setStartDate);
  const setProjectionLength = useBudgetStore(s => s.setProjectionLength);

  const startDateStr = startDate
    ? (typeof startDate === 'string'
        ? startDate.split('T')[0]
        : new Date(startDate).toISOString().split('T')[0])
    : '';

  return (
    <WizardStep
      headline="Let's get started"
      guidance="Set up your account basics. You can change these any time in the Inputs tab."
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Account Name</label>
          <input
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="e.g. Household Checking"
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Starting Balance ($)</label>
          <AmountInput
            value={accountBalance}
            onChange={v => setAccountBalance(v)}
            className="w-full"
            placeholder="e.g. 2500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
          <input
            type="date"
            value={startDateStr}
            onChange={e => setStartDate(
              e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null
            )}
            className="card-neu-inset w-full px-3 py-2 text-sm text-slate-100 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Projection Length ({projectionLength} months)
          </label>
          <input
            type="range"
            min={1}
            max={12}
            value={projectionLength}
            onChange={e => setProjectionLength(Number(e.target.value))}
            className="w-full accent-cyan-400 mt-1"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
            <span>1 mo</span><span>12 mo</span>
          </div>
        </div>
      </div>
      <div className="pt-1">
        <button
          type="button"
          onClick={onStartFresh}
          className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
        >
          Start Fresh? (clear all existing data and begin from scratch)
        </button>
      </div>
    </WizardStep>
  );
}

// ─── Step 2: Income ───────────────────────────────────────────
function Step2({ snapshot }) {
  const incomeEntries = useBudgetStore(s => s.incomeEntries);
  const deleteIncome  = useBudgetStore(s => s.deleteIncome);
  const sessionItems  = incomeEntries.slice(snapshot.incomeLen);

  return (
    <WizardStep
      headline="Income sources"
      guidance="Add your regular income streams — paychecks, side income, or anything that hits your account on a schedule."
    >
      {sessionItems.length > 0 && (
        <div className="space-y-1 mb-1">
          {sessionItems.map((inc, si) => (
            <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{inc.name}</p>
                <p className="text-xs text-slate-500">{inc.frequency}</p>
              </div>
              <span className="text-sm text-emerald-400 tabular-nums shrink-0">
                {formatCurrency(inc.amount)}
              </span>
              <button
                type="button"
                onClick={() => deleteIncome(snapshot.incomeLen + si)}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <IncomeForm onDone={undefined} />
    </WizardStep>
  );
}

// ─── Step 3: Debt ─────────────────────────────────────────────
function Step3({ snapshot, onSkip }) {
  const debtEntries = useBudgetStore(s => s.debtEntries);
  const deleteDebt  = useBudgetStore(s => s.deleteDebt);
  const sessionItems = debtEntries.slice(snapshot.debtLen);

  return (
    <WizardStep
      headline="Debt accounts"
      guidance="Add credit cards, auto loans, student loans, mortgages — any balance you're paying down."
    >
      {sessionItems.length > 0 && (
        <div className="space-y-1 mb-1">
          {sessionItems.map((debt, si) => (
            <div key={debt.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{debt.name}</p>
                <p className="text-xs text-slate-500">{debt.type} · {debt.apr}% APR</p>
              </div>
              <span className="text-sm text-rose-400 tabular-nums shrink-0">
                {formatCurrency(debt.balance)}
              </span>
              <button
                type="button"
                onClick={() => deleteDebt(snapshot.debtLen + si)}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <DebtForm onDone={undefined} />
      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1 mt-1"
      >
        <SkipForward className="w-3 h-3" /> Skip this step
      </button>
    </WizardStep>
  );
}

// ─── Step 4: Bills ────────────────────────────────────────────
function Step4({ snapshot }) {
  const bills      = useBudgetStore(s => s.bills);
  const deleteBill = useBudgetStore(s => s.deleteBill);
  const sessionItems = bills.slice(snapshot.billsLen);

  return (
    <WizardStep
      headline="Recurring bills"
      guidance="Add monthly bills by the day they're due. Bills set to day 31 automatically trigger on the last day of shorter months."
    >
      {sessionItems.length > 0 && (
        <div className="space-y-1 mb-1">
          {sessionItems.map((bill, si) => (
            <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{bill.name}</p>
                <p className="text-xs text-slate-500">Day {bill.date} · {bill.category || 'Uncategorized'}</p>
              </div>
              <span className="text-sm text-rose-400 tabular-nums shrink-0">
                {formatCurrency(bill.amount)}
              </span>
              <button
                type="button"
                onClick={() => deleteBill(snapshot.billsLen + si)}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <BillForm onDone={undefined} />
    </WizardStep>
  );
}

// ─── Step 5: One-Offs ─────────────────────────────────────────
function Step5({ snapshot, onSkip }) {
  const [type, setType] = useState('expense');
  const adhocExpenses  = useBudgetStore(s => s.adhocExpenses);
  const adjustments    = useBudgetStore(s => s.runningBudgetAdjustments);
  const deleteAdhoc    = useBudgetStore(s => s.deleteAdhoc);
  const deleteAdjustment = useBudgetStore(s => s.deleteAdjustment);
  const sessionAdhoc   = adhocExpenses.slice(snapshot.adhocLen);
  const sessionAdjust  = adjustments.slice(snapshot.adjustLen);

  return (
    <WizardStep
      headline="One-off items"
      guidance="Add any upcoming one-time expenses (car registration, vacation) or expected credits (tax refund, bonus)."
    >
      {/* Combined session list */}
      {(sessionAdhoc.length > 0 || sessionAdjust.length > 0) && (
        <div className="space-y-1 mb-1">
          {sessionAdhoc.map((exp, si) => (
            <div key={'e' + si} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{exp.name}</p>
                <p className="text-xs text-slate-500">{exp.date}</p>
              </div>
              <span className="text-sm text-rose-400 tabular-nums shrink-0">
                {formatCurrency(exp.amount)}
              </span>
              <button
                type="button"
                onClick={() => deleteAdhoc(snapshot.adhocLen + si)}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {sessionAdjust.map((adj, si) => (
            <div key={'a' + si} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{adj.event}</p>
                <p className="text-xs text-slate-500">{adj.date}</p>
              </div>
              <span className={`text-sm tabular-nums shrink-0 font-medium
                              ${adj.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
              </span>
              <button
                type="button"
                onClick={() => deleteAdjustment(snapshot.adjustLen + si)}
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex gap-1 p-1 card-neu-inset rounded-xl">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                     ${type === 'expense'
                       ? 'bg-rose-500/20 text-rose-400'
                       : 'text-slate-500 hover:text-slate-300'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                     ${type === 'income'
                       ? 'bg-emerald-500/20 text-emerald-400'
                       : 'text-slate-500 hover:text-slate-300'}`}
        >
          Income / Credit
        </button>
      </div>

      {type === 'expense'
        ? <AdhocForm onDone={undefined} />
        : <AdjustmentForm onDone={undefined} />
      }

      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1"
      >
        <SkipForward className="w-3 h-3" /> Skip this step
      </button>
    </WizardStep>
  );
}

// ─── Step 6: Review ───────────────────────────────────────────
function Step6({ snapshot }) {
  const bills            = useBudgetStore(s => s.bills);
  const incomeEntries    = useBudgetStore(s => s.incomeEntries);
  const debtEntries      = useBudgetStore(s => s.debtEntries);
  const adhocExpenses    = useBudgetStore(s => s.adhocExpenses);
  const adjustments      = useBudgetStore(s => s.runningBudgetAdjustments);
  const accountBalance   = useBudgetStore(s => s.accountBalance);
  const accountName      = useBudgetStore(s => s.accountName);
  const projectionLength = useBudgetStore(s => s.projectionLength);

  const monthlyIncome = incomeEntries.reduce((sum, inc) => {
    if (inc.frequency === 'Weekly')    return sum + inc.amount * 52 / 12;
    if (inc.frequency === 'Bi-weekly') return sum + inc.amount * 26 / 12;
    if (inc.frequency === 'Monthly')   return sum + inc.amount;
    if (inc.frequency === 'One-time')  return sum + inc.amount / projectionLength;
    return sum;
  }, 0);

  const monthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalDebt    = debtEntries.reduce((sum, d) => sum + d.balance, 0);
  const oneOffCount  = adhocExpenses.length + adjustments.length;

  const sessionAdded = {
    income: incomeEntries.length - snapshot.incomeLen,
    debt:   debtEntries.length   - snapshot.debtLen,
    bills:  bills.length         - snapshot.billsLen,
    oneOff: (adhocExpenses.length - snapshot.adhocLen) + (adjustments.length - snapshot.adjustLen),
  };

  return (
    <WizardStep
      headline="You're all set!"
      guidance="Here's a snapshot of your budget. Everything looks right? Hit Complete to start tracking."
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="card-neu-inset p-3">
          <p className="text-xs text-slate-500 mb-0.5">Account</p>
          <p className="text-sm text-slate-200 font-medium truncate">{accountName || '—'}</p>
          <p className="text-xs text-emerald-400 mt-0.5">{formatCurrency(accountBalance)}</p>
        </div>
        <div className="card-neu-inset p-3">
          <p className="text-xs text-slate-500 mb-0.5">Monthly Income</p>
          <p className="text-sm text-slate-200 font-medium">{incomeEntries.length} streams</p>
          <p className="text-xs text-emerald-400 mt-0.5">~{formatCurrency(monthlyIncome)}/mo</p>
        </div>
        <div className="card-neu-inset p-3">
          <p className="text-xs text-slate-500 mb-0.5">Debt Accounts</p>
          <p className="text-sm text-slate-200 font-medium">{debtEntries.length} accounts</p>
          <p className="text-xs text-rose-400 mt-0.5">{formatCurrency(totalDebt)} total</p>
        </div>
        <div className="card-neu-inset p-3">
          <p className="text-xs text-slate-500 mb-0.5">Monthly Bills</p>
          <p className="text-sm text-slate-200 font-medium">{bills.length} bills</p>
          <p className="text-xs text-rose-400 mt-0.5">{formatCurrency(monthlyBills)}/mo</p>
        </div>
        <div className="card-neu-inset p-3 col-span-2">
          <p className="text-xs text-slate-500 mb-0.5">One-Off Items</p>
          <p className="text-sm text-slate-200 font-medium">{oneOffCount} item{oneOffCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {Object.values(sessionAdded).some(v => v > 0) && (
        <p className="text-xs text-cyan-400/70 text-center">
          Added this session: {sessionAdded.income} income · {sessionAdded.debt} debts ·{' '}
          {sessionAdded.bills} bills · {sessionAdded.oneOff} one-offs
        </p>
      )}
    </WizardStep>
  );
}

// ─── Main GuideMe Wizard ─────────────────────────────────────
const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ?  40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:   (dir) => ({ x: dir > 0 ? -40 :  40, opacity: 0, transition: { duration: 0.15 } }),
};

export default function GuideMe() {
  const wizardOpen    = useBudgetStore(s => s.wizardOpen);
  const setWizardOpen = useBudgetStore(s => s.setWizardOpen);
  const wizardStep    = useBudgetStore(s => s.wizardStep);
  const setWizardStep = useBudgetStore(s => s.setWizardStep);
  const resetAll      = useBudgetStore(s => s.resetAll);

  const snapshotRef = useRef(null);
  const [direction, setDirection] = useState(1);
  const [startFreshConfirm, setStartFreshConfirm] = useState(false);
  const [startOverConfirm,  setStartOverConfirm]  = useState(false);

  // Snapshot current data state when wizard opens
  useEffect(() => {
    if (wizardOpen) {
      snapshotRef.current = captureSnapshot(useBudgetStore.getState());
    }
  }, [wizardOpen]);

  function goNext() {
    setDirection(1);
    setWizardStep(s => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setDirection(-1);
    setWizardStep(s => Math.max(s - 1, 1));
  }
  function handleClose() {
    setWizardOpen(false);
    setWizardStep(1);
  }
  function handleComplete() {
    setWizardOpen(false);
    setWizardStep(1);
    toast.success('Budget set up successfully!');
  }

  // "Start Fresh" — wipe everything, re-snapshot empty state
  function handleStartFresh() {
    resetAll();
    snapshotRef.current = captureSnapshot(useBudgetStore.getState());
    setStartFreshConfirm(false);
    setWizardStep(1);
    setDirection(1);
  }

  // "Start Over" — roll back to pre-wizard snapshot
  function handleStartOver() {
    const snap = snapshotRef.current;
    if (!snap) return;
    const state = useBudgetStore.getState();
    useBudgetStore.setState({
      bills:                    state.bills.slice(0, snap.billsLen),
      incomeEntries:            state.incomeEntries.slice(0, snap.incomeLen),
      adhocExpenses:            state.adhocExpenses.slice(0, snap.adhocLen),
      debtEntries:              state.debtEntries.slice(0, snap.debtLen),
      runningBudgetAdjustments: state.runningBudgetAdjustments.slice(0, snap.adjustLen),
      accountBalance:   snap.accountBalance,
      accountName:      snap.accountName,
      startDate:        snap.startDate,
      projectionLength: snap.projectionLength,
    });
    setStartOverConfirm(false);
    setWizardStep(1);
    setDirection(-1);
  }

  if (!wizardOpen) return null;

  const snap = snapshotRef.current ?? {
    billsLen: 0, incomeLen: 0, adhocLen: 0, debtLen: 0, adjustLen: 0,
    accountBalance: 0, accountName: '', startDate: null, projectionLength: 6,
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <ConfirmDialog
        open={startFreshConfirm}
        message="Start Fresh? This will wipe ALL existing data and start completely from scratch. This cannot be undone."
        confirmLabel="Yes, Clear Everything"
        onConfirm={handleStartFresh}
        onCancel={() => setStartFreshConfirm(false)}
      />
      <ConfirmDialog
        open={startOverConfirm}
        message="Start Over? All data entered during this wizard session will be removed and settings restored to when you opened the wizard."
        confirmLabel="Start Over"
        onConfirm={handleStartOver}
        onCancel={() => setStartOverConfirm(false)}
      />

      <div
        className="card-neu w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(90vh, 700px)' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Guide Me</h2>
            <p className="text-xs text-slate-500">
              Step {wizardStep} of {TOTAL_STEPS} — {STEP_LABELS[wizardStep - 1]}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable step body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={wizardStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {wizardStep === 1 && <Step1 onStartFresh={() => setStartFreshConfirm(true)} />}
              {wizardStep === 2 && <Step2 snapshot={snap} />}
              {wizardStep === 3 && <Step3 snapshot={snap} onSkip={goNext} />}
              {wizardStep === 4 && <Step4 snapshot={snap} />}
              {wizardStep === 5 && <Step5 snapshot={snap} onSkip={goNext} />}
              {wizardStep === 6 && <Step6 snapshot={snap} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed footer: progress + navigation */}
        <div className="shrink-0">
          <WizardProgress
            currentStep={wizardStep}
            totalSteps={TOTAL_STEPS}
            stepLabels={STEP_LABELS}
            onStepClick={(s) => {
              setDirection(s > wizardStep ? 1 : -1);
              setWizardStep(s);
            }}
          />
          <div className="flex items-center justify-between px-6 pb-4 pt-2">
            {/* Left: Back + (on review) Start Over */}
            <div className="flex items-center gap-2">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400
                             hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {wizardStep === TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={() => setStartOverConfirm(true)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-rose-400 transition-colors"
                >
                  Start Over
                </button>
              )}
            </div>

            {/* Right: Next or Complete */}
            {wizardStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-cyan-400 text-slate-900 rounded-xl
                           text-sm font-semibold hover:bg-cyan-300 transition-colors
                           shadow-[0_0_16px_rgba(34,211,238,0.25)]"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-400 text-slate-900 rounded-xl
                           text-sm font-semibold hover:bg-emerald-300 transition-colors
                           shadow-[0_0_16px_rgba(52,211,153,0.25)]"
              >
                <Check className="w-4 h-4" /> Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
