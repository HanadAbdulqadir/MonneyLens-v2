import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fuel, 
  UtensilsCrossed, 
  ShoppingBag, 
  TrendingUp, 
  X, 
  Eye,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend,
  Treemap
} from 'recharts';
import { useState, useMemo } from "react";
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

type ViewType = 'pie' | 'bar' | 'treemap' | 'trend';

const EnhancedCategoryBreakdown = () => {
  const { transactions, categoryFilter, setCategoryFilter } = useFinancial();
  const [viewType, setViewType] = useState<ViewType>('pie');
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('month');
  const [showBudgetComparison, setShowBudgetComparison] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Filter by time frame
    const now = new Date();
    if (timeFrame === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return date >= weekStart && date <= weekEnd;
      });
    } else if (timeFrame === 'month') {
      const monthAgo = subDays(now, 30);
      filtered = filtered.filter(t => parseISO(t.date) >= monthAgo);
    }
    
    return filtered;
  }, [transactions, timeFrame]);
  
  const getCategoryTotals = () => {
    const totals = { Petrol: 0, Food: 0, Other: 0, Earnings: 0 };
    const counts = { Petrol: 0, Food: 0, Other: 0, Earnings: 0 };
    
    filteredTransactions.forEach(transaction => {
      if (transaction.category in totals) {
        totals[transaction.category as keyof typeof totals] += Math.abs(transaction.amount);
        counts[transaction.category as keyof typeof counts]++;
      }
    });
    return { totals, counts };
  };
  
  const { totals, counts } = getCategoryTotals();
  const totalSpent = totals.Petrol + totals.Food + totals.Other;
  
  // Mock budget data
  const budgets = { Petrol: 300, Food: 400, Other: 200, Earnings: 0 };
  
  const categories = [
    {
      name: "Earnings",
      amount: totals.Earnings,
      count: counts.Earnings,
      budget: budgets.Earnings,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      chartColor: "hsl(var(--success))",
      borderColor: "border-success/20",
      isEarnings: true
    },
    {
      name: "Petrol",
      amount: totals.Petrol,
      count: counts.Petrol,
      budget: budgets.Petrol,
      icon: Fuel,
      color: "text-warning",
      bg: "bg-warning/10",
      chartColor: "hsl(var(--warning))",
      borderColor: "border-warning/20",
      isEarnings: false
    },
    {
      name: "Food",
      amount: totals.Food,
      count: counts.Food,
      budget: budgets.Food,
      icon: UtensilsCrossed,
      color: "text-destructive",
      bg: "bg-destructive/10",
      chartColor: "hsl(var(--destructive))",
      borderColor: "border-destructive/20",
      isEarnings: false
    },
    {
      name: "Other",
      amount: totals.Other,
      count: counts.Other,
      budget: budgets.Other,
      icon: ShoppingBag,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      chartColor: "hsl(var(--muted-foreground))",
      borderColor: "border-muted/50",
      isEarnings: false
    },
  ];

  const expenseCategories = categories.filter(cat => !cat.isEarnings && cat.amount > 0);
  
  const chartData = expenseCategories.map(cat => ({
    name: cat.name,
    value: cat.amount,
    color: cat.chartColor,
    percentage: totalSpent > 0 ? ((cat.amount / totalSpent) * 100).toFixed(1) : 0,
    budget: cat.budget,
    remaining: Math.max(0, cat.budget - cat.amount),
    overBudget: cat.amount > cat.budget,
    count: cat.count
  }));

  // Weekly trend data
  const weeklyTrendData = useMemo(() => {
    if (timeFrame !== 'month') return [];
    
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => 
        format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const dayTotals = { Petrol: 0, Food: 0, Other: 0 };
      dayTransactions.forEach(t => {
        if (t.category !== 'Earnings' && t.category in dayTotals) {
          dayTotals[t.category as keyof typeof dayTotals] += Math.abs(t.amount);
        }
      });
      
      return {
        date: format(day, 'MMM dd'),
        ...dayTotals,
        total: dayTotals.Petrol + dayTotals.Food + dayTotals.Other
      };
    }).filter((_, index) => index % 2 === 0); // Show every other day for readability
  }, [filteredTransactions, timeFrame]);

  const handleCategoryClick = (categoryName: string) => {
    if (categoryFilter === categoryName) {
      setCategoryFilter(null);
      setSelectedCategory(null);
    } else {
      setCategoryFilter(categoryName);
      setSelectedCategory(categoryName);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">£{data.value.toFixed(2)}</span>
            </p>
            {data.payload.percentage && (
              <p className="flex justify-between">
                <span>Percentage:</span>
                <span className="font-medium">{data.payload.percentage}%</span>
              </p>
            )}
            {data.payload.count && (
              <p className="flex justify-between">
                <span>Transactions:</span>
                <span className="font-medium">{data.payload.count}</span>
              </p>
            )}
            {showBudgetComparison && data.payload.budget > 0 && (
              <>
                <div className="border-t pt-1 mt-2">
                  <p className="flex justify-between text-xs">
                    <span>Budget:</span>
                    <span>£{data.payload.budget}</span>
                  </p>
                  <p className="flex justify-between text-xs">
                    <span>Remaining:</span>
                    <span className={data.payload.overBudget ? 'text-destructive' : 'text-success'}>
                      {data.payload.overBudget ? 'Over by £' : '£'}{Math.abs(data.payload.remaining).toFixed(0)}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;

    switch (viewType) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            {showBudgetComparison && <Legend />}
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="Spent"
            />
            {showBudgetComparison && (
              <Bar 
                dataKey="budget" 
                fill="hsl(var(--muted))" 
                radius={[4, 4, 0, 0]}
                name="Budget"
              />
            )}
          </BarChart>
        );
      
      case 'treemap':
        return (
          <Treemap
            data={chartData}
            dataKey="value"
            aspectRatio={4/3}
            stroke="hsl(var(--background))"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );
      
      case 'trend':
        return (
          <BarChart data={weeklyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Petrol" stackId="a" fill="hsl(var(--warning))" />
            <Bar dataKey="Food" stackId="a" fill="hsl(var(--destructive))" />
            <Bar dataKey="Other" stackId="a" fill="hsl(var(--muted-foreground))" />
          </BarChart>
        );
      
      default: // pie
        return (
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              className="cursor-pointer"
              onClick={(data) => handleCategoryClick(data.name)}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={selectedCategory === entry.name ? "hsl(var(--primary))" : "transparent"}
                  strokeWidth={selectedCategory === entry.name ? 3 : 0}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );
    }
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.01]">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-bold">Enhanced Category Analysis</h3>
          <p className="text-sm text-muted-foreground">
            {timeFrame === 'week' ? 'This week' : timeFrame === 'month' ? 'Last 30 days' : 'All time'} • 
            {expenseCategories.length} categories • £{totalSpent.toFixed(0)} total
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Type Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { type: 'pie' as ViewType, icon: PieChartIcon },
              { type: 'bar' as ViewType, icon: BarChart3 },
              { type: 'trend' as ViewType, icon: TrendingUp },
            ].map(({ type, icon: Icon }) => (
              <Button
                key={type}
                variant={viewType === type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewType(type)}
                className="h-7 w-7 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Time Frame Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { value: 'week' as const, label: 'Week' },
              { value: 'month' as const, label: 'Month' },
              { value: 'all' as const, label: 'All' },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={timeFrame === value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeFrame(value)}
                className="h-7 px-3 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Toggle Buttons */}
          <Button
            variant={showBudgetComparison ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowBudgetComparison(!showBudgetComparison)}
            className="text-xs"
          >
            Budget
          </Button>

          {categoryFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick(categoryFilter)}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {/* Category List */}
      <div className="space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isFiltered = categoryFilter === category.name;
          const isOtherFiltered = categoryFilter && categoryFilter !== category.name;
          const budgetPercentage = category.budget > 0 ? (category.amount / category.budget) * 100 : 0;
          
          return (
            <div 
              key={category.name} 
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                isFiltered 
                  ? `bg-primary/5 ${category.borderColor} border-2` 
                  : 'border-transparent hover:bg-muted/50'
              } ${isOtherFiltered ? 'opacity-50' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bg}`}>
                    <Icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count} transactions
                      </Badge>
                      {budgetPercentage > 100 && (
                        <Badge variant="destructive" className="text-xs">
                          Over budget
                        </Badge>
                      )}
                    </div>
                    {totalSpent > 0 && !category.isEarnings && (
                      <p className="text-xs text-muted-foreground">
                        {((category.amount / totalSpent) * 100).toFixed(1)}% of total spending
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${category.isEarnings ? 'text-success' : 'text-foreground'}`}>
                    {category.isEarnings ? '+' : '-'}£{category.amount.toFixed(0)}
                  </p>
                  {!category.isEarnings && category.amount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      £{(category.amount / (category.count || 1)).toFixed(0)} avg
                    </p>
                  )}
                </div>
              </div>
              
              {/* Budget Progress */}
              {showBudgetComparison && category.budget > 0 && !category.isEarnings && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Budget Progress</span>
                    <span className="text-xs font-medium">
                      £{category.amount.toFixed(0)} / £{category.budget}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(budgetPercentage, 100)} 
                    className={`h-2 ${
                      budgetPercentage > 100 
                        ? '[&>div]:bg-destructive' 
                        : budgetPercentage > 80 
                        ? '[&>div]:bg-warning' 
                        : '[&>div]:bg-success'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{budgetPercentage.toFixed(0)}% used</span>
                    <span className={budgetPercentage > 100 ? 'text-destructive' : 'text-success'}>
                      {budgetPercentage > 100 
                        ? `£${(category.amount - category.budget).toFixed(0)} over` 
                        : `£${(category.budget - category.amount).toFixed(0)} left`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default EnhancedCategoryBreakdown;