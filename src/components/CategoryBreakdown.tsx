import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, UtensilsCrossed, ShoppingBag, TrendingUp, X } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CategoryBreakdown = () => {
  const { transactions, categoryFilter, setCategoryFilter } = useFinancial();
  
  const getCategoryTotals = () => {
    const totals = { Petrol: 0, Food: 0, Other: 0, Earnings: 0 };
    transactions.forEach(transaction => {
      if (transaction.category in totals) {
        totals[transaction.category as keyof typeof totals] += transaction.amount;
      }
    });
    return totals;
  };
  
  const totals = getCategoryTotals();
  
  const categories = [
    {
      name: "Earnings",
      amount: totals.Earnings,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      chartColor: "hsl(var(--success))",
      isEarnings: true
    },
    {
      name: "Petrol",
      amount: totals.Petrol,
      icon: Fuel,
      color: "text-warning",
      bg: "bg-warning/10",
      chartColor: "hsl(var(--warning))",
      isEarnings: false
    },
    {
      name: "Food",
      amount: totals.Food,
      icon: UtensilsCrossed,
      color: "text-destructive",
      bg: "bg-destructive/10",
      chartColor: "hsl(var(--destructive))",
      isEarnings: false
    },
    {
      name: "Other",
      amount: totals.Other,
      icon: ShoppingBag,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      chartColor: "hsl(var(--muted-foreground))",
      isEarnings: false
    },
  ];

  const chartData = categories
    .filter(cat => cat.amount > 0)
    .map(cat => ({
      name: cat.name,
      value: Math.abs(cat.amount),
      color: cat.chartColor,
      isEarnings: cat.isEarnings
    }));

  const handleCategoryClick = (categoryName: string) => {
    if (categoryFilter === categoryName) {
      setCategoryFilter(null);
    } else {
      setCategoryFilter(categoryName);
    }
  };

  const handleClearFilter = () => {
    setCategoryFilter(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.payload.isEarnings ? '+' : '-'}£{data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Category Breakdown</h3>
        {categoryFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilter}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filter
          </Button>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                className="cursor-pointer"
                onClick={(data) => handleCategoryClick(data.name)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={categoryFilter === entry.name ? "hsl(var(--primary))" : "transparent"}
                    strokeWidth={categoryFilter === entry.name ? 3 : 0}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isFiltered = categoryFilter === category.name;
          const isOtherFiltered = categoryFilter && categoryFilter !== category.name;
          
          return (
            <div 
              key={category.name} 
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                isFiltered ? 'bg-primary/10 border-2 border-primary/20' : ''
              } ${isOtherFiltered ? 'opacity-50' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.bg}`}>
                  <Icon className={`h-4 w-4 ${category.color}`} />
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <span className={`font-semibold ${category.isEarnings ? 'text-success' : 'text-foreground'}`}>
                {category.isEarnings ? '+' : '-'}£{category.amount.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CategoryBreakdown;