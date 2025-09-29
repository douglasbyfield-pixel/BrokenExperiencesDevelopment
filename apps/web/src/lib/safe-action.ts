import { cookies } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({});

export const authActionClient = actionClient.use(async ({ next }) => {
	const cookieStore = await cookies();
	const sessionTokenName =
		cookieStore.get("broken-exp.session_token")?.name ?? "";
	const sessionTokenValue =
		cookieStore.get("broken-exp.session_token")?.value ?? "";

	const sessionToken = `${sessionTokenName}=${sessionTokenValue}`;

	return next({ ctx: { sessionToken } });
});
