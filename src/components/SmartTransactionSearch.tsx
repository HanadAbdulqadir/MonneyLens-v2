import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Card } from "@shared/components/ui/card";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { useDebouncedSearch } from "@shared/hooks/usePerformance";
import { 
  Search, 
  Filter, 
  X, 
  Tag,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Hash
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";

interface SmartTransactionSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  placeholder?: string;
}

export interface SearchFilters {
  categories: string[];
  tags: string[];
  amountRange: { min: number; max: number };
  dateRange: { from: Date | null; to: Date | null };
  transactionType: 'all' | 'income' | 'expense' | 'recurring' | 'one-time';
  recurring: boolean | null;
}

const SmartTransactionSearch = ({
  onSearch,
  onFilterChange,
  placeholder = "Search transactions, amounts, categories..."
}: SmartTransactionSearchProps) => {
  const { transactions, recurringTransactions } = useFinancial();
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useDebouncedSearch('', 200);
  
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    tags: [],
    amountRange: { min: 0, max: 10000 },
    dateRange: { from: null, to: null },
    transactionType: 'all',
    recurring: null
  });

  // Generate smart suggestions based on search term and transaction history
  const suggestions = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];

    const term = debouncedSearchTerm.toLowerCase();
    const allSuggestions = [];

    // Category suggestions
    const categories = ['Earnings', 'Petrol', 'Food', 'Other'];
    categories.forEach(category => {
      if (category.toLowerCase().includes(term)) {
        allSuggestions.push({
          type: 'category',
          value: category,
          label: `Category: ${category}`,
          icon: Tag,
          count: transactions.filter(t => t.category === category).length
        });
      }
    });

    // Amount suggestions (common amounts)
    const amounts = [...new Set(transactions.map(t => Math.abs(t.amount)))]
      .sort((a, b) => b - a)
      .slice(0, 10);
    
    amounts.forEach(amount => {
      if (amount.toString().includes(term)) {
        allSuggestions.push({
          type: 'amount',
          value: amount,
          label: `Amount: £${amount.toFixed(2)}`,
          icon: DollarSign,
          count: transactions.filter(t => Math.abs(t.amount) === amount).length
        });
      }
    });

    // Date-based suggestions
    const dates = [...new Set(transactions.map(t => t.date))].slice(0, 5);
    dates.forEach(date => {
      const formattedDate = format(parseISO(date), 'MMM dd, yyyy');
      if (formattedDate.toLowerCase().includes(term)) {
        allSuggestions.push({
          type: 'date',
          value: date,
          label: `Date: ${formattedDate}`,
          icon: Calendar,
          count: transactions.filter(t => t.date === date).length
        });
      }
    });

    // Recurring transaction suggestions
    recurringTransactions.forEach(recurring => {
      if (recurring.name.toLowerCase().includes(term)) {
        allSuggestions.push({
          type: 'recurring',
          value: recurring.name,
          label: `Recurring: ${recurring.name}`,
          icon: RefreshCw,
          count: 1
        });
      }
    });

    // Quick filter suggestions
    if ('income'.includes(term)) {
      allSuggestions.push({
        type: 'filter',
        value: 'income',
        label: 'Show only income',
        icon: TrendingUp,
        count: transactions.filter(t => t.category === 'Earnings').length
      });
    }
    
    if ('expense'.includes(term) || 'spending'.includes(term)) {
      allSuggestions.push({
        type: 'filter',
        value: 'expense',
        label: 'Show only expenses',
        icon: TrendingDown,
        count: transactions.filter(t => t.category !== 'Earnings').length
      });
    }

    if ('recurring'.includes(term) || 'repeat'.includes(term)) {
      allSuggestions.push({
        type: 'filter',
        value: 'recurring',
        label: 'Show recurring transactions',
        icon: RefreshCw,
        count: recurringTransactions.length
      });
    }

    return allSuggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [debouncedSearchTerm, transactions, recurringTransactions]);

  // Smart tag extraction from search queries
  const extractedTags = useMemo(() => {
    const tags = [];
    const term = debouncedSearchTerm.toLowerCase();

    // Extract amount ranges
    const amountMatch = term.match(/(\d+)\s*-\s*(\d+)/);
    if (amountMatch) {
      tags.push({
        type: 'amount-range',
        label: `£${amountMatch[1]} - £${amountMatch[2]}`,
        value: { min: parseInt(amountMatch[1]), max: parseInt(amountMatch[2]) }
      });
    }

    // Extract single amounts
    const singleAmountMatch = term.match(/£?(\d+(?:\.\d{2})?)/);
    if (singleAmountMatch && !amountMatch) {
      tags.push({
        type: 'amount',
        label: `£${singleAmountMatch[1]}`,
        value: parseFloat(singleAmountMatch[1])
      });
    }

    // Extract categories
    ['earnings', 'petrol', 'food', 'other'].forEach(cat => {
      if (term.includes(cat)) {
        tags.push({
          type: 'category',
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat.charAt(0).toUpperCase() + cat.slice(1)
        });
      }
    });

    return tags;
  }, [debouncedSearchTerm]);

  const handleSuggestionSelect = useCallback((suggestion: any) => {
    switch (suggestion.type) {
      case 'category':
        const newCategories = filters.categories.includes(suggestion.value)
          ? filters.categories
          : [...filters.categories, suggestion.value];
        setFilters(prev => ({ ...prev, categories: newCategories }));
        onFilterChange({ ...filters, categories: newCategories });
        break;
        
      case 'amount':
        setFilters(prev => ({ 
          ...prev, 
          amountRange: { min: suggestion.value, max: suggestion.value + 10 }
        }));
        break;
        
      case 'filter':
        if (suggestion.value === 'income' || suggestion.value === 'expense' || suggestion.value === 'recurring') {
          const newType = suggestion.value as any;
          setFilters(prev => ({ ...prev, transactionType: newType }));
          onFilterChange({ ...filters, transactionType: newType });
        }
        break;
        
      case 'recurring':
        setFilters(prev => ({ ...prev, recurring: true }));
        onFilterChange({ ...filters, recurring: true });
        break;
    }
    
    setSearchTerm('');
    setIsOpen(false);
  }, [filters, onFilterChange, setSearchTerm]);

  const removeFilter = useCallback((type: string, value?: any) => {
    const newFilters = { ...filters };
    
    switch (type) {
      case 'category':
        newFilters.categories = filters.categories.filter(c => c !== value);
        break;
      case 'tag':
        newFilters.tags = filters.tags.filter(t => t !== value);
        break;
      case 'amount-range':
        newFilters.amountRange = { min: 0, max: 10000 };
        break;
      case 'transaction-type':
        newFilters.transactionType = 'all';
        break;
      case 'recurring':
        newFilters.recurring = null;
        break;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      categories: [],
      tags: [],
      amountRange: { min: 0, max: 10000 },
      dateRange: { from: null, to: null },
      transactionType: 'all',
      recurring: null
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setSearchTerm('');
  }, [onFilterChange, setSearchTerm]);

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    onSearch(value);
    setIsOpen(value.length > 0);
  }, [setSearchTerm, onSearch]);

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.tags.length > 0 || 
    filters.transactionType !== 'all' ||
    filters.recurring !== null ||
    filters.amountRange.min > 0 || 
    filters.amountRange.max < 10000;

  return (
    <div className="space-y-3">
      {/* Main Search Input */}
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
                onFocus={() => setIsOpen(searchTerm.length > 0)}
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2"
                  onClick={clearAllFilters}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-80 p-0" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList className="max-h-80">
                {suggestions.length > 0 ? (
                  <>
                    <CommandGroup heading="Suggestions">
                      {suggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <CommandItem
                            key={index}
                            onSelect={() => handleSuggestionSelect(suggestion)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{suggestion.label}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.count}
                            </Badge>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    
                    {extractedTags.length > 0 && (
                      <CommandGroup heading="Auto-detected">
                        {extractedTags.map((tag, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              if (tag.type === 'category') {
                                handleSuggestionSelect({ type: 'category', value: tag.value });
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <Hash className="h-4 w-4 text-primary mr-2" />
                            <span>{tag.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                ) : (
                  <CommandEmpty>No suggestions found</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter('category', category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.transactionType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.transactionType === 'income' ? <TrendingUp className="h-3 w-3" /> :
               filters.transactionType === 'expense' ? <TrendingDown className="h-3 w-3" /> :
               <RefreshCw className="h-3 w-3" />}
              {filters.transactionType}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter('transaction-type')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.recurring === true && (
            <Badge variant="secondary" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Recurring
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter('recurring')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.amountRange.min > 0 || filters.amountRange.max < 10000) && (
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              £{filters.amountRange.min} - £{filters.amountRange.max}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter('amount-range')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartTransactionSearch;