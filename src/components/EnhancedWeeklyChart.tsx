import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ComposedChart,
  Legend
} from 'recharts';
import { useFinancial } from "@/contexts/FinancialContext";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Maximize2,
  Download,
  Zap
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";

type ChartType = 'line' | 'area' | 'bar' | 'composed';
type TimeRange = '7d' | '30d' | '90d' | '1y';

const EnhancedWeeklyChart = () => {
  const { dailyData, monthlyStartingPoint, transactions } = useFinancial();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showPrediction, setShowPrediction] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = subDays(new Date(), days);
    
    return dailyData
      .filter(entry => parseISO(entry.date) >= cutoffDate)
      .map(entry => ({
        date: format(parseISO(entry.date), timeRange === '7d' ? 'MMM dd' : 'MMM dd'),
        fullDate: entry.date,
        balance: entry.balance,
        netChange: entry.netChange,
        earnings: entry.earnings,
        expenses: entry.petrol + entry.food + entry.other,
        petrol: entry.petrol,
        food: entry.food,
        other: entry.other,
        // Moving averages
        balanceMA: entry.balance, // Could calculate 7-day moving average
        trend: entry.netChange > 0 ? 'positive' : entry.netChange < 0 ? 'negative' : 'neutral'
      }));
  }, [dailyData, timeRange]);

  const chartStats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const totalEarnings = filteredData.reduce((sum, d) => sum + d.earnings, 0);
    const totalExpenses = filteredData.reduce((sum, d) => sum + d.expenses, 0);
    const netChange = totalEarnings - totalExpenses;
    const avgDailyBalance = filteredData.reduce((sum, d) => sum + d.balance, 0) / filteredData.length;
    const trend = filteredData.length > 1 
      ? filteredData[filteredData.length - 1].balance - filteredData[0].balance 
      : 0;
    
    return {
      totalEarnings,
      totalExpenses,
      netChange,
      avgDailyBalance,
      trend,
      volatility: Math.abs(trend) / filteredData.length
    };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-48">
          <p className="font-semibold text-sm mb-3">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-bold text-primary">£{data.balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Net Change:</span>
              <span className={`font-semibold ${data.netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {data.netChange >= 0 ? '+' : ''}£{data.netChange.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-success">Earnings:</span>
                <span className="font-medium">+£{data.earnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-destructive">Expenses:</span>
                <span className="font-medium">-£{data.expenses.toFixed(2)}</span>
              </div>
              {chartType === 'composed' && (
                <>
                  <div className="flex justify-between text-xs text-warning">
                    <span>Petrol:</span>
                    <span>£{data.petrol.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-destructive">
                    <span>Food:</span>
                    <span>£{data.food.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Other:</span>
                    <span>£{data.other.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
            <ReferenceLine 
              y={monthlyStartingPoint} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              label={{ value: "Starting Point", position: "insideTopRight" }}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="netChange" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="balance" className="text-xs" tick={{ fontSize: 11 }} domain={['dataMin - 50', 'dataMax + 50']} />
            <YAxis yAxisId="amounts" orientation="right" className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line 
              yAxisId="balance"
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Balance"
            />
            
            <Bar yAxisId="amounts" dataKey="earnings" fill="hsl(var(--success))" name="Earnings" />
            <Bar yAxisId="amounts" dataKey="petrol" fill="hsl(var(--warning))" name="Petrol" />
            <Bar yAxisId="amounts" dataKey="food" fill="hsl(var(--destructive))" name="Food" />
            <Bar yAxisId="amounts" dataKey="other" fill="hsl(var(--muted-foreground))" name="Other" />
            
            <ReferenceLine 
              yAxisId="balance"
              y={monthlyStartingPoint} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
            />
          </ComposedChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
            />
            <ReferenceLine 
              y={monthlyStartingPoint} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              label={{ value: "Starting Point", position: "left" }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={`p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : 'hover:scale-[1.01]'}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Enhanced Balance Analytics</h3>
          <p className="text-sm text-muted-foreground">Interactive financial trends and insights</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { type: 'line' as ChartType, icon: LineChartIcon, label: 'Line' },
              { type: 'area' as ChartType, icon: AreaChartIcon, label: 'Area' },
              { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
              { type: 'composed' as ChartType, icon: BarChart3, label: 'Mixed' },
            ].map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={chartType === type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType(type)}
                className="h-8 px-2"
              >
                <Icon className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline text-xs">{label}</span>
              </Button>
            ))}
          </div>

          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">3 months</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrediction(!showPrediction)}
              className={showPrediction ? 'bg-primary/10 border-primary' : ''}
            >
              <Zap className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {chartStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-success/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
            <p className="font-bold text-success">+£{chartStats.totalEarnings.toFixed(0)}</p>
          </div>
          <div className="text-center p-3 bg-destructive/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="font-bold text-destructive">-£{chartStats.totalExpenses.toFixed(0)}</p>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Net Change</p>
            <p className={`font-bold ${chartStats.netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {chartStats.netChange >= 0 ? '+' : ''}£{chartStats.netChange.toFixed(0)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {chartStats.trend >= 0 ? 
                <TrendingUp className="h-3 w-3 text-success" /> : 
                <TrendingDown className="h-3 w-3 text-destructive" />
              }
              <p className="text-xs text-muted-foreground">Trend</p>
            </div>
            <p className={`font-bold ${chartStats.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {chartStats.trend >= 0 ? '+' : ''}£{chartStats.trend.toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={isFullscreen ? "h-96" : "h-64"}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      {showPrediction && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">AI Insights</span>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            {chartStats?.trend && chartStats.trend > 0 && (
              <p>📈 Your balance is trending upward by £{chartStats.trend.toFixed(0)} over this period.</p>
            )}
            {chartStats?.trend && chartStats.trend < 0 && (
              <p>📉 Your balance is trending downward by £{Math.abs(chartStats.trend).toFixed(0)}. Consider reviewing expenses.</p>
            )}
            {chartStats?.volatility && chartStats.volatility < 5 && (
              <p>✅ Your spending patterns are stable with low volatility.</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedWeeklyChart;