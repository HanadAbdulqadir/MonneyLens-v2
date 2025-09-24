import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X, 
  TrendingUp, 
  TrendingDown,
  Fuel,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";

interface DataFilterProps {
  onFiltersChange?: (filters: FilterState) => void;
  showTimeRange?: boolean;
  showCategories?: boolean;
  showAmountRange?: boolean;
  compact?: boolean;
}

export interface FilterState {
  timeRange: string;
  customStartDate?: Date;
  customEndDate?: Date;
  categories: string[];
  amountRange: { min: number; max: number };
  transactionType: 'all' | 'income' | 'expense';
}

const DataFilter = ({ 
  onFiltersChange,
  showTimeRange = true,
  showCategories = true, 
  showAmountRange = true,
  compact = false 
}: DataFilterProps) => {
  const { transactions, categoryFilter, setCategoryFilter } = useFinancial();
  
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '30d',
    categories: [],
    amountRange: { min: 0, max: 10000 },
    transactionType: 'all'
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const categoryOptions = [
    { value: 'Earnings', label: 'Earnings', icon: TrendingUp, color: 'text-success' },
    { value: 'Petrol', label: 'Petrol', icon: Fuel, color: 'text-warning' },
    { value: 'Food', label: 'Food', icon: UtensilsCrossed, color: 'text-destructive' },
    { value: 'Other', label: 'Other', icon: ShoppingBag, color: 'text-muted-foreground' }
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const clearAllFilters = () => {
    const resetFilters: FilterState = {
      timeRange: '30d',
      categories: [],
      amountRange: { min: 0, max: 10000 },
      transactionType: 'all'
    };
    setFilters(resetFilters);
    setCategoryFilter?.(null);
    onFiltersChange?.(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.timeRange !== '30d') count++;
    if (filters.categories.length > 0) count++;
    if (filters.transactionType !== 'all') count++;
    if (filters.amountRange.min > 0 || filters.amountRange.max < 10000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {showTimeRange && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Range</label>
                  <Select value={filters.timeRange} onValueChange={(value) => updateFilters({ timeRange: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRangeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showCategories && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(category => {
                      const Icon = category.icon;
                      const isSelected = filters.categories.includes(category.value);
                      return (
                        <Button
                          key={category.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCategory(category.value)}
                          className="text-xs"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {category.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Transaction Type</label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All', icon: DollarSign },
                    { value: 'income', label: 'Income', icon: TrendingUp },
                    { value: 'expense', label: 'Expense', icon: TrendingDown }
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={filters.transactionType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilters({ transactionType: type.value as any })}
                        className="flex-1 text-xs"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Chips */}
        {filters.categories.map(category => (
          <Badge key={category} variant="secondary" className="text-xs">
            {category}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => toggleCategory(category)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Data Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showTimeRange && (
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={filters.timeRange} onValueChange={(value) => updateFilters({ timeRange: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filters.timeRange === 'custom' && (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 text-xs">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.customStartDate && filters.customEndDate
                      ? `${format(filters.customStartDate, 'MMM d')} - ${format(filters.customEndDate, 'MMM d')}`
                      : 'Select dates'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.customStartDate,
                      to: filters.customEndDate
                    }}
                    onSelect={(range) => {
                      updateFilters({
                        customStartDate: range?.from,
                        customEndDate: range?.to
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {showCategories && (
          <div>
            <label className="text-sm font-medium mb-2 block">Categories</label>
            <div className="flex flex-wrap gap-1">
              {categoryOptions.map(category => {
                const Icon = category.icon;
                const isSelected = filters.categories.includes(category.value);
                return (
                  <Button
                    key={category.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category.value)}
                    className="text-xs h-8"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">Transaction Type</label>
          <div className="space-y-1">
            {[
              { value: 'all', label: 'All Transactions', icon: DollarSign },
              { value: 'income', label: 'Income Only', icon: TrendingUp },
              { value: 'expense', label: 'Expenses Only', icon: TrendingDown }
            ].map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={filters.transactionType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ transactionType: type.value as any })}
                  className="w-full justify-start text-xs h-8"
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DataFilter;