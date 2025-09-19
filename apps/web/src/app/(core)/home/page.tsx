import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";

export default async function DashboardPage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});

	// Allow demo access without authentication
	const demoSession = {
		user: {
			id: "demo-user",
			name: "Demo User",
			email: "demo@example.com",
			image: null,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		session: {
			id: "demo-session",
			userId: "demo-user",
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
			token: "demo-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			ipAddress: null,
			userAgent: null
		}
	};

	return <Dashboard session={session.data || demoSession} />;
}
