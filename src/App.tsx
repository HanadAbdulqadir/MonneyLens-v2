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
import PageTourManager from "@/shared/components/PageTourManager";
import GoalNotificationManager from "@/shared/components/GoalNotificationManager";
import NotificationSystem from "@/shared/components/NotificationSystem";
import DataImporter from "@/shared/components/DataImporter";
import UserOnboarding from "@/shared/components/UserOnboarding";
import MobileBottomNavigation from "@/shared/components/MobileBottomNavigation";
import FloatingActionButton from "./components/FloatingActionButton";
import QuickActionModals from "./components/QuickActionModals";
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
import FabDemo from "./pages/FabDemo";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Helper component to avoid code duplication
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const [modalType, setModalType] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Listen for modal events from FAB
  React.useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      console.log('Received modal event:', event.type);
      
      // Map FAB event names to QuickActionModals types
      const eventToModalMap: { [key: string]: string } = {
        'open-add-transaction-modal': 'add-transaction',
        'open-smart-transaction-entry': 'quick-transaction',
        'open-quick-goal-modal': 'quick-goal',
        'open-budget-quick-action': 'budget-quick',
        'open-debt-quick-entry': 'debt-quick',
        'open-analytics-overview': 'analytics-overview',
        'open-calculator-modal': 'calculator',
        'open-recurring-payment-modal': 'recurring-payment',
        'open-import-modal': 'import',
        'open-export-modal': 'export',
        'open-accessibility-panel': 'accessibility',
        'open-shortcuts-modal': 'shortcuts',
        'open-quick-settings': 'quick-settings'
      };
      
      const modalType = eventToModalMap[event.type] || event.type.replace('open-', '');
      setModalType(modalType);
      setIsModalOpen(true);
    };

    // Add event listeners for all modal types
    const modalEvents = [
      'open-add-transaction-modal',
      'open-smart-transaction-entry',
      'open-quick-goal-modal',
      'open-budget-quick-action',
      'open-debt-quick-entry',
      'open-analytics-overview',
      'open-calculator-modal',
      'open-recurring-payment-modal',
      'open-import-modal',
      'open-export-modal',
      'open-accessibility-panel',
      'open-shortcuts-modal',
      'open-quick-settings'
    ];

    modalEvents.forEach(eventType => {
      window.addEventListener(eventType, handleOpenModal as EventListener);
    });

    return () => {
      modalEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleOpenModal as EventListener);
      });
    };
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  return (
    <FinancialProvider>
      <PotsProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            
            <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/20">
              <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="mr-1 sm:mr-2" />
                    <div className="hidden sm:block">
                      <h1 className="text-lg font-semibold text-primary">MoneyLens</h1>
                      <p className="text-xs text-muted-foreground">Your financial companion</p>
                    </div>
                    <div className="sm:hidden">
                      <h1 className="text-base font-semibold text-primary">MoneyLens</h1>
                    </div>
                  </div>
                  
                  {/* Header Actions */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <NotificationSystem />
                    <DataImporter />
                  </div>
                </div>
              </header>
              
              <div className="p-4 sm:p-6 pb-20 sm:pb-6">
                {children}
              </div>

              {/* Enhanced UX Components */}
              <PageTourManager />
              <GoalNotificationManager />
              <UserOnboarding />
              <MobileBottomNavigation />
              
              {/* Main Floating Action Button - Replaces all floating buttons */}
              <FloatingActionButton />

              {/* Quick Action Modals */}
              <QuickActionModals 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                type={modalType || ''} 
              />
            </main>
          </div>
          
          <Toaster />
          <Sonner />
        </SidebarProvider>
      </PotsProvider>
    </FinancialProvider>
  );
};

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
      <Route path="/fab-demo" element={
        <ProtectedRoute>
          <ProtectedLayout><FabDemo /></ProtectedLayout>
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
