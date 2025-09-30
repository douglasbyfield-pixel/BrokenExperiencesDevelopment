import { authClient } from "@web/lib/auth-client";
import { headers } from "next/headers";
import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";
import { redirect } from "next/navigation";
import { eden } from "@web/lib/eden";
import { session } from "@server/db/schema";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await authClient.getSession({
		fetchOptions: { headers: await headers() },
	});
	const [stats, trendingCategories] = await Promise.all([
		eden.stats.get(),
		eden.stats.trending.get()
	]);
	
	// Fetch user stats if user is logged in
	let userStats = null;
	if (session && "user" in session) {
		try {
			const headersList = await headers();
			userStats = await eden.stats.user.get({
				$query: {},
				$headers: Object.fromEntries(headersList.entries())
			});
		} catch (error) {
			console.error("Failed to fetch user stats:", error);
		}
	}

	console.log(session);

	return (
		<div className="min-h-screen bg-white">
			<div className="mx-auto flex max-w-screen-xl">
				<LeftSidebar user={session && "user" in session ? session.user as any : null} />
				<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
					{children}
				</main>
				<RightSidebar 
					stats={stats?.data} 
					userStats={userStats?.data} 
					trendingCategories={trendingCategories?.data}
				/>
			</div>
		</div>
	);
}
