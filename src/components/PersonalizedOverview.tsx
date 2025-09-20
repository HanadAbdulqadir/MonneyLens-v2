import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { TrendingUp, TrendingDown, Target, Calendar, Award, Zap } from "lucide-react";

const PersonalizedOverview = () => {
  const { transactions, goals, debts, getCurrentBalance } = useFinancial();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = "Alex"; // Could be made dynamic in the future
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getWeeklyHighlights = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Weekly transactions
    const weeklyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= oneWeekAgo;
    });

    // Biggest expense this week
    const biggestExpense = weeklyTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0, category: 'None', date: '', dailyEntryId: 0 });

    // Most used category
    const categoryCount = weeklyTransactions.reduce((acc, t) => {
      if (t.category !== 'Earnings') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostUsedCategory = Object.entries(categoryCount)
      .reduce((max, [category, amount]) => amount > max.amount ? { category, amount } : max, 
        { category: 'None', amount: 0 });

    // Weekly spending vs previous week
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= twoWeeksAgo && transactionDate < oneWeekAgo;
    });

    const thisWeekSpending = weeklyTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousWeekSpending = previousWeekTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingChange = thisWeekSpending - previousWeekSpending;
    const spendingChangePercent = previousWeekSpending > 0 ? (spendingChange / previousWeekSpending) * 100 : 0;

    return {
      biggestExpense,
      mostUsedCategory,
      thisWeekSpending,
      spendingChange,
      spendingChangePercent
    };
  };

  const getGoalProgress = () => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const nearCompletionGoals = activeGoals.filter(g => (g.currentAmount / g.targetAmount) >= 0.8);
    
    return {
      activeGoals: activeGoals.length,
      nearCompletion: nearCompletionGoals.length,
      nextGoal: activeGoals[0] // First active goal
    };
  };

  const getMonthlyStatus = () => {
    const currentBalance = getCurrentBalance();
    const totalDebt = debts.filter(d => d.isActive).reduce((sum, d) => sum + d.remainingAmount, 0);
    const netWorth = currentBalance - totalDebt;
    
    return {
      currentBalance,
      totalDebt,
      netWorth
    };
  };

  const highlights = getWeeklyHighlights();
  const goalProgress = getGoalProgress();
  const monthlyStatus = getMonthlyStatus();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20 hover:shadow-lg transition-all duration-300">
      <div className="space-y-6">
        {/* Personalized Greeting */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{getGreeting()}</h2>
          <p className="text-muted-foreground">
            Here's your financial snapshot for this week
          </p>
        </div>

        {/* Weekly Highlights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Spending Change */}
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              {highlights.spendingChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
              <span className={`font-bold text-sm ${
                highlights.spendingChange >= 0 ? 'text-destructive' : 'text-success'
              }`}>
                {highlights.spendingChangePercent >= 0 ? '+' : ''}
                {highlights.spendingChangePercent.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
            <p className="text-xs font-medium">£{highlights.thisWeekSpending.toFixed(2)} spent</p>
          </div>

          {/* Biggest Expense */}
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Zap className="h-4 w-4 mx-auto mb-1 text-warning" />
            <p className="text-xs text-muted-foreground">Biggest expense</p>
            <p className="font-bold text-sm">£{highlights.biggestExpense.amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{highlights.biggestExpense.category}</p>
          </div>

          {/* Most Used Category */}
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Top category</p>
            <p className="font-bold text-sm">{highlights.mostUsedCategory.category}</p>
            <p className="text-xs text-muted-foreground">£{highlights.mostUsedCategory.amount.toFixed(2)}</p>
          </div>

          {/* Net Worth */}
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Award className="h-4 w-4 mx-auto mb-1 text-success" />
            <p className="text-xs text-muted-foreground">Net worth</p>
            <p className={`font-bold text-sm ${monthlyStatus.netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
              £{monthlyStatus.netWorth.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {monthlyStatus.totalDebt > 0 ? `£${monthlyStatus.totalDebt.toFixed(2)} debt` : 'Debt free!'}
            </p>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Smart Insights
          </h3>
          
          <div className="grid gap-3 md:grid-cols-2">
            {/* Spending Insight */}
            <div className="p-3 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={highlights.spendingChangePercent > 20 ? "destructive" : 
                              highlights.spendingChangePercent < -10 ? "default" : "secondary"}>
                  {highlights.spendingChangePercent > 20 ? "High Spending" : 
                   highlights.spendingChangePercent < -10 ? "Great Saving" : "Normal Spending"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {highlights.spendingChangePercent > 20 ? 
                  `You've spent ${highlights.spendingChangePercent.toFixed(0)}% more than last week. Consider reviewing your ${highlights.mostUsedCategory.category} expenses.` :
                 highlights.spendingChangePercent < -10 ?
                  `Excellent! You've reduced spending by ${Math.abs(highlights.spendingChangePercent).toFixed(0)}% compared to last week.` :
                  `Your spending is consistent with last week's pattern. Keep it up!`
                }
              </p>
            </div>

            {/* Goal Insight */}
            <div className="p-3 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={goalProgress.nearCompletion > 0 ? "default" : "secondary"}>
                  {goalProgress.nearCompletion > 0 ? "Goal Progress" : "Stay Focused"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {goalProgress.nearCompletion > 0 ? 
                  `${goalProgress.nearCompletion} goal${goalProgress.nearCompletion > 1 ? 's are' : ' is'} almost complete! You're doing great.` :
                 goalProgress.activeGoals > 0 ?
                  `Keep working towards your ${goalProgress.activeGoals} active goal${goalProgress.activeGoals > 1 ? 's' : ''}. Every pound counts!` :
                  "Consider setting a financial goal to stay motivated and track your progress."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalizedOverview;