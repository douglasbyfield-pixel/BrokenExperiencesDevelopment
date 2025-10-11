import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@web/lib/supabase/client";
import type { Experience } from "@web/types";
import { awardPoints } from "./use-leaderboard";

// Query keys for consistent caching
export const experienceKeys = {
	all: ["experiences"] as const,
	lists: () => [...experienceKeys.all, "list"] as const,
	list: (filters: Record<string, any>) =>
		[...experienceKeys.lists(), filters] as const,
	details: () => [...experienceKeys.all, "detail"] as const,
	detail: (id: string) => [...experienceKeys.details(), id] as const,
	markers: () => [...experienceKeys.all, "markers"] as const,
};

// Fetch experiences with caching
export function useExperiences(userId?: string) {
	return useQuery({
		queryKey: experienceKeys.list({ userId }),
		queryFn: async (): Promise<Experience[]> => {
			const supabase = createClient();

			// Get session for user ID
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const currentUserId = session?.user?.id || userId;

			// Reduced logging for performance
			const startTime = performance.now();

			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

				// Add authorization header if user is logged in
				const headers: Record<string, string> = {
					"Content-Type": "application/json",
				};

				if (session?.access_token) {
					headers["Authorization"] = `Bearer ${session.access_token}`;
				}

				const response = await fetch(`${apiUrl}/experience`, {
					method: "GET",
					headers,
					cache: "no-store", // Force fresh data
				});

				if (!response.ok) {
					throw new Error(
						`Failed to fetch experiences: ${response.statusText}`,
					);
				}

				const experiences = await response.json();
				// Only log in development
				if (process.env.NODE_ENV === "development") {
					const endTime = performance.now();
					console.log(
						`✅ Experiences fetched: ${experiences.length} items in ${(endTime - startTime).toFixed(2)}ms`,
					);
				}

				return experiences;
			} catch (error) {
				console.error("❌ Error fetching experiences:", error);
				throw error;
			}
		},
		// Cache for 5 minutes, no automatic background refetch
		staleTime: 5 * 60 * 1000,
		// Keep in cache for 10 minutes
		gcTime: 10 * 60 * 1000,
		// Reduce aggressive refetching that can disrupt optimistic updates
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}

// Fetch map markers (lightweight data for map)
export function useMapMarkers() {
	return useQuery({
		queryKey: experienceKeys.markers(),
		queryFn: async (): Promise<Experience[]> => {
			console.log("🗺️ Fetching map markers with TanStack Query...");
			const startTime = performance.now();

			try {
				// Try the lightweight markers endpoint first
				const apiUrl =
					process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
				const response = await fetch(`${apiUrl}/experience/markers`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					console.log(
						"⚠️ Markers endpoint failed, falling back to full experiences",
					);
					// Fallback to full experiences endpoint
					const fallbackResponse = await fetch(`${apiUrl}/experience`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (!fallbackResponse.ok) {
						throw new Error(
							`Failed to fetch experiences: ${fallbackResponse.statusText}`,
						);
					}

					const experiences = await fallbackResponse.json();
					const endTime = performance.now();
					console.log(
						`✅ Experiences (fallback) fetched in ${(endTime - startTime).toFixed(2)}ms`,
					);
					return experiences;
				}

				const markers = await response.json();
				const endTime = performance.now();
				console.log(
					`✅ Map markers fetched in ${(endTime - startTime).toFixed(2)}ms`,
				);
				return markers;
			} catch (error) {
				console.error("❌ Error fetching map markers:", error);
				throw error;
			}
		},
		// Cache for 3 minutes, no automatic background refetch
		staleTime: 3 * 60 * 1000,
		// Keep in cache for 5 minutes
		gcTime: 5 * 60 * 1000,
	});
}

// Fetch single experience by ID
export function useExperience(id: string) {
	return useQuery({
		queryKey: experienceKeys.detail(id),
		queryFn: async (): Promise<Experience | null> => {
			if (!id) return null;

			console.log("🔍 Fetching single experience with TanStack Query...");
			const startTime = performance.now();

			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
				const response = await fetch(`${apiUrl}/experience`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(
						`Failed to fetch experiences: ${response.statusText}`,
					);
				}

				const experiences = await response.json();
				const experience = experiences.find((exp: Experience) => exp.id === id);

				const endTime = performance.now();
				console.log(
					`✅ Single experience fetched in ${(endTime - startTime).toFixed(2)}ms`,
				);

				return experience || null;
			} catch (error) {
				console.error("❌ Error fetching single experience:", error);
				throw error;
			}
		},
		enabled: !!id,
		// Cache for 5 minutes
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

// Search experiences
export function useSearchExperiences(searchTerm: string, userId?: string) {
	return useQuery({
		queryKey: experienceKeys.list({ search: searchTerm, userId }),
		queryFn: async (): Promise<Experience[]> => {
			if (!searchTerm.trim()) {
				return [];
			}

			console.log("🔍 Searching experiences with TanStack Query...");
			const startTime = performance.now();

			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
				const response = await fetch(
					`${apiUrl}/experience/search?q=${encodeURIComponent(searchTerm)}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					},
				);

				if (!response.ok) {
					throw new Error(
						`Failed to search experiences: ${response.statusText}`,
					);
				}

				const results = await response.json();
				const endTime = performance.now();
				console.log(
					`✅ Search results fetched in ${(endTime - startTime).toFixed(2)}ms`,
				);

				return results;
			} catch (error) {
				console.error("❌ Error searching experiences:", error);
				throw error;
			}
		},
		enabled: !!searchTerm.trim(),
		// Cache search results for 1 minute
		staleTime: 1 * 60 * 1000,
		gcTime: 2 * 60 * 1000,
	});
}

// Vote on experience with simple, reliable updates
export function useVoteExperience() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			experienceId,
			vote,
			currentUserVote,
		}: {
			experienceId: string;
			vote: "up" | "down";
			currentUserVote: boolean | null;
		}) => {
			console.log("🗳️ Voting on experience:", { experienceId, vote, currentUserVote });

			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				console.error("❌ No session found, user not authenticated");
				throw new Error("You must be logged in to endorse");
			}

			// Determine what vote to send based on current state
			let voteValue: boolean;
			if (vote === "up") {
				// If currently endorsed (true), toggle off (false)
				// If not endorsed (null/false), vote up (true)
				voteValue = currentUserVote !== true;
			} else {
				// Down vote logic (if needed later)
				voteValue = false;
			}

			console.log("📤 Sending vote value:", voteValue, "for action:", vote);

			const apiUrl =
				process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

			const response = await fetch(
				`${apiUrl}/experience/${experienceId}/vote`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({ vote: voteValue }),
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("❌ Server error response:", errorText);
				throw new Error(
					`Failed to vote: ${response.statusText} - ${errorText}`,
				);
			}

			const result = await response.json();
			console.log("✅ Vote successful, server response:", result);
			return { ...result, experienceId };
		},
		// Simple success-only approach - no optimistic updates to avoid race conditions
		onSuccess: (data) => {
			console.log("🔄 Updating cache with server data:", data);
			
			// Update ALL relevant caches with the server response
			queryClient.setQueriesData(
				{ queryKey: experienceKeys.all },
				(old: Experience[] | undefined) => {
					if (!old) return old;

					return old.map((exp) => {
						if (exp.id === data.experienceId) {
							console.log("📝 Updating experience in cache:", {
								id: exp.id,
								oldUpvotes: exp.upvotes,
								newUpvotes: data.upvotes,
								oldUserVote: exp.userVote,
								newUserVote: data.userVote
							});
							
							return {
								...exp,
								upvotes: data.upvotes,
								userVote: data.userVote,
							};
						}
						return exp;
					});
				},
			);
		},
		// No cache invalidation - let the success handler manage everything
	});
}

// Create experience with optimistic updates
export function useCreateExperience() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (experienceData: any) => {
			console.log("📝 Creating experience with data:", experienceData);

			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				console.error("❌ No session found, user not authenticated");
				throw new Error("You must be logged in to create an experience");
			}

			console.log("✅ User authenticated:", session.user.id);

			const apiUrl =
				process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
			console.log("📤 Sending POST to:", `${apiUrl}/experience`);

			const response = await fetch(`${apiUrl}/experience`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify(experienceData),
			});

			console.log("📥 Response status:", response.status, response.statusText);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("❌ Server error response:", errorText);
				throw new Error(
					`Failed to create experience: ${response.statusText} - ${errorText}`,
				);
			}

			const result = await response.json();
			console.log("✅ Server response:", result);
			return result;
		},
		onSuccess: async (newExperience) => {
			console.log(
				"✅ Experience created, invalidating cache and refetching...",
			);

			// Award points for adding an experience
			try {
				await awardPoints("add_experience", newExperience.id);
				console.log("🎯 Points awarded for creating experience");
			} catch (error) {
				console.error("Failed to award points:", error);
			}

			// Invalidate and refetch experiences immediately
			await queryClient.invalidateQueries({
				queryKey: experienceKeys.all,
				refetchType: "all",
			});
			// Force an immediate refetch
			await queryClient.refetchQueries({
				queryKey: experienceKeys.all,
				type: "all",
			});
			console.log("✅ Cache invalidated and refetched");
		},
	});
}
