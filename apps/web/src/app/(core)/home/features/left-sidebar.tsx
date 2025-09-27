import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
    className?: string;
}

export default function LeftSidebar({ className }: LeftSidebarProps) {
    return (
        <div className={cn("w-64 border-gray-800 border-r bg-black p-4", className)}>
            <div className="space-y-6">
                {/* X Logo */}
                <div className="mb-6">
                    <div className="flex h-8 w-8 items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6 fill-white"
                            aria-label="X Logo"
                        >
                            <title>X Logo</title>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start font-normal text-xl hover:bg-gray-800"
                    >
                        🏠 Home
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        🔍 Explore
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        🔔 Notifications
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                            2
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        ✉️ Messages
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        📋 Bookmarks
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        👤 Profile
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:bg-gray-800"
                    >
                        ⋯ More
                    </Button>
                </nav>

                {/* Post Button */}
                <Button className="w-full rounded-full bg-blue-500 px-8 py-3 font-bold text-lg hover:bg-blue-600">
                    Post
                </Button>

                {/* User Profile */}
                <div className="mt-8">
                    <div className="flex items-center space-x-3 rounded-full p-3 hover:bg-gray-800">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="/avatars/you.jpg" />
                            <AvatarFallback>YO</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-white">Proximity</p>
                            <p className="text-gray-400 text-sm">@Pixelated404</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}