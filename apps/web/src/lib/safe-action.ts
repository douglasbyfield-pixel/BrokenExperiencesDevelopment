import { cookies } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({});

export const authActionClient = actionClient.use(async ({ next }) => {
	const cookieStore = await cookies();
	
	// Try both cookie name variations
	let sessionTokenName = cookieStore.get("broken-exp.session_token")?.name ?? "";
	let sessionTokenValue = cookieStore.get("broken-exp.session_token")?.value ?? "";
	
	// If not found, try the Secure prefix version
	if (!sessionTokenValue) {
		const secureCookie = cookieStore.get("__Secure-broken-exp.session_token");
		sessionTokenName = secureCookie?.name ?? "";
		sessionTokenValue = secureCookie?.value ?? "";
	}

	const sessionToken = `${sessionTokenName}=${sessionTokenValue}`;
	
	console.log("🍪 Session token debug:", {
		tokenName: sessionTokenName,
		tokenValue: sessionTokenValue ? `${sessionTokenValue.substring(0, 10)}...` : "EMPTY",
		fullToken: sessionToken ? `${sessionToken.substring(0, 30)}...` : "EMPTY",
		allCookies: Array.from(cookieStore.getAll()).map(c => c.name),
		hasBrokenExpCookie: !!cookieStore.get("broken-exp.session_token"),
		hasSecureBrokenExpCookie: !!cookieStore.get("__Secure-broken-exp.session_token")
	});

	return next({ ctx: { sessionToken } });
});
