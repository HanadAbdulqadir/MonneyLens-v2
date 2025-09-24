import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Database types
interface DbTransaction {
  id: string;
  user_id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
  tags: string[];
  pot_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbFinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface DbDebt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  minimum_payment: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DbDebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

interface DbTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface DbDailyEntry {
  id: string;
  user_id: string;
  date: string;
  earnings: number;
  expenses: number;
  net_change: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface DbRecurringTransaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  created_at: string;
  description: string;
  end_date: string;
  frequency: string;
  is_active: boolean;
  last_processed: string;
  start_date: string;
  tags: string[];
  updated_at: string;
}

interface DbUserSettings {
  id: string;
  user_id: string;
  monthly_starting_point: number;
  is_dark_mode: boolean;
  category_filter: string | null;
  created_at: string;
  updated_at: string;
}

// App types (matching existing interfaces)
export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  tags?: string[];
  pot_id?: string | null;
  week?: string; // For backward compatibility
  dailyEntryId?: string; // For backward compatibility
}

export interface FinancialGoal {
  id: string;
  title: string;
  name: string; // Alias for title for backward compatibility
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  deadline?: string; // Alias for targetDate
  category?: string;
  completed: boolean;
  isCompleted: boolean; // Alias for completed
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  dueDate?: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface DailyEntry {
  date: string;
  earnings: number;
  expenses: number;
  netChange: number;
  balance: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface FinancialContextType {
  // Data
  transactions: Transaction[];
  goals: FinancialGoal[];
  debts: Debt[];
  dailyData: DailyEntry[];
  monthlyStartingPoint: number;
  currency: string;
  isDarkMode: boolean;
  categoryFilter: string;
  recurringTransactions: any[]; // Placeholder for backward compatibility
  
  // Loading states
  loading: boolean;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Goal methods
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'completed'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Debt methods
  addDebt: (debt: Omit<Debt, 'id' | 'payments'>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Omit<Debt, 'payments'>>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addDebtPayment: (debtId: string, payment: Omit<DebtPayment, 'id'>) => Promise<void>;
  
  // Settings methods
  updateMonthlyStartingPoint: (amount: number) => Promise<void>;
  setMonthlyStartingPoint: (amount: number) => Promise<void>; // Alias
  updateCurrency: (currency: string) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>; // Alias
  updateDarkMode: (isDark: boolean) => Promise<void>;
  toggleDarkMode: () => Promise<void>; // For backward compatibility
  updateCategoryFilter: (filter: string) => Promise<void>;
  setCategoryFilter: (filter: string) => Promise<void>; // Alias
  // Backward compatibility methods
  addRecurringTransaction: (transaction: any) => Promise<void>;
  updateRecurringTransaction: (id: string, transaction: any) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  
  // Utility methods
  getCurrentBalance: () => number;
  getTodaysData: () => DailyEntry;
  recalculateBalances: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [dailyData, setDailyData] = useState<DailyEntry[]>([]);
  const [monthlyStartingPoint, setMonthlyStartingPoint] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to convert recurring transaction
  const dbRecurringToApp = (dbRecurring: DbRecurringTransaction): any => ({
    id: dbRecurring.id,
    name: dbRecurring.description || 'Unnamed Transaction', // Use description as name, provide default
    category: dbRecurring.category,
    amount: Number(dbRecurring.amount),
    frequency: dbRecurring.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
    nextDate: dbRecurring.last_processed || dbRecurring.start_date, // Use last_processed as nextDate, fallback to start_date
    isActive: dbRecurring.is_active,
  });

  // Helper functions to convert between database and app types
  const dbTransactionToApp = (dbTx: DbTransaction): Transaction => ({
    id: dbTx.id,
    date: dbTx.date,
    category: dbTx.category,
    amount: Number(dbTx.amount),
    description: dbTx.description || undefined,
    tags: dbTx.tags || [],
    pot_id: dbTx.pot_id || undefined,
  });

  const dbGoalToApp = (dbGoal: DbFinancialGoal): FinancialGoal => ({
    id: dbGoal.id,
    title: dbGoal.title,
    name: dbGoal.title, // Backward compatibility
    description: dbGoal.description || undefined,
    targetAmount: Number(dbGoal.target_amount),
    currentAmount: Number(dbGoal.current_amount),
    targetDate: dbGoal.target_date || undefined,
    deadline: dbGoal.target_date || undefined, // Backward compatibility
    category: dbGoal.category || undefined,
    completed: dbGoal.is_completed,
    isCompleted: dbGoal.is_completed, // Backward compatibility
  });

  const dbDebtToApp = (dbDebt: DbDebt, payments: DbDebtPayment[]): Debt => ({
    id: dbDebt.id,
    name: dbDebt.name,
    totalAmount: Number(dbDebt.total_amount),
    remainingAmount: Number(dbDebt.remaining_amount),
    interestRate: Number(dbDebt.interest_rate),
    minimumPayment: dbDebt.minimum_payment ? Number(dbDebt.minimum_payment) : undefined,
    dueDate: dbDebt.due_date || undefined,
    payments: payments.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.payment_date,
      notes: p.notes || undefined,
    })),
  });

  const dbDailyEntryToApp = (dbEntry: DbDailyEntry): DailyEntry => ({
    date: dbEntry.date,
    earnings: Number(dbEntry.earnings),
    expenses: Number(dbEntry.expenses),
    netChange: Number(dbEntry.net_change),
    balance: Number(dbEntry.balance),
  });

  // Load all data
  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData.map(dbTransactionToApp));
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsData) {
        setGoals(goalsData.map(dbGoalToApp));
      }

      // Load debts with payments
      const { data: debtsData } = await supabase
        .from('debts')
        .select(`
          *,
          debt_payments (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (debtsData) {
        setDebts(debtsData.map(debt => dbDebtToApp(debt, debt.debt_payments || [])));
      }

      // Load daily entries
      const { data: dailyEntriesData } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (dailyEntriesData) {
        setDailyData(dailyEntriesData.map(dbDailyEntryToApp));
      }

      // Load user settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setMonthlyStartingPoint(Number(settingsData.monthly_starting_point));
        setIsDarkMode(settingsData.is_dark_mode);
        setCategoryFilter(settingsData.category_filter || '');
      }

      // Load user profile for currency
      const { data: profileData } = await supabase
        .from('profiles')
        .select('currency')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setCurrency(profileData.currency || 'USD');
      }

      // Load recurring transactions
      const { data: recurringData } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recurringData) {
        setRecurringTransactions(recurringData.map(dbRecurringToApp));
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Transaction methods
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        date: transaction.date,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || null,
        tags: transaction.tags || [],
        pot_id: transaction.pot_id || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add transaction');
      throw error;
    }

    if (data) {
      const newTransaction = dbTransactionToApp(data as DbTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
      await recalculateBalances();
      toast.success('Transaction added successfully');
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...(updates.date && { date: updates.date }),
        ...(updates.category && { category: updates.category }),
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.description !== undefined && { description: updates.description || null }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.pot_id !== undefined && { pot_id: updates.pot_id || null }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update transaction');
      throw error;
    }

    if (data) {
      const updatedTransaction = dbTransactionToApp(data as DbTransaction);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      await recalculateBalances();
      toast.success('Transaction updated successfully');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete transaction');
      throw error;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    await recalculateBalances();
    toast.success('Transaction deleted successfully');
  };

  // Goal methods
  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'completed'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description || null,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        target_date: goal.targetDate || null,
        category: goal.category || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add goal');
      throw error;
    }

    if (data) {
      const newGoal = dbGoalToApp(data);
      setGoals(prev => [newGoal, ...prev]);
      toast.success('Goal added successfully');
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description || null }),
        ...(updates.targetAmount !== undefined && { target_amount: updates.targetAmount }),
        ...(updates.currentAmount !== undefined && { current_amount: updates.currentAmount }),
        ...(updates.targetDate !== undefined && { target_date: updates.targetDate || null }),
        ...(updates.category !== undefined && { category: updates.category || null }),
        ...(updates.completed !== undefined && { is_completed: updates.completed }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update goal');
      throw error;
    }

    if (data) {
      const updatedGoal = dbGoalToApp(data);
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      toast.success('Goal updated successfully');
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete goal');
      throw error;
    }

    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted successfully');
  };

  // Debt methods
  const addDebt = async (debt: Omit<Debt, 'id' | 'payments'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        name: debt.name,
        total_amount: debt.totalAmount,
        remaining_amount: debt.remainingAmount,
        interest_rate: debt.interestRate,
        minimum_payment: debt.minimumPayment || null,
        due_date: debt.dueDate || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add debt');
      throw error;
    }

    if (data) {
      const newDebt = dbDebtToApp(data, []);
      setDebts(prev => [newDebt, ...prev]);
      toast.success('Debt added successfully');
    }
  };

  const updateDebt = async (id: string, updates: Partial<Omit<Debt, 'payments'>>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('debts')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.totalAmount !== undefined && { total_amount: updates.totalAmount }),
        ...(updates.remainingAmount !== undefined && { remaining_amount: updates.remainingAmount }),
        ...(updates.interestRate !== undefined && { interest_rate: updates.interestRate }),
        ...(updates.minimumPayment !== undefined && { minimum_payment: updates.minimumPayment || null }),
        ...(updates.dueDate !== undefined && { due_date: updates.dueDate || null }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update debt');
      throw error;
    }

    if (data) {
      setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      toast.success('Debt updated successfully');
    }
  };

  const deleteDebt = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete debt');
      throw error;
    }

    setDebts(prev => prev.filter(d => d.id !== id));
    toast.success('Debt deleted successfully');
  };

  const addDebtPayment = async (debtId: string, payment: Omit<DebtPayment, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('debt_payments')
      .insert({
        debt_id: debtId,
        user_id: user.id,
        amount: payment.amount,
        payment_date: payment.date,
        notes: payment.notes || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add payment');
      throw error;
    }

    if (data) {
      // Update the debt's remaining amount
      const debt = debts.find(d => d.id === debtId);
      if (debt) {
        const newRemainingAmount = debt.remainingAmount - payment.amount;
        await updateDebt(debtId, { remainingAmount: newRemainingAmount });
        
        // Update local state
        setDebts(prev => prev.map(d => 
          d.id === debtId 
            ? { 
                ...d, 
                remainingAmount: newRemainingAmount,
                payments: [...d.payments, {
                  id: data.id,
                  amount: Number(data.amount),
                  date: data.payment_date,
                  notes: data.notes || undefined,
                }]
              }
            : d
        ));
      }
      
      toast.success('Payment added successfully');
    }
  };

  // Settings methods
  const updateMonthlyStartingPoint = async (amount: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({ monthly_starting_point: amount })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update starting point');
      throw error;
    }

    setMonthlyStartingPoint(amount);
    await recalculateBalances();
    toast.success('Starting point updated successfully');
  };

  const updateCurrency = async (newCurrency: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ currency: newCurrency })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update currency');
      throw error;
    }

    setCurrency(newCurrency);
    toast.success('Currency updated successfully');
  };

  const updateDarkMode = async (isDark: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({ is_dark_mode: isDark })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update theme');
      throw error;
    }

    setIsDarkMode(isDark);
  };

  const updateCategoryFilter = async (filter: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({ category_filter: filter })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update filter');
      throw error;
    }

    setCategoryFilter(filter);
  };

  // Recurring transaction methods
  const addRecurringTransaction = async (transaction: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        description: transaction.name, // Use name as description
        category: transaction.category,
        amount: transaction.amount,
        frequency: transaction.frequency,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        last_processed: transaction.nextDate,
        is_active: transaction.isActive,
        tags: []
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add recurring transaction');
      throw error;
    }

    if (data) {
      const newRecurring = dbRecurringToApp(data);
      setRecurringTransactions(prev => [newRecurring, ...prev]);
      toast.success('Recurring transaction added successfully');
    }
  };

  const updateRecurringTransaction = async (id: string, updates: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({
        ...(updates.name && { description: updates.name }),
        ...(updates.category && { category: updates.category }),
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.frequency && { frequency: updates.frequency }),
        ...(updates.nextDate && { last_processed: updates.nextDate }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update recurring transaction');
      throw error;
    }

    if (data) {
      const updatedRecurring = dbRecurringToApp(data);
      setRecurringTransactions(prev => prev.map(r => r.id === id ? updatedRecurring : r));
      toast.success('Recurring transaction updated successfully');
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete recurring transaction');
      throw error;
    }

    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    toast.success('Recurring transaction deleted successfully');
  };

  // Clear all data
  const clearAllData = async () => {
    if (!user) return;

    try {
      // Delete all user data in sequence
      await supabase.from('debt_payments').delete().eq('user_id', user.id);
      await supabase.from('debts').delete().eq('user_id', user.id);
      await supabase.from('financial_goals').delete().eq('user_id', user.id);
      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('daily_entries').delete().eq('user_id', user.id);
      await supabase.from('recurring_transactions').delete().eq('user_id', user.id);
      
      // Reset settings to defaults
      await supabase
        .from('user_settings')
        .update({ 
          monthly_starting_point: 0,
          category_filter: null
        })
        .eq('user_id', user.id);

      // Reset state
      setTransactions([]);
      setGoals([]);
      setDebts([]);
      setDailyData([]);
      setRecurringTransactions([]);
      setMonthlyStartingPoint(0);
      setCategoryFilter('');

      toast.success('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
      throw error;
    }
  };

  // Utility methods
  const getCurrentBalance = () => {
    if (dailyData.length === 0) return monthlyStartingPoint;
    return dailyData[dailyData.length - 1].balance;
  };

  const getTodaysData = (): DailyEntry => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's data from current transactions
    const todaysTransactions = transactions.filter(t => t.date === today);
    const earnings = todaysTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = todaysTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netChange = earnings - expenses;
    
    return {
      date: today,
      earnings,
      expenses,
      netChange,
      balance: getCurrentBalance() + netChange, // Add today's net change to current balance
    };
  };

  const recalculateBalances = async () => {
    if (!user) return;

    // Group transactions by date
    const transactionsByDate = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.date]) {
        acc[transaction.date] = { earnings: 0, expenses: 0 };
      }
      
      if (transaction.amount > 0) {
        acc[transaction.date].earnings += transaction.amount;
      } else {
        acc[transaction.date].expenses += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {} as Record<string, { earnings: number; expenses: number }>);

    // Create daily entries
    const dates = Object.keys(transactionsByDate).sort();
    const newDailyData: DailyEntry[] = [];
    let runningBalance = monthlyStartingPoint;

    for (const date of dates) {
      const { earnings, expenses } = transactionsByDate[date];
      const netChange = earnings - expenses;
      runningBalance += netChange;

      const dailyEntry: DailyEntry = {
        date,
        earnings,
        expenses,
        netChange,
        balance: runningBalance,
      };

      newDailyData.push(dailyEntry);

      // Update or insert daily entry in database
      await supabase
        .from('daily_entries')
        .upsert({
          user_id: user.id,
          date,
          earnings,
          expenses,
          net_change: netChange,
          balance: runningBalance,
        });
    }

    setDailyData(newDailyData);
  };

  const value: FinancialContextType = {
    transactions,
    goals,
    debts,
    dailyData,
    monthlyStartingPoint,
    currency,
    isDarkMode,
    categoryFilter,
    loading,
    recurringTransactions, // Now returns actual recurring transactions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    addDebtPayment,
    updateMonthlyStartingPoint,
    setMonthlyStartingPoint: updateMonthlyStartingPoint,
    updateCurrency,
    setCurrency: updateCurrency,
    updateDarkMode,
    toggleDarkMode: () => updateDarkMode(!isDarkMode),
    updateCategoryFilter,
    setCategoryFilter: updateCategoryFilter,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    getCurrentBalance,
    getTodaysData,
    recalculateBalances,
    clearAllData,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
