import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Plus, RefreshCw, Edit, Trash2, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Recurring = () => {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, addTransaction, currency } = useFinancial();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    frequency: '',
    nextDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.amount || !formData.frequency || !formData.nextDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const recurringData = {
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency as 'weekly' | 'monthly' | 'yearly',
      nextDate: formData.nextDate,
      isActive: true
    };

    if (editingRecurring) {
      updateRecurringTransaction(editingRecurring, recurringData);
      toast({
        title: "Success",
        description: "Recurring transaction updated successfully"
      });
    } else {
      addRecurringTransaction(recurringData);
      toast({
        title: "Success",
        description: "Recurring transaction created successfully"
      });
    }

    setFormData({ name: '', category: '', amount: '', frequency: '', nextDate: '' });
    setIsOpen(false);
    setEditingRecurring(null);
  };

  const handleEdit = (recurring: any) => {
    setFormData({
      name: recurring.name,
      category: recurring.category,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      nextDate: recurring.nextDate
    });
    setEditingRecurring(recurring.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id);
    toast({
      title: "Success",
      description: "Recurring transaction deleted successfully"
    });
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive: !isActive });
    toast({
      title: "Success",
      description: `Recurring transaction ${!isActive ? 'activated' : 'paused'}`
    });
  };

  const executeRecurring = (recurring: any) => {
    // Add transaction for today
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      category: recurring.category,
      amount: recurring.amount,
      week: 'W4' // Default week
    });

    // Calculate next date
    const currentDate = new Date(recurring.nextDate);
    let nextDate = new Date(currentDate);
    
    switch (recurring.frequency) {
      case 'weekly':
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }

    updateRecurringTransaction(recurring.id, { 
      nextDate: nextDate.toISOString().split('T')[0] 
    });

    toast({
      title: "Success",
      description: `${recurring.name} transaction added and next date updated`
    });
  };

  const getNextDueDate = (nextDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false };
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  };

  const activeRecurring = recurringTransactions.filter(r => r.isActive);
  const inactiveRecurring = recurringTransactions.filter(r => !r.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Automate your regular income and expenses</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRecurring ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="recurring-name">Name *</Label>
                <Input
                  id="recurring-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Salary, Rent Payment"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="recurring-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Earnings">Earnings</SelectItem>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recurring-amount">Amount ({currency}) *</Label>
                <Input
                  id="recurring-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="recurring-frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recurring-next-date">Next Date *</Label>
                <Input
                  id="recurring-next-date"
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRecurring ? 'Update' : 'Create'}
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
            <RefreshCw className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Active Recurring</p>
              <p className="text-2xl font-bold">{activeRecurring.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-success font-bold">+</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-success">
                {currency}{activeRecurring
                  .filter(r => r.category === 'Earnings')
                  .reduce((sum, r) => {
                    const multiplier = r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
                    return sum + (r.amount * multiplier);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive font-bold">-</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-2xl font-bold text-destructive">
                {currency}{activeRecurring
                  .filter(r => r.category !== 'Earnings')
                  .reduce((sum, r) => {
                    const multiplier = r.frequency === 'weekly' ? 4.33 : r.frequency === 'yearly' ? 1/12 : 1;
                    return sum + (r.amount * multiplier);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Recurring Transactions */}
      {activeRecurring.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Recurring Transactions</h2>
          <div className="space-y-4">
            {activeRecurring.map((recurring) => {
              const dueInfo = getNextDueDate(recurring.nextDate);
              const isEarning = recurring.category === 'Earnings';
              
              return (
                <Card key={recurring.id} className="p-6 hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isEarning ? 'bg-success' : 'bg-destructive'}`} />
                        <div>
                          <h3 className="font-semibold">{recurring.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{recurring.category}</Badge>
                            <Badge variant="secondary">{recurring.frequency}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                          <p className={`font-semibold ${isEarning ? 'text-success' : 'text-destructive'}`}>
                            {isEarning ? '+' : '-'}{currency}{recurring.amount.toFixed(2)}
                          </p>
                          <p className={`text-sm ${dueInfo.isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {dueInfo.text}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeRecurring(recurring)}
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Execute
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(recurring.id, recurring.isActive)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(recurring)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(recurring.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Recurring Transactions */}
      {inactiveRecurring.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Paused Transactions</h2>
          <div className="space-y-4">
            {inactiveRecurring.map((recurring) => {
              const isEarning = recurring.category === 'Earnings';
              
              return (
                <Card key={recurring.id} className="p-6 opacity-60 border-dashed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{recurring.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{recurring.category}</Badge>
                            <Badge variant="secondary">{recurring.frequency}</Badge>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">Paused</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                          <p className="font-semibold text-muted-foreground">
                            {isEarning ? '+' : '-'}{currency}{recurring.amount.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(recurring.id, recurring.isActive)}
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Resume
                          </Button>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(recurring)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(recurring.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {recurringTransactions.length === 0 && (
        <Card className="p-12 text-center">
          <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recurring Transactions</h3>
          <p className="text-muted-foreground mb-4">
            Set up automatic tracking for regular income and expenses like salary, rent, or subscriptions.
          </p>
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Recurring Transaction
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Recurring;