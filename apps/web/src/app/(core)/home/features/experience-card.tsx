import {
	Heart,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Share,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Post } from "@/types";

interface ExperienceCardProps {
	post: Post;
}

export default function ExperienceCard({ post }: ExperienceCardProps) {
	return (
		<Card
			key={post.id}
			className="border-gray-800 bg-black p-6 transition-colors hover:bg-gray-900/50"
		>
			<div className="flex space-x-3">
				<Avatar className="h-10 w-10">
					<AvatarImage src={post.user.avatar} />
					<AvatarFallback>
						{post.user.name
							.split(" ")
							.map((n) => n[0])
							.join("")}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					{/* User Info */}
					<div className="mb-2 flex items-center space-x-2">
						<h3 className="font-semibold text-white">{post.user.name}</h3>
						{post.user.verified && (
							<Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
								✓
							</Badge>
						)}
						<span className="text-gray-500 text-sm">{post.user.username}</span>
						<span className="text-gray-400">·</span>
						<span className="text-gray-500 text-sm">{post.timestamp}</span>
						<Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</div>

					{/* Location */}
					<div className="mb-3 flex items-center text-gray-500 text-sm">
						<MapPin className="mr-1 h-3 w-3" />
						<span>{post.location}</span>
					</div>

					{/* Content */}
					<p className="mb-4 text-white leading-relaxed">{post.content}</p>

					{/* Actions */}
					<div className="flex max-w-md items-center justify-between">
						<Button
							variant="ghost"
							size="sm"
							className="text-gray-500 hover:bg-blue-50 hover:text-blue-500"
						>
							<MessageCircle className="mr-2 h-4 w-4" />
							<span className="text-sm">{post.comments}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="text-gray-500 hover:bg-green-50 hover:text-green-500"
						>
							<Share className="mr-2 h-4 w-4" />
							<span className="text-sm">{post.shares}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={`${
								post.isLiked
									? "text-red-500"
									: "text-gray-500 hover:text-red-500"
							} hover:bg-red-50`}
						>
							<Heart
								className={`mr-2 h-4 w-4 ${post.isLiked ? "fill-current" : ""}`}
							/>
							<span className="text-sm">{post.likes}</span>
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
