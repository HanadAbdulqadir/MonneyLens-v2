import { LogOut } from "lucide-react";
import NotificationCenter from "@components/NotificationCenter";
import { useAuth } from "@core/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@shared/components/ui/sidebar";
import { Button } from "@shared/components/ui/button";
import { Separator } from "@shared/components/ui/separator";
import { HubNavigation } from "@components/HubNavigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
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
              <div className="flex-1">
                <h2 className="font-semibold text-sm">MoneyLens</h2>
                <p className="text-xs text-muted-foreground">
                  {user?.user_metadata?.display_name || user?.email || 'Financial Intelligence'}
                </p>
              </div>
            )}
            <NotificationCenter />
          </div>
        </div>

        {/* Hub Navigation */}
        <SidebarGroup className="px-3 py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Navigation Hubs
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <HubNavigation />
          </SidebarGroupContent>
        </SidebarGroup>

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
