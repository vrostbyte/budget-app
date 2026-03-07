import { useEffect } from 'react';
import useBudgetStore from './store/budgetStore.js';
import { parseMathExpression, roundToCents } from './utils/engine.js';
import AppShell from './components/layout/AppShell.jsx';

function App() {
  const loadSampleData = useBudgetStore(s => s.loadSampleData);
  const exportData = useBudgetStore(s => s.exportData);

  useEffect(() => {
    // Phase 1 verification — load sample data and log the exported schema
    loadSampleData();

    // Allow one tick for Zustand state to settle before reading
    setTimeout(() => {
      const exported = exportData();
      console.log('=== Phase 1 Verification ===');
      console.log('Exported JSON schema keys:', Object.keys(exported));
      console.log('Exported data:', JSON.stringify(exported, null, 2));

      // Math parser spot checks
      console.log('parseMathExpression("100+50")    →', parseMathExpression('100+50'),    '(expect 150)');
      console.log('parseMathExpression("2000-150")  →', parseMathExpression('2000-150'),  '(expect 1850)');
      console.log('roundToCents(98.619999999)       →', roundToCents(98.619999999),       '(expect 98.62)');
    }, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <AppShell />;
}

export default App;
