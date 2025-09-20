import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import StartingPointModal from "@/components/StartingPointModal";
import SmartNotifications from "@/components/SmartNotifications";
import PersonalizedOverview from "@/components/PersonalizedOverview";
import FloatingActionButtons from "@/components/FloatingActionButtons";

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your complete financial overview at a glance</p>
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

      {/* Personalized Overview */}
      <PersonalizedOverview />

      {/* Balance Card - Full Width */}
      <BalanceCard />
      
      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 columns wide on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryBreakdown />
            <WeeklyChart />
          </div>
        </div>
        
        {/* Right Column - 1 column wide on large screens */}
        <div className="space-y-6">
          <RecentTransactions />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default Index;
