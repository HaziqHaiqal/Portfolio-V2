// Utility functions that dynamically import Supabase to avoid build-time errors
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Runtime validation for Supabase configuration
const validateSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
    const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';
    
    if (!hasUrl || !hasKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }
  }
};

export const getSupabaseClient = async () => {
  validateSupabaseConfig();
  const { supabase } = await import('./supabase');
  return supabase;
};

export const supabaseAuth = {
  async getSession() {
    const supabase = await getSupabaseClient();
    return supabase.auth.getSession();
  },

  async signInWithOtp(email: string, redirectTo?: string) {
    const supabase = await getSupabaseClient();
    return supabase.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
  },

  async signOut() {
    const supabase = await getSupabaseClient();
    return supabase.auth.signOut();
  },

  async onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const supabase = await getSupabaseClient();
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const supabaseDB = {
  async from(table: string) {
    const supabase = await getSupabaseClient();
    return supabase.from(table);
  },

  async select(table: string, columns = '*') {
    const supabase = await getSupabaseClient();
    return supabase.from(table).select(columns);
  },

  async insert(table: string, data: Record<string, unknown>) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).insert(data);
  },

  async update(table: string, data: Record<string, unknown>, filter: Record<string, unknown>) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).update(data).match(filter);
  },

  async delete(table: string, filter: Record<string, unknown>) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).delete().match(filter);
  }
}; 