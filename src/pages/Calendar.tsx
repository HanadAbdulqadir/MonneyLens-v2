import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, Plus } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";

const Calendar = () => {
  const { dailyData, transactions, recurringTransactions } = useFinancial();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getDataForDate = (day: number | null) => {
    if (!day) return null;
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dailyData.find(d => d.date === dateStr);
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    // Check for recurring transactions that should appear on this date
    const targetDate = new Date(dateStr);
    const recurringForDay = recurringTransactions.filter(recurring => {
      if (!recurring.isActive) return false;
      
      const nextDate = new Date(recurring.nextDate);
      const recurringDate = new Date(recurring.nextDate);
      
      // Check if this recurring transaction should appear on this day
      switch (recurring.frequency) {
        case 'daily':
          // For daily, check if this date is on or after the next due date
          return targetDate >= recurringDate;
        case 'weekly':
          // For weekly, check if it's the same day of week and on/after start date
          return targetDate.getDay() === recurringDate.getDay() && targetDate >= recurringDate;
        case 'monthly':
          // For monthly, check if it's the same day of month and on/after start date
          return targetDate.getDate() === recurringDate.getDate() && targetDate >= recurringDate;
        case 'yearly':
          // For yearly, check if it's the same day and month and on/after start date
          return targetDate.getDate() === recurringDate.getDate() && 
                 targetDate.getMonth() === recurringDate.getMonth() && 
                 targetDate >= recurringDate;
        default:
          return false;
      }
    });
    
    const recurringEarnings = recurringForDay.filter(r => r.category === 'Earnings').reduce((sum, r) => sum + r.amount, 0);
    const recurringExpenses = recurringForDay.filter(r => r.category !== 'Earnings').reduce((sum, r) => sum + r.amount, 0);
    
    return {
      date: dateStr,
      data: dayData,
      transactions: dayTransactions,
      recurringTransactions: recurringForDay,
      earnings: dayTransactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0) + recurringEarnings,
      expenses: dayTransactions.filter(t => t.category !== 'Earnings').reduce((sum, t) => sum + t.amount, 0) + recurringExpenses
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Track your daily financial activity</p>
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

      {/* Calendar Grid */}
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayInfo = getDataForDate(day);
            const hasData = dayInfo && (dayInfo.earnings > 0 || dayInfo.expenses > 0);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 rounded-lg border transition-all duration-200
                  ${day ? 'hover:bg-muted/50 cursor-pointer' : 'border-transparent'}
                  ${isCurrentDay ? 'border-primary bg-primary/5' : ''}
                  ${hasData ? 'border-primary/30' : ''}
                `}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                        {day}
                      </span>
                      {hasData && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    {dayInfo && (
                      <div className="space-y-1">
                        {dayInfo.earnings > 0 && (
                          <div className="text-xs">
                            <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                              +£{dayInfo.earnings}
                            </Badge>
                          </div>
                        )}
                        {dayInfo.expenses > 0 && (
                          <div className="text-xs">
                            <Badge variant="secondary" className="text-destructive bg-destructive/10 border-destructive/20">
                              -£{dayInfo.expenses}
                            </Badge>
                          </div>
                        )}
                        {(dayInfo.transactions.length > 0 || dayInfo.recurringTransactions?.length > 0) && (
                          <p className="text-xs text-muted-foreground">
                            {dayInfo.transactions.length + (dayInfo.recurringTransactions?.length || 0)} transaction{(dayInfo.transactions.length + (dayInfo.recurringTransactions?.length || 0)) !== 1 ? 's' : ''}
                            {dayInfo.recurringTransactions?.length > 0 && (
                              <span className="text-primary"> ({dayInfo.recurringTransactions.length} recurring)</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Calendar;