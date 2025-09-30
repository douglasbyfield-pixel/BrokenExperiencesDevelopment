"use client";

import { voteOnExperienceAction } from "@web/action/experience";
import type { Experience } from "@web/types";
import { useAction } from "next-safe-action/hooks";
import {
	Heart,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Share,
} from "lucide-react";

interface ExperienceCardProps {
	experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
	const { execute: voteOnExperience } = useAction(voteOnExperienceAction, {
		onSuccess: () => {
			// Reload to show updated vote count
			window.location.reload();
		},
		onError: (error) => {
			console.error("Vote failed:", error);
		}
	});

	const handleVote = (vote: boolean) => {
		voteOnExperience({
			experienceId: experience.id,
			vote: vote
		});
	};

	return (
		<article className="border-b border-gray-200 px-3 lg:px-4 py-3 transition-colors hover:bg-gray-50">
			<div className="flex space-x-3">
				<div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gray-200 flex-shrink-0" />

				<div className="min-w-0 flex-1">
					{/* User Info */}
					<div className="flex items-center space-x-1">
						<span className="font-semibold text-black hover:underline">
							{experience.reportedBy?.name || "Anonymous"}
						</span>
						{experience.reportedBy?.emailVerified && (
							<svg viewBox="0 0 22 22" className="h-5 w-5 text-blue-400">
								<path
									fill="currentColor"
									d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
								/>
							</svg>
						)}
						<span className="text-gray-600">@{experience.reportedBy?.email?.split('@')[0] || "user"}</span>
						<span className="text-gray-600">·</span>
						<span className="text-gray-600 hover:underline">
							{new Date(experience.createdAt).toLocaleDateString()}
						</span>
						<button className="ml-auto p-2 rounded-full hover:bg-gray-100">
							<MoreHorizontal className="h-4 w-4 text-gray-600" />
						</button>
					</div>

					{/* Content */}
					<div className="mt-2 lg:mt-3">
						<h3 className="font-semibold text-black text-base lg:text-lg mb-1">{experience.title}</h3>
						<p className="text-black whitespace-pre-wrap text-sm lg:text-base">
							{experience.description}
						</p>
					</div>

					{/* Location & Category */}
					<div className="mt-2 lg:mt-3 flex items-center space-x-3 lg:space-x-4 text-xs lg:text-sm text-gray-600">
						<div className="flex items-center space-x-1">
							<MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
							<span className="truncate">{experience.address}</span>
						</div>
						<div>
							<span className="text-gray-800">#{experience.category?.name || "general"}</span>
						</div>
					</div>

					{/* Actions */}
					<div className="mt-2 lg:mt-3 flex items-center justify-between">
						<button className="group flex items-center space-x-1 lg:space-x-2 p-1 lg:p-2 rounded-full hover:bg-gray-100">
							<MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 group-hover:text-blue-500" />
							<span className="text-xs lg:text-sm text-gray-500 group-hover:text-blue-500">0</span>
						</button>

						<button className="group flex items-center space-x-1 lg:space-x-2 p-1 lg:p-2 rounded-full hover:bg-gray-100">
							<Share className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 group-hover:text-green-500" />
							<span className="text-xs lg:text-sm text-gray-500 group-hover:text-green-500">0</span>
						</button>

						<button 
							className="group flex items-center space-x-1 lg:space-x-2 p-1 lg:p-2 rounded-full hover:bg-gray-100"
							onClick={() => handleVote(true)}
						>
							<Heart
								className={`h-4 w-4 lg:h-5 lg:w-5 ${experience.upvotes > 0 ? "text-red-500 fill-current" : "text-gray-500 group-hover:text-red-500"}`}
							/>
							<span className={`text-xs lg:text-sm ${experience.upvotes > 0 ? "text-red-500" : "text-gray-500 group-hover:text-red-500"}`}>
								{experience.upvotes || 0}
							</span>
						</button>
					</div>
				</div>
			</div>
		</article>
	);
}
