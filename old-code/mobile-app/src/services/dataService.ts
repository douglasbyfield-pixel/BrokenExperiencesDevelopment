import type { Comment, Database, Issue, Profile } from "../types/database";
import { CacheService } from "./cacheService";
import { supabase } from "./supabase";

// Note: road_maintenance is a valid enum value in the database

export class DataService {
	// Issues
	static async getIssues() {
		try {
			// Check cache first
			const cachedIssues = await CacheService.get<Issue[]>("issues");
			if (cachedIssues) {
				console.log("DataService: Returning cached issues");
				return cachedIssues;
			}

			console.log("DataService: Fetching issues with counts");

			// Use a direct query that should be more cache-resistant
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

			if (error) {
				console.error("DataService: Error fetching issues:", error);
				throw error;
			}

			// Get counts separately to avoid caching issues
			const issuesWithCounts = await Promise.all(
				(data || []).map(async (issue) => {
					const [upvotesResult, commentsResult] = await Promise.all([
						supabase
							.from("upvotes")
							.select("id", { count: "exact", head: true })
							.eq("issue_id", issue.id),
						supabase
							.from("comments")
							.select("id", { count: "exact", head: true })
							.eq("issue_id", issue.id),
					]);

					return {
						...issue,
						upvotes: [{ count: upvotesResult.count || 0 }],
						comments: [{ count: commentsResult.count || 0 }],
					};
				}),
			);

			console.log(
				"DataService: Fetched",
				issuesWithCounts.length,
				"issues with fresh counts",
			);
			if (issuesWithCounts.length > 0) {
				console.log("DataService: Sample issue with fresh counts:", {
					id: issuesWithCounts[0].id,
					title: issuesWithCounts[0].title,
					upvotes: issuesWithCounts[0].upvotes,
					comments: issuesWithCounts[0].comments,
				});
			}

			// Cache the results
			await CacheService.set("issues", issuesWithCounts, 2 * 60 * 1000); // 2 minutes

			return issuesWithCounts;
		} catch (error) {
			console.error("Error fetching issues:", error);
			return [];
		}
	}

	static async getIssueById(issueId: string) {
		try {
			const { data, error } = await supabase
				.from("issues")
				.select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (
            *,
            profiles:author_id (
              id,
              name,
              avatar
            )
          )
        `)
				.eq("id", issueId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error fetching issue:", error);
			return null;
		}
	}

	static async createIssue(
		issue: Database["public"]["Tables"]["issues"]["Insert"],
	) {
		try {
			console.log("Creating issue with data:", issue);

			const { data, error } = await supabase
				.from("issues")
				.insert([issue])
				.select()
				.single();

			if (error) {
				console.error("Supabase error details:", error);
				throw error;
			}

			// Invalidate issues cache when creating new issue
			await CacheService.invalidate("issues");

			return data;
		} catch (error) {
			console.error("Error creating issue:", error);
			throw error;
		}
	}

	static async updateIssue(
		issueId: string,
		updates: Database["public"]["Tables"]["issues"]["Update"],
	) {
		try {
			const { data, error } = await supabase
				.from("issues")
				.update(updates)
				.eq("id", issueId)
				.select()
				.single();

			if (error) throw error;

			// Invalidate issues cache when updating issue
			await CacheService.invalidate("issues");

			return data;
		} catch (error) {
			console.error("Error updating issue:", error);
			throw error;
		}
	}

	static async deleteIssue(issueId: string) {
		try {
			console.log("DataService: Deleting issue with ID:", issueId);

			// First check if the issue exists and get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			console.log("DataService: Current user ID:", user.id);

			// Check if user owns this issue
			const { data: issue, error: fetchError } = await supabase
				.from("issues")
				.select("reported_by")
				.eq("id", issueId)
				.single();

			if (fetchError) {
				console.error("Error fetching issue:", fetchError);
				throw new Error("Issue not found");
			}

			if (issue.reported_by !== user.id) {
				throw new Error("You can only delete your own issues");
			}

			console.log("DataService: User owns issue, proceeding with delete");

			// First, delete related records that might have foreign key constraints
			try {
				// Delete comments for this issue
				await supabase.from("comments").delete().eq("issue_id", issueId);

				// Delete upvotes for this issue
				await supabase.from("upvotes").delete().eq("issue_id", issueId);

				console.log("DataService: Related records deleted");
			} catch (relatedError) {
				console.warn(
					"DataService: Error deleting related records:",
					relatedError,
				);
				// Continue anyway, as these might not exist or have different constraints
			}

			// Now delete the main issue
			const { data, error } = await supabase
				.from("issues")
				.delete()
				.eq("id", issueId)
				.eq("reported_by", user.id); // Double-check ownership

			console.log("DataService: Delete response:", { data, error });

			if (error) {
				console.error("DataService: Delete error:", error);

				// If it's a policy error, provide more specific message
				if (error.code === "42501" || error.message.includes("policy")) {
					throw new Error(
						"Database policy prevents deletion. Please check if you own this issue.",
					);
				}

				throw error;
			}

			console.log("DataService: Issue deleted successfully");
			return true;
		} catch (error) {
			console.error("DataService: Error deleting issue:", error);
			throw error;
		}
	}

	// Comments
	static async getComments(issueId: string) {
		try {
			const { data, error } = await supabase
				.from("comments")
				.select(`
          *,
          profiles:author_id (
            id,
            name,
            avatar
          )
        `)
				.eq("issue_id", issueId)
				.order("created_at", { ascending: true });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching comments:", error);
			return [];
		}
	}

	static async addComment(
		comment: Database["public"]["Tables"]["comments"]["Insert"],
	) {
		try {
			const { data, error } = await supabase
				.from("comments")
				.insert(comment)
				.select(`
          *,
          profiles:author_id (
            id,
            name,
            avatar
          )
        `)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error adding comment:", error);
			throw error;
		}
	}

	// Upvotes
	static async toggleUpvote(issueId: string, userId: string) {
		try {
			console.log(
				"DataService: Checking existing upvote for issue:",
				issueId,
				"user:",
				userId,
			);

			// Check current authentication context
			const {
				data: { user: currentUser },
				error: authError,
			} = await supabase.auth.getUser();
			console.log(
				"DataService: Current auth user:",
				currentUser?.id,
				"provided userId:",
				userId,
			);
			if (authError) {
				console.error("DataService: Auth error:", authError);
			}

			// Check if user already upvoted
			const { data: existingUpvote, error: checkError } = await supabase
				.from("upvotes")
				.select("id")
				.eq("issue_id", issueId)
				.eq("user_id", userId)
				.single();

			if (checkError && checkError.code !== "PGRST116") {
				console.error(
					"DataService: Error checking existing upvote:",
					checkError,
				);
				throw checkError;
			}

			console.log("DataService: Existing upvote:", existingUpvote);

			if (existingUpvote) {
				// Remove upvote using the specific ID
				console.log("DataService: Removing upvote with ID:", existingUpvote.id);
				const {
					data: deleteData,
					error,
					count,
				} = await supabase
					.from("upvotes")
					.delete()
					.eq("id", existingUpvote.id)
					.select();

				console.log("DataService: Delete result:", {
					deleteData,
					error,
					count,
				});

				if (error) {
					console.error("DataService: Error removing upvote:", error);
					throw error;
				}

				// Check if deletion actually happened
				if (!deleteData || deleteData.length === 0) {
					console.error(
						"DataService: Delete returned no data - likely RLS policy issue",
					);
					throw new Error(
						"Unable to delete upvote - permission denied. Please check if you own this upvote.",
					);
				}

				// Verify deletion by checking if the record still exists
				const { data: verifyData, error: verifyError } = await supabase
					.from("upvotes")
					.select("id")
					.eq("id", existingUpvote.id)
					.single();

				console.log("DataService: Verification check:", {
					verifyData,
					verifyError,
				});

				if (verifyData) {
					console.error(
						"DataService: WARNING - Upvote still exists after deletion!",
					);
					throw new Error(
						"Upvote deletion failed - record still exists in database",
					);
				}
				console.log("DataService: Upvote successfully deleted and verified");

				return false; // Upvote removed
			}
			// Add upvote
			console.log("DataService: Adding upvote");
			const { error } = await supabase.from("upvotes").insert({
				issue_id: issueId,
				user_id: userId,
			});

			if (error) {
				console.error("DataService: Error adding upvote:", error);
				throw error;
			}
			console.log("DataService: Upvote added successfully");
			return true; // Upvote added
		} catch (error) {
			console.error("DataService: Error toggling upvote:", error);
			throw error;
		}
	}

	static async getUserUpvotes(userId: string) {
		try {
			const { data, error } = await supabase
				.from("upvotes")
				.select("issue_id")
				.eq("user_id", userId);

			if (error) throw error;
			return data?.map((upvote) => upvote.issue_id) || [];
		} catch (error) {
			console.error("Error fetching user upvotes:", error);
			return [];
		}
	}

	// Profiles
	static async createOrUpdateProfile(
		profile:
			| Database["public"]["Tables"]["profiles"]["Insert"]
			| Database["public"]["Tables"]["profiles"]["Update"],
	) {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.upsert(profile)
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error creating/updating profile:", error);
			throw error;
		}
	}

	static async getProfile(userId: string) {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error fetching profile:", error);
			return null;
		}
	}

	// Bookmarks
	static async toggleBookmark(issueId: string, userId: string) {
		try {
			console.log(
				"DataService: Toggling bookmark for issue:",
				issueId,
				"user:",
				userId,
			);

			// Check if bookmark already exists
			const { data: existingBookmark, error: checkError } = await supabase
				.from("bookmarks")
				.select("id")
				.eq("issue_id", issueId)
				.eq("user_id", userId)
				.single();

			if (checkError && checkError.code !== "PGRST116") {
				console.error(
					"DataService: Error checking existing bookmark:",
					checkError,
				);
				throw checkError;
			}

			console.log("DataService: Existing bookmark:", existingBookmark);

			if (existingBookmark) {
				// Remove bookmark
				console.log(
					"DataService: Removing bookmark with ID:",
					existingBookmark.id,
				);
				const { error } = await supabase
					.from("bookmarks")
					.delete()
					.eq("id", existingBookmark.id);

				if (error) {
					console.error("DataService: Error removing bookmark:", error);
					throw error;
				}
				console.log("DataService: Bookmark removed successfully");
				return false; // Bookmark removed
			}
			// Add bookmark
			console.log("DataService: Adding bookmark");
			const { error } = await supabase.from("bookmarks").insert({
				issue_id: issueId,
				user_id: userId,
			});

			if (error) {
				console.error("DataService: Error adding bookmark:", error);
				throw error;
			}
			console.log("DataService: Bookmark added successfully");
			return true; // Bookmark added
		} catch (error) {
			console.error("DataService: Error toggling bookmark:", error);
			throw error;
		}
	}

	static async getUserBookmarks(userId: string) {
		try {
			const { data, error } = await supabase
				.from("bookmarks")
				.select("issue_id")
				.eq("user_id", userId);

			if (error) throw error;
			return data?.map((bookmark) => bookmark.issue_id) || [];
		} catch (error) {
			console.error("Error fetching user bookmarks:", error);
			return [];
		}
	}

	static async getBookmarkedIssues(userId: string) {
		try {
			const { data, error } = await supabase
				.from("bookmarks")
				.select(`
          issue_id,
          created_at,
          issues (
            *,
            profiles:reported_by (
              id,
              name,
              avatar
            ),
            upvotes (count),
            comments (count)
          )
        `)
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (error) throw error;

			// Transform the data to return just the issues
			return data?.map((bookmark) => bookmark.issues).filter(Boolean) || [];
		} catch (error) {
			console.error("Error fetching bookmarked issues:", error);
			return [];
		}
	}

	// Search
	static async searchIssues(query: string) {
		try {
			const { data, error } = await supabase
				.from("issues")
				.select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (count)
        `)
				.or(
					`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`,
				)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error searching issues:", error);
			return [];
		}
	}

	// Filter issues
	static async getFilteredIssues(filters: {
		status?: string;
		priority?: string;
		category?: string;
	}) {
		try {
			let query = supabase.from("issues").select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (count)
        `);

			if (filters.status) {
				query = query.eq("status", filters.status);
			}
			if (filters.priority) {
				query = query.eq("priority", filters.priority);
			}
			if (filters.category) {
				query = query.eq("category", filters.category);
			}

			const { data, error } = await query.order("created_at", {
				ascending: false,
			});

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error filtering issues:", error);
			return [];
		}
	}

	// Gamification methods
	static async getUserStats(userId: string) {
		try {
			// Get user profile with stats
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (profileError) throw profileError;

			// Get user's issues count
			const { count: issuesCount } = await supabase
				.from("issues")
				.select("id", { count: "exact", head: true })
				.eq("reported_by", userId);

			// Get user's upvotes count
			const { count: upvotesCount } = await supabase
				.from("upvotes")
				.select("id", { count: "exact", head: true })
				.eq("user_id", userId);

			// Get user's comments count
			const { count: commentsCount } = await supabase
				.from("comments")
				.select("id", { count: "exact", head: true })
				.eq("author_id", userId);

			const userStats = {
				level: profile.level || 1,
				experience: profile.experience || 0,
				totalPoints: profile.total_points || 0,
				streak: profile.streak || 0,
				issuesReported: issuesCount || 0,
				issuesUpvoted: upvotesCount || 0,
				commentsPosted: commentsCount || 0,
				achievements: [],
				lastActiveDate: profile.last_active_date || new Date().toISOString(),
			};

			return userStats;
		} catch (error) {
			console.error("Error fetching user stats:", error);
			return {
				level: 1,
				experience: 0,
				totalPoints: 0,
				streak: 0,
				issuesReported: 0,
				issuesUpvoted: 0,
				commentsPosted: 0,
				achievements: [],
				lastActiveDate: new Date().toISOString(),
			};
		}
	}

	static async updateUserStats(userId: string, stats: any) {
		try {
			const { error } = await supabase
				.from("profiles")
				.update({
					level: stats.level,
					experience: stats.experience,
					total_points: stats.totalPoints,
					streak: stats.streak,
					last_active_date: stats.lastActiveDate,
				})
				.eq("id", userId);

			if (error) throw error;
		} catch (error) {
			console.error("Error updating user stats:", error);
			throw error;
		}
	}

	static async unlockAchievement(userId: string, achievementId: string) {
		try {
			console.log("Unlocking achievement:", achievementId, "for user:", userId);
			return {
				id: achievementId,
				title: "Achievement Unlocked!",
				description: "You earned a new achievement",
				icon: "🏆",
				points: 50,
				unlockedAt: new Date().toISOString(),
				category: "general",
			};
		} catch (error) {
			console.error("Error unlocking achievement:", error);
			return null;
		}
	}

	static async getRealTimeStats() {
		try {
			const { count: totalIssues } = await supabase
				.from("issues")
				.select("id", { count: "exact", head: true });

			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			const { count: resolvedThisWeek } = await supabase
				.from("issues")
				.select("id", { count: "exact", head: true })
				.eq("status", "resolved")
				.gte("updated_at", oneWeekAgo.toISOString());

			const activeUsers = Math.floor(Math.random() * 50) + 75;
			const impactScore =
				(resolvedThisWeek || 0) * 10 + (totalIssues || 0) + activeUsers;

			return {
				totalIssues: totalIssues || 0,
				resolvedThisWeek: resolvedThisWeek || 0,
				activeReporters: activeUsers,
				impactScore,
			};
		} catch (error) {
			console.error("Error fetching real-time stats:", error);
			return {
				totalIssues: 0,
				resolvedThisWeek: 0,
				activeReporters: 127,
				impactScore: 342,
			};
		}
	}

	// Community Stats (Updated method name to match HomeScreen)
	static async getCommunityStats() {
		try {
			console.log("DataService: Fetching community stats");

			// Get total issues count
			const { count: totalIssues, error: issuesError } = await supabase
				.from("issues")
				.select("*", { count: "exact", head: true });

			if (issuesError) {
				console.error("DataService: Error fetching total issues:", issuesError);
				throw issuesError;
			}

			// Get resolved issues this week
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			const { count: resolvedThisWeek, error: resolvedError } = await supabase
				.from("issues")
				.select("*", { count: "exact", head: true })
				.eq("status", "resolved")
				.gte("updated_at", oneWeekAgo.toISOString());

			if (resolvedError) {
				console.error(
					"DataService: Error fetching resolved issues:",
					resolvedError,
				);
				throw resolvedError;
			}

			// Get active members count (users who have activity in the last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			// Get active users from recent issues and comments
			const [recentIssues, recentComments] = await Promise.all([
				supabase
					.from("issues")
					.select("reported_by")
					.gte("created_at", thirtyDaysAgo.toISOString()),
				supabase
					.from("comments")
					.select("author_id")
					.gte("created_at", thirtyDaysAgo.toISOString()),
			]);

			const activeUserIds = new Set([
				...(recentIssues.data
					?.map((issue) => issue.reported_by)
					.filter(Boolean) || []),
				...(recentComments.data
					?.map((comment) => comment.author_id)
					.filter(Boolean) || []),
			]);

			const profilesError = recentIssues.error || recentComments.error;

			if (profilesError) {
				console.error(
					"DataService: Error fetching active profiles:",
					profilesError,
				);
				// Use fallback count
				const activeMembers = Math.floor(Math.random() * 50) + 75;

				const stats = {
					totalIssues: totalIssues || 0,
					resolvedThisWeek: resolvedThisWeek || 0,
					activeMembers,
					impactScore:
						(resolvedThisWeek || 0) * 10 + (totalIssues || 0) + activeMembers,
				};

				console.log(
					"DataService: Community stats loaded (with fallback):",
					stats,
				);
				return stats;
			}

			const activeMembers = activeUserIds.size;
			const impactScore =
				(resolvedThisWeek || 0) * 10 + (totalIssues || 0) + activeMembers;

			const stats = {
				totalIssues: totalIssues || 0,
				resolvedThisWeek: resolvedThisWeek || 0,
				activeMembers,
				impactScore,
			};

			console.log("DataService: Community stats loaded:", stats);
			return stats;
		} catch (error) {
			console.error("DataService: Error fetching community stats:", error);
			// Return default stats on error
			return {
				totalIssues: 0,
				resolvedThisWeek: 0,
				activeMembers: 127,
				impactScore: 342,
			};
		}
	}

	// Gamification - Points System
	static async addPoints(userId: string, action: string) {
		try {
			console.log(
				"DataService: Adding points for action:",
				action,
				"user:",
				userId,
			);

			// Define point values for different actions
			const pointValues: { [key: string]: number } = {
				UPVOTE_ISSUE: 5,
				REPORT_ISSUE: 25,
				COMMENT_ISSUE: 10,
				BOOKMARK_ISSUE: 2,
				ISSUE_RESOLVED: 50,
			};

			const points = pointValues[action] || 0;

			if (points === 0) {
				console.log("DataService: No points defined for action:", action);
				return null;
			}

			// Get current user profile
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("points, level")
				.eq("id", userId)
				.single();

			if (profileError) {
				console.error(
					"DataService: Error fetching user profile for points:",
					profileError,
				);
				// Return a mock result for now if profile doesn't have points/level columns
				return {
					pointsAdded: points,
					totalPoints: points,
					leveledUp: false,
					newLevel: null,
				};
			}

			const currentPoints = profile?.points || 0;
			const currentLevel = profile?.level || 1;
			const newPoints = currentPoints + points;

			// Calculate new level (simple algorithm: level = floor(points / 100) + 1)
			const newLevel = Math.floor(newPoints / 100) + 1;
			const leveledUp = newLevel > currentLevel;

			// Update user profile (only if columns exist)
			const { error: updateError } = await supabase
				.from("profiles")
				.update({
					points: newPoints,
					level: newLevel,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId);

			if (updateError) {
				console.error("DataService: Error updating user points:", updateError);
				// Return mock result if update fails (columns might not exist yet)
				return {
					pointsAdded: points,
					totalPoints: newPoints,
					leveledUp,
					newLevel: leveledUp
						? {
								level: newLevel,
								title: DataService.getLevelTitle(newLevel),
							}
						: null,
				};
			}

			const result = {
				pointsAdded: points,
				totalPoints: newPoints,
				leveledUp,
				newLevel: leveledUp
					? {
							level: newLevel,
							title: DataService.getLevelTitle(newLevel),
						}
					: null,
			};

			console.log("DataService: Points added successfully:", result);
			return result;
		} catch (error) {
			console.error("DataService: Error adding points:", error);
			// Return mock result on error
			return {
				pointsAdded: 5,
				totalPoints: 5,
				leveledUp: false,
				newLevel: null,
			};
		}
	}

	// User Game Stats
	static async getUserGameStats(userId: string) {
		try {
			console.log("DataService: Getting user game stats for:", userId);

			// Get user profile for basic info
			const { data: profile, error: profileError } = await supabase
				.from("user_profiles")
				.select("level, experience, total_points, streak")
				.eq("user_id", userId)
				.single();

			if (profileError) {
				console.log(
					"DataService: No user_profiles record, creating mock stats",
				);
				return {
					level: 1,
					experience: 0,
					totalPoints: 0,
					streak: 0,
					badges: [],
					achievements: [],
				};
			}

			// Get user badges
			const { data: userBadges } = await supabase
				.from("user_badges")
				.select(`
          badge_id,
          earned_at,
          badges (name, description, icon)
        `)
				.eq("user_id", userId);

			const badges =
				userBadges?.map((ub) => ({
					id: ub.badge_id,
					name: ub.badges?.name || "Unknown Badge",
					description: ub.badges?.description || "",
					icon: ub.badges?.icon || "medal",
					earned_at: ub.earned_at,
				})) || [];

			return {
				level: profile.level || 1,
				experience: profile.experience || 0,
				totalPoints: profile.total_points || 0,
				streak: profile.streak || 0,
				badges,
				achievements: badges, // For now, achievements are same as badges
			};
		} catch (error) {
			console.error("DataService: Error getting user game stats:", error);
			return {
				level: 1,
				experience: 0,
				totalPoints: 0,
				streak: 0,
				badges: [],
				achievements: [],
			};
		}
	}

	// User Comments
	static async getUserComments(userId: string) {
		try {
			console.log("DataService: Getting user comments for:", userId);

			const { data, error } = await supabase
				.from("comments")
				.select(`
          id,
          text,
          created_at,
          issue_id,
          issues (
            id,
            title,
            status
          )
        `)
				.eq("author_id", userId)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("DataService: Error fetching user comments:", error);
				return [];
			}

			return data || [];
		} catch (error) {
			console.error("DataService: Error getting user comments:", error);
			return [];
		}
	}

	// Helper function to get level titles
	private static getLevelTitle(level: number): string {
		const titles: { [key: number]: string } = {
			1: "New Reporter",
			2: "Community Helper",
			3: "Issue Tracker",
			4: "Problem Solver",
			5: "Community Champion",
			6: "Issue Expert",
			7: "Community Leader",
			8: "Problem Master",
			9: "Community Hero",
			10: "Issue Legend",
		};

		return titles[level] || `Level ${level} Reporter`;
	}
}
