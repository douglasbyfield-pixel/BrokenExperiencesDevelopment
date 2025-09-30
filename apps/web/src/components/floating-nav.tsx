"use client";
import { Home, MapPin, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function FloatingNav() {
	const pathname = usePathname();

	const links = [
		{ to: "/home", label: "Home", icon: Home },
		{ to: "/map", label: "Map", icon: MapPin },
		{ to: "/profile", label: "Profile", icon: User },
		{ to: "/settings", label: "Settings", icon: Settings },
	] as const;

	return (
		<div className="-translate-x-1/2 fixed bottom-6 left-1/2 z-50 transform md:hidden">
			<div className="flex items-center space-x-2 border-2 border-black bg-white px-4 py-3 shadow-lg">
				{links.map(({ to, label, icon: Icon }) => {
					const isActive = pathname === to;
					return (
						<Link key={to} href={to}>
							<Button
								variant="outline"
								size="sm"
								className={`border-2 border-black ${
									isActive
										? "bg-black text-white"
										: "text-black hover:bg-black hover:text-white"
								}`}
								title={label}
							>
								<Icon className="h-4 w-4" />
							</Button>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
