"use client";

import { voteOnExperienceAction, deleteExperienceAction } from "@web/action/experience";
import type { Experience } from "@web/types";
import { useAction } from "next-safe-action/hooks";
import { useVoteExperience } from "@web/hooks/use-experiences";
import {
	Heart,
	Link,
	MapPin,
	MoreHorizontal,
	Share,
	AlertTriangle,
	Trash2,
	Edit,
	MessageCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@web/components/auth-provider";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { ImageModal } from "@web/components/ui/image-modal";
import {
	Popover,
	PopoverTrigger,
	PopoverPortal,
	PopoverPositioner,
	PopoverPopup,
	PopoverTitle,
	PopoverDescription,
	PopoverClose,
} from "@web/components/animate-ui/primitives/base/popover";

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
	
	// Image modal state
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

	// Use TanStack Query for optimistic voting
	const { mutate: voteOnExperience, isPending: isExecuting } = useVoteExperience();

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
		// TanStack Query handles optimistic updates automatically
		voteOnExperience({
			experienceId: experience.id,
			vote: isLiked ? 'down' : 'up' // Toggle between up and down
		});
	};

	const handleImageClick = (index: number) => {
		setCurrentImageIndex(index);
		setIsImageModalOpen(true);
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

	const handleCopyLink = async () => {
		try {
			const locationText = experience.address && experience.address.trim() ? `\n📍 ${experience.address}` : '';
			const shareText = `Broken Experience: ${experience.title}\n${experience.description}${locationText}`;
			await navigator.clipboard.writeText(shareText);
			alert('Experience details copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			alert('Failed to copy to clipboard');
		}
	};

	const handleWhatsAppShare = () => {
		const locationText = experience.address && experience.address.trim() ? `\n\n📍 ${experience.address}` : '';
		const shareText = `Broken Experience: ${experience.title}\n\n${experience.description}${locationText}`;
		
		// Check if we're on mobile
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		
		if (isMobile) {
			// Use the WhatsApp app directly on mobile
			const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
			window.location.href = whatsappUrl;
		} else {
			// Use WhatsApp Web on desktop
			const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
			window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const formatRelativeTime = (dateString: string | Date) => {
		const now = new Date();
		const postDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
		const diffInMs = now.getTime() - postDate.getTime();
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		// Check if it's the same day
		const isSameDay = now.toDateString() === postDate.toDateString();
		
		// Check if it's yesterday
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		const isYesterday = postDate.toDateString() === yesterday.toDateString();

		if (isSameDay) {
			if (diffInMinutes < 1) {
				return 'Just now';
			} else if (diffInMinutes < 60) {
				return `${diffInMinutes}m ago`;
			} else {
				return `${diffInHours}h ago`;
			}
		} else if (isYesterday) {
			return 'Yesterday';
		} else {
			// Format as "Sep 9" style
			return postDate.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric' 
			});
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
								{formatRelativeTime(experience.createdAt)}
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

					{/* Images */}
					{(() => {
						// Log ALL image data first
						console.log('🖼️ Experience images RAW:', experience.experienceImages);
						if (experience.experienceImages && experience.experienceImages.length > 0) {
							experience.experienceImages.forEach((img: any, idx: number) => {
								console.log(`Image ${idx}:`, {
									url: img.imageUrl,
									hasUrl: !!img.imageUrl,
									isPlaceholder: img.imageUrl?.includes('placeholder'),
									fullObject: img
								});
							});
						}
						
						// Filter out placeholder images - only show real uploaded images
						const realImages = experience.experienceImages?.filter(
							(img: any) => img.imageUrl && img.imageUrl.trim() !== '' && !img.imageUrl.includes('placeholder')
						) || [];
						
						console.log('🖼️ Real images (filtered):', realImages);
						
						if (realImages.length === 0) return null;
						
						return (
							<div className={`mb-3 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
								realImages.length === 1 ? 'max-w-lg' : ''
							}`}>
								{realImages.length === 1 ? (
									/* Single image - full width */
									<img 
										src={realImages[0].imageUrl}
										alt="Experience"
										className="w-full h-auto max-h-[28rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
										loading="lazy"
										onClick={() => handleImageClick(0)}
									/>
								) : realImages.length === 2 ? (
									/* Two images - side by side */
									<div className="grid grid-cols-2 gap-1">
										{realImages.map((img: any, idx: number) => (
											<img 
												key={idx}
												src={img.imageUrl}
												alt={`Experience ${idx + 1}`}
												className="w-full h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity"
												loading="lazy"
												onClick={() => handleImageClick(idx)}
											/>
										))}
									</div>
								) : realImages.length === 3 ? (
									/* Three images - one large, two small */
									<div className="grid grid-cols-2 gap-1">
										<img 
											src={realImages[0].imageUrl}
											alt="Experience 1"
											className="w-full h-full min-h-[28rem] object-cover row-span-2 cursor-pointer hover:opacity-95 transition-opacity"
											loading="lazy"
											onClick={() => handleImageClick(0)}
										/>
										<div className="flex flex-col gap-1">
											<img 
												src={realImages[1].imageUrl}
												alt="Experience 2"
												className="w-full h-[13.875rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
												loading="lazy"
												onClick={() => handleImageClick(1)}
											/>
											<img 
												src={realImages[2].imageUrl}
												alt="Experience 3"
												className="w-full h-[13.875rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
												loading="lazy"
												onClick={() => handleImageClick(2)}
											/>
										</div>
									</div>
								) : (
									/* Four or more images - grid of 4 */
									<div className="grid grid-cols-2 gap-1">
										{realImages.slice(0, 4).map((img: any, idx: number) => (
											<div key={idx} className="relative group">
												<img 
													src={img.imageUrl}
													alt={`Experience ${idx + 1}`}
													className="w-full h-56 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
													loading="lazy"
													onClick={() => handleImageClick(idx)}
												/>
												{idx === 3 && realImages.length > 4 && (
													<div 
														className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center cursor-pointer group-hover:bg-opacity-75 transition-all"
														onClick={() => handleImageClick(3)}
													>
														<span className="text-white text-3xl font-bold drop-shadow-lg">
															+{realImages.length - 4}
														</span>
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						);
					})()}

					{/* Location */}
					{experience.address && experience.address.trim() && (
						<div className="flex items-center justify-between text-gray-600 mb-3">
							<div className="flex items-center gap-1.5">
								<MapPin className="h-4 w-4 flex-shrink-0" />
								<span className="text-sm">{experience.address}</span>
							</div>
						<Popover>
							<PopoverTrigger className="group flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all">
								<Share className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
							</PopoverTrigger>
							<PopoverPortal>
								<PopoverPositioner>
									<PopoverPopup 
										className="w-48 p-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700"
										transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.15 }}
									>
										<div className="flex flex-col gap-1">
											<button
												onClick={handleCopyLink}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<Link className="h-4 w-4 text-gray-500 dark:text-gray-400" />
												<span className="text-sm">Copy link</span>
											</button>
											<button
												onClick={handleWhatsAppShare}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
												<span className="text-sm">Share on WhatsApp</span>
											</button>
										</div>
									</PopoverPopup>
								</PopoverPositioner>
							</PopoverPortal>
						</Popover>
						</div>
					)}
				</div>
			</div>
		</article>
		
		{/* Image Modal */}
		{(() => {
			const realImages = experience.experienceImages?.filter(
				(img: any) => img.imageUrl && img.imageUrl.trim() !== '' && !img.imageUrl.includes('placeholder')
			) || [];
			
			if (realImages.length === 0) return null;
			
			return (
				<ImageModal
					images={realImages.map((img: any) => img.imageUrl)}
					currentIndex={currentImageIndex}
					isOpen={isImageModalOpen}
					onClose={() => setIsImageModalOpen(false)}
					onIndexChange={setCurrentImageIndex}
				/>
			);
		})()}
	);
}
