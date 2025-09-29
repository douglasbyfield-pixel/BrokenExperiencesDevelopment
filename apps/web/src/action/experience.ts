"use server";

import { eden } from "@web/lib/eden";
import { authActionClient } from "@web/lib/safe-action";
import { z } from "zod";

export const createExperienceAction = authActionClient
	.inputSchema(
		z.object({
			categoryId: z.string(),
			title: z.string(),
		}),
	)
	.action(async ({ ctx: { sessionToken }, parsedInput }) => {
		const response = await eden.experience.post(
			{
				categoryId: parsedInput.categoryId,
				title: parsedInput.title,
				description: "Created via feed",
				latitude: "0",
				longitude: "0",
				address: "123 Main St, Anytown, USA",
				status: "in_progress",
				priority: "medium",
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
