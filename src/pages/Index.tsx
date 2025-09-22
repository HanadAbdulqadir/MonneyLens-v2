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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Upload, Play } from "lucide-react";
import { useState } from "react";

const Index = () => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  const { transactions, goals, debts } = useFinancial();

  const isNewUser = transactions.length === 0 && goals.length === 0 && debts.length === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Unified System Components */}
      <CommandPalette />
      <ContextualHelp />
      <UnifiedToolbar />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser ? "Welcome to MoneyLens! 👋" : "Financial Command Center"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser 
              ? "Let's get started with your financial journey" 
              : "Your complete financial ecosystem at a glance"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StartingPointModal />
          <div data-add-transaction>
            <AddTransactionModal />
          </div>
        </div>
      </div>

      {/* Welcome Section for New Users */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Ready to take control of your finances?</h2>
              <p className="text-muted-foreground mb-4">
                Start by adding your first transaction or import your existing data to see your financial picture.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Transaction
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
                <Button variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Take Tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
