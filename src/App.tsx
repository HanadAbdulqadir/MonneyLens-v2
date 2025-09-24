import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/contexts/SupabaseFinancialContext";
import { PotsProvider } from "@/contexts/PotsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppSidebar } from "@/components/AppSidebar";
import UnifiedToolbar from "@/components/UnifiedToolbar";
import QuickActionsToolbar from "@/components/QuickActionsToolbar";
import PageTourManager from "@/components/PageTourManager";
import GoalNotificationManager from "@/components/GoalNotificationManager";
import NotificationSystem from "@/components/NotificationSystem";
import DataImporter from "@/components/DataImporter";
import AdvancedSearch from "@/components/AdvancedSearch";
import UserOnboarding from "@/components/UserOnboarding";
import SmartTransactionEntry from "@/components/SmartTransactionEntry";
import MobileBottomNavigation from "@/components/MobileBottomNavigation";
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
import QuickAllocation from "./pages/QuickAllocation";
import Pots from "./pages/Pots";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Helper component to avoid code duplication
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <FinancialProvider>
      <PotsProvider>
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
                {children}
              </div>

              {/* Enhanced UX Components */}
              <QuickActionsToolbar />
              <UnifiedToolbar />
              <PageTourManager />
              <GoalNotificationManager />
              <AdvancedSearch />
              <UserOnboarding />
              <SmartTransactionEntry />
              <MobileBottomNavigation />
            </main>
          </div>
          
          <Toaster />
          <Sonner />
        </SidebarProvider>
      </PotsProvider>
    </FinancialProvider>
  </ProtectedRoute>
);

function AppContent() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <ProtectedRoute requireAuth={false}>
            <ForgotPassword />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedLayout><Index /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="/financial-hub" element={<ProtectedLayout><FinancialHub /></ProtectedLayout>} />
      <Route path="/quick-allocation" element={<ProtectedLayout><QuickAllocation /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
      <Route path="/goals" element={<ProtectedLayout><Goals /></ProtectedLayout>} />
      <Route path="/debts" element={<ProtectedLayout><Debts /></ProtectedLayout>} />
      <Route path="/recurring" element={<ProtectedLayout><Recurring /></ProtectedLayout>} />
      <Route path="/categories" element={<ProtectedLayout><Categories /></ProtectedLayout>} />
      <Route path="/budget" element={<ProtectedLayout><Budget /></ProtectedLayout>} />
      <Route path="/pots" element={<ProtectedLayout><Pots /></ProtectedLayout>} />
      <Route path="/calendar" element={<ProtectedLayout><Calendar /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
