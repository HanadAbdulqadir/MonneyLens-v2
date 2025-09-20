import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFinancial } from "@/contexts/FinancialContext";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Budget = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState({
    Petrol: 300,
    Food: 400,
    Other: 500
  });
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState("");

  // Calculate current spending for each category
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

  const handleUpdateBudget = (category: string) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    setBudgets(prev => ({ ...prev, [category]: amount }));
    setEditingBudget(null);
    setNewAmount("");
    toast({
      title: "Success",
      description: `${category} budget updated to £${amount}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'danger': return 'bg-destructive';
      case 'warning': return 'bg-warning';
      default: return 'bg-success';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">Track your spending against your budget goals</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <Target className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Total Budget</p>
              <p className="text-2xl font-bold">£{totalBudget.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">£{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <CheckCircle className={`h-8 w-8 ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                £{totalRemaining.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetItems.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          
          return (
            <Card key={item.category} className="p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{item.category}</h3>
                <StatusIcon className={`h-5 w-5 ${getStatusColor(item.status)}`} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Spent: £{item.spent.toFixed(2)}</span>
                  <span>Budget: £{item.budget.toFixed(2)}</span>
                </div>
                
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.percentage.toFixed(0)}% used
                  </span>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingBudget(item.category);
                          setNewAmount(item.budget.toString());
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update {item.category} Budget</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="budget-amount">Monthly Budget (£)</Label>
                          <Input
                            id="budget-amount"
                            type="number"
                            step="0.01"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setEditingBudget(null);
                              setNewAmount("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => handleUpdateBudget(item.category)}>
                            Update Budget
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <p className={`text-xs ${item.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                  £{Math.abs(item.remaining).toFixed(2)} {item.remaining >= 0 ? 'remaining' : 'over budget'}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;