import React, { createContext, useContext, useState, useEffect } from 'react';
import { DailyEntry, Transaction, dailyData as initialDailyData, transactions as initialTransactions } from '@/data/financialData';

export interface RecurringTransaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface FinancialContextType {
  dailyData: DailyEntry[];
  transactions: Transaction[];
  monthlyStartingPoint: number;
  recurringTransactions: RecurringTransaction[];
  goals: FinancialGoal[];
  tags: Tag[];
  currency: string;
  isDarkMode: boolean;
  setMonthlyStartingPoint: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'dailyEntryId'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setCurrency: (currency: string) => void;
  toggleDarkMode: () => void;
  getCurrentBalance: () => number;
  getTodaysData: () => DailyEntry;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export { FinancialContext };

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [dailyData, setDailyData] = useState<DailyEntry[]>(initialDailyData);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [monthlyStartingPoint, setMonthlyStartingPointState] = useState<number>(755);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Essential', color: '#ef4444' },
    { id: '2', name: 'Luxury', color: '#8b5cf6' },
    { id: '3', name: 'Investment', color: '#06d6a0' },
  ]);
  const [currency, setCurrencyState] = useState<string>('£');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('potsFinancialData');
    const savedStartingPoint = localStorage.getItem('potsStartingPoint');
    const savedRecurring = localStorage.getItem('potsRecurringTransactions');
    const savedGoals = localStorage.getItem('potsGoals');
    const savedTags = localStorage.getItem('potsTags');
    const savedCurrency = localStorage.getItem('potsCurrency');
    const savedTheme = localStorage.getItem('potsTheme');
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setDailyData(parsed.dailyData || initialDailyData);
      setTransactions(parsed.transactions || initialTransactions);
    }
    
    if (savedStartingPoint) {
      setMonthlyStartingPointState(parseFloat(savedStartingPoint));
    }

    if (savedRecurring) {
      setRecurringTransactions(JSON.parse(savedRecurring));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }

    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }

    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('potsFinancialData', JSON.stringify({ dailyData, transactions }));
  }, [dailyData, transactions]);

  useEffect(() => {
    localStorage.setItem('potsStartingPoint', monthlyStartingPoint.toString());
  }, [monthlyStartingPoint]);

  useEffect(() => {
    localStorage.setItem('potsRecurringTransactions', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  useEffect(() => {
    localStorage.setItem('potsGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('potsTags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('potsCurrency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('potsTheme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const setMonthlyStartingPoint = (amount: number) => {
    setMonthlyStartingPointState(amount);
    // Recalculate all balances based on new starting point
    recalculateBalances(amount);
  };

  const recalculateBalances = (startingAmount: number) => {
    const sortedDailyData = [...dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = startingAmount;
    
    const updatedDailyData = sortedDailyData.map((entry) => {
      const netChange = entry.earnings - (entry.petrol + entry.food + entry.other);
      runningBalance += netChange;
      return {
        ...entry,
        netChange,
        balance: runningBalance
      };
    });
    
    setDailyData(updatedDailyData);
  };

  const addTransaction = (newTransaction: Omit<Transaction, 'dailyEntryId'>) => {
    const newId = Date.now(); // Simple ID generation
    const transactionWithId = {
      ...newTransaction,
      dailyEntryId: newId
    };
    
    setTransactions(prev => [...prev, transactionWithId]);
    
    // Update daily data
    updateDailyDataFromTransactions([...transactions, transactionWithId]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.dailyEntryId.toString() === id ? { ...t, ...updatedTransaction } : t)
    );
    
    const updatedTransactions = transactions.map(t => 
      t.dailyEntryId.toString() === id ? { ...t, ...updatedTransaction } : t
    );
    updateDailyDataFromTransactions(updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.dailyEntryId.toString() !== id);
    setTransactions(updatedTransactions);
    updateDailyDataFromTransactions(updatedTransactions);
  };

  const addRecurringTransaction = (newRecurring: Omit<RecurringTransaction, 'id'>) => {
    const recurring = {
      ...newRecurring,
      id: Date.now().toString()
    };
    setRecurringTransactions(prev => [...prev, recurring]);
  };

  const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };

  const addGoal = (newGoal: Omit<FinancialGoal, 'id'>) => {
    const goal = {
      ...newGoal,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => 
      prev.map(g => g.id === id ? { ...g, ...updates } : g)
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addTag = (newTag: Omit<Tag, 'id'>) => {
    const tag = {
      ...newTag,
      id: Date.now().toString()
    };
    setTags(prev => [...prev, tag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateDailyDataFromTransactions = (allTransactions: Transaction[]) => {
    const dailyTotals = new Map<string, { earnings: number; petrol: number; food: number; other: number }>();
    
    allTransactions.forEach(transaction => {
      const existing = dailyTotals.get(transaction.date) || { earnings: 0, petrol: 0, food: 0, other: 0 };
      
      switch (transaction.category.toLowerCase()) {
        case 'earnings':
          existing.earnings += transaction.amount;
          break;
        case 'petrol':
          existing.petrol += transaction.amount;
          break;
        case 'food':
          existing.food += transaction.amount;
          break;
        case 'other':
          existing.other += transaction.amount;
          break;
      }
      
      dailyTotals.set(transaction.date, existing);
    });

    const updatedDailyData = Array.from(dailyTotals.entries())
      .map(([date, totals]) => {
        const netChange = totals.earnings - (totals.petrol + totals.food + totals.other);
        return {
          date,
          ...totals,
          netChange,
          balance: 0 // Will be calculated in recalculateBalances
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = monthlyStartingPoint;
    const finalDailyData = updatedDailyData.map(entry => {
      runningBalance += entry.netChange;
      return { ...entry, balance: runningBalance };
    });

    setDailyData(finalDailyData);
  };

  const getCurrentBalance = () => {
    return dailyData[dailyData.length - 1]?.balance || monthlyStartingPoint;
  };

  const getTodaysData = () => {
    const today = new Date().toISOString().split('T')[0];
    return dailyData.find(entry => entry.date === today) || dailyData[dailyData.length - 1] || {
      date: today,
      earnings: 0,
      petrol: 0,
      food: 0,
      other: 0,
      netChange: 0,
      balance: monthlyStartingPoint
    };
  };

  return (
    <FinancialContext.Provider value={{
      dailyData,
      transactions,
      monthlyStartingPoint,
      recurringTransactions,
      goals,
      tags,
      currency,
      isDarkMode,
      setMonthlyStartingPoint,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addTag,
      updateTag,
      deleteTag,
      setCurrency,
      toggleDarkMode,
      getCurrentBalance,
      getTodaysData
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};