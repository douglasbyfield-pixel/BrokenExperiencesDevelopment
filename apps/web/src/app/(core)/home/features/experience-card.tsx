"use client";

import { voteOnExperienceAction } from "@web/action/experience";
import type { Experience } from "@web/types";
import { useAction } from "next-safe-action/hooks";
import {
	Heart,
	MapPin,
	MoreHorizontal,
	Share,
	AlertTriangle,
	Trash2,
	Edit,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@web/components/auth-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";

interface ExperienceCardProps {
	experience: Experience & { userVote?: boolean | null };
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
	const { user } = useAuth();
	const [isLiked, setIsLiked] = useState(experience.userVote === true);
	const [likeCount, setLikeCount] = useState(experience.upvotes || 0);

	const { execute: voteOnExperience, isExecuting } = useAction(voteOnExperienceAction, {
		onSuccess: (result) => {
			console.log("Vote successful:", result);
			// No need to reload - optimistic update already done
		},
		onError: (error) => {
			console.error("Vote failed:", error);
			// Revert optimistic update on error
			setIsLiked(!isLiked);
			setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
		}
	});

	const handleVote = () => {
		// Optimistic update
		const newLikedState = !isLiked;
		setIsLiked(newLikedState);
		setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);

		// Send vote to backend
		voteOnExperience({
			experienceId: experience.id,
			vote: true // We only support upvotes/likes
		});
	};

	const handleDelete = async () => {
		if (confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
			try {
				// TODO: Implement delete functionality
				alert('Delete functionality will be implemented');
			} catch (error) {
				console.error('Delete failed:', error);
			}
		}
	};

	const handleEdit = () => {
		// TODO: Implement edit functionality
		alert('Edit functionality will be implemented');
	};

	// Get display name - show actual user name from database
	const displayName = experience.reportedBy?.name || experience.reportedBy?.email?.split('@')[0] || "Anonymous";
	const username = experience.reportedBy?.email?.split('@')[0] || "user";
	
	// Check if current user owns this post
	const isOwnPost = user?.id === experience.reportedBy?.id;

	return (
		<article className="border-b border-gray-200 px-4 py-4 transition-colors hover:bg-gray-50">
			<div className="flex gap-3">
				{/* Avatar */}
				<div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex-shrink-0 flex items-center justify-center shadow-sm">
					<AlertTriangle className="h-6 w-6 text-white" />
				</div>

				<div className="flex-1 min-w-0">
					{/* Header: User info and category badge */}
					<div className="flex items-start justify-between gap-2 mb-2">
						<div className="flex items-center gap-2 flex-wrap">
							<div className="flex items-center gap-1">
								<span className="font-bold text-gray-900 hover:underline cursor-pointer">
									{displayName}
								</span>
								<span className="text-gray-500 text-sm">@{username}</span>
							</div>
							<span className="text-gray-400">·</span>
							<span className="text-gray-500 text-sm hover:underline cursor-pointer">
								{new Date(experience.createdAt).toLocaleDateString()}
							</span>
						</div>
						
						{isOwnPost ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
										<MoreHorizontal className="h-4 w-4 text-gray-600" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem 
										onClick={handleDelete} 
										className="cursor-pointer text-red-600 focus:text-red-600"
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
								<MoreHorizontal className="h-4 w-4 text-gray-600" />
							</button>
						)}
					</div>

					{/* Category Badge */}
					<div className="mb-3">
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
							#{experience.category?.name || "general"}
						</span>
					</div>

					{/* Content */}
					<div className="mb-3">
						<h3 className="font-bold text-gray-900 text-lg mb-1.5 leading-tight">
							{experience.title}
						</h3>
						<p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed">
							{experience.description}
						</p>
					</div>

					{/* Location */}
					<div className="flex items-center gap-1.5 text-gray-600 mb-3">
						<MapPin className="h-4 w-4 flex-shrink-0" />
						<span className="text-sm">{experience.address}</span>
					</div>

					{/* Actions Bar */}
					<div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
						<button 
							className="group flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
							onClick={() => {
								// Share functionality
								const shareText = `Broken Experience: ${experience.title}\n${experience.description}\n${experience.address}`;
								if (navigator.share) {
									navigator.share({
										title: `Broken Experience: ${experience.title}`,
										text: shareText,
										url: window.location.href
									}).catch(console.error);
								} else {
									navigator.clipboard.writeText(shareText);
									alert('Experience details copied to clipboard!');
								}
							}}
						>
							<Share className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
							<span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
								Share
							</span>
						</button>

						<button 
							className="group flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleVote}
							disabled={isExecuting}
						>
							<Heart
								className={`h-4 w-4 transition-colors ${
									isLiked 
										? "text-red-500 fill-red-500" 
										: "text-gray-500 group-hover:text-red-500"
								}`}
							/>
							<span className={`text-sm font-bold transition-colors ${
								isLiked 
									? "text-red-500" 
									: "text-gray-600 group-hover:text-red-500"
							}`}>
								{likeCount}
							</span>
						</button>
					</div>
				</div>
			</div>
		</article>
	);
}
