import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { cn, getInitials } from "@web/lib/utils";
import type { Session, User } from "better-auth";
import Link from "next/link";

interface LeftSidebarProps {
	className?: string;
	user: User;
}

export default function LeftSidebar({ className, user }: LeftSidebarProps) {
	return (
		<div
			className={cn(
				"sticky z-20 hidden h-dvh max-w-[300px] flex-col gap-4 border-gray-500/20 bg-black py-2 shadow-xl transition-all duration-500 lg:top-0 lg:flex xl:max-w-[350px] 2xl:max-w-[400px] dark:border-r dark:bg-black/30",
				className,
			)}
		>
			<div className="space-y-6 p-2">
				{/* X Logo */}
				<div className="mb-6">
					<div className="h-8 justify-center font-bold text-2xl text-white">
						Broken Experiences
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex flex-col gap-2 space-y-1">
					<Button asChild>
						<Link
							href="/home"
							className="w-full justify-start font-normal text-lg hover:bg-gray-800"
						>
							🏠 Home
						</Link>
					</Button>
					<Button asChild>
						<Link
							href="/map"
							className="w-full justify-start font-normal text-lg hover:bg-gray-800"
						>
							🔍 Maps
						</Link>
					</Button>
					<Button asChild>
						<Link
							href="/report"
							className="w-full justify-start font-normal text-lg hover:bg-gray-800"
						>
							🔔 Reports
						</Link>
					</Button>
					<Button asChild>
						<Link
							href="/profile"
							className="w-full justify-start font-normal text-lg hover:bg-gray-800"
						>
							👤 Profile
						</Link>
					</Button>
					<Button asChild>
						<Link
							href="/dev"
							className="w-full justify-start font-normal text-lg hover:bg-gray-800"
						>
							🔧 Dev
						</Link>
					</Button>
					{/* Remove duplicate Profile button */}
					{/* Remove invalid ghost buttons with '�' */}
				</nav>
			</div>
			{/* User Profile */}
			<div className="mt-8">
				<div className="flex items-center space-x-3 rounded-full p-3 hover:bg-gray-800">
					<Avatar className="h-10 w-10">
						<AvatarImage src="/avatars/you.jpg" />
						<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-sm text-white">{user.name}</p>
						<p className="text-gray-400 text-sm">{user.email}</p>
					</div>
				</div>
			</div>
		</div>
)}