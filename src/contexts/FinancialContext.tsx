import React, { createContext, useContext, useState, useEffect } from 'react';
import { DailyEntry, Transaction, dailyData as initialDailyData, transactions as initialTransactions } from '@/data/financialData';

interface FinancialContextType {
  dailyData: DailyEntry[];
  transactions: Transaction[];
  monthlyStartingPoint: number;
  setMonthlyStartingPoint: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'dailyEntryId'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getCurrentBalance: () => number;
  getTodaysData: () => DailyEntry;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyData, setDailyData] = useState<DailyEntry[]>(initialDailyData);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [monthlyStartingPoint, setMonthlyStartingPointState] = useState<number>(755);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('potsFinancialData');
    const savedStartingPoint = localStorage.getItem('potsStartingPoint');
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setDailyData(parsed.dailyData || initialDailyData);
      setTransactions(parsed.transactions || initialTransactions);
    }
    
    if (savedStartingPoint) {
      setMonthlyStartingPointState(parseFloat(savedStartingPoint));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('potsFinancialData', JSON.stringify({ dailyData, transactions }));
  }, [dailyData, transactions]);

  useEffect(() => {
    localStorage.setItem('potsStartingPoint', monthlyStartingPoint.toString());
  }, [monthlyStartingPoint]);

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
      setMonthlyStartingPoint,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getCurrentBalance,
      getTodaysData
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};