import React, { useState, useEffect } from 'react';
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { Button } from "@shared/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Target, 
  Zap, 
  Shield,
  Calendar,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from "@shared/hooks/use-toast";

interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  recommendation?: string;
}

interface FinancialHealthScore {
  overall: number;
  spending: number;
  savings: number;
  budgeting: number;
  goals: number;
}

interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  icon: React.ReactNode;
}

const AIFinancialInsights = () => {
  const { transactions, goals } = useFinancial();
  const { toast } = useToast();
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    analyzeFinancialData();
  }, [transactions, goals]);

  const analyzeFinancialData = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in real implementation, this would use ML algorithms)
    setTimeout(() => {
      const patterns = analyzeSpendingPatterns();
      const score = calculateFinancialHealth();
      const aiInsights = generateAIInsights(patterns, score);
      
      setSpendingPatterns(patterns);
      setHealthScore(score);
      setInsights(aiInsights);
      setIsAnalyzing(false);
    }, 1000);
  };

  const analyzeSpendingPatterns = (): SpendingPattern[] => {
    if (transactions.length === 0) return [];
    
    const categorySpending: Record<string, number[]> = {};
    const currentMonth = new Date().getMonth();
    
    // Group transactions by category and month
    transactions.forEach(transaction => {
      if (transaction.category !== 'Earnings') {
        const transactionMonth = new Date(transaction.date).getMonth();
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = new Array(12).fill(0);
        }
        categorySpending[transaction.category][transactionMonth] += Math.abs(transaction.amount);
      }
    });
    
    const patterns: SpendingPattern[] = [];
    
    Object.entries(categorySpending).forEach(([category, monthlySpending]) => {
      const recentMonths = monthlySpending.slice(-3).filter(amount => amount > 0);
      if (recentMonths.length < 2) return;
      
      const averageMonthly = recentMonths.reduce((sum, amount) => sum + amount, 0) / recentMonths.length;
      const latestMonth = recentMonths[recentMonths.length - 1];
      const previousMonth = recentMonths[recentMonths.length - 2];
      const changePercentage = ((latestMonth - previousMonth) / previousMonth) * 100;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (changePercentage > 10) trend = 'increasing';
      else if (changePercentage < -10) trend = 'decreasing';
      
      patterns.push({
        category,
        averageMonthly,
        trend,
        changePercentage: Math.abs(changePercentage),
        recommendation: generateCategoryRecommendation(category, trend, averageMonthly)
      });
    });
    
    return patterns.sort((a, b) => b.averageMonthly - a.averageMonthly).slice(0, 5);
  };

  const generateCategoryRecommendation = (category: string, trend: string, amount: number): string => {
    const recommendations: Record<string, string> = {
      'Food & Dining': trend === 'increasing' 
        ? 'Consider meal prepping to reduce dining out costs' 
        : 'Great job managing food expenses!',
      'Transportation': 'Explore public transport or carpooling options',
      'Shopping': 'Try implementing a 24-hour waiting period before non-essential purchases',
      'Entertainment': 'Look for free community events as alternatives',
      'Bills & Utilities': 'Compare providers to ensure you have the best rates'
    };
    
    return recommendations[category] || 'Monitor this category for optimization opportunities';
  };

  const calculateFinancialHealth = (): FinancialHealthScore => {
    if (transactions.length === 0) {
      return { overall: 0, spending: 0, savings: 0, budgeting: 0, goals: 0 };
    }
    
    // Calculate spending health (lower is better)
    const totalSpending = transactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const spendingRatio = totalIncome > 0 ? (totalSpending / totalIncome) : 1;
    const spendingScore = Math.max(0, 100 - (spendingRatio * 100));
    
    // Calculate savings health
    const savingsScore = totalIncome > 0 ? Math.min(100, (totalIncome - totalSpending) / totalIncome * 100) : 0;
    
    // Calculate budgeting health (simplified)
    const budgetingScore = 50; // Default score since budgets aren't implemented yet
    
    // Calculate goals health
    const goalsScore = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length
      : 0;
    
    const overall = (spendingScore * 0.3) + (savingsScore * 0.3) + (budgetingScore * 0.2) + (goalsScore * 0.2);
    
    return {
      overall: Math.round(overall),
      spending: Math.round(spendingScore),
      savings: Math.round(savingsScore),
      budgeting: Math.round(budgetingScore),
      goals: Math.round(goalsScore)
    };
  };

  const generateAIInsights = (patterns: SpendingPattern[], score: FinancialHealthScore): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Spending pattern insights
    patterns.forEach(pattern => {
      if (pattern.trend === 'increasing' && pattern.changePercentage > 20) {
        insights.push({
          id: `spending-${pattern.category}`,
          type: 'warning',
          title: `Rising ${pattern.category} Costs`,
          description: `Your ${pattern.category.toLowerCase()} spending increased by ${pattern.changePercentage.toFixed(0)}% last month. ${pattern.recommendation}`,
          priority: 'high',
          icon: <TrendingUp className="h-4 w-4" />
        });
      }
    });
    
    // Financial health insights
    if (score.overall < 50) {
      insights.push({
        id: 'health-low',
        type: 'warning',
        title: 'Financial Health Needs Attention',
        description: 'Your overall financial health score is below average. Focus on reducing expenses and increasing savings.',
        priority: 'high',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } else if (score.overall > 80) {
      insights.push({
        id: 'health-excellent',
        type: 'achievement',
        title: 'Excellent Financial Health!',
        description: 'Your financial habits are outstanding. Consider investing your surplus funds.',
        priority: 'low',
        icon: <CheckCircle className="h-4 w-4" />
      });
    }
    
    // Goal progress insights
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      if (progress > 75) {
        insights.push({
          id: `goal-${goal.id}`,
          type: 'achievement',
          title: `${goal.name} Almost Complete!`,
          description: `You're ${progress.toFixed(0)}% towards your ${goal.name} goal. Keep it up!`,
          priority: 'medium',
          icon: <Target className="h-4 w-4" />
        });
      }
    });
    
    // Savings opportunity insights
    if (score.savings < 30) {
      insights.push({
        id: 'savings-opportunity',
        type: 'opportunity',
        title: 'Savings Opportunity',
        description: 'Consider setting up automatic transfers to build your savings faster.',
        priority: 'medium',
        icon: <PiggyBank className="h-4 w-4" />
      });
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 5);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Financial Insights
          </CardTitle>
          <CardDescription>Analyzing your financial patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Financial Insights
          </CardTitle>
          <CardDescription>Add some transactions to unlock personalized insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Once you start tracking expenses, I'll provide intelligent recommendations to optimize your finances.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>Your overall financial wellness assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{healthScore?.overall}</span>
              </div>
              <Badge 
                variant={healthScore && healthScore.overall >= 70 ? "default" : "secondary"} 
                className="absolute -top-2 -right-2"
              >
                {healthScore && healthScore.overall >= 70 ? 'Excellent' : 'Needs Attention'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Spending</span>
                  <span>{healthScore?.spending}%</span>
                </div>
                <Progress value={healthScore?.spending} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Savings</span>
                  <span>{healthScore?.savings}%</span>
                </div>
                <Progress value={healthScore?.savings} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Budgeting</span>
                  <span>{healthScore?.budgeting}%</span>
                </div>
                <Progress value={healthScore?.budgeting} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Goals</span>
                  <span>{healthScore?.goals}%</span>
                </div>
                <Progress value={healthScore?.goals} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>AI-powered insights to improve your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'warning' ? 'bg-red-100 text-red-600' :
                    insight.type === 'achievement' ? 'bg-green-100 text-green-600' :
                    insight.type === 'opportunity' ? 'bg-blue-100 text-blue-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={
                        insight.priority === 'high' ? 'destructive' :
                        insight.priority === 'medium' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spending Patterns */}
      {spendingPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Patterns
            </CardTitle>
            <CardDescription>Analysis of your monthly spending habits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingPatterns.map((pattern) => (
                <div key={pattern.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(pattern.trend)}
                    <div>
                      <div className="font-medium">{pattern.category}</div>
                      <div className="text-sm text-muted-foreground">
                        £{pattern.averageMonthly.toFixed(2)}/month
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getTrendColor(pattern.trend)}`}>
                      {pattern.trend === 'increasing' ? '+' : pattern.trend === 'decreasing' ? '-' : ''}
                      {pattern.changePercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{pattern.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={analyzeFinancialData} variant="outline" className="w-full">
        <Sparkles className="h-4 w-4 mr-2" />
        Refresh Insights
      </Button>
    </div>
  );
};

export default AIFinancialInsights;
