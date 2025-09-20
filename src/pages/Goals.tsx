import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Plus, Target, Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <Target className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Active Goals</p>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Total Target</p>
              <p className="text-2xl font-bold">
                {currency}{activeGoals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress = getProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isOverdue = daysRemaining < 0;
              
              return (
                <Card key={goal.id} className="p-6 hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {goal.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {currency}{goal.currentAmount.toFixed(2)}</span>
                      <span>Target: {currency}{goal.targetAmount.toFixed(2)}</span>
                    </div>
                    
                    <Progress value={progress} className="h-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {progress.toFixed(1)}% complete
                      </span>
                      <span className={`text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Add ${currency}`}
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