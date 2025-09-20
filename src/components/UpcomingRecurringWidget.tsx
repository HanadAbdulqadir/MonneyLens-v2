import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useMemo } from "react";
import { Calendar, Clock, TrendingUp, TrendingDown, Play, AlertTriangle } from "lucide-react";
import { format, parseISO, differenceInDays, addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from "date-fns";

interface UpcomingTransaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  nextDate: string;
  frequency: string;
  daysUntil: number;
  isOverdue: boolean;
  isEarning: boolean;
}

const UpcomingRecurringWidget = () => {
  const { recurringTransactions, addTransaction, updateRecurringTransaction, currency } = useFinancial();

  const upcomingTransactions = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    const upcoming: UpcomingTransaction[] = [];

    recurringTransactions
      .filter(rt => rt.isActive)
      .forEach(recurring => {
        const nextDate = parseISO(recurring.nextDate);
        let currentDate = new Date(nextDate);
        
        // Generate upcoming occurrences for the next 30 days
        while (isBefore(currentDate, thirtyDaysFromNow)) {
          if (!isBefore(currentDate, today) || isBefore(currentDate, today)) {
            const daysUntil = differenceInDays(currentDate, today);
            
            upcoming.push({
              id: `${recurring.id}-${currentDate.toISOString()}`,
              name: recurring.name,
              category: recurring.category,
              amount: recurring.amount,
              nextDate: currentDate.toISOString().split('T')[0],
              frequency: recurring.frequency,
              daysUntil,
              isOverdue: daysUntil < 0,
              isEarning: recurring.category === 'Earnings'
            });
          }
          
          // Calculate next occurrence
          switch (recurring.frequency) {
            case 'daily':
              currentDate = addDays(currentDate, 1);
              break;
            case 'weekly':
              currentDate = addWeeks(currentDate, 1);
              break;
            case 'monthly':
              currentDate = addMonths(currentDate, 1);
              break;
            case 'yearly':
              currentDate = addYears(currentDate, 1);
              break;
            default:
              // Exit loop for unknown frequency
              currentDate = thirtyDaysFromNow;
          }
        }
      });

    return upcoming
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 10); // Show only next 10 upcoming
  }, [recurringTransactions]);

  const handleExecuteTransaction = (upcoming: UpcomingTransaction) => {
    // Find the original recurring transaction
    const original = recurringTransactions.find(rt => upcoming.id.startsWith(rt.id));
    if (!original) return;

    // Add the transaction
    addTransaction({
      date: upcoming.nextDate,
      category: upcoming.category,
      amount: upcoming.amount,
      week: 'W1' // Default week
    });

    // Update next date for the recurring transaction
    const currentDate = parseISO(upcoming.nextDate);
    let nextDate: Date;
    
    switch (original.frequency) {
      case 'daily':
        nextDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(currentDate, 1);
        break;
      default:
        nextDate = addDays(currentDate, 1);
    }

    updateRecurringTransaction(original.id, {
      nextDate: nextDate.toISOString().split('T')[0]
    });
  };

  const getDayLabel = (daysUntil: number) => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    return `In ${Math.ceil(daysUntil / 7)} weeks`;
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (daysUntil === 0) return 'bg-warning/10 text-warning border-warning/20';
    if (daysUntil <= 3) return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-muted/50 text-muted-foreground border-muted/20';
  };

  const overdueTransactions = upcomingTransactions.filter(ut => ut.isOverdue);
  const todayTransactions = upcomingTransactions.filter(ut => ut.daysUntil === 0);
  const soonTransactions = upcomingTransactions.filter(ut => ut.daysUntil > 0 && ut.daysUntil <= 7);

  if (upcomingTransactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upcoming Recurring</h3>
        </div>
        <p className="text-sm text-muted-foreground">No upcoming recurring transactions in the next 30 days.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upcoming Recurring</h3>
        </div>
        <Badge variant="secondary">{upcomingTransactions.length} upcoming</Badge>
      </div>

      {/* Alert for overdue transactions */}
      {overdueTransactions.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {overdueTransactions.length} overdue transaction{overdueTransactions.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-destructive">{overdueTransactions.length}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{todayTransactions.length}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{soonTransactions.length}</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </div>
      </div>

      {/* Upcoming transactions list */}
      <div className="space-y-3">
        {upcomingTransactions.map((upcoming) => (
          <div
            key={upcoming.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-1.5 rounded-full ${upcoming.isEarning ? 'bg-success/20' : 'bg-destructive/20'}`}>
                {upcoming.isEarning ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{upcoming.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{upcoming.category}</Badge>
                  <Badge variant="outline" className="text-xs">{upcoming.frequency}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-semibold ${upcoming.isEarning ? 'text-success' : 'text-destructive'}`}>
                  {upcoming.isEarning ? '+' : '-'}{currency}{upcoming.amount.toFixed(2)}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getUrgencyColor(upcoming.daysUntil)}`}
                >
                  {getDayLabel(upcoming.daysUntil)}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExecuteTransaction(upcoming)}
                className="gap-1"
              >
                <Play className="h-3 w-3" />
                Execute
              </Button>
            </div>
          </div>
        ))}
      </div>

      {upcomingTransactions.length === 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">Showing next 10 upcoming transactions</p>
        </div>
      )}
    </Card>
  );
};

export default UpcomingRecurringWidget;