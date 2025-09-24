// This file now exports the Supabase-backed financial context
// Existing components will automatically use the new Supabase version
export { FinancialProvider, useFinancial } from "@/contexts/SupabaseFinancialContext"";

// Re-export types for compatibility
export type {
  Transaction,
  FinancialGoal,
  Debt,
  DebtPayment,
  DailyEntry
} from "@/contexts/SupabaseFinancialContext";

// Legacy types that may be used by existing components
export interface RecurringTransaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
