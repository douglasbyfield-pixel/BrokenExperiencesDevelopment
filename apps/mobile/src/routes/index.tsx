import { createFileRoute } from "@tanstack/react-router";
import { MobileNavigation } from "@/components/mobile-navigation";
import { HomePage } from "@/modules/home/pages/home";

export const Route = createFileRoute("/")({
	component: () => (
		<div className="pb-16">
			<HomePage />
			<MobileNavigation />
		</div>
	),
});
