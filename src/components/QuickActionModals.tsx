import { useState, useEffect } from "react";
import { X, Plus, Target, Wallet, CreditCard, TrendingUp, Calculator, Calendar, Folder, Download, Command, Accessibility, Play, Keyboard, Settings, Zap } from "lucide-react";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

export default function QuickActionModals({ isOpen, onClose, type }: QuickActionModalProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveModal(type);
    } else {
      setActiveModal(null);
    }
  }, [isOpen, type]);

  if (!isOpen || !activeModal) return null;

  const renderModalContent = () => {
    switch (activeModal) {
      case 'add-transaction':
        return <AddTransactionModal onClose={onClose} />;
      case 'quick-transaction':
        return <QuickTransactionModal onClose={onClose} />;
      case 'quick-goal':
        return <QuickGoalModal onClose={onClose} />;
      case 'budget-quick':
        return <BudgetQuickModal onClose={onClose} />;
      case 'debt-quick':
        return <DebtQuickModal onClose={onClose} />;
      case 'analytics-overview':
        return <AnalyticsOverviewModal onClose={onClose} />;
      case 'calculator':
        return <CalculatorModal onClose={onClose} />;
      case 'recurring-payment':
        return <RecurringPaymentModal onClose={onClose} />;
      case 'import':
        return <ImportModal onClose={onClose} />;
      case 'export':
        return <ExportModal onClose={onClose} />;
      case 'accessibility':
        return <AccessibilityModal onClose={onClose} />;
      case 'shortcuts':
        return <ShortcutsModal onClose={onClose} />;
      case 'quick-settings':
        return <QuickSettingsModal onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
        {renderModalContent()}
      </div>
    </div>
  );
}

// Individual Modal Components
function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle transaction submission
    console.log({ amount, description, category });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={20} />
        <h2 className="text-xl font-semibold">Add Transaction</h2>
      </div>
      <p className="text-gray-600 mb-6">Quickly add a new transaction</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            placeholder="Transaction description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select category</option>
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills & Utilities</option>
          </select>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

function QuickTransactionModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle quick transaction
    console.log({ amount });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} />
        <h2 className="text-xl font-semibold">Quick Transaction</h2>
      </div>
      <p className="text-gray-600 mb-6">Enter amount for quick transaction</p>
      
      <form onSubmit={handleQuickSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            autoFocus
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Quick Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

function QuickGoalModal({ onClose }: { onClose: () => void }) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle goal creation
    console.log({ goalName, targetAmount });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} />
        <h2 className="text-xl font-semibold">New Goal</h2>
      </div>
      <p className="text-gray-600 mb-6">Create a new financial goal</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Goal Name</label>
          <input
            placeholder="e.g., Vacation, New Car"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Create Goal
          </button>
        </div>
      </form>
    </div>
  );
}

function BudgetQuickModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle budget update
    console.log({ category, amount });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={20} />
        <h2 className="text-xl font-semibold">Quick Budget</h2>
      </div>
      <p className="text-gray-600 mb-6">Set or update budget for a category</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select category</option>
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills & Utilities</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Budget Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            Set Budget
          </button>
        </div>
      </form>
    </div>
  );
}

function DebtQuickModal({ onClose }: { onClose: () => void }) {
  const [debtName, setDebtName] = useState("");
  const [balance, setBalance] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle debt creation
    console.log({ debtName, balance });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} />
        <h2 className="text-xl font-semibold">Add Debt</h2>
      </div>
      <p className="text-gray-600 mb-6">Add a new debt to track</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Debt Name</label>
          <input
            placeholder="e.g., Credit Card, Student Loan"
            value={debtName}
            onChange={(e) => setDebtName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Balance</label>
          <input
            type="number"
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Add Debt
          </button>
        </div>
      </form>
    </div>
  );
}

function AnalyticsOverviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} />
        <h2 className="text-xl font-semibold">Quick Analytics</h2>
      </div>
      <p className="text-gray-600 mb-6">Your financial overview</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$2,450</div>
            <div className="text-sm text-blue-500">This Month</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">$1,200</div>
            <div className="text-sm text-green-500">Savings</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Food & Dining</span>
            <span className="text-red-500">-$350</span>
          </div>
          <div className="flex justify-between">
            <span>Transportation</span>
            <span className="text-red-500">-$120</span>
          </div>
          <div className="flex justify-between">
            <span>Entertainment</span>
            <span className="text-red-500">-$85</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          View Full Analytics
        </button>
      </div>
    </div>
  );
}

function CalculatorModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleCalculate = () => {
    try {
      // Simple calculation - in real app, use a proper expression parser
      const calculated = eval(input);
      setResult(calculated.toString());
    } catch (error) {
      setResult("Error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={20} />
        <h2 className="text-xl font-semibold">Quick Calculator</h2>
      </div>
      <p className="text-gray-600 mb-6">Perform quick calculations</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Expression</label>
          <input
            placeholder="e.g., 100 + 50 * 2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {result && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Result:</div>
            <div className="text-lg font-semibold">{result}</div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleCalculate}
            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Calculate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RecurringPaymentModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle recurring payment creation
    console.log({ description, amount, frequency });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} />
        <h2 className="text-xl font-semibold">Schedule Payment</h2>
      </div>
      <p className="text-gray-600 mb-6">Create a recurring payment</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            placeholder="e.g., Netflix Subscription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Schedule Payment
          </button>
        </div>
      </form>
    </div>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      // Handle file import
      console.log("Importing file:", file.name);
      onClose();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Folder size={20} />
        <h2 className="text-xl font-semibold">Import Data</h2>
      </div>
      <p className="text-gray-600 mb-6">Import transactions from a file</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <input
            type="file"
            accept=".csv,.xlsx,.json"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {file && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">Selected: {file.name}</div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={!file}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
          >
            Import
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState("csv");

  const handleExport = () => {
    // Handle export
    console.log("Exporting data in format:", format);
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download size={20} />
        <h2 className="text-xl font-semibold">Export Data</h2>
      </div>
      <p className="text-gray-600 mb-6">Export your financial data</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
          >
            Export Data
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AccessibilityModal({ onClose }: { onClose: () => void }) {
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = () => {
    // Handle accessibility settings
    console.log({ fontSize, highContrast });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Accessibility size={20} />
        <h2 className="text-xl font-semibold">Accessibility</h2>
      </div>
      <p className="text-gray-600 mb-6">Adjust accessibility settings</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="x-large">Extra Large</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="high-contrast"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="high-contrast" className="text-sm font-medium">
            High Contrast Mode
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: "Ctrl + K", description: "Open command palette" },
    { key: "Ctrl + N", description: "New transaction" },
    { key: "Ctrl + G", description: "New goal" },
    { key: "Ctrl + B", description: "Budget overview" },
    { key: "Ctrl + A", description: "Analytics" },
    { key: "Ctrl + S", description: "Settings" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard size={20} />
        <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
      </div>
      <p className="text-gray-600 mb-6">Available keyboard shortcuts</p>
      
      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              {shortcut.key}
            </kbd>
          </div>
        ))}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function QuickSettingsModal({ onClose }: { onClose: () => void }) {
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    // Handle settings save
    console.log({ currency, notifications });
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={20} />
        <h2 className="text-xl font-semibold">Quick Settings</h2>
      </div>
      <p className="text-gray-600 mb-6">Adjust your preferences</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="notifications" className="text-sm font-medium">
            Enable Notifications
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
