import { authClient } from "@web/lib/auth-client";
import { headers } from "next/headers";
import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";
import { redirect } from "next/navigation";
import { eden } from "@web/lib/eden";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const {data} = await authClient.getSession({
		fetchOptions: { headers: await headers() },
	});
	const stats = await eden.stats.get();

	if (!data?.user) redirect("/login");

	return (
		<div className="flex min-h-dvh w-full min-w-0 flex-col transition-all duration-300 lg:flex-row">
			<div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
				<div className="flex min-h-dvh w-full flex-col transition-all duration-300 lg:flex-row">
					<LeftSidebar user={data.user} />
					{children}
					<RightSidebar stats={stats.data } />
				</div>
			</div>
		</div>
	);
}
