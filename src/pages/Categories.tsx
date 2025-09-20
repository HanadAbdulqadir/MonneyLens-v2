import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Fuel, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Categories = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Calculate category data
  const categoryStats = [
    { 
      name: 'Earnings', 
      total: transactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0),
      count: transactions.filter(t => t.category === 'Earnings').length,
      icon: TrendingUp,
      color: '#10b981', // green
      type: 'income'
    },
    { 
      name: 'Petrol', 
      total: transactions.filter(t => t.category === 'Petrol').reduce((sum, t) => sum + t.amount, 0),
      count: transactions.filter(t => t.category === 'Petrol').length,
      icon: Fuel,
      color: '#f59e0b', // amber
      type: 'expense'
    },
    { 
      name: 'Food', 
      total: transactions.filter(t => t.category === 'Food').reduce((sum, t) => sum + t.amount, 0),
      count: transactions.filter(t => t.category === 'Food').length,
      icon: UtensilsCrossed,
      color: '#ef4444', // red
      type: 'expense'
    },
    { 
      name: 'Other', 
      total: transactions.filter(t => t.category === 'Other').reduce((sum, t) => sum + t.amount, 0),
      count: transactions.filter(t => t.category === 'Other').length,
      icon: ShoppingBag,
      color: '#8b5cf6', // purple
      type: 'expense'
    },
  ];

  const totalExpenses = categoryStats.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + cat.total, 0);
  const totalIncome = categoryStats.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + cat.total, 0);

  const chartData = categoryStats.filter(cat => cat.type === 'expense').map(cat => ({
    name: cat.name,
    value: cat.total,
    color: cat.color
  }));

  const getPercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage and analyze your spending categories</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={() => {
                    toast({ title: "Coming Soon", description: "Custom categories will be available in a future update" });
                    setNewCategoryName("");
                  }}
                >
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Total Income</p>
              <p className="text-2xl font-bold">£{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <TrendingDown className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">£{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">#</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">{categoryStats.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category List */}
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4">All Categories</h3>
          <div className="space-y-4">
            {categoryStats.map((category) => {
              const Icon = category.icon;
              const percentage = category.type === 'expense' 
                ? getPercentage(category.total, totalExpenses)
                : '100';
              
              return (
                <div key={category.name} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                          {category.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.count} transaction{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: category.color }}>
                      £{category.total.toFixed(2)}
                    </p>
                    {category.type === 'expense' && (
                      <p className="text-xs text-muted-foreground">{percentage}% of expenses</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Expense Breakdown Chart */}
        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Categories;