import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import EnhancedCategoryBreakdown from "@/components/EnhancedCategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import EnhancedWeeklyChart from "@/components/EnhancedWeeklyChart";
import SmartTransactionEntry from "@/components/SmartTransactionEntry";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Upload, Play, Zap, Target, TrendingUp, Calendar, ArrowRight, Building } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
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
      {/* Unified System Components */}
      <CommandPalette />
      <ContextualHelp />
      <UnifiedToolbar />
      
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

      {/* Daily Quick Actions Grid */}
      {!isNewUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Quick Allocation</CardTitle>
              </div>
              <CardDescription>Allocate today's earnings smartly</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-3">
                Use AI-powered allocation to distribute your daily income across goals, expenses, and savings.
              </p>
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/quick-allocation" className="flex items-center gap-2">
                  Start Allocation <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Today's Goals</CardTitle>
              </div>
              <CardDescription>Track daily progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {goals.slice(0, 2).map(goal => (
                  <div key={goal.id} className="flex justify-between items-center text-sm">
                    <span className="truncate">{goal.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/goals" className="flex items-center gap-2">
                  View All Goals <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Daily Analytics</CardTitle>
              </div>
              <CardDescription>Today's financial snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span>Income:</span>
                  <span className="text-green-600 font-medium">+£{todayIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses:</span>
                  <span className="text-red-600 font-medium">-£{todayExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net:</span>
                  <span className="font-medium">£{(todayIncome - todayExpenses).toFixed(2)}</span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/analytics" className="flex items-center gap-2">
                  View Analytics <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
      {upcomingRecurring.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <CardTitle>Upcoming Recurring Transactions</CardTitle>
            </div>
            <CardDescription>Automated payments scheduled for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRecurring.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.name}</div>
                    <div className="text-sm text-muted-foreground">{transaction.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">-£{Math.abs(transaction.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Due soon</div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/recurring" className="flex items-center gap-2">
                Manage Recurring Transactions <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Quick Navigation Footer */}
      {!isNewUser && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Continue Your Financial Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Link to="/financial-hub">
                <Building className="h-6 w-6 mb-2" />
                <span className="font-medium">Financial Hub</span>
                <span className="text-sm text-muted-foreground text-left">Complete financial planning for the next 12 months</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Link to="/budget">
                <Target className="h-6 w-6 mb-2" />
                <span className="font-medium">Budget Planning</span>
                <span className="text-sm text-muted-foreground text-left">Set and track monthly budgets</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Link to="/analytics">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="font-medium">Advanced Analytics</span>
                <span className="text-sm text-muted-foreground text-left">Deep insights and trend analysis</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
