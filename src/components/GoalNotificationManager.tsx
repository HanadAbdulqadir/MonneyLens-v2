import React, { useState, useEffect } from 'react';
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { useToast } from "@/hooks/use-toast";

interface GoalNotification {
  id: string;
  type: 'goal_reminder' | 'action_required' | 'goal_progress';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  goalId?: string;
  actionType?: 'earn_money' | 'complete_step' | 'review_budget' | 'update_transactions';
  pushEnabled: boolean;
}

const GoalNotificationManager = () => {
  const { goals, transactions } = useFinancial();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);

  // Check goal progress and generate notifications
  const checkGoalProgress = () => {
    const newNotifications: GoalNotification[] = [];
    const now = new Date();

    goals.forEach(goal => {
      const goalProgress = goal.currentAmount / goal.targetAmount;
      const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Goal completion reminder (7 days before deadline)
      if (daysRemaining <= 7 && goalProgress < 1) {
        const amountNeeded = goal.targetAmount - goal.currentAmount;
        newNotifications.push({
          id: `goal-reminder-${goal.id}`,
          type: 'goal_reminder',
          title: `Goal Deadline Approaching: ${goal.name}`,
          message: `Only ${daysRemaining} days left! You need £${amountNeeded.toFixed(2)} more to reach your goal.`,
          severity: 'high',
          timestamp: new Date(),
          isRead: false,
          actionable: true,
          goalId: goal.id,
          actionType: 'earn_money',
          pushEnabled: true
        });
      }

      // Weekly progress check (every Monday)
      if (now.getDay() === 1 && goalProgress < 0.5) {
        newNotifications.push({
          id: `goal-progress-${goal.id}-${now.toISOString().split('T')[0]}`,
          type: 'goal_progress',
          title: `Goal Progress Update: ${goal.name}`,
          message: `You're ${(goalProgress * 100).toFixed(0)}% towards your goal. Keep going!`,
          severity: 'medium',
          timestamp: new Date(),
          isRead: false,
          actionable: false,
          goalId: goal.id,
          pushEnabled: true
        });
      }

      // Action required if progress is too slow
      if (daysRemaining > 0 && goalProgress < (daysRemaining / 30) * 0.3) {
        newNotifications.push({
          id: `goal-action-${goal.id}`,
          type: 'action_required',
          title: `Action Required: ${goal.name}`,
          message: `Your progress is behind schedule. Consider adjusting your savings plan.`,
          severity: 'high',
          timestamp: new Date(),
          isRead: false,
          actionable: true,
          goalId: goal.id,
          actionType: 'review_budget',
          pushEnabled: true
        });
      }
    });

    return newNotifications;
  };

  // Check for incomplete setup actions
  const checkSetupActions = () => {
    const newNotifications: GoalNotification[] = [];
    
    // Check if user has set up any goals
    if (goals.length === 0) {
      newNotifications.push({
        id: 'setup-goals',
        type: 'action_required',
        title: 'Set Up Your First Goal',
        message: 'Create financial goals to track your progress and stay motivated.',
        severity: 'medium',
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        actionType: 'complete_step',
        pushEnabled: true
      });
    }

    // Check if user has recent transactions
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transactionDate >= weekAgo;
    });

    if (recentTransactions.length === 0) {
      newNotifications.push({
        id: 'update-transactions',
        type: 'action_required',
        title: 'Update Your Transactions',
        message: 'Add your recent transactions to get accurate financial insights.',
        severity: 'medium',
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        actionType: 'update_transactions',
        pushEnabled: true
      });
    }

    return newNotifications;
  };

  // Generate all goal-related notifications
  const generateGoalNotifications = () => {
    const goalNotifications = checkGoalProgress();
    const setupNotifications = checkSetupActions();
    return [...goalNotifications, ...setupNotifications];
  };

  // Check for notifications periodically
  useEffect(() => {
    const checkNotifications = () => {
      const newNotifications = generateGoalNotifications();
      
      // Filter out notifications we already have
      const existingIds = notifications.map(n => n.id);
      const genuinelyNew = newNotifications.filter(n => !existingIds.includes(n.id));
      
      if (genuinelyNew.length > 0) {
        setNotifications(prev => [...genuinelyNew, ...prev].slice(0, 10)); // Keep only latest 10
        
        // Show push notifications for high severity notifications
        genuinelyNew.forEach(notification => {
          if (notification.pushEnabled && notification.severity === 'high') {
            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id
              });
            }
            
            // Show toast notification
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.severity === 'high' ? 'destructive' : 'default'
            });
          }
        });
      }
    };

    checkNotifications();
    
    // Check every 6 hours for goal progress
    const interval = setInterval(checkNotifications, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [goals, transactions, notifications]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Function to handle notification actions
  const handleNotificationAction = (notification: GoalNotification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Handle different action types
    switch (notification.actionType) {
      case 'earn_money':
        // Navigate to transactions page or show earning opportunities
        window.dispatchEvent(new CustomEvent('navigate-to', { detail: { page: 'transactions' } }));
        break;
      case 'review_budget':
        // Navigate to budget page
        window.dispatchEvent(new CustomEvent('navigate-to', { detail: { page: 'budget' } }));
        break;
      case 'complete_step':
        // Navigate to goals page
        window.dispatchEvent(new CustomEvent('navigate-to', { detail: { page: 'goals' } }));
        break;
      case 'update_transactions':
        // Navigate to transactions page
        window.dispatchEvent(new CustomEvent('navigate-to', { detail: { page: 'transactions' } }));
        break;
    }
  };

  // This component doesn't render UI - it manages notifications in the background
  return null;
};

export default GoalNotificationManager;
