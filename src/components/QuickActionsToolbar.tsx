import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Zap, 
  Calculator,
  Clock,
  Bookmark,
  Command,
  X,
  Minimize2,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const QuickActionsToolbar = () => {
  const { toast } = useToast();
  const { transactions, addTransaction } = useFinancial();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    amount: '',
    category: 'Food'
  });

  // Quick add transaction
  const handleQuickAdd = () => {
    const amount = parseFloat(quickAddData.amount);
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    addTransaction({
      amount: quickAddData.category === 'Earnings' ? amount : -Math.abs(amount),
      category: quickAddData.category,
      date: new Date().toISOString().split('T')[0],
      week: `Week ${Math.ceil(new Date().getDate() / 7)}`
    });

    setQuickAddData({ amount: '', category: 'Food' });
    setIsOpen(false);
    toast({
      title: "Transaction Added",
      description: `${quickAddData.category} transaction recorded successfully`
    });
  };

  // Export data as CSV
  const exportData = () => {
    const csvContent = [
      'Date,Category,Amount,Week',
      ...transactions.map(t => 
        `${t.date},${t.category},${t.amount},${t.week}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your financial data has been downloaded as CSV"
    });
  };

  // Quick calculations
  const getQuickStats = () => {
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const monthTransactions = transactions.filter(t => 
      new Date(t.date) >= monthStart
    );
    
    const income = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses, net: income - expenses };
  };

  const stats = getQuickStats();

  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K = Quick add
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  return (
    <TooltipProvider>
      {/* Quick Stats Bar */}
      <Card className={`fixed top-4 right-4 z-40 bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 cursor-pointer ${
        isMinimized ? 'w-16 h-16 rounded-full shadow-xl hover:shadow-2xl hover:scale-105' : 'w-80'
      }`}
      onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
        
        {/* Toolbar Header */}
        <div className={`flex items-center justify-between p-3 border-b bg-muted/30 ${
          isMinimized ? 'border-b-0 bg-transparent p-0 justify-center h-16 rounded-full hover:bg-primary/10' : ''
        }`}>
          <div className="flex items-center gap-2">
            {!isMinimized ? (
              <>
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Quick Actions</h3>
              </>
            ) : (
              <div className="relative flex items-center justify-center w-full h-full">
                <Wallet className="h-6 w-6 text-primary transition-all duration-300 hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse opacity-60" />
              </div>
            )}
          </div>
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                This Month
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {!isMinimized && (
          <div className="p-3 space-y-3 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center p-2 rounded-lg bg-success/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <div className="text-success font-medium">£{stats.income.toFixed(0)}</div>
                </div>
                <div className="text-muted-foreground">Income</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-destructive/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <div className="text-destructive font-medium">£{stats.expenses.toFixed(0)}</div>
                </div>
                <div className="text-muted-foreground">Spent</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className={`flex items-center justify-center gap-1 mb-1 font-medium ${stats.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                  <Wallet className="h-3 w-3" />
                  <div>£{Math.abs(stats.net).toFixed(0)}</div>
                </div>
                <div className="text-muted-foreground">
                  {stats.net >= 0 ? 'Saved' : 'Over'}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                onClick={() => setIsOpen(true)}
                className="gap-2 text-xs h-9 hover:bg-primary/10 hover:text-primary transition-colors"
                title="Quick Add Transaction (Ctrl+K)"
              >
                <Plus className="h-3 w-3" />
                Add Transaction
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={exportData}
                className="gap-2 text-xs h-9 hover:bg-muted transition-colors"
                title="Export Data"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </Button>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-center gap-2">
                <div className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs font-mono">Ctrl+K</kbd> for quick add
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimized Click Area - Remove this since card itself is clickable now */}
      </Card>

      {/* Quick Add Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Add Transaction
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (£)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={quickAddData.amount}
                onChange={(e) => setQuickAddData(prev => ({ 
                  ...prev, 
                  amount: e.target.value 
                }))}
                autoFocus
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {['Earnings', 'Food', 'Petrol', 'Other'].map(category => (
                  <Button
                    key={category}
                    variant={quickAddData.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuickAddData(prev => ({ 
                      ...prev, 
                      category 
                    }))}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Description - For now, we'll remove this since Transaction interface doesn't have description */}
            {/* 
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input
                placeholder="What was this for?"
                value={quickAddData.description}
                onChange={(e) => setQuickAddData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickAdd();
                  }
                }}
              />
            </div>
            */}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickAdd}>
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default QuickActionsToolbar;