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
import DebtOverview from "@/components/DebtOverview";
import GoalsOverview from "@/components/GoalsOverview";
import BudgetOverview from "@/components/BudgetOverview";

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

      {/* Personalized Overview - Full Width */}
      <PersonalizedOverview />

      {/* Balance Card - Full Width */}
      <BalanceCard />

      {/* Quick Insights Grid */}
      <QuickInsightsGrid />

      {/* Key Financial Areas - Debts, Goals, Budget */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DebtOverview />
        <GoalsOverview />
        <BudgetOverview />
      </div>
      
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

      {/* Financial Health Score - Bottom Section */}
      <div className="max-w-4xl mx-auto">
        <FinancialHealthScore />
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default Index;
