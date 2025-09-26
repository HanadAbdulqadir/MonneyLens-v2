import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Target, 
  CreditCard, 
  TrendingUp, 
  Calculator, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  subItems?: HubSubItem[];
  badge?: string;
}

export interface HubSubItem {
  id: string;
  title: string;
  path: string;
  description: string;
}

// Define the 6 main hubs
export const hubs: HubItem[] = [
  {
    id: "dashboard",
    title: "Dashboard Hub",
    description: "Financial overview and quick insights",
    icon: LayoutDashboard,
    path: "/",
    color: "text-blue-600",
    subItems: [
      { id: "overview", title: "Overview", path: "/", description: "Daily financial snapshot" },
      { id: "quick-allocation", title: "Quick Allocation", path: "/quick-allocation", description: "Smart daily earnings distribution" },
      { id: "notifications", title: "Notifications", path: "/notifications", description: "Financial alerts and updates" }
    ]
  },
  {
    id: "planning",
    title: "Planning Hub",
    description: "Goals, budgets, and long-term strategy",
    icon: Target,
    path: "/financial-hub",
    color: "text-green-600",
    subItems: [
      { id: "financial-hub", title: "Financial Hub", path: "/financial-hub", description: "Complete financial planning" },
      { id: "pots", title: "Pots", path: "/pots", description: "Envelope budgeting system" },
      { id: "budget", title: "Budget", path: "/budget", description: "Budget management & tracking" },
      { id: "goals", title: "Goals", path: "/goals", description: "Financial goal achievement" },
      { id: "debts", title: "Debts", path: "/debts", description: "Debt management & payoff" }
    ]
  },
  {
    id: "transactions",
    title: "Transactions Hub",
    description: "Income, expenses, and transaction management",
    icon: CreditCard,
    path: "/transactions",
    color: "text-purple-600",
    subItems: [
      { id: "transactions", title: "Transactions", path: "/transactions", description: "Manage income & expenses" },
      { id: "categories", title: "Categories", path: "/categories", description: "Expense categorization" },
      { id: "recurring", title: "Recurring", path: "/recurring", description: "Recurring transactions" },
      { id: "calendar", title: "Calendar", path: "/calendar", description: "Financial calendar view" }
    ]
  },
  {
    id: "analytics",
    title: "Analytics Hub",
    description: "Deep financial insights and reporting",
    icon: TrendingUp,
    path: "/analytics",
    color: "text-orange-600",
    subItems: [
      { id: "analytics", title: "Analytics", path: "/analytics", description: "Advanced financial analytics" },
      { id: "reports", title: "Reports", path: "/reports", description: "Custom financial reports" },
      { id: "trends", title: "Trends", path: "/trends", description: "Spending patterns analysis" }
    ]
  },
  {
    id: "tools",
    title: "Tools Hub",
    description: "Calculators, scenarios, and financial tools",
    icon: Calculator,
    path: "/tools",
    color: "text-red-600",
    subItems: [
      { id: "calculators", title: "Calculators", path: "/calculators", description: "Financial calculators" },
      { id: "scenarios", title: "What-If Scenarios", path: "/scenarios", description: "Financial scenario testing" },
      { id: "projections", title: "Projections", path: "/projections", description: "Future financial projections" }
    ]
  },
  {
    id: "settings",
    title: "Settings Hub",
    description: "User preferences and account management",
    icon: Settings,
    path: "/settings",
    color: "text-gray-600",
    subItems: [
      { id: "profile", title: "Profile", path: "/profile", description: "User profile & account settings" },
      { id: "settings", title: "Settings", path: "/settings", description: "Application configuration" },
      { id: "import-export", title: "Import/Export", path: "/import-export", description: "Data management" }
    ]
  }
];

interface HubNavigationProps {
  className?: string;
  variant?: "sidebar" | "header" | "mobile";
}

export function HubNavigation({ className, variant = "sidebar" }: HubNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedHub, setExpandedHub] = useState<string | null>(null);

  const isActiveHub = (hub: HubItem) => {
    return hub.subItems?.some(subItem => location.pathname === subItem.path) || 
           location.pathname === hub.path;
  };

  const isActiveSubItem = (subItem: HubSubItem) => {
    return location.pathname === subItem.path;
  };

  const toggleHub = (hubId: string) => {
    setExpandedHub(expandedHub === hubId ? null : hubId);
  };

  const handleHubClick = (hub: HubItem) => {
    if (hub.subItems && hub.subItems.length > 0) {
      toggleHub(hub.id);
      // Navigate to the first sub-item if not already on a sub-item
      if (!isActiveHub(hub)) {
        navigate(hub.subItems[0].path);
      }
    } else {
      navigate(hub.path);
    }
  };

  const handleSubItemClick = (subItem: HubSubItem) => {
    navigate(subItem.path);
  };

  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {hubs.map((hub) => (
          <Button
            key={hub.id}
            variant={isActiveHub(hub) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleHubClick(hub)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isActiveHub(hub) && "bg-primary/10 text-primary"
            )}
          >
            <hub.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{hub.title}</span>
            {hub.badge && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {hub.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {hubs.map((hub) => {
        const isActive = isActiveHub(hub);
        const isExpanded = expandedHub === hub.id;
        const Icon = hub.icon;

        return (
          <div key={hub.id} className="space-y-1">
            {/* Hub Main Button */}
            <Button
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => handleHubClick(hub)}
              className={cn(
                "w-full justify-start gap-3 h-auto py-3 px-4 transition-all",
                isActive && "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", hub.color)} />
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{hub.title}</span>
                  {hub.subItems && hub.subItems.length > 0 && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{hub.description}</p>
              </div>
              {hub.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {hub.badge}
                </Badge>
              )}
            </Button>

            {/* Sub-items */}
            {hub.subItems && hub.subItems.length > 0 && isExpanded && (
              <div className="ml-4 space-y-1">
                {hub.subItems.map((subItem) => (
                  <Button
                    key={subItem.id}
                    variant={isActiveSubItem(subItem) ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSubItemClick(subItem)}
                    className={cn(
                      "w-full justify-start gap-2 h-auto py-2 px-3 text-xs",
                      isActiveSubItem(subItem) && "bg-muted text-foreground"
                    )}
                  >
                    <ChevronRight className="h-3 w-3" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">{subItem.title}</span>
                      <p className="text-muted-foreground truncate">{subItem.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
