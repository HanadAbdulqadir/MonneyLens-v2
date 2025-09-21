import { LayoutDashboard, TrendingUp, PieChart, Target, Settings, CreditCard, Calendar, Flag, RefreshCw } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transactions", url: "/transactions", icon: CreditCard },
    { title: "Analytics", url: "/analytics", icon: TrendingUp },
    { title: "Categories", url: "/categories", icon: PieChart },
    { title: "Budget", url: "/budget", icon: Target },
    { title: "Goals", url: "/goals", icon: Flag },
    { title: "Debts", url: "/debts", icon: CreditCard },
    { title: "Recurring", url: "/recurring", icon: RefreshCw },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [userName, setUserName] = useState('');

  // Load user name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('user-name') || '';
    setUserName(savedName);
    
    // Listen for storage changes to update name in real-time
    const handleStorageChange = () => {
      const updatedName = localStorage.getItem('user-name') || '';
      setUserName(updatedName);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when name changes in same tab
    const handleNameUpdate = () => {
      const updatedName = localStorage.getItem('user-name') || '';
      setUserName(updatedName);
    };
    
    window.addEventListener('user-name-updated', handleNameUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-name-updated', handleNameUpdate);
    };
  }, []);

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
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sm">MoneyLens</h2>
                <p className="text-xs text-muted-foreground">
                  {userName ? `Welcome, ${userName}` : 'Financial Tracker'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`transition-all duration-200 ${
                        active 
                          ? "bg-primary/10 text-primary font-medium border border-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                        {!isCollapsed && (
                          <span className="text-sm">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
