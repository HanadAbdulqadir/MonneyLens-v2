import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface AllocationRule {
  id: string;
  pot_id: string;
  rule_type: string;
  amount: number;
  schedule: Json;
  priority: number;
  enabled: boolean;
}

export interface AllocationResult {
  pot_id: string;
  pot_name: string;
  allocated_amount: number;
  remaining_balance: number;
  rule_applied: string;
}

export interface AllocationSummary {
  total_allocated: number;
  allocations: AllocationResult[];
  remaining_income: number;
  errors: string[];
}

export class AllocationEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Allocate income to pots based on rules and priorities
   */
  async allocateIncome(amount: number, date?: string): Promise<AllocationSummary> {
    const summary: AllocationSummary = {
      total_allocated: 0,
      allocations: [],
      remaining_income: amount,
      errors: []
    };

    try {
      // Use the database function to allocate income
      const { data, error } = await supabase
        .rpc('allocate_income_to_pots', {
          p_user_id: this.userId,
          p_amount: amount,
          p_date: date || new Date().toISOString().split('T')[0]
        });

      if (error) {
        summary.errors.push(`Allocation failed: ${error.message}`);
        return summary;
      }

      if (data && Array.isArray(data)) {
        summary.allocations = data.map((allocation: any) => ({
          pot_id: allocation.pot_id,
          pot_name: allocation.pot_name,
          allocated_amount: allocation.allocated_amount,
          remaining_balance: allocation.remaining_balance,
          rule_applied: 'automatic'
        }));

        summary.total_allocated = summary.allocations.reduce(
          (sum, allocation) => sum + allocation.allocated_amount, 
          0
        );
        summary.remaining_income = amount - summary.total_allocated;
      }

      return summary;
    } catch (error) {
      summary.errors.push(`Allocation engine failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return summary;
    }
  }

  /**
   * Get all allocation rules for the user
   */
  async getAllocationRules(): Promise<AllocationRule[]> {
    try {
      const { data, error } = await supabase
        .from('allocation_rules')
        .select('*')
        .eq('user_id', this.userId)
        .eq('enabled', true)
        .order('priority', { ascending: true });

      if (error) {
        console.error('Error fetching allocation rules:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch allocation rules:', error);
      return [];
    }
  }

  /**
   * Create or update an allocation rule
   */
  async saveAllocationRule(rule: Partial<AllocationRule>): Promise<boolean> {
    try {
      const ruleData = {
        user_id: this.userId,
        pot_id: rule.pot_id,
        rule_type: rule.rule_type || 'percentage',
        amount: rule.amount || 0,
        schedule: rule.schedule || {},
        priority: rule.priority || 1,
        enabled: rule.enabled !== false
      };

      const { error } = rule.id
        ? await supabase
            .from('allocation_rules')
            .update(ruleData)
            .eq('id', rule.id)
            .eq('user_id', this.userId)
        : await supabase
            .from('allocation_rules')
            .insert(ruleData);

      if (error) {
        console.error('Error saving allocation rule:', error);
        toast.error('Failed to save allocation rule');
        return false;
      }

      toast.success('Allocation rule saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save allocation rule:', error);
      toast.error('Failed to save allocation rule');
      return false;
    }
  }

  /**
   * Delete an allocation rule
   */
  async deleteAllocationRule(ruleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('allocation_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error deleting allocation rule:', error);
        toast.error('Failed to delete allocation rule');
        return false;
      }

      toast.success('Allocation rule deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete allocation rule:', error);
      toast.error('Failed to delete allocation rule');
      return false;
    }
  }

  /**
   * Get allocation history for a specific period
   */
  async getAllocationHistory(startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('allocation_transactions')
        .select(`
          *,
          pots:pot_id (
            name,
            color,
            icon
          ),
          allocation_rules:rule_id (
            rule_type,
            amount
          )
        `)
        .eq('user_id', this.userId)
        .gte('allocation_date', startDate)
        .lte('allocation_date', endDate)
        .order('allocation_date', { ascending: false });

      if (error) {
        console.error('Error fetching allocation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch allocation history:', error);
      return [];
    }
  }

  /**
   * Create default allocation rules for new users
   */
  async createDefaultAllocationRules(pots: any[]): Promise<boolean> {
    try {
      const defaultRules = [
        // Bills pot - 40% of income, high priority
        {
          pot_id: pots.find(p => p.name.toLowerCase().includes('bill'))?.id,
          rule_type: 'percentage',
          amount: 40,
          schedule: { percentage_of_income: 40 },
          priority: 1,
          enabled: true
        },
        // Food pot - 15% of income
        {
          pot_id: pots.find(p => p.name.toLowerCase().includes('food'))?.id,
          rule_type: 'percentage',
          amount: 15,
          schedule: { percentage_of_income: 15 },
          priority: 2,
          enabled: true
        },
        // Transport/Petrol pot - 10% of income
        {
          pot_id: pots.find(p => p.name.toLowerCase().includes('petrol') || p.name.toLowerCase().includes('transport'))?.id,
          rule_type: 'percentage',
          amount: 10,
          schedule: { percentage_of_income: 10 },
          priority: 3,
          enabled: true
        },
        // Savings pot - 20% of income
        {
          pot_id: pots.find(p => p.name.toLowerCase().includes('saving'))?.id,
          rule_type: 'percentage',
          amount: 20,
          schedule: { percentage_of_income: 20 },
          priority: 4,
          enabled: true
        },
        // Buffer pot - 10% of income
        {
          pot_id: pots.find(p => p.name.toLowerCase().includes('buffer') || p.name.toLowerCase().includes('emergency'))?.id,
          rule_type: 'percentage',
          amount: 10,
          schedule: { percentage_of_income: 10 },
          priority: 5,
          enabled: true
        }
      ].filter(rule => rule.pot_id); // Only include rules for pots that exist

      if (defaultRules.length === 0) {
        return true; // No pots to create rules for
      }

      const rulesToInsert = defaultRules.map(rule => ({
        user_id: this.userId,
        ...rule
      }));

      const { error } = await supabase
        .from('allocation_rules')
        .insert(rulesToInsert);

      if (error) {
        console.error('Error creating default allocation rules:', error);
        return false;
      }

      toast.success('Default allocation rules created');
      return true;
    } catch (error) {
      console.error('Failed to create default allocation rules:', error);
      return false;
    }
  }

  /**
   * Manual allocation to a specific pot
   */
  async allocateToPot(potId: string, amount: number, description?: string): Promise<boolean> {
    try {
      // Create allocation transaction
      const { error: transactionError } = await supabase
        .from('allocation_transactions')
        .insert({
          user_id: this.userId,
          pot_id: potId,
          amount: amount,
          allocation_date: new Date().toISOString().split('T')[0],
          status: 'completed'
        });

      if (transactionError) {
        console.error('Error creating allocation transaction:', transactionError);
        toast.error('Failed to allocate to pot');
        return false;
      }

      // Get current pot balance and update it
      const { data: potData, error: fetchError } = await supabase
        .from('pots')
        .select('current_balance')
        .eq('id', potId)
        .eq('user_id', this.userId)
        .single();

      if (fetchError) {
        console.error('Error fetching pot balance:', fetchError);
        toast.error('Failed to fetch pot balance');
        return false;
      }

      const newBalance = (potData.current_balance || 0) + amount;

      const { error: updateError } = await supabase
        .from('pots')
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', potId)
        .eq('user_id', this.userId);

      if (updateError) {
        console.error('Error updating pot balance:', updateError);
        toast.error('Failed to update pot balance');
        return false;
      }

      toast.success(`Successfully allocated £${amount} to pot`);
      return true;
    } catch (error) {
      console.error('Failed to allocate to pot:', error);
      toast.error('Failed to allocate to pot');
      return false;
    }
  }

  /**
   * Get pot allocation needs based on target amounts
   */
  async getPotAllocationNeeds(): Promise<any[]> {
    try {
      // Since the RPC function might not exist, calculate manually
      // Get all pots and their allocation rules
      const { data: potsData } = await supabase
        .from('pots')
        .select('*')
        .eq('user_id', this.userId);

      const { data: rulesData } = await supabase
        .from('allocation_rules')
        .select('*')
        .eq('user_id', this.userId)
        .eq('enabled', true);

      if (!potsData || !rulesData) {
        return [];
      }

      // Calculate allocation needs for each pot
      const needs = potsData.map(pot => {
        const rulesForPot = rulesData.filter(rule => rule.pot_id === pot.id);
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
      console.error('Failed to calculate pot allocation needs:', error);
      return [];
    }
  }
}

export default AllocationEngine;
