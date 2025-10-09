import { verifySupabaseToken } from "@server/lib/auth/supabase";
import Elysia from "elysia";
import { BadgesService } from "./service";

export const badgesRouter = new Elysia({ prefix: "/achievements" })
	.get("/", async (ctx: any) => {
		try {
			// Get user from auth header
			const authHeader =
				ctx.request.headers.get("authorization") ||
				ctx.request.headers.get("Authorization");
			const user = await verifySupabaseToken(authHeader || undefined);

			if (!user) {
				return {
					success: false,
					error: "Authentication required",
				};
			}

			const badges = await BadgesService.getBadgesWithUserStatus(user.id);

			return {
				success: true,
				data: badges,
			};
		} catch (error) {
			console.error("Error fetching badges:", error);
			return {
				success: false,
				error: "Failed to fetch badges",
			};
		}
	})
	.get("/obtained", async (ctx: any) => {
		try {
			// Get user from auth header
			const authHeader =
				ctx.request.headers.get("authorization") ||
				ctx.request.headers.get("Authorization");
			const user = await verifySupabaseToken(authHeader || undefined);

			if (!user) {
				return {
					success: false,
					error: "Authentication required",
				};
			}

			const badges = await BadgesService.getUserObtainedBadges(user.id);

			return {
				success: true,
				data: badges,
			};
		} catch (error) {
			console.error("Error fetching obtained badges:", error);
			return {
				success: false,
				error: "Failed to fetch obtained badges",
			};
		}
	});
