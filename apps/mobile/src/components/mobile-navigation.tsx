import { Link, useLocation } from "@tanstack/react-router";
import { Award, Home, Map, Settings, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
	{ name: "Home", href: "/", icon: Home },
	{ name: "Map", href: "/map", icon: Map },
	{ name: "Profile", href: "/profile", icon: User },
	{ name: "Leaderboard", href: "/leaderboard", icon: Trophy },
	{ name: "Achievements", href: "/achievements", icon: Award },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNavigation() {
	const location = useLocation();

	return (
		<nav className="safe-area-bottom fixed right-0 bottom-0 left-0 border-border border-t bg-background">
			<div className="flex items-center justify-around py-2">
				{navigationItems.map((item) => {
					const isActive = location.pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.name}
							to={item.href}
							className={cn(
								"flex flex-col items-center justify-center rounded-lg p-2 transition-colors",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="h-5 w-5" />
							<span className="mt-1 text-xs">{item.name}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
