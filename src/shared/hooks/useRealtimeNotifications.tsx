import { useEffect, useState } from 'react';
import { useAuth } from "../../core/contexts/AuthContext";
import { supabase } from "../../core/integrations/supabase/client";
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface NotificationEvent {
  id: string;
  type: 'goal_milestone' | 'budget_alert' | 'pot_allocation' | 'bill_reminder' | 'low_balance';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export interface RealtimeNotificationHook {
  notifications: NotificationEvent[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

export const useRealtimeNotifications = (): RealtimeNotificationHook => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsConnected(false);
      return;
    }

    // Create a channel for real-time updates
    const notificationChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleTransactionInsert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pots',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handlePotUpdate(payload.new, payload.old);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'financial_goals',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleGoalUpdate(payload.new, payload.old);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'allocation_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleAllocationTransaction(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Real-time notifications connected');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Real-time notifications connection error');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          console.warn('Real-time notifications connection timed out');
        }
      });

    setChannel(notificationChannel);

    // Cleanup on unmount
    return () => {
      if (notificationChannel) {
        notificationChannel.unsubscribe();
      }
    };
  }, [user?.id]);

  // Handle new transaction notifications
  const handleTransactionInsert = async (transaction: any) => {
    try {
      // Check if this transaction causes any budget alerts
      await checkBudgetAlerts(transaction);
      
      // Check for low pot balances
      if (transaction.pot_id) {
        await checkLowPotBalance(transaction.pot_id);
      }

      // Show transaction confirmation
      const notification: NotificationEvent = {
        id: `transaction-${transaction.id}`,
        type: 'pot_allocation',
        title: 'Transaction Added',
        message: `£${Math.abs(transaction.amount)} ${transaction.amount > 0 ? 'added to' : 'spent from'} ${transaction.category}`,
        data: transaction,
        timestamp: new Date().toISOString(),
        read: false
      };

      addNotification(notification);
      toast.success(notification.message);
    } catch (error) {
      console.error('Error handling transaction insert:', error);
    }
  };

  // Handle pot balance updates
  const handlePotUpdate = async (newPot: any, oldPot: any) => {
    try {
      const balanceChange = newPot.current_balance - oldPot.current_balance;
      
      if (balanceChange > 0) {
        // Money added to pot
        const notification: NotificationEvent = {
          id: `pot-increase-${newPot.id}`,
          type: 'pot_allocation',
          title: 'Pot Updated',
          message: `£${balanceChange.toFixed(2)} added to ${newPot.name} pot`,
          data: { pot: newPot, change: balanceChange },
          timestamp: new Date().toISOString(),
          read: false
        };

        addNotification(notification);
      } else if (balanceChange < 0) {
        // Money spent from pot
        const notification: NotificationEvent = {
          id: `pot-decrease-${newPot.id}`,
          type: 'pot_allocation',
          title: 'Pot Updated',
          message: `£${Math.abs(balanceChange).toFixed(2)} spent from ${newPot.name} pot`,
          data: { pot: newPot, change: balanceChange },
          timestamp: new Date().toISOString(),
          read: false
        };

        addNotification(notification);
      }

      // Check if pot is running low
      if (newPot.current_balance < newPot.target_amount * 0.2) {
        const lowBalanceNotification: NotificationEvent = {
          id: `low-balance-${newPot.id}`,
          type: 'low_balance',
          title: 'Low Pot Balance',
          message: `${newPot.name} pot is running low (£${newPot.current_balance.toFixed(2)} remaining)`,
          data: { pot: newPot },
          timestamp: new Date().toISOString(),
          read: false
        };

        addNotification(lowBalanceNotification);
        toast.warning(lowBalanceNotification.message);
      }
    } catch (error) {
      console.error('Error handling pot update:', error);
    }
  };

  // Handle goal progress updates
  const handleGoalUpdate = async (newGoal: any, oldGoal: any) => {
    try {
      const progressChange = newGoal.current_amount - oldGoal.current_amount;
      
      if (progressChange > 0) {
        const progressPercentage = (newGoal.current_amount / newGoal.target_amount) * 100;
        
        // Check for milestone achievements
        const milestones = [25, 50, 75, 90, 100];
        const oldProgressPercentage = (oldGoal.current_amount / oldGoal.target_amount) * 100;
        
        for (const milestone of milestones) {
          if (oldProgressPercentage < milestone && progressPercentage >= milestone) {
            const notification: NotificationEvent = {
              id: `goal-milestone-${newGoal.id}-${milestone}`,
              type: 'goal_milestone',
              title: 'Goal Milestone Reached!',
              message: `${newGoal.title} is ${milestone}% complete! (£${newGoal.current_amount.toFixed(2)} of £${newGoal.target_amount.toFixed(2)})`,
              data: { goal: newGoal, milestone, progressPercentage },
              timestamp: new Date().toISOString(),
              read: false
            };

            addNotification(notification);
            toast.success(notification.message, {
              duration: 5000,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error handling goal update:', error);
    }
  };

  // Handle allocation transactions
  const handleAllocationTransaction = async (allocation: any) => {
    try {
      // Get pot information
      const { data: pot } = await supabase
        .from('pots')
        .select('name')
        .eq('id', allocation.pot_id)
        .single();

      if (pot) {
        const notification: NotificationEvent = {
          id: `allocation-${allocation.id}`,
          type: 'pot_allocation',
          title: 'Automatic Allocation',
          message: `£${allocation.amount.toFixed(2)} automatically allocated to ${pot.name} pot`,
          data: { allocation, pot },
          timestamp: new Date().toISOString(),
          read: false
        };

        addNotification(notification);
      }
    } catch (error) {
      console.error('Error handling allocation transaction:', error);
    }
  };

  // Check for budget alerts
  const checkBudgetAlerts = async (transaction: any) => {
    try {
      // This would check against user's budget rules
      // For now, we'll implement a simple spending alert
      if (transaction.amount < 0) { // Expense
        const expenseAmount = Math.abs(transaction.amount);
        
        if (expenseAmount > 100) { // Large expense alert
          const notification: NotificationEvent = {
            id: `large-expense-${transaction.id}`,
            type: 'budget_alert',
            title: 'Large Expense Alert',
            message: `Large expense of £${expenseAmount.toFixed(2)} recorded in ${transaction.category}`,
            data: { transaction, expenseAmount },
            timestamp: new Date().toISOString(),
            read: false
          };

          addNotification(notification);
          toast.warning(notification.message);
        }
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  };

  // Check for low pot balance
  const checkLowPotBalance = async (potId: string) => {
    try {
      const { data: pot } = await supabase
        .from('pots')
        .select('*')
        .eq('id', potId)
        .single();

      if (pot && pot.current_balance < 10) { // Less than £10
        const notification: NotificationEvent = {
          id: `low-balance-${pot.id}`,
          type: 'low_balance',
          title: 'Low Balance Warning',
          message: `${pot.name} pot balance is low (£${pot.current_balance.toFixed(2)})`,
          data: { pot },
          timestamp: new Date().toISOString(),
          read: false
        };

        addNotification(notification);
        toast.warning(notification.message);
      }
    } catch (error) {
      console.error('Error checking low pot balance:', error);
    }
  };

  // Add notification to state
  const addNotification = (notification: NotificationEvent) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected
  };
};

export default useRealtimeNotifications;
