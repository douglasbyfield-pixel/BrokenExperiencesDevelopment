"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Home, Plus, User, Settings } from "lucide-react";
import { Button } from "./ui/button";

export default function FloatingNav() {
	const pathname = usePathname();

	const links = [
		{ to: "/home", label: "Home", icon: Home },
		{ to: "/map", label: "Map", icon: MapPin },
		{ to: "/report", label: "Report", icon: Plus },
		{ to: "/profile", label: "Profile", icon: User },
		{ to: "/settings", label: "Settings", icon: Settings },
	] as const;

	return (
		<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
			<div className="bg-white border-2 border-black shadow-lg px-4 py-3 flex items-center space-x-2">
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