import { useQuery } from "@tanstack/react-query";
import { eden } from "@web/lib/eden";
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

      const response = await eden.achievements.get();

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to fetch badges");
      }

      return response.data.data || [];
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

      const response = await eden.achievements.obtained.get();

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to fetch obtained badges");
      }

      return response.data.data || [];
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

      const allBadges = await eden.achievements.get();

      if (!allBadges.data?.success) {
        throw new Error(allBadges.data?.error || "Failed to fetch badges");
      }

      const badges = allBadges.data.data || [];
      return badges.filter(badge => badge.category === category);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
