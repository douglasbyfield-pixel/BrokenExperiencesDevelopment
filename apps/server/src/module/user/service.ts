// Mock service for demo purposes - database imports commented out
// import { db } from "../../db";
// import { user, userRole } from "../../db/schema";
// import { eq, and } from "drizzle-orm";

export const userService = {
	async getUserProfile(userId: string) {
		try {
			// Mock profile data matching the frontend
			return {
				id: "user-123",
				name: "Sarah Johnson",
				email: "sarah.johnson@example.com",
				image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
				bio: "Community advocate passionate about improving infrastructure and public safety in Jamaica",
				location: "Kingston, Jamaica",
				joinedAt: "2023-06-15",
				stats: {
					issuesReported: 47,
					issuesFixed: 12,
					totalSponsored: 850,
					impactScore: 92
				},
				roles: ["Community Leader", "Top Contributor"]
			};
		} catch (error) {
			console.error("Error fetching user profile:", error);
			throw new Error("User not found");
		}
	},
	
	async getUserRoles(userId: string) {
		try {
			// Return roles from mock profile
			const profile = await this.getUserProfile(userId);
			return profile.roles;
		} catch (error) {
			console.error("Error fetching user roles:", error);
			return [];
		}
	},
	
	async addUserRole(userId: string, role: "reporter" | "fixer" | "sponsor") {
		try {
			// For now, just return success since database isn't set up
			return { 
				id: `role_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				userId,
				role,
				message: "Role added successfully (mock)" 
			};
		} catch (error) {
			console.error("Error adding user role:", error);
			throw new Error("Failed to add role");
		}
	},
	
	async updateUserProfile(userId: string, updates: {
		name?: string;
		bio?: string;
		location?: string;
		image?: string;
	}) {
		try {
			// Get current profile
			const profile = await this.getUserProfile(userId);
			
			// Merge updates
			const updatedProfile = {
				...profile,
				...updates,
				updatedAt: new Date().toISOString()
			};
			
			// In a real implementation, this would save to database
			return updatedProfile;
		} catch (error) {
			console.error("Error updating user profile:", error);
			throw new Error("Failed to update profile");
		}
	},
	
	async getUserActivity(userId: string, params?: { limit?: number; offset?: number }) {
		try {
			const limit = params?.limit || 10;
			const offset = params?.offset || 0;
			
			// Mock activity data
			const activities = [
				{
					id: "activity-1",
					type: "issue_reported",
					title: "Reported an issue",
					description: "Broken streetlight on Hope Road causing safety concerns",
					icon: "MapPin",
					timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					status: "Under Review",
					metadata: {
						issueId: "issue-1",
						location: "Hope Road, Kingston 6, Jamaica"
					}
				},
				{
					id: "activity-2",
					type: "issue_resolved",
					title: "Resolved an issue",
					description: "Repaired potholes on Spanish Town Road",
					icon: "Wrench",
					timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
					status: "Completed",
					metadata: {
						issueId: "issue-2",
						location: "Spanish Town Road, Kingston, Jamaica"
					}
				},
				{
					id: "activity-3",
					type: "sponsored_repair",
					title: "Sponsored repair",
					description: "Contributed $50 to water main repair project",
					icon: "DollarSign",
					timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
					status: "Community Impact",
					metadata: {
						amount: 50,
						projectId: "project-1"
					}
				}
			];
			
			// Paginate results
			const paginatedActivities = activities.slice(offset, offset + limit);
			
			return {
				activities: paginatedActivities,
				total: activities.length,
				limit,
				offset
			};
		} catch (error) {
			console.error("Error fetching user activity:", error);
			throw new Error("Failed to fetch activity");
		}
	}
};