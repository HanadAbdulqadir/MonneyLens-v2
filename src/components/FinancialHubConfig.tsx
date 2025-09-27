import React, { useState, useEffect } from "react";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Badge } from "@shared/components/ui/badge";
import { Plus, Trash2, Edit3, Save } from "lucide-react";

// Types matching FinancialHub
type Frequency = "daily" | "weekly" | "biweekly" | "monthly" | "one-time";
type PotType = "essential" | "savings" | "buffer" | "next-month";
type PotFrequency = "weekly" | "monthly" | "flexible";

interface ExpenseConfig {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  dayOfWeek?: string | null;
  dayOfMonth?: number | null;
  category: string;
  notes?: string;
}

interface PotConfig {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  frequency: PotFrequency;
  priority: "high" | "medium" | "low";
  type: PotType;
}

interface FinancialHubConfigProps {
  onConfigUpdate: (config: {
    expenses: ExpenseConfig[];
    pots: PotConfig[];
    startingBalance: number;
    incomeFrequency: "daily" | "weekly" | "monthly";
    averageDailyIncome: number;
    weeklyIncome?: number;
  }) => void;
  initialConfig?: any;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Other"];

export default function FinancialHubConfig({ onConfigUpdate, initialConfig }: FinancialHubConfigProps) {
  const { transactions, goals, dailyData, monthlyStartingPoint, currency } = useFinancial();
  const [activeTab, setActiveTab] = useState<"expenses" | "pots" | "income" | "rules">("expenses");
  
  // Configuration state
  const [expenses, setExpenses] = useState<ExpenseConfig[]>([]);
  const [pots, setPots] = useState<PotConfig[]>([]);
  const [startingBalance, setStartingBalance] = useState(monthlyStartingPoint);
  const [incomeFrequency, setIncomeFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [averageDailyIncome, setAverageDailyIncome] = useState(0);
  const [weeklyIncome, setWeeklyIncome] = useState(0);

  // Form states
  const [newExpense, setNewExpense] = useState<Partial<ExpenseConfig>>({
    name: "",
    amount: 0,
    frequency: "monthly",
    category: "Other"
  });
  
  const [newPot, setNewPot] = useState<Partial<PotConfig>>({
    name: "",
    goalAmount: 0,
    currentAmount: 0,
    frequency: "monthly",
    type: "savings",
    priority: "medium"
  });

  // Analyze existing data for suggestions
  useEffect(() => {
    // Calculate average daily income from transactions
    const incomeTransactions = transactions.filter(t => t.amount > 0);
    if (incomeTransactions.length > 0) {
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const daysWithIncome = new Set(incomeTransactions.map(t => t.date)).size;
      const avgDaily = totalIncome / Math.max(daysWithIncome, 1);
      setAverageDailyIncome(Math.round(avgDaily));
      setWeeklyIncome(Math.round(avgDaily * 7));
    }

    // Suggest expenses based on recurring patterns
    const categoryTotals: Record<string, { total: number; count: number; avg: number }> = {};
    transactions.forEach(t => {
      if (t.amount < 0) { // Expenses are negative
        const category = t.category || "Other";
        if (!categoryTotals[category]) {
          categoryTotals[category] = { total: 0, count: 0, avg: 0 };
        }
        categoryTotals[category].total += Math.abs(t.amount);
        categoryTotals[category].count += 1;
      }
    });

    // Calculate averages and create suggested expenses
    Object.entries(categoryTotals).forEach(([category, data]) => {
      data.avg = data.total / data.count;
      // Only suggest if we have enough data points
      if (data.count >= 3) {
        setExpenses(prev => [...prev, {
          id: `suggested_${category}`,
          name: `${category} Expense`,
          amount: Math.round(data.avg),
          frequency: "monthly",
          category,
          notes: `Based on ${data.count} transactions`
        }]);
      }
    });

    // Convert goals to pots
    goals.forEach(goal => {
      setPots(prev => [...prev, {
        id: goal.id,
        name: goal.title,
        goalAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        frequency: "monthly",
        type: "savings",
        priority: goal.targetAmount > 1000 ? "high" : "medium"
      }]);
    });

  }, [transactions, goals]);

  // Update parent when configuration changes
  useEffect(() => {
    onConfigUpdate({
      expenses,
      pots,
      startingBalance,
      incomeFrequency,
      averageDailyIncome,
      weeklyIncome: incomeFrequency === "weekly" ? weeklyIncome : undefined
    });
  }, [expenses, pots, startingBalance, incomeFrequency, averageDailyIncome, weeklyIncome]);

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    
    const expense: ExpenseConfig = {
      id: `exp_${Date.now()}`,
      name: newExpense.name,
      amount: Number(newExpense.amount),
      frequency: newExpense.frequency || "monthly",
      dayOfWeek: newExpense.dayOfWeek,
      dayOfMonth: newExpense.dayOfMonth,
      category: newExpense.category || "Other",
      notes: newExpense.notes
    };
    
    setExpenses(prev => [...prev, expense]);
    setNewExpense({
      name: "",
      amount: 0,
      frequency: "monthly",
      category: "Other"
    });
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<ExpenseConfig>) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    ));
  };

  const addPot = () => {
    if (!newPot.name || !newPot.goalAmount) return;
    
    const pot: PotConfig = {
      id: `pot_${Date.now()}`,
      name: newPot.name,
      goalAmount: Number(newPot.goalAmount),
      currentAmount: Number(newPot.currentAmount || 0),
      frequency: newPot.frequency || "monthly",
      type: newPot.type || "savings",
      priority: newPot.priority || "medium"
    };
    
    setPots(prev => [...prev, pot]);
    setNewPot({
      name: "",
      goalAmount: 0,
      currentAmount: 0,
      frequency: "monthly",
      type: "savings",
      priority: "medium"
    });
  };

  const removePot = (id: string) => {
    setPots(prev => prev.filter(pot => pot.id !== id));
  };

  const updatePot = (id: string, updates: Partial<PotConfig>) => {
    setPots(prev => prev.map(pot => 
      pot.id === id ? { ...pot, ...updates } : pot
    ));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Tabs */}
      <div className="flex border-b">
        <Button
          variant={activeTab === "expenses" ? "default" : "ghost"}
          onClick={() => setActiveTab("expenses")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Expenses
        </Button>
        <Button
          variant={activeTab === "pots" ? "default" : "ghost"}
          onClick={() => setActiveTab("pots")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Pots & Goals
        </Button>
        <Button
          variant={activeTab === "income" ? "default" : "ghost"}
          onClick={() => setActiveTab("income")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Income
        </Button>
        <Button
          variant={activeTab === "rules" ? "default" : "ghost"}
          onClick={() => setActiveTab("rules")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Rules
        </Button>
      </div>

      {/* Expenses Configuration */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Add New Expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Expense Name</Label>
                  <Input
                    value={newExpense.name || ""}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Rent, Groceries"
                  />
                </div>
                <div>
                  <Label>Amount ({currency})</Label>
                  <Input
                    type="number"
                    value={newExpense.amount || 0}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={newExpense.frequency}
                    onValueChange={(value: Frequency) => setNewExpense(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Day-specific settings */}
              {(newExpense.frequency === "weekly" || newExpense.frequency === "biweekly") && (
                <div className="mt-4">
                  <Label>Day of Week</Label>
                  <Select
                    value={newExpense.dayOfWeek || ""}
                    onValueChange={(value) => setNewExpense(prev => ({ ...prev, dayOfWeek: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(newExpense.frequency === "monthly" || newExpense.frequency === "one-time") && (
                <div className="mt-4">
                  <Label>Day of Month (1-31)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={newExpense.dayOfMonth || ""}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                    placeholder="e.g., 15"
                  />
                </div>
              )}
              
              <Button onClick={addExpense} className="mt-4" disabled={!newExpense.name || !newExpense.amount}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          {/* Existing Expenses */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Configured Expenses ({expenses.length})</h3>
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.name}</span>
                        <Badge variant="outline">{expense.category}</Badge>
                        <Badge variant="secondary">{expense.frequency}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {currency} {expense.amount} • {expense.notes}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateExpense(expense.id, { amount: expense.amount + 10 })}
                      >
                        +10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateExpense(expense.id, { amount: Math.max(0, expense.amount - 10) })}
                      >
                        -10
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {expenses.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No expenses configured. Add some expenses to start planning.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pots Configuration */}
      {activeTab === "pots" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Add New Pot/Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Pot Name</Label>
                  <Input
                    value={newPot.name || ""}
                    onChange={(e) => setNewPot(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Emergency Fund, Vacation"
                  />
                </div>
                <div>
                  <Label>Goal Amount ({currency})</Label>
                  <Input
                    type="number"
                    value={newPot.goalAmount || 0}
                    onChange={(e) => setNewPot(prev => ({ ...prev, goalAmount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Current Amount ({currency})</Label>
                  <Input
                    type="number"
                    value={newPot.currentAmount || 0}
                    onChange={(e) => setNewPot(prev => ({ ...prev, currentAmount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newPot.type}
                    onValueChange={(value: PotType) => setNewPot(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essential">Essential</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="buffer">Buffer</SelectItem>
                      <SelectItem value="next-month">Next Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={newPot.frequency}
                    onValueChange={(value: PotFrequency) => setNewPot(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newPot.priority}
                    onValueChange={(value: "high" | "medium" | "low") => setNewPot(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={addPot} className="mt-4" disabled={!newPot.name || !newPot.goalAmount}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pot
              </Button>
            </CardContent>
          </Card>

          {/* Existing Pots */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Configured Pots & Goals ({pots.length})</h3>
              <div className="space-y-3">
                {pots.map(pot => (
                  <div key={pot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pot.name}</span>
                        <Badge variant="outline">{pot.type}</Badge>
                        <Badge variant="secondary">{pot.frequency}</Badge>
                        <Badge variant={pot.priority === "high" ? "destructive" : pot.priority === "medium" ? "default" : "outline"}>
                          {pot.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {currency} {pot.currentAmount} / {pot.goalAmount} • {Math.round((pot.currentAmount / pot.goalAmount) * 100)}% complete
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{ width: `${Math.min(100, (pot.currentAmount / pot.goalAmount) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePot(pot.id, { currentAmount: pot.currentAmount + 50 })}
                      >
                        +50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePot(pot.id, { currentAmount: Math.max(0, pot.currentAmount - 50) })}
                      >
                        -50
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePot(pot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pots.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No pots configured. Add some pots or goals to start planning.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income Configuration */}
      {activeTab === "income" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Income Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Starting Balance ({currency})</Label>
                  <Input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on your current monthly starting point: {currency} {monthlyStartingPoint}
                  </p>
                </div>
                
                <div>
                  <Label>Income Frequency</Label>
                  <Select
                    value={incomeFrequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") => setIncomeFrequency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Average Daily Income ({currency})</Label>
                  <Input
                    type="number"
                    value={averageDailyIncome}
                    onChange={(e) => setAverageDailyIncome(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Calculated from your transaction history
                  </p>
                </div>
                
                {incomeFrequency === "weekly" && (
                  <div>
                    <Label>Weekly Income ({currency})</Label>
                    <Input
                      type="number"
                      value={weeklyIncome}
                      onChange={(e) => setWeeklyIncome(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Income Summary</h4>
                <div className="text-sm text-blue-700 mt-1">
                  <p>Daily: {currency} {averageDailyIncome}</p>
                  <p>Weekly: {currency} {incomeFrequency === "weekly" ? weeklyIncome : averageDailyIncome * 7}</p>
                  <p>Monthly: {currency} {Math.round(averageDailyIncome * 30)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rules Configuration */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Planning Rules</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Essential Expense Priority Order</h4>
                  <p className="text-sm text-gray-600">
                    Expenses will be paid in this order when funds are limited
                  </p>
                  <div className="mt-2 space-y-2">
                    {CATEGORIES.map((category, index) => (
                      <div key={category} className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Weekly Allocation Strategy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Weeks 1-2:</span>
                      <Badge variant="outline">Next Month Pot</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Weeks 3-5:</span>
                      <Badge variant="outline">Buffer</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Pot Contribution Rules</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Essential pots are funded first with daily contributions</li>
                    <li>Weekly pots are funded on Mondays</li>
                    <li>Leftover funds are allocated based on weekly strategy</li>
                    <li>Buffer pot has flexible funding (no specific goal)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
