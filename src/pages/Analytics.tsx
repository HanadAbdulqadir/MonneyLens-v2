import { Card } from "@shared/components/ui/card";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import AdvancedAnalyticsDashboard from "@components/AdvancedAnalyticsDashboard";
import TransactionAnalytics from "@components/TransactionAnalytics";

const Analytics = () => {
  const { transactions, dailyData } = useFinancial();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights and predictions from your financial data
          </p>
        </div>
      </div>

      {/* Advanced Analytics Dashboard */}
      <AdvancedAnalyticsDashboard />

      {/* Transaction-specific Analytics */}
      <TransactionAnalytics 
        filteredTransactions={transactions} 
        timeRange="30d"
      />
    </div>
  );
};

export default Analytics;