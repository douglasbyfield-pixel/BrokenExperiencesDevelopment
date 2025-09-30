"use server";

import { eden } from "@web/lib/eden";
import { authActionClient, actionClient } from "@web/lib/safe-action";
import { createClient } from "@web/lib/supabase/client";
import { z } from "zod";

export const createExperienceAction = actionClient
	.inputSchema(
		z.object({
			categoryId: z.string(),
			title: z.string().optional(),
			description: z.string().min(1, "Please describe your experience"),
			latitude: z.string(),
			longitude: z.string(),
			address: z.string(),
		}),
	)
	.action(async ({ parsedInput }) => {
		console.log("🚀 Creating experience with input:", parsedInput);
		
		// Ensure title meets server requirements (min 5 chars)
		const title = parsedInput.title && parsedInput.title.length >= 5 
			? parsedInput.title 
			: parsedInput.description.length >= 5 
				? parsedInput.description.substring(0, 100)
				: "Experience Report";

		const description = parsedInput.description;

		// Temporary workaround: Use direct API call without authentication
		// TODO: Fix this when backend is updated to use Supabase auth
		const payload = {
			categoryId: parsedInput.categoryId,
			title: title,
			description: description,
			latitude: parsedInput.latitude,
			longitude: parsedInput.longitude,
			address: parsedInput.address,
			status: "pending",
			priority: "medium",
		};

		console.log("Making API call to:", `${process.env.NEXT_PUBLIC_SERVER_URL}/experience`);
		console.log("With payload:", payload);

		// Get Supabase session token
		const supabase = createClient();
		const { data: { session } } = await supabase.auth.getSession();
		
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		
		// Add authorization header if user is authenticated
		if (session?.access_token) {
			headers.Authorization = `Bearer ${session.access_token}`;
		}

		// Try to create experience using Supabase auth
		try {
			const directResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/experience`, {
				method: 'POST',
				headers,
				body: JSON.stringify(payload)
			});

			console.log("Experience creation response status:", directResponse.status);
			const responseText = await directResponse.text();
			console.log("Response body:", responseText);

			if (!directResponse.ok) {
				// Try to parse error details
				let errorDetails = responseText;
				try {
					const errorData = JSON.parse(responseText);
					errorDetails = errorData.message || errorData.error || responseText;
				} catch (e) {
					// Keep original responseText if not JSON
				}
				throw new Error(`Failed to create experience. Status: ${directResponse.status}, Details: ${errorDetails}`);
			}

			const data = JSON.parse(responseText);
			return data;
		} catch (error) {
			console.error("Create experience error:", error);
			throw new Error(`Failed to create experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

export const voteOnExperienceAction = authActionClient
	.inputSchema(
		z.object({
			experienceId: z.string(),
			vote: z.boolean(),
		}),
	)
	.action(async ({ ctx: { sessionToken }, parsedInput }) => {
		const response = await eden.experience[parsedInput.experienceId].vote.post(
			{
				vote: parsedInput.vote,
				$query: {},
				$headers: {},
			},
			{
				fetch: { headers: { cookie: sessionToken } },
			},
		);

		console.log(response);

		return response.data;
	});
