import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";

const WeeklyChart = () => {
  const { dailyData, monthlyStartingPoint } = useFinancial();
  
  const chartData = dailyData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    fullDate: entry.date,
    balance: entry.balance,
    netChange: entry.netChange,
    earnings: entry.earnings,
    expenses: entry.expenses
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between">
              <span>Balance:</span>
              <span className="font-medium">£{data.balance.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Net Change:</span>
              <span className={`font-medium ${data.netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {data.netChange >= 0 ? '+' : ''}£{data.netChange.toFixed(2)}
              </span>
            </p>
            <div className="border-t border-border mt-2 pt-2">
              <p className="flex justify-between text-success">
                <span>Earnings:</span>
                <span>+£{data.earnings.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-destructive">
                <span>Expenses:</span>
                <span>-£{data.expenses.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Balance Trend</h3>
        <div className="text-xs text-muted-foreground">
          Click points for details
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={monthlyStartingPoint} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              label={{ value: "Starting Point", position: "left" }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(var(--primary))', 
                r: 4,
                className: 'cursor-pointer hover:r-6 transition-all'
              }}
              activeDot={{ 
                r: 8, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;