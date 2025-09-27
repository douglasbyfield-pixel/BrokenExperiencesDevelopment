import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RightSidebarProps  {
    className?: string;
}

export default function RightSidebar({ className }: RightSidebarProps) {
    return (
        <div className={cn("w-80 border-gray-800 border-l bg-black p-4", className)}>
            <div className="space-y-6">
                {/* Search */}
                <div>
                    <Input
                        placeholder="Search"
                        className="rounded-full border-gray-700 bg-gray-800 text-white placeholder:text-gray-400"
                    />
                </div>

                {/* Trending */}
                <Card className="border-gray-800 bg-black p-4">
                    <h3 className="font-bold text-lg text-white">What's happening</h3>
                    <div className="mt-4 space-y-3">
                        <div className="space-y-1">
                            <p className="text-gray-400 text-sm">Politics · Trending</p>
                            <p className="font-semibold text-white">Vance</p>
                            <p className="text-gray-400 text-sm">138K posts</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-400 text-sm">Sports · Trending</p>
                            <p className="font-semibold text-white">Cavs</p>
                            <p className="text-gray-400 text-sm">1,308 posts</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-400 text-sm">Trending in Jamaica</p>
                            <p className="font-semibold text-white">gem missy reid tash</p>
                            <p className="text-gray-400 text-sm">67K posts</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-400 text-sm">Politics · Trending</p>
                            <p className="font-semibold text-white">The White House</p>
                            <p className="text-gray-400 text-sm">196K posts</p>
                        </div>
                        <button
                            type="button"
                            className="w-full text-left text-blue-500 hover:underline"
                        >
                            Show more
                        </button>
                    </div>
                </Card>

                {/* Who to follow */}
                <Card className="border-gray-800 bg-black p-4">
                    <h3 className="font-bold text-lg text-white">Who to follow</h3>
                    <div className="mt-4 space-y-3">
                        {[
                            { name: "chronark", username: "@chronark_", verified: false },
                            {
                                name: "colinhacks/zod",
                                username: "@colinhacks",
                                verified: false,
                            },
                            { name: "Anthony Fu", username: "@antfu7", verified: false },
                        ].map((user) => (
                            <div
                                key={user.username}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-gray-400 text-sm">{user.username}</p>
                                    </div>
                                </div>
                                <Button size="sm" className="rounded-full px-4">
                                    Follow
                                </Button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="w-full text-left text-blue-500 hover:underline"
                        >
                            Show more
                        </button>
                    </div>
                </Card>

                {/* Footer Links */}
                <div className="text-gray-500 text-xs">
                    <p>
                        Terms of Service | Privacy Policy | Cookie Policy | Accessibility
                        | Ads info | More ... © 2025 X Corp.
                    </p>
                </div>
            </div>
        </div>
    );
}