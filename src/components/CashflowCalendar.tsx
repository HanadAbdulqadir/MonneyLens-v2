import { useState, useEffect } from 'react';
import { usePots } from '@/contexts/PotsContext';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface CashflowCalendarProps {
  className?: string;
}

interface DayCashflow {
  date: Date;
  income: number;
  expenses: number;
  net: number;
  transactions: any[];
  potAllocations: any[];
}

export default function CashflowCalendar({ className }: CashflowCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [cashflowData, setCashflowData] = useState<DayCashflow[]>([]);
  const { transactions } = useFinancial();
  const { allocationTransactions, pots } = usePots();

  useEffect(() => {
    calculateCashflowData();
  }, [transactions, allocationTransactions, month]);

  const calculateCashflowData = () => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const data = days.map(date => {
      const dayTransactions = transactions.filter(t => 
        isSameDay(parseISO(t.date), date)
      );

      const dayAllocations = allocationTransactions.filter(at =>
        isSameDay(parseISO(at.allocation_date), date)
      );

      const income = dayTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const allocations = dayAllocations.reduce((sum, at) => sum + at.amount, 0);

      return {
        date,
        income,
        expenses,
        net: income - expenses + allocations,
        transactions: dayTransactions,
        potAllocations: dayAllocations
      };
    });

    setCashflowData(data);
  };

  const getDayCashflow = (date: Date) => {
    return cashflowData.find(d => isSameDay(d.date, date));
  };

  const getDayClassName = (date: Date) => {
    const cashflow = getDayCashflow(date);
    if (!cashflow) return '';

    if (cashflow.net > 0) {
      return 'bg-green-50 text-green-700 hover:bg-green-100';
    } else if (cashflow.net < 0) {
      return 'bg-red-50 text-red-700 hover:bg-red-100';
    }
    return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
  };

  const getDayContent = (date: Date) => {
    const cashflow = getDayCashflow(date);
    if (!cashflow) return null;

    return (
      <div className="text-xs text-center space-y-1">
        <div className={cn(
          "font-medium",
          cashflow.net > 0 ? "text-green-600" : cashflow.net < 0 ? "text-red-600" : "text-gray-500"
        )}>
          £{Math.abs(cashflow.net).toFixed(0)}
        </div>
        {cashflow.transactions.length > 0 && (
          <Badge variant="secondary" className="h-4 w-4 p-0 text-[8px]">
            {cashflow.transactions.length}
          </Badge>
        )}
      </div>
    );
  };

  const selectedDayCashflow = getDayCashflow(selectedDate);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Cashflow Calendar
        </CardTitle>
        <CardDescription>
          Visual overview of your daily income, expenses, and pot allocations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={month}
              onMonthChange={setMonth}
              className="rounded-md border"
              modifiers={{
                hasTransactions: cashflowData.filter(d => d.transactions.length > 0).map(d => d.date),
                hasAllocations: cashflowData.filter(d => d.potAllocations.length > 0).map(d => d.date),
              }}
              modifiersClassNames={{
                hasTransactions: 'ring-2 ring-blue-200',
                hasAllocations: 'ring-2 ring-purple-200',
              }}
              components={{
                Day: ({ date, ...props }) => {
                  const dayCashflow = getDayCashflow(date);
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          {...props}
                          className={cn(
                            'relative h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                            getDayClassName(date)
                          )}
                        >
                          {date.getDate()}
                          {getDayContent(date)}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <div className="font-medium">
                            {format(date, 'EEEE, MMMM d, yyyy')}
                          </div>
                          {dayCashflow && (
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-green-600 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Income:
                                </span>
                                <span>£{dayCashflow.income.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-600 flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  Expenses:
                                </span>
                                <span>£{dayCashflow.expenses.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t pt-1">
                                <span>Net:</span>
                                <span className={dayCashflow.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  £{dayCashflow.net.toFixed(2)}
                                </span>
                              </div>
                              {dayCashflow.potAllocations.length > 0 && (
                                <div className="pt-1">
                                  <div className="text-xs text-purple-600 font-medium">Pot Allocations:</div>
                                  {dayCashflow.potAllocations.map(allocation => {
                                    const pot = pots.find(p => p.id === allocation.pot_id);
                                    return (
                                      <div key={allocation.id} className="flex justify-between text-xs">
                                        <span>{pot?.name || 'Unknown Pot'}:</span>
                                        <span>+£{allocation.amount.toFixed(2)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                },
              }}
            />
          </div>

          {/* Day Details */}
          <div className="space-y-4">
            <div className="text-lg font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
            </div>

            {selectedDayCashflow ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-green-600 font-medium">Income</div>
                    <div className="text-lg font-bold">£{selectedDayCashflow.income.toFixed(2)}</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-red-600 font-medium">Expenses</div>
                    <div className="text-lg font-bold">£{selectedDayCashflow.expenses.toFixed(2)}</div>
                  </div>
                  <div className={cn(
                    "rounded p-2",
                    selectedDayCashflow.net >= 0 ? "bg-green-50" : "bg-red-50"
                  )}>
                    <div className={selectedDayCashflow.net >= 0 ? "text-green-600" : "text-red-600"}>
                      Net
                    </div>
                    <div className={cn(
                      "text-lg font-bold",
                      selectedDayCashflow.net >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      £{selectedDayCashflow.net.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                {selectedDayCashflow.transactions.length > 0 && (
                  <div>
                    <div className="font-medium text-sm mb-2">Transactions ({selectedDayCashflow.transactions.length})</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedDayCashflow.transactions.map(transaction => (
                        <div key={transaction.id} className="flex justify-between items-center text-xs p-1 rounded bg-gray-50">
                          <span className="truncate">{transaction.description || transaction.category}</span>
                          <span className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                            {transaction.amount >= 0 ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pot Allocations */}
                {selectedDayCashflow.potAllocations.length > 0 && (
                  <div>
                    <div className="font-medium text-sm mb-2">Pot Allocations</div>
                    <div className="space-y-1">
                      {selectedDayCashflow.potAllocations.map(allocation => {
                        const pot = pots.find(p => p.id === allocation.pot_id);
                        return (
                          <div key={allocation.id} className="flex justify-between items-center text-xs p-1 rounded bg-purple-50">
                            <span className="text-purple-700">{pot?.name || 'Unknown Pot'}</span>
                            <span className="text-purple-700 font-medium">
                              +£{allocation.amount.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedDayCashflow.transactions.length === 0 && selectedDayCashflow.potAllocations.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No activity recorded for this day
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">
                No data available for this day
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>Positive net</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>Negative net</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-200 rounded"></div>
            <span>Has transactions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-purple-200 rounded"></div>
            <span>Has pot allocations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
