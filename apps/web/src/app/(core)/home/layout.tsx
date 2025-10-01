import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";
import { eden } from "@web/lib/eden";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [stats, trendingCategories] = await Promise.all([
		eden.stats.get(),
		eden.stats.trending.get()
	]);
	
	// Note: userStats will now be fetched client-side in components that need it
	// since we're using Supabase auth context

	return (
		<div className="min-h-screen bg-white">
			<div className="mx-auto flex max-w-screen-xl">
				<LeftSidebar />
				<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
					{children}
				</main>
				<RightSidebar 
					stats={stats?.data} 
					userStats={null}
					trendingCategories={trendingCategories?.data}
				/>
			</div>
		</div>
	);
}
