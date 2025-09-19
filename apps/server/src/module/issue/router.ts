import { Elysia, t } from "elysia";
import { issueService } from "./service";

export const issueRouter = new Elysia({ prefix: "/issue", tags: ["Issue"] })
	.get("/", async ({ query }) => {
		const filters = {
			status: query.status ? query.status.split(',') : undefined,
			severity: query.severity ? query.severity.split(',') : undefined,
			bounds: query.north && query.south && query.east && query.west ? {
				north: parseFloat(query.north),
				south: parseFloat(query.south),
				east: parseFloat(query.east),
				west: parseFloat(query.west)
			} : undefined
		};
		
		const issues = await issueService.getIssues(filters);
		return issues;
	}, {
		query: t.Object({
			status: t.Optional(t.String()),
			severity: t.Optional(t.String()),
			north: t.Optional(t.String()),
			south: t.Optional(t.String()),
			east: t.Optional(t.String()),
			west: t.Optional(t.String())
		}),
		detail: {
			summary: "Get issues",
			description: "Get all issues with optional filters for status, severity, and geographic bounds"
		}
	})
	.get("/:id", async ({ params: { id } }) => {
		const issue = await issueService.getIssueById(id);
		if (!issue) {
			throw new Error("Issue not found");
		}
		return issue;
	}, {
		params: t.Object({
			id: t.String()
		}),
		detail: {
			summary: "Get issue by ID",
			description: "Get a specific issue by its ID"
		}
	})
	.post("/", async ({ body }) => {
		const issue = await issueService.createIssue({
			...body,
			reporterId: "demo-user" // TODO: Get from auth
		});
		return issue;
	}, {
		body: t.Object({
			title: t.String(),
			description: t.String(),
			latitude: t.Number(),
			longitude: t.Number(),
			address: t.Optional(t.String()),
			severity: t.Union([
				t.Literal("low"),
				t.Literal("medium"),
				t.Literal("high"),
				t.Literal("critical")
			]),
			categoryId: t.Optional(t.String()),
			imageUrls: t.Optional(t.Array(t.String()))
		}),
		detail: {
			summary: "Create issue",
			description: "Create a new issue"
		}
	})
	.patch("/:id/status", async ({ params: { id }, body: { status } }) => {
		const issue = await issueService.updateIssueStatus(id, status);
		if (!issue) {
			throw new Error("Issue not found");
		}
		return issue;
	}, {
		params: t.Object({
			id: t.String()
		}),
		body: t.Object({
			status: t.Union([
				t.Literal("reported"),
				t.Literal("pending"),
				t.Literal("resolved")
			])
		}),
		detail: {
			summary: "Update issue status",
			description: "Update the status of an issue"
		}
	})
	.post("/:id/vote", async ({ params: { id }, body: { type } }) => {
		const issue = await issueService.voteIssue(id, type);
		if (!issue) {
			throw new Error("Issue not found");
		}
		return issue;
	}, {
		params: t.Object({
			id: t.String()
		}),
		body: t.Object({
			type: t.Union([
				t.Literal("upvote"),
				t.Literal("downvote")
			])
		}),
		detail: {
			summary: "Vote on issue",
			description: "Upvote or downvote an issue"
		}
	});