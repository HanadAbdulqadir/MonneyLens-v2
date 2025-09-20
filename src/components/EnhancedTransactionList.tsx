import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinancial } from "@/contexts/FinancialContext";
import { useVirtualScroll, useDebouncedSearch } from "@/hooks/usePerformance";
import { 
  Search, 
  Filter, 
  Trash2, 
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
  Download,
  Archive,
  Edit,
  Copy,
  Fuel, 
  UtensilsCrossed, 
  ShoppingBag, 
  TrendingUp,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isWithinInterval, subDays, startOfDay, endOfDay } from "date-fns";

interface EnhancedTransactionListProps {
  filteredTransactions: any[];
  onFiltersChange?: (filters: any) => void;
}

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'list' | 'grid' | 'compact';

const EnhancedTransactionList = ({ 
  filteredTransactions, 
  onFiltersChange 
}: EnhancedTransactionListProps) => {
  const { deleteTransaction } = useFinancial();
  const { toast } = useToast();
  
  // Search and filters
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useDebouncedSearch('', 300);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState('all');
  
  // Sorting and view
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Selection and bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  const getIcon = (category: string) => {
    switch (category) {
      case "Petrol": return Fuel;
      case "Food": return UtensilsCrossed;
      case "Other": return ShoppingBag;
      case "Earnings": return TrendingUp;
      default: return ShoppingBag;
    }
  };

  const getColorClass = (category: string) => {
    switch (category) {
      case "Petrol": return "text-warning bg-warning/10 border-warning/20";
      case "Food": return "text-destructive bg-destructive/10 border-destructive/20";
      case "Other": return "text-muted-foreground bg-muted/50 border-muted/50";
      case "Earnings": return "text-success bg-success/10 border-success/20";
      default: return "text-muted-foreground bg-muted/50 border-muted/50";
    }
  };

  // Advanced filtering and sorting
  const processedTransactions = useMemo(() => {
    let result = filteredTransactions;

    // Search filter
    if (debouncedSearchTerm) {
      result = result.filter(t => 
        t.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        t.amount.toString().includes(debouncedSearchTerm)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Amount range filter
    if (amountRange.min || amountRange.max) {
      result = result.filter(t => {
        const amount = Math.abs(t.amount);
        const min = parseFloat(amountRange.min) || 0;
        const max = parseFloat(amountRange.max) || Infinity;
        return amount >= min && amount <= max;
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date, endDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7);
          endDate = now;
          break;
        case 'month':
          startDate = subDays(now, 30);
          endDate = now;
          break;
        default:
          startDate = new Date(0);
          endDate = now;
      }

      result = result.filter(t => {
        const transactionDate = parseISO(t.date);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filteredTransactions, debouncedSearchTerm, categoryFilter, amountRange, dateRange, sortField, sortOrder]);

  // Virtual scrolling for performance
  const { visibleItems, totalHeight, handleScroll } = useVirtualScroll(processedTransactions, 70, 400);

  // Selection handlers
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === processedTransactions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(processedTransactions.map((_, index) => index.toString())));
    }
  }, [processedTransactions.length, selectedItems.size]);

  // Bulk operations
  const handleBulkDelete = useCallback(() => {
    selectedItems.forEach(id => {
      const index = parseInt(id);
      if (processedTransactions[index]) {
        deleteTransaction(processedTransactions[index].dailyEntryId.toString());
      }
    });
    
    setSelectedItems(new Set());
    toast({
      title: "Success",
      description: `${selectedItems.size} transactions deleted`,
    });
  }, [selectedItems, processedTransactions, deleteTransaction, toast]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy • EEE');
  };

  const renderTransaction = (transaction: any, index: number) => {
    const Icon = getIcon(transaction.category);
    const isEarnings = transaction.category === "Earnings";
    const isSelected = selectedItems.has(index.toString());

    if (viewMode === 'compact') {
      return (
        <div 
          key={index} 
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
            isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50 border-border'
          }`}
        >
          {bulkActionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectItem(index.toString())}
            />
          )}
          
          <div className={`p-2 rounded-lg ${getColorClass(transaction.category)}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{transaction.category}</p>
            <p className="text-xs text-muted-foreground">{format(parseISO(transaction.date), 'MMM dd')}</p>
          </div>
          
          <span className={`font-semibold ${isEarnings ? 'text-success' : 'text-foreground'}`}>
            {isEarnings ? '+' : '-'}£{transaction.amount.toFixed(2)}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteTransaction(transaction.dailyEntryId.toString())}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div 
        key={index} 
        className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm group ${
          isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50 border-border'
        }`}
      >
        <div className="flex items-center gap-4">
          {bulkActionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectItem(index.toString())}
            />
          )}
          
          <div className={`p-3 rounded-lg border ${getColorClass(transaction.category)}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">{transaction.category}</p>
              <Badge variant="outline" className="text-xs">
                {transaction.week}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`font-bold text-lg ${isEarnings ? 'text-success' : 'text-foreground'}`}>
              {isEarnings ? '+' : '-'}£{transaction.amount.toFixed(2)}
            </span>
            <p className="text-xs text-muted-foreground">
              {isEarnings ? 'Income' : 'Expense'}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Transaction
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteTransaction(transaction.dailyEntryId.toString())}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      {/* Enhanced Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Transactions ({processedTransactions.length})
          </h3>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {[
                { mode: 'list' as ViewMode, icon: Filter },
                { mode: 'compact' as ViewMode, icon: Circle },
              ].map(({ mode, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Bulk Actions */}
            <Button
              variant={bulkActionMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setBulkActionMode(!bulkActionMode)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Select
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Earnings">Earnings</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Input
                type="number"
                placeholder="Min £"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24"
              />
              <Input
                type="number"
                placeholder="Max £"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          {[
            { field: 'date' as SortField, label: 'Date' },
            { field: 'amount' as SortField, label: 'Amount' },
            { field: 'category' as SortField, label: 'Category' },
          ].map(({ field, label }) => (
            <Button
              key={field}
              variant={sortField === field ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleSort(field)}
              className="text-xs"
            >
              {label}
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </Button>
          ))}
        </div>

        {/* Bulk Actions Bar */}
        {bulkActionMode && selectedItems.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium">
              {selectedItems.size} transaction{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-auto" onScroll={handleScroll}>
        {visibleItems.map((transaction, index) => renderTransaction(transaction, index))}
        
        {processedTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found matching your filters</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setAmountRange({ min: '', max: '' });
              setDateRange('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Selection Controls */}
      {bulkActionMode && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedItems.size === processedTransactions.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {processedTransactions.length} total transactions
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedTransactionList;