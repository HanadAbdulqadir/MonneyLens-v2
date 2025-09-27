import { Button } from "@shared/components/ui/button";
import { Card } from "@shared/components/ui/card";
import { Plus, Target, Wallet, CreditCard, TrendingUp, Minimize2, Maximize2, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@shared/components/ui/tooltip";

const FloatingActionButtons = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
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
        if (location.pathname === '/') {
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

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <Card className={`bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 ${
          isMinimized ? 'w-12 h-12' : 'w-64 h-auto'
        }`}>
          {/* Window Header */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
              {!isMinimized && (
                <span className="text-xs font-medium ml-2">Quick Actions</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Window Content */}
          {!isMinimized && (
            <div className="p-3 space-y-2 animate-fade-in">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-8 px-3 hover:bg-muted transition-colors"
                    onClick={() => action.action()}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${action.color}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default FloatingActionButtons;
