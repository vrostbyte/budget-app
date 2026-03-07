import HeroBalanceCard from './HeroBalanceCard.jsx';
import LowestBalanceCards from './LowestBalanceCards.jsx';
import QuickStatsRow from './QuickStatsRow.jsx';

export default function DashboardView() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_272px] gap-4">
        <HeroBalanceCard />
        <QuickStatsRow />
      </div>
      <LowestBalanceCards />
    </div>
  );
}
