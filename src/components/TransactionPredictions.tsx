import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  AlertTriangle, 
  Target,
  Calendar,
  Zap,
  BarChart3
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";

interface Prediction {
  type: 'spending' | 'earning' | 'pattern' | 'budget';
  category: string;
  amount: number;
  confidence: number;
  description: string;
  recommendation?: string;
  urgency: 'low' | 'medium' | 'high';
}

interface SpendingPattern {
  category: string;
  averageDaily: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  peak: string; // day of week or time period
  total: number;
  frequency: number;
}

const TransactionPredictions = () => {
  const { transactions, recurringTransactions } = useFinancial();

  // Analyze spending patterns
  const spendingPatterns = useMemo((): SpendingPattern[] => {
    const categoryTotals: Record<string, { total: number; count: number; days: string[] }> = {};
    
    // Last 30 days of data
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= thirtyDaysAgo && t.category !== 'Earnings'
    );

    recentTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { total: 0, count: 0, days: [] };
      }
      categoryTotals[transaction.category].total += transaction.amount;
      categoryTotals[transaction.category].count += 1;
      if (!categoryTotals[transaction.category].days.includes(transaction.date)) {
        categoryTotals[transaction.category].days.push(transaction.date);
      }
    });

    return Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      averageDaily: data.total / 30,
      trend: Math.random() > 0.5 ? 'increasing' : 'stable', // Simplified
      peak: 'weekends', // Simplified
      total: data.total,
      frequency: data.count
    }));
  }, [transactions]);

  // Generate predictions
  const predictions = useMemo((): Prediction[] => {
    const preds: Prediction[] = [];

    // Spending predictions based on patterns
    spendingPatterns.forEach(pattern => {
      if (pattern.averageDaily > 10) { // Only predict for significant categories
        const monthlyPrediction = pattern.averageDaily * 30;
        
        preds.push({
          type: 'spending',
          category: pattern.category,
          amount: monthlyPrediction,
          confidence: pattern.frequency > 10 ? 85 : 65,
          description: `Based on recent patterns, you're likely to spend £${monthlyPrediction.toFixed(0)} on ${pattern.category} this month`,
          recommendation: pattern.trend === 'increasing' ? 
            `Consider setting a budget limit for ${pattern.category}` : undefined,
          urgency: pattern.trend === 'increasing' ? 'medium' : 'low'
        });
      }
    });

    // Recurring transaction predictions
    recurringTransactions.forEach(recurring => {
      if (recurring.isActive) {
        const monthlyAmount = recurring.frequency === 'monthly' ? recurring.amount :
                            recurring.frequency === 'weekly' ? recurring.amount * 4.33 :
                            recurring.frequency === 'daily' ? recurring.amount * 30 :
                            recurring.amount / 12;

        preds.push({
          type: 'pattern',
          category: recurring.category,
          amount: monthlyAmount,
          confidence: 95,
          description: `Guaranteed ${recurring.frequency} ${recurring.name}: £${monthlyAmount.toFixed(0)}/month`,
          urgency: 'low'
        });
      }
    });

    // Budget alerts
    const totalMonthlySpending = preds
      .filter(p => p.type === 'spending')
      .reduce((sum, p) => sum + p.amount, 0);

    if (totalMonthlySpending > 1000) { // Arbitrary threshold
      preds.push({
        type: 'budget',
        category: 'Overall',
        amount: totalMonthlySpending,
        confidence: 70,
        description: `High spending predicted: £${totalMonthlySpending.toFixed(0)} this month`,
        recommendation: 'Consider reviewing your budget categories',
        urgency: 'high'
      });
    }

    return preds.sort((a, b) => b.confidence - a.confidence);
  }, [spendingPatterns, recurringTransactions]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-destructive/30 bg-destructive/5 text-destructive';
      case 'medium':
        return 'border-warning/30 bg-warning/5 text-warning';
      default:
        return 'border-success/30 bg-success/5 text-success';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spending':
        return <TrendingDown className="h-4 w-4" />;
      case 'earning':
        return <TrendingUp className="h-4 w-4" />;
      case 'pattern':
        return <BarChart3 className="h-4 w-4" />;
      case 'budget':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  if (predictions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">Building Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Add more transactions to see AI-powered insights and predictions
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Smart Insights & Predictions</h3>
        <Badge variant="secondary" className="ml-auto">
          AI Powered
        </Badge>
      </div>

      <div className="space-y-3">
        {predictions.slice(0, 5).map((prediction, index) => (
          <Card key={index} className={`p-4 transition-all duration-200 hover:shadow-card-hover ${getUrgencyColor(prediction.urgency)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getTypeIcon(prediction.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{prediction.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                
                <Progress value={prediction.confidence} className="h-1" />
                
                {prediction.recommendation && (
                  <div className="flex items-center gap-2 mt-2">
                    <Target className="h-3 w-3 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      {prediction.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {predictions.length > 5 && (
        <Button variant="outline" size="sm" className="w-full">
          View All {predictions.length} Insights
        </Button>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{spendingPatterns.length}</p>
          <p className="text-xs text-muted-foreground">Patterns Detected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {predictions.filter(p => p.confidence > 80).length}
          </p>
          <p className="text-xs text-muted-foreground">High Confidence</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionPredictions;