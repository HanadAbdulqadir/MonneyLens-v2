import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Pot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_balance: number;
  priority: number;
  allocation_rule: Json;
  auto_transfer_enabled: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface AllocationRule {
  id: string;
  user_id: string;
  pot_id: string;
  rule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  amount: number;
  schedule: Json;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllocationTransaction {
  id: string;
  user_id: string;
  pot_id: string;
  rule_id: string | null;
  amount: number;
  allocation_date: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface PotsContextType {
  pots: Pot[];
  allocationRules: AllocationRule[];
  allocationTransactions: AllocationTransaction[];
  loading: boolean;
  createPot: (pot: Omit<Pot, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePot: (id: string, updates: Partial<Pot>) => Promise<void>;
  deletePot: (id: string) => Promise<void>;
  createAllocationRule: (rule: Omit<AllocationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAllocationRule: (id: string, updates: Partial<AllocationRule>) => Promise<void>;
  deleteAllocationRule: (id: string) => Promise<void>;
  allocateIncome: (amount: number, date?: string) => Promise<unknown[]>;
  transferBetweenPots: (fromPotId: string, toPotId: string, amount: number) => Promise<void>;
  getPotAllocationNeeds: (date?: string) => Promise<unknown[]>;
}

const PotsContext = createContext<PotsContextType | undefined>(undefined);

export function PotsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pots, setPots] = useState<Pot[]>([]);
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([]);
  const [allocationTransactions, setAllocationTransactions] = useState<AllocationTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPotsData();
    } else {
      setPots([]);
      setAllocationRules([]);
      setAllocationTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const loadPotsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to load pots from database first
      const { data: potsData, error: potsError } = await supabase
        .from('pots')
        .select('*')
        .eq('user_id', user.id)
        .order('priority');

      if (potsError) {
        // If database fails, try local storage
        console.warn('Database not available, loading from local storage:', potsError);
        const localPots = JSON.parse(localStorage.getItem(`pots-${user.id}`) || '[]');
        setPots(localPots);
      } else {
        setPots(potsData || []);
      }

      // Try to load allocation rules from database
      const { data: rulesData, error: rulesError } = await supabase
        .from('allocation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority');

      if (rulesError) {
        console.warn('Allocation rules table not available:', rulesError);
        setAllocationRules([]);
      } else {
        setAllocationRules((rulesData as AllocationRule[]) || []);
      }

      // Try to load allocation transactions from database
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('allocation_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('allocation_date', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.warn('Allocation transactions table not available:', transactionsError);
        setAllocationTransactions([]);
      } else {
        setAllocationTransactions((transactionsData as AllocationTransaction[]) || []);
      }

    } catch (error) {
      console.error('Error loading pots data:', error);
      toast.error('Failed to load pots data');
    } finally {
      setLoading(false);
    }
  };

  const createPot = async (potData: Omit<Pot, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to create pot in database
      const { data, error } = await supabase
        .from('pots')
        .insert({
          ...potData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        // If database table doesn't exist, use local storage fallback
        console.warn('Database table not available, using local storage fallback:', error);
        
        // Create mock pot with local storage
        const mockPot: Pot = {
          id: `local-${Date.now()}`,
          user_id: user.id,
          name: potData.name,
          description: potData.description || null,
          target_amount: potData.target_amount,
          current_balance: potData.current_balance || 0,
          priority: potData.priority,
          allocation_rule: potData.allocation_rule || {},
          auto_transfer_enabled: potData.auto_transfer_enabled || false,
          color: potData.color,
          icon: potData.icon,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Save to local storage
        const existingPots = JSON.parse(localStorage.getItem(`pots-${user.id}`) || '[]');
        const updatedPots = [...existingPots, mockPot];
        localStorage.setItem(`pots-${user.id}`, JSON.stringify(updatedPots));
        
        setPots(prev => [...prev, mockPot]);
        toast.success(`Pot "${potData.name}" created successfully (local storage)`);
        return;
      }

      setPots(prev => [...prev, data]);
      toast.success(`Pot "${potData.name}" created successfully`);
    } catch (error) {
      console.error('Error creating pot:', error);
      toast.error('Failed to create pot');
      throw error;
    }
  };

  const updatePot = async (id: string, updates: Partial<Pot>) => {
    try {
      const { data, error } = await supabase
        .from('pots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPots(prev => prev.map(pot => pot.id === id ? data : pot));
      toast.success('Pot updated successfully');
    } catch (error) {
      console.error('Error updating pot:', error);
      toast.error('Failed to update pot');
      throw error;
    }
  };

  const deletePot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPots(prev => prev.filter(pot => pot.id !== id));
      toast.success('Pot deleted successfully');
    } catch (error) {
      console.error('Error deleting pot:', error);
      toast.error('Failed to delete pot');
      throw error;
    }
  };

  const createAllocationRule = async (ruleData: Omit<AllocationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('allocation_rules')
        .insert({
          ...ruleData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAllocationRules(prev => [...prev, data as AllocationRule]);
      toast.success('Allocation rule created successfully');
    } catch (error) {
      console.error('Error creating allocation rule:', error);
      toast.error('Failed to create allocation rule');
      throw error;
    }
  };

  const updateAllocationRule = async (id: string, updates: Partial<AllocationRule>) => {
    try {
      const { data, error } = await supabase
        .from('allocation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAllocationRules(prev => prev.map(rule => rule.id === id ? data as AllocationRule : rule));
      toast.success('Allocation rule updated successfully');
    } catch (error) {
      console.error('Error updating allocation rule:', error);
      toast.error('Failed to update allocation rule');
      throw error;
    }
  };

  const deleteAllocationRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allocation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAllocationRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('Allocation rule deleted successfully');
    } catch (error) {
      console.error('Error deleting allocation rule:', error);
      toast.error('Failed to delete allocation rule');
      throw error;
    }
  };

  const allocateIncome = async (amount: number, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .rpc('allocate_income_to_pots', {
          p_user_id: user.id,
          p_amount: amount,
          p_date: date
        });

      if (error) throw error;

      // Reload pots data to reflect changes
      await loadPotsData();

      toast.success(`Income of £${amount} allocated successfully`);
      
      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error allocating income:', error);
      toast.error('Failed to allocate income');
      throw error;
    }
  };

  const transferBetweenPots = async (fromPotId: string, toPotId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Find the pots
      const fromPot = pots.find(pot => pot.id === fromPotId);
      const toPot = pots.find(pot => pot.id === toPotId);

      if (!fromPot || !toPot) {
        throw new Error('Invalid pot selection');
      }

      if (fromPot.current_balance < amount) {
        throw new Error('Insufficient funds in source pot');
      }

      // Update both pots in a transaction
      const { error: fromError } = await supabase
        .from('pots')
        .update({ current_balance: fromPot.current_balance - amount })
        .eq('id', fromPotId);

      if (fromError) throw fromError;

      const { error: toError } = await supabase
        .from('pots')
        .update({ current_balance: toPot.current_balance + amount })
        .eq('id', toPotId);

      if (toError) throw toError;

      // Record the transfer as an allocation transaction
      const { error: transactionError } = await supabase
        .from('allocation_transactions')
        .insert({
          user_id: user.id,
          pot_id: toPotId,
          amount: amount,
          allocation_date: new Date().toISOString().split('T')[0],
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Reload pots data
      await loadPotsData();

      toast.success(`Transferred £${amount} from ${fromPot.name} to ${toPot.name}`);
    } catch (error) {
      console.error('Error transferring between pots:', error);
      toast.error('Failed to transfer funds');
      throw error;
    }
  };

  const getPotAllocationNeeds = async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Since the RPC function might not exist, calculate allocation needs manually
      const needs = pots.map(pot => {
        const rulesForPot = allocationRules.filter(rule => rule.pot_id === pot.id && rule.enabled);
        const totalNeeded = rulesForPot.reduce((sum, rule) => sum + rule.amount, 0);
        
        return {
          pot_id: pot.id,
          pot_name: pot.name,
          target_amount: pot.target_amount,
          current_balance: pot.current_balance,
          allocation_needed: totalNeeded,
          shortfall: Math.max(0, totalNeeded - pot.current_balance)
        };
      });

      return needs;
    } catch (error) {
      console.error('Error getting pot allocation needs:', error);
      throw error;
    }
  };

  const value: PotsContextType = {
    pots,
    allocationRules,
    allocationTransactions,
    loading,
    createPot,
    updatePot,
    deletePot,
    createAllocationRule,
    updateAllocationRule,
    deleteAllocationRule,
    allocateIncome,
    transferBetweenPots,
    getPotAllocationNeeds,
  };

  return (
    <PotsContext.Provider value={value}>
      {children}
    </PotsContext.Provider>
  );
}

export function usePots() {
  const context = useContext(PotsContext);
  if (context === undefined) {
    throw new Error('usePots must be used within a PotsProvider');
  }
  return context;
}
