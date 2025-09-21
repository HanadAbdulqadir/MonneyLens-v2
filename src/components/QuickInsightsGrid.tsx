import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  PieChart, 
  DollarSign,
  Clock,
  Zap
} from "lucide-react";

const QuickInsightsGrid = () => {
  const { transactions, getCurrentBalance, goals, debts } = useFinancial();

  const getInsights = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Recent transactions (last 30 days)
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo;
    });

    // Previous month transactions (30-60 days ago)
    const previousTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo;
    });

    // Income vs Expenses
    const currentIncome = recentTransactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = recentTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = previousTransactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    // Spending by category
    const categorySpending = recentTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .reduce((max, [category, amount]) => amount > max.amount ? { category, amount } : max, 
        { category: 'None', amount: 0 });

    // Goals progress
    const activeGoals = goals.filter(g => !g.isCompleted);
    const avgGoalProgress = activeGoals.length > 0 
      ? activeGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / activeGoals.length * 100
      : 0;

    // Debt info
    const totalDebt = debts.filter(d => d.remainingAmount > 0).reduce((sum, d) => sum + d.remainingAmount, 0);
    const monthlyDebtPayments = debts.filter(d => d.remainingAmount > 0).reduce((sum, d) => sum + d.minimumPayment, 0);

    // Savings rate
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    // Transaction frequency
    const avgDailyTransactions = recentTransactions.length / 30;

    return {
      currentIncome,
      currentExpenses,
      previousIncome,
      previousExpenses,
      topCategory,
      avgGoalProgress,
      totalDebt,
      monthlyDebtPayments,
      savingsRate,
      avgDailyTransactions,
      netChange: currentIncome - currentExpenses,
      incomeChange: ((currentIncome - previousIncome) / Math.max(previousIncome, 1)) * 100,
      expenseChange: ((currentExpenses - previousExpenses) / Math.max(previousExpenses, 1)) * 100
    };
  };

  const insights = getInsights();

  const insightCards = [
    {
      title: "Savings Rate",
      value: `${insights.savingsRate.toFixed(1)}%`,
      subtitle: "of income saved",
      icon: TrendingUp,
      color: insights.savingsRate >= 20 ? "text-success" : insights.savingsRate >= 10 ? "text-warning" : "text-destructive",
      bgColor: insights.savingsRate >= 20 ? "bg-success/10" : insights.savingsRate >= 10 ? "bg-warning/10" : "bg-destructive/10",
      trend: insights.savingsRate >= 20 ? "excellent" : insights.savingsRate >= 10 ? "good" : "needs work"
    },
    {
      title: "Income Trend",
      value: `${insights.incomeChange >= 0 ? '+' : ''}${insights.incomeChange.toFixed(1)}%`,
      subtitle: "vs last month",
      icon: insights.incomeChange >= 0 ? TrendingUp : TrendingDown,
      color: insights.incomeChange >= 0 ? "text-success" : "text-destructive",
      bgColor: insights.incomeChange >= 0 ? "bg-success/10" : "bg-destructive/10",
      trend: insights.incomeChange >= 10 ? "excellent" : insights.incomeChange >= 0 ? "good" : "declining"
    },
    {
      title: "Top Category",
      value: insights.topCategory.category,
      subtitle: `£${insights.topCategory.amount.toFixed(0)} spent`,
      icon: PieChart,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "category"
    },
    {
      title: "Debt Load",
      value: insights.totalDebt > 0 ? `£${insights.totalDebt.toFixed(0)}` : "Debt Free!",
      subtitle: insights.totalDebt > 0 ? `£${insights.monthlyDebtPayments.toFixed(0)}/mo payments` : "No active debts",
      icon: DollarSign,
      color: insights.totalDebt === 0 ? "text-success" : insights.totalDebt > 5000 ? "text-destructive" : "text-warning",
      bgColor: insights.totalDebt === 0 ? "bg-success/10" : insights.totalDebt > 5000 ? "bg-destructive/10" : "bg-warning/10",
      trend: insights.totalDebt === 0 ? "excellent" : "has debt"
    },
    {
      title: "Goal Progress",
      value: `${insights.avgGoalProgress.toFixed(0)}%`,
      subtitle: "average completion",
      icon: Target,
      color: insights.avgGoalProgress >= 75 ? "text-success" : insights.avgGoalProgress >= 50 ? "text-warning" : "text-muted-foreground",
      bgColor: insights.avgGoalProgress >= 75 ? "bg-success/10" : insights.avgGoalProgress >= 50 ? "bg-warning/10" : "bg-muted/10",
      trend: insights.avgGoalProgress >= 75 ? "excellent" : insights.avgGoalProgress >= 50 ? "good" : "behind"
    },
    {
      title: "Activity Level",
      value: insights.avgDailyTransactions.toFixed(1),
      subtitle: "transactions/day",
      icon: Zap,
      color: insights.avgDailyTransactions >= 2 ? "text-primary" : "text-muted-foreground",
      bgColor: insights.avgDailyTransactions >= 2 ? "bg-primary/10" : "bg-muted/10",
      trend: insights.avgDailyTransactions >= 2 ? "active" : "low"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Quick Insights</h3>
        <Badge variant="outline" className="text-xs">
          Last 30 Days
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <Card key={index} className="p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <h4 className="font-semibold text-sm">{card.title}</h4>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="ml-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      card.trend === "excellent" ? "bg-success/20 text-success" :
                      card.trend === "good" ? "bg-primary/20 text-primary" :
                      card.trend === "declining" || card.trend === "needs work" || card.trend === "behind" ? "bg-destructive/20 text-destructive" :
                      "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {card.trend === "excellent" ? "Great" :
                     card.trend === "good" ? "Good" :
                     card.trend === "declining" ? "Down" :
                     card.trend === "needs work" ? "Low" :
                     card.trend === "behind" ? "Behind" :
                     card.trend === "has debt" ? "Debt" :
                     card.trend === "active" ? "Active" :
                     card.trend === "category" ? "Top" : "Low"}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickInsightsGrid;