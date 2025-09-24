import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Wallet, ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const BudgetOverview = () => {
  const { transactions } = useFinancial();
  const navigate = useNavigate();
  
  // Default budgets (in a real app, these would come from context)
  const [budgets] = useState({
    Petrol: 300,
    Food: 400,
    Other: 500
  });

  const getCurrentSpending = (category: string) => {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const budgetItems = Object.entries(budgets).map(([category, budget]) => {
    const spent = getCurrentSpending(category);
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;
    
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) status = 'danger';
    else if (percentage >= 75) status = 'warning';

    return {
      category,
      budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining,
      status
    };
  });

  const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  const totalSpent = Object.keys(budgets).reduce((sum, category) => sum + getCurrentSpending(category), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = (totalSpent / totalBudget) * 100;

  const overBudgetCategories = budgetItems.filter(item => item.status === 'danger');
  const warningCategories = budgetItems.filter(item => item.status === 'warning');

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Budget Tracker</h3>
            <p className="text-sm text-muted-foreground">Monthly spending overview</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/budget')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Overall Budget Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Budget Usage</span>
          <span className={`text-sm font-bold ${
            overallProgress >= 100 ? 'text-destructive' : 
            overallProgress >= 75 ? 'text-warning' : 'text-success'
          }`}>
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={overallProgress} 
          className={`h-2 ${
            overallProgress >= 100 ? '[&>div]:bg-destructive' :
            overallProgress >= 75 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
          }`}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Spent: £{totalSpent.toFixed(0)}</span>
          <span>Budget: £{totalBudget.toFixed(0)}</span>
        </div>
      </div>

      {/* Budget Alerts */}
      {(overBudgetCategories.length > 0 || warningCategories.length > 0) && (
        <div className="mb-4 space-y-2">
          {overBudgetCategories.length > 0 && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-sm text-destructive">
                  {overBudgetCategories.length} categor{overBudgetCategories.length > 1 ? 'ies' : 'y'} over budget
                </span>
              </div>
              {overBudgetCategories.map(item => (
                <div key={item.category} className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="font-medium text-destructive">
                    £{Math.abs(item.remaining).toFixed(0)} over
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {warningCategories.length > 0 && (
            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="font-semibold text-sm text-warning">
                  {warningCategories.length} categor{warningCategories.length > 1 ? 'ies' : 'y'} approaching limit
                </span>
              </div>
              {warningCategories.map(item => (
                <div key={item.category} className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="font-medium text-warning">
                    {item.percentage.toFixed(0)}% used
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget Categories */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground">Category Breakdown</h4>
        {budgetItems.map(item => {
          const getStatusIcon = () => {
            switch (item.status) {
              case 'danger': return <AlertTriangle className="h-3 w-3 text-destructive" />;
              case 'warning': return <TrendingUp className="h-3 w-3 text-warning" />;
              default: return <CheckCircle className="h-3 w-3 text-success" />;
            }
          };

          const getStatusColor = () => {
            switch (item.status) {
              case 'danger': return 'text-destructive';
              case 'warning': return 'text-warning';
              default: return 'text-success';
            }
          };

          return (
            <div key={item.category} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-medium text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">£{item.spent.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">of £{item.budget}</p>
                </div>
              </div>
              
              <Progress 
                value={item.percentage} 
                className={`h-1.5 mb-1 ${
                  item.status === 'danger' ? '[&>div]:bg-destructive' :
                  item.status === 'warning' ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                }`}
              />
              
              <div className="flex justify-between text-xs">
                <span className={getStatusColor()}>
                  {item.percentage.toFixed(0)}% used
                </span>
                <span className={item.remaining >= 0 ? 'text-muted-foreground' : 'text-destructive'}>
                  {item.remaining >= 0 ? 
                    `£${item.remaining.toFixed(0)} left` : 
                    `£${Math.abs(item.remaining).toFixed(0)} over`
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Summary */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">£{totalBudget.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Budget</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${totalSpent > totalBudget ? 'text-destructive' : 'text-primary'}`}>
            £{totalSpent.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`}>
            £{Math.abs(totalRemaining).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BudgetOverview;