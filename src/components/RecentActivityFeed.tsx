import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancial } from "@/contexts/FinancialContext";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  CreditCard, 
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";

interface ActivityItem {
  id: string;
  type: 'transaction' | 'goal' | 'debt' | 'milestone';
  title: string;
  description: string;
  amount?: number;
  date: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const RecentActivityFeed = () => {
  const { transactions, goals, debts } = useFinancial();
  const [showAll, setShowAll] = useState(false);

  const getRecentActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent transactions
    transactions
      .filter(t => new Date(t.date) >= sevenDaysAgo)
      .slice(0, 15)
      .forEach(transaction => {
        activities.push({
          id: `transaction-${transaction.dailyEntryId}`,
          type: 'transaction',
          title: transaction.category === 'Earnings' ? 'Income Received' : `${transaction.category} Purchase`,
          description: `£${transaction.amount.toFixed(2)} ${transaction.category === 'Earnings' ? 'earned' : 'spent'}`,
          amount: transaction.amount,
          date: transaction.date,
          icon: transaction.category === 'Earnings' ? ArrowUpRight : ArrowDownRight,
          color: transaction.category === 'Earnings' ? 'text-success' : 'text-destructive',
          bgColor: transaction.category === 'Earnings' ? 'bg-success/10' : 'bg-destructive/10'
        });
      });

    // Goal milestones
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      
      // Simulate milestone achievements (in real app, these would be tracked)
      if (progress >= 25 && progress < 30) {
        activities.push({
          id: `goal-milestone-${goal.id}-25`,
          type: 'goal',
          title: 'Goal Milestone Reached',
          description: `25% progress on "${goal.name}"`,
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          icon: Target,
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        });
      }
      
      if (progress >= 50 && progress < 55) {
        activities.push({
          id: `goal-milestone-${goal.id}-50`,
          type: 'goal',
          title: 'Halfway There!',
          description: `50% progress on "${goal.name}"`,
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          icon: Target,
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        });
      }

      if (goal.isCompleted) {
        activities.push({
          id: `goal-completed-${goal.id}`,
          type: 'goal',
          title: 'Goal Completed! 🎉',
          description: `"${goal.name}" achieved`,
          amount: goal.targetAmount,
          date: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          icon: Target,
          color: 'text-success',
          bgColor: 'bg-success/10'
        });
      }
    });

    // Debt payments (simulated recent payments)
    debts.forEach(debt => {
      if (debt.payments && debt.payments.length > 0) {
        debt.payments
          .filter(payment => new Date(payment.date) >= sevenDaysAgo)
          .forEach(payment => {
            activities.push({
              id: `debt-payment-${debt.id}-${payment.id}`,
              type: 'debt',
              title: payment.type === 'minimum' ? 'Minimum Payment Made' : 'Extra Payment Made',
              description: `£${payment.amount.toFixed(2)} paid toward ${debt.name}`,
              amount: payment.amount,
              date: payment.date,
              icon: CreditCard,
              color: 'text-warning',
              bgColor: 'bg-warning/10'
            });
          });
      }
    });

    // Financial milestones
    const totalBalance = transactions.reduce((sum, t) => {
      return t.category === 'Earnings' ? sum + t.amount : sum - t.amount;
    }, 755);

    if (totalBalance >= 1000) {
      activities.push({
        id: 'milestone-1000',
        type: 'milestone',
        title: 'Financial Milestone!',
        description: 'Reached £1,000 in account balance',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        icon: Target,
        color: 'text-success',
        bgColor: 'bg-success/10'
      });
    }

    // Sort by date (most recent first)
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, showAll ? activities.length : 6);
  };

  const activities = getRecentActivities();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Recent Activity</h3>
        <Badge variant="outline" className="text-xs">
          Last 7 Days
        </Badge>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {activity.amount && (
                      <p className={`font-semibold text-sm ${activity.color}`}>
                        {activity.type === 'transaction' && activity.title.includes('Income') ? '+' : 
                         activity.type === 'transaction' ? '-' : ''}
                        £{activity.amount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && activities.length >= 6 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="text-xs"
          >
            <MoreHorizontal className="h-3 w-3 mr-1" />
            Show More Activities
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecentActivityFeed;