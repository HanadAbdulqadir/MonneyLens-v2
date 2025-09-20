import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Plus, Target, Edit, Trash2, Calendar, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, currency } = useFinancial();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      category: formData.category,
      isCompleted: false
    };

    if (editingGoal) {
      updateGoal(editingGoal, goalData);
      toast({
        title: "Success",
        description: "Goal updated successfully"
      });
    } else {
      addGoal(goalData);
      toast({
        title: "Success",
        description: "Goal created successfully"
      });
    }

    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '', category: '' });
    setIsOpen(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: any) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category
    });
    setEditingGoal(goal.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    toast({
      title: "Success",
      description: "Goal deleted successfully"
    });
  };

  const addToGoal = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      const isCompleted = newAmount >= goal.targetAmount;
      updateGoal(goalId, { currentAmount: newAmount, isCompleted });
      
      if (isCompleted && !goal.isCompleted) {
        toast({
          title: "🎉 Goal Completed!",
          description: `Congratulations! You've reached your goal: ${goal.name}`
        });
      }
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyTarget = (current: number, target: number, deadline: string) => {
    const daysRemaining = getDaysRemaining(deadline);
    if (daysRemaining <= 0) return 0;
    
    const remaining = target - current;
    const monthsRemaining = daysRemaining / 30.44; // Average days per month
    return remaining / monthsRemaining;
  };

  const getPrediction = (current: number, target: number, deadline: string) => {
    const daysRemaining = getDaysRemaining(deadline);
    const remaining = target - current;
    const monthlyTarget = getMonthlyTarget(current, target, deadline);
    
    if (daysRemaining <= 0) return "Goal deadline has passed";
    if (remaining <= 0) return "Goal completed! 🎉";
    
    const monthsNeeded = Math.ceil(remaining / monthlyTarget);
    return `Save £${monthlyTarget.toFixed(2)}/month to reach goal`;
  };

  const getProgressColor = (progress: number, daysRemaining: number) => {
    if (progress >= 100) return "text-success";
    if (progress >= 75) return "text-success";
    if (progress >= 50) return "text-warning";
    if (daysRemaining < 30 && progress < 75) return "text-destructive";
    return "text-primary";
  };

  const getCircularProgress = (progress: number) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return { strokeDasharray, strokeDashoffset };
  };

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your savings targets</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="goal-name">Goal Name *</Label>
                <Input
                  id="goal-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Emergency Fund, New Car"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="target-amount">Target Amount ({currency}) *</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="current-amount">Current Amount ({currency})</Label>
                <Input
                  id="current-amount"
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats with Enhanced Design */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Active Goals</p>
              <p className="text-3xl font-bold">{activeGoals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-success/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-full">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
              <p className="text-3xl font-bold text-success">
                £{activeGoals.reduce((sum, g) => sum + g.currentAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Target</p>
              <p className="text-3xl font-bold">
                £{activeGoals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-warning/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-full">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-warning">{completedGoals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Goals with Enhanced Design */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Active Goals
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress = getProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isOverdue = daysRemaining < 0;
              const isUrgent = daysRemaining < 30 && progress < 75;
              const monthlyTarget = getMonthlyTarget(goal.currentAmount, goal.targetAmount, goal.deadline);
              const { strokeDasharray, strokeDashoffset } = getCircularProgress(progress);
              
              return (
                <Card key={goal.id} className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  isOverdue ? 'border-destructive/50 bg-destructive/5' : 
                  isUrgent ? 'border-warning/50 bg-warning/5' : 
                  'border-border hover:border-primary/30'
                }`}>
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{goal.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                          {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                          {isUrgent && !isOverdue && <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">Urgent</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)} className="hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="flex items-center gap-8">
                      {/* Circular Progress */}
                      <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="hsl(var(--muted))"
                            strokeWidth="8"
                            fill="none"
                            className="opacity-20"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={progress >= 100 ? "hsl(var(--success))" : 
                                   progress >= 75 ? "hsl(var(--success))" :
                                   progress >= 50 ? "hsl(var(--warning))" :
                                   isUrgent ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg font-bold ${getProgressColor(progress, daysRemaining)}`}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="font-semibold text-lg">£{goal.currentAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <span className="font-semibold text-lg">£{goal.targetAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Remaining</span>
                          <span className="font-semibold text-lg text-primary">
                            £{(goal.targetAmount - goal.currentAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Insights */}
                    <Alert className={`${isOverdue ? 'border-destructive bg-destructive/5' : 
                                      isUrgent ? 'border-warning bg-warning/5' : 
                                      'border-primary/20 bg-primary/5'}`}>
                      <div className="flex items-center gap-2">
                        {isOverdue ? <AlertTriangle className="h-4 w-4 text-destructive" /> : 
                         isUrgent ? <Clock className="h-4 w-4 text-warning" /> : 
                         <TrendingUp className="h-4 w-4 text-primary" />}
                        <AlertDescription className="text-sm font-medium">
                          {isOverdue ? 
                            `Goal is ${Math.abs(daysRemaining)} days overdue` :
                            `${daysRemaining} days left • ${getPrediction(goal.currentAmount, goal.targetAmount, goal.deadline)}`
                          }
                        </AlertDescription>
                      </div>
                    </Alert>

                    {/* Linear Progress Bar */}
                    <div className="space-y-2">
                      <Progress 
                        value={progress} 
                        className={`h-3 transition-all duration-700 ${
                          progress >= 100 ? '[&>div]:bg-success' :
                          progress >= 75 ? '[&>div]:bg-success' :
                          progress >= 50 ? '[&>div]:bg-warning' :
                          isUrgent ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'
                        }`}
                      />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Quick Add Amount */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Add £`}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = parseFloat((e.target as HTMLInputElement).value);
                            if (amount > 0) {
                              addToGoal(goal.id, amount);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentNode as HTMLElement).querySelector('input');
                          const amount = parseFloat(input?.value || '0');
                          if (amount > 0) {
                            addToGoal(goal.id, amount);
                            if (input) input.value = '';
                          }
                        }}
                        className="px-6"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Goals 🎉</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="p-6 opacity-75 border-success">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <Badge variant="secondary" className="mt-1 bg-success/20 text-success">
                      {goal.category} - Completed
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Achieved: {currency}{goal.currentAmount.toFixed(2)}</span>
                    <span>Target: {currency}{goal.targetAmount.toFixed(2)}</span>
                  </div>
                  
                  <Progress value={100} className="h-3" />
                  
                  <div className="text-center">
                    <span className="text-sm font-medium text-success">🎉 Goal Completed!</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
          <p className="text-muted-foreground mb-4">
            Set your first financial goal and start saving towards it!
          </p>
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Goal
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Goals;