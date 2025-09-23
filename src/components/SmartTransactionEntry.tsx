import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelector } from '@/components/CategorySelector';
import { useFinancial } from '@/contexts/SupabaseFinancialContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Plus, 
  Mic, 
  Camera, 
  MapPin, 
  Clock, 
  Zap, 
  X,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SmartTransactionEntryProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerPosition?: { x: number; y: number };
}

const SmartTransactionEntry: React.FC<SmartTransactionEntryProps> = ({ 
  open, 
  onOpenChange,
  triggerPosition 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [quickAmounts] = useState([5, 10, 20, 50, 100]);
  const [frequentCategories, setFrequentCategories] = useState<string[]>([]);
  
  const { addTransaction, transactions } = useFinancial();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const recognitionRef = useRef<any>(null);

  // Calculate frequent categories from transaction history
  useEffect(() => {
    const categoryCounts: Record<string, number> = {};
    transactions.forEach(transaction => {
      categoryCounts[transaction.category] = (categoryCounts[transaction.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
    
    setFrequentCategories(sortedCategories);
  }, [transactions]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceInput(transcript);
        processVoiceInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice input failed",
          description: "Please try again or type manually",
          variant: "destructive"
        });
      };
    }
  }, []);

  const processVoiceInput = (transcript: string) => {
    // Simple NLP for common patterns
    const amountMatch = transcript.match(/(\d+(?:\.\d{2})?)/);
    const categoryKeywords: Record<string, string[]> = {
      'Food & Dining': ['food', 'lunch', 'dinner', 'restaurant', 'coffee', 'groceries'],
      'Transportation': ['transport', 'bus', 'train', 'taxi', 'fuel', 'parking'],
      'Shopping': ['shopping', 'store', 'mall', 'clothes', 'electronics'],
      'Entertainment': ['movie', 'concert', 'game', 'entertainment', 'netflix'],
      'Bills & Utilities': ['bill', 'utility', 'electric', 'water', 'internet']
    };

    let detectedCategory = '';
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
        detectedCategory = category;
        break;
      }
    }

    setFormData(prev => ({
      ...prev,
      description: transcript,
      amount: amountMatch ? amountMatch[1] : '',
      category: detectedCategory
    }));
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleQuickCategory = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please enter amount and category",
        variant: "destructive"
      });
      return;
    }

    addTransaction({
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description || `Transaction ${new Date().toLocaleTimeString()}`,
      week: 'W' + Math.ceil(new Date().getDate() / 7)
    });

    toast({
      title: "Transaction added!",
      description: "Your transaction has been recorded successfully",
    });

    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      location: ''
    });
    setVoiceInput('');
    setIsOpen(false);
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <Button
          onClick={() => setDialogOpen(true)}
          className={`
            fixed z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
            ${isMobile 
              ? 'bottom-24 right-4 w-16 h-16 text-2xl' 
              : 'bottom-8 right-8 w-14 h-14 text-xl'
            }
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
          `}
          style={triggerPosition ? {
            position: 'fixed',
            left: triggerPosition.x - 28,
            top: triggerPosition.y - 28
          } : {}}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={`
          sm:max-w-[500px] p-0 overflow-hidden
          ${isMobile ? 'max-h-[90vh]' : ''}
        `}>
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Transaction Entry
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Voice Input Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Input (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your transaction..."
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopVoiceInput : startVoiceInput}
                  className="shrink-0"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <div className="animate-pulse">● Recording...</div>
                </div>
              )}
            </div>

            {/* Quick Amount Presets */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Quick Amounts
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amount => (
                  <Badge
                    key={amount}
                    variant={formData.amount === amount.toString() ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => handleQuickAmount(amount)}
                  >
                    £{amount}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            {/* Quick Categories */}
            {frequentCategories.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Frequent Categories
                </Label>
                <div className="flex flex-wrap gap-2">
                  {frequentCategories.map(category => (
                    <Badge
                      key={category}
                      variant={formData.category === category ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => handleQuickCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="mt-1">
                <CategorySelector 
                  value={formData.category}
                  onCategorySelect={(value) => setFormData(prev => ({ ...prev, category: value || '' }))}
                  showCreateNew={true}
                />
              </div>
            </div>

            {/* Date Input */}
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What was this for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                Add Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartTransactionEntry;
