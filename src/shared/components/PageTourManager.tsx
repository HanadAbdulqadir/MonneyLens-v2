import React, { useState, useEffect } from 'react';
import PageTour from '../../components/PageTour';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Sparkles, Play, Info } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

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
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const { toast } = useToast();

  // Define page-specific tours
  const pageTours: PageTourConfig = {
    'Dashboard': [
      {
        id: 'welcome-dashboard',
        title: 'Welcome to Your Financial Dashboard',
        description: 'This is your central hub for monitoring your financial health. The dashboard provides real-time insights into your income, expenses, and overall financial status.',
      },
      {
        id: 'balance-card',
        title: 'Balance Overview Card',
        description: 'The balance card shows your current financial standing. Green indicates positive balance, red shows negative. Click on different sections to filter transactions by type.',
      },
      {
        id: 'personalized-overview',
        title: 'Personalized Financial Overview',
        description: 'This section adapts to your spending patterns. It highlights key metrics like monthly spending trends, category breakdowns, and financial health indicators.',
      },
      {
        id: 'recent-transactions',
        title: 'Recent Transactions Panel',
        description: 'View your latest financial activity here. Each transaction shows amount, category, and date. Click any transaction to see more details or make edits.',
      },
      {
        id: 'weekly-chart',
        title: 'Weekly Spending Chart',
        description: 'This interactive chart visualizes your spending patterns over the current week. Hover over bars to see exact amounts and compare daily spending.',
      },
      {
        id: 'quick-insights',
        title: 'Quick Insights Grid',
        description: 'Get instant financial insights like spending alerts, budget status, and upcoming recurring payments. These cards update in real-time as you add transactions.',
      },
      {
        id: 'navigation-sidebar',
        title: 'Navigation Sidebar',
        description: 'Use the sidebar to access different sections: Transactions, Budget, Analytics, Goals, and Settings. The active page is highlighted for easy orientation.',
      },
      {
        id: 'toolbar-actions',
        title: 'Quick Action Toolbars',
        description: 'Two floating toolbars provide quick access: the top toolbar shows monthly stats and quick add, while the bottom toolbar offers comprehensive tools and accessibility features.',
      }
    ],
    'Transactions': [
      {
        id: 'welcome-transactions',
        title: 'Comprehensive Transaction Management',
        description: 'This page serves as your complete transaction hub. Track every financial movement, categorize spending, and analyze your cash flow patterns.',
      },
      {
        id: 'transaction-filters',
        title: 'Advanced Filtering System',
        description: 'Use the filter panel to narrow down transactions by date range, category, amount, or type. Multiple filters can be combined for precise searching.',
      },
      {
        id: 'transaction-table',
        title: 'Interactive Transaction Table',
        description: 'The main table displays all your transactions with sortable columns. Click column headers to sort by date, amount, or category.',
      },
      {
        id: 'transaction-details',
        title: 'Transaction Details View',
        description: 'Click any transaction row to open detailed view. Edit amounts, categories, or add notes to keep your records accurate.',
      },
      {
        id: 'bulk-actions',
        title: 'Bulk Transaction Operations',
        description: 'Select multiple transactions to perform batch operations like category changes, deletion, or exporting selected items.',
      },
      {
        id: 'search-functionality',
        title: 'Smart Search System',
        description: 'Use the search bar to find transactions by description, category, or amount. The search updates results in real-time as you type.',
      },
      {
        id: 'export-options',
        title: 'Data Export Features',
        description: 'Export your transaction data to CSV format for external analysis or backup purposes. Choose date ranges and specific categories for export.',
      },
      {
        id: 'import-capabilities',
        title: 'Transaction Import Tools',
        description: 'Import transactions from bank statements or other financial apps using the universal CSV importer for comprehensive data consolidation.',
      }
    ],
    'Budget': [
      {
        id: 'welcome-budget',
        title: 'Smart Budget Management System',
        description: 'Create, monitor, and adjust your financial budgets with precision. This system helps you maintain spending discipline across all categories.',
      },
      {
        id: 'budget-overview',
        title: 'Budget Overview Dashboard',
        description: 'See all your budgets at a glance with progress indicators. Green shows you\'re within budget, yellow indicates caution, red means overspending.',
      },
      {
        id: 'category-budgets',
        title: 'Category-Specific Budgets',
        description: 'Set individual spending limits for each category like groceries, entertainment, utilities. Each category shows current spending vs. budget.',
      },
      {
        id: 'progress-visualization',
        title: 'Visual Progress Indicators',
        description: 'Progress bars and circular indicators show how close you are to your budget limits. Hover for detailed breakdowns.',
      },
      {
        id: 'budget-creation',
        title: 'Creating New Budgets',
        description: 'Use the budget creation wizard to set up new spending limits. Choose categories, set amounts, and define time periods.',
      },
      {
        id: 'budget-adjustment',
        title: 'Dynamic Budget Adjustments',
        description: 'Easily modify existing budgets as your financial situation changes. Adjust amounts, extend timeframes, or pause budgets temporarily.',
      },
      {
        id: 'spending-alerts',
        title: 'Smart Spending Alerts',
        description: 'Receive notifications when you approach or exceed budget limits. Alerts help prevent overspending before it happens.',
      },
      {
        id: 'budget-reports',
        title: 'Budget Performance Reports',
        description: 'Generate detailed reports showing budget adherence, spending patterns, and areas for improvement.',
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

  // Check if user is new and show welcome tour
  useEffect(() => {
    const isNewUser = !localStorage.getItem('moneylens-welcome-tour-completed');
    const currentPath = window.location.pathname;
    
    if (isNewUser && currentPath === '/') {
      // Show welcome tour after a short delay
      const timer = setTimeout(() => {
        setShowWelcomeTour(true);
        toast({
          title: "🎉 Welcome to MoneyLens!",
          description: "Let's take a quick tour to get you started.",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowWelcomeTour(false);
                localStorage.setItem('moneylens-welcome-tour-completed', 'true');
              }}
            >
              Skip
            </Button>
          ),
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

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

  const startWelcomeTour = () => {
    setCurrentTour({ pageName: 'Dashboard', steps: pageTours['Dashboard'] });
    setIsTourOpen(true);
    setShowWelcomeTour(false);
    localStorage.setItem('moneylens-welcome-tour-completed', 'true');
  };

  const skipWelcomeTour = () => {
    setShowWelcomeTour(false);
    localStorage.setItem('moneylens-welcome-tour-completed', 'true');
  };

  return (
    <>
      {/* Welcome Tour Popup */}
      {showWelcomeTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg shadow-xl max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Welcome to MoneyLens! 🎉</h3>
                <p className="text-muted-foreground text-sm">
                  Let's take a quick tour to discover all the powerful features.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Dashboard</Badge>
                <span>Real-time financial insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Transactions</Badge>
                <span>Complete transaction management</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Budget</Badge>
                <span>Smart budget tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Analytics</Badge>
                <span>Deep financial insights</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={skipWelcomeTour} className="flex-1">
                Skip Tour
              </Button>
              <Button onClick={startWelcomeTour} className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                Start Tour
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Tour */}
      {currentTour && (
        <PageTour
          pageName={currentTour.pageName}
          steps={currentTour.steps}
          open={isTourOpen}
          onOpenChange={setIsTourOpen}
        />
      )}
    </>
  );
};

export default PageTourManager;
