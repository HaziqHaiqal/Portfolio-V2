// Utility functions that dynamically import Supabase to avoid build-time errors
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const getSupabaseClient = async () => {
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

  async insert(table: string, data: any) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).insert(data);
  },

  async update(table: string, data: any, filter: any) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).update(data).match(filter);
  },

  async delete(table: string, filter: any) {
    const supabase = await getSupabaseClient();
    return supabase.from(table).delete().match(filter);
  }
}; 