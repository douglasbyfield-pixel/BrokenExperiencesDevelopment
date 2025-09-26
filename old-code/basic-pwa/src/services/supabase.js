import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Data service functions
export const dataService = {
	// Get all issues
	async getIssues() {
		try {
			const { data, error } = await supabase
				.from("issues")
				.select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          )
        `)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching issues:", error);
			throw error;
		}
	},

	// Create new issue
	async createIssue(issueData) {
		try {
			const { data, error } = await supabase
				.from("issues")
				.insert(issueData)
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error creating issue:", error);
			throw error;
		}
	},

	// Get user profile
	async getUserProfile(userId) {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error fetching user profile:", error);
			throw error;
		}
	},

	// Get community stats
	async getCommunityStats() {
		try {
			// Get total issues count
			const { count: totalIssues } = await supabase
				.from("issues")
				.select("id", { count: "exact", head: true });

			// Get resolved issues this week
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			const { count: resolvedThisWeek } = await supabase
				.from("issues")
				.select("id", { count: "exact", head: true })
				.eq("status", "resolved")
				.gte("updated_at", oneWeekAgo.toISOString());

			// Get active members
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

			const { data: activeUsers } = await supabase
				.from("issues")
				.select("reported_by")
				.gte("created_at", oneMonthAgo.toISOString())
				.not("reported_by", "is", null);

			const uniqueUsers = new Set(
				activeUsers?.map((issue) => issue.reported_by) || [],
			);

			return {
				impactScore: totalIssues || 0,
				activeMembers: uniqueUsers.size,
				resolvedThisWeek: resolvedThisWeek || 0,
			};
		} catch (error) {
			console.error("Error fetching community stats:", error);
			return {
				impactScore: 0,
				activeMembers: 0,
				resolvedThisWeek: 0,
			};
		}
	},
};
