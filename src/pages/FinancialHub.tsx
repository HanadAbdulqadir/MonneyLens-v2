import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfDay,
  differenceInCalendarDays,
  parseISO,
  getDaysInMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  isMonday,
  isSunday,
} from "date-fns";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinancialHubConfig from "@/components/FinancialHubConfig";

// Charts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Types
type Frequency = "daily" | "weekly" | "biweekly" | "monthly" | "one-time";

type Expense = {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  dayOfWeek?: string | null;
  dayOfMonth?: number | null;
  category: "petrol" | "food" | "rent" | "bills" | "cleaning" | "other";
  notes?: string;
};

type Pot = {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  frequency: "weekly" | "monthly" | "flexible";
  priority: "high" | "medium" | "low";
  type: "essential" | "savings" | "buffer" | "next-month";
};

type UserSchema = {
  name?: string;
  currency: string;
  startingBalance: number;
  averageDailyIncome: number;
  weeklyIncome?: number;
  incomeFrequency: "daily" | "weekly" | "monthly";
  payDays?: string[];
  expenses: Expense[];
  pots: Pot[];
  rules: {
    leftoverStrategy: "next-month-pot" | "buffer" | "savings" | "debt";
    weeklyAllocation: {
      weeks1_2: "next-month-pot";
      weeks3_5: "buffer";
    };
    essentialOrder: string[];
    thresholds: {
      warning: number;
      danger: number;
    };
  };
};

type PlanDay = {
  date: string;
  income: number;
  expenses: { id: string; name: string; amount: number; category: string }[];
  pots: { id: string; name: string; contribution: number; type: string }[];
  balanceAfter: number;
  notes?: string;
  weekNumber: number;
  dayStatus: "good" | "warning" | "danger";
  recommendations: string[];
};

type WeeklyPlan = {
  weekLabel: string;
  weekNumber: number;
  income: number;
  expenses: number;
  pots: number;
  endBalance: number;
  leftover: number;
  leftoverAllocation: { pot: string; amount: number };
  actions: string[];
  status: "on-track" | "behind" | "ahead";
};

// Helpers
const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const formatDate = (d: Date) => format(d, "yyyy-MM-dd");

const getWeekOfMonth = (date: Date) => {
  const firstDayOfMonth = startOfMonth(date);
  const firstDayOfWeek = startOfWeek(firstDayOfMonth);
  const diff = differenceInCalendarDays(date, firstDayOfWeek);
  return Math.floor(diff / 7) + 1;
};

const findFirstWeekdayOnOrAfter = (start: Date, weekday: string): Date => {
  let d = startOfDay(start);
  for (let i = 0; i < 14; i++) {
    if (format(d, "EEEE") === weekday) return d;
    d = addDays(d, 1);
  }
  return start;
};

const matchesSchedule = (expense: Expense, d: Date, planStart: Date) => {
  if (expense.frequency === "daily") return true;
  if (expense.frequency === "one-time") {
    return expense.dayOfMonth ? d.getDate() === expense.dayOfMonth : false;
  }
  if (expense.frequency === "weekly") {
    return expense.dayOfWeek ? format(d, "EEEE") === expense.dayOfWeek : false;
  }
  if (expense.frequency === "biweekly") {
    if (!expense.dayOfWeek) return false;
    if (format(d, "EEEE") !== expense.dayOfWeek) return false;
    const firstMatch = findFirstWeekdayOnOrAfter(planStart, expense.dayOfWeek);
    const diff = differenceInCalendarDays(startOfDay(d), startOfDay(firstMatch));
    return diff % 14 === 0;
  }
  if (expense.frequency === "monthly") {
    return expense.dayOfMonth ? d.getDate() === expense.dayOfMonth : false;
  }
  return false;
};

// Core Generator with Weekly Allocation Rules
function generateYearPlan(schema: UserSchema, startDate: Date): Record<string, PlanDay[]> {
  const months: Record<string, PlanDay[]> = {};
  let runningBalance = schema.startingBalance;
  const planStart = startOfDay(startDate);

  // Initialize pot balances
  const potBalances = new Map(schema.pots.map(pot => [pot.id, pot.currentAmount]));

  for (let m = 0; m < 12; m++) {
    const monthStart = startOfMonth(addMonths(planStart, m));
    const monthEnd = endOfMonth(monthStart);
    const monthKey = format(monthStart, "MMMM yyyy");
    const days: PlanDay[] = [];
    const daysInMonth = getDaysInMonth(monthStart);

    // Reset monthly pots at start of month
    schema.pots.forEach(pot => {
      if (pot.frequency === "monthly") {
        potBalances.set(pot.id, 0);
      }
    });

    // Calculate daily targets for monthly pots
    const potDailyTargets = new Map();
    schema.pots.forEach(pot => {
      if (pot.frequency === "monthly") {
        potDailyTargets.set(pot.id, pot.goalAmount / daysInMonth);
      }
    });

    let weekAccumulator = {
      income: 0,
      expenses: 0,
      pots: 0,
      days: [] as PlanDay[],
      weekNumber: 1,
    };

    for (let d = monthStart; d <= monthEnd; d = addDays(d, 1)) {
      const weekNumber = getWeekOfMonth(d);
      const isStartOfWeek = isMonday(d);
      const isEndOfWeek = isSunday(d) || d.getTime() === monthEnd.getTime();

      // Income
      let income = 0;
      if (schema.incomeFrequency === "daily") income = schema.averageDailyIncome;
      else if (schema.incomeFrequency === "weekly") income = (schema.weeklyIncome || 0) / 7;
      else if (schema.incomeFrequency === "monthly") income = (schema.weeklyIncome || 0) / 30;

      runningBalance += income;

      // Expenses (in priority order)
      const dueExpenses = schema.expenses
        .filter(e => matchesSchedule(e, d, planStart))
        .sort((a, b) => {
          const aIndex = schema.rules.essentialOrder.indexOf(a.category);
          const bIndex = schema.rules.essentialOrder.indexOf(b.category);
          return aIndex - bIndex;
        })
        .map(e => ({ id: e.id, name: e.name, amount: e.amount, category: e.category }));

      dueExpenses.forEach(e => {
        runningBalance -= e.amount;
      });

      // Pot contributions (with weekly allocation rules)
      const contributions: { id: string; name: string; contribution: number; type: string }[] = [];
      
      // Essential pots first (monthly spread)
      schema.pots
        .filter(p => p.type === "essential")
        .forEach(pot => {
          if (pot.frequency === "monthly") {
            const dailyTarget = potDailyTargets.get(pot.id) || 0;
            if (dailyTarget > 0) {
              const currentBalance = potBalances.get(pot.id) || 0;
              const needed = pot.goalAmount - currentBalance;
              const contribution = Math.min(dailyTarget, needed, runningBalance);
              
              if (contribution > 0) {
                runningBalance -= contribution;
                potBalances.set(pot.id, currentBalance + contribution);
                contributions.push({
                  id: pot.id,
                  name: pot.name,
                  contribution,
                  type: pot.type,
                });
              }
            }
          }
        });

      // Weekly pots on Mondays
      if (isStartOfWeek) {
        schema.pots
          .filter(p => p.frequency === "weekly")
          .forEach(pot => {
            const weeklyShare = pot.goalAmount / 4;
            if (weeklyShare > 0 && runningBalance >= weeklyShare) {
              runningBalance -= weeklyShare;
              contributions.push({
                id: pot.id,
                name: pot.name,
                contribution: weeklyShare,
                type: pot.type,
              });
            }
          });
      }

      // Day status and recommendations
      const dayStatus = runningBalance < schema.rules.thresholds.danger ? "danger" : 
                       runningBalance < schema.rules.thresholds.warning ? "warning" : "good";
      
      const recommendations: string[] = [];
      if (runningBalance < schema.rules.thresholds.danger) {
        recommendations.push("⚠️ Balance negative - adjust pots or expenses");
      } else if (weekNumber <= 2) {
        recommendations.push("💰 Leftovers go to Next-Month Pot");
      } else {
        recommendations.push("💰 Leftovers go to Buffer");
      }

      const day: PlanDay = {
        date: formatDate(d),
        income: Number(income.toFixed(2)),
        expenses: dueExpenses,
        pots: contributions,
        balanceAfter: Number(runningBalance.toFixed(2)),
        weekNumber,
        dayStatus,
        recommendations,
      };

      // Weekly leftover allocation
      weekAccumulator.income += day.income;
      weekAccumulator.expenses += day.expenses.reduce((sum, e) => sum + e.amount, 0);
      weekAccumulator.pots += day.pots.reduce((sum, p) => sum + p.contribution, 0);
      weekAccumulator.days.push(day);

      if (isEndOfWeek) {
        const leftover = weekAccumulator.income - weekAccumulator.expenses - weekAccumulator.pots;
        if (leftover > 0) {
          let targetPot: Pot | undefined;
          
          // Apply weekly allocation rules
          if (weekNumber <= 2) {
            targetPot = schema.pots.find(p => p.type === "next-month");
          } else {
            targetPot = schema.pots.find(p => p.type === "buffer");
          }

          if (targetPot && weekAccumulator.days.length > 0) {
            const lastDay = weekAccumulator.days[weekAccumulator.days.length - 1];
            lastDay.pots.push({
              id: targetPot.id,
              name: targetPot.name,
              contribution: leftover,
              type: targetPot.type,
            });
            runningBalance -= leftover;
            lastDay.balanceAfter = Number((lastDay.balanceAfter - leftover).toFixed(2));
          }
        }

        weekAccumulator = { income: 0, expenses: 0, pots: 0, days: [], weekNumber };
      }

      days.push(day);
    }

    months[monthKey] = days;
  }

  return months;
}

// Weekly Plan Generator
const generateWeeklyPlans = (days: PlanDay[], schema: UserSchema): WeeklyPlan[] => {
  const weeks: WeeklyPlan[] = [];
  const weekStarts = eachWeekOfInterval({
    start: parseISO(days[0]?.date || new Date().toISOString()),
    end: parseISO(days[days.length - 1]?.date || new Date().toISOString()),
  });

  weekStarts.forEach((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart);
    const weekDays = days.filter(day => {
      const date = parseISO(day.date);
      return date >= weekStart && date <= weekEnd;
    });

    if (weekDays.length === 0) return;

    const income = weekDays.reduce((sum, day) => sum + day.income, 0);
    const expenses = weekDays.reduce((sum, day) => sum + day.expenses.reduce((eSum, e) => eSum + e.amount, 0), 0);
    const pots = weekDays.reduce((sum, day) => sum + day.pots.reduce((pSum, p) => pSum + p.contribution, 0), 0);
    const leftover = income - expenses - pots;
    const endBalance = weekDays[weekDays.length - 1].balanceAfter;

    // Determine leftover allocation based on week number
    const weekNumber = index + 1;
    let leftoverAllocation = { pot: "Buffer", amount: leftover };
    if (weekNumber <= 2) {
      leftoverAllocation = { pot: "Next-Month Pot", amount: leftover };
    }

    // Generate actions
    const actions: string[] = [];
    actions.push("1. Cover petrol daily (£20/day)");
    actions.push("2. Cover food on Monday (£50)");
    
    if (weekNumber === 1 || weekNumber === 3) {
      actions.push("3. Contribute to Car Rent pot (£120)");
    }
    if (weekNumber === 2 || weekNumber === 4) {
      actions.push("3. Pay Car Rent from pot (£240)");
    }
    
    actions.push("4. Contribute to Bills pot (£250/week)");
    actions.push("5. Contribute to Savings pot (£200/week)");
    actions.push(`6. Leftovers → ${leftoverAllocation.pot}`);

    const status = endBalance < schema.rules.thresholds.danger ? "behind" : 
                   endBalance > schema.rules.thresholds.warning + 100 ? "ahead" : "on-track";

    weeks.push({
      weekLabel: `Week ${weekNumber} (${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')})`,
      weekNumber,
      income,
      expenses,
      pots,
      endBalance,
      leftover,
      leftoverAllocation,
      actions,
      status,
    });
  });

  return weeks;
};

// CSV Export
const exportPlanCSV = (monthsPlan: Record<string, PlanDay[]>, schema: UserSchema) => {
  let csvContent = "Date,Week,Income,Expenses,Pot Contributions,Balance,Status,Recommendations\n";
  
  Object.entries(monthsPlan).forEach(([month, days]) => {
    days.forEach(day => {
      const expenses = day.expenses.map(e => `${e.name}:£${e.amount}`).join(';');
      const pots = day.pots.map(p => `${p.name}:£${p.contribution}`).join(';');
      const recommendations = day.recommendations.join(';');
      
      csvContent += `"${day.date}",Week ${day.weekNumber},£${day.income},"${expenses}","${pots}",£${day.balanceAfter},${day.dayStatus},"${recommendations}"\n`;
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'moneyLens-plan.csv';
  link.click();
  URL.revokeObjectURL(url);
};

// Category Colors
const CATEGORY_COLORS = {
  petrol: '#FF6B6B',
  food: '#4ECDC4',
  rent: '#45B7D1',
  bills: '#96CEB4',
  cleaning: '#FFEAA7',
  other: '#DDA0DD',
};

const POT_TYPE_COLORS = {
  essential: '#4ECDC4',
  savings: '#45B7D1',
  buffer: '#96CEB4',
  'next-month': '#FFEAA7',
};

// Main Component
export default function FinancialHub() {
  const [schema, setSchema] = useState<UserSchema>(() => ({
    currency: "GBP",
    startingBalance: 340,
    averageDailyIncome: 180,
    weeklyIncome: 1200,
    incomeFrequency: "daily",
    payDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    expenses: [
      { id: uid("exp"), name: "Petrol", amount: 20, frequency: "daily", category: "petrol" as const },
      { id: uid("exp"), name: "Food", amount: 50, frequency: "weekly", dayOfWeek: "Monday", category: "food" as const },
      { id: uid("exp"), name: "Car Rent", amount: 240, frequency: "biweekly", dayOfWeek: "Friday", category: "rent" as const },
      { id: uid("exp"), name: "Bills", amount: 990, frequency: "monthly", dayOfMonth: 28, category: "bills" as const },
      { id: uid("exp"), name: "Cleaning", amount: 15, frequency: "biweekly", dayOfWeek: "Saturday", category: "cleaning" as const },
    ],
    pots: [
      { id: uid("pot"), name: "Savings Pot", goalAmount: 800, currentAmount: 0, frequency: "monthly", priority: "high", type: "savings" as const },
      { id: uid("pot"), name: "Next-Month Pot", goalAmount: 700, currentAmount: 0, frequency: "flexible", priority: "high", type: "next-month" as const },
      { id: uid("pot"), name: "Buffer", goalAmount: 0, currentAmount: 0, frequency: "flexible", priority: "low", type: "buffer" as const },
      { id: uid("pot"), name: "Bills Pot", goalAmount: 990, currentAmount: 0, frequency: "monthly", priority: "high", type: "essential" as const },
      { id: uid("pot"), name: "Car Rent Pot", goalAmount: 480, currentAmount: 0, frequency: "monthly", priority: "high", type: "essential" as const },
    ],
    rules: {
      leftoverStrategy: "buffer",
      weeklyAllocation: {
        weeks1_2: "next-month-pot",
        weeks3_5: "buffer",
      },
      essentialOrder: ["petrol", "food", "rent", "bills", "cleaning", "other"],
      thresholds: {
        warning: 100,
        danger: 0,
      },
    },
  }));

  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [monthsPlan, setMonthsPlan] = useState<Record<string, PlanDay[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [view, setView] = useState<"config" | "calendar" | "weekly" | "transition">("config");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dynamicConfig, setDynamicConfig] = useState<any>(null);

  useEffect(() => {
    const start = parseISO(startDate);
    const plan = generateYearPlan(schema, start);
    setMonthsPlan(plan);
    const keys = Object.keys(plan);
    setSelectedMonth(keys[0] || null);
  }, [schema, startDate]);

  const monthKeys = useMemo(() => Object.keys(monthsPlan), [monthsPlan]);
  const weeklyPlans = useMemo(() => {
    if (!selectedMonth) return [];
    return generateWeeklyPlans(monthsPlan[selectedMonth] || [], schema);
  }, [selectedMonth, monthsPlan, schema]);

  // Charts Data
  const monthlyChartData = useMemo(() => {
    if (!selectedMonth) return [];
    return monthsPlan[selectedMonth]?.map(day => ({
      date: day.date.split('-')[2],
      income: day.income,
      expenses: day.expenses.reduce((sum, e) => sum + e.amount, 0),
      pots: day.pots.reduce((sum, p) => sum + p.contribution, 0),
      balance: day.balanceAfter,
    })) || [];
  }, [selectedMonth, monthsPlan]);

  const categoryData = useMemo(() => {
    if (!selectedMonth) return [];
    const categoryTotals: Record<string, number> = {};
    monthsPlan[selectedMonth]?.forEach(day => {
      day.expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [selectedMonth, monthsPlan]);

  // Filter days based on active category filters
  const filteredDays = useMemo(() => {
    if (!selectedMonth || activeFilters.length === 0) return monthsPlan[selectedMonth] || [];
    return monthsPlan[selectedMonth]?.filter(day => 
      day.expenses.some(expense => activeFilters.includes(expense.category))
    ) || [];
  }, [selectedMonth, monthsPlan, activeFilters]);

  // Update expense amount
  const updateExpenseAmount = (expenseId: string, newAmount: number) => {
    setSchema(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => 
        e.id === expenseId ? { ...e, amount: newAmount } : e
      )
    }));
  };

  // Update threshold settings
  const updateThresholds = (warning: number, danger: number) => {
    setSchema(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        thresholds: { warning, danger }
      }
    }));
  };

  // Get upcoming alerts
  const getUpcomingAlerts = useMemo(() => {
    if (!selectedMonth) return [];
    const today = new Date();
    return monthsPlan[selectedMonth]?.filter(day => {
      const dayDate = parseISO(day.date);
      const daysUntil = differenceInCalendarDays(dayDate, today);
      return daysUntil >= 0 && daysUntil <= 3; // Next 3 days
    }).map(day => ({
      date: day.date,
      message: `${day.expenses.length} expenses due`,
      type: day.balanceAfter < schema.rules.thresholds.warning ? 'warning' : 'info'
    })) || [];
  }, [selectedMonth, monthsPlan, schema.rules.thresholds.warning]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Hub</h1>
          <p className="text-gray-600">Your complete financial roadmap</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Plan Start:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={view === "config" ? "default" : "outline"} onClick={() => setView("config")}>
              Configuration
            </Button>
            <Button variant={view === "weekly" ? "default" : "outline"} onClick={() => setView("weekly")}>
              Weekly View
            </Button>
            <Button variant={view === "calendar" ? "default" : "outline"} onClick={() => setView("calendar")}>
              Calendar View
            </Button>
            <Button variant={view === "transition" ? "default" : "outline"} onClick={() => setView("transition")}>
              Transition Plan
            </Button>
          </div>
          <Button onClick={() => exportPlanCSV(monthsPlan, schema)}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Configuration View */}
      {view === "config" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Financial Planning Configuration</h2>
              <p className="text-gray-600 mb-6">
                Configure your expenses, income, and savings goals. The system will automatically analyze your existing 
                financial data and suggest realistic values based on your transaction history.
              </p>
              
              <FinancialHubConfig 
                onConfigUpdate={(config) => {
                  setDynamicConfig(config);
                  // Convert dynamic config to schema format
                  const newSchema: UserSchema = {
                    currency: "GBP",
                    startingBalance: config.startingBalance,
                    averageDailyIncome: config.averageDailyIncome,
                    weeklyIncome: config.weeklyIncome,
                    incomeFrequency: config.incomeFrequency,
                    payDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    expenses: config.expenses.map(exp => ({
                      id: exp.id,
                      name: exp.name,
                      amount: exp.amount,
                      frequency: exp.frequency,
                      dayOfWeek: exp.dayOfWeek,
                      dayOfMonth: exp.dayOfMonth,
                      category: exp.category as any,
                      notes: exp.notes
                    })),
                    pots: config.pots.map(pot => ({
                      id: pot.id,
                      name: pot.name,
                      goalAmount: pot.goalAmount,
                      currentAmount: pot.currentAmount,
                      frequency: pot.frequency,
                      priority: pot.priority,
                      type: pot.type as any
                    })),
                    rules: {
                      leftoverStrategy: "buffer",
                      weeklyAllocation: {
                        weeks1_2: "next-month-pot",
                        weeks3_5: "buffer",
                      },
                      essentialOrder: ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Other"],
                      thresholds: {
                        warning: 100,
                        danger: 0,
                      },
                    },
                  };
                  setSchema(newSchema);
                }}
              />
            </CardContent>
          </Card>
          
          {dynamicConfig && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Configuration Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Expenses:</span> {dynamicConfig.expenses?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Pots:</span> {dynamicConfig.pots?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Daily Income:</span> {schema.currency} {dynamicConfig.averageDailyIncome}
                  </div>
                </div>
                <Button 
                  onClick={() => setView("weekly")} 
                  className="mt-4"
                  disabled={!dynamicConfig.expenses?.length || !dynamicConfig.pots?.length}
                >
                  Generate Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Alerts Section */}
      {getUpcomingAlerts.length > 0 && view !== "config" && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Upcoming Alerts</h3>
            <div className="space-y-2">
              {getUpcomingAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span>{format(parseISO(alert.date), 'EEE, MMM dd')}:</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Plan View */}
      {view === "weekly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {weeklyPlans.map(week => (
              <Card key={week.weekLabel} className={`border-l-4 ${
                week.status === 'on-track' ? 'border-l-green-500' :
                week.status === 'ahead' ? 'border-l-blue-500' : 'border-l-red-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{week.weekLabel}</h3>
                    <Badge variant={
                      week.status === 'on-track' ? 'default' :
                      week.status === 'ahead' ? 'secondary' : 'destructive'
                    }>
                      {week.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>Income: <span className="font-semibold">£{week.income}</span></p>
                      <p>Expenses: <span className="font-semibold">£{week.expenses}</span></p>
                      <p>Pots: <span className="font-semibold">£{week.pots}</span></p>
                    </div>
                    <div>
                      <p>Leftover: <span className="font-semibold">£{week.leftover}</span></p>
                      <p>End Balance: <span className="font-semibold">£{week.endBalance}</span></p>
                      <p className="text-xs text-gray-600">→ {week.leftoverAllocation.pot}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {week.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        {action}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-4">Monthly Cash Flow</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#4ECDC4" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} />
                    <Line type="monotone" dataKey="pots" stroke="#45B7D1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-4">Expense Categories</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && selectedMonth && (
        <div className="space-y-6">
          {/* Category Filters */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Filter by Category</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(CATEGORY_COLORS).map(category => (
                  <Badge
                    key={category}
                    variant={activeFilters.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveFilters(prev => 
                        prev.includes(category) 
                          ? prev.filter(f => f !== category)
                          : [...prev, category]
                      );
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedMonth}</h2>
                <div className="flex gap-2">
                  {monthKeys.map(month => (
                    <Button
                      key={month}
                      variant={selectedMonth === month ? "default" : "outline"}
                      onClick={() => setSelectedMonth(month)}
                    >
                      {month.split(' ')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {(activeFilters.length > 0 ? filteredDays : monthsPlan[selectedMonth])?.map(day => {
                  const date = parseISO(day.date);
                  const dayNumber = date.getDate();
                  const isToday = formatDate(date) === formatDate(new Date());
                  
                  return (
                    <div
                      key={day.date}
                      className={`border rounded-lg p-3 min-h-[120px] cursor-pointer transition-all hover:shadow-md ${
                        day.dayStatus === 'danger' ? 'bg-red-50 border-red-200' :
                        day.dayStatus === 'warning' ? 'bg-amber-50 border-amber-200' :
                        'bg-green-50 border-green-200'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                          {dayNumber}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          £{day.income}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {day.expenses.slice(0, 2).map(expense => (
                          <div key={expense.id} className="flex justify-between">
                            <span>{expense.name}</span>
                            <span className="text-red-600">-£{expense.amount}</span>
                          </div>
                        ))}
                        {day.pots.length > 0 && (
                          <div className="text-green-600">
                            +{day.pots.length} pots
                          </div>
                        )}
                        <div className="font-semibold mt-1">
                          £{day.balanceAfter}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transition Plan View */}
      {view === "transition" && selectedMonth && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Transition Plan</h2>
            <div className="space-y-4">
              {monthsPlan[selectedMonth]?.slice(0, 10).map(day => (
                <div key={day.date} className="flex items-center gap-6 p-4 border rounded-lg">
                  <div className="text-center min-w-[100px]">
                    <div className="font-semibold">{format(parseISO(day.date), 'EEE')}</div>
                    <div className="text-2xl font-bold">{format(parseISO(day.date), 'dd')}</div>
                    <div className="text-sm text-gray-600">{format(parseISO(day.date), 'MMM')}</div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Starting</div>
                      <div className="font-semibold">£{(day.balanceAfter - day.income + day.expenses.reduce((s, e) => s + e.amount, 0)).toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Income</div>
                      <div className="font-semibold text-green-600">+£{day.income}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Expenses</div>
                      <div className="font-semibold text-red-600">
                        -£{day.expenses.reduce((s, e) => s + e.amount, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ending</div>
                      <div className="font-semibold">£{day.balanceAfter}</div>
                    </div>
                  </div>

                  <div className="min-w-[200px]">
                    <div className="text-sm text-gray-600">Actions</div>
                    <div className="text-xs space-y-1">
                      {day.recommendations.map((rec, i) => (
                        <div key={i}>• {rec}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Day Details - {selectedDay.date}</h3>
                <Button variant="outline" onClick={() => setSelectedDay(null)}>Close</Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Transactions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-green-600">
                      <span>Income</span>
                      <span>+£{selectedDay.income}</span>
                    </div>
                    {selectedDay.expenses.map(expense => (
                      <div key={expense.id} className="flex justify-between text-red-600">
                        <span>{expense.name}</span>
                        <span>-£{expense.amount}</span>
                      </div>
                    ))}
                    {selectedDay.pots.map(pot => (
                      <div key={pot.id} className="flex justify-between text-blue-600">
                        <span>{pot.name}</span>
                        <span>+£{pot.contribution}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {selectedDay.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Panel */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Settings & Customization</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Threshold Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="warning-threshold">Warning Threshold (£)</Label>
                  <Input
                    id="warning-threshold"
                    type="number"
                    value={schema.rules.thresholds.warning}
                    onChange={(e) => updateThresholds(Number(e.target.value), schema.rules.thresholds.danger)}
                  />
                </div>
                <div>
                  <Label htmlFor="danger-threshold">Danger Threshold (£)</Label>
                  <Input
                    id="danger-threshold"
                    type="number"
                    value={schema.rules.thresholds.danger}
                    onChange={(e) => updateThresholds(schema.rules.thresholds.warning, Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Pot Progress</h3>
              <div className="space-y-4">
                {schema.pots.map(pot => (
                  <div key={pot.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{pot.name}</span>
                      <span>£{pot.currentAmount} / £{pot.goalAmount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${(pot.currentAmount / pot.goalAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
