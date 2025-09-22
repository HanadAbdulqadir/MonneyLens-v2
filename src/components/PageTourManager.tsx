import React, { useState, useEffect } from 'react';
import PageTour from './PageTour';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface PageTourConfig {
  [key: string]: TourStep[];
}

const PageTourManager = () => {
  const [currentTour, setCurrentTour] = useState<{ pageName: string; steps: TourStep[] } | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Define page-specific tours
  const pageTours: PageTourConfig = {
    'Dashboard': [
      {
        id: 'welcome-dashboard',
        title: 'Welcome to Your Dashboard',
        description: 'Your dashboard provides an overview of your financial health and recent activity.',
      },
      {
        id: 'balance-card',
        title: 'Balance Overview',
        description: 'See your current balance, income, and expenses at a glance.',
      },
      {
        id: 'recent-transactions',
        title: 'Recent Transactions',
        description: 'Quickly review your most recent financial activity.',
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        description: 'Use the floating toolbar to quickly add transactions or access other features.',
      }
    ],
    'Transactions': [
      {
        id: 'welcome-transactions',
        title: 'Transaction Management',
        description: 'This is where you can view, add, and manage all your financial transactions.',
      },
      {
        id: 'transaction-list',
        title: 'Transaction List',
        description: 'Browse through all your recorded transactions with filtering options.',
      },
      {
        id: 'add-transaction',
        title: 'Adding Transactions',
        description: 'Use the quick add button or form to record new income or expenses.',
      },
      {
        id: 'search-filter',
        title: 'Search & Filter',
        description: 'Find specific transactions using search and filter options.',
      }
    ],
    'Budget': [
      {
        id: 'welcome-budget',
        title: 'Budget Planning',
        description: 'Set and track your spending limits across different categories.',
      },
      {
        id: 'budget-categories',
        title: 'Budget Categories',
        description: 'Organize your budget by categories like food, entertainment, utilities, etc.',
      },
      {
        id: 'progress-tracking',
        title: 'Progress Tracking',
        description: 'Monitor your spending against your budget goals with visual indicators.',
      },
      {
        id: 'budget-adjustments',
        title: 'Adjusting Budgets',
        description: 'Easily modify your budget amounts as your financial situation changes.',
      }
    ],
    'Analytics': [
      {
        id: 'welcome-analytics',
        title: 'Financial Analytics',
        description: 'Deep insights into your spending patterns and financial trends.',
      },
      {
        id: 'charts-graphs',
        title: 'Visual Analytics',
        description: 'Interactive charts and graphs help you understand your financial data.',
      },
      {
        id: 'spending-trends',
        title: 'Spending Trends',
        description: 'Identify patterns in your spending over time.',
      },
      {
        id: 'category-breakdown',
        title: 'Category Breakdown',
        description: 'See how your money is distributed across different spending categories.',
      }
    ],
    'Financial Hub': [
      {
        id: 'welcome-hub',
        title: 'Financial Hub',
        description: 'Your central dashboard for comprehensive financial management.',
      },
      {
        id: 'overview-cards',
        title: 'Overview Cards',
        description: 'Quick glance at key financial metrics and recent activity.',
      },
      {
        id: 'configuration-tools',
        title: 'Configuration Tools',
        description: 'Set up and customize your financial tracking preferences.',
      },
      {
        id: 'data-import',
        title: 'Data Import',
        description: 'Import financial data from various sources for comprehensive tracking.',
      }
    ],
    'Goals': [
      {
        id: 'welcome-goals',
        title: 'Financial Goals',
        description: 'Set and track your financial objectives and savings targets.',
      },
      {
        id: 'goal-setting',
        title: 'Setting Goals',
        description: 'Define specific financial goals with target amounts and deadlines.',
      },
      {
        id: 'progress-tracking-goals',
        title: 'Goal Progress',
        description: 'Monitor your progress towards achieving your financial objectives.',
      },
      {
        id: 'goal-adjustments',
        title: 'Adjusting Goals',
        description: 'Modify your goals as your financial priorities evolve.',
      }
    ],
    'Settings': [
      {
        id: 'welcome-settings',
        title: 'Application Settings',
        description: 'Customize your MoneyLens experience and manage your preferences.',
      },
      {
        id: 'profile-settings',
        title: 'Profile Settings',
        description: 'Update your personal information and account preferences.',
      },
      {
        id: 'data-management',
        title: 'Data Management',
        description: 'Export, import, or clear your financial data.',
      },
      {
        id: 'preferences',
        title: 'Preferences',
        description: 'Customize the application behavior and appearance.',
      }
    ]
  };

  // Listen for page tour events
  useEffect(() => {
    const handlePageTour = (event: CustomEvent) => {
      const { pageName } = event.detail;
      const steps = pageTours[pageName] || pageTours['Dashboard'];
      
      setCurrentTour({ pageName, steps });
      setIsTourOpen(true);
    };

    window.addEventListener('open-page-tour', handlePageTour as EventListener);
    
    return () => {
      window.removeEventListener('open-page-tour', handlePageTour as EventListener);
    };
  }, []);

  const handleTourClose = () => {
    setIsTourOpen(false);
    setCurrentTour(null);
  };

  if (!currentTour) return null;

  return (
    <PageTour
      pageName={currentTour.pageName}
      steps={currentTour.steps}
      open={isTourOpen}
      onOpenChange={setIsTourOpen}
    />
  );
};

export default PageTourManager;
