import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { Shield, TrendingUp, Target, AlertTriangle, CheckCircle } from "lucide-react";

const FinancialHealthScore = () => {
  const { transactions, goals, debts, getCurrentBalance } = useFinancial();

  const calculateHealthScore = () => {
    let score = 0;
    const factors = [];

    // Emergency Fund Factor (30 points)
    const currentBalance = getCurrentBalance();
    const monthlyExpenses = transactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, transactions.length / 30); // Rough monthly estimate

    const emergencyFundRatio = currentBalance / (monthlyExpenses * 3); // 3 months emergency fund
    if (emergencyFundRatio >= 1) {
      score += 30;
      factors.push({ name: "Emergency Fund", score: 30, status: "excellent", description: "3+ months of expenses saved" });
    } else if (emergencyFundRatio >= 0.5) {
      score += 20;
      factors.push({ name: "Emergency Fund", score: 20, status: "good", description: "Building emergency fund" });
    } else {
      score += 10;
      factors.push({ name: "Emergency Fund", score: 10, status: "needs work", description: "Need more emergency savings" });
    }

    // Debt Management Factor (25 points)
    const activeDebts = debts.filter(d => d.isActive);
    const totalDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const debtToIncomeRatio = totalDebt / Math.max(currentBalance, 1);

    if (totalDebt === 0) {
      score += 25;
      factors.push({ name: "Debt Management", score: 25, status: "excellent", description: "Debt-free!" });
    } else if (debtToIncomeRatio < 0.3) {
      score += 20;
      factors.push({ name: "Debt Management", score: 20, status: "good", description: "Manageable debt levels" });
    } else if (debtToIncomeRatio < 0.6) {
      score += 10;
      factors.push({ name: "Debt Management", score: 10, status: "needs work", description: "High debt levels" });
    } else {
      score += 5;
      factors.push({ name: "Debt Management", score: 5, status: "critical", description: "Critical debt situation" });
    }

    // Savings Goals Factor (20 points)
    const activeGoals = goals.filter(g => !g.isCompleted);
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

    // Spending Consistency Factor (15 points)
    const last7DaysSpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= sevenDaysAgo && t.category !== 'Earnings';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previous7DaysSpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= fourteenDaysAgo && transactionDate < sevenDaysAgo && t.category !== 'Earnings';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingVariation = Math.abs(last7DaysSpending - previous7DaysSpending) / Math.max(previous7DaysSpending, 1);

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

    // Payment Timeliness Factor (10 points)
    const overdueDebts = activeDebts.filter(d => {
      const dueDate = new Date(d.dueDate);
      return dueDate < new Date();
    });

    if (overdueDebts.length === 0) {
      score += 10;
      factors.push({ name: "Payment Timeliness", score: 10, status: "excellent", description: "All payments on time" });
    } else {
      score += 0;
      factors.push({ name: "Payment Timeliness", score: 0, status: "critical", description: `${overdueDebts.length} overdue payment${overdueDebts.length > 1 ? 's' : ''}` });
    }

    return { score: Math.min(score, 100), factors };
  };

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