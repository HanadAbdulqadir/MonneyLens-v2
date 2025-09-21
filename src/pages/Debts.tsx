import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Plus, CreditCard, Edit, Trash2, Calendar, DollarSign, TrendingDown, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Debts = () => {
  const { debts, addDebt, updateDebt, deleteDebt, addDebtPayment, currency } = useFinancial();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalAmount || !formData.remainingAmount || !formData.minimumPayment || !formData.dueDate || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const debtData = {
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: parseFloat(formData.remainingAmount),
      interestRate: parseFloat(formData.interestRate) || 0,
      minimumPayment: parseFloat(formData.minimumPayment),
      dueDate: formData.dueDate,
      category: formData.category,
      isActive: parseFloat(formData.remainingAmount) > 0
    };

    if (editingDebt) {
      updateDebt(editingDebt, debtData);
      toast({
        title: "Success",
        description: "Debt updated successfully"
      });
    } else {
      addDebt(debtData);
      toast({
        title: "Success",
        description: "Debt added successfully"
      });
    }

    setFormData({ name: '', totalAmount: '', remainingAmount: '', interestRate: '', minimumPayment: '', dueDate: '', category: '' });
    setIsOpen(false);
    setEditingDebt(null);
  };

  const handleEdit = (debt: any) => {
    setFormData({
      name: debt.name,
      totalAmount: debt.totalAmount.toString(),
      remainingAmount: debt.remainingAmount.toString(),
      interestRate: debt.interestRate.toString(),
      minimumPayment: debt.minimumPayment.toString(),
      dueDate: debt.dueDate,
      category: debt.category
    });
    setEditingDebt(debt.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDebt(id);
    toast({
      title: "Success",
      description: "Debt deleted successfully"
    });
  };

  const makePayment = (debtId: string, amount: number, type: 'minimum' | 'extra') => {
    const today = new Date().toISOString().split('T')[0];
    addDebtPayment(debtId, {
      amount,
      date: today,
      notes: `Payment of £${amount.toFixed(2)}`
    });
    
    toast({
      title: "Payment Recorded!",
      description: `£${amount.toFixed(2)} payment added to debt`
    });
  };

  const getProgress = (remaining: number, total: number) => {
    return Math.max(0, ((total - remaining) / total) * 100);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthsToPayoff = (remaining: number, monthlyPayment: number) => {
    if (monthlyPayment <= 0) return Infinity;
    return Math.ceil(remaining / monthlyPayment);
  };

  const getCircularProgress = (progress: number) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return { strokeDasharray, strokeDashoffset };
  };

  const activeDebts = debts.filter(d => d.remainingAmount > 0);
  const paidOffDebts = debts.filter(d => d.remainingAmount <= 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalOriginalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
          <p className="text-muted-foreground">Track your debts and progress toward financial freedom</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDebt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debt-name">Debt Name *</Label>
                  <Input
                    id="debt-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Credit Card, Student Loan"
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
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Student Loan">Student Loan</SelectItem>
                      <SelectItem value="Mortgage">Mortgage</SelectItem>
                      <SelectItem value="Car Loan">Car Loan</SelectItem>
                      <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                      <SelectItem value="Medical Debt">Medical Debt</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total-amount">Original Amount (£) *</Label>
                  <Input
                    id="total-amount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="remaining-amount">Current Balance (£) *</Label>
                  <Input
                    id="remaining-amount"
                    type="number"
                    step="0.01"
                    value={formData.remainingAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, remainingAmount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="minimum-payment">Minimum Payment (£) *</Label>
                  <Input
                    id="minimum-payment"
                    type="number"
                    step="0.01"
                    value={formData.minimumPayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="due-date">Next Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debt Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Debt</p>
              <p className="text-3xl font-bold">£{totalDebt.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-success/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Off</p>
              <p className="text-3xl font-bold text-success">£{totalPaidOff.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Debts</p>
              <p className="text-3xl font-bold">{activeDebts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-warning/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-full">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Min Payments</p>
              <p className="text-3xl font-bold text-warning">
                £{activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-destructive" />
            Active Debts
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {activeDebts.map((debt) => {
              const progress = getProgress(debt.remainingAmount, debt.totalAmount);
              const daysUntilDue = getDaysUntilDue(debt.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isUrgent = daysUntilDue < 7;
              const monthsToPayoff = getMonthsToPayoff(debt.remainingAmount, debt.minimumPayment);
              const { strokeDasharray, strokeDashoffset } = getCircularProgress(progress);
              
              return (
                <Card key={debt.id} className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  isOverdue ? 'border-destructive/50 bg-destructive/5' : 
                  isUrgent ? 'border-warning/50 bg-warning/5' : 
                  'border-border hover:border-destructive/30'
                }`}>
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{debt.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            Debt
                          </Badge>
                          {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                          {isUrgent && !isOverdue && <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">Due Soon</Badge>}
                          {debt.interestRate > 0 && <Badge variant="secondary" className="text-xs">{debt.interestRate}% APR</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(debt)} className="hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(debt.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="flex items-center gap-8">
                      {/* Circular Progress */}
                      <div className="relative">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="hsl(var(--muted))"
                            strokeWidth="6"
                            fill="none"
                            className="opacity-20"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="hsl(var(--success))"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-success">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Debt Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Remaining</span>
                          <span className="font-semibold text-lg text-destructive">£{(debt.remainingAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Original</span>
                          <span className="font-semibold text-lg">£{(debt.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Min Payment</span>
                          <span className="font-semibold text-lg">£{(debt.minimumPayment || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Insights */}
                    <Alert className={`${isOverdue ? 'border-destructive bg-destructive/5' : 
                                      isUrgent ? 'border-warning bg-warning/5' : 
                                      'border-primary/20 bg-primary/5'}`}>
                      <div className="flex items-center gap-2">
                        {isOverdue ? <AlertTriangle className="h-4 w-4 text-destructive" /> : 
                         isUrgent ? <Calendar className="h-4 w-4 text-warning" /> : 
                         <Zap className="h-4 w-4 text-primary" />}
                        <AlertDescription className="text-sm font-medium">
                          {isOverdue ? 
                            `Payment is ${Math.abs(daysUntilDue)} days overdue` :
                            `Due in ${daysUntilDue} days • ${monthsToPayoff === Infinity ? 'Never paid off at current rate' : `${monthsToPayoff} months to pay off`}`
                          }
                        </AlertDescription>
                      </div>
                    </Alert>

                    {/* Payment Progress Bar */}
                    <div className="space-y-2">
                      <Progress 
                        value={progress} 
                        className="h-3 transition-all duration-700 [&>div]:bg-success"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Paid: £{((debt.totalAmount || 0) - (debt.remainingAmount || 0)).toFixed(0)}</span>
                        <span>Remaining: £{(debt.remainingAmount || 0).toFixed(0)}</span>
                      </div>
                    </div>
                    
                    {/* Quick Payment Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Payment amount"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = parseFloat((e.target as HTMLInputElement).value);
                            if (amount > 0) {
                              makePayment(debt.id, amount, amount >= debt.minimumPayment ? 'extra' : 'minimum');
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentNode as HTMLElement).querySelector('input');
                          if (input) {
                            input.value = debt.minimumPayment.toString();
                            makePayment(debt.id, debt.minimumPayment, 'minimum');
                            input.value = '';
                          }
                        }}
                      >
                        Min
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentNode as HTMLElement).querySelector('input');
                          const amount = parseFloat(input?.value || '0');
                          if (amount > 0) {
                            makePayment(debt.id, amount, amount >= debt.minimumPayment ? 'extra' : 'minimum');
                            if (input) input.value = '';
                          }
                        }}
                        className="px-6"
                      >
                        Pay
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Off Debts */}
      {paidOffDebts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" />
            Paid Off Debts 🎉
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidOffDebts.map((debt) => (
              <Card key={debt.id} className="p-4 opacity-75 border-success bg-success/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{debt.name}</h3>
                    <Badge variant="secondary" className="mt-1 bg-success/20 text-success text-xs">
                      Paid Off
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(debt.id)} className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Original Amount</p>
                    <p className="text-lg font-bold">£{debt.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <Progress value={100} className="h-2 [&>div]:bg-success" />
                  
                  <div className="text-center">
                    <span className="text-xs font-medium text-success">🎉 Debt Free!</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <Card className="p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Debts Tracked</h3>
          <p className="text-muted-foreground mb-4">
            Add your debts to track payments and progress toward financial freedom!
          </p>
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Debt
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Debts;
