import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-dvh w-full min-w-0 flex-col transition-all duration-300 lg:flex-row">
			<div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
				<div className="flex min-h-dvh w-full flex-col transition-all duration-300 lg:flex-row">
					<LeftSidebar />
					{children}
					<RightSidebar />
				</div>
			</div>
		</div>
	);
}
