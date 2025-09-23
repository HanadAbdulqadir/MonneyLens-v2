import { useState } from 'react';
import { usePots } from '@/contexts/PotsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, PiggyBank, TrendingUp, Calendar, Bell, Settings, ArrowRightLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PotOnboardingWizard from '@/components/PotOnboardingWizard';
import CashflowCalendar from '@/components/CashflowCalendar';
import PotNotificationSystem from '@/components/PotNotificationSystem';
import QuickAddTransaction from '@/components/QuickAddTransaction';

export default function Pots() {
  const { pots, allocationRules, allocationTransactions, createPot, updatePot, deletePot, createAllocationRule, deleteAllocationRule, allocateIncome } = usePots();
  const [showOnboarding, setShowOnboarding] = useState(pots.length === 0);
  const [showCreatePot, setShowCreatePot] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [newPot, setNewPot] = useState({
    name: '',
    description: '',
    target_amount: 1000,
    color: 'blue-500',
    icon: 'piggy-bank'
  });
  const [newRule, setNewRule] = useState({
    pot_id: '',
    rule_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'custom',
    amount: 100,
    schedule: {},
    priority: 1,
    enabled: true
  });

  const handleCreatePot = async () => {
    try {
      await createPot({
        ...newPot,
        current_balance: 0,
        priority: pots.length + 1,
        allocation_rule: { type: 'manual' },
        auto_transfer_enabled: false
      });
      setShowCreatePot(false);
      setNewPot({
        name: '',
        description: '',
        target_amount: 1000,
        color: 'blue-500',
        icon: 'piggy-bank'
      });
      toast.success('Pot created successfully');
    } catch (error) {
      toast.error('Failed to create pot');
    }
  };

  const handleCreateRule = async () => {
    try {
      await createAllocationRule(newRule);
      setShowCreateRule(false);
      setNewRule({
        pot_id: '',
        rule_type: 'monthly',
        amount: 100,
        schedule: {},
        priority: 1,
        enabled: true
      });
      toast.success('Allocation rule created successfully');
    } catch (error) {
      toast.error('Failed to create allocation rule');
    }
  };

  const handleAllocateIncome = async () => {
    if (!incomeAmount) {
      toast.error('Please enter an amount');
      return;
    }

    try {
      await allocateIncome(parseFloat(incomeAmount));
      setIncomeAmount('');
      toast.success('Income allocated successfully');
    } catch (error) {
      toast.error('Failed to allocate income');
    }
  };

  const getProgressPercentage = (pot: any) => {
    if (pot.target_amount === 0) return 0;
    return Math.min((pot.current_balance / pot.target_amount) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalBalance = pots.reduce((sum, pot) => sum + pot.current_balance, 0);
  const totalTarget = pots.reduce((sum, pot) => sum + pot.target_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalBalance / totalTarget) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Pots</h1>
          <p className="text-muted-foreground">Organize your money into dedicated categories</p>
        </div>
        <div className="flex gap-2">
          <QuickAddTransaction />
          <Button onClick={() => setShowCreatePot(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Pot
          </Button>
        </div>
      </div>

      {/* Onboarding Wizard */}
      <PotOnboardingWizard 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pots</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pots.length}</div>
            <p className="text-xs text-muted-foreground">
              Active financial categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all pots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Badge variant="secondary">{overallProgress.toFixed(1)}%</Badge>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Towards total targets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pots" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Pots
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cashflow Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="allocation" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Allocation
          </TabsTrigger>
        </TabsList>

        {/* Pots Tab */}
        <TabsContent value="pots" className="space-y-4">
          {pots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first financial pot to organize your money.
                </p>
                <Button onClick={() => setShowOnboarding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up Pots
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pots.map((pot) => (
                <Card key={pot.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pot.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">£{pot.current_balance.toLocaleString()}</Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{pot.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(pot).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(pot)} 
                        className={cn("h-2", getProgressColor(getProgressPercentage(pot)))}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>£{pot.current_balance.toLocaleString()}</span>
                        <span>£{pot.target_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Add Funds
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Transfer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <CashflowCalendar />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <PotNotificationSystem />
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          {/* Quick Income Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Income Allocation</CardTitle>
              <CardDescription>
                Distribute income to your pots automatically based on allocation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="income-amount">Income Amount (£)</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAllocateIncome}>
                    Allocate Income
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Rules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Allocation Rules</CardTitle>
                <CardDescription>
                  Automated funding rules for your pots
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateRule(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </CardHeader>
            <CardContent>
              {allocationRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No allocation rules set up yet.</p>
                  <p className="text-sm">Create rules to automate your pot funding.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allocationRules.map((rule) => {
                    const pot = pots.find(p => p.id === rule.pot_id);
                    return (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {pot?.name || 'Unknown Pot'} - £{rule.amount} {rule.rule_type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Priority: {rule.priority} • {rule.enabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteAllocationRule(rule.id)}>
                          Delete
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pot Dialog */}
      <Dialog open={showCreatePot} onOpenChange={setShowCreatePot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pot</DialogTitle>
            <DialogDescription>
              Create a new financial pot to organize your money.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pot-name">Pot Name</Label>
              <Input
                id="pot-name"
                value={newPot.name}
                onChange={(e) => setNewPot({ ...newPot, name: e.target.value })}
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <Label htmlFor="pot-description">Description (Optional)</Label>
              <Textarea
                id="pot-description"
                value={newPot.description}
                onChange={(e) => setNewPot({ ...newPot, description: e.target.value })}
                placeholder="Describe what this pot is for"
              />
            </div>
            <div>
              <Label htmlFor="pot-target">Target Amount (£)</Label>
              <Input
                id="pot-target"
                type="number"
                value={newPot.target_amount}
                onChange={(e) => setNewPot({ ...newPot, target_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="pot-color">Color</Label>
              <Select value={newPot.color} onValueChange={(value) => setNewPot({ ...newPot, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue-500">Blue</SelectItem>
                  <SelectItem value="green-500">Green</SelectItem>
                  <SelectItem value="red-500">Red</SelectItem>
                  <SelectItem value="yellow-500">Yellow</SelectItem>
                  <SelectItem value="purple-500">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePot(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePot}>
              Create Pot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Allocation Rule</DialogTitle>
            <DialogDescription>
              Set up automated funding for your pots.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-pot">Pot</Label>
              <Select value={newRule.pot_id} onValueChange={(value) => setNewRule({ ...newRule, pot_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pot" />
                </SelectTrigger>
                <SelectContent>
                  {pots.map((pot) => (
                    <SelectItem key={pot.id} value={pot.id}>
                      {pot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rule-type">Frequency</Label>
              <Select value={newRule.rule_type} onValueChange={(value: any) => setNewRule({ ...newRule, rule_type: value })}>
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
              <Label htmlFor="rule-amount">Amount (£)</Label>
              <Input
                id="rule-amount"
                type="number"
                value={newRule.amount}
                onChange={(e) => setNewRule({ ...newRule, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="rule-priority">Priority</Label>
              <Input
                id="rule-priority"
                type="number"
                value={newRule.priority}
                onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRule(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
