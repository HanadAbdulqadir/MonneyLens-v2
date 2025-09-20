import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState, useMemo, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  RefreshCw,
  Clock,
  Eye,
  Grid3X3,
  List,
  Filter,
  GripVertical
} from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import SmartTransactionEntry from "@/components/SmartTransactionEntry";
import { format, parseISO, addDays, subDays, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface EnhancedCalendarViewProps {
  view?: 'month' | 'week' | 'day';
  showRecurring?: boolean;
  enableDragDrop?: boolean;
}

interface DayData {
  date: string;
  transactions: any[];
  recurringTransactions: any[];
  earnings: number;
  expenses: number;
  netAmount: number;
  hasData: boolean;
}

interface DraggableTransaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'transaction' | 'recurring';
}

const EnhancedCalendarView = ({ 
  view = 'month', 
  showRecurring = true,
  enableDragDrop = true 
}: EnhancedCalendarViewProps) => {
  const { dailyData, transactions, recurringTransactions, updateTransaction } = useFinancial();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'list'>(view as any);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get calendar days based on view
  const calendarDays = useMemo(() => {
    if (calendarView === 'week') {
      const start = startOfWeek(currentDate);
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }
    
    // Month view
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate, calendarView]);

  // Get data for a specific date
  const getDataForDate = useCallback((date: Date | null): DayData | null => {
    if (!date) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = dailyData.find(d => d.date === dateStr);
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    // Filter by category if set
    const filteredTransactions = filterCategory
      ? dayTransactions.filter(t => t.category === filterCategory)
      : dayTransactions;
    
    // Check for recurring transactions that should appear on this date
    const recurringForDay = showRecurring ? recurringTransactions.filter(recurring => {
      if (!recurring.isActive) return false;
      
      const nextDate = new Date(recurring.nextDate);
      
      // Simplified recurring logic - in reality this would be more complex
      switch (recurring.frequency) {
        case 'daily':
          return true; // Show on every day
        case 'weekly':
          return date.getDay() === nextDate.getDay();
        case 'monthly':
          return date.getDate() === nextDate.getDate();
        case 'yearly':
          return date.getDate() === nextDate.getDate() && date.getMonth() === nextDate.getMonth();
        default:
          return false;
      }
    }) : [];
    
    const recurringEarnings = recurringForDay.filter(r => r.category === 'Earnings').reduce((sum, r) => sum + r.amount, 0);
    const recurringExpenses = recurringForDay.filter(r => r.category !== 'Earnings').reduce((sum, r) => sum + r.amount, 0);
    
    const earnings = filteredTransactions.filter(t => t.category === 'Earnings').reduce((sum, t) => sum + t.amount, 0) + recurringEarnings;
    const expenses = filteredTransactions.filter(t => t.category !== 'Earnings').reduce((sum, t) => sum + t.amount, 0) + recurringExpenses;
    
    return {
      date: dateStr,
      transactions: filteredTransactions,
      recurringTransactions: recurringForDay,
      earnings,
      expenses,
      netAmount: earnings - expenses,
      hasData: earnings > 0 || expenses > 0 || filteredTransactions.length > 0 || recurringForDay.length > 0
    };
  }, [dailyData, transactions, recurringTransactions, showRecurring, filterCategory]);

  // Navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (calendarView === 'week') {
        return direction === 'prev' ? subDays(newDate, 7) : addDays(newDate, 7);
      } else {
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
        return newDate;
      }
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return isSameDay(date, selectedDate);
  };

  // Drag and Drop for rescheduling
  const DraggableTransaction = ({ transaction, date }: { transaction: DraggableTransaction; date: string }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'transaction',
      item: { ...transaction, originalDate: date },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={enableDragDrop ? drag : undefined}
        className={`p-1 rounded text-xs cursor-move transition-opacity ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <Badge 
          variant="secondary" 
          className={`text-xs w-full justify-between ${
            transaction.type === 'recurring' ? 'border-dashed' : ''
          } ${
            transaction.category === 'Earnings' ? 'bg-success/10 text-success border-success/20' :
            transaction.category === 'Petrol' ? 'bg-warning/10 text-warning border-warning/20' :
            transaction.category === 'Food' ? 'bg-destructive/10 text-destructive border-destructive/20' :
            'bg-muted text-muted-foreground'
          }`}
        >
          {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(0)}
          {enableDragDrop && <GripVertical className="h-3 w-3 ml-1" />}
        </Badge>
      </div>
    );
  };

  const DroppableDay = ({ date, children }: { date: Date | null; children: React.ReactNode }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'transaction',
      drop: (item: DraggableTransaction & { originalDate: string }) => {
        if (date && item.originalDate !== format(date, 'yyyy-MM-dd')) {
          // Handle transaction move
          console.log('Move transaction', item, 'to', format(date, 'yyyy-MM-dd'));
          // This would require extending the FinancialContext to support transaction updates
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={enableDragDrop ? drop : undefined}
        className={`${isOver ? 'bg-primary/10 border-primary/30 border-dashed border-2' : ''}`}
      >
        {children}
      </div>
    );
  };

  // Hover preview component
  const TransactionPreview = ({ dayData }: { dayData: DayData }) => (
    <div className="space-y-3 min-w-64">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">{format(parseISO(dayData.date), 'EEEE, MMM dd')}</h4>
        <Badge variant={dayData.netAmount >= 0 ? "secondary" : "outline"}>
          {dayData.netAmount >= 0 ? '+' : ''}£{dayData.netAmount.toFixed(2)}
        </Badge>
      </div>
      
      {dayData.earnings > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-success">Income:</span>
          <span className="text-success font-medium">+£{dayData.earnings.toFixed(2)}</span>
        </div>
      )}
      
      {dayData.expenses > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-destructive">Expenses:</span>
          <span className="text-destructive font-medium">-£{dayData.expenses.toFixed(2)}</span>
        </div>
      )}

      {dayData.transactions.length > 0 && (
        <div className="border-t pt-2">
          <p className="text-xs font-medium mb-2">Transactions:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {dayData.transactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="truncate">{transaction.category}</span>
                <span className={transaction.category === 'Earnings' ? 'text-success' : 'text-destructive'}>
                  {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {dayData.transactions.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{dayData.transactions.length - 5} more...
              </p>
            )}
          </div>
        </div>
      )}

      {dayData.recurringTransactions.length > 0 && (
        <div className="border-t pt-2">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Recurring:
          </p>
          <div className="space-y-1">
            {dayData.recurringTransactions.map((recurring, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="truncate">{recurring.name}</span>
                <span className={recurring.category === 'Earnings' ? 'text-success' : 'text-destructive'}>
                  {recurring.category === 'Earnings' ? '+' : '-'}£{recurring.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendarGrid = () => (
    <div className="space-y-4">
      {/* Week day headers */}
      <div className={`grid gap-2 ${calendarView === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {calendarView === 'week' ? day : day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid gap-2 ${calendarView === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
        {calendarDays.map((date, index) => {
          const dayData = getDataForDate(date);
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSelected(date);
          
          return (
            <DroppableDay key={index} date={date}>
              <HoverCard openDelay={300} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div
                    className={`
                      min-h-24 p-2 rounded-lg border transition-all duration-200 cursor-pointer
                      ${date ? 'hover:bg-muted/50' : 'border-transparent'}
                      ${isCurrentDay ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : ''}
                      ${isSelectedDay ? 'border-accent bg-accent/5' : ''}
                      ${dayData?.hasData ? 'border-primary/30 bg-gradient-to-br from-background to-primary/5' : 'border-border'}
                      ${calendarView === 'week' ? 'min-h-32' : 'min-h-24'}
                    `}
                    onClick={() => date && setSelectedDate(date)}
                    onMouseEnter={() => date && setHoveredDay(format(date, 'yyyy-MM-dd'))}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary font-bold' : ''}`}>
                            {date.getDate()}
                          </span>
                          {dayData?.hasData && (
                            <div className="flex gap-1">
                              {dayData.earnings > 0 && (
                                <div className="w-2 h-2 rounded-full bg-success" />
                              )}
                              {dayData.expenses > 0 && (
                                <div className="w-2 h-2 rounded-full bg-destructive" />
                              )}
                              {dayData.recurringTransactions.length > 0 && (
                                <RefreshCw className="h-2 w-2 text-primary" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        {dayData && (
                          <div className="space-y-1">
                            {/* Net amount indicator */}
                            {(dayData.earnings > 0 || dayData.expenses > 0) && (
                              <div className="text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1 py-0 ${
                                    dayData.netAmount >= 0 
                                      ? 'border-success/30 text-success bg-success/10' 
                                      : 'border-destructive/30 text-destructive bg-destructive/10'
                                  }`}
                                >
                                  {dayData.netAmount >= 0 ? '+' : ''}£{Math.abs(dayData.netAmount).toFixed(0)}
                                </Badge>
                              </div>
                            )}

                            {/* Transaction indicators */}
                            <div className="space-y-1 max-h-16 overflow-y-auto">
                              {dayData.transactions.slice(0, 2).map((transaction, tIndex) => (
                                <DraggableTransaction
                                  key={tIndex}
                                  transaction={{
                                    id: `t-${tIndex}`,
                                    date: dayData.date,
                                    category: transaction.category,
                                    amount: transaction.amount,
                                    type: 'transaction'
                                  }}
                                  date={dayData.date}
                                />
                              ))}
                              
                              {showRecurring && dayData.recurringTransactions.slice(0, 1).map((recurring, rIndex) => (
                                <DraggableTransaction
                                  key={`r-${rIndex}`}
                                  transaction={{
                                    id: recurring.id,
                                    date: dayData.date,
                                    category: recurring.category,
                                    amount: recurring.amount,
                                    type: 'recurring'
                                  }}
                                  date={dayData.date}
                                />
                              ))}
                              
                              {(dayData.transactions.length + dayData.recurringTransactions.length) > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{(dayData.transactions.length + dayData.recurringTransactions.length) - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </HoverCardTrigger>
                
                {dayData && dayData.hasData && (
                  <HoverCardContent className="w-80">
                    <TransactionPreview dayData={dayData} />
                  </HoverCardContent>
                )}
              </HoverCard>
            </DroppableDay>
          );
        })}
      </div>
    </div>
  );

  const renderListView = () => {
    const daysWithData = calendarDays
      .filter(date => date && getDataForDate(date)?.hasData)
      .map(date => ({ date: date!, data: getDataForDate(date)! }));

    return (
      <div className="space-y-4">
        {daysWithData.map(({ date, data }) => (
          <Card key={format(date, 'yyyy-MM-dd')} className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{format(date, 'EEEE, MMMM dd, yyyy')}</h3>
              <Badge variant={data.netAmount >= 0 ? "secondary" : "destructive"}>
                Net: {data.netAmount >= 0 ? '+' : ''}£{data.netAmount.toFixed(2)}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Transactions</h4>
                {data.transactions.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm">{transaction.category}</span>
                    <span className={`font-medium ${transaction.category === 'Earnings' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {data.recurringTransactions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Recurring
                  </h4>
                  {data.recurringTransactions.map((recurring, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded border-dashed border">
                      <span className="text-sm">{recurring.name}</span>
                      <span className={`font-medium ${recurring.category === 'Earnings' ? 'text-success' : 'text-destructive'}`}>
                        {recurring.category === 'Earnings' ? '+' : '-'}£{recurring.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {daysWithData.length === 0 && (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Financial Activity</h3>
            <p className="text-sm text-muted-foreground">
              No transactions found for this period
            </p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 animate-fade-in">
        {/* Calendar Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Enhanced Calendar
            </h1>
            <p className="text-muted-foreground">
              Interactive financial calendar with drag-and-drop scheduling
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {[
                { view: 'month', icon: Grid3X3, label: 'Month' },
                { view: 'week', icon: CalendarIcon, label: 'Week' },
                { view: 'list', icon: List, label: 'List' }
              ].map(({ view, icon: Icon, label }) => (
                <Button
                  key={view}
                  variant={calendarView === view ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCalendarView(view as any)}
                  className="h-8 px-3"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filterCategory || 'All Categories'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button
                    variant={!filterCategory ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setFilterCategory(null)}
                  >
                    All Categories
                  </Button>
                  {['Earnings', 'Petrol', 'Food', 'Other'].map(category => (
                    <Button
                      key={category}
                      variant={filterCategory === category ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <SmartTransactionEntry 
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Smart
                </Button>
              }
            />
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {calendarView === 'week' 
                ? `Week of ${format(startOfWeek(currentDate), 'MMM dd, yyyy')}`
                : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateCalendar('prev')}
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
                onClick={() => navigateCalendar('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {calendarView === 'list' ? renderListView() : renderCalendarGrid()}
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h3>
            
            {(() => {
              const dayData = getDataForDate(selectedDate);
              return dayData?.hasData ? (
                <TransactionPreview dayData={dayData} />
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No financial activity on this date</p>
                  <SmartTransactionEntry 
                    trigger={
                      <Button className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Transaction for This Date
                      </Button>
                    }
                  />
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </DndProvider>
  );
};

export default EnhancedCalendarView;