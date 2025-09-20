import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFinancial } from "@/contexts/FinancialContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Trash2, TrendingUp, TrendingDown, Fuel, UtensilsCrossed, 
  ShoppingBag, Search, Filter, Calendar, BarChart3, PieChart, Target,
  ArrowUp, ArrowDown, AlertTriangle, CheckCircle, DollarSign,
  Coffee, Car, Home, Gamepad2, Heart, Book, Plane, Gift, Shirt
} from "lucide-react";
import { 
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, 
  Area, AreaChart, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface CategoryBudget {
  categoryName: string;
  monthlyLimit: number;
  warningThreshold: number; // percentage
}

const EnhancedCategoryManager = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [viewType, setViewType] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  
  // Category budgets (in a real app, these would come from context/database)
  const [categoryBudgets] = useState<CategoryBudget[]>([
    { categoryName: 'Petrol', monthlyLimit: 200, warningThreshold: 80 },
    { categoryName: 'Food', monthlyLimit: 400, warningThreshold: 75 },
    { categoryName: 'Other', monthlyLimit: 300, warningThreshold: 85 },
  ]);

  const categoryIcons = {
    'Earnings': TrendingUp,
    'Petrol': Fuel,
    'Food': UtensilsCrossed,
    'Other': ShoppingBag,
    'Coffee': Coffee,
    'Transport': Car,
    'Housing': Home,
    'Entertainment': Gamepad2,
    'Healthcare': Heart,
    'Education': Book,
    'Travel': Plane,
    'Gifts': Gift,
    'Clothing': Shirt
  };

  const categoryColors = {
    'Earnings': 'hsl(var(--success))',
    'Petrol': 'hsl(var(--warning))',
    'Food': 'hsl(var(--destructive))',
    'Other': 'hsl(var(--primary))',
    'Coffee': '#8B4513',
    'Transport': '#4169E1',
    'Housing': '#228B22',
    'Entertainment': '#FF69B4',
    'Healthcare': '#DC143C',
    'Education': '#4B0082',
    'Travel': '#20B2AA',
    'Gifts': '#FFD700',
    'Clothing': '#9370DB'
  };

  // Get date range based on selection
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (selectedTimeRange) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case '3months':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [selectedTimeRange]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, dateRange);
    });
  }, [transactions, dateRange]);

  // Enhanced category statistics
  const categoryStats = useMemo(() => {
    const categories = ['Earnings', 'Petrol', 'Food', 'Other'];
    
    return categories.map(categoryName => {
      const categoryTransactions = filteredTransactions.filter(t => t.category === categoryName);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const count = categoryTransactions.length;
      const budget = categoryBudgets.find(b => b.categoryName === categoryName);
      
      // Calculate trends (compare with previous period)
      const previousPeriodStart = new Date(dateRange.start);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.category === categoryName && 
               tDate >= previousPeriodStart && 
               tDate < dateRange.start;
      });
      
      const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
      const trend = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;
      
      // Calculate average per transaction
      const avgTransaction = count > 0 ? total / count : 0;
      
      // Budget analysis
      let budgetStatus: 'safe' | 'warning' | 'danger' = 'safe';
      let budgetProgress = 0;
      
      if (budget && categoryName !== 'Earnings') {
        budgetProgress = (Math.abs(total) / budget.monthlyLimit) * 100;
        if (budgetProgress >= 100) {
          budgetStatus = 'danger';
        } else if (budgetProgress >= budget.warningThreshold) {
          budgetStatus = 'warning';
        }
      }

      return {
        name: categoryName,
        total: categoryName === 'Earnings' ? total : Math.abs(total),
        count,
        trend,
        avgTransaction,
        type: categoryName === 'Earnings' ? 'income' : 'expense',
        icon: categoryIcons[categoryName as keyof typeof categoryIcons],
        color: categoryColors[categoryName as keyof typeof categoryColors],
        budget: budget?.monthlyLimit || 0,
        budgetProgress,
        budgetStatus,
        transactions: categoryTransactions
      };
    }).filter(cat => searchTerm === '' || cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [filteredTransactions, dateRange, transactions, categoryBudgets, searchTerm]);

  const totalExpenses = categoryStats.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + cat.total, 0);
  const totalIncome = categoryStats.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + cat.total, 0);
  const netIncome = totalIncome - totalExpenses;

  // Chart data for different visualizations
  const pieChartData = categoryStats.filter(cat => cat.type === 'expense' && cat.total > 0).map(cat => ({
    name: cat.name,
    value: cat.total,
    color: cat.color,
    count: cat.count
  }));

  const budgetChartData = categoryStats.filter(cat => cat.type === 'expense' && cat.budget > 0).map(cat => ({
    name: cat.name,
    spent: cat.total,
    budget: cat.budget,
    progress: cat.budgetProgress,
    status: cat.budgetStatus
  }));

  // Trend analysis for the past weeks
  const trendData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = subDays(now, i * 7);
      const weekEnd = subDays(now, (i - 1) * 7);
      
      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= weekStart && tDate <= weekEnd;
      });

      const weekData: any = {
        week: format(weekStart, 'MMM dd'),
        total: 0
      };

      categoryStats.forEach(cat => {
        const catTotal = weekTransactions
          .filter(t => t.category === cat.name && cat.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        weekData[cat.name] = catTotal;
        weekData.total += catTotal;
      });

      weeks.push(weekData);
    }
    
    return weeks;
  }, [transactions, categoryStats]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: £{entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (viewType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPie>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPie>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryStats.filter(cat => cat.type === 'expense')}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {categoryStats.filter(cat => cat.type === 'expense').map(cat => (
                <Line 
                  key={cat.name}
                  type="monotone" 
                  dataKey={cat.name} 
                  stroke={cat.color}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'budget':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={budgetChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" fill="hsl(var(--muted))" name="Budget" />
              <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categoryStats.filter(cat => cat.type === 'expense').map(cat => (
                <div key={cat.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{cat.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{cat.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBudgetDialog(true)}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            Budgets
          </Button>
          
          <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input id="category-name" placeholder="Enter category name" />
                </div>
                <div>
                  <Label>Category Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast({ title: "Coming Soon", description: "Custom categories will be available soon" });
                    setNewCategoryDialog(false);
                  }}>
                    Add Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Total Income</p>
              <p className="text-2xl font-bold">£{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingDown className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">£{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className={`h-8 w-8 ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                £{netIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">#</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Categories</p>
              <p className="text-2xl font-bold">{categoryStats.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={viewType} onValueChange={setViewType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="trend">Trends</TabsTrigger>
          <TabsTrigger value="budget">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value={viewType}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    {viewType === 'overview' && 'Category Overview'}
                    {viewType === 'pie' && 'Expense Distribution'}
                    {viewType === 'bar' && 'Category Comparison'}
                    {viewType === 'trend' && 'Spending Trends'}
                    {viewType === 'budget' && 'Budget Analysis'}
                  </h3>
                  <Badge variant="outline">
                    {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd')}
                  </Badge>
                </div>
                {renderChart()}
              </Card>
            </div>

            {/* Category Details */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category Details</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categoryStats.map((category) => {
                    const Icon = category.icon;
                    
                    return (
                      <div 
                        key={category.name} 
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{category.name}</h4>
                                <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                                  {category.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {category.count} transactions
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold" style={{ color: category.color }}>
                              £{category.total.toFixed(2)}
                            </p>
                            {category.trend !== 0 && (
                              <div className={`flex items-center gap-1 text-xs ${
                                category.trend > 0 ? 'text-destructive' : 'text-success'
                              }`}>
                                {category.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(category.trend).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Budget Progress */}
                        {category.budget > 0 && category.type === 'expense' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Budget Progress</span>
                              <span>{category.budgetProgress.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={category.budgetProgress} 
                              className={`h-2 ${
                                category.budgetStatus === 'danger' ? 'progress-danger' :
                                category.budgetStatus === 'warning' ? 'progress-warning' : ''
                              }`}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>£{category.total.toFixed(2)} spent</span>
                              <span>£{category.budget.toFixed(2)} budget</span>
                            </div>
                          </div>
                        )}

                        {/* Average Transaction */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Avg per transaction: £{category.avgTransaction.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Budget Alerts */}
              {budgetChartData.some(cat => cat.status !== 'safe') && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Budget Alerts
                  </h3>
                  <div className="space-y-3">
                    {budgetChartData
                      .filter(cat => cat.status !== 'safe')
                      .map(cat => (
                        <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className={`p-1 rounded-full ${
                            cat.status === 'danger' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                          }`}>
                            {cat.status === 'danger' ? 
                              <AlertTriangle className="h-4 w-4" /> : 
                              <AlertTriangle className="h-4 w-4" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {cat.progress.toFixed(1)}% of budget used
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">£{cat.spent.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">/ £{cat.budget.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCategoryManager;