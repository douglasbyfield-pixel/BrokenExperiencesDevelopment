import Elysia from "elysia";
import { experienceModel } from "./schema";
import {
	createExperience,
	deleteExperience,
	getExperience,
	getExperiences,
	getNearbyExperiences,
	updateExperience,
	voteOnExperience,
} from "./service";

export const experienceRouter = new Elysia({
	prefix: "/experience",
	tags: ["Experience"],
})
	.use(experienceModel)
	.get(
		"/",
		async ({ query }) => {
			const result = await getExperiences({ query: query });
			return result;
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
		async ({ body }) => {
			const result = await createExperience({ data: body });
			return result;
		},
		{
			body: "experience.create",
			detail: {
				summary: "Add a experience",
				description:
					"Creates and stores a new experience with the provided details.",
			},
		},
	)
	.post(
		"/:experienceId/vote",
		async ({ body, params }) => {
			const result = await voteOnExperience({
				id: params.experienceId,
				data: body,
				userId: "6a826832-aea4-481e-b3a1-c9639f96bdb2",
			});
			return result;
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
		async ({ params }) => {
			const result = await deleteExperience({ id: params.experienceId });
			return result;
		},
		{
			params: "experience.identifier.params",
			detail: {
				summary: "Delete a experience by id",
				description: "Deletes a experience by id from the database.",
			},
		},
	);
