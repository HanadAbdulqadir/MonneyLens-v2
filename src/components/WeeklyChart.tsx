import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinancial } from "@/contexts/FinancialContext";

const WeeklyChart = () => {
  const { dailyData } = useFinancial();
  
  const chartData = dailyData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    balance: entry.balance,
    netChange: entry.netChange
  }));

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]">
      <h3 className="text-lg font-semibold mb-4">Balance Trend</h3>
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
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value, name) => [
                `£${Number(value).toFixed(2)}`, 
                name === 'balance' ? 'Balance' : 'Net Change'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;