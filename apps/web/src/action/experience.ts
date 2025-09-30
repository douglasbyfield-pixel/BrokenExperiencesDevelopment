"use server";

import { eden } from "@web/lib/eden";
import { authActionClient } from "@web/lib/safe-action";
import { z } from "zod";

export const createExperienceAction = authActionClient
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
	.action(async ({ ctx: { sessionToken }, parsedInput }) => {
		console.log("🚀 Creating experience with input:", parsedInput);
		console.log("🔐 Session token available:", !!sessionToken);
		console.log("🔑 Session token value:", sessionToken);
		
		// Ensure title meets server requirements (min 5 chars)
		const title = parsedInput.title && parsedInput.title.length >= 5 
			? parsedInput.title 
			: parsedInput.description.length >= 5 
				? parsedInput.description.substring(0, 100)
				: "Experience Report";

		const description = parsedInput.description;

		// Try direct fetch first to debug
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

		console.log("Making direct fetch to:", `${process.env.NEXT_PUBLIC_SERVER_URL}/experience`);
		console.log("With payload:", payload);
		console.log("With cookie header:", sessionToken);

		const directResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/experience`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Cookie': sessionToken
			},
			body: JSON.stringify(payload)
		});

		console.log("Direct fetch response status:", directResponse.status);
		console.log("Direct fetch response headers:", Object.fromEntries(directResponse.headers.entries()));
		
		const directResponseText = await directResponse.text();
		console.log("Direct fetch response body:", directResponseText);

		// Also try the Eden approach
		const response = await eden.experience.post(
			{
				categoryId: parsedInput.categoryId,
				title: title,
				description: description,
				latitude: parsedInput.latitude,
				longitude: parsedInput.longitude,
				address: parsedInput.address,
				status: "pending",
				priority: "medium",
				$query: {},
				$headers: {},
			},
			{
				fetch: { headers: { cookie: sessionToken } },
			},
		);

		console.log("Create experience response:", response);
		console.log("API URL being called:", `${process.env.NEXT_PUBLIC_SERVER_URL}/experience`);
		console.log("Request payload:", {
			categoryId: parsedInput.categoryId,
			title: title,
			description: description,
			latitude: parsedInput.latitude,
			longitude: parsedInput.longitude,
			address: parsedInput.address,
			status: "pending",
			priority: "medium",
		});

		if (response.error) {
			console.error("API Error Details:", response.error);
			throw new Error(`Failed to create experience: ${JSON.stringify(response.error)}`);
		}

		return response.data;
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
