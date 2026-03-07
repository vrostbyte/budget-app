import { useMemo } from 'react';
import useBudgetStore from '../store/budgetStore.js';
import { calculateRunningTotals } from '../utils/engine.js';

/**
 * Returns the full running-totals array derived from the current store state.
 * Result is memoized — only recomputes when relevant data state changes.
 *
 * @returns {Array<{date: Date, event: string, dailyNet: number, balance: number}>}
 */
export function useRunningTotals() {
  const bills                   = useBudgetStore(s => s.bills);
  const incomeEntries           = useBudgetStore(s => s.incomeEntries);
  const adhocExpenses           = useBudgetStore(s => s.adhocExpenses);
  const runningBudgetAdjustments = useBudgetStore(s => s.runningBudgetAdjustments);
  const debtEntries             = useBudgetStore(s => s.debtEntries);
  const accountBalance          = useBudgetStore(s => s.accountBalance);
  const startDate               = useBudgetStore(s => s.startDate);
  const projectionLength        = useBudgetStore(s => s.projectionLength);

  return useMemo(
    () =>
      calculateRunningTotals({
        bills,
        incomeEntries,
        adhocExpenses,
        runningBudgetAdjustments,
        debtEntries,
        accountBalance,
        startDate,
        projectionLength,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      bills,
      incomeEntries,
      adhocExpenses,
      runningBudgetAdjustments,
      debtEntries,
      accountBalance,
      startDate,
      projectionLength,
    ]
  );
}

export default useRunningTotals;
