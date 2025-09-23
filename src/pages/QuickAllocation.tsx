import React, { useState, useEffect } from 'react';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Target, 
  CheckCircle, 
  Zap,
  PiggyBank,
  Shield,
  Calendar,
  ArrowLeft,
  TrendingUp,
  PieChart,
  Clock,
  Star,
  Settings,
  History,
  TestTube
} from "lucide-react";

interface AllocationItem {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'goal' | 'buffer' | 'pot';
  essential: boolean;
  dueToday: boolean;
  completed: boolean;
  isLeftover?: boolean;
  category?: string;
  priority: number;
  goalId?: string;
  potId?: string;
  progressImpact?: number;
  isScenario?: boolean;
}

interface AllocationStrategy {
  id: string;
  name: string;
  description: string;
  bufferRatio: number;
  goalRatio: number;
  expenseRatio: number;
  icon: React.ReactNode;
}

const QuickAllocation = () => {
  const { goals, transactions, addTransaction, updateGoal, recurringTransactions } = useFinancial();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoAllocate, setAutoAllocate] = useState(true);
  const [activeTab, setActiveTab] = useState('smart');
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');

  const allocationStrategies: AllocationStrategy[] = [
    {
      id: 'conservative',
      name: 'Conservative',
      description: 'Prioritize safety with higher buffer allocation',
      bufferRatio: 0.4,
      goalRatio: 0.3,
      expenseRatio: 0.3,
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Even distribution across all categories',
      bufferRatio: 0.3,
      goalRatio: 0.4,
      expenseRatio: 0.3,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'Maximize goal progress with higher goal allocation',
      bufferRatio: 0.2,
      goalRatio: 0.5,
      expenseRatio: 0.3,
      icon: <Zap className="h-4 w-4" />
    }
  ];

  const getRealExpenses = () => {
    return recurringTransactions
      .filter(rt => rt.isActive)
      .map(rt => ({
        id: rt.id,
        name: rt.name,
        amount: Math.abs(rt.amount),
        frequency: rt.frequency,
        category: rt.category,
        nextDate: rt.nextDate
      }));
  };

  const calculateGoalUrgency = (goal: any) => {
    if (goal.completed) return 0;
    
    const progress = goal.currentAmount / goal.targetAmount;
    const daysRemaining = goal.targetDate ? 
      Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30;
    
    const progressScore = (1 - progress) * 50;
    const timeScore = Math.max(0, (30 - daysRemaining) / 30 * 50);
    
    return progressScore + timeScore;
  };

  const calculateSmartAllocations = (amount: number, strategyId: string = 'balanced'): AllocationItem[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isMonday = dayOfWeek === 1;
    
    const strategy = allocationStrategies.find(s => s.id === strategyId) || allocationStrategies[1];
    const realExpenses = getRealExpenses();
    
    const newAllocations: AllocationItem[] = [];
    let remainingAmount = amount;

    const essentialExpenses = realExpenses.filter(exp => 
      exp.frequency === 'daily' || (isMonday && exp.frequency === 'weekly')
    );

    for (const expense of essentialExpenses) {
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

    const activeGoals = goals.filter(goal => !goal.completed);
    const goalsWithUrgency = activeGoals.map(goal => ({
      ...goal,
      urgency: calculateGoalUrgency(goal)
    })).sort((a, b) => b.urgency - a.urgency);

    const totalUrgency = goalsWithUrgency.reduce((sum, goal) => sum + goal.urgency, 0);
    const goalAllocation = remainingAmount * strategy.goalRatio;

    for (const goal of goalsWithUrgency) {
      if (goalAllocation <= 0) break;

      const urgencyRatio = goal.urgency / totalUrgency;
      const suggestedAmount = Math.min(
        goal.targetAmount - goal.currentAmount,
        goalAllocation * urgencyRatio
      );

      if (suggestedAmount > 0 && remainingAmount >= suggestedAmount) {
        const progressImpact = (suggestedAmount / goal.targetAmount) * 100;
        
        newAllocations.push({
          id: `goal-${goal.id}`,
          name: `🎯 ${goal.title}`,
          amount: suggestedAmount,
          type: 'goal',
          essential: goal.urgency > 50,
          dueToday: goal.urgency > 70,
          completed: false,
          priority: goal.urgency > 50 ? 2 : 3,
          goalId: goal.id,
          progressImpact: Math.round(progressImpact)
        });
        remainingAmount -= suggestedAmount;
      }
    }

    const bufferAllocation = remainingAmount * strategy.bufferRatio;
    if (bufferAllocation > 0) {
      newAllocations.push({
        id: 'buffer',
        name: '🛡️ Emergency Buffer',
        amount: bufferAllocation,
        type: 'buffer',
        essential: false,
        dueToday: true,
        completed: false,
        priority: 4
      });
      remainingAmount -= bufferAllocation;
    }

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
        priority: 5
      });
    }

    return newAllocations.sort((a, b) => a.priority - b.priority);
  };

  const handleQuickPercentage = (percentage: number) => {
    const amount = earnings * (percentage / 100);
    const calculatedAllocations = calculateSmartAllocations(amount, selectedStrategy);
    setAllocations(calculatedAllocations);
    setIsSubmitted(true);
  };

  const testScenarios = {
    doubleIncome: earnings * 2,
    halfIncome: earnings / 2,
    emergency: Math.max(0, earnings - 100)
  };

  const testScenario = (scenario: keyof typeof testScenarios) => {
    const scenarioAmount = testScenarios[scenario];
    const calculatedAllocations = calculateSmartAllocations(scenarioAmount, selectedStrategy);
    
    toast({
      title: `Scenario: ${scenario.replace(/([A-Z])/g, ' $1').trim()}`,
      description: `Allocation preview for £${scenarioAmount}`,
    });

    setAllocations(calculatedAllocations.map(a => ({ ...a, isScenario: true })));
    setIsSubmitted(true);
  };

  const handleSubmitEarnings = () => {
    if (earnings > 0) {
      const calculatedAllocations = calculateSmartAllocations(earnings, selectedStrategy);
      setAllocations(calculatedAllocations);
      setIsSubmitted(true);
      
      toast({
        title: "Smart Allocation Generated",
        description: `Created ${calculatedAllocations.length} allocation suggestions using ${selectedStrategy} strategy.`,
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
      const completedAllocations = allocations.filter(a => a.completed && !a.isScenario);
      
      if (completedAllocations.length === 0) {
        toast({
          title: "No Allocations Selected",
          description: "Please select at least one allocation to confirm.",
          variant: "destructive"
        });
        return;
      }

      for (const allocation of completedAllocations) {
        if (allocation.type === 'expense') {
          await addTransaction({
            amount: -allocation.amount,
            category: allocation.category || 'Other',
            date: new Date().toISOString().split('T')[0],
            description: `Quick Allocation: ${allocation.name}`
          });
        } else if (allocation.type === 'goal' && allocation.goalId) {
          const targetGoal = goals.find(g => g.id === allocation.goalId);
          if (targetGoal) {
            await updateGoal(allocation.goalId, { 
              currentAmount: targetGoal.currentAmount + allocation.amount 
            });

            if (targetGoal.currentAmount + allocation.amount >= targetGoal.targetAmount) {
              toast({
                title: "🎉 Goal Completed!",
                description: `Congratulations! You've completed "${targetGoal.title}"!`,
              });
            }
          }
        }
      }

      toast({
        title: "Allocations Confirmed!",
        description: `Successfully processed ${completedAllocations.length} allocations totaling £${completedAllocations.reduce((sum, a) => sum + a.amount, 0)}.`,
      });

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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Quick Allocation Engine</h1>
            </div>
            <p className="text-lg text-gray-600">Smart money allocation based on your financial context</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Smart Allocation
              </TabsTrigger>
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Quick Percentages
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Scenarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smart" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Enter Today's Earnings</CardTitle>
                  <CardDescription>
                    Choose your allocation strategy and enter your earnings for smart suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Allocation Strategy</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {allocationStrategies.map((strategy) => (
                        <Card 
                          key={strategy.id}
                          className={`cursor-pointer transition-all ${
                            selectedStrategy === strategy.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedStrategy(strategy.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {strategy.icon}
                              <span className="font-medium">{strategy.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{strategy.description}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Buffer: {strategy.bufferRatio * 100}% • Goals: {strategy.goalRatio * 100}%
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

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

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Financial Context</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{getRealExpenses().length}</div>
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
            </TabsContent>

            <TabsContent value="quick" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Percentage Allocation</CardTitle>
                  <CardDescription>
                    Allocate a percentage of your earnings with one click.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="earnings-quick" className="text-lg font-medium">Earnings Amount (£)</Label>
                    <Input
                      id="earnings-quick"
                      type="number"
                      value={earnings || ''}
                      onChange={(e) => setEarnings(Number(e.target.value))}
                      className="text-2xl font-bold text-center h-16 mt-2"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[25, 50, 75, 100].map((percentage) => (
                      <Button
                        key={percentage}
                        variant="outline"
                        onClick={() => handleQuickPercentage(percentage)}
                        disabled={!earnings || earnings <= 0}
                        className="h-16 text-lg font-semibold"
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleQuickPercentage(100)}
                    disabled={!earnings || earnings <= 0}
                    className="w-full py-3 text-lg"
                    size="lg"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Allocate Full Amount
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Test Allocation Scenarios</CardTitle>
                  <CardDescription>
                    See how different income scenarios would affect your allocations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="earnings-scenarios" className="text-lg font-medium">Base Earnings Amount (£)</Label>
                    <Input
                      id="earnings-scenarios"
                      type="number"
                      value={earnings || ''}
                      onChange={(e) => setEarnings(Number(e.target.value))}
                      className="text-2xl font-bold text-center h-16 mt-2"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => testScenario('doubleIncome')}
                      disabled={!earnings || earnings <= 0}
                      className="h-16"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Double Income
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testScenario('halfIncome')}
                      disabled={!earnings || earnings <= 0}
                      className="h-16"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Half Income
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testScenario('emergency')}
                      disabled={!earnings || earnings <= 0}
                      className="h-16"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Emergency (-£100)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-emerald-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Allocation Plan</h1>
          <p className="text-lg text-gray-600">From £{earnings} earned today</p>
          {note && <p className="text-sm text-gray-500 mt-1">Note: {note}</p>}
          {allocations.some(a => a.isScenario) && (
            <Badge variant="secondary" className="mt-2">Scenario Preview</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      } ${item.isScenario ? 'border-dashed border-blue-300' : ''}`}
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
                            {item.progressImpact && (
                              <Badge variant="outline" className="text-xs">
                                +{item.progressImpact}% progress
                              </Badge>
                            )}
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
                        
                        {!item.isScenario && (
                          <Switch
                            checked={item.completed}
                            onCheckedChange={() => toggleAllocation(item.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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

            <Card>
              <CardContent className="p-4 space-y-3">
                {allocations.some(a => a.isScenario) ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAllocations([]);
                      setIsSubmitted(false);
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Earnings
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/goals')}
                  className="w-full justify-start"
                >
                  <Target className="w-4 h-4 mr-2" />
                  View All Goals
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/transactions')}
                  className="w-full justify-start"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  View Transactions
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
