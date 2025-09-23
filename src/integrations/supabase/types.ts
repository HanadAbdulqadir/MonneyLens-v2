export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_entries: {
        Row: {
          balance: number
          created_at: string
          date: string
          earnings: number | null
          expenses: number | null
          id: string
          net_change: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance: number
          created_at?: string
          date: string
          earnings?: number | null
          expenses?: number | null
          id?: string
          net_change?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          date?: string
          earnings?: number | null
          expenses?: number | null
          id?: string
          net_change?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          notes: string | null
          payment_date: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          notes?: string | null
          payment_date: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          }
        ]
      }
      debts: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          interest_rate: number | null
          minimum_payment: number | null
          name: string
          remaining_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          minimum_payment?: number | null
          name: string
          remaining_amount: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          minimum_payment?: number | null
          name?: string
          remaining_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number | null
          description: string | null
          id: string
          is_completed: boolean | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pots: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_balance: number
          priority: number
          allocation_rule: Json
          auto_transfer_enabled: boolean
          color: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount?: number
          current_balance?: number
          priority?: number
          allocation_rule?: Json
          auto_transfer_enabled?: boolean
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_balance?: number
          priority?: number
          allocation_rule?: Json
          auto_transfer_enabled?: boolean
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      allocation_rules: {
        Row: {
          id: string
          user_id: string
          pot_id: string
          rule_type: string
          amount: number
          schedule: Json
          priority: number
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pot_id: string
          rule_type: string
          amount: number
          schedule: Json
          priority?: number
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pot_id?: string
          rule_type?: string
          amount?: number
          schedule?: Json
          priority?: number
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_rules_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          }
        ]
      }
      allocation_transactions: {
        Row: {
          id: string
          user_id: string
          pot_id: string
          rule_id: string | null
          amount: number
          allocation_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pot_id: string
          rule_id?: string | null
          amount: number
          allocation_date: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pot_id?: string
          rule_id?: string | null
          amount?: number
          allocation_date?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_transactions_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_transactions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "allocation_rules"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string | null
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_processed: string | null
          start_date: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_processed?: string | null
          start_date: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_processed?: string | null
          start_date?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          pot_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          pot_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          pot_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          category_filter: string | null
          created_at: string
          id: string
          is_dark_mode: boolean | null
          monthly_starting_point: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_filter?: string | null
          created_at?: string
          id?: string
          is_dark_mode?: boolean | null
          monthly_starting_point?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_filter?: string | null
          created_at?: string
          id?: string
          is_dark_mode?: boolean | null
          monthly_starting_point?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_pot_allocation_needs: {
        Args: {
          p_user_id: string
          p_date?: string
        }
        Returns: {
          pot_id: string
          pot_name: string
          current_balance: number
          target_amount: number
          needed_amount: number
          priority: number
          rule_type: string
        }[]
      }
      allocate_income_to_pots: {
        Args: {
          p_user_id: string
          p_amount: number
          p_date?: string
        }
        Returns: {
          pot_id: string
          pot_name: string
          allocated_amount: number
          remaining_balance: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
