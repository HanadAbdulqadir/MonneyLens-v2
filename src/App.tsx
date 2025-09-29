import * as React from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { FinancialProvider } from "@/core/contexts/SupabaseFinancialContext";
import { PotsProvider } from "@/core/contexts/PotsContext";
import { AuthProvider, useAuth } from "@/core/contexts/AuthContext";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { AppSidebar } from "@/components/AppSidebar";
import UnifiedToolbar from "@/shared/components/UnifiedToolbar";
import QuickActionsToolbar from "@/shared/components/QuickActionsToolbar";
import PageTourManager from "@/shared/components/PageTourManager";
import GoalNotificationManager from "@/shared/components/GoalNotificationManager";
import NotificationSystem from "@/shared/components/NotificationSystem";
import DataImporter from "@/shared/components/DataImporter";
import AdvancedSearch from "@/shared/components/AdvancedSearch";
import UserOnboarding from "@/shared/components/UserOnboarding";
import SmartTransactionEntry from "@/shared/components/SmartTransactionEntry";
import MobileBottomNavigation from "@/shared/components/MobileBottomNavigation";
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
import Tools from "./pages/Tools";
import ImportExport from "./pages/ImportExport";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Helper component to avoid code duplication
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
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
);

function AppContent() {
  return (
    <Routes>
      {/* Authentication Routes - No protection needed */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes - Wrap each route individually */}
      <Route path="/" element={
        <ProtectedRoute>
          <ProtectedLayout><Index /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProtectedLayout><Profile /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/financial-hub" element={
        <ProtectedRoute>
          <ProtectedLayout><FinancialHub /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/quick-allocation" element={
        <ProtectedRoute>
          <ProtectedLayout><QuickAllocation /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <ProtectedLayout><Analytics /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <ProtectedLayout><Transactions /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <ProtectedLayout><Goals /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/debts" element={
        <ProtectedRoute>
          <ProtectedLayout><Debts /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/recurring" element={
        <ProtectedRoute>
          <ProtectedLayout><Recurring /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <ProtectedLayout><Categories /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/budget" element={
        <ProtectedRoute>
          <ProtectedLayout><Budget /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/pots" element={
        <ProtectedRoute>
          <ProtectedLayout><Pots /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <ProtectedLayout><Calendar /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <ProtectedLayout><Settings /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/tools" element={
        <ProtectedRoute>
          <ProtectedLayout><Tools /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/import-export" element={
        <ProtectedRoute>
          <ProtectedLayout><ImportExport /></ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
