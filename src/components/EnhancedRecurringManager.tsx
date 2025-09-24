import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Copy,
  Star,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths, addYears, differenceInDays, isAfter, isBefore } from "date-fns";

interface RecurringTemplate {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isPopular: boolean;
}

const recurringTemplates: RecurringTemplate[] = [
  { id: '1', name: 'Monthly Salary', category: 'Earnings', amount: 3500, frequency: 'monthly', isPopular: true },
  { id: '2', name: 'Rent Payment', category: 'Other', amount: 1200, frequency: 'monthly', isPopular: true },
  { id: '3', name: 'Weekly Groceries', category: 'Food', amount: 80, frequency: 'weekly', isPopular: true },
  { id: '4', name: 'Daily Coffee', category: 'Food', amount: 4.5, frequency: 'daily', isPopular: false },
  { id: '5', name: 'Car Insurance', category: 'Other', amount: 120, frequency: 'monthly', isPopular: false },
  { id: '6', name: 'Netflix Subscription', category: 'Other', amount: 15.99, frequency: 'monthly', isPopular: false },
];

const EnhancedRecurringManager = () => {
  const { 
    recurringTransactions, 
    addRecurringTransaction, 
    updateRecurringTransaction, 
    deleteRecurringTransaction,
    addTransaction,
    currency 
  } = useFinancial();
  
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'overdue'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'nextDate' | 'frequency'>('nextDate');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    frequency: '',
    nextDate: '',
    endDate: '',
    maxOccurrences: '',
    notes: ''
  });

  // Enhanced analytics for recurring transactions
  const analytics = useMemo(() => {
    const active = recurringTransactions.filter(r => r.isActive);
    const paused = recurringTransactions.filter(r => !r.isActive);
    
    const overdue = active.filter(r => {
      const nextDate = new Date(r.nextDate);
      return isBefore(nextDate, new Date());
    });

    const monthlyIncome = active
      .filter(r => r.category === 'Earnings')
      .reduce((sum, r) => {
        const multiplier = r.frequency === 'daily' ? 30.44 : 
                          r.frequency === 'weekly' ? 4.33 : 
                          r.frequency === 'yearly' ? 1/12 : 1;
        return sum + (r.amount * multiplier);
      }, 0);

    const monthlyExpenses = active
      .filter(r => r.category !== 'Earnings')
      .reduce((sum, r) => {
        const multiplier = r.frequency === 'daily' ? 30.44 : 
                          r.frequency === 'weekly' ? 4.33 : 
                          r.frequency === 'yearly' ? 1/12 : 1;
        return sum + (r.amount * multiplier);
      }, 0);

    const upcomingWeek = active.filter(r => {
      const nextDate = new Date(r.nextDate);
      const weekFromNow = addDays(new Date(), 7);
      return isAfter(nextDate, new Date()) && isBefore(nextDate, weekFromNow);
    });

    return {
      total: recurringTransactions.length,
      active: active.length,
      paused: paused.length,
      overdue: overdue.length,
      monthlyIncome,
      monthlyExpenses,
      netMonthly: monthlyIncome - monthlyExpenses,
      upcomingWeek: upcomingWeek.length
    };
  }, [recurringTransactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = recurringTransactions;

    // Apply status filter
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(r => r.isActive);
        break;
      case 'paused':
        filtered = filtered.filter(r => !r.isActive);
        break;
      case 'overdue':
        filtered = filtered.filter(r => r.isActive && isBefore(new Date(r.nextDate), new Date()));
        break;
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'amount':
          return b.amount - a.amount;
        case 'nextDate':
          return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
        case 'frequency':
          return a.frequency.localeCompare(b.frequency);
        default:
          return 0;
      }
    });
  }, [recurringTransactions, filterStatus, filterCategory, sortBy]);

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
      frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
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

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      amount: '',
      frequency: '',
      nextDate: '',
      endDate: '',
      maxOccurrences: '',
      notes: ''
    });
    setIsCreateOpen(false);
    setEditingRecurring(null);
  };

  const handleEdit = (recurring: any) => {
    setFormData({
      name: recurring.name,
      category: recurring.category,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      nextDate: recurring.nextDate,
      endDate: '',
      maxOccurrences: '',
      notes: ''
    });
    setEditingRecurring(recurring.id);
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id);
    toast({
      title: "Success",
      description: "Recurring transaction deleted successfully"
    });
  };

  const handleDuplicate = (recurring: any) => {
    setFormData({
      name: `${recurring.name} (Copy)`,
      category: recurring.category,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      nextDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      maxOccurrences: '',
      notes: ''
    });
    setEditingRecurring(null);
    setIsCreateOpen(true);
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive: !isActive });
    toast({
      title: "Success",
      description: `Transaction ${!isActive ? 'activated' : 'paused'}`
    });
  };

  const executeRecurring = (recurring: any) => {
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      category: recurring.category,
      amount: recurring.amount,
      week: 'W4'
    });

    // Calculate next date
    const currentDate = new Date(recurring.nextDate);
    let nextDate: Date;
    
    switch (recurring.frequency) {
      case 'daily':
        nextDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(currentDate, 1);
        break;
      default:
        nextDate = addDays(currentDate, 1);
    }

    updateRecurringTransaction(recurring.id, { 
      nextDate: format(nextDate, 'yyyy-MM-dd')
    });

    toast({
      title: "Success",
      description: `${recurring.name} executed and next date updated`
    });
  };

  const handleBulkAction = (action: 'activate' | 'pause' | 'delete') => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select items to perform bulk action",
        variant: "destructive"
      });
      return;
    }

    selectedItems.forEach(id => {
      switch (action) {
        case 'activate':
          updateRecurringTransaction(id, { isActive: true });
          break;
        case 'pause':
          updateRecurringTransaction(id, { isActive: false });
          break;
        case 'delete':
          deleteRecurringTransaction(id);
          break;
      }
    });

    setSelectedItems([]);
    setIsBulkOpen(false);
    
    toast({
      title: "Success",
      description: `Bulk ${action} completed for ${selectedItems.length} items`
    });
  };

  const useTemplate = (template: RecurringTemplate) => {
    setFormData({
      name: template.name,
      category: template.category,
      amount: template.amount.toString(),
      frequency: template.frequency,
      nextDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      maxOccurrences: '',
      notes: ''
    });
    setEditingRecurring(null);
    setIsCreateOpen(true);
  };

  const getStatusColor = (recurring: any) => {
    if (!recurring.isActive) return 'muted';
    
    const nextDate = new Date(recurring.nextDate);
    const daysUntil = differenceInDays(nextDate, new Date());
    
    if (daysUntil < 0) return 'destructive';
    if (daysUntil === 0) return 'warning';
    return 'success';
  };

  const getStatusText = (recurring: any) => {
    if (!recurring.isActive) return 'Paused';
    
    const nextDate = new Date(recurring.nextDate);
    const daysUntil = differenceInDays(nextDate, new Date());
    
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Header */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Active</p>
              <p className="text-xl font-bold">{analytics.active}</p>
              {analytics.overdue > 0 && (
                <p className="text-xs opacity-80">{analytics.overdue} overdue</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-success text-success-foreground">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Monthly Income</p>
              <p className="text-xl font-bold">{currency}{analytics.monthlyIncome.toFixed(0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-xl font-bold text-destructive">{currency}{analytics.monthlyExpenses.toFixed(0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Net Monthly</p>
              <p className={`text-xl font-bold ${analytics.netMonthly >= 0 ? 'text-success' : 'text-destructive'}`}>
                {analytics.netMonthly >= 0 ? '+' : ''}{currency}{analytics.netMonthly.toFixed(0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({analytics.total})</SelectItem>
              <SelectItem value="active">Active ({analytics.active})</SelectItem>
              <SelectItem value="paused">Paused ({analytics.paused})</SelectItem>
              <SelectItem value="overdue">Overdue ({analytics.overdue})</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={filterCategory || 'all'} onValueChange={(value) => setFilterCategory(value === 'all' ? null : value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Earnings">Earnings</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextDate">Due Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="frequency">Frequency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <Popover open={isBulkOpen} onOpenChange={setIsBulkOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Bulk ({selectedItems.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Activate All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('pause')}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause All
                  </Button>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRecurring ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Manual Entry</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="form" className="space-y-4 mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Monthly Salary"
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
                            <SelectItem value="Earnings">Earnings</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount ({currency}) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="frequency">Frequency *</Label>
                        <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nextDate">Next Date *</Label>
                      <Input
                        id="nextDate"
                        type="date"
                        value={formData.nextDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRecurring ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="templates" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Popular Templates</span>
                    </div>
                    
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {recurringTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => useTemplate(template)}
                          >
                            <div className="flex items-center gap-3">
                              {template.isPopular && <Star className="h-4 w-4 text-warning" />}
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{template.category}</Badge>
                                  <Badge variant="secondary">{template.frequency}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{currency}{template.amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Recurring Transactions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first recurring transaction to automate your finances
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Transaction
            </Button>
          </Card>
        ) : (
          filteredTransactions.map((recurring) => {
            const statusColor = getStatusColor(recurring);
            const statusText = getStatusText(recurring);
            const isSelected = selectedItems.includes(recurring.id);
            
            return (
              <Card key={recurring.id} className={`p-4 transition-all duration-200 hover:shadow-card-hover ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, recurring.id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== recurring.id));
                        }
                      }}
                      className="rounded"
                    />
                    
                    <div className={`w-3 h-3 rounded-full ${
                      recurring.category === 'Earnings' ? 'bg-success' :
                      recurring.category === 'Food' ? 'bg-orange-500' :
                      recurring.category === 'Petrol' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    
                    <div>
                      <h3 className="font-semibold">{recurring.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{recurring.category}</Badge>
                        <Badge variant="secondary">{recurring.frequency}</Badge>
                        <Badge variant={statusColor === 'destructive' ? 'destructive' : 'outline'}>
                          {statusText}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className={`font-semibold font-mono ${
                        recurring.category === 'Earnings' ? 'text-success' : 'text-destructive'
                      }`}>
                        {recurring.category === 'Earnings' ? '+' : '-'}{currency}{recurring.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Next: {format(new Date(recurring.nextDate), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {recurring.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executeRecurring(recurring)}
                          className="h-8 px-2"
                        >
                          <Zap className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(recurring.id, recurring.isActive)}
                        className="h-8 px-2"
                      >
                        {recurring.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(recurring)}
                        className="h-8 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recurring)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recurring.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedRecurringManager;