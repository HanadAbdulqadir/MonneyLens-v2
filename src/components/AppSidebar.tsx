import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/shared/components/ui/sidebar";
import { HubNavigation } from "./HubNavigation";
import { useAuth } from "@/core/contexts/AuthContext";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState('');

  // Load user name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('user-name') || '';
    setUserName(savedName);
    
    // Listen for user name updates
    const handleUserNameUpdate = () => {
      const updatedName = localStorage.getItem('user-name') || '';
      setUserName(updatedName);
    };
    
    window.addEventListener('user-name-updated', handleUserNameUpdate);
    return () => window.removeEventListener('user-name-updated', handleUserNameUpdate);
  }, []);

  return (
    <Sidebar className="border-r bg-background/95 backdrop-blur-sm">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">ML</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">MoneyLens</h2>
            <p className="text-xs text-muted-foreground truncate">
              {userName || 'Financial Companion'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <HubNavigation variant="sidebar" />
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || 'Guest User'}
              </p>
              {userName && (
                <p className="text-xs text-muted-foreground truncate">
                  {userName}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
