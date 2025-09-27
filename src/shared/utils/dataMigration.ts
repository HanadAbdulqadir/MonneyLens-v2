import { supabase } from "../../core/integrations/supabase/client";
import { toast } from 'sonner';

export interface LocalStorageData {
  transactions?: any[];
  goals?: any[];
  budgets?: any[];
  categories?: any[];
  pots?: any[];
  recurringTransactions?: any[];
  settings?: any;
}

export interface MigrationResult {
  success: boolean;
  migratedItems: {
    transactions: number;
    goals: number;
    budgets: number;
    categories: number;
    pots: number;
    recurringTransactions: number;
  };
  errors: string[];
}

export class DataMigrationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Detect if user has local storage data that needs migration
   */
  static hasLocalData(): boolean {
    const keys = [
      'financial-transactions',
      'financial-goals',
      'financial-budgets',
      'financial-categories',
      'financial-pots',
      'financial-recurring',
      'financial-settings'
    ];

    return keys.some(key => {
      const data = localStorage.getItem(key);
      return data && data !== '[]' && data !== '{}';
    });
  }

  /**
   * Get all local storage data
   */
  static getLocalData(): LocalStorageData {
    const getData = (key: string) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return null;
      }
    };

    return {
      transactions: getData('financial-transactions'),
      goals: getData('financial-goals'),
      budgets: getData('financial-budgets'),
      categories: getData('financial-categories'),
      pots: getData('financial-pots'),
      recurringTransactions: getData('financial-recurring'),
      settings: getData('financial-settings')
    };
  }

  /**
   * Migrate all local data to Supabase
   */
  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedItems: {
        transactions: 0,
        goals: 0,
        budgets: 0,
        categories: 0,
        pots: 0,
        recurringTransactions: 0
      },
      errors: []
    };

    try {
      const localData = DataMigrationService.getLocalData();

      // Migrate in order of dependencies (only tables that exist in our schema)
      await this.migrateTags(localData.categories, result); // Categories become tags
      await this.migratePots(localData.pots, result);
      await this.migrateFinancialGoals(localData.goals, result);
      await this.migrateTransactions(localData.transactions, result);
      await this.migrateRecurringTransactions(localData.recurringTransactions, result);

      result.success = result.errors.length === 0;
      
      if (result.success) {
        toast.success(`Migration completed! Migrated ${Object.values(result.migratedItems).reduce((a, b) => a + b, 0)} items.`);
      } else {
        toast.error(`Migration completed with ${result.errors.length} errors.`);
      }

      return result;
    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Migration failed. Please try again.');
      return result;
    }
  }

  /**
   * Migrate categories to tags table
   */
  private async migrateTags(categories: any[], result: MigrationResult): Promise<void> {
    if (!categories || !Array.isArray(categories)) return;

    try {
      const tagsToMigrate = categories.map(category => ({
        id: category.id || crypto.randomUUID(),
        user_id: this.userId,
        name: category.name,
        color: category.color || '#3B82F6',
        created_at: category.createdAt || new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tags')
        .upsert(tagsToMigrate, { onConflict: 'id' });

      if (error) {
        result.errors.push(`Tags migration error: ${error.message}`);
      } else {
        result.migratedItems.categories = tagsToMigrate.length;
      }
    } catch (error) {
      result.errors.push(`Tags migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Migrate pots
   */
  private async migratePots(pots: any[], result: MigrationResult): Promise<void> {
    if (!pots || !Array.isArray(pots)) return;

    try {
      const potsToMigrate = pots.map(pot => ({
        id: pot.id || crypto.randomUUID(),
        user_id: this.userId,
        name: pot.name,
        description: pot.description || null,
        target_amount: pot.targetAmount || pot.target || 0,
        current_balance: pot.currentAmount || pot.balance || 0,
        priority: pot.priority || 1,
        allocation_rule: pot.allocationRules || pot.rules || {},
        auto_transfer_enabled: pot.autoTransfer || false,
        color: pot.color || '#10B981',
        icon: pot.icon || 'piggy-bank',
        created_at: pot.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('pots')
        .upsert(potsToMigrate, { onConflict: 'id' });

      if (error) {
        result.errors.push(`Pots migration error: ${error.message}`);
      } else {
        result.migratedItems.pots = potsToMigrate.length;
      }
    } catch (error) {
      result.errors.push(`Pots migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Migrate goals to financial_goals table
   */
  private async migrateFinancialGoals(goals: any[], result: MigrationResult): Promise<void> {
    if (!goals || !Array.isArray(goals)) return;

    try {
      const goalsToMigrate = goals.map(goal => ({
        id: goal.id || crypto.randomUUID(),
        user_id: this.userId,
        title: goal.title || goal.name,
        description: goal.description || null,
        target_amount: goal.targetAmount || goal.target || 0,
        current_amount: goal.currentAmount || goal.progress || 0,
        target_date: goal.targetDate || goal.deadline || null,
        category: goal.category || 'savings',
        is_completed: goal.isCompleted || goal.completed || false,
        created_at: goal.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('financial_goals')
        .upsert(goalsToMigrate, { onConflict: 'id' });

      if (error) {
        result.errors.push(`Financial goals migration error: ${error.message}`);
      } else {
        result.migratedItems.goals = goalsToMigrate.length;
      }
    } catch (error) {
      result.errors.push(`Financial goals migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Migrate transactions
   */
  private async migrateTransactions(transactions: any[], result: MigrationResult): Promise<void> {
    if (!transactions || !Array.isArray(transactions)) return;

    try {
      const transactionsToMigrate = transactions.map(transaction => ({
        id: transaction.id || crypto.randomUUID(),
        user_id: this.userId,
        amount: transaction.amount || 0,
        description: transaction.description || transaction.title || '',
        category: transaction.category || transaction.categoryName || 'other',
        pot_id: transaction.potId || null,
        date: transaction.date || new Date().toISOString().split('T')[0],
        tags: transaction.tags || [],
        created_at: transaction.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < transactionsToMigrate.length; i += batchSize) {
        const batch = transactionsToMigrate.slice(i, i + batchSize);
        const { error } = await supabase
          .from('transactions')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          result.errors.push(`Transactions batch ${Math.floor(i / batchSize) + 1} migration error: ${error.message}`);
        }
      }

      result.migratedItems.transactions = transactionsToMigrate.length;
    } catch (error) {
      result.errors.push(`Transactions migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Migrate recurring transactions
   */
  private async migrateRecurringTransactions(recurringTransactions: any[], result: MigrationResult): Promise<void> {
    if (!recurringTransactions || !Array.isArray(recurringTransactions)) return;

    try {
      const recurringToMigrate = recurringTransactions.map(recurring => ({
        id: recurring.id || crypto.randomUUID(),
        user_id: this.userId,
        amount: recurring.amount || 0,
        description: recurring.description || recurring.title || '',
        category: recurring.category || recurring.categoryName || 'other',
        frequency: recurring.frequency || 'monthly',
        start_date: recurring.startDate || new Date().toISOString().split('T')[0],
        end_date: recurring.endDate || null,
        is_active: recurring.isActive !== false,
        last_processed: recurring.lastProcessed || null,
        tags: recurring.tags || [],
        created_at: recurring.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('recurring_transactions')
        .upsert(recurringToMigrate, { onConflict: 'id' });

      if (error) {
        result.errors.push(`Recurring transactions migration error: ${error.message}`);
      } else {
        result.migratedItems.recurringTransactions = recurringToMigrate.length;
      }
    } catch (error) {
      result.errors.push(`Recurring transactions migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear local storage after successful migration
   */
  static clearLocalData(): void {
    const keys = [
      'financial-transactions',
      'financial-goals',
      'financial-budgets',
      'financial-categories',
      'financial-pots',
      'financial-recurring',
      'financial-settings'
    ];

    keys.forEach(key => localStorage.removeItem(key));
    toast.success('Local data cleared successfully');
  }

  /**
   * Create backup of local data before migration
   */
  static createBackup(): string {
    const localData = DataMigrationService.getLocalData();
    const backup = {
      timestamp: new Date().toISOString(),
      data: localData
    };
    
    const backupString = JSON.stringify(backup, null, 2);
    
    // Create downloadable backup file
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneylens-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return backupString;
  }
}

export default DataMigrationService;
