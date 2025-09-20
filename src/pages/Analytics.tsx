import { Card } from "@/components/ui/card";
import { useFinancial } from "@/contexts/FinancialContext";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

const Analytics = () => {
  const { dailyData, transactions } = useFinancial();

  // Category breakdown for pie chart
  const categoryData = [
    { name: 'Petrol', value: transactions.filter(t => t.category === 'Petrol').reduce((sum, t) => sum + t.amount, 0), color: '#f59e0b' },
    { name: 'Food', value: transactions.filter(t => t.category === 'Food').reduce((sum, t) => sum + t.amount, 0), color: '#ef4444' },
    { name: 'Other', value: transactions.filter(t => t.category === 'Other').reduce((sum, t) => sum + t.amount, 0), color: '#8b5cf6' },
  ];

  // Weekly spending trend
  const weeklyData = [
    { name: 'Week 1', expenses: 140, earnings: 1260, net: 1120 },
    { name: 'Week 2', expenses: 210, earnings: 1260, net: 1050 },
    { name: 'Week 3', expenses: 180, earnings: 1260, net: 1080 },
    { name: 'Week 4', expenses: 1285, earnings: 1980, net: 695 },
  ];

  const totalEarnings = transactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category !== 'Earnings').reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpend = totalExpenses / dailyData.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights into your spending patterns</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-success">£{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">£{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold">${(totalEarnings - totalExpenses).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Daily Spend</p>
              <p className="text-2xl font-bold">£{avgDailySpend.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Breakdown */}
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Trends */}
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4">Weekly Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${Number(value).toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="earnings" fill="hsl(var(--success))" name="Earnings" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                <Bar dataKey="net" fill="hsl(var(--primary))" name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;