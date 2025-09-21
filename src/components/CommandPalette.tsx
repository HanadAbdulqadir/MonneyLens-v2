import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  CreditCard, 
  Target, 
  TrendingUp, 
  PieChart,
  Settings,
  Calendar,
  Wallet,
  Flag,
  RefreshCw,
  LayoutDashboard,
  Calculator,
  FileText,
  HelpCircle,
  Command
} from "lucide-react";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'actions' | 'tools' | 'help';
  shortcut?: string;
}

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const commands: Command[] = [
    // Navigation Commands
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'View your financial overview',
      icon: LayoutDashboard,
      action: () => navigate('/'),
      keywords: ['dashboard', 'home', 'overview'],
      category: 'navigation'
    },
    {
      id: 'nav-transactions',
      title: 'Go to Transactions',
      subtitle: 'Manage your transactions',
      icon: CreditCard,
      action: () => navigate('/transactions'),
      keywords: ['transactions', 'payments', 'spending'],
      category: 'navigation'
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics',
      subtitle: 'View detailed insights',
      icon: TrendingUp,
      action: () => navigate('/analytics'),
      keywords: ['analytics', 'insights', 'reports', 'charts'],
      category: 'navigation'
    },
    {
      id: 'nav-budget',
      title: 'Go to Budget',
      subtitle: 'Manage your budgets',
      icon: Target,
      action: () => navigate('/budget'),
      keywords: ['budget', 'spending', 'limits'],
      category: 'navigation'
    },
    {
      id: 'nav-goals',
      title: 'Go to Goals',
      subtitle: 'Track your financial goals',
      icon: Flag,
      action: () => navigate('/goals'),
      keywords: ['goals', 'savings', 'targets'],
      category: 'navigation'
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Customize your preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'configuration'],
      category: 'navigation'
    },

    // Action Commands
    {
      id: 'action-add-transaction',
      title: 'Add Transaction',
      subtitle: 'Record a new transaction',
      icon: Plus,
      action: () => {
        const addButton = document.querySelector('[data-add-transaction] button') as HTMLButtonElement;
        if (addButton) addButton.click();
      },
      keywords: ['add', 'new', 'transaction', 'record', 'expense', 'income'],
      category: 'actions',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'action-quick-expense',
      title: 'Quick Expense Entry',
      subtitle: 'Add expense with smart defaults',
      icon: CreditCard,
      action: () => {
        toast({
          title: "Quick Entry",
          description: "Opening expense form with smart defaults...",
        });
        // Trigger add transaction with expense preset
        const addButton = document.querySelector('[data-add-transaction] button') as HTMLButtonElement;
        if (addButton) addButton.click();
      },
      keywords: ['expense', 'spend', 'quick', 'fast'],
      category: 'actions',
      shortcut: 'Ctrl+E'
    },
    {
      id: 'action-quick-income',
      title: 'Quick Income Entry',
      subtitle: 'Record income quickly',
      icon: TrendingUp,
      action: () => {
        toast({
          title: "Income Entry",
          description: "Opening income form...",
        });
        const addButton = document.querySelector('[data-add-transaction] button') as HTMLButtonElement;
        if (addButton) addButton.click();
      },
      keywords: ['income', 'salary', 'earn', 'receive'],
      category: 'actions',
      shortcut: 'Ctrl+I'
    },

    // Tool Commands
    {
      id: 'tool-calculator',
      title: 'Calculator',
      subtitle: 'Quick calculations',
      icon: Calculator,
      action: () => {
        toast({
          title: "Calculator",
          description: "Opening calculator...",
        });
        // Could open a calculator modal
      },
      keywords: ['calculator', 'calculate', 'math'],
      category: 'tools'
    },
    {
      id: 'tool-export',
      title: 'Export Data',
      subtitle: 'Download your financial data',
      icon: FileText,
      action: () => navigate('/settings'),
      keywords: ['export', 'download', 'backup', 'data'],
      category: 'tools'
    },

    // Help Commands
    {
      id: 'help-tour',
      title: 'Take Tour',
      subtitle: 'Learn how to use MoneyLens',
      icon: HelpCircle,
      action: () => {
        const tourButton = document.querySelector('[title="Take the tour again"]') as HTMLButtonElement;
        if (tourButton) tourButton.click();
      },
      keywords: ['help', 'tour', 'tutorial', 'guide'],
      category: 'help'
    },
    {
      id: 'help-shortcuts',
      title: 'Keyboard Shortcuts',
      subtitle: 'View all available shortcuts',
      icon: Command,
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "Ctrl+K: Command Palette, Ctrl+T: Add Transaction, Ctrl+E: Quick Expense",
        });
      },
      keywords: ['shortcuts', 'keyboard', 'hotkeys'],
      category: 'help'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    tools: 'Tools',
    help: 'Help'
  };

  const executeCommand = useCallback((command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearch('');
          setSelectedIndex(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand]);

  // Global shortcut to open command palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <Input
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
            autoFocus
          />
          <Badge variant="secondary" className="ml-auto text-xs">
            Ctrl+K
          </Badge>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No commands found for "{search}"
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, commands]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>
                  <div className="space-y-1">
                    {commands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const Icon = command.icon;
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <Button
                          key={command.id}
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-auto p-3 text-left ${
                            isSelected ? 'bg-accent' : ''
                          }`}
                          onClick={() => executeCommand(command)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{command.title}</div>
                            {command.subtitle && (
                              <div className="text-xs text-muted-foreground">{command.subtitle}</div>
                            )}
                          </div>
                          {command.shortcut && (
                            <Badge variant="outline" className="text-xs">
                              {command.shortcut}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Navigate with ↑↓ • Select with Enter • Close with Esc</span>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;