import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { AlertTriangle, CheckCircle, TrendingUp, Calendar, Target, CreditCard, X } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  icon: React.ElementType;
}

const SmartNotifications = () => {
  const { transactions, goals, debts } = useFinancial();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const getNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Budget Notifications (placeholder for when budget system is integrated)
    const weeklySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= oneWeekAgo && t.category !== 'Earnings';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (weeklySpending > 500) {
      notifications.push({
        id: 'high-spending',
        type: 'warning',
        title: 'High Spending Alert',
        message: `You've spent £${weeklySpending.toFixed(2)} this week - 25% above your average`,
        action: 'View Budget',
        actionUrl: '/budget',
        icon: AlertTriangle
      });
    }

    // Goal Notifications
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const deadline = new Date(goal.deadline);
      const isNearDeadline = deadline <= oneWeekFromNow && deadline >= today;
      
      if (progress >= 100 && !goal.isCompleted) {
        notifications.push({
          id: `goal-complete-${goal.id}`,
          type: 'success',
          title: '🎉 Goal Achieved!',
          message: `Congratulations! You've reached your "${goal.name}" goal of £${goal.targetAmount}`,
          action: 'View Goals',
          actionUrl: '/goals',
          icon: CheckCircle
        });
      } else if (progress >= 75 && progress < 100) {
        notifications.push({
          id: `goal-progress-${goal.id}`,
          type: 'success',
          title: 'Great Progress!',
          message: `You're ${progress.toFixed(0)}% of the way to your "${goal.name}" goal`,
          action: 'View Goals',
          actionUrl: '/goals',
          icon: TrendingUp
        });
      } else if (isNearDeadline && progress < 75) {
        notifications.push({
          id: `goal-deadline-${goal.id}`,
          type: 'warning',
          title: 'Goal Deadline Approaching',
          message: `"${goal.name}" deadline is in ${Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days`,
          action: 'View Goals',
          actionUrl: '/goals',
          icon: Calendar
        });
      }
    });

    // Debt Notifications
    debts.forEach(debt => {
      if (debt.remainingAmount <= 0) return;
      
      const dueDate = new Date(debt.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 0) {
        notifications.push({
          id: `debt-overdue-${debt.id}`,
          type: 'danger',
          title: 'Payment Overdue!',
          message: `${debt.name} payment is ${Math.abs(daysUntilDue)} days overdue`,
          action: 'Make Payment',
          actionUrl: '/debts',
          icon: AlertTriangle
        });
      } else if (daysUntilDue <= 3) {
        notifications.push({
          id: `debt-due-soon-${debt.id}`,
          type: 'warning',
          title: 'Payment Due Soon',
          message: `${debt.name} payment of £${debt.minimumPayment} due in ${daysUntilDue} days`,
          action: 'View Debts',
          actionUrl: '/debts',
          icon: CreditCard
        });
      }
    });

    // Financial Milestone Notifications
    const totalBalance = transactions.reduce((sum, t) => {
      return t.category === 'Earnings' ? sum + t.amount : sum - t.amount;
    }, 755); // Starting balance

    if (totalBalance >= 1000 && !dismissedNotifications.includes('milestone-1000')) {
      notifications.push({
        id: 'milestone-1000',
        type: 'success',
        title: '🎉 Financial Milestone!',
        message: 'You\'ve reached £1,000 in your account - keep up the great work!',
        action: 'View Analytics',
        actionUrl: '/analytics',
        icon: Target
      });
    }

    // Filter out dismissed notifications
    return notifications.filter(n => !dismissedNotifications.includes(n.id));
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => [...prev, id]);
  };

  const notifications = getNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {notifications.slice(0, 3).map((notification) => {
        const Icon = notification.icon;
        
        return (
          <Alert
            key={notification.id}
            className={`relative transition-all duration-300 hover:shadow-md ${
              notification.type === 'success' ? 'border-success bg-success/5' :
              notification.type === 'warning' ? 'border-warning bg-warning/5' :
              notification.type === 'danger' ? 'border-destructive bg-destructive/5' :
              'border-primary bg-primary/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${
                notification.type === 'success' ? 'text-success' :
                notification.type === 'warning' ? 'text-warning' :
                notification.type === 'danger' ? 'text-destructive' :
                'text-primary'
              }`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          notification.type === 'success' ? 'border-success text-success' :
                          notification.type === 'warning' ? 'border-warning text-warning' :
                          notification.type === 'danger' ? 'border-destructive text-destructive' :
                          'border-primary text-primary'
                        }`}
                      >
                        {notification.type.toUpperCase()}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      {notification.message}
                    </AlertDescription>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {notification.action && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 ${
                        notification.type === 'success' ? 'border-success text-success hover:bg-success/10' :
                        notification.type === 'warning' ? 'border-warning text-warning hover:bg-warning/10' :
                        notification.type === 'danger' ? 'border-destructive text-destructive hover:bg-destructive/10' :
                        'border-primary text-primary hover:bg-primary/10'
                      }`}
                      onClick={() => {
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      {notification.action}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default SmartNotifications;