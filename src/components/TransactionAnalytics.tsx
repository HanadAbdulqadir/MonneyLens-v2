import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Eye
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isWithinInterval } from "date-fns";

interface TransactionAnalyticsProps {
  filteredTransactions: any[];
  timeRange: string;
}

type ViewType = 'overview' | 'trends' | 'breakdown' | 'calendar';

const TransactionAnalytics = ({ filteredTransactions, timeRange }: TransactionAnalyticsProps) => {
  const { transactions } = useFinancial();
  const [viewType, setViewType] = useState<ViewType>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  const analytics = useMemo(() => {
    if (!filteredTransactions.length) return null;

    // Basic stats
    const totalTransactions = filteredTransactions.length;
    const earnings = filteredTransactions.filter(t => t.category === 'Earnings');
    const expenses = filteredTransactions.filter(t => t.category !== 'Earnings');
    
    const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalEarnings - totalExpenses;
    
    const avgTransactionAmount = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions;
    const avgDailySpending = totalExpenses / 30; // assuming 30-day period
    
    // Category breakdown
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
    
    // Daily trends
    const dailyTrends = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    }).map(day => {
      const dayTransactions = filteredTransactions.filter(t => 
        format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const dayEarnings = dayTransactions
        .filter(t => t.category === 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpenses = dayTransactions
        .filter(t => t.category !== 'Earnings')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
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

    return {
      totalTransactions,
      totalEarnings,
      totalExpenses,
      netAmount,
      avgTransactionAmount,
      avgDailySpending,
      categoryTotals,
      dailyTrends,
      weeklyPattern,
      savingsRate: totalEarnings > 0 ? ((totalEarnings - totalExpenses) / totalEarnings) * 100 : 0
    };
  }, [filteredTransactions]);

  if (!analytics) return null;

  const categoryData = Object.entries(analytics.categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: name === 'Earnings' ? 'hsl(var(--success))' :
           name === 'Petrol' ? 'hsl(var(--warning))' :
           name === 'Food' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
  }));

  const weeklyData = Object.entries(analytics.weeklyPattern).map(([day, data]: [string, { count: number; amount: number }]) => ({
    day: day.substring(0, 3),
    count: data.count,
    amount: data.amount
  }));

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{analytics.totalTransactions}</p>
          <p className="text-xs text-muted-foreground">Total Transactions</p>
        </div>
        
        <div className="text-center p-4 bg-success/5 rounded-lg">
          <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-success">£{analytics.totalEarnings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Income</p>
        </div>
        
        <div className="text-center p-4 bg-destructive/5 rounded-lg">
          <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold text-destructive">£{analytics.totalExpenses.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Expenses</p>
        </div>
        
        <div className="text-center p-4 bg-accent/5 rounded-lg">
          <Target className="h-8 w-8 text-accent mx-auto mb-2" />
          <p className={`text-2xl font-bold ${analytics.netAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
            {analytics.netAmount >= 0 ? '+' : ''}£{analytics.netAmount.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">Net Amount</p>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border border-primary/20">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Savings Rate</span>
          <Badge variant={analytics.savingsRate > 20 ? "default" : analytics.savingsRate > 0 ? "secondary" : "destructive"}>
            {analytics.savingsRate.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={Math.max(0, analytics.savingsRate)} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {analytics.savingsRate > 20 ? 'Excellent savings rate!' : 
           analytics.savingsRate > 0 ? 'Good progress, try to save more' : 
           'Consider reducing expenses'}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Spending by Category</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.filter(c => c.name !== 'Earnings')}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`£${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Weekly Activity Pattern</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="h-80">
        <h4 className="font-semibold mb-3">30-Day Financial Trend</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.dailyTrends}>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="earnings" stroke="hsl(var(--success))" fill="url(#earningsGradient)" name="Earnings" />
            <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fill="url(#expensesGradient)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Transaction Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Insights from {analytics.totalTransactions} transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Type Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { type: 'overview' as ViewType, icon: BarChart3, label: 'Overview' },
              { type: 'trends' as ViewType, icon: LineChartIcon, label: 'Trends' },
            ].map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={viewType === type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewType(type)}
                className="h-8 px-3"
              >
                <Icon className="h-4 w-4 mr-1" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewType === 'overview' && renderOverview()}
      {viewType === 'trends' && renderTrends()}
    </Card>
  );
};

export default TransactionAnalytics;