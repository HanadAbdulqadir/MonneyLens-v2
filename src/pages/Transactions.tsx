import { Card } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { useState, useMemo } from "react";
import { Plus, Download, Filter, BarChart3, Upload } from "lucide-react";
import AddTransactionModal from "@components/AddTransactionModal";
import SmartTransactionSearch, { SearchFilters } from "@components/SmartTransactionSearch";
import SmartTransactionEntry from "@components/SmartTransactionEntry";
import CSVImportModal from "@components/CSVImportModal";
import TransactionAnalytics from "@components/TransactionAnalytics";
import EnhancedTransactionList from "@components/EnhancedTransactionList";
import TransactionInsights from "@components/TransactionInsights";
import DataFilter, { FilterState } from "@components/DataFilter";
import LoadingState from "@components/LoadingState";
import { useToast } from "@shared/hooks/use-toast";
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
  
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    categories: [],
    tags: [],
    amountRange: { min: 0, max: 10000 },
    dateRange: { from: null, to: null },
    transactionType: 'all',
    recurring: null
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced transaction filtering with smart search
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Apply search query first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.category.toLowerCase().includes(query) ||
        Math.abs(t.amount).toString().includes(query) ||
        t.date.includes(query)
      );
    }

    // Apply search filters
    if (searchFilters.categories.length > 0) {
      result = result.filter(t => searchFilters.categories.includes(t.category));
    }

    if (searchFilters.transactionType !== 'all') {
      if (searchFilters.transactionType === 'income') {
        result = result.filter(t => t.category === 'Earnings');
      } else if (searchFilters.transactionType === 'expense') {
        result = result.filter(t => t.category !== 'Earnings');
      }
    }

    if (searchFilters.amountRange.min > 0 || searchFilters.amountRange.max < 10000) {
      result = result.filter(t => {
        const amount = Math.abs(t.amount);
        return amount >= searchFilters.amountRange.min && amount <= searchFilters.amountRange.max;
      });
    }

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
  }, [transactions, filters, searchQuery, searchFilters]);

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
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto px-4">
      {/* Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>{filteredTransactions.length} of {transactions.length} transactions</span>
            <span className="font-medium">
              Total: £{filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <CSVImportModal />
          <Button
            variant="outline"
            onClick={handleExportTransactions}
            disabled={isLoading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
          <SmartTransactionEntry />
          <AddTransactionModal />
        </div>
      </div>

      {/* Integrated Search and Filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <SmartTransactionSearch 
            onSearch={setSearchQuery}
            onFilterChange={setSearchFilters}
            placeholder="Search transactions, amounts, categories..."
          />
          <DataFilter 
            onFiltersChange={handleFiltersChange}
            showTimeRange={true}
            showCategories={true}
            showAmountRange={true}
            compact={true}
          />
        </div>
      </Card>

      {/* Analytics Section - Conditional */}
      {showAnalytics && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <TransactionAnalytics 
              filteredTransactions={filteredTransactions} 
              timeRange={filters.timeRange}
            />
          </div>
          <div className="xl:col-span-1">
            <TransactionInsights filteredTransactions={filteredTransactions} />
          </div>
        </div>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <LoadingState type="table" title="Loading transactions..." />
      ) : (
        <EnhancedTransactionList 
          filteredTransactions={filteredTransactions}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </div>
  );
};

export default Transactions;