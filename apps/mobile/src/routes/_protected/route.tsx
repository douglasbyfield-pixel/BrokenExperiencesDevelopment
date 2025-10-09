import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MobileNavigation } from "@/components/mobile-navigation";

export const Route = createFileRoute("/_protected")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="pb-16">
			<Outlet />
			<MobileNavigation />
		</div>
	);
}
