import { html } from "@elysiajs/html";
import Elysia, { t } from "elysia";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { MiscPage } from "./page";

export const miscRouter = new Elysia()
	.use(html())
	.get("/", ({ html }) => html(MiscPage()))
	.get("/health", () => {
		return {
			status: "ok",
		};
	})
	.get("/version", () => {
		return {
			version: "1.0.0",
		};
	})
	.post(
		"/auth/email-exists",
		async ({ body }) => {
			const email = (body as { email: string }).email;
			const { data, error } = await supabaseAdmin.auth.admin.listUsers({
				page: 1,
				perPage: 1,
				email,
			});
			if (error) {
				return { exists: false };
			}
			const exists = (data?.users ?? []).some(
				(u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
			);
			return { exists };
		},
		{
			body: t.Object({ email: t.String({ format: "email" }) }),
			detail: { summary: "Check if auth user email exists" },
		},
	);
