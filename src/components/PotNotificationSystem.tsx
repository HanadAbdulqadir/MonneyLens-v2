import { useState, useEffect } from 'react';
import { usePots } from '@/contexts/PotsContext';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, AlertTriangle, CheckCircle, Info, PiggyBank, TrendingUp } from 'lucide-react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PotNotificationSystemProps {
  className?: string;
}

interface PotNotification {
  id: string;
  type: 'low_balance' | 'target_reached' | 'allocation_due' | 'transfer_suggestion';
  potId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success';
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function PotNotificationSystem({ className }: PotNotificationSystemProps) {
  const { pots, allocationRules, allocationTransactions } = usePots();
  const { transactions } = useFinancial();
  const [notifications, setNotifications] = useState<PotNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    generateNotifications();
  }, [pots, allocationRules, allocationTransactions, transactions]);

  const generateNotifications = () => {
    const newNotifications: PotNotification[] = [];

    // Check for low balance pots
    pots.forEach(pot => {
      const targetPercentage = (pot.current_balance / pot.target_amount) * 100;
      
      if (targetPercentage < 20 && pot.current_balance > 0) {
        newNotifications.push({
          id: `low_balance_${pot.id}`,
          type: 'low_balance',
          potId: pot.id,
          title: 'Low Balance Alert',
          message: `${pot.name} is at ${targetPercentage.toFixed(1)}% of its target. Consider adding funds.`,
          severity: 'warning',
          timestamp: new Date(),
          action: {
            label: 'Add Funds',
            onClick: () => handleAddFunds(pot.id)
          }
        });
      }

      // Check for target reached
      if (pot.current_balance >= pot.target_amount && pot.target_amount > 0) {
        newNotifications.push({
          id: `target_reached_${pot.id}`,
          type: 'target_reached',
          potId: pot.id,
          title: 'Target Reached!',
          message: `${pot.name} has reached its target of £${pot.target_amount.toLocaleString()}.`,
          severity: 'success',
          timestamp: new Date(),
          action: {
            label: 'View Pot',
            onClick: () => handleViewPot(pot.id)
          }
        });
      }
    });

    // Check for upcoming allocations
    const today = new Date();
    allocationRules.forEach(rule => {
      if (!rule.enabled) return;

      const lastAllocation = allocationTransactions
        .filter(t => t.rule_id === rule.id)
        .sort((a, b) => new Date(b.allocation_date).getTime() - new Date(a.allocation_date).getTime())[0];

      let nextAllocationDate: Date | null = null;

      if (lastAllocation) {
        const lastDate = new Date(lastAllocation.allocation_date);
        
        switch (rule.rule_type) {
          case 'daily':
            nextAllocationDate = addDays(lastDate, 1);
            break;
          case 'weekly':
            nextAllocationDate = addDays(lastDate, 7);
            break;
          case 'monthly':
            nextAllocationDate = addDays(lastDate, 30);
            break;
        }
      }

      if (nextAllocationDate && isAfter(today, nextAllocationDate)) {
        const pot = pots.find(p => p.id === rule.pot_id);
        if (pot) {
          newNotifications.push({
            id: `allocation_due_${rule.id}`,
            type: 'allocation_due',
            potId: pot.id,
            title: 'Allocation Due',
            message: `Allocation of £${rule.amount} to ${pot.name} is overdue.`,
            severity: 'warning',
            timestamp: new Date(),
            action: {
              label: 'Run Allocation',
              onClick: () => handleRunAllocation(rule.id)
            }
          });
        }
      }
    });

    // Generate transfer suggestions based on transaction patterns
    const recentTransactions = transactions.slice(0, 30); // Last 30 transactions
    const categorySpending: Record<string, number> = {};

    recentTransactions.forEach(transaction => {
      if (transaction.amount < 0) {
        categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + Math.abs(transaction.amount);
      }
    });

    // Find pots that match spending categories
    pots.forEach(pot => {
      const potNameLower = pot.name.toLowerCase();
      Object.entries(categorySpending).forEach(([category, amount]) => {
        const categoryLower = category.toLowerCase();
        
        // Simple matching logic - could be enhanced with AI
        if (potNameLower.includes(categoryLower) || categoryLower.includes(potNameLower)) {
          if (amount > pot.current_balance * 0.5) { // If spending is more than 50% of pot balance
            newNotifications.push({
              id: `transfer_suggestion_${pot.id}_${category}`,
              type: 'transfer_suggestion',
              potId: pot.id,
              title: 'Transfer Suggestion',
              message: `Consider adding funds to ${pot.name}. Recent ${category} spending: £${amount.toLocaleString()}.`,
              severity: 'info',
              timestamp: new Date(),
              action: {
                label: 'Transfer Funds',
                onClick: () => handleTransferToPot(pot.id)
              }
            });
          }
        }
      });
    });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.length);
  };

  const handleAddFunds = (potId: string) => {
    // This would open a transfer modal in a real implementation
    toast.info(`Add funds to pot ${potId}`);
  };

  const handleViewPot = (potId: string) => {
    // This would navigate to the pot details in a real implementation
    toast.info(`Viewing pot ${potId}`);
  };

  const handleRunAllocation = (ruleId: string) => {
    // This would trigger the allocation rule in a real implementation
    toast.info(`Running allocation rule ${ruleId}`);
  };

  const handleTransferToPot = (potId: string) => {
    // This would open a transfer modal in a real implementation
    toast.info(`Transfer to pot ${potId}`);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getSeverityIcon = (severity: PotNotification['severity']) => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: PotNotification['severity']) => {
    switch (severity) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pot Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Alerts and suggestions for your financial pots
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications at the moment.</p>
            <p className="text-sm">Your pots are looking good!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map(notification => {
              const pot = pots.find(p => p.id === notification.potId);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "border rounded-lg p-3 transition-all duration-200",
                    getSeverityColor(notification.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {pot && (
                            <Badge variant="outline" className="text-xs">
                              {pot.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {format(notification.timestamp, 'MMM d, HH:mm')}
                          </span>
                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={notification.action.onClick}
                              className="text-xs h-7"
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      ×
                    </Button>
                  </div>

                  {/* Progress bar for low balance notifications */}
                  {notification.type === 'low_balance' && pot && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Current: £{pot.current_balance.toLocaleString()}</span>
                        <span>Target: £{pot.target_amount.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(pot.current_balance / pot.target_amount) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary statistics */}
        {pots.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">{pots.length}</div>
                <div className="text-muted-foreground">Total Pots</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">
                  £{pots.reduce((sum, pot) => sum + pot.current_balance, 0).toLocaleString()}
                </div>
                <div className="text-muted-foreground">Total Balance</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
