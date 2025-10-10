import { useQuery } from "@tanstack/react-query";
import { createClient } from "@web/lib/supabase/client";

interface Fix {
  id: string;
  status: "claimed" | "in_progress" | "completed" | "verified";
  claimNotes?: string;
  createdAt: string;
  experienceId: string;
  userId: string;
}

export const fixKeys = {
  all: ["fixes"] as const,
  user: (userId: string) => [...fixKeys.all, "user", userId] as const,
};

export function useUserFixes(userId?: string) {
  return useQuery({
    queryKey: fixKeys.user(userId || ""),
    queryFn: async (): Promise<Fix[]> => {
      if (!userId) return [];

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fixes: ${response.statusText}`);
      }

      const fixes = await response.json();
      console.log("🔧 User fixes response:", {
        userId,
        fixesCount: fixes.length,
        fixes: fixes.map((f: any) => ({
          id: f.id,
          experienceId: f.experienceId,
          claimedBy: f.claimedBy,
          status: f.status,
          experienceTitle: f.experience?.title
        }))
      });

      return fixes;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}