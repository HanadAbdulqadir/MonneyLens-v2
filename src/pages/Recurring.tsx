import { Card } from "@/components/ui/card";
import { useFinancial } from "@/contexts/FinancialContext";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Brain, BarChart3 } from "lucide-react";
import EnhancedRecurringManager from "@/components/EnhancedRecurringManager";
import UpcomingRecurringWidget from "@/components/UpcomingRecurringWidget";

const Recurring = () => {
  const { recurringTransactions, currency } = useFinancial();

  // Calculate enhanced metrics
  const activeRecurring = recurringTransactions.filter(r => r.isActive);
  const totalMonthlyIncome = activeRecurring
    .filter(r => r.category === 'Earnings')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'daily' ? 30.44 : r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  const totalMonthlyExpenses = activeRecurring
    .filter(r => r.category !== 'Earnings')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'daily' ? 30.44 : r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Automate and optimize your regular financial activities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Monthly Net</p>
            <p className={`text-lg font-bold ${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {currency}{(totalMonthlyIncome - totalMonthlyExpenses).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Transactions Widget */}
      <UpcomingRecurringWidget />

      {/* Enhanced Recurring Manager */}
      <EnhancedRecurringManager />
    </div>
  );
};

export default Recurring;