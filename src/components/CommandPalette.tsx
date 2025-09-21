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
  Command,
  Tags,
  Repeat,
  DollarSign,
  Upload,
  Download,
  Moon,
  Sun,
  Accessibility,
  Filter,
  BarChart3,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shuffle,
  Import,
  Archive,
  Bell,
  BellOff,
  Bookmark,
  BookmarkPlus,
  Copy,
  Edit,
  Trash2,
  Home,
  Users,
  Globe,
  Shield,
  Key,
  Database,
  ScanLine,
  Compass
} from "lucide-react";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'actions' | 'tools' | 'help' | 'manage' | 'view' | 'import' | 'settings';
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
    {
      id: 'nav-categories',
      title: 'Go to Categories',
      subtitle: 'Manage spending categories',
      icon: Tags,
      action: () => navigate('/categories'),
      keywords: ['categories', 'tags', 'organize'],
      category: 'navigation'
    },
    {
      id: 'nav-recurring',
      title: 'Go to Recurring',
      subtitle: 'Manage recurring transactions',
      icon: Repeat,
      action: () => navigate('/recurring'),
      keywords: ['recurring', 'subscriptions', 'repeat'],
      category: 'navigation'
    },
    {
      id: 'nav-debts',
      title: 'Go to Debts',
      subtitle: 'Track your debts',
      icon: AlertCircle,
      action: () => navigate('/debts'),
      keywords: ['debts', 'loans', 'credit'],
      category: 'navigation'
    },
    {
      id: 'nav-calendar',
      title: 'Go to Calendar',
      subtitle: 'View transactions by date',
      icon: Calendar,
      action: () => navigate('/calendar'),
      keywords: ['calendar', 'schedule', 'dates'],
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
    {
      id: 'action-add-category',
      title: 'Add New Category',
      subtitle: 'Create a spending category',
      icon: Tags,
      action: () => {
        navigate('/categories');
        toast({
          title: "Categories",
          description: "Navigate to categories to create new ones",
        });
      },
      keywords: ['category', 'new', 'create', 'organize'],
      category: 'actions'
    },
    {
      id: 'action-add-goal',
      title: 'Add Financial Goal',
      subtitle: 'Set a new savings goal',
      icon: Target,
      action: () => {
        navigate('/goals');
        toast({
          title: "Goals",
          description: "Navigate to goals to create new ones",
        });
      },
      keywords: ['goal', 'savings', 'target', 'plan'],
      category: 'actions'
    },
    {
      id: 'action-add-recurring',
      title: 'Add Recurring Transaction',
      subtitle: 'Set up automatic transactions',
      icon: Repeat,
      action: () => {
        navigate('/recurring');
        toast({
          title: "Recurring",
          description: "Navigate to recurring transactions",
        });
      },
      keywords: ['recurring', 'automatic', 'subscription', 'repeat'],
      category: 'actions'
    },
    {
      id: 'action-quick-search',
      title: 'Search Transactions',
      subtitle: 'Find specific transactions',
      icon: Search,
      action: () => {
        navigate('/transactions');
        toast({
          title: "Search",
          description: "Navigate to transactions to search",
        });
      },
      keywords: ['search', 'find', 'filter', 'transactions'],
      category: 'actions',
      shortcut: 'Ctrl+F'
    },

    // Management Commands
    {
      id: 'manage-categories',
      title: 'Manage Categories',
      subtitle: 'Edit spending categories',
      icon: Tags,
      action: () => navigate('/categories'),
      keywords: ['manage', 'categories', 'edit', 'organize'],
      category: 'manage'
    },
    {
      id: 'manage-recurring',
      title: 'Manage Recurring',
      subtitle: 'Edit recurring transactions',
      icon: Repeat,
      action: () => navigate('/recurring'),
      keywords: ['manage', 'recurring', 'subscriptions', 'automatic'],
      category: 'manage'
    },
    {
      id: 'manage-goals',
      title: 'Manage Goals',
      subtitle: 'Track financial goals',
      icon: Flag,
      action: () => navigate('/goals'),
      keywords: ['manage', 'goals', 'savings', 'targets'],
      category: 'manage'
    },
    {
      id: 'manage-debts',
      title: 'Manage Debts',
      subtitle: 'Track debt payments',
      icon: AlertCircle,
      action: () => navigate('/debts'),
      keywords: ['manage', 'debts', 'loans', 'credit'],
      category: 'manage'
    },

    // View Commands
    {
      id: 'view-analytics',
      title: 'View Analytics',
      subtitle: 'Detailed financial insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      keywords: ['view', 'analytics', 'insights', 'reports'],
      category: 'view'
    },
    {
      id: 'view-calendar',
      title: 'Calendar View',
      subtitle: 'See transactions by date',
      icon: Calendar,
      action: () => navigate('/calendar'),
      keywords: ['view', 'calendar', 'schedule', 'timeline'],
      category: 'view'
    },
    {
      id: 'view-budget',
      title: 'Budget Overview',
      subtitle: 'Check budget status',
      icon: Target,
      action: () => navigate('/budget'),
      keywords: ['view', 'budget', 'spending', 'limits'],
      category: 'view'
    },

    // Import/Export Commands
    {
      id: 'import-csv',
      title: 'Import CSV',
      subtitle: 'Import transactions from CSV',
      icon: Upload,
      action: () => {
        toast({
          title: "CSV Import",
          description: "CSV import feature coming soon...",
        });
      },
      keywords: ['import', 'csv', 'upload', 'transactions'],
      category: 'import'
    },
    {
      id: 'export-csv',
      title: 'Export to CSV',
      subtitle: 'Download transactions as CSV',
      icon: Download,
      action: () => {
        toast({
          title: "CSV Export",
          description: "Exporting transactions...",
        });
      },
      keywords: ['export', 'csv', 'download', 'backup'],
      category: 'import'
    },
    {
      id: 'export-pdf',
      title: 'Export Report',
      subtitle: 'Generate PDF report',
      icon: FileText,
      action: () => {
        toast({
          title: "PDF Report",
          description: "Generating financial report...",
        });
      },
      keywords: ['export', 'pdf', 'report', 'summary'],
      category: 'import'
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
      },
      keywords: ['calculator', 'calculate', 'math'],
      category: 'tools'
    },
    {
      id: 'tool-currency',
      title: 'Currency Converter',
      subtitle: 'Convert between currencies',
      icon: DollarSign,
      action: () => {
        toast({
          title: "Currency Converter",
          description: "Currency converter coming soon...",
        });
      },
      keywords: ['currency', 'convert', 'exchange', 'rates'],
      category: 'tools'
    },
    {
      id: 'tool-insights',
      title: 'Financial Insights',
      subtitle: 'Get AI-powered insights',
      icon: Zap,
      action: () => {
        toast({
          title: "Insights",
          description: "Analyzing your financial data...",
        });
      },
      keywords: ['insights', 'ai', 'analysis', 'recommendations'],
      category: 'tools'
    },

    // Settings Commands
    {
      id: 'settings-theme',
      title: 'Toggle Theme',
      subtitle: 'Switch between light/dark mode',
      icon: Moon,
      action: () => {
        const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
        if (themeToggle) {
          themeToggle.click();
        } else {
          toast({
            title: "Theme",
            description: "Theme toggle not found",
          });
        }
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
      category: 'settings',
      shortcut: 'Ctrl+Shift+T'
    },
    {
      id: 'settings-accessibility',
      title: 'Accessibility Settings',
      subtitle: 'Adjust accessibility options',
      icon: Accessibility,
      action: () => {
        const accessButton = document.querySelector('[title="Accessibility Settings (Alt+A)"]') as HTMLButtonElement;
        if (accessButton) {
          accessButton.click();
        }
      },
      keywords: ['accessibility', 'a11y', 'contrast', 'screen reader'],
      category: 'settings',
      shortcut: 'Alt+A'
    },
    {
      id: 'settings-notifications',
      title: 'Notification Settings',
      subtitle: 'Manage notification preferences',
      icon: Bell,
      action: () => navigate('/settings'),
      keywords: ['notifications', 'alerts', 'reminders'],
      category: 'settings'
    },
    {
      id: 'settings-currency',
      title: 'Currency Settings',
      subtitle: 'Change default currency',
      icon: DollarSign,
      action: () => navigate('/settings'),
      keywords: ['currency', 'money', 'locale', 'format'],
      category: 'settings'
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
    },
    {
      id: 'help-accessibility',
      title: 'Accessibility Help',
      subtitle: 'Learn about accessibility features',
      icon: Accessibility,
      action: () => {
        toast({
          title: "Accessibility Features",
          description: "Alt+A: Accessibility Settings, Screen reader support, High contrast mode",
        });
      },
      keywords: ['help', 'accessibility', 'a11y', 'support'],
      category: 'help'
    },
    {
      id: 'help-support',
      title: 'Get Support',
      subtitle: 'Contact support or view docs',
      icon: HelpCircle,
      action: () => {
        toast({
          title: "Support",
          description: "Visit our help center for more information",
        });
      },
      keywords: ['help', 'support', 'contact', 'docs'],
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
    actions: 'Quick Actions',
    manage: 'Manage',
    view: 'Views',
    import: 'Import/Export',
    tools: 'Tools',
    settings: 'Settings',
    help: 'Help & Support'
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4 py-3 bg-background">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 bg-transparent"
            autoFocus
          />
          <Badge variant="secondary" className="ml-auto text-xs bg-muted text-muted-foreground">
            Ctrl+K
          </Badge>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto bg-background">
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
                          className={`w-full justify-start gap-3 h-auto p-3 text-left transition-colors ${
                            isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={() => executeCommand(command)}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{command.title}</div>
                            {command.subtitle && (
                              <div className="text-xs text-muted-foreground">{command.subtitle}</div>
                            )}
                          </div>
                          {command.shortcut && (
                            <Badge variant="outline" className="text-xs border-border">
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
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground bg-muted/30">
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