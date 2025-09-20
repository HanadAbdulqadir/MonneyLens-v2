import { Button } from "@/components/ui/button";
import { Plus, Target, Wallet, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingActionButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on certain pages to avoid clutter
  const hiddenRoutes = ['/settings'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const quickActions = [
    {
      icon: Plus,
      label: "Add Transaction",
      action: () => {
        // This will trigger the AddTransactionModal if we're on dashboard,
        // otherwise navigate to transactions page
        if (location.pathname === '/') {
          // Trigger the existing modal (we'll need to expose this)
          const addButton = document.querySelector('[data-add-transaction]') as HTMLButtonElement;
          if (addButton) addButton.click();
        } else {
          navigate('/transactions');
        }
      },
      color: "bg-primary hover:bg-primary/90",
    },
    {
      icon: Target,
      label: "New Goal",
      action: () => navigate('/goals'),
      color: "bg-success hover:bg-success/90",
    },
    {
      icon: Wallet,
      label: "Budget",
      action: () => navigate('/budget'),
      color: "bg-warning hover:bg-warning/90",
    },
    {
      icon: CreditCard,
      label: "Add Debt",
      action: () => navigate('/debts'),
      color: "bg-destructive hover:bg-destructive/90",
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      action: () => navigate('/analytics'),
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-3">
          {/* Quick Action Buttons */}
          {isExpanded && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className={`h-12 w-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110 animate-scale-in ${action.color}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => {
                          action.action();
                          setIsExpanded(false);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-card border">
                      <p className="text-sm font-medium">{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {/* Main FAB */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className={`h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 hover:scale-110 ${
                  isExpanded ? 'rotate-45' : 'rotate-0'
                }`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-card border">
              <p className="text-sm font-medium">
                {isExpanded ? 'Close menu' : 'Quick actions'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-fade-in"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default FloatingActionButtons;
