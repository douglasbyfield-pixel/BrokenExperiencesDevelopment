import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
	try {
		const headersList = await headers();
		// Get session using betterFetch
		const { data: session } = await betterFetch<Session>(
			"/api/auth/get-session",
			{
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "https://brokenexperiences.onrender.com",
				headers: {
					cookie: headersList.get("cookie") || "",
				},
			},
		);
		
		if (session) {
			// User is authenticated, redirect to home
			redirect("/home");
		} else {
			// User is not authenticated, redirect to login
			redirect("/login");
		}
	} catch (error) {
		// If there's an error getting session, redirect to login
		console.error("Error getting session:", error);
		redirect("/login");
	}
}
