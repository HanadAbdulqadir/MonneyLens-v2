import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Search, Filter, Trash2, Fuel, UtensilsCrossed, ShoppingBag, TrendingUp } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
  const { transactions, deleteTransaction } = useFinancial();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const getIcon = (category: string) => {
    switch (category) {
      case "Petrol": return Fuel;
      case "Food": return UtensilsCrossed;
      case "Other": return ShoppingBag;
      case "Earnings": return TrendingUp;
      default: return ShoppingBag;
    }
  };

  const getColorClass = (category: string) => {
    switch (category) {
      case "Petrol": return "text-warning bg-warning/10";
      case "Food": return "text-destructive bg-destructive/10";
      case "Other": return "text-muted-foreground bg-muted/50";
      case "Earnings": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted/50";
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      const matchesDate = dateFilter === "all" || transaction.week === dateFilter;
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>
        <AddTransactionModal />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Earnings">Earnings</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                <SelectItem value="W1">Week 1</SelectItem>
                <SelectItem value="W2">Week 2</SelectItem>
                <SelectItem value="W3">Week 3</SelectItem>
                <SelectItem value="W4">Week 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              All Transactions ({filteredTransactions.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const Icon = getIcon(transaction.category);
              const isEarnings = transaction.category === "Earnings";
              
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getColorClass(transaction.category)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{transaction.category}</p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.week}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${isEarnings ? 'text-success' : 'text-foreground'}`}>
                      {isEarnings ? '+' : '-'}£{transaction.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(transaction.dailyEntryId.toString())}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Transactions;