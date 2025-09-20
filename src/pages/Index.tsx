import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import StartingPointModal from "@/components/StartingPointModal";

const Index = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <StartingPointModal />
          <AddTransactionModal />
        </div>
      </div>

      {/* Balance Card - Full Width */}
      <BalanceCard />
      
      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Breakdown */}
        <CategoryBreakdown />
        
        {/* Recent Transactions */}
        <RecentTransactions />
        
        {/* Weekly Chart */}
        <div className="md:col-span-2 lg:col-span-1">
          <WeeklyChart />
        </div>
      </div>
    </div>
  );
};

export default Index;
