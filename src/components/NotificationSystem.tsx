import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { usePots } from "@/contexts/PotsContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Calendar,
  Settings,
  X,
  CheckCircle,
  Info,
  DollarSign,
  PiggyBank
} from "lucide-react";

interface Notification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'spending_spike' | 'goal_progress' | 'goal_reminder' | 'action_required' | 'weekly_summary' | 'system_alert' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  category?: string;
  amount?: number;
  goalId?: string;
  actionType?: 'earn_money' | 'complete_step' | 'review_budget' | 'update_transactions';
  pushEnabled: boolean;
}

interface NotificationSettings {
  budgetWarnings: boolean;
  budgetExceeded: boolean;
  spendingSpikes: boolean;
  goalUpdates: boolean;
  weeklySummary: boolean;
  soundEnabled: boolean;
  warningThreshold: number; // percentage of budget
}

const NotificationSystem = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetWarnings: true,
    budgetExceeded: true,
    spendingSpikes: true,
    goalUpdates: false,
    weeklySummary: true,
    soundEnabled: true,
    warningThreshold: 80
  });

  // Default budgets for demonstration
  const budgets = {
    Food: 400,
    Petrol: 200,
    Other: 300
  };

  // Calculate spending for each category this month
  const getMonthlySpending = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(t => 
      new Date(t.date) >= monthStart && t.amount < 0
    );

    return {
      Food: monthlyTransactions.filter(t => t.category === 'Food').reduce((sum, t) => sum + Math.abs(t.amount), 0),
      Petrol: monthlyTransactions.filter(t => t.category === 'Petrol').reduce((sum, t) => sum + Math.abs(t.amount), 0),
      Other: monthlyTransactions.filter(t => t.category === 'Other').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    };
  };

  // Generate notifications based on current data
  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const spending = getMonthlySpending();

    // Check budget warnings
    Object.entries(budgets).forEach(([category, budget]) => {
      const spent = spending[category as keyof typeof spending];
      const percentage = (spent / budget) * 100;

      if (settings.budgetExceeded && percentage >= 100) {
        newNotifications.push({
          id: `budget-exceeded-${category}`,
          type: 'budget_exceeded',
          title: `${category} Budget Exceeded!`,
          message: `You've spent £${spent.toFixed(2)} of your £${budget} ${category.toLowerCase()} budget (${percentage.toFixed(0)}%)`,
          severity: 'high',
          timestamp: new Date(),
          isRead: false,
          actionable: true,
          category,
          amount: spent - budget,
          pushEnabled: true
        });
      } else if (settings.budgetWarnings && percentage >= settings.warningThreshold) {
        newNotifications.push({
          id: `budget-warning-${category}`,
          type: 'budget_warning',
          title: `${category} Budget Warning`,
          message: `You've used ${percentage.toFixed(0)}% of your ${category.toLowerCase()} budget (£${spent.toFixed(2)}/£${budget})`,
          severity: 'medium',
          timestamp: new Date(),
          isRead: false,
          actionable: true,
          category,
          amount: spent,
          pushEnabled: true
        });
      }
    });

    // Check for spending spikes
    if (settings.spendingSpikes) {
      const lastWeekSpending = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transactionDate >= weekAgo && t.amount < 0;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const averageWeeklySpending = 200; // This would be calculated from historical data
      
      if (lastWeekSpending > averageWeeklySpending * 1.5) {
        newNotifications.push({
          id: 'spending-spike',
          type: 'spending_spike',
          title: 'Unusual Spending Detected',
          message: `Your spending this week (£${lastWeekSpending.toFixed(2)}) is 50% higher than usual`,
          severity: 'medium',
          timestamp: new Date(),
          isRead: false,
          actionable: true,
          amount: lastWeekSpending - averageWeeklySpending,
          pushEnabled: true
        });
      }
    }

    // Weekly summary
    if (settings.weeklySummary) {
      const today = new Date();
      if (today.getDay() === 1) { // Monday
        const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        newNotifications.push({
          id: 'weekly-summary',
          type: 'weekly_summary',
          title: 'Weekly Financial Summary',
          message: `Last week: £${totalIncome.toFixed(2)} income, £${totalExpenses.toFixed(2)} expenses`,
          severity: 'low',
          timestamp: new Date(),
          isRead: false,
          actionable: false,
          pushEnabled: true
        });
      }
    }

    return newNotifications;
  };

  // Check for notifications periodically
  useEffect(() => {
    const checkNotifications = () => {
      const newNotifications = generateNotifications();
      
      // Filter out notifications we already have
      const existingIds = notifications.map(n => n.id);
      const genuinelyNew = newNotifications.filter(n => !existingIds.includes(n.id));
      
      if (genuinelyNew.length > 0) {
        setNotifications(prev => [...genuinelyNew, ...prev].slice(0, 20)); // Keep only latest 20
        
        // Show toast for high severity notifications
        genuinelyNew.forEach(notification => {
          if (notification.severity === 'high') {
            toast({
              title: notification.title,
              description: notification.message,
              variant: "destructive"
            });
          }
        });
      }
    };

    checkNotifications();
    
    // Check every hour
    const interval = setInterval(checkNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [transactions, settings, notifications]);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'spending_spike':
        return <TrendingUp className="h-4 w-4" />;
      case 'goal_progress':
        return <Target className="h-4 w-4" />;
      case 'weekly_summary':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Notification Bell */}
      <Dialog open={showPanel} onOpenChange={setShowPanel}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} unread</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Notification Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Budget Warnings</Label>
                        <Switch
                          checked={settings.budgetWarnings}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, budgetWarnings: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Budget Exceeded Alerts</Label>
                        <Switch
                          checked={settings.budgetExceeded}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, budgetExceeded: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Spending Spike Alerts</Label>
                        <Switch
                          checked={settings.spendingSpikes}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, spendingSpikes: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Weekly Summary</Label>
                        <Switch
                          checked={settings.weeklySummary}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, weeklySummary: checked }))
                          }
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">We'll notify you about budget alerts and spending insights</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`p-4 ${notification.isRead ? 'opacity-75' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-full ${getSeverityColor(notification.severity)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {notification.timestamp.toLocaleDateString()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.actionable && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                          {notification.category && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                markAsRead(notification.id);
                                setShowPanel(false);
                                // Navigate to budget page - this would need router integration
                              }}
                            >
                              View Budget
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationSystem;
