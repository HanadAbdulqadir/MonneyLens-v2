import { useFinancial } from "@/contexts/SupabaseFinancialContext";

const Index = () => {
  const { transactions, goals, debts } = useFinancial();

  const isNewUser = transactions.length === 0 && goals.length === 0 && debts.length === 0;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser ? "Welcome to MoneyLens! 👋" : "Daily Financial Operations"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser 
              ? "Let's get started with your financial journey" 
              : "Your daily financial command center"
            }
          </p>
        </div>
      </div>

      {/* Basic Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Transactions</h3>
          <p className="text-2xl font-bold">{transactions.length}</p>
          <p className="text-sm text-muted-foreground">Total transactions</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Goals</h3>
          <p className="text-2xl font-bold">{goals.length}</p>
          <p className="text-sm text-muted-foreground">Active goals</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-2">Debts</h3>
          <p className="text-2xl font-bold">{debts.length}</p>
          <p className="text-sm text-muted-foreground">Active debts</p>
        </div>
      </div>

      {/* Simple Message */}
      <div className="bg-muted/20 p-6 rounded-lg border">
        <h3 className="font-semibold mb-2">MoneyLens Dashboard</h3>
        <p className="text-muted-foreground">
          {isNewUser 
            ? "Start by adding your first transaction or setting up a financial goal."
            : "Your financial overview is loading. Check the navigation menu for detailed views."
          }
        </p>
      </div>
    </div>
  );
};

export default Index;
