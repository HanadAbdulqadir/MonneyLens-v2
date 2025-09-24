import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Shield, TrendingUp, Target, AlertTriangle, CheckCircle } from "lucide-react";

const FinancialHealthScore = () => {
  const { transactions, goals, debts, getCurrentBalance } = useFinancial();

  // Check if there's enough data to calculate a meaningful score
  const hasMinimumData = () => {
    const hasTransactions = transactions && transactions.length > 0;
    const hasBalance = getCurrentBalance() !== 0;
    const hasGoalsOrDebts = (goals && goals.length > 0) || (debts && debts.length > 0);
    
    // Need at least some transactions OR balance OR goals/debts to calculate a score
    return hasTransactions || hasBalance || hasGoalsOrDebts;
  };

  const calculateHealthScore = () => {
    let score = 0;
    const factors = [];

    // Emergency Fund Factor (30 points)
    const currentBalance = getCurrentBalance();
    const monthlyExpenses = transactions && transactions.length > 0 
      ? Math.abs(transactions
          .filter(t => t.category !== 'Earnings' && t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)) / Math.max(1, transactions.length / 30)
      : 0;

    if (transactions.length === 0 && currentBalance === 0) {
      factors.push({ name: "Emergency Fund", score: 0, status: "needs work", description: "No financial data available" });
    } else {
      const emergencyFundRatio = monthlyExpenses > 0 ? currentBalance / (monthlyExpenses * 3) : currentBalance > 0 ? 1 : 0;
      if (emergencyFundRatio >= 1) {
        score += 30;
        factors.push({ name: "Emergency Fund", score: 30, status: "excellent", description: "3+ months of expenses saved" });
      } else if (emergencyFundRatio >= 0.5) {
        score += 20;
        factors.push({ name: "Emergency Fund", score: 20, status: "good", description: "Building emergency fund" });
      } else if (currentBalance > 0) {
        score += 10;
        factors.push({ name: "Emergency Fund", score: 10, status: "needs work", description: "Need more emergency savings" });
      } else {
        factors.push({ name: "Emergency Fund", score: 0, status: "needs work", description: "No emergency fund" });
      }
    }

    // Debt Management Factor (25 points)
    const activeDebts = debts ? debts.filter(d => d.remainingAmount > 0) : [];
    const totalDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

    if (!debts || debts.length === 0) {
      // If no debt data is available, don't award full points
      score += 15;
      factors.push({ name: "Debt Management", score: 15, status: "good", description: "No debt data available" });
    } else if (totalDebt === 0) {
      score += 25;
      factors.push({ name: "Debt Management", score: 25, status: "excellent", description: "Debt-free!" });
    } else {
      const debtToIncomeRatio = totalDebt / Math.max(currentBalance, 1);
      if (debtToIncomeRatio < 0.3) {
        score += 20;
        factors.push({ name: "Debt Management", score: 20, status: "good", description: "Manageable debt levels" });
      } else if (debtToIncomeRatio < 0.6) {
        score += 10;
        factors.push({ name: "Debt Management", score: 10, status: "needs work", description: "High debt levels" });
      } else {
        score += 5;
        factors.push({ name: "Debt Management", score: 5, status: "critical", description: "Critical debt situation" });
      }
    }

    // Savings Goals Factor (20 points)
    const activeGoals = goals ? goals.filter(g => !g.isCompleted) : [];

    if (!goals || goals.length === 0) {
      factors.push({ name: "Savings Goals", score: 0, status: "needs work", description: "No goals set yet" });
    } else {
      const goalProgress = activeGoals.reduce((sum, g) => (g.currentAmount / g.targetAmount), 0) / Math.max(activeGoals.length, 1);
      
      if (activeGoals.length > 0 && goalProgress >= 0.7) {
        score += 20;
        factors.push({ name: "Savings Goals", score: 20, status: "excellent", description: "On track with goals" });
      } else if (activeGoals.length > 0 && goalProgress >= 0.4) {
        score += 15;
        factors.push({ name: "Savings Goals", score: 15, status: "good", description: "Making progress on goals" });
      } else if (activeGoals.length > 0) {
        score += 10;
        factors.push({ name: "Savings Goals", score: 10, status: "needs work", description: "Goals need attention" });
      } else {
        score += 5;
        factors.push({ name: "Savings Goals", score: 5, status: "needs work", description: "No active goals set" });
      }
    }

    // Spending Consistency Factor (15 points)
    if (!transactions || transactions.length < 14) { // Need at least 2 weeks of data
      factors.push({ name: "Spending Consistency", score: 0, status: "needs work", description: "Need more transaction history" });
    } else {
      const last7DaysSpending = Math.abs(transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= sevenDaysAgo && t.category !== 'Earnings' && t.amount < 0;
        })
        .reduce((sum, t) => sum + t.amount, 0));

      const previous7DaysSpending = Math.abs(transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= fourteenDaysAgo && transactionDate < sevenDaysAgo && t.category !== 'Earnings' && t.amount < 0;
        })
        .reduce((sum, t) => sum + t.amount, 0));

      const spendingVariation = previous7DaysSpending > 0 
        ? Math.abs(last7DaysSpending - previous7DaysSpending) / previous7DaysSpending 
        : 0;

      if (spendingVariation < 0.2) {
        score += 15;
        factors.push({ name: "Spending Consistency", score: 15, status: "excellent", description: "Consistent spending habits" });
      } else if (spendingVariation < 0.4) {
        score += 10;
        factors.push({ name: "Spending Consistency", score: 10, status: "good", description: "Fairly consistent spending" });
      } else {
        score += 5;
        factors.push({ name: "Spending Consistency", score: 5, status: "needs work", description: "Irregular spending patterns" });
      }
    }

    // Payment Timeliness Factor (10 points)
    if (!debts || debts.length === 0) {
      factors.push({ name: "Payment Timeliness", score: 5, status: "good", description: "No debt payments to track" });
      score += 5;
    } else {
      const overdueDebts = activeDebts.filter(d => {
        const dueDate = new Date(d.dueDate);
        return dueDate < new Date();
      });

      if (overdueDebts.length === 0) {
        score += 10;
        factors.push({ name: "Payment Timeliness", score: 10, status: "excellent", description: "All payments on time" });
      } else {
        factors.push({ name: "Payment Timeliness", score: 0, status: "critical", description: `${overdueDebts.length} overdue payment${overdueDebts.length > 1 ? 's' : ''}` });
      }
    }

    return { score: Math.min(score, 100), factors };
  };

  // If there's not enough data, show a different state
  if (!hasMinimumData()) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-2 border-dashed">
        <div className="text-center space-y-4">
          <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Financial Health Score</h3>
            <p className="text-muted-foreground mb-4">
              Add some financial data to see your health score
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>To calculate your financial health score, we need:</p>
              <ul className="text-left max-w-md mx-auto space-y-1">
                <li>• Some transaction history</li>
                <li>• Current balance information</li>
                <li>• Financial goals or debt information</li>
              </ul>
            </div>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            Insufficient Data
          </Badge>
        </div>
      </Card>
    );
  }

  const { score, factors } = calculateHealthScore();

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-success", bgColor: "bg-success", description: "Outstanding financial health!" };
    if (score >= 60) return { level: "Good", color: "text-primary", bgColor: "bg-primary", description: "Good financial foundation" };
    if (score >= 40) return { level: "Fair", color: "text-warning", bgColor: "bg-warning", description: "Room for improvement" };
    return { level: "Needs Work", color: "text-destructive", bgColor: "bg-destructive", description: "Focus on financial basics" };
  };

  const scoreLevel = getScoreLevel(score);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="h-4 w-4 text-success" />;
      case "good": return <TrendingUp className="h-4 w-4 text-primary" />;
      case "needs work": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "critical": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-2 hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Financial Health Score</h3>
              <p className="text-sm text-muted-foreground">Your overall financial wellness</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-3xl font-bold ${scoreLevel.color}`}>{score}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className={`${scoreLevel.color} border-current`}>
              {scoreLevel.level}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={score} 
            className={`h-3 transition-all duration-1000 [&>div]:${scoreLevel.bgColor}`}
          />
          <p className="text-sm text-muted-foreground text-center">
            {scoreLevel.description}
          </p>
        </div>

        {/* Health Factors */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Health Factors
          </h4>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  {getStatusIcon(factor.status)}
                  <div>
                    <p className="font-medium text-sm">{factor.name}</p>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm">{factor.score}</span>
                  <span className="text-xs text-muted-foreground">/
                    {factor.name === "Emergency Fund" ? "30" :
                     factor.name === "Debt Management" ? "25" :
                     factor.name === "Savings Goals" ? "20" :
                     factor.name === "Spending Consistency" ? "15" : "10"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Improvement Tips */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">💡 Quick Improvement Tips:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            {score < 80 && (
              <>
                {factors.find(f => f.name === "Emergency Fund" && f.score < 25) && 
                  <p>• Build emergency fund to 3+ months of expenses</p>}
                {factors.find(f => f.name === "Debt Management" && f.score < 20) && 
                  <p>• Focus on paying down high-interest debt first</p>}
                {factors.find(f => f.name === "Savings Goals" && f.score < 15) && 
                  <p>• Set specific, achievable financial goals</p>}
              </>
            )}
            {score >= 80 && <p>• Excellent work! Consider advanced investment strategies</p>}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FinancialHealthScore;