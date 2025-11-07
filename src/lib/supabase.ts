import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Configuration Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter pour React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types pour la database Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      shared_accounts: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      shared_account_members: {
        Row: {
          id: string;
          shared_account_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      shared_expenses: {
        Row: {
          id: string;
          shared_account_id: string;
          amount: number;
          category: string;
          description: string | null;
          date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          amount: number;
          category: string;
          description?: string | null;
          date: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          date?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      shared_recurring_expenses: {
        Row: {
          id: string;
          shared_account_id: string;
          amount: number;
          category: string;
          description: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          amount: number;
          category: string;
          description?: string | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
        };
      };
      shared_incomes: {
        Row: {
          id: string;
          shared_account_id: string;
          amount: number;
          source: string;
          description: string | null;
          is_recurring: boolean;
          date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          amount: number;
          source: string;
          description?: string | null;
          is_recurring?: boolean;
          date: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          amount?: number;
          source?: string;
          description?: string | null;
          is_recurring?: boolean;
          date?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      shared_category_budgets: {
        Row: {
          id: string;
          shared_account_id: string;
          month: string;
          category: string;
          amount: number;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          month: string;
          category: string;
          amount: number;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          month?: string;
          category?: string;
          amount?: number;
          is_recurring?: boolean;
          created_at?: string;
        };
      };
      shared_savings_tracker: {
        Row: {
          id: string;
          shared_account_id: string;
          month: string;
          target_amount: number;
          actual_saved: number;
          total_accumulated: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          shared_account_id: string;
          month: string;
          target_amount: number;
          actual_saved?: number;
          total_accumulated?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          shared_account_id?: string;
          month?: string;
          target_amount?: number;
          actual_saved?: number;
          total_accumulated?: number;
          created_at?: string;
        };
      };
    };
  };
}
