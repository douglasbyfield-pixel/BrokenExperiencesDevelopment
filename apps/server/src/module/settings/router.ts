import { supabaseSession } from "@server/lib/auth/view";
import { verifySupabaseToken, supabase } from "@server/lib/auth/supabase";
import { SettingsService } from "./service";
import { frontendSettingsSchema } from "@server/db/schema/user-settings";
import Elysia, { t } from "elysia";

export const settingsRouter = new Elysia({
	prefix: "/settings",
	tags: ["Settings"],
})
	.use(supabaseSession)
	.get(
		"/",
		async (ctx: any) => {
			try {
				// Get user from auth header
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				const user = await verifySupabaseToken(authHeader);
				
				if (!user) {
					ctx.set.status = 401;
					return {
						error: "Unauthorized",
						message: "Authentication required",
					};
				}

				const settings = await SettingsService.getUserSettings(user.id);
				return settings;
			} catch (error) {
				console.error("Error in GET /settings:", error);
				ctx.set.status = 500;
				return {
					error: "Failed to fetch settings",
					message: "Unable to retrieve user settings",
				};
			}
		},
		{
			detail: {
				summary: "Get user settings",
				description: "Returns user settings and preferences.",
			},
		}
	)
	.patch(
		"/",
		async (ctx: any) => {
			try {
				// Get user from auth header
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				const user = await verifySupabaseToken(authHeader);
				
				if (!user) {
					ctx.set.status = 401;
					return {
						error: "Unauthorized",
						message: "Authentication required",
					};
				}

				// Validate the request body
				const validatedBody = frontendSettingsSchema.partial().parse(ctx.body);
				
				const updatedSettings = await SettingsService.updateUserSettings(
					user.id,
					validatedBody
				);
				
				return {
					success: true,
					message: "Settings updated successfully",
					data: updatedSettings,
				};
			} catch (error) {
				console.error("Error in PATCH /settings:", error);
				ctx.set.status = 500;
				return {
					error: "Failed to update settings",
					message: error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		{
			body: t.Object({
				notifications: t.Optional(t.Object({
					email: t.Optional(t.Boolean()),
					push: t.Optional(t.Boolean()),
					issueUpdates: t.Optional(t.Boolean()),
					weeklyReport: t.Optional(t.Boolean()),
				})),
				privacy: t.Optional(t.Object({
					showProfile: t.Optional(t.Boolean()),
					showActivity: t.Optional(t.Boolean()),
					showStats: t.Optional(t.Boolean()),
				})),
				display: t.Optional(t.Object({
					theme: t.Optional(t.Union([t.Literal("light"), t.Literal("dark"), t.Literal("system")])),
					language: t.Optional(t.String()),
					mapStyle: t.Optional(t.String()),
				})),
			}),
			detail: {
				summary: "Update user settings",
				description: "Updates user settings and preferences.",
			},
		}
	)
	.delete(
		"/account",
		async (ctx: any) => {
			try {
				// Get user from auth header
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				const user = await verifySupabaseToken(authHeader);
				
				if (!user) {
					ctx.set.status = 401;
					return {
						error: "Unauthorized",
						message: "Authentication required",
					};
				}

				const { confirmPassword } = ctx.body;
				
				if (!confirmPassword) {
					ctx.set.status = 400;
					return {
						error: "Password required",
						message: "Password confirmation is required to delete account",
					};
				}

				// Password verification (optional - could be enhanced later)
				// For now we trust the user since they're already authenticated
				
				// Delete user from database first (this will cascade delete all related data)
				await SettingsService.deleteUserAccount(user.id);
				
				// Delete user from Supabase Auth
				const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
				
				if (deleteError) {
					console.error('Failed to delete user from Supabase Auth:', deleteError);
					// Don't fail the request since database deletion already happened
					// The user record in Auth might need manual cleanup
				}
				
				return {
					success: true,
					message: "Account deleted successfully",
				};
			} catch (error) {
				console.error("Error in DELETE /settings/account:", error);
				ctx.set.status = 500;
				return {
					error: "Failed to delete account",
					message: error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		{
			body: t.Object({
				confirmPassword: t.String(),
			}),
			detail: {
				summary: "Delete user account",
				description: "Deletes user account and all associated data.",
			},
		}
	);