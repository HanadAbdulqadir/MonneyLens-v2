import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import EnhancedCategoryBreakdown from "@/components/EnhancedCategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import EnhancedWeeklyChart from "@/components/EnhancedWeeklyChart";
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
import DataFilter from "@/components/DataFilter";
import ResponsiveLayout, { ResponsiveGrid } from "@/components/ResponsiveLayout";
import UpcomingRecurringWidget from "@/components/UpcomingRecurringWidget";
import CommandPalette from "@/components/CommandPalette";
import UnifiedToolbar from "@/components/UnifiedToolbar";
import ContextualHelp from "@/components/ContextualHelp";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import UserOnboarding from "@/components/UserOnboarding";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useState } from "react";

const Index = () => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleCommandPaletteOpen = () => setIsCommandPaletteOpen(true);
  const handleAccessibilityOpen = () => setIsAccessibilityOpen(true);
  const handleTourOpen = () => setIsTourOpen(true);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Unified System Components */}
      <CommandPalette />
      <ContextualHelp />
      <UnifiedToolbar 
        onCommandPaletteOpen={handleCommandPaletteOpen}
        onAccessibilityOpen={handleAccessibilityOpen}
        onTourOpen={handleTourOpen}
      />
      
      {/* Legacy components - hidden but functional */}
      <div className="hidden">
        <AccessibilityEnhancer />
        <UserOnboarding />
      </div>
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

      {/* Upcoming Recurring Transactions */}
      <UpcomingRecurringWidget />
      
      {/* Data Filtering */}
      <DataFilter compact={true} />

      {/* Enhanced Charts Section */}
      <ResponsiveLayout enableGridToggle={true} enableDevicePreview={false}>
        <ResponsiveGrid columns={{ sm: 1, lg: 2 }} gap={6}>
          <EnhancedWeeklyChart />
          <EnhancedCategoryBreakdown />
        </ResponsiveGrid>
      </ResponsiveLayout>
      
      {/* Activity and Transactions Grid */}
      <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap={6}>
        <RecentTransactions />
        <RecentActivityFeed />
      </ResponsiveGrid>

      {/* Financial Health Score - Bottom Section */}
      <div className="max-w-4xl mx-auto">
        <FinancialHealthScore />
      </div>

      {/* Floating Action Buttons - Replaced with UnifiedToolbar but kept for compatibility */}
      <div className="hidden">
        <FloatingActionButtons />
      </div>
    </div>
  );
};

export default Index;
