import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "https://brokenexperiences.onrender.com",
	plugins: [nextCookies()],
	fetchOptions: {
		credentials: "include",
	},
});
