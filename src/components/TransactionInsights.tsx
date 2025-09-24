import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Calendar,
  DollarSign,
  Brain,
  Lightbulb,
  Zap,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, parseISO, subDays, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface TransactionInsightsProps {
  filteredTransactions: any[];
}

const TransactionInsights = ({ filteredTransactions }: TransactionInsightsProps) => {
  const { transactions } = useFinancial();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const insights = useMemo(() => {
    if (!filteredTransactions.length) return null;

    const now = new Date();
    const currentMonth = { 
      start: startOfMonth(now), 
      end: endOfMonth(now) 
    };
    const lastMonth = { 
      start: startOfMonth(subDays(now, 30)), 
      end: endOfMonth(subDays(now, 30)) 
    };

    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), currentMonth)
    );
    
    const lastMonthTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), lastMonth)
    );

    // Calculate spending patterns
    const currentSpending = currentMonthTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthSpending = lastMonthTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingChange = lastMonthSpending > 0 
      ? ((currentSpending - lastMonthSpending) / lastMonthSpending) * 100 
      : 0;

    // Income analysis
    const currentIncome = currentMonthTransactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = lastMonthIncome > 0 
      ? ((currentIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0;

    // Category insights
    const categorySpending = currentMonthTransactions
      .filter(t => t.category !== 'Earnings')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const highestCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    // Transaction frequency
    const avgTransactionsPerDay = currentMonthTransactions.length / 30;
    const recentDays = 7;
    const recentTransactions = transactions.filter(t => 
      differenceInDays(now, parseISO(t.date)) <= recentDays
    );
    const recentAvgPerDay = recentTransactions.length / recentDays;

    // Spending velocity (how quickly money is being spent)
    const spendingVelocity = currentSpending / (currentMonthTransactions.length || 1);

    // Budget analysis (mock budgets for demo)
    const monthlyBudget = {
      Petrol: 300,
      Food: 400,
      Other: 200,
      total: 900
    };

    const budgetUsage = {
      Petrol: ((categorySpending.Petrol || 0) / monthlyBudget.Petrol) * 100,
      Food: ((categorySpending.Food || 0) / monthlyBudget.Food) * 100,
      Other: ((categorySpending.Other || 0) / monthlyBudget.Other) * 100,
      total: (currentSpending / monthlyBudget.total) * 100
    };

    // Generate insights
    const insights = [];

    // Spending trend insight
    if (Math.abs(spendingChange) > 10) {
      insights.push({
        type: spendingChange > 0 ? 'warning' : 'success',
        icon: spendingChange > 0 ? TrendingUp : TrendingDown,
        title: spendingChange > 0 ? 'Spending Increased' : 'Spending Decreased',
        message: `Your spending ${spendingChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChange).toFixed(1)}% compared to last month`,
        value: `${spendingChange > 0 ? '+' : ''}${spendingChange.toFixed(1)}%`,
        action: spendingChange > 0 ? 'Review expenses' : 'Keep it up!'
      });
    }

    // Budget warning
    Object.entries(budgetUsage).forEach(([category, usage]) => {
      if (usage > 80 && category !== 'total') {
        insights.push({
          type: usage > 100 ? 'danger' : 'warning',
          icon: AlertTriangle,
          title: `${category} Budget Alert`,
          message: `You've used ${usage.toFixed(0)}% of your ${category.toLowerCase()} budget`,
          value: `${usage.toFixed(0)}%`,
          action: usage > 100 ? 'Over budget!' : 'Slow down spending'
        });
      }
    });

    // High spending category
    if (highestCategory && highestCategory[1] > 200) {
      insights.push({
        type: 'info',
        icon: DollarSign,
        title: 'Top Spending Category',
        message: `${highestCategory[0]} is your highest expense category this month`,
        value: `£${highestCategory[1].toFixed(0)}`,
        action: 'Consider optimization'
      });
    }

    // Transaction frequency insight
    if (recentAvgPerDay > avgTransactionsPerDay * 1.5) {
      insights.push({
        type: 'warning',
        icon: Zap,
        title: 'High Transaction Activity',
        message: 'You\'ve been making more transactions than usual recently',
        value: `${recentAvgPerDay.toFixed(1)}/day`,
        action: 'Review recent purchases'
      });
    }

    // Income insight
    if (Math.abs(incomeChange) > 15) {
      insights.push({
        type: incomeChange > 0 ? 'success' : 'warning',
        icon: incomeChange > 0 ? TrendingUp : TrendingDown,
        title: `Income ${incomeChange > 0 ? 'Increased' : 'Decreased'}`,
        message: `Your income ${incomeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(incomeChange).toFixed(1)}% this month`,
        value: `${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}%`,
        action: incomeChange > 0 ? 'Great progress!' : 'Monitor closely'
      });
    }

    return {
      insights,
      spendingChange,
      incomeChange,
      budgetUsage,
      categorySpending,
      spendingVelocity,
      avgTransactionsPerDay,
      recentAvgPerDay,
      currentSpending,
      currentIncome
    };
  }, [filteredTransactions, transactions]);

  if (!insights) return null;

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-success/20 bg-success/5 text-success';
      case 'warning': return 'border-warning/20 bg-warning/5 text-warning';
      case 'danger': return 'border-destructive/20 bg-destructive/5 text-destructive';
      default: return 'border-primary/20 bg-primary/5 text-primary';
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'danger': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Financial Insights</h3>
              <p className="text-sm text-muted-foreground">
                Smart analysis of your spending patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {insights.insights.length} insights
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Monthly Spending</p>
            <p className="text-lg font-bold">£{insights.currentSpending.toFixed(0)}</p>
            <p className={`text-xs ${insights.spendingChange > 0 ? 'text-destructive' : 'text-success'}`}>
              {insights.spendingChange > 0 ? '+' : ''}{insights.spendingChange.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-lg font-bold text-success">£{insights.currentIncome.toFixed(0)}</p>
            <p className={`text-xs ${insights.incomeChange > 0 ? 'text-success' : 'text-destructive'}`}>
              {insights.incomeChange > 0 ? '+' : ''}{insights.incomeChange.toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Budget Usage</p>
            <p className="text-lg font-bold">{insights.budgetUsage.total.toFixed(0)}%</p>
            <Progress value={insights.budgetUsage.total} className="h-1 mt-1" />
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Daily Avg</p>
            <p className="text-lg font-bold">{insights.recentAvgPerDay.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">transactions/day</p>
          </div>
        </div>
      </Card>

      {/* Insights Grid */}
      {insights.insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.insights.slice(0, showAdvanced ? undefined : 4).map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className={`p-4 border-2 ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-background/50 rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge className={`text-xs ${getInsightBadgeColor(insight.type)}`}>
                        {insight.value}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-foreground/80 mb-2">
                      {insight.message}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3 w-3" />
                      <span className="text-xs font-medium">{insight.action}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Advanced Analytics */}
      {showAdvanced && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Advanced Analytics
          </h4>
          
          <div className="space-y-6">
            {/* Budget Breakdown */}
            <div>
              <h5 className="font-medium mb-3">Budget Performance</h5>
              <div className="space-y-3">
                {Object.entries(insights.budgetUsage).map(([category, usage]) => {
                  if (category === 'total') return null;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className={usage > 100 ? 'text-destructive' : usage > 80 ? 'text-warning' : 'text-success'}>
                          {usage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(usage, 100)} 
                        className={`h-2 ${
                          usage > 100 ? '[&>div]:bg-destructive' : 
                          usage > 80 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spending Velocity */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h6 className="font-medium mb-2">Spending Velocity</h6>
                <p className="text-2xl font-bold">£{insights.spendingVelocity.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">per transaction</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h6 className="font-medium mb-2">Transaction Frequency</h6>
                <p className="text-2xl font-bold">{insights.avgTransactionsPerDay.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">per day average</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No Insights State */}
      {insights.insights.length === 0 && (
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Notable Patterns Detected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your spending appears stable. Keep tracking to unlock more insights!
          </p>
          <Badge variant="outline">All systems normal</Badge>
        </Card>
      )}
    </div>
  );
};

export default TransactionInsights;