import { useState, useEffect, useCallback } from 'react';

export interface NotificationEvent {
  id: string;
  type: 'goal_milestone' | 'budget_alert' | 'pot_allocation' | 'bill_reminder' | 'low_balance' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface UseRealtimeNotificationsReturn {
  notifications: NotificationEvent[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => void;
}

export default function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('moneylens-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moneylens-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Simulate real-time connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% chance of being connected
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationEvent = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification
  };
}
