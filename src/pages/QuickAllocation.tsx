import React, { useState, useEffect } from 'react';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Target, 
  CheckCircle, 
  Zap,
  PiggyBank,
  Shield,
  Calendar,
  ArrowLeft
} from "lucide-react";

interface AllocationItem {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'goal' | 'buffer';
  essential: boolean;
  dueToday: boolean;
  completed: boolean;
  isLeftover?: boolean;
  category?: string;
  priority: number;
}

const QuickAllocation = () => {
  const { goals, transactions, addTransaction, updateGoal } = useFinancial();
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoAllocate, setAutoAllocate] = useState(true);

  // Mock expenses data since it's not in the context
  const mockExpenses = [
    { id: "exp1", name: "Petrol", amount: 20, frequency: "daily", category: "Transport" },
    { id: "exp2", name: "Food", amount: 50, frequency: "weekly", category: "Food" },
    { id: "exp3", name: "Bills", amount: 200, frequency: "monthly", category: "Bills" }
  ];

  // Calculate smart allocations based on earnings and financial context
  const calculateSmartAllocations = (amount: number): AllocationItem[] => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const isMonday = dayOfWeek === 1;
    const isFriday = dayOfWeek === 5;
    
    const newAllocations: AllocationItem[] = [];
    let remainingAmount = amount;

    // Priority 1: Essential daily expenses (always first)
    const dailyExpenses = mockExpenses.filter(exp => exp.frequency === 'daily');
    for (const expense of dailyExpenses) {
      if (remainingAmount >= expense.amount) {
        newAllocations.push({
          id: `expense-${expense.id}`,
          name: `💳 ${expense.name}`,
          amount: expense.amount,
          type: 'expense',
          essential: true,
          dueToday: true,
          completed: autoAllocate,
          category: expense.category,
          priority: 1
        });
        remainingAmount -= expense.amount;
      }
    }

    // Priority 2: Weekly expenses (on relevant days)
    if (isMonday) {
      const weeklyExpenses = mockExpenses.filter(exp => exp.frequency === 'weekly');
      for (const expense of weeklyExpenses) {
        if (remainingAmount >= expense.amount) {
          newAllocations.push({
            id: `expense-${expense.id}`,
            name: `📅 ${expense.name}`,
            amount: expense.amount,
            type: 'expense',
            essential: true,
            dueToday: true,
            completed: autoAllocate,
            category: expense.category,
            priority: 2
          });
          remainingAmount -= expense.amount;
        }
      }
    }

    // Priority 3: Critical goals (behind schedule)
    const criticalGoals = goals.filter(goal => !goal.completed)
      .sort((a, b) => {
        const aProgress = a.currentAmount / a.targetAmount;
        const bProgress = b.currentAmount / b.targetAmount;
        return aProgress - bProgress; // Prioritize goals with lower progress
      });

    for (const goal of criticalGoals) {
      const neededAmount = goal.targetAmount - goal.currentAmount;
      const daysRemaining = goal.targetDate ? 
        Math.ceil((new Date(goal.targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 30;
      const dailyTarget = neededAmount / Math.max(daysRemaining, 1);
      const suggestedAmount = Math.min(dailyTarget, Math.floor(remainingAmount * 0.3));

      if (suggestedAmount > 0 && remainingAmount >= suggestedAmount) {
        newAllocations.push({
          id: `goal-${goal.id}`,
          name: `🎯 ${goal.title}`,
          amount: suggestedAmount,
          type: 'goal',
          essential: true,
          dueToday: isFriday,
          completed: false,
          priority: 3
        });
        remainingAmount -= suggestedAmount;
      }
    }

    // Priority 4: Other goals
    const otherGoals = goals.filter(goal => !goal.completed && 
      !criticalGoals.some(cg => cg.id === goal.id));
    
    for (const goal of otherGoals) {
      const suggestedAmount = Math.floor(remainingAmount * 0.2); // 20% max for other goals
      if (suggestedAmount > 0 && remainingAmount >= suggestedAmount) {
        newAllocations.push({
          id: `goal-${goal.id}`,
          name: `💰 ${goal.title}`,
          amount: suggestedAmount,
          type: 'goal',
          essential: false,
          dueToday: true,
          completed: false,
          priority: 4
        });
        remainingAmount -= suggestedAmount;
      }
    }

    // Priority 5: Emergency buffer
    if (remainingAmount > 0) {
      const bufferAmount = Math.floor(remainingAmount * 0.3); // 30% to buffer
      if (bufferAmount > 0) {
        newAllocations.push({
          id: 'buffer',
          name: '🛡️ Emergency Buffer',
          amount: bufferAmount,
          type: 'buffer',
          essential: false,
          dueToday: true,
          completed: false,
          priority: 5
        });
        remainingAmount -= bufferAmount;
      }
    }

    // Priority 6: Leftover (discretionary spending)
    if (remainingAmount > 0) {
      newAllocations.push({
        id: 'leftover',
        name: '🎉 Discretionary Spending',
        amount: remainingAmount,
        type: 'buffer',
        essential: false,
        dueToday: true,
        completed: false,
        isLeftover: true,
        priority: 6
      });
    }

    return newAllocations.sort((a, b) => a.priority - b.priority);
  };

  const handleSubmitEarnings = () => {
    if (earnings > 0) {
      const calculatedAllocations = calculateSmartAllocations(earnings);
      setAllocations(calculatedAllocations);
      setIsSubmitted(true);
      
      toast({
        title: "Smart Allocation Generated",
        description: `Created ${calculatedAllocations.length} allocation suggestions based on your financial context.`,
      });
    }
  };

  const toggleAllocation = (id: string) => {
    setAllocations(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleConfirmAllocations = async () => {
    try {
      const completedAllocations = allocations.filter(a => a.completed);
      
      // Create transactions for completed allocations
      for (const allocation of completedAllocations) {
        if (allocation.type === 'expense') {
          // Create expense transaction (negative amount)
          await addTransaction({
            amount: -allocation.amount,
            category: allocation.category || 'Other',
            date: new Date().toISOString().split('T')[0],
            description: `Quick Allocation: ${allocation.name}`
          });
        } else if (allocation.type === 'goal') {
          // Update goal amount
          const goalId = allocation.id.replace('goal-', '');
          const targetGoal = goals.find(g => g.id === goalId);
          if (targetGoal) {
            await updateGoal(goalId, { 
              currentAmount: targetGoal.currentAmount + allocation.amount 
            });
          }
        }
        // Buffer allocations don't create transactions - they're just suggestions
      }

      toast({
        title: "Allocations Confirmed!",
        description: `Successfully processed ${completedAllocations.length} allocations totaling £${completedAllocations.reduce((sum, a) => sum + a.amount, 0)}.`,
      });

      // Reset form
      setEarnings(0);
      setNote('');
      setAllocations([]);
      setIsSubmitted(false);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process allocations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTotalAllocated = () => allocations.filter(a => a.completed).reduce((sum, a) => sum + a.amount, 0);
  const getTotalPending = () => allocations.filter(a => !a.completed).reduce((sum, a) => sum + a.amount, 0);

  if (!isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-emerald-50/50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Quick Allocation Engine</h1>
            </div>
            <p className="text-lg text-gray-600">Smart money allocation based on your financial context</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Enter Today's Earnings</CardTitle>
              <CardDescription>
                The system will analyze your goals and suggest optimal allocations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Earnings Input */}
              <div>
                <Label htmlFor="earnings" className="text-lg font-medium">Earnings Amount (£)</Label>
                <Input
                  id="earnings"
                  type="number"
                  value={earnings || ''}
                  onChange={(e) => setEarnings(Number(e.target.value))}
                  className="text-2xl font-bold text-center h-16 mt-2"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Note Input */}
              <div>
                <Label htmlFor="note">Notes (optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., overtime, weekend work, bonus"
                  className="mt-1"
                />
              </div>

              {/* Auto-allocate Switch */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="auto-allocate" className="font-medium">Auto-allocate essentials</Label>
                  <p className="text-sm text-muted-foreground">Automatically mark essential expenses as completed</p>
                </div>
                <Switch
                  id="auto-allocate"
                  checked={autoAllocate}
                  onCheckedChange={setAutoAllocate}
                />
              </div>

              {/* Financial Context Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Financial Context</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{mockExpenses.length}</div>
                      <div className="text-muted-foreground">Expenses</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{goals.length}</div>
                      <div className="text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{transactions.length}</div>
                      <div className="text-muted-foreground">Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleSubmitEarnings}
                disabled={!earnings || earnings <= 0}
                className="w-full py-3 text-lg"
                size="lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Generate Smart Allocations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-emerald-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Allocation Plan</h1>
          <p className="text-lg text-gray-600">From £{earnings} earned today</p>
          {note && <p className="text-sm text-gray-500 mt-1">Note: {note}</p>}
        </div>

        {/* Allocations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Allocations List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recommended Allocations</CardTitle>
                <CardDescription>
                  Based on your goals and current financial status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allocations.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                        item.completed 
                          ? 'bg-green-50 border-green-200 shadow-sm' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-full ${
                          item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.completed ? <CheckCircle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.essential && <Badge variant="destructive" className="text-xs">Essential</Badge>}
                            {item.dueToday && <Badge variant="secondary" className="text-xs">Due Today</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {item.type} • Priority {item.priority}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            item.isLeftover ? 'text-blue-600' : 
                            item.essential ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            £{item.amount}
                          </div>
                          {item.isLeftover && <div className="text-xs text-blue-500">Discretionary</div>}
                        </div>
                        
                        <Switch
                          checked={item.completed}
                          onCheckedChange={() => toggleAllocation(item.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Earned</span>
                    <span className="font-semibold">£{earnings}</span>
                  </div>
                  <Progress value={(getTotalAllocated() / earnings) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">£{getTotalAllocated()}</div>
                    <div className="text-sm text-green-700">Allocated</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">£{getTotalPending()}</div>
                    <div className="text-sm text-blue-700">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Adjust Earnings
                </Button>
                <Button
                  onClick={handleConfirmAllocations}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Confirm Allocations ✅
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAllocation;
