import { useState } from "react";
import { Plus, X, Camera, Folder, Edit, Star, Calculator, TrendingUp, Calendar, Settings, Target, Wallet, CreditCard, Download, Play, Command, Accessibility, Keyboard, Search, Filter, Upload, Zap } from "lucide-react";

interface FabAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FabAction[];
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  layout?: "vertical" | "quarter-circle" | "half-circle" | "full-circle";
}

export default function FloatingActionButton({
  actions = defaultActions,
  position = "bottom-right",
  layout = "quarter-circle"
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  };

  // Layout calculations - Quarter circle optimized to fit all buttons on screen
  const getChildPosition = (index: number, total: number) => {
    // For quarter circle that fits all buttons on screen
    const angleStep = 80 / (total - 1); // Slightly reduced angle step for better fit
    
    // Start from left (180°) and go to up-right (260°)
    // This creates a quarter circle that fits within screen bounds
    const startAngle = 183; // Start from left (pointing right)
    const angle = startAngle + (angleStep * index); // Add to go clockwise
    
    // Optimized radius to ensure all buttons fit on screen
    const radius = 500; // Larger radius for better spacing
    
    if (layout === "vertical") {
      return {
        transform: `translateY(-${(index + 1) * 60}px)`,
        transitionDelay: `${index * 50}ms`
      };
    }
    
    // Circular layouts - quarter circle optimized for screen fit
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
      transitionDelay: `${index * 50}ms`
    };
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Child FABs */}
      <div className="absolute bottom-0 right-0">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`
              absolute w-12 h-12 rounded-full flex items-center justify-center 
              shadow-lg hover:shadow-xl transition-all duration-300
              ${action.color || "bg-blue-500 hover:bg-blue-600"}
              text-white group
              ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}
            `}
            style={{
              ...getChildPosition(index, actions.length),
              transformOrigin: "center",
              transitionDelay: isOpen ? 
                `${index * 50}ms` : // Opening: first to last
                `${(actions.length - 1 - index) * 50}ms` // Closing: last to first (reverse)
            }}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            title={action.label}
          >
            {action.icon}
            {/* Tooltip */}
            <span className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        className={`
          w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
          text-white flex items-center justify-center shadow-xl 
          hover:shadow-2xl transition-all duration-300
          hover:from-blue-600 hover:to-purple-700
          ${isOpen ? "rotate-45" : "rotate-0"}
        `}
        title={isOpen ? "Close menu" : "Open quick actions"}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}

// Default actions for MoneyLens - Comprehensive set replacing all floating buttons
const defaultActions: FabAction[] = [
  {
    icon: <Plus size={20} />,
    label: "Add Transaction",
    onClick: () => {
      // Trigger quick transaction modal
      console.log('Dispatching open-add-transaction-modal event');
      const event = new CustomEvent('open-add-transaction-modal');
      window.dispatchEvent(event);
    },
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    icon: <Zap size={20} />,
    label: "Quick Transaction Entry",
    onClick: () => {
      // Trigger the SmartTransactionEntry modal directly
      const event = new CustomEvent('open-smart-transaction-entry');
      window.dispatchEvent(event);
    },
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    icon: <Target size={20} />,
    label: "New Goal",
    onClick: () => {
      // Trigger quick goal creation modal
      const event = new CustomEvent('open-quick-goal-modal');
      window.dispatchEvent(event);
    },
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    icon: <Wallet size={20} />,
    label: "Quick Budget",
    onClick: () => {
      // Trigger budget quick action
      const event = new CustomEvent('open-budget-quick-action');
      window.dispatchEvent(event);
    },
    color: "bg-amber-500 hover:bg-amber-600"
  },
  {
    icon: <CreditCard size={20} />,
    label: "Add Debt",
    onClick: () => {
      // Trigger debt quick entry
      const event = new CustomEvent('open-debt-quick-entry');
      window.dispatchEvent(event);
    },
    color: "bg-red-500 hover:bg-red-600"
  },
  {
    icon: <TrendingUp size={20} />,
    label: "Quick Analytics",
    onClick: () => {
      // Trigger analytics overview modal
      const event = new CustomEvent('open-analytics-overview');
      window.dispatchEvent(event);
    },
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    icon: <Calculator size={20} />,
    label: "Quick Calculator",
    onClick: () => {
      // Trigger calculator modal
      const event = new CustomEvent('open-calculator-modal');
      window.dispatchEvent(event);
    },
    color: "bg-indigo-500 hover:bg-indigo-600"
  },
  {
    icon: <Calendar size={20} />,
    label: "Schedule Payment",
    onClick: () => {
      // Trigger recurring payment modal
      const event = new CustomEvent('open-recurring-payment-modal');
      window.dispatchEvent(event);
    },
    color: "bg-orange-500 hover:bg-orange-600"
  },
  {
    icon: <Folder size={20} />,
    label: "Import Data",
    onClick: () => {
      // Trigger import modal
      const event = new CustomEvent('open-import-modal');
      window.dispatchEvent(event);
    },
    color: "bg-teal-500 hover:bg-teal-600"
  },
  {
    icon: <Download size={20} />,
    label: "Export Data",
    onClick: () => {
      // Trigger export modal
      const event = new CustomEvent('open-export-modal');
      window.dispatchEvent(event);
    },
    color: "bg-cyan-500 hover:bg-cyan-600"
  },
  {
    icon: <Command size={20} />,
    label: "Command Palette",
    onClick: () => {
      // Trigger command palette
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true
      });
      window.dispatchEvent(event);
    },
    color: "bg-violet-500 hover:bg-violet-600"
  },
  {
    icon: <Accessibility size={20} />,
    label: "Accessibility",
    onClick: () => {
      // Trigger accessibility panel
      const event = new CustomEvent('open-accessibility-panel');
      window.dispatchEvent(event);
    },
    color: "bg-pink-500 hover:bg-pink-600"
  },
  {
    icon: <Play size={20} />,
    label: "Take Tour",
    onClick: () => {
      // Trigger page tour
      const currentPath = window.location.pathname;
      const pageName = getPageNameFromPath(currentPath);
      window.dispatchEvent(new CustomEvent('open-page-tour', { 
        detail: { pageName } 
      }));
    },
    color: "bg-rose-500 hover:bg-rose-600"
  },
  {
    icon: <Keyboard size={20} />,
    label: "Shortcuts",
    onClick: () => {
      // Show shortcuts modal
      const event = new CustomEvent('open-shortcuts-modal');
      window.dispatchEvent(event);
    },
    color: "bg-lime-500 hover:bg-lime-600"
  },
  {
    icon: <Settings size={20} />,
    label: "Quick Settings",
    onClick: () => {
      // Trigger settings panel
      const event = new CustomEvent('open-quick-settings');
      window.dispatchEvent(event);
    },
    color: "bg-gray-500 hover:bg-gray-600"
  }
];

// Helper function to get page name from path
const getPageNameFromPath = (path: string): string => {
  const pageMap: { [key: string]: string } = {
    '/': 'Dashboard',
    '/financial-hub': 'Financial Hub',
    '/analytics': 'Analytics',
    '/transactions': 'Transactions',
    '/goals': 'Goals',
    '/debts': 'Debts',
    '/recurring': 'Recurring',
    '/categories': 'Categories',
    '/budget': 'Budget',
    '/calendar': 'Calendar',
    '/settings': 'Settings'
  };
  return pageMap[path] || 'Dashboard';
};
