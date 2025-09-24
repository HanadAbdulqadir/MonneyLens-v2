import { LayoutDashboard, TrendingUp, PieChart, Target, Settings, CreditCard, Calendar, Flag, RefreshCw, LogOut, Building, Zap, Wallet, PiggyBank, BarChart3, FileText, Users, Shield, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Reorganized menu structure for better day-to-day flow
const menuGroups = [
  {
    title: "Daily Operations",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, description: "Daily financial overview" },
      { title: "Quick Allocation", url: "/quick-allocation", icon: Zap, description: "Smart daily earnings allocation" },
      { title: "Transactions", url: "/transactions", icon: CreditCard, description: "Manage income & expenses" },
    ]
  },
  {
    title: "Planning & Strategy",
    items: [
      { title: "Financial Hub", url: "/financial-hub", icon: Building, description: "Complete financial planning" },
      { title: "Pots", url: "/pots", icon: PiggyBank, description: "Envelope budgeting system" },
      { title: "Budget", url: "/budget", icon: Target, description: "Budget management & tracking" },
      { title: "Goals", url: "/goals", icon: Flag, description: "Financial goal achievement" },
      { title: "Debts", url: "/debts", icon: Wallet, description: "Debt management & payoff" },
    ]
  },
  {
    title: "Analysis & Insights",
    items: [
      { title: "Analytics", url: "/analytics", icon: TrendingUp, description: "Advanced financial analytics" },
      { title: "Categories", url: "/categories", icon: PieChart, description: "Expense categorization" },
      { title: "Recurring", url: "/recurring", icon: RefreshCw, description: "Recurring transactions" },
      { title: "Calendar", url: "/calendar", icon: Calendar, description: "Financial calendar view" },
    ]
  },
  {
    title: "System & Settings",
    items: [
      { title: "Profile", url: "/profile", icon: User, description: "User profile & account settings" },
      { title: "Settings", url: "/settings", icon: Settings, description: "Application configuration" },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r bg-card/50 backdrop-blur-sm">
      <SidebarContent className="gap-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sm">MoneyLens</h2>
                <p className="text-xs text-muted-foreground">
                  {user?.user_metadata?.display_name || user?.email || 'Financial Intelligence'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="px-3 py-3">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 ${
                          active 
                            ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm" 
                            : "hover:bg-muted/50 hover:shadow-sm"
                        }`}
                        title={isCollapsed ? `${item.title}: ${item.description}` : undefined}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <span className="text-sm block truncate">{item.title}</span>
                              <span className="text-xs text-muted-foreground block truncate">{item.description}</span>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIndex < menuGroups.length - 1 && !isCollapsed && (
              <Separator className="my-2" />
            )}
          </SidebarGroup>
        ))}

        {/* Quick Stats Summary (Visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 py-3 mt-2">
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Today's Balance</span>
                <span className="font-medium text-green-600">+£180</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Goals Progress</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Upcoming Bills</span>
                <span className="font-medium text-orange-600">2</span>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="mt-auto p-3">
          <Separator className="mb-3" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground ${
              isCollapsed ? "px-2" : ""
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
