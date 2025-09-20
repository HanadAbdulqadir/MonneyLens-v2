import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import StartingPointModal from "@/components/StartingPointModal";
import SmartNotifications from "@/components/SmartNotifications";
import PersonalizedOverview from "@/components/PersonalizedOverview";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import FinancialHealthScore from "@/components/FinancialHealthScore";
import QuickInsightsGrid from "@/components/QuickInsightsGrid";
import RecentActivityFeed from "@/components/RecentActivityFeed";

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Command Center</h1>
          <p className="text-muted-foreground">Your complete financial ecosystem at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <StartingPointModal />
          <div data-add-transaction>
            <AddTransactionModal />
          </div>
        </div>
      </div>

      {/* Smart Notifications */}
      <SmartNotifications />

      {/* Top Row - Key Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalizedOverview />
        </div>
        <div>
          <FinancialHealthScore />
        </div>
      </div>

      {/* Balance Card - Full Width */}
      <BalanceCard />

      {/* Quick Insights Grid */}
      <QuickInsightsGrid />
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Section - Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryBreakdown />
            <WeeklyChart />
          </div>
        </div>
        
        {/* Right Section - Activity and Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RecentTransactions />
            <RecentActivityFeed />
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default Index;
