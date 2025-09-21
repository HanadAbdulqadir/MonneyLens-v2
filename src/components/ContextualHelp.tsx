import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from 'react-router-dom';
import { 
  HelpCircle, 
  X, 
  Lightbulb, 
  Zap,
  TrendingUp,
  Target,
  CreditCard,
  PieChart,
  Calendar,
  Settings as SettingsIcon
} from "lucide-react";

interface HelpTip {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
}

interface PageHelp {
  route: string;
  tips: HelpTip[];
}

const ContextualHelp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState<HelpTip | null>(null);
  const [hasSeenTips, setHasSeenTips] = useState<string[]>([]);
  const location = useLocation();

  const pageHelp: PageHelp[] = [
    {
      route: '/',
      tips: [
        {
          id: 'dashboard-overview',
          title: 'Welcome to your Dashboard!',
          description: 'This is your financial command center. Use Ctrl+K to quickly navigate or add transactions.',
          icon: Lightbulb,
          priority: 'high',
          action: {
            label: 'Try Ctrl+K',
            onClick: () => {
              // Trigger command palette
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true
              });
              document.dispatchEvent(event);
            }
          }
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions Available',
          description: 'Press Ctrl+T to quickly add a transaction, or use the floating action menu.',
          icon: Zap,
          priority: 'medium'
        }
      ]
    },
    {
      route: '/transactions',
      tips: [
        {
          id: 'transactions-shortcuts',
          title: 'Transaction Management',
          description: 'Use Ctrl+T to add transactions quickly, or click any transaction to edit it.',
          icon: CreditCard,
          priority: 'high'
        }
      ]
    },
    {
      route: '/analytics',
      tips: [
        {
          id: 'analytics-insights',
          title: 'Discover Insights',
          description: 'Your spending patterns and trends are automatically analyzed. Look for anomalies and opportunities.',
          icon: TrendingUp,
          priority: 'medium'
        }
      ]
    },
    {
      route: '/budget',
      tips: [
        {
          id: 'budget-setup',
          title: 'Smart Budgeting',
          description: 'Set realistic budgets based on your spending history. The system will warn you before you overspend.',
          icon: Target,
          priority: 'high'
        }
      ]
    },
    {
      route: '/settings',
      tips: [
        {
          id: 'settings-customization',
          title: 'Personalize Your Experience',
          description: 'Customize your currency, set up notifications, and adjust accessibility settings here.',
          icon: SettingsIcon,
          priority: 'medium'
        }
      ]
    }
  ];

  // Get tips for current route
  const getCurrentTips = () => {
    const currentPage = pageHelp.find(page => 
      page.route === location.pathname || 
      (page.route !== '/' && location.pathname.startsWith(page.route))
    );
    return currentPage?.tips || [];
  };

  // Show contextual tip when route changes
  useEffect(() => {
    const tips = getCurrentTips();
    const unseenTips = tips.filter(tip => !hasSeenTips.includes(tip.id));
    
    if (unseenTips.length > 0) {
      // Show highest priority unseen tip
      const highPriorityTip = unseenTips.find(tip => tip.priority === 'high');
      const tipToShow = highPriorityTip || unseenTips[0];
      
      setTimeout(() => {
        setCurrentTip(tipToShow);
        setIsVisible(true);
      }, 1000); // Delay to let page load
    }
  }, [location.pathname, hasSeenTips]);

  const dismissTip = (tipId: string) => {
    setHasSeenTips(prev => {
      const updated = [...prev, tipId];
      localStorage.setItem('contextual-help-seen', JSON.stringify(updated));
      return updated;
    });
    setIsVisible(false);
    setCurrentTip(null);
  };

  // Load seen tips from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('contextual-help-seen');
    if (seen) {
      setHasSeenTips(JSON.parse(seen));
    }
  }, []);

  if (!isVisible || !currentTip) return null;

  const Icon = currentTip.icon;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg max-w-md">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              currentTip.priority === 'high' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{currentTip.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={currentTip.priority === 'high' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    Tip
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => dismissTip(currentTip.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {currentTip.description}
              </p>
              
              {currentTip.action && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      currentTip.action?.onClick();
                      dismissTip(currentTip.id);
                    }}
                    className="text-xs h-7"
                  >
                    {currentTip.action.label}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissTip(currentTip.id)}
                    className="text-xs h-7"
                  >
                    Got it
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContextualHelp;