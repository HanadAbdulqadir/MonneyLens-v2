import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Lightbulb, 
  Tag, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  Fuel,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SmartTransactionEntryProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface CategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
  icon: any;
}

const SmartTransactionEntry = ({ trigger, onSuccess }: SmartTransactionEntryProps) => {
  const [open, setOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addTransaction, transactions } = useFinancial();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date(),
    description: '',
    category: '',
    amount: '',
    week: 'W4',
    tags: [] as string[]
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);

  // Smart category prediction based on description
  const predictCategory = useCallback((description: string): CategorySuggestion[] => {
    if (!description || description.length < 3) return [];

    const desc = description.toLowerCase();
    const suggestions: CategorySuggestion[] = [];

    // Earnings keywords
    const earningsKeywords = ['salary', 'wage', 'income', 'bonus', 'freelance', 'payment', 'refund', 'cashback'];
    if (earningsKeywords.some(keyword => desc.includes(keyword))) {
      suggestions.push({
        category: 'Earnings',
        confidence: 0.9,
        reason: 'Contains income-related keywords',
        icon: TrendingUp
      });
    }

    // Petrol keywords
    const petrolKeywords = ['petrol', 'gas', 'fuel', 'station', 'bp', 'shell', 'esso', 'tesco fuel'];
    if (petrolKeywords.some(keyword => desc.includes(keyword))) {
      suggestions.push({
        category: 'Petrol',
        confidence: 0.95,
        reason: 'Contains fuel-related keywords',
        icon: Fuel
      });
    }

    // Food keywords
    const foodKeywords = ['food', 'restaurant', 'cafe', 'lunch', 'dinner', 'grocery', 'takeaway', 'delivery', 'mcdonalds', 'kfc', 'pizza', 'tesco', 'asda', 'sainsbury'];
    if (foodKeywords.some(keyword => desc.includes(keyword))) {
      suggestions.push({
        category: 'Food',
        confidence: 0.85,
        reason: 'Contains food/restaurant keywords',
        icon: UtensilsCrossed
      });
    }

    // If no specific category found, suggest based on amount patterns
    if (suggestions.length === 0) {
      suggestions.push({
        category: 'Other',
        confidence: 0.5,
        reason: 'No specific keywords found',
        icon: ShoppingBag
      });
    }

    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }, []);

  // Analyze transaction patterns for better suggestions
  const analyzeTransactionPatterns = useCallback((description: string, amount: number) => {
    // Find similar transactions
    const similarTransactions = transactions.filter(t => {
      const descSimilarity = description.toLowerCase().split(' ').some(word => 
        t.category.toLowerCase().includes(word.toLowerCase())
      );
      const amountSimilarity = Math.abs(t.amount - amount) < 10; // Within £10
      return descSimilarity || amountSimilarity;
    });

    if (similarTransactions.length > 0) {
      // Get most common category from similar transactions
      const categoryCount = similarTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0][0];

      return {
        suggestedCategory: mostCommonCategory,
        confidence: 0.8,
        reason: `Based on ${similarTransactions.length} similar transactions`
      };
    }

    return null;
  }, [transactions]);

  // Real-time validation
  const validateField = useCallback((field: string, value: any): ValidationError | null => {
    switch (field) {
      case 'amount':
        const numAmount = parseFloat(value);
        if (isNaN(numAmount) || numAmount <= 0) {
          return { field, message: 'Amount must be a positive number' };
        }
        if (numAmount > 10000) {
          return { field, message: 'Amount seems unusually high. Please verify.' };
        }
        break;
        
      case 'description':
        if (value.length < 3) {
          return { field, message: 'Description should be at least 3 characters' };
        }
        break;
        
      case 'category':
        if (!value) {
          return { field, message: 'Please select a category' };
        }
        break;
        
      case 'date':
        if (!value) {
          return { field, message: 'Please select a date' };
        }
        const selectedDate = new Date(value);
        const now = new Date();
        const futureLimit = new Date();
        futureLimit.setDate(now.getDate() + 30);
        
        if (selectedDate > futureLimit) {
          return { field, message: 'Date cannot be more than 30 days in the future' };
        }
        break;
    }
    return null;
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field));
    
    // Validate the field
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => [...prev.filter(e => e.field !== field), error]);
    }

    // Smart suggestions when description changes
    if (field === 'description' && value.length >= 3) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const suggestions = predictCategory(value);
        setCategorySuggestions(suggestions);
        
        // Auto-suggest category if confidence is high enough
        if (suggestions.length > 0 && suggestions[0].confidence >= 0.9 && !formData.category) {
          setFormData(prev => ({ ...prev, category: suggestions[0].category }));
        }
        
        setIsAnalyzing(false);
      }, 500);
    }

    // Analyze patterns when both description and amount are available
    if (field === 'amount' && formData.description && value) {
      const pattern = analyzeTransactionPatterns(formData.description, parseFloat(value));
      if (pattern && !formData.category) {
        setCategorySuggestions(prev => [{
          category: pattern.suggestedCategory,
          confidence: pattern.confidence,
          reason: pattern.reason,
          icon: ShoppingBag
        }, ...prev]);
      }
    }
  }, [formData.category, formData.description, validateField, predictCategory, analyzeTransactionPatterns]);

  // Smart tag extraction
  const extractTags = useCallback((description: string): string[] => {
    const tags = [];
    const desc = description.toLowerCase();
    
    // Common tag patterns
    if (desc.includes('urgent') || desc.includes('emergency')) tags.push('urgent');
    if (desc.includes('monthly') || desc.includes('recurring')) tags.push('recurring');
    if (desc.includes('business') || desc.includes('work')) tags.push('business');
    if (desc.includes('personal') || desc.includes('private')) tags.push('personal');
    if (desc.includes('essential') || desc.includes('necessary')) tags.push('essential');
    
    return tags;
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = [];
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== 'tags') {
        const error = validateField(field, value);
        if (error) errors.push(error);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    try {
      // Auto-extract tags if none provided
      const finalTags = formData.tags.length > 0 
        ? formData.tags 
        : extractTags(formData.description);

      addTransaction({
        date: format(formData.date, 'yyyy-MM-dd'),
        category: formData.category,
        amount: parseFloat(formData.amount),
        week: formData.week,
        // Note: Current transaction interface doesn't support description/tags
        // This would need to be extended in the FinancialContext
      });

      toast({
        title: "Success",
        description: "Transaction added successfully with smart categorization",
      });

      // Reset form
      setFormData({
        date: new Date(),
        description: '',
        category: '',
        amount: '',
        week: 'W4',
        tags: []
      });
      
      setCategorySuggestions([]);
      setValidationErrors([]);
      setOpen(false);
      onSuccess?.();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const getFieldError = (field: string) => 
    validationErrors.find(error => error.field === field);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Smart Add Transaction
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Smart Transaction Entry
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Field with Smart Analysis */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Description *
              {isAnalyzing && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="e.g., Tesco groceries, Shell petrol station, Monthly salary..."
              className={cn(getFieldError('description') && "border-destructive")}
              rows={3}
            />
            {getFieldError('description') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('description')?.message}
              </p>
            )}
          </div>

          {/* Category Suggestions */}
          {categorySuggestions.length > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Smart Category Suggestions</span>
              </div>
              <div className="space-y-2">
                {categorySuggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                        formData.category === suggestion.category 
                          ? "bg-primary/20 border border-primary/30" 
                          : "hover:bg-background"
                      )}
                      onClick={() => handleFieldChange('category', suggestion.category)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{suggestion.category}</p>
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            suggestion.confidence >= 0.8 ? "border-success text-success" :
                            suggestion.confidence >= 0.6 ? "border-warning text-warning" : 
                            "border-muted-foreground text-muted-foreground"
                          )}
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                        {formData.category === suggestion.category && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Field */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                      getFieldError('date') && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleFieldChange('date', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {getFieldError('date') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('date')?.message}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (£) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  className={cn("pl-10", getFieldError('amount') && "border-destructive")}
                />
              </div>
              {getFieldError('amount') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('amount')?.message}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleFieldChange('category', value)}
              >
                <SelectTrigger className={cn(getFieldError('category') && "border-destructive")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Earnings">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      Earnings
                    </div>
                  </SelectItem>
                  <SelectItem value="Petrol">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-warning" />
                      Petrol
                    </div>
                  </SelectItem>
                  <SelectItem value="Food">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-destructive" />
                      Food
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('category') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('category')?.message}
                </p>
              )}
            </div>

            {/* Week Field */}
            <div className="space-y-2">
              <Label>Week</Label>
              <Select 
                value={formData.week} 
                onValueChange={(value) => handleFieldChange('week', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="W1">Week 1</SelectItem>
                  <SelectItem value="W2">Week 2</SelectItem>
                  <SelectItem value="W3">Week 3</SelectItem>
                  <SelectItem value="W4">Week 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-extracted Tags */}
          {formData.description && extractTags(formData.description).length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Auto-detected Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {extractTags(formData.description).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={validationErrors.length > 0 || !formData.description || !formData.category || !formData.amount}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              Add Smart Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SmartTransactionEntry;