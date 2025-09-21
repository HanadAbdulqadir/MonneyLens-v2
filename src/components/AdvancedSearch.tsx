import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFinancial } from "@/contexts/FinancialContext";
import { format, isWithinInterval, parseISO } from "date-fns";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onResultsChange?: (results: any[]) => void;
  compact?: boolean;
}

const AdvancedSearch = ({ onResultsChange, compact = false }: AdvancedSearchProps) => {
  const { transactions } = useFinancial();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Search and filter logic
  const searchResults = useMemo(() => {
    let results = [...transactions];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      results = results.filter(transaction => 
        transaction.category.toLowerCase().includes(query) ||
        (transaction.description && transaction.description.toLowerCase().includes(query)) ||
        transaction.date.includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      results = results.filter(transaction => 
        transaction.category === filters.category
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      results = results.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        
        if (filters.dateRange.from && filters.dateRange.to) {
          return isWithinInterval(transactionDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          });
        }
        
        if (filters.dateRange.from) {
          return transactionDate >= filters.dateRange.from;
        }
        
        if (filters.dateRange.to) {
          return transactionDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }

    // Amount range filter
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
      results = results.filter(transaction => {
        const absAmount = Math.abs(transaction.amount);
        
        if (filters.amountRange.min !== null && filters.amountRange.max !== null) {
          return absAmount >= filters.amountRange.min && absAmount <= filters.amountRange.max;
        }
        
        if (filters.amountRange.min !== null) {
          return absAmount >= filters.amountRange.min;
        }
        
        if (filters.amountRange.max !== null) {
          return absAmount <= filters.amountRange.max;
        }
        
        return true;
      });
    }

    // Sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
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
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [transactions, filters]);

  // Notify parent component of results
  React.useEffect(() => {
    if (onResultsChange) {
      onResultsChange(searchResults);
    }
  }, [searchResults, onResultsChange]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null },
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.query,
    filters.category !== 'all' ? filters.category : null,
    filters.dateRange.from || filters.dateRange.to ? 'dateRange' : null,
    filters.amountRange.min !== null || filters.amountRange.max !== null ? 'amountRange' : null
  ].filter(Boolean).length;

  // Export search results
  const exportResults = () => {
    const csvContent = [
      'Date,Category,Amount,Description',
      ...searchResults.map(t => 
        `${t.date},${t.category},${t.amount},"${t.description || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Search</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </Badge>
          
          {searchResults.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportResults} className="gap-2">
              <Download className="h-3 w-3" />
              Export
            </Button>
          )}
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Query */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by category, description, or date..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Earnings">Earnings</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd")} - {format(filters.dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from || undefined}
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined
                  }}
                  onSelect={(range) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { 
                      from: range?.from || null, 
                      to: range?.to || null 
                    }
                  }))}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount Range (£)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.amountRange.min || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { 
                    ...prev.amountRange, 
                    min: e.target.value ? parseFloat(e.target.value) : null 
                  }
                }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.amountRange.max || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { 
                    ...prev.amountRange, 
                    max: e.target.value ? parseFloat(e.target.value) : null 
                  }
                }))}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <div className="flex gap-2">
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: 'date' | 'amount' | 'category') => 
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
                className="px-3"
              >
                {filters.sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchResults.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Found {searchResults.length} transaction{searchResults.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Total: £{searchResults.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
                </span>
                <span>
                  Income: £{searchResults.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
                <span>
                  Expenses: £{searchResults.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedSearch;