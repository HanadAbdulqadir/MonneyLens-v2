import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useFinancial } from "@/contexts/FinancialContext";
import { Target, TrendingUp, AlertTriangle, CheckCircle, Settings, TrendingDown, Calendar, DollarSign, Zap, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { CategorySelector } from "@/components/CategorySelector";

const Budget = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [sliderBudgets, setSliderBudgets] = useState<Record<string, number>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    budget: '',
    usePreset: false
  });

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
      
      // Initialize budgets for existing categories if not already set
      if (data && data.length > 0) {
        const existingBudgets = { ...budgets };
        let hasNewCategories = false;
        
        data.forEach(category => {
          if (!existingBudgets[category.name]) {
            existingBudgets[category.name] = 500; // Default budget
            hasNewCategories = true;
          }
        });
        
        if (hasNewCategories) {
          setBudgets(existingBudgets);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Common budget categories for fallback
  const commonCategories = [
    'Groceries', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 
    'Healthcare', 'Education', 'Travel', 'Subscriptions', 'Insurance',
    'Dining Out', 'Fitness', 'Utilities', 'Internet', 'Phone'
  ];

  // Update slider budgets when budgets change
  useEffect(() => {
    setSliderBudgets(budgets);
  }, [budgets]);

  // Calculate current spending for each category
  const getCurrentSpending = (category: string) => {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate weekly average spending
  const getWeeklyAverage = (category: string) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklySpending = transactions
      .filter(t => t.category === category && new Date(t.date) >= oneWeekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return weeklySpending;
  };

  // Predict monthly spending based on current trend
  const getPredictedSpending = (category: string) => {
    const weeklyAvg = getWeeklyAverage(category);
    return weeklyAvg * 4.33; // Average weeks per month
  };

  // Get spending recommendations
  const getRecommendation = (category: string, spent: number, budget: number) => {
    const predicted = getPredictedSpending(category);
    const percentUsed = (spent / budget) * 100;
    
    if (predicted > budget) {
      const overage = predicted - budget;
      return {
        type: 'warning',
        message: `Trending to overspend by £${overage.toFixed(2)} this month`
      };
    } else if (percentUsed < 50) {
      const saved = budget - predicted;
      return {
        type: 'success',
        message: `On track to save £${saved.toFixed(2)} this month`
      };
    }
    return null;
  };

  const budgetItems = Object.entries(sliderBudgets).map(([category, budget]) => {
    const spent = getCurrentSpending(category);
    const predicted = getPredictedSpending(category);
    const percentage = (spent / budget) * 100;
    const predictedPercentage = (predicted / budget) * 100;
    const remaining = budget - spent;
    const recommendation = getRecommendation(category, spent, budget);
    
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) status = 'danger';
    else if (percentage >= 75 || predictedPercentage >= 100) status = 'warning';

    return {
      category,
      budget,
      spent,
      predicted,
      percentage: Math.min(percentage, 100),
      predictedPercentage: Math.min(predictedPercentage, 100),
      remaining,
      status,
      recommendation
    };
  });

  // Chart data
  const chartData = budgetItems.map(item => ({
    category: item.category,
    budget: item.budget,
    spent: item.spent,
    predicted: item.predicted,
    remaining: Math.max(0, item.budget - item.spent)
  }));

  const totalBudget = Object.values(sliderBudgets).reduce((sum, amount) => sum + amount, 0);
  const totalSpent = Object.keys(sliderBudgets).reduce((sum, category) => sum + getCurrentSpending(category), 0);
  const totalPredicted = Object.keys(sliderBudgets).reduce((sum, category) => sum + getPredictedSpending(category), 0);
  const totalRemaining = totalBudget - totalSpent;

  // Quick budget adjustment
  const handleSliderChange = (category: string, value: number[]) => {
    setSliderBudgets(prev => ({ ...prev, [category]: value[0] }));
  };

  const applySliderBudgets = () => {
    setBudgets(sliderBudgets);
    toast({
      title: "Budgets Updated!",
      description: "Your new budget allocations have been saved",
    });
  };

  const resetSliderBudgets = () => {
    setSliderBudgets(budgets);
  };

  // Add new budget category
  const handleAddCategory = async () => {
    const categoryName = newCategoryData.name.trim();
    const budgetAmount = parseFloat(newCategoryData.budget);

    if (!categoryName || isNaN(budgetAmount) || budgetAmount <= 0) {
      toast({
        title: "Error",
        description: "Please select a category and enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    if (budgets.hasOwnProperty(categoryName)) {
      toast({
        title: "Error",
        description: "This category already has a budget set",
        variant: "destructive"
      });
      return;
    }

    setBudgets(prev => ({ ...prev, [categoryName]: budgetAmount }));
    setNewCategoryData({ name: '', budget: '', usePreset: false });
    setIsAddingCategory(false);
    
    // Refresh categories to make sure we have the latest data
    await loadCategories();
    
    toast({
      title: "Success",
      description: `Budget of £${budgetAmount} set for ${categoryName}`,
    });
  };

  // Delete budget category
  const handleDeleteCategory = (category: string) => {
    if (Object.keys(budgets).length <= 1) {
      toast({
        title: "Error",
        description: "You must have at least one budget category",
        variant: "destructive"
      });
      return;
    }

    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);
    
    toast({
      title: "Success",
      description: `${category} budget removed`,
    });
  };

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="flex justify-between text-foreground">
                <span>{entry.dataKey === 'spent' ? 'Spent:' : 
                       entry.dataKey === 'predicted' ? 'Predicted:' : 
                       entry.dataKey === 'budget' ? 'Budget:' : 'Remaining:'}</span>
                <span className="font-medium ml-2">£{entry.value.toFixed(2)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">Track spending, adjust budgets, and get smart recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Budget Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Use CategorySelector for existing categories or create new ones */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select from Your Categories</Label>
                  <div className="space-y-4">
                    <CategorySelector 
                      value={newCategoryData.name}
                      onCategorySelect={(category) => setNewCategoryData(prev => ({ ...prev, name: category }))}
                      showCreateNew={true}
                    />
                    
                    {categories.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No categories found. Create some categories first using the + button above.
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Set Budget Amount</span>
                  </div>
                </div>

                {/* Budget Amount Input */}
                <div className="space-y-4">
                  {newCategoryData.name && (
                    <div>
                      <Label htmlFor="category-budget">Monthly Budget for "{newCategoryData.name}" (£)</Label>
                      <Input
                        id="category-budget"
                        type="number"
                        step="0.01"
                        value={newCategoryData.budget}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryData({ name: '', budget: '', usePreset: false });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCategory}
                    disabled={!newCategoryData.name || !newCategoryData.budget}
                  >
                    Set Budget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {showRecommendations ? 'Hide' : 'Show'} Smart Insights
          </Button>
        </div>
      </div>

      {/* Enhanced Budget Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Budget</p>
              <p className="text-3xl font-bold">£{totalBudget.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-destructive/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-3xl font-bold text-destructive">£{totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-warning/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-full">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Predicted Total</p>
              <p className="text-3xl font-bold text-warning">£{totalPredicted.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                This month projection
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-success/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-full">
              <DollarSign className={`h-6 w-6 ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                £{Math.abs(totalRemaining).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget vs Actual Chart */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Budget vs Actual Spending</h3>
          <Badge variant="outline" className="text-xs">
            Monthly Overview
          </Badge>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="category" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="budget" 
                fill="hsl(var(--muted))" 
                name="Budget"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="spent" 
                fill="hsl(var(--destructive))" 
                name="Spent"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="predicted" 
                fill="hsl(var(--warning))" 
                name="Predicted"
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Interactive Budget Adjustment */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Quick Budget Adjustments</h3>
            <p className="text-sm text-muted-foreground">Use sliders to adjust your budget allocations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetSliderBudgets}>
              Reset
            </Button>
            <Button size="sm" onClick={applySliderBudgets}>
              Apply Changes
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(sliderBudgets).map(([category, amount]) => (
            <div key={category} className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-medium">{category}</Label>
                <span className="text-lg font-bold text-primary">£{amount}</span>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(value) => handleSliderChange(category, value)}
                max={1000}
                min={50}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>£50</span>
                <span>Current: £{getCurrentSpending(category).toFixed(0)}</span>
                <span>£1000</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Enhanced Budget Categories */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {budgetItems.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          
          return (
            <Card key={item.category} className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
              item.status === 'danger' ? 'border-destructive/50 bg-destructive/5' :
              item.status === 'warning' ? 'border-warning/50 bg-warning/5' :
              'border-border hover:border-primary/30'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl mb-1">{item.category}</h3>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(item.status)}`} />
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'danger' ? 'Over Budget!' : 
                       item.status === 'warning' ? 'Approaching Limit' : 'On Track'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/10"
                        onClick={() => {
                          setEditingBudget(item.category);
                          setNewAmount(item.budget.toString());
                        }}
                      >
                        <Settings className="h-4 w-4" />
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

                  {/* Delete Category Button - only show if more than 1 category */}
                  {Object.keys(budgets).length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-destructive/10 text-destructive"
                      onClick={() => handleDeleteCategory(item.category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Spending Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-lg font-bold text-destructive">£{item.spent.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="text-lg font-bold">£{item.budget.toFixed(2)}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Current Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(item.status)}`}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      className={`h-3 transition-all duration-700 ${
                        item.status === 'danger' ? '[&>div]:bg-destructive' :
                        item.status === 'warning' ? '[&>div]:bg-warning' :
                        '[&>div]:bg-success'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Predicted Usage</span>
                      <span className="text-sm font-bold text-warning">
                        {item.predictedPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={item.predictedPercentage} 
                      className="h-2 opacity-60 [&>div]:bg-warning"
                    />
                  </div>
                </div>

                {/* Remaining Amount */}
                <div className={`text-center p-3 rounded-lg border ${
                  item.remaining >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {item.remaining >= 0 ? 'Remaining' : 'Over Budget'}
                  </p>
                  <p className={`text-xl font-bold ${item.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                    £{Math.abs(item.remaining).toFixed(2)}
                  </p>
                </div>

                {/* Smart Recommendation */}
                {showRecommendations && item.recommendation && (
                  <Alert className={`${
                    item.recommendation.type === 'warning' ? 'border-warning bg-warning/5' : 'border-success bg-success/5'
                  }`}>
                    <Zap className={`h-4 w-4 ${
                      item.recommendation.type === 'warning' ? 'text-warning' : 'text-success'
                    }`} />
                    <AlertDescription className="text-sm font-medium">
                      {item.recommendation.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;