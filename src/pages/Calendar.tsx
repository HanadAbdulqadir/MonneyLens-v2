import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import EnhancedCalendarView from "@/components/EnhancedCalendarView";
import AddTransactionModal from "@/components/AddTransactionModal";

const Calendar = () => {
  const { dailyData, transactions, recurringTransactions } = useFinancial();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate monthly totals including recurring transactions
  const monthlyEarnings = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear() &&
             t.category === 'Earnings';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear() &&
             t.category !== 'Earnings';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Add estimated recurring transaction totals for the month
  const recurringEarnings = recurringTransactions
    .filter(r => r.isActive && r.category === 'Earnings')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'daily' ? 30.44 : r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  const recurringExpenses = recurringTransactions
    .filter(r => r.isActive && r.category !== 'Earnings')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'daily' ? 30.44 : r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  const totalMonthlyEarnings = monthlyEarnings + recurringEarnings;
  const totalMonthlyExpenses = monthlyExpenses + recurringExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Calendar</h1>
          <p className="text-muted-foreground">Interactive financial calendar with drag-and-drop</p>
        </div>
        <AddTransactionModal />
      </div>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Monthly Earnings</p>
              <p className="text-xl font-bold">£{totalMonthlyEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <TrendingDown className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-xl font-bold text-destructive">£{totalMonthlyExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Net Total</p>
              <p className={`text-xl font-bold ${(totalMonthlyEarnings - totalMonthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'}`}>
                £{(totalMonthlyEarnings - totalMonthlyExpenses).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <EnhancedCalendarView />
    </div>
  );
};

export default Calendar;