import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "./use-toast";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const triggerAddTransaction = useCallback(() => {
    const addButton = document.querySelector('[data-add-transaction] button') as HTMLButtonElement;
    if (addButton) {
      addButton.click();
      toast({
        title: "Quick Action",
        description: "Opening transaction form...",
      });
    }
  }, [toast]);

  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts
    {
      key: '1',
      ctrl: true,
      action: () => navigate('/'),
      description: 'Go to Dashboard',
      preventDefault: true
    },
    {
      key: '2',
      ctrl: true,
      action: () => navigate('/transactions'),
      description: 'Go to Transactions',
      preventDefault: true
    },
    {
      key: '3',
      ctrl: true,
      action: () => navigate('/analytics'),
      description: 'Go to Analytics',
      preventDefault: true
    },
    {
      key: '4',
      ctrl: true,
      action: () => navigate('/budget'),
      description: 'Go to Budget',
      preventDefault: true
    },
    {
      key: '5',
      ctrl: true,
      action: () => navigate('/goals'),
      description: 'Go to Goals',
      preventDefault: true
    },

    // Action shortcuts
    {
      key: 't',
      ctrl: true,
      action: triggerAddTransaction,
      description: 'Add Transaction',
      preventDefault: true
    },
    {
      key: 'e',
      ctrl: true,
      action: () => {
        triggerAddTransaction();
        // Could set default to expense type
      },
      description: 'Quick Expense Entry',
      preventDefault: true
    },
    {
      key: 'i',
      ctrl: true,
      action: () => {
        triggerAddTransaction();
        // Could set default to income type
      },
      description: 'Quick Income Entry',
      preventDefault: true
    },

    // Utility shortcuts
    {
      key: 's',
      ctrl: true,
      action: () => {
        toast({
          title: "Auto-saved",
          description: "Your data is automatically saved!",
        });
      },
      description: 'Save (auto-save confirmation)',
      preventDefault: true
    },
    {
      key: '/',
      action: () => {
        // Focus search if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          toast({
            title: "Search",
            description: "Use Ctrl+K to open command palette",
          });
        }
      },
      description: 'Focus search',
      preventDefault: true
    },

    // Help shortcuts
    {
      key: '?',
      shift: true,
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "Ctrl+K: Command Palette • Ctrl+T: Add Transaction • Ctrl+1-5: Navigate",
        });
      },
      description: 'Show help',
      preventDefault: true
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('[role="dialog"]') // Don't trigger when in dialogs
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !shortcut.ctrl || event.ctrlKey;
        const matchesMeta = !shortcut.meta || event.metaKey;
        const matchesShift = !shortcut.shift || event.shiftKey;
        const matchesAlt = !shortcut.alt || event.altKey;

        // Check if we need ctrl/meta and don't have it
        const needsModifier = shortcut.ctrl || shortcut.meta;
        const hasModifier = event.ctrlKey || event.metaKey;

        if (
          matchesKey &&
          matchesCtrl &&
          matchesMeta &&
          matchesShift &&
          matchesAlt &&
          (!needsModifier || hasModifier)
        ) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate, toast, triggerAddTransaction]);

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      ctrl: s.ctrl,
      meta: s.meta,
      shift: s.shift,
      alt: s.alt,
      description: s.description
    }))
  };
};
