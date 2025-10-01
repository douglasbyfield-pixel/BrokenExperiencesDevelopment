"use client";

import { voteOnExperienceAction, deleteExperienceAction } from "@web/action/experience";
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
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@web/components/auth-provider";
import { Badge } from "@web/components/ui/badge";

// Priority configuration matching the map
const priorityConfig: Record<string, { color: string; label: string; bgColor: string }> = {
	low: {
		color: "#10b981",
		label: "Low Priority",
		bgColor: "bg-emerald-500"
	},
	medium: {
		color: "#f59e0b",
		label: "Medium Priority",
		bgColor: "bg-amber-500"
	},
	high: {
		color: "#ef4444",
		label: "High Priority",
		bgColor: "bg-red-500"
	}
};

// Status configuration matching the map
const statusConfig: Record<string, { color: string; label: string; textColor: string }> = {
	pending: {
		color: "#ef4444",
		label: "Reported",
		textColor: "text-red-600"
	},
	"in-progress": {
		color: "#f59e0b",
		label: "In Progress",
		textColor: "text-amber-600"
	},
	resolved: {
		color: "#10b981",
		label: "Resolved",
		textColor: "text-emerald-600"
	}
};

interface ExperienceCardProps {
	experience: Experience & { userVote?: boolean | null };
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
	const { user } = useAuth();
	const [isLiked, setIsLiked] = useState(experience.userVote === true);
	const [likeCount, setLikeCount] = useState(experience.upvotes || 0);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const [localPriority, setLocalPriority] = useState<string>(experience.priority);
	const [localStatus, setLocalStatus] = useState<string>(experience.status);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		if (showDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showDropdown]);

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

	const { execute: deleteExperience, isExecuting: isDeleting } = useAction(deleteExperienceAction, {
		onSuccess: () => {
			console.log("✅ Experience deleted successfully");
			// Reload the page to show updated feed
			window.location.reload();
		},
		onError: (error) => {
			console.error("❌ Delete failed:", error);
			alert(`Failed to delete: ${error.error?.serverError || 'Unknown error'}`);
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
		setShowDropdown(false);
		if (confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
			deleteExperience({ experienceId: experience.id });
		}
	};

	const handleEdit = () => {
		setShowDropdown(false);
		setIsEditingStatus(true);
	};
	
	const handleUpdateStatus = async (newPriority: string, newStatus: string) => {
		try {
			// TODO: Call backend API to update priority and status
			setLocalPriority(newPriority);
			setLocalStatus(newStatus);
			setIsEditingStatus(false);
			alert('Status updated! (Backend integration pending)');
		} catch (error) {
			console.error('Failed to update status:', error);
			alert('Failed to update status');
		}
	};

	// Get display name - show actual user name from database
	const displayName = experience.reportedBy?.name || experience.reportedBy?.email?.split('@')[0] || "Anonymous";
	const username = experience.reportedBy?.email?.split('@')[0] || "user";
	
	// Check if current user owns this post
	const isOwnPost = user?.id === experience.reportedBy?.id;
	
	console.log("🔍 Post ownership check:", { 
		userId: user?.id, 
		postAuthorId: experience.reportedBy?.id, 
		isOwnPost 
	});

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
					</div>

					{/* Badges Row: Category, Priority, Status */}
					<div className="mb-3">
						{!isEditingStatus ? (
							<div className="flex items-center gap-2 flex-wrap">
								<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
									#{experience.category?.name || "general"}
						</span>

								{/* Shows priority of the experience */}
								{/* Priority Badge
								{localPriority && priorityConfig[localPriority] && (
									<div className="flex items-center gap-1">
										<div 
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: priorityConfig[localPriority].color }}
										/>
										<Badge
											variant={
												localPriority === "high"
													? "destructive"
													: localPriority === "medium"
													? "default"
													: "secondary"
											}
											className="text-xs"
										>
											{localPriority.charAt(0).toUpperCase() + localPriority.slice(1)}
										</Badge>
									</div>
								)}
								 */}
							
								{/* Shows if the experience is reported, in progress, or resolved */}
								{/* Status Badge
								{localStatus && statusConfig[localStatus] && (
									<Badge
										variant="outline"
										className={`text-xs ${statusConfig[localStatus].textColor}`}
									>
										{statusConfig[localStatus].label}
									</Badge>
								)} */}
							</div>
						) : (
							<div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								{/* Edit Priority */}
								<div>
									<p className="text-xs text-gray-600 font-medium mb-2">Priority</p>
									<div className="flex gap-2">
										{['low', 'medium', 'high'].map((priority) => (
											<button
												key={priority}
												type="button"
												onClick={() => setLocalPriority(priority)}
												className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
													localPriority === priority
														? priority === 'high'
															? 'bg-red-500 text-white'
															: priority === 'medium'
															? 'bg-amber-500 text-white'
															: 'bg-emerald-500 text-white'
														: 'bg-white text-gray-700 border border-gray-300'
												}`}
											>
												{priority.charAt(0).toUpperCase() + priority.slice(1)}
											</button>
										))}
									</div>
								</div>
								
								{/* Edit Status */}
								<div>
									<p className="text-xs text-gray-600 font-medium mb-2">Status</p>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => setLocalStatus('pending')}
											className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
												localStatus === 'pending'
													? 'bg-red-500 text-white'
													: 'bg-white text-gray-700 border border-gray-300'
											}`}
										>
											Reported
										</button>
										<button
											type="button"
											onClick={() => setLocalStatus('in-progress')}
											className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
												localStatus === 'in-progress'
													? 'bg-amber-500 text-white'
													: 'bg-white text-gray-700 border border-gray-300'
											}`}
										>
											In Progress
										</button>
										<button
											type="button"
											onClick={() => setLocalStatus('resolved')}
											className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
												localStatus === 'resolved'
													? 'bg-emerald-500 text-white'
													: 'bg-white text-gray-700 border border-gray-300'
											}`}
										>
											Resolved
										</button>
									</div>
								</div>
								
								{/* Save/Cancel Buttons */}
								<div className="flex gap-2 justify-end">
									<button
										type="button"
										onClick={() => {
											setLocalPriority(experience.priority);
											setLocalStatus(experience.status);
											setIsEditingStatus(false);
										}}
										className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={() => handleUpdateStatus(localPriority, localStatus)}
										className="px-3 py-1 text-xs rounded bg-black text-white hover:bg-gray-800"
									>
										Save
									</button>
								</div>
							</div>
						)}
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
