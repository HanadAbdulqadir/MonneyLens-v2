import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { AppSidebar } from "@/components/AppSidebar";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FinancialProvider>
      <TooltipProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              
              <main className="flex-1 overflow-auto">
                <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                  <div className="flex items-center h-14 px-6">
                    <SidebarTrigger className="mr-4" />
                  </div>
                </header>
                
                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<Index />} />
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
              </main>
            </div>
            
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </FinancialProvider>
  </QueryClientProvider>
);

export default App;
