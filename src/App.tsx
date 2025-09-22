import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/contexts/SupabaseFinancialContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import UnifiedToolbar from "@/components/UnifiedToolbar";
import QuickActionsToolbar from "@/components/QuickActionsToolbar";
import PageTourManager from "@/components/PageTourManager";
import GoalNotificationManager from "@/components/GoalNotificationManager";
import NotificationSystem from "@/components/NotificationSystem";
import DataImporter from "@/components/DataImporter";
import AdvancedSearch from "@/components/AdvancedSearch";
import UserOnboarding from "@/components/UserOnboarding";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Debts from "./pages/Debts";
import Recurring from "./pages/Recurring";
import Categories from "./pages/Categories";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import FinancialHub from "./pages/FinancialHub";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-primary">MoneyLens</h2>
            <p className="text-muted-foreground">Loading your financial dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <FinancialProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/20">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
              <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="mr-2" />
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-primary">MoneyLens</h1>
                    <p className="text-xs text-muted-foreground">Your financial companion</p>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  <NotificationSystem />
                  <DataImporter />
                </div>
              </div>
            </header>
            
            <div className="p-6">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/financial-hub" element={<FinancialHub />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* Enhanced UX Components */}
            <QuickActionsToolbar />
            <UnifiedToolbar />
            <PageTourManager />
            <GoalNotificationManager />
            <AdvancedSearch />
            <UserOnboarding />
          </main>
        </div>
        
        <Toaster />
        <Sonner />
      </SidebarProvider>
    </FinancialProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
