import { useQuery } from "@tanstack/react-query";
import { createClient } from "@web/lib/supabase/client";
import type { BadgeData } from "./badge-card";

interface BadgesResponse {
  success: boolean;
  data?: BadgeData[];
  error?: string;
}

interface ObtainedBadgesResponse {
  success: boolean;
  data?: BadgeData[];
  error?: string;
}

export function useBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["badges", userId],
    queryFn: async (): Promise<BadgeData[]> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/achievements`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch badges: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch badges");
      }

      return result.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useObtainedBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["badges", "obtained", userId],
    queryFn: async (): Promise<BadgeData[]> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/achievements/obtained`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch obtained badges: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch obtained badges");
      }

      return result.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useBadgesByCategory(userId: string | undefined, category: string) {
  return useQuery({
    queryKey: ["badges", "category", category, userId],
    queryFn: async (): Promise<BadgeData[]> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/achievements`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch badges: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch badges");
      }

      const badges = result.data || [];
      return badges.filter(badge => badge.category === category);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
