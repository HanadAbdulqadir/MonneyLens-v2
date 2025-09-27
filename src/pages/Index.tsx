import BalanceCard from "@components/BalanceCard";
import EnhancedCategoryBreakdown from "@components/EnhancedCategoryBreakdown";
import RecentTransactions from "@components/RecentTransactions";
import EnhancedWeeklyChart from "@components/EnhancedWeeklyChart";
import SmartTransactionEntry from "@shared/components/SmartTransactionEntry";
import StartingPointModal from "@components/StartingPointModal";
import AIFinancialInsights from "@components/AIFinancialInsights";
import SmartNotifications from "@components/SmartNotifications";
import PersonalizedOverview from "@components/PersonalizedOverview";
import FinancialHealthScore from "@components/FinancialHealthScore";
import QuickInsightsGrid from "@components/QuickInsightsGrid";
import RecentActivityFeed from "@components/RecentActivityFeed";
import DebtOverview from "@components/DebtOverview";
import GoalsOverview from "@components/GoalsOverview";
import BudgetOverview from "@components/BudgetOverview";
import DataFilter from "@components/DataFilter";
import ResponsiveLayout, { ResponsiveGrid } from "@components/ResponsiveLayout";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";

const Index = () => {
  const { transactions, goals, debts, recurringTransactions } = useFinancial();

  const isNewUser = transactions.length === 0 && goals.length === 0 && debts.length === 0;

  // Calculate daily insights
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0);
  const todayExpenses = todayTransactions.filter(t => t.category !== 'Earnings').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Upcoming recurring transactions
  const upcomingRecurring = recurringTransactions.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Daily Operations Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser ? "Welcome to MoneyLens! 👋" : "Daily Financial Operations"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser 
              ? "Let's get started with your financial journey" 
              : "Your daily financial command center"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StartingPointModal />
          <div data-add-transaction>
            <SmartTransactionEntry />
          </div>
        </div>
      </div>

      {/* Smart Notifications */}
      <SmartNotifications />

      {/* AI Financial Insights - Top Priority */}
      <AIFinancialInsights />

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

      {/* Data Filtering */}
      <DataFilter compact={true} />

      {/* Enhanced Charts Section */}
      <ResponsiveLayout enableGridToggle={true} enableDevicePreview={false}>
        <ResponsiveGrid columns={{ sm: 1, lg: 2 }} gap={6} minWidth="350px">
          <EnhancedWeeklyChart />
          <EnhancedCategoryBreakdown />
        </ResponsiveGrid>
      </ResponsiveLayout>
      
      {/* Activity and Transactions Grid */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={6} minWidth="280px">
        <RecentTransactions />
        <RecentActivityFeed />
      </ResponsiveGrid>

      {/* Financial Health Score - Bottom Section */}
      <div className="max-w-4xl mx-auto">
        <FinancialHealthScore />
      </div>
    </div>
  );
};

export default Index;
