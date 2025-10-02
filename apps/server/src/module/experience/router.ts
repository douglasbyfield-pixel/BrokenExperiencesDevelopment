import { supabaseSession } from "@server/lib/auth/view"; 
import Elysia from "elysia";
import { verifySupabaseToken } from "@server/lib/auth/supabase";
import { experienceModel } from "./schema";
import {
  createExperience,
  deleteExperience,
  getExperience,
  getExperiences,
  getMapMarkers,
  getNearbyExperiences,
  searchExperiences,
  updateExperience,
  voteOnExperience,
} from "./service";

export const experienceRouter = new Elysia({
  prefix: "/experience",
  tags: ["Experience"],
})
  .use(supabaseSession) 
  .use(experienceModel)
  .get(
    "/",
    async (ctx: any) => {
      try {
        // Try to get user from auth header (optional)
        const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
        const user = authHeader ? await verifySupabaseToken(authHeader) : null;
        
        const result = await getExperiences({ 
          query: ctx.query,
          userId: user?.id 
        });
        return result;
      } catch (error) {
        console.error("❌ Error in GET /experience:", error);
        // Return experiences without user vote info if there's an error
        const result = await getExperiences({ query: ctx.query });
        return result;
      }
    },
    {
      query: "experience.query",
      detail: {
        summary: "Get all experiences",
        description: "Returns all experiences from the database.",
      },
    },
  )
	.get(
		"/search",
		async (ctx: any) => {
			try {
				const searchTerm = ctx.query.q as string;
				if (!searchTerm || searchTerm.trim().length === 0) {
					return [];
				}
				
				// Try to get user from auth header (optional)
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				const user = authHeader ? await verifySupabaseToken(authHeader) : null;
				
				const result = await searchExperiences(searchTerm, user?.id);
				return result;
			} catch (error) {
				console.error("❌ Error in GET /experience/search:", error);
				const searchTerm = ctx.query.q as string;
				if (!searchTerm || searchTerm.trim().length === 0) {
					return [];
				}
				// Return search results without user vote info if there's an error
				const result = await searchExperiences(searchTerm);
				return result;
			}
		},
		{
			detail: {
				summary: "Search experiences",
				description: "Search experiences by title, description, or location.",
			},
		},
	)
	.get(
		"/markers",
		async () => {
			const result = await getMapMarkers();
			return result;
		},
		{
			detail: {
				summary: "Get map markers",
				description: "Returns lightweight markers for map display (optimized for performance).",
			},
		},
	)
	.get(
		"/nearby",
		async ({ query }) => {
			const result = await getNearbyExperiences({ query: query });
			return result;
		},
		{
			query: "experience.nearby.query",
			detail: {
				summary: "Get nearby experiences",
				description: "Returns nearby experiences from the database.",
			},
		},
	)
	.post(
		"/",
		async (ctx: any) => {
		  try {
			const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
			
			const user = await verifySupabaseToken(authHeader || undefined);
			
			if (!user) {
			  return {
				error: "Authentication required",
				message: "You must be logged in to create an experience"
			  };
			}
		
			const userData: { id: string; email: string; name: string; image?: string; emailVerified: boolean } = {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
				emailVerified: user.emailVerified
			};
			
			const result = await createExperience({
			  userId: user.id,
			  userData,
			  data: ctx.body,
			});
			return result;
		  } catch (error) {
			console.error("❌ Error in POST /experience:", error);
			ctx.set.status = 500;
			return {
			  error: "Server error",
			  message: error instanceof Error ? error.message : "Unknown error"
			};
		  }
		},
		{
		  body: "experience.create",
		  detail: {
			summary: "Add a experience",
			description: "Creates and stores a new experience with the provided details.",
		  },
		},
	  )
	.post(
		"/:experienceId/vote",
		async (ctx: any) => {
			try {
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				
				const user = await verifySupabaseToken(authHeader || undefined);
				
				if (!user) {
					return {
						error: "Authentication required",
						message: "You must be logged in to vote"
					};
				}
				
				const result = await voteOnExperience({
					id: ctx.params.experienceId,
					data: ctx.body,
					userId: user.id,
				});
				return result;
			} catch (error) {
				console.error("❌ Error in POST /experience/:experienceId/vote:", error);
				ctx.set.status = 500;
				return {
					error: "Server error",
					message: error instanceof Error ? error.message : "Unknown error"
				};
			}
		},
		{
			params: "experience.identifier.params",
			body: "experience.vote",
			detail: {
				summary: "Vote on a experience",
				description: "Votes on a experience with the provided details.",
			},
		},
	)
	.get(
		"/:experienceId",
		async ({ params }) => {
			const result = await getExperience({ id: params.experienceId });
			return result;
		},
		{
			params: "experience.identifier.params",
			detail: {
				summary: "Get a experience by id",
				description: "Returns a experience by id from the database.",
			},
		},
	)
	.put(
		"/:experienceId",
		async ({ params, body }) => {
			const result = await updateExperience({
				id: params.experienceId,
				data: body,
			});
			return result;
		},
		{
			params: "experience.identifier.params",
			body: "experience.update",
			detail: {
				summary: "Update a experience by id",
				description:
					"Updates a experience by id in the database using the provided details.",
			},
		},
	)
	.delete(
		"/:experienceId",
		async (ctx: any) => {
			try {
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				const user = await verifySupabaseToken(authHeader || undefined);

				if (!user) {
					ctx.set.status = 401;
					return {
						error: "Authentication required",
						message: "You must be logged in to delete an experience"
					};
				}

				const result = await deleteExperience({ 
					id: ctx.params.experienceId,
					userId: user.id 
				});
				return result;
			} catch (error) {
				console.error("❌ Error in DELETE /experience/:experienceId:", error);
				ctx.set.status = 500;
				return {
					error: "Server error",
					message: error instanceof Error ? error.message : "Unknown error"
				};
			}
		},
		{
			params: "experience.identifier.params",
			detail: {
				summary: "Delete a experience by id",
				description: "Deletes a experience by id from the database.",
			},
		},
	);
