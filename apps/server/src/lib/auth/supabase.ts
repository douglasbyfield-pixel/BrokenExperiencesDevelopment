import { env } from "@server/env";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client for server-side operations
export const supabase = createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_ANON_KEY || ''
);

// Middleware to verify Supabase JWT token
export async function verifySupabaseToken(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification failed:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      emailVerified: !!user.email_confirmed_at
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Extract user from Authorization header
export async function getCurrentUser(headers: Record<string, string | undefined>) {
  const authHeader = headers.authorization || headers.Authorization;
  return await verifySupabaseToken(authHeader);
}