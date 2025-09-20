import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import WeeklyChart from "@/components/WeeklyChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import StartingPointModal from "@/components/StartingPointModal";
import { Wallet } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pots</h1>
                <p className="text-sm text-muted-foreground">Financial tracking made simple</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StartingPointModal />
              <AddTransactionModal />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Balance Card - Full Width */}
          <BalanceCard />
          
          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Category Breakdown */}
            <CategoryBreakdown />
            
            {/* Recent Transactions */}
            <RecentTransactions />
            
            {/* Weekly Chart - Spans 2 columns on larger screens */}
            <div className="md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2">
              <WeeklyChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
