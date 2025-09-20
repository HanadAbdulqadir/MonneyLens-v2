import { Card } from "@/components/ui/card";
import { Fuel, UtensilsCrossed, ShoppingBag, TrendingUp } from "lucide-react";
import { getCategoryTotals } from "@/data/financialData";

const CategoryBreakdown = () => {
  const totals = getCategoryTotals();
  
  const categories = [
    {
      name: "Earnings",
      amount: totals.Earnings,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      isEarnings: true
    },
    {
      name: "Petrol",
      amount: totals.Petrol,
      icon: Fuel,
      color: "text-warning",
      bg: "bg-warning/10",
      isEarnings: false
    },
    {
      name: "Food",
      amount: totals.Food,
      icon: UtensilsCrossed,
      color: "text-destructive",
      bg: "bg-destructive/10",
      isEarnings: false
    },
    {
      name: "Other",
      amount: totals.Other,
      icon: ShoppingBag,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      isEarnings: false
    },
  ];

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.name} className="flex items-center justify-between">
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