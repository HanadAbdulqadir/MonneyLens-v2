import { useState } from 'react';
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { usePots } from "@core/contexts/PotsContext";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { Calendar } from "@shared/components/ui/calendar";
import { Badge } from "@shared/components/ui/badge";
import { Plus, CalendarIcon, Tag, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@shared/lib/utils";
import { toast } from 'sonner';

interface QuickAddTransactionProps {
  className?: string;
}

const categories = [
  'Income',
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Personal Care',
  'Education',
  'Savings',
  'Debt',
  'Gifts',
  'Other'
];

export default function QuickAddTransaction({ className }: QuickAddTransactionProps) {
  const { addTransaction } = useFinancial();
  const { pots } = usePots();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date(),
    potId: '',
    tags: [] as string[]
  });
  const [customTag, setCustomTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsLoading(true);

    try {
      await addTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: format(formData.date, 'yyyy-MM-dd'),
        pot_id: formData.potId || null,
        tags: formData.tags
      });

      toast.success('Transaction added successfully');
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date(),
        potId: '',
        tags: []
      });
      setCustomTag('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add Transaction
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Transaction</h3>
              <Badge variant="secondary" className="text-xs">
                Quick Add
              </Badge>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What was this transaction for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Pot Allocation */}
            {pots.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="pot" className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Assign to Pot (Optional)
                </Label>
                <Select value={formData.potId} onValueChange={(value) => setFormData(prev => ({ ...prev, potId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No pot assigned</SelectItem>
                    {pots.map(pot => (
                      <SelectItem key={pot.id} value={pot.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: pot.color }}
                          />
                          {pot.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
