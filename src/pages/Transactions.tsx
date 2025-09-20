import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState, useMemo } from "react";
import { Plus, Download, Filter, BarChart3 } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionAnalytics from "@/components/TransactionAnalytics";
import EnhancedTransactionList from "@/components/EnhancedTransactionList";
import TransactionInsights from "@/components/TransactionInsights";
import DataFilter, { FilterState } from "@/components/DataFilter";
import ResponsiveLayout, { ResponsiveGrid } from "@/components/ResponsiveLayout";
import LoadingState from "@/components/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

const Transactions = () => {
  const { transactions } = useFinancial();
  const { toast } = useToast();
  
  // State for enhanced filtering
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '30d',
    categories: [],
    amountRange: { min: 0, max: 10000 },
    transactionType: 'all'
  });
  
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced transaction filtering
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.timeRange) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        case '1y':
          startDate = subDays(now, 365);
          break;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            return result.filter(t => isWithinInterval(parseISO(t.date), {
              start: startOfDay(filters.customStartDate!),
              end: endOfDay(filters.customEndDate!)
            }));
          }
          return result;
        default:
          startDate = subDays(now, 30);
      }

      result = result.filter(t => parseISO(t.date) >= startDate);
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(t => filters.categories.includes(t.category));
    }

    // Transaction type filter
    if (filters.transactionType !== 'all') {
      if (filters.transactionType === 'income') {
        result = result.filter(t => t.category === 'Earnings');
      } else if (filters.transactionType === 'expense') {
        result = result.filter(t => t.category !== 'Earnings');
      }
    }

    // Amount range filter
    if (filters.amountRange.min > 0 || filters.amountRange.max < 10000) {
      result = result.filter(t => {
        const amount = Math.abs(t.amount);
        return amount >= filters.amountRange.min && amount <= filters.amountRange.max;
      });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleExportTransactions = () => {
    // Mock export functionality
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Export Complete",
        description: "Transactions exported successfully",
      });
    }, 2000);
  };

  return (
    <ResponsiveLayout className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Transactions</h1>
          <p className="text-muted-foreground">
            Advanced transaction management with analytics and insights
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <span className="text-sm font-medium">
              Total: £{filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportTransactions}
            disabled={isLoading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
          
          <AddTransactionModal />
        </div>
      </div>

      {/* Advanced Data Filter */}
      <DataFilter 
        onFiltersChange={handleFiltersChange}
        showTimeRange={true}
        showCategories={true}
        showAmountRange={true}
        compact={false}
      />

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="space-y-6">
          <ResponsiveGrid columns={{ sm: 1 }} gap={6}>
            <TransactionAnalytics 
              filteredTransactions={filteredTransactions} 
              timeRange={filters.timeRange}
            />
          </ResponsiveGrid>
          
          <TransactionInsights filteredTransactions={filteredTransactions} />
        </div>
      )}

      {/* Enhanced Transaction List */}
      {isLoading ? (
        <LoadingState type="table" title="Loading transactions..." />
      ) : (
        <EnhancedTransactionList 
          filteredTransactions={filteredTransactions}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </ResponsiveLayout>
  );
};

export default Transactions;