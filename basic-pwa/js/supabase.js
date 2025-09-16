// Supabase configuration for BrokenExp PWA
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Configuration - Using actual Supabase credentials from native app
const SUPABASE_URL = 'https://yvsmfemwyfexaelthoed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c21mZW13eWZleGFlbHRob2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzIzMTYsImV4cCI6MjA3MjMwODMxNn0.WgsrkGrRBNh_9mSDwprCwe7cvMzrHDT0gIZVWqgA9wk';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const createUserProfile = async (profile) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  
  return { data, error };
};

// Auth state change listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Sign out helper
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

console.log('Supabase client initialized');
console.log('✅ Connected to Supabase project:', SUPABASE_URL);