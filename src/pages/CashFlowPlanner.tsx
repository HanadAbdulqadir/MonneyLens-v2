import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { addDays, format, startOfMonth, endOfMonth, getDaysInMonth, isSameDay, parseISO } from "date-fns";

// Data Models
interface User {
  id: string;
  name: string;
  startingBalance: number;
  incomeType: 'daily' | 'weekly' | 'monthly';
  incomeAmount: number;
  pots: Pot[];
  expenses: Expense[];
}

interface Pot {
  id: string;
  name: string;
  targetAmount: number;
  currentBalance: number;
  priority: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'bi-weekly' | 'flexible';
  type: 'essential' | 'savings' | 'debt' | 'buffer' | 'next-month';
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  dueDate?: string;
  potId: string;
  priority: number;
}

interface DailyPlan {
  date: string;
  earnings: number;
  expenses: { name: string; amount: number; pot: string }[];
  potContributions: { pot: string; amount: number }[];
  balanceAfter: number;
  dayStatus: 'good' | 'warning' | 'danger';
  shortfallAlerts: string[];
}

interface WeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  totalPotContributions: number;
  endBalance: number;
  leftover: number;
  leftoverAllocation: string;
}

// Core Functions
const calculateDailyBalance = (user: User, date: Date, currentBalance: number, pots: Pot[]): DailyPlan => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayOfWeek = format(date, 'EEEE');
  const dayOfMonth = date.getDate();
  
  // Daily earnings
  let earnings = 0;
  if (user.incomeType === 'daily') {
    earnings = user.incomeAmount;
  } else if (user.incomeType === 'weekly') {
    earnings = user.incomeAmount / 7;
  } else if (user.incomeType === 'monthly') {
    earnings = user.incomeAmount / 30;
  }

  let balance = currentBalance + earnings;
  const dailyExpenses: { name: string; amount: number; pot: string }[] = [];
  const potContributions: { pot: string; amount: number }[] = [];
  const shortfallAlerts: string[] = [];

  // Process daily expenses
  user.expenses.forEach(expense => {
    if (expense.frequency === 'daily') {
      const pot = pots.find(p => p.id === expense.potId);
      if (pot && pot.currentBalance >= expense.amount) {
        pot.currentBalance -= expense.amount;
        balance -= expense.amount;
        dailyExpenses.push({
          name: expense.name,
          amount: expense.amount,
          pot: pot.name
        });
      } else {
        shortfallAlerts.push(`⚠️ Cannot cover ${expense.name}: £${expense.amount}`);
      }
    } else if (expense.frequency === 'weekly' && dayOfWeek === 'Monday') {
      const pot = pots.find(p => p.id === expense.potId);
      if (pot && pot.currentBalance >= expense.amount) {
        pot.currentBalance -= expense.amount;
        balance -= expense.amount;
        dailyExpenses.push({
          name: expense.name,
          amount: expense.amount,
          pot: pot.name
        });
      } else {
        shortfallAlerts.push(`⚠️ Cannot cover ${expense.name}: £${expense.amount}`);
      }
    } else if (expense.frequency === 'bi-weekly' && dayOfWeek === 'Friday' && (dayOfMonth === 4 || dayOfMonth === 18)) {
      const pot = pots.find(p => p.id === expense.potId);
      if (pot && pot.currentBalance >= expense.amount) {
        pot.currentBalance -= expense.amount;
        balance -= expense.amount;
        dailyExpenses.push({
          name: expense.name,
          amount: expense.amount,
          pot: pot.name
        });
      } else {
        shortfallAlerts.push(`⚠️ Cannot cover ${expense.name}: £${expense.amount}`);
      }
    } else if (expense.frequency === 'monthly' && expense.dueDate && isSameDay(date, parseISO(expense.dueDate))) {
      const pot = pots.find(p => p.id === expense.potId);
      if (pot && pot.currentBalance >= expense.amount) {
        pot.currentBalance -= expense.amount;
        balance -= expense.amount;
        dailyExpenses.push({
          name: expense.name,
          amount: expense.amount,
          pot: pot.name
        });
      } else {
        shortfallAlerts.push(`⚠️ Cannot cover ${expense.name}: £${expense.amount}`);
      }
    }
  });

  // Allocate to pots by priority
  const sortedPots = [...pots].sort((a, b) => a.priority - b.priority);
  
  sortedPots.forEach(pot => {
    if (pot.frequency === 'daily') {
      const dailyTarget = pot.targetAmount / 30;
      const needed = pot.targetAmount - pot.currentBalance;
      const contribution = Math.min(dailyTarget, needed, balance);
      
      if (contribution > 0) {
        pot.currentBalance += contribution;
        balance -= contribution;
        potContributions.push({
          pot: pot.name,
          amount: contribution
        });
      }
    } else if (pot.frequency === 'weekly' && dayOfWeek === 'Monday') {
      const weeklyTarget = pot.targetAmount / 4;
      const needed = pot.targetAmount - pot.currentBalance;
      const contribution = Math.min(weeklyTarget, needed, balance);
      
      if (contribution > 0) {
        pot.currentBalance += contribution;
        balance -= contribution;
        potContributions.push({
          pot: pot.name,
          amount: contribution
        });
      }
    } else if (pot.frequency === 'monthly') {
      const dailyTarget = pot.targetAmount / 30;
      const needed = pot.targetAmount - pot.currentBalance;
      const contribution = Math.min(dailyTarget, needed, balance);
      
      if (contribution > 0) {
        pot.currentBalance += contribution;
        balance -= contribution;
        potContributions.push({
          pot: pot.name,
          amount: contribution
        });
      }
    }
  });

  // Determine day status
  let dayStatus: 'good' | 'warning' | 'danger' = 'good';
  if (balance < 0) {
    dayStatus = 'danger';
  } else if (balance < 100) {
    dayStatus = 'warning';
  }

  return {
    date: dateStr,
    earnings,
    expenses: dailyExpenses,
    potContributions,
    balanceAfter: Number(balance.toFixed(2)),
    dayStatus,
    shortfallAlerts
  };
};

const forecastMonth = (user: User, month: Date): { dailyPlans: DailyPlan[], weeklySummaries: WeeklySummary[] } => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = getDaysInMonth(month);
  
  // Clone pots to avoid mutating original
  const pots = user.pots.map(pot => ({ ...pot }));
  
  let currentBalance = user.startingBalance;
  const dailyPlans: DailyPlan[] = [];
  const weeklySummaries: WeeklySummary[] = [];
  
  let currentWeek: DailyPlan[] = [];
  let weekNumber = 1;
  
  for (let day = monthStart; day <= monthEnd; day = addDays(day, 1)) {
    const dailyPlan = calculateDailyBalance(user, day, currentBalance, pots);
    dailyPlans.push(dailyPlan);
    currentBalance = dailyPlan.balanceAfter;
    
    currentWeek.push(dailyPlan);
    
    // End of week (Sunday) or end of month
    if (format(day, 'EEEE') === 'Sunday' || isSameDay(day, monthEnd)) {
      const weekIncome = currentWeek.reduce((sum, day) => sum + day.earnings, 0);
      const weekExpenses = currentWeek.reduce((sum, day) => 
        sum + day.expenses.reduce((eSum, exp) => eSum + exp.amount, 0), 0);
      const weekPots = currentWeek.reduce((sum, day) => 
        sum + day.potContributions.reduce((pSum, pot) => pSum + pot.amount, 0), 0);
      const leftover = weekIncome - weekExpenses - weekPots;
      
      weeklySummaries.push({
        weekNumber,
        startDate: format(currentWeek[0].date, 'MMM dd'),
        endDate: format(currentWeek[currentWeek.length - 1].date, 'MMM dd'),
        totalIncome: Number(weekIncome.toFixed(2)),
        totalExpenses: Number(weekExpenses.toFixed(2)),
        totalPotContributions: Number(weekPots.toFixed(2)),
        endBalance: currentBalance,
        leftover: Number(leftover.toFixed(2)),
        leftoverAllocation: weekNumber <= 2 ? 'Next-Month Pot' : 'Buffer Pot'
      });
      
      currentWeek = [];
      weekNumber++;
    }
  }
  
  return { dailyPlans, weeklySummaries };
};

// Sample User Data
const sampleUser: User = {
  id: "user-1",
  name: "Sample User",
  startingBalance: 300,
  incomeType: "daily",
  incomeAmount: 180,
  pots: [
    { id: "pot-1", name: "Petrol", targetAmount: 560, currentBalance: 0, priority: 1, frequency: "daily", type: "essential" },
    { id: "pot-2", name: "Food", targetAmount: 200, currentBalance: 0, priority: 2, frequency: "weekly", type: "essential" },
    { id: "pot-3", name: "Car Rent", targetAmount: 480, currentBalance: 0, priority: 3, frequency: "bi-weekly", type: "essential" },
    { id: "pot-4", name: "Bills", targetAmount: 990, currentBalance: 0, priority: 4, frequency: "monthly", type: "essential" },
    { id: "pot-5", name: "Amex Repayment", targetAmount: 800, currentBalance: 0, priority: 5, frequency: "weekly", type: "debt" },
    { id: "pot-6", name: "Next-Month Pot", targetAmount: 700, currentBalance: 0, priority: 6, frequency: "monthly", type: "next-month" },
    { id: "pot-7", name: "Buffer", targetAmount: 0, currentBalance: 0, priority: 7, frequency: "flexible", type: "buffer" }
  ],
  expenses: [
    { id: "exp-1", name: "Petrol", amount: 20, frequency: "daily", potId: "pot-1", priority: 1 },
    { id: "exp-2", name: "Food", amount: 50, frequency: "weekly", potId: "pot-2", priority: 2 },
    { id: "exp-3", name: "Car Rent", amount: 240, frequency: "bi-weekly", potId: "pot-3", priority: 3 },
    { id: "exp-4", name: "Bills", amount: 990, frequency: "monthly", dueDate: "2025-10-28", potId: "pot-4", priority: 4 },
    { id: "exp-5", name: "Amex Payment", amount: 200, frequency: "weekly", potId: "pot-5", priority: 5 }
  ]
};

const CashFlowPlanner: React.FC = () => {
  const [user, setUser] = useState<User>(sampleUser);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    const { dailyPlans, weeklySummaries } = forecastMonth(user, selectedMonth);
    setDailyPlans(dailyPlans);
    setWeeklySummaries(weeklySummaries);
  }, [user, selectedMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPotTypeColor = (type: string) => {
    switch (type) {
      case 'essential': return 'bg-blue-100 text-blue-800';
      case 'savings': return 'bg-green-100 text-green-800';
      case 'debt': return 'bg-red-100 text-red-800';
      case 'buffer': return 'bg-purple-100 text-purple-800';
      case 'next-month': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 Dynamic Cash Flow Planner</h1>
          <p className="text-gray-600">Automated income allocation, expense tracking, and pot management</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="month-select">Select Month:</Label>
            <Input
              id="month-select"
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(parseISO(e.target.value + '-01'))}
              className="w-40"
            />
          </div>
          <Button onClick={() => window.print()}>Print Plan</Button>
        </div>
      </div>

      {/* User Configuration Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">User Configuration</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Starting Balance</h3>
              <p className="text-2xl font-bold text-blue-700">£{user.startingBalance}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Daily Income</h3>
              <p className="text-2xl font-bold text-green-700">£{user.incomeAmount}</p>
              <p className="text-xs text-green-600">{user.incomeType}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-900">Monthly Expenses</h3>
              <p className="text-2xl font-bold text-red-700">£{user.expenses.reduce((sum, exp) => {
                if (exp.frequency === 'daily') return sum + (exp.amount * 30);
                if (exp.frequency === 'weekly') return sum + (exp.amount * 4);
                if (exp.frequency === 'bi-weekly') return sum + (exp.amount * 2);
                return sum + exp.amount;
              }, 0)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Pot Targets</h3>
              <p className="text-2xl font-bold text-purple-700">£{user.pots.reduce((sum, pot) => sum + pot.targetAmount, 0)}</p>
            </div>
          </div>

          {/* Pots Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.pots.map(pot => (
              <div key={pot.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{pot.name}</h3>
                  <Badge className={getPotTypeColor(pot.type)}>
                    {pot.type}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Target: £{pot.targetAmount} • {pot.frequency}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(100, (pot.currentBalance / pot.targetAmount) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  Current: £{pot.currentBalance.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summaries */}
      <div className="grid grid-cols-2 gap-4">
        {weeklySummaries.map(week => (
          <Card key={week.weekNumber} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">Week {week.weekNumber}</h3>
                <Badge variant="secondary">
                  {week.startDate} - {week.endDate}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>Income: <span className="font-semibold text-green-600">£{week.totalIncome}</span></p>
                  <p>Expenses: <span className="font-semibold text-red-600">£{week.totalExpenses}</span></p>
                  <p>Pots: <span className="font-semibold text-blue-600">£{week.totalPotContributions}</span></p>
                </div>
                <div>
                  <p>Leftover: <span className="font-semibold text-purple-600">£{week.leftover}</span></p>
                  <p>End Balance: <span className="font-semibold">£{week.endBalance}</span></p>
                  <p className="text-xs text-gray-600">→ {week.leftoverAllocation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Plans */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Daily Cash Flow Forecast</h2>
          <div className="space-y-4">
            {dailyPlans.map(day => (
              <div
                key={day.date}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStatusColor(day.dayStatus)}`}
                onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-semibold">{format(parseISO(day.date), 'EEE')}</div>
                      <div className="text-2xl font-bold">{format(parseISO(day.date), 'dd')}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Earnings: £{day.earnings}</h4>
                      <p className="text-sm text-gray-600">End Balance: £{day.balanceAfter}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      day.dayStatus === 'good' ? 'default' :
                      day.dayStatus === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {day.dayStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {expandedDay === day.date && (
                  <div className="mt-4 space-y-3">
                    {/* Expenses */}
                    {day.expenses.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Expenses:</h5>
                        <div className="space-y-1">
                          {day.expenses.map((expense, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{expense.name} ({expense.pot})</span>
                              <span className="text-red-600">-£{expense.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pot Contributions */}
                    {day.potContributions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Pot Contributions:</h5>
                        <div className="space-y-1">
                          {day.potContributions.map((contribution, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{contribution.pot}</span>
                              <span className="text-green-600">+£{contribution.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shortfall Alerts */}
                    {day.shortfallAlerts.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <h5 className="font-medium text-red-800 text-sm mb-2">⚠️ Shortfall Alerts:</h5>
                        <div className="space-y-1">
                          {day.shortfallAlerts.map((alert, index) => (
                            <div key={index} className="text-red-700 text-sm">{alert}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Rules */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Allocation Rules & Logic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Daily Allocation Priority</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>1. Cover daily expenses (Petrol, Food)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>2. Fund essential pots (Car Rent, Bills)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>3. Debt repayment (Amex)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>4. Next-month preparation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>5. Buffer fund</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Weekly Allocation Strategy</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>Weeks 1-2:</strong> Leftover funds → Next-Month Pot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span><strong>Weeks 3-5:</strong> Leftover funds → Buffer Pot</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  This ensures next-month expenses are covered first, then builds emergency funds.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowPlanner;
