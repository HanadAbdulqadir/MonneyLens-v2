import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Plus,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { format, parseISO, addDays, subDays, isSameDay } from "date-fns";
import AddTransactionModal from "@/components/AddTransactionModal";
import QuickActionMenu from "@/components/QuickActionMenu";

interface CalendarDayViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
}

const CalendarDayView = ({ selectedDate, onDateChange, onBack }: CalendarDayViewProps) => {
  const { 
    dailyData, 
    transactions, 
    recurringTransactions, 
    updateTransaction, 
    deleteTransaction 
  } = useFinancial();
  
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayData = dailyData.find(d => d.date === dateStr);
  const dayTransactions = transactions.filter(t => t.date === dateStr);
  
  // Get recurring transactions for this day
  const recurringForDay = recurringTransactions.filter(recurring => {
    if (!recurring.isActive) return false;
    const nextDate = new Date(recurring.nextDate);
    
    switch (recurring.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return selectedDate.getDay() === nextDate.getDay();
      case 'monthly':
        return selectedDate.getDate() === nextDate.getDate();
      case 'yearly':
        return selectedDate.getDate() === nextDate.getDate() && 
               selectedDate.getMonth() === nextDate.getMonth();
      default:
        return false;
    }
  });

  // Filter transactions by time
  const filteredTransactions = dayTransactions.filter(transaction => {
    if (timeFilter === 'all') return true;
    
    // If transaction has time, filter by it (this would need to be added to the transaction model)
    // For now, we'll simulate time-based filtering
    const hour = new Date().getHours(); // Placeholder - in real app, would use transaction.time
    
    switch (timeFilter) {
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 18;
      case 'evening':
        return hour >= 18 || hour < 6;
      default:
        return true;
    }
  });

  const earnings = dayTransactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0);
  const expenses = dayTransactions.filter(t => t.category !== 'Earnings').reduce((sum, t) => sum + t.amount, 0);
  const recurringEarnings = recurringForDay.filter(r => r.category === 'Earnings').reduce((sum, r) => sum + r.amount, 0);
  const recurringExpenses = recurringForDay.filter(r => r.category !== 'Earnings').reduce((sum, r) => sum + r.amount, 0);
  
  const totalEarnings = earnings + recurringEarnings;
  const totalExpenses = expenses + recurringExpenses;
  const netAmount = totalEarnings - totalExpenses;

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    onDateChange(newDate);
  };

  const isToday = isSameDay(selectedDate, new Date());

  const handleEditTransaction = (transaction: any) => {
    // This would open an edit modal - for now we'll just log
    console.log('Edit transaction:', transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  const handleDuplicateTransaction = (transaction: any) => {
    // This would duplicate the transaction
    console.log('Duplicate transaction:', transaction);
  };

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'Earnings':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'Food':
        return <div className="h-4 w-4 rounded-full bg-orange-500" />;
      case 'Petrol':
        return <div className="h-4 w-4 rounded-full bg-blue-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Earnings':
        return 'border-success/30 bg-success/5 text-success';
      case 'Food':
        return 'border-orange-500/30 bg-orange-500/5 text-orange-600';
      case 'Petrol':
        return 'border-blue-500/30 bg-blue-500/5 text-blue-600';
      default:
        return 'border-muted bg-muted/5 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h1>
            <p className="text-muted-foreground">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')} • Day View
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDay('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDay('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <AddTransactionModal />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5" />
            <div>
              <p className="text-sm opacity-90">Earnings</p>
              <p className="text-lg font-bold">£{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-destructive">£{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <p className={`text-lg font-bold ${netAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
                {netAmount >= 0 ? '+' : ''}£{netAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold">{dayTransactions.length + recurringForDay.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by time:</span>
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All Day' },
            { key: 'morning', label: 'Morning' },
            { key: 'afternoon', label: 'Afternoon' },
            { key: 'evening', label: 'Evening' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={timeFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(key as any)}
              className="h-7 px-3 text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regular Transactions */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Transactions ({filteredTransactions.length})
            </h3>
          </div>
          <ScrollArea className="max-h-96">
            <div className="p-4 space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p>No transactions for this {timeFilter === 'all' ? 'day' : timeFilter}</p>
                  <AddTransactionModal />
                </div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-card-hover ${getCategoryColor(transaction.category)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.category)}
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {/* In a real app, would show transaction.time */}
                          {format(new Date(), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                      </Badge>
                      <QuickActionMenu
                        transaction={transaction}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                        onDuplicate={handleDuplicateTransaction}
                        size="sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Recurring Transactions */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Recurring ({recurringForDay.length})
            </h3>
          </div>
          <ScrollArea className="max-h-96">
            <div className="p-4 space-y-3">
              {recurringForDay.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <p>No recurring transactions</p>
                </div>
              ) : (
                recurringForDay.map((recurring, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border-dashed border transition-all duration-200 hover:shadow-card-hover ${getCategoryColor(recurring.category)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(recurring.category)}
                      <div>
                        <p className="font-medium">{recurring.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {recurring.frequency} • {recurring.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono border-dashed">
                        {recurring.category === 'Earnings' ? '+' : '-'}£{recurring.amount.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default CalendarDayView;