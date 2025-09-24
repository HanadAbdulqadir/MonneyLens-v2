import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Filter,
  Zap,
  Globe,
  Clock,
  Percent,
  Award,
  Activity
} from "lucide-react";
import { 
  format, 
  subDays, 
  subWeeks, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  parseISO,
  isWithinInterval
} from "date-fns";

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

const AdvancedAnalyticsDashboard = ({ className }: AdvancedAnalyticsDashboardProps) => {
  const { dailyData, transactions, recurringTransactions, goals, currency } = useFinancial();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date();
    let start: Date;
    
    switch (timeRange) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '1y':
        start = subDays(end, 365);
        break;
      default:
        start = subDays(end, 30);
    }
    
    return { start, end };
  }, [timeRange]);

  // Helper function to calculate volatility
  const calculateVolatility = (values: number[]) => {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  };

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return isWithinInterval(transactionDate, dateRange);
    });

    const earnings = filteredTransactions.filter(t => t.category === 'Earnings');
    const expenses = filteredTransactions.filter(t => t.category !== 'Earnings');
    
    const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalEarnings - totalExpenses;
    
    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Daily trends
    const dailyTrends = eachDayOfInterval(dateRange).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = filteredTransactions.filter(t => t.date === dayStr);
      
      const dayEarnings = dayTransactions
        .filter(t => t.category === 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpenses = dayTransactions
        .filter(t => t.category !== 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        fullDate: dayStr,
        earnings: dayEarnings,
        expenses: dayExpenses,
        net: dayEarnings - dayExpenses,
        count: dayTransactions.length
      };
    });

    // Weekly patterns
    const weeklyPattern = filteredTransactions.reduce((acc, t) => {
      const dayOfWeek = format(parseISO(t.date), 'EEEE');
      if (!acc[dayOfWeek]) acc[dayOfWeek] = { count: 0, amount: 0 };
      acc[dayOfWeek].count += 1;
      acc[dayOfWeek].amount += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // Monthly comparison
    const monthlyData = eachMonthOfInterval({
      start: subMonths(dateRange.end, 11),
      end: dateRange.end
    }).map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });

      const monthEarnings = monthTransactions
        .filter(t => t.category === 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.category !== 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        earnings: monthEarnings,
        expenses: monthExpenses,
        net: monthEarnings - monthExpenses,
        transactions: monthTransactions.length
      };
    });

    // Spending velocity (rate of change)
    const spendingVelocity = dailyTrends.map((day, index) => {
      if (index === 0) return { ...day, velocity: 0 };
      
      const previousDay = dailyTrends[index - 1];
      const velocity = day.expenses - previousDay.expenses;
      
      return { ...day, velocity };
    });

    // Financial health metrics
    const avgDailyIncome = totalEarnings / dailyTrends.length;
    const avgDailyExpenses = totalExpenses / dailyTrends.length;
    const savingsRate = totalEarnings > 0 ? ((totalEarnings - totalExpenses) / totalEarnings) * 100 : 0;
    const expenseVolatility = calculateVolatility(dailyTrends.map(d => d.expenses));
    
    // Spending efficiency (expense per transaction)
    const avgExpensePerTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    
    // Category efficiency scores
    const categoryEfficiency = Object.entries(categoryBreakdown).map(([category, amount]) => {
      const categoryTransactions = expenses.filter(t => t.category === category);
      const avgAmount = amount / categoryTransactions.length;
      const frequency = categoryTransactions.length;
      
      return {
        category,
        amount,
        frequency,
        avgAmount,
        efficiency: frequency > 0 ? amount / frequency : 0
      };
    });

    return {
      totalTransactions: filteredTransactions.length,
      totalEarnings,
      totalExpenses,
      netAmount,
      categoryBreakdown,
      dailyTrends,
      weeklyPattern,
      monthlyData,
      spendingVelocity,
      avgDailyIncome,
      avgDailyExpenses,
      savingsRate,
      expenseVolatility,
      avgExpensePerTransaction,
      categoryEfficiency,
      timeRange: `${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'MMM dd')}`
    };
  }, [transactions, dateRange, timeRange]);

  // Chart data preparations
  const categoryChartData = Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
    name,
    value,
    color: name === 'Food' ? 'hsl(var(--chart-1))' : 
           name === 'Petrol' ? 'hsl(var(--chart-2))' : 
           name === 'Other' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))'
  }));

  const weeklyChartData = Object.entries(analytics.weeklyPattern).map(([day, data]) => ({
    day: day.substring(0, 3),
    transactions: data.count,
    amount: data.amount
  }));

  const efficiencyData = analytics.categoryEfficiency.map(cat => ({
    category: cat.category,
    efficiency: cat.efficiency,
    frequency: cat.frequency,
    amount: cat.amount
  }));

  // Render different chart types
  const renderTrendChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : 
                          chartType === 'area' ? AreaChart : BarChart;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={analytics.dailyTrends}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: any, name: string) => [`${currency}${Number(value).toFixed(2)}`, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          
          {chartType === 'line' ? (
            <>
              <Line type="monotone" dataKey="earnings" stroke="hsl(var(--success))" name="Earnings" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" name="Expenses" strokeWidth={2} />
              <Line type="monotone" dataKey="net" stroke="hsl(var(--primary))" name="Net" strokeWidth={2} />
            </>
          ) : chartType === 'area' ? (
            <>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="earnings" stroke="hsl(var(--success))" fill="url(#earningsGradient)" name="Earnings" />
              <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fill="url(#expensesGradient)" name="Expenses" />
            </>
          ) : (
            <>
              <Bar dataKey="earnings" fill="hsl(var(--success))" name="Earnings" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Deep insights for {analytics.timeRange} • {analytics.totalTransactions} transactions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-success text-success-foreground">
          <div className="text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <p className="text-lg font-bold">{currency}{analytics.totalEarnings.toFixed(0)}</p>
            <p className="text-xs opacity-90">Total Income</p>
          </div>
        </Card>
        
        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <div className="text-center">
            <TrendingDown className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <p className="text-lg font-bold text-destructive">{currency}{analytics.totalExpenses.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className={`text-lg font-bold ${analytics.netAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
              {analytics.netAmount >= 0 ? '+' : ''}{currency}{analytics.netAmount.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Net Amount</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Percent className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className={`text-lg font-bold ${analytics.savingsRate >= 0 ? 'text-success' : 'text-destructive'}`}>
              {analytics.savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Savings Rate</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-lg font-bold text-warning">{currency}{analytics.expenseVolatility.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Volatility</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold">{currency}{analytics.avgExpensePerTransaction.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg/Transaction</p>
          </div>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Main Trend Chart */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Financial Trends</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'area' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('area')}
                  >
                    <AreaChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {renderTrendChart()}
            </Card>

            {/* Category Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${currency}${value.toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Weekly Pattern */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="hsl(var(--primary))" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Comparison */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Monthly Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyData}>
                    <defs>
                      <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="net" stroke="hsl(var(--primary))" fill="url(#netGradient)" name="Net Amount" />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(var(--success))" name="Earnings" />
                    <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Spending Velocity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Spending Velocity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.spendingVelocity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="velocity" 
                      stroke="hsl(var(--warning))" 
                      name="Velocity" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Cumulative Net Worth */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cumulative Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyTrends.map((day, index) => ({
                    ...day,
                    cumulative: analytics.dailyTrends
                      .slice(0, index + 1)
                      .reduce((sum, d) => sum + d.net, 0)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent) / 0.2)" 
                      name="Cumulative Net" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Transaction Heatmap Simulation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }, (_, i) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        intensity > 0.7 ? 'bg-success' :
                        intensity > 0.4 ? 'bg-warning' :
                        intensity > 0.2 ? 'bg-primary/50' : 'bg-muted'
                      }`}
                      title={`Day ${i + 1}: ${Math.floor(intensity * 100)}% activity`}
                    />
                  );
                })}
              </div>
            </Card>

            {/* Spending Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Spending Distribution</h3>
              <div className="space-y-4">
                {Object.entries(analytics.categoryBreakdown).map(([category, amount]) => {
                  const percentage = (amount / analytics.totalExpenses) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{category}</span>
                        <span>{currency}{amount.toFixed(0)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-6">
            {/* Category Efficiency */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Efficiency Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="frequency" name="Frequency" />
                    <YAxis dataKey="amount" name="Total Amount" />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'amount' ? `${currency}${value.toFixed(2)}` : value,
                        name === 'amount' ? 'Total Amount' : 'Frequency'
                      ]}
                      labelFormatter={(value) => `Category: ${value}`}
                    />
                    <Scatter dataKey="amount" fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Financial Health Score */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`text-4xl font-bold ${
                      analytics.savingsRate > 20 ? 'text-success' :
                      analytics.savingsRate > 0 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {Math.max(0, Math.min(100, Math.round(analytics.savingsRate + 50))).toFixed(0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Health Score</p>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, analytics.savingsRate + 50))} 
                    className="h-2"
                  />
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{analytics.categoryEfficiency.length}</p>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">
                    {(analytics.totalTransactions / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Daily Transactions</p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;