import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, UtensilsCrossed, ShoppingBag, TrendingUp, Trash2 } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";
import { useToast } from "@/hooks/use-toast";

const RecentTransactions = () => {
  const { transactions, deleteTransaction } = useFinancial();
  const { toast } = useToast();
  
  const getRecentTransactions = (limit = 8) => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };
  
  const recentTransactions = getRecentTransactions(8);
  
  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };
  
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
      case "Petrol": return "text-warning";
      case "Food": return "text-destructive";
      case "Other": return "text-muted-foreground";
      case "Earnings": return "text-success";
      default: return "text-muted-foreground";
    }
  };
  
  const getBgClass = (category: string) => {
    switch (category) {
      case "Petrol": return "bg-warning/10";
      case "Food": return "bg-destructive/10";
      case "Other": return "bg-muted/50";
      case "Earnings": return "bg-success/10";
      default: return "bg-muted/50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {recentTransactions.map((transaction, index) => {
          const Icon = getIcon(transaction.category);
          const isEarnings = transaction.category === "Earnings";
          
          return (
            <div key={index} className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getBgClass(transaction.category)}`}>
                  <Icon className={`h-4 w-4 ${getColorClass(transaction.category)}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.category}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${isEarnings ? 'text-success' : 'text-foreground'}`}>
                  {isEarnings ? '+' : '-'}£{transaction.amount.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(transaction.dailyEntryId.toString())}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentTransactions;