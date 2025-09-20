import React, { useState, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  GripVertical,
  Brain,
  Maximize2,
  BarChart3,
  Target
} from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import SmartTransactionEntry from "@/components/SmartTransactionEntry";
import QuickActionMenu from "@/components/QuickActionMenu";
import CalendarDayView from "@/components/CalendarDayView";
import TransactionPredictions from "@/components/TransactionPredictions";
import { format, parseISO, addDays, subDays, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
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
  const { 
    dailyData, 
    transactions, 
    recurringTransactions, 
    updateTransaction, 
    deleteTransaction 
  } = useFinancial();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'list' | 'agenda'>(view as any);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [draggedTransaction, setDraggedTransaction] = useState<DraggableTransaction | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Optimized calendar days calculation
  const calendarDays = useMemo(() => {
    if (calendarView === 'week') {
      const start = startOfWeek(currentDate);
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }
    
    // Month view - optimized calculation
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

  // Optimized data retrieval with memoization
  const getDataForDate = useCallback((date: Date | null): DayData | null => {
    if (!date) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = dailyData.find(d => d.date === dateStr);
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    // Filter by category if set
    const filteredTransactions = filterCategory
      ? dayTransactions.filter(t => t.category === filterCategory)
      : dayTransactions;
    
    // Optimized recurring transactions calculation
    const recurringForDay = showRecurring ? recurringTransactions.filter(recurring => {
      if (!recurring.isActive) return false;
      
      const nextDate = new Date(recurring.nextDate);
      
      switch (recurring.frequency) {
        case 'daily':
          return true;
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

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return isSameDay(date, selectedDate);
  };

  // Enhanced drag and drop functionality
  const DraggableTransaction = ({ transaction, date }: { transaction: DraggableTransaction; date: string }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'transaction',
      item: { ...transaction, originalDate: date },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const handleEdit = () => {
      console.log('Edit transaction:', transaction);
    };

    const handleDelete = () => {
      if (transaction.type === 'transaction') {
        deleteTransaction(transaction.id);
      }
    };

    const handleDuplicate = () => {
      console.log('Duplicate transaction:', transaction);
    };

    return (
      <div
        ref={enableDragDrop ? drag : undefined}
        className={`group relative p-1 rounded text-xs cursor-move transition-all duration-200 ${
          isDragging ? 'drag-preview' : 'transaction-item'
        }`}
      >
        <Badge 
          variant="secondary" 
          className={`text-xs w-full justify-between ${
            transaction.type === 'recurring' ? 'border-dashed' : ''
          } ${
            transaction.category === 'Earnings' ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' :
            transaction.category === 'Petrol' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20' :
            transaction.category === 'Food' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20' :
            'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          <span className="flex items-center gap-1">
            {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(0)}
            {enableDragDrop && <GripVertical className="h-3 w-3 opacity-50" />}
          </span>
          
          {transaction.type === 'transaction' && (
            <QuickActionMenu
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              size="sm"
            />
          )}
        </Badge>
      </div>
    );
  };

  const DroppableDay = ({ date, children }: { date: Date | null; children: React.ReactNode }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'transaction',
      drop: (item: DraggableTransaction & { originalDate: string }) => {
        if (date && item.originalDate !== format(date, 'yyyy-MM-dd')) {
          const newDate = format(date, 'yyyy-MM-dd');
          updateTransaction(item.id, { date: newDate });
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    return (
      <div
        ref={enableDragDrop ? drop : undefined}
        className={`${isOver && canDrop ? 'drop-zone-active' : ''}`}
      >
        {children}
      </div>
    );
  };

  // Enhanced hover preview component
  const TransactionPreview = ({ dayData }: { dayData: DayData }) => (
    <div className="space-y-3 min-w-80">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">{format(parseISO(dayData.date), 'EEEE, MMM dd')}</h4>
        <Badge variant={dayData.netAmount >= 0 ? "default" : "destructive"} className="font-mono">
          {dayData.netAmount >= 0 ? '+' : ''}£{dayData.netAmount.toFixed(2)}
        </Badge>
      </div>
      
      {dayData.earnings > 0 && (
        <div className="flex justify-between text-sm p-2 rounded-md bg-success/10">
          <span className="text-success font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Income:
          </span>
          <span className="text-success font-bold">+£{dayData.earnings.toFixed(2)}</span>
        </div>
      )}
      
      {dayData.expenses > 0 && (
        <div className="flex justify-between text-sm p-2 rounded-md bg-destructive/10">
          <span className="text-destructive font-medium flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Expenses:
          </span>
          <span className="text-destructive font-bold">-£{dayData.expenses.toFixed(2)}</span>
        </div>
      )}

      {dayData.transactions.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Transactions ({dayData.transactions.length}):
          </p>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {dayData.transactions.map((transaction, index) => (
                <div key={index} className="flex justify-between text-xs p-1 rounded hover:bg-muted/50">
                  <span className="truncate font-medium">{transaction.category}</span>
                  <span className={`font-mono ${transaction.category === 'Earnings' ? 'text-success' : 'text-destructive'}`}>
                    {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {dayData.recurringTransactions.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Recurring ({dayData.recurringTransactions.length}):
          </p>
          <div className="space-y-1">
            {dayData.recurringTransactions.map((recurring, index) => (
              <div key={index} className="flex justify-between text-xs p-1 rounded border-dashed border hover:bg-muted/50">
                <span className="truncate font-medium">{recurring.name}</span>
                <span className={`font-mono ${recurring.category === 'Earnings' ? 'text-success' : 'text-destructive'}`}>
                  {recurring.category === 'Earnings' ? '+' : '-'}£{recurring.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        className="w-full mt-3"
        onClick={() => setSelectedDate(parseISO(dayData.date))}
      >
        <Maximize2 className="h-3 w-3 mr-1" />
        View Day Details
      </Button>
    </div>
  );

  // Enhanced calendar grid rendering
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

      {/* Enhanced calendar grid */}
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
                      calendar-grid-day min-h-28 p-3 rounded-xl border
                      ${date ? 'calendar-day-hover' : 'border-transparent'}
                      ${isCurrentDay ? 'border-primary bg-gradient-primary text-primary-foreground shadow-glow ring-2 ring-primary/20' : ''}
                      ${isSelectedDay ? 'border-accent bg-gradient-accent text-accent-foreground shadow-elevated' : ''}
                      ${dayData?.hasData ? 'border-primary/30 bg-gradient-calendar shadow-calendar-day' : 'border-border hover:border-primary/20'}
                      ${calendarView === 'week' ? 'min-h-36' : 'min-h-28'}
                      ${draggedTransaction ? 'hover:border-primary hover:bg-primary/5' : ''}
                    `}
                    onClick={() => date && setSelectedDate(date)}
                    onMouseEnter={() => date && setHoveredDay(format(date, 'yyyy-MM-dd'))}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-semibold ${isCurrentDay ? 'text-primary-foreground' : isSelectedDay ? 'text-accent-foreground' : ''}`}>
                            {date.getDate()}
                          </span>
                          {dayData?.hasData && (
                            <div className="flex gap-1">
                              {dayData.earnings > 0 && (
                                <div className="w-2.5 h-2.5 rounded-full bg-success shadow-sm" />
                              )}
                              {dayData.expenses > 0 && (
                                <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-sm" />
                              )}
                              {dayData.recurringTransactions.length > 0 && (
                                <RefreshCw className="h-2.5 w-2.5 text-primary" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        {dayData && (
                          <div className="space-y-1.5">
                            {/* Enhanced net amount indicator */}
                            {(dayData.earnings > 0 || dayData.expenses > 0) && (
                              <div className="text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-0.5 font-mono transition-all duration-200 ${
                                    dayData.netAmount >= 0 
                                      ? 'border-success/40 text-success bg-success/10 hover:bg-success/20' 
                                      : 'border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20'
                                  }`}
                                >
                                  {dayData.netAmount >= 0 ? '+' : ''}£{Math.abs(dayData.netAmount).toFixed(0)}
                                </Badge>
                              </div>
                            )}

                            {/* Enhanced transaction indicators */}
                            <ScrollArea className="max-h-20">
                              <div className="space-y-1">
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
                                  <div className="text-xs text-muted-foreground text-center py-1">
                                    +{(dayData.transactions.length + dayData.recurringTransactions.length) - 3} more
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </HoverCardTrigger>
                
                {dayData && dayData.hasData && (
                  <HoverCardContent className="w-auto">
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

  // Enhanced list view
  const renderListView = () => {
    const daysWithData = calendarDays
      ?.filter(date => date && getDataForDate(date)?.hasData)
      ?.sort((a, b) => (a && b) ? new Date(a).getTime() - new Date(b).getTime() : 0) || [];

    if (daysWithData.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Financial Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No transactions found for {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <AddTransactionModal />
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {daysWithData.map((date, index) => {
          const dayData = getDataForDate(date);
          if (!dayData || !date) return null;

          return (
            <Card key={index} className="interactive-card">
              <div className="p-4 border-b bg-gradient-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dayData.netAmount >= 0 ? 'bg-success' : 'bg-destructive'}`} />
                    <h3 className="font-semibold">{format(date, 'EEEE, MMMM dd, yyyy')}</h3>
                    {isToday(date) && <Badge variant="default">Today</Badge>}
                  </div>
                  <Badge variant={dayData.netAmount >= 0 ? "default" : "destructive"} className="font-mono">
                    {dayData.netAmount >= 0 ? '+' : ''}£{dayData.netAmount.toFixed(2)}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Transactions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Transactions</h4>
                    {dayData.transactions.map((transaction, tIndex) => (
                      <div key={tIndex} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">{transaction.category}</span>
                        <Badge variant="outline" className="font-mono">
                          {transaction.category === 'Earnings' ? '+' : '-'}£{transaction.amount.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Recurring */}
                  {dayData.recurringTransactions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Recurring</h4>
                      {dayData.recurringTransactions.map((recurring, rIndex) => (
                        <div key={rIndex} className="flex items-center justify-between p-2 rounded-lg border-dashed border bg-muted/10">
                          <span className="text-sm">{recurring.name}</span>
                          <Badge variant="outline" className="font-mono border-dashed">
                            {recurring.category === 'Earnings' ? '+' : '-'}£{recurring.amount.toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Agenda view (upcoming transactions)
  const renderAgendaView = () => {
    const upcomingDays = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      const dayData = getDataForDate(date);
      if (dayData?.hasData) {
        upcomingDays.push({ date, dayData });
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upcoming Financial Activity</h3>
        </div>
        
        {upcomingDays.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">All Clear</h3>
            <p className="text-sm text-muted-foreground">
              No upcoming transactions in the next 14 days
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingDays.map(({ date, dayData }, index) => (
              <Card key={index} className="p-4 hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">{format(date, 'MMM')}</div>
                      <div className="text-lg font-bold">{format(date, 'dd')}</div>
                      <div className="text-xs text-muted-foreground">{format(date, 'EEE')}</div>
                    </div>
                    <div>
                      <h4 className="font-medium">{format(date, 'EEEE, MMMM dd')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dayData.transactions.length} transactions
                        {dayData.recurringTransactions.length > 0 && ` • ${dayData.recurringTransactions.length} recurring`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={dayData.netAmount >= 0 ? "default" : "destructive"} className="font-mono">
                    {dayData.netAmount >= 0 ? '+' : ''}£{dayData.netAmount.toFixed(2)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // If day view is selected and we have a selected date, show the day view
  if (calendarView === 'day' && selectedDate) {
    return (
      <CalendarDayView
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={() => setCalendarView('month')}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {calendarView === 'agenda' ? 'Financial Agenda' :
               calendarView === 'list' ? 'Activity List' :
               `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <p className="text-muted-foreground">
              {calendarView === 'agenda' ? 'Upcoming financial activity' :
               calendarView === 'list' ? 'All transactions and recurring items' :
               'Interactive financial calendar with drag-and-drop'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggles */}
            <div className="flex rounded-lg border p-1">
              {[
                { key: 'month', label: 'Month', icon: Grid3X3 },
                { key: 'week', label: 'Week', icon: CalendarIcon },
                { key: 'day', label: 'Day', icon: Eye },
                { key: 'list', label: 'List', icon: List },
                { key: 'agenda', label: 'Agenda', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={calendarView === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCalendarView(key as any)}
                  className="h-8 px-2"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
            
            {/* Smart insights toggle */}
            <Button
              variant={showPredictions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPredictions(!showPredictions)}
              className="h-8"
            >
              <Brain className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">AI Insights</span>
            </Button>
            
            <SmartTransactionEntry />
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* Category filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                {filterCategory || 'All Categories'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-1">
                <Button
                  variant={!filterCategory ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterCategory(null)}
                >
                  All Categories
                </Button>
                {['Earnings', 'Food', 'Petrol', 'Other'].map(category => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? "default" : "ghost"}
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
        </div>

        {/* Main content area */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {calendarView === 'list' ? renderListView() :
             calendarView === 'agenda' ? renderAgendaView() :
             renderCalendarGrid()}
          </div>
          
          {/* Smart insights sidebar */}
          <div className="space-y-6">
            {showPredictions && <TransactionPredictions />}
            
            {selectedDate && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                <div className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCalendarView('day')}
                  >
                    <Maximize2 className="h-3 w-3 mr-1" />
                    View Day Details
                  </Button>
                  <AddTransactionModal />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default EnhancedCalendarView;