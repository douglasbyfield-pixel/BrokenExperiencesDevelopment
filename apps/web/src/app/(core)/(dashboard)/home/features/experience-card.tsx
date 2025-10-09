"use client";

import { voteOnExperienceAction, deleteExperienceAction } from "@web/action/experience";
import type { Experience } from "@web/types";
import { useAction } from "next-safe-action/hooks";
import { useVoteExperience } from "@web/hooks/use-experiences";
import {
	CheckCircle,
	Link,
	MapPin,
	MoreHorizontal,
	Share,
	AlertTriangle,
	Trash2,
	Edit,
	MessageCircle,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipPanel } from "@web/components/animate-ui/components/base/tooltip";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@web/components/auth-provider";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { ImageModal } from "@web/components/ui/image-modal";
import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { useShare } from "@web/hooks/use-share";
import { useRouter } from "next/navigation";
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
import { Dialog } from "@web/components/ui/dialog";

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
	const router = useRouter();
	// Use the actual experience data instead of local state for better sync
	const isLiked = experience.userVote === true;
	const likeCount = experience.upvotes || 0;
	
	// Debug logging for vote state
	console.log('🔍 Experience vote state:', {
		id: experience.id,
		userVote: experience.userVote,
		isLiked,
		upvotes: experience.upvotes,
		likeCount
	});
	const [showDropdown, setShowDropdown] = useState(false);
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const [localPriority, setLocalPriority] = useState<string>(experience.priority);
	const [showShareModal, setShowShareModal] = useState(false);
	
	const { 
		copyToClipboard, 
		shareToWhatsApp, 
		shareToTwitter, 
		shareToFacebook,
		shareViaWebShare 
	} = useShare();
	
	// Image modal state
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [localStatus, setLocalStatus] = useState<string>(experience.status);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
	
	// Debounce state for vote handling
	const [isVoteDebouncing, setIsVoteDebouncing] = useState(false);
	const voteTimeoutRef = useRef<NodeJS.Timeout>();

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

	// Debounced vote handler to prevent rapid clicking
	const handleVote = useCallback(() => {
		// Prevent multiple rapid clicks
		if (isVoteDebouncing || isExecuting) {
			console.log('🚫 Vote debounced - please wait');
			return;
		}

		// Set debouncing state
		setIsVoteDebouncing(true);
		
		// Clear any existing timeout
		if (voteTimeoutRef.current) {
			clearTimeout(voteTimeoutRef.current);
		}

		// Execute vote immediately for good UX (optimistic update)
		console.log('🗳️ Processing endorse vote...');
		voteOnExperience({
			experienceId: experience.id,
			vote: 'up' // Always send 'up' - the hook handles the toggle logic
		});

		// Reset debouncing after 1 second
		voteTimeoutRef.current = setTimeout(() => {
			setIsVoteDebouncing(false);
			console.log('✅ Vote debouncing reset');
		}, 1000);
	}, [voteOnExperience, experience.id, isLiked, isVoteDebouncing, isExecuting]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (voteTimeoutRef.current) {
				clearTimeout(voteTimeoutRef.current);
			}
		};
	}, []);

	const handleImageClick = (e: React.MouseEvent, index: number) => {
		e.stopPropagation();
		setCurrentImageIndex(index);
		setIsImageModalOpen(true);
	};

	const handleDelete = async () => {
		setShowDropdown(false);
		setShowDeleteDialog(false);
		deleteExperience({ experienceId: experience.id });
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

	const handleShare = async () => {
		setShowShareModal(true);
	};

	const handleCopyLink = async () => {
		try {
			// Generate shareable URL directly
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${experience.id}`;
			
			const success = await copyToClipboard(shareUrl);
			if (success) {
				alert('Share link copied to clipboard!');
			} else {
				alert('Failed to copy to clipboard');
			}
		} catch (error) {
			console.error('Failed to copy link:', error);
			alert('Failed to copy link');
		}
	};

	const handleWhatsAppShare = async () => {
		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${experience.id}`;
			const shareText = `Check out this experience: ${experience.title}`;
			shareToWhatsApp(shareText, shareUrl);
		} catch (error) {
			console.error('Failed to share to WhatsApp:', error);
			alert('Failed to share to WhatsApp');
		}
	};

	const handleTwitterShare = async () => {
		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${experience.id}`;
			const shareText = `Check out this experience: ${experience.title}`;
			shareToTwitter(shareText, shareUrl);
		} catch (error) {
			console.error('Failed to share to Twitter:', error);
			alert('Failed to share to Twitter');
		}
	};

	const handleFacebookShare = async () => {
		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${experience.id}`;
			shareToFacebook(shareUrl);
		} catch (error) {
			console.error('Failed to share to Facebook:', error);
			alert('Failed to share to Facebook');
		}
	};

	const handleNativeShare = async () => {
		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${experience.id}`;
			const success = await shareViaWebShare(
				experience.title,
				`Check out this experience: ${experience.title}`,
				shareUrl
			);
			if (!success) {
				// Fallback to copy link if native share fails
				await handleCopyLink();
			}
		} catch (error) {
			console.error('Failed to share natively:', error);
			alert('Failed to share');
		}
	};

	const handleCardClick = () => {
		router.push(`/shared/experience/${experience.id}`);
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
		<>
		<article className="bg-white border-b border-gray-100 px-4 py-4">
			<div className="flex gap-3">
				{/* Avatar */}
				<Avatar className="h-9 w-9 flex-shrink-0">
					<AvatarImage 
						src={experience.reportedBy?.image || undefined} 
						alt={`${displayName}'s avatar`} 
					/>
					<AvatarFallback className="bg-gray-200 text-gray-600 font-medium text-xs sm:text-sm">
						{displayName?.charAt(0)?.toUpperCase() || "U"}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					{/* Header: Minimal user info */}
					<div className="flex items-center justify-between gap-2 mb-3">
						<div className="flex items-center gap-2 min-w-0">
							<span className="font-medium text-gray-900 text-sm">
								{displayName}
							</span>
							{/* Subtle status indicator */}
							{likeCount >= 5 && (
								<span className="text-xs text-blue-600">📢</span>
							)}
							<span className="text-gray-400 text-xs">
								{formatRelativeTime(experience.createdAt)}
							</span>
						</div>
						<span className="text-xs text-gray-500">
							#{experience.category?.name || "general"}
						</span>
					</div>

					{/* Title - with proper truncation to prevent clashing */}
					<h3 className="font-semibold text-gray-900 text-xl leading-tight mb-2 pr-16 truncate">
						{experience.title}
					</h3>

					{/* Status editing section - only show when editing */}
					{isEditingStatus && (
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

					{/* Content */}
					<div className="mb-3">
						<p className="text-gray-900 text-base sm:text-lg whitespace-pre-wrap leading-relaxed break-words">
							{experience.description}
						</p>
						{/* Subtle hot topic indicator */}
						{likeCount >= 8 && (
							<div className="mt-1">
								<span className="text-xs text-orange-500 font-medium">🔥 Trending</span>
							</div>
						)}
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
						
						// Filter out placeholder images and broken links - only show real uploaded images
						const realImages = experience.experienceImages?.filter(
							(img: any) => img.imageUrl && 
								img.imageUrl.trim() !== '' && 
								!img.imageUrl.includes('placeholder') &&
								!img.imageUrl.includes('null') &&
								!img.imageUrl.includes('undefined') &&
								img.imageUrl.startsWith('http')
						) || [];
						
						console.log('🖼️ Real images (filtered):', realImages);
						
						if (realImages.length === 0) return null;
						
						return (
							<div className="mb-3">
								<div className="w-full">
								{realImages.length === 1 ? (
									/* Single image - simple */
									<div className="w-full bg-gray-50 rounded-lg overflow-hidden">
										<img 
											src={realImages[0].imageUrl}
											alt="Experience"
											className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
											style={{ objectPosition: 'center 20%' }}
											loading="lazy"
											onClick={(e) => handleImageClick(e, 0)}
										/>
									</div>
								) : realImages.length === 2 ? (
									/* Two images - side by side */
									<div className="grid grid-cols-2 gap-1 w-full">
										{realImages.map((img: any, idx: number) => (
											<div key={idx} className="bg-gray-50 rounded-lg overflow-hidden aspect-square">
												<img 
													src={img.imageUrl}
													alt={`Experience ${idx + 1}`}
													className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
													style={{ objectPosition: 'center 25%' }}
													loading="lazy"
													onClick={(e) => handleImageClick(e, idx)}
												/>
											</div>
										))}
									</div>
								) : realImages.length === 3 ? (
									/* Three images - simple grid */
									<div className="grid grid-cols-2 gap-1 w-full">
										<div className="bg-gray-50 rounded-lg overflow-hidden aspect-square">
											<img 
												src={realImages[0].imageUrl}
												alt="Experience 1"
												className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
												style={{ objectPosition: 'center 20%' }}
												loading="lazy"
												onClick={(e) => handleImageClick(e, 0)}
											/>
										</div>
										<div className="bg-gray-50 rounded-lg overflow-hidden aspect-square">
											<img 
												src={realImages[1].imageUrl}
												alt="Experience 2"
												className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
												style={{ objectPosition: 'center 25%' }}
												loading="lazy"
												onClick={(e) => handleImageClick(e, 1)}
											/>
										</div>
										<div className="bg-gray-50 rounded-lg overflow-hidden aspect-square col-span-2">
											<img 
												src={realImages[2].imageUrl}
												alt="Experience 3"
												className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
												style={{ objectPosition: 'center 25%' }}
												loading="lazy"
												onClick={(e) => handleImageClick(e, 2)}
											/>
										</div>
									</div>
								) : (
									/* Four or more images - simple grid */
									<div className="grid grid-cols-2 gap-1 w-full">
										{realImages.slice(0, 4).map((img: any, idx: number) => (
											<div key={idx} className="relative group bg-gray-50 rounded-lg overflow-hidden aspect-square">
												<img 
													src={img.imageUrl}
													alt={`Experience ${idx + 1}`}
													className="w-full h-full object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
													style={{ objectPosition: 'center 25%' }}
													loading="lazy"
													onClick={(e) => handleImageClick(e, idx)}
												/>
												{idx === 3 && realImages.length > 4 && (
													<div 
														className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center cursor-pointer group-hover:bg-opacity-75 transition-all"
														onClick={(e) => handleImageClick(e, 3)}
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
							</div>
						);
					})()}

					{/* Location */}
					{experience.address && experience.address.trim() && (
						<div className="flex items-center gap-2 text-gray-500 mb-3">
							<MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
							<span className="text-sm font-medium truncate">{experience.address}</span>
						</div>
					)}

					{/* Action Buttons - Separate Row */}
					<div className="flex items-center justify-between">
						<div></div> {/* Spacer */}
						<div className="flex items-center gap-4">
								{/* Endorse Button with Tooltip */}
								<Tooltip delay={300}>
									<TooltipTrigger
										onClick={(e) => {
											e.stopPropagation();
											handleVote();
										}}
										disabled={isExecuting || isVoteDebouncing}
										className={`action-button flex items-center gap-1.5 ${
											isLiked 
												? 'text-green-600' 
												: 'text-gray-600 hover:text-green-600'
										} ${(isExecuting || isVoteDebouncing) ? 'opacity-70 cursor-not-allowed' : ''}`}
									>
										<CheckCircle className={`h-5 w-5 transition-all duration-200 ${isLiked ? 'text-green-600' : 'text-gray-600'}`} />
										{likeCount > 0 && (
											<span className="text-sm font-medium">
												{likeCount}
											</span>
										)}
									</TooltipTrigger>
									<TooltipPanel className="bg-black text-white text-xs rounded-md px-3 py-2 shadow-xl border border-gray-700 animate-tooltip-bounce">
										{isVoteDebouncing ? 'Processing...' :
										isExecuting ? 'Saving...' :
										isLiked ? 'Endorsed ✓' :
										'Endorse'}
									</TooltipPanel>
								</Tooltip>
								
								{/* Share Button */}
								<Popover>
									<PopoverTrigger 
										className="action-button group flex items-center"
										onClick={(e) => e.stopPropagation()}
									>
										<Share className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors duration-200" />
									</PopoverTrigger>
							<PopoverPortal>
								<PopoverPositioner>
									<PopoverPopup 
										className="w-56 p-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700"
										transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.15 }}
									>
										<div className="flex flex-col gap-1">
											{/* Native share (mobile) */}
											{typeof navigator !== 'undefined' && 'share' in navigator && (
												<button
													onClick={handleNativeShare}
													className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
												>
													<Share className="h-4 w-4 text-gray-500 dark:text-gray-400" />
													<span className="text-sm">Share</span>
												</button>
											)}
											
											{/* Copy link */}
											<button
												onClick={handleCopyLink}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<Link className="h-4 w-4 text-gray-500 dark:text-gray-400" />
												<span className="text-sm">Copy link</span>
											</button>
											
											{/* WhatsApp */}
											<button
												onClick={handleWhatsAppShare}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
												<span className="text-sm">WhatsApp</span>
											</button>
											
											{/* Twitter */}
											<button
												onClick={handleTwitterShare}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
													<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
												</svg>
												<span className="text-sm">Twitter</span>
											</button>
											
											{/* Facebook */}
											<button
												onClick={handleFacebookShare}
												className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-gray-700 dark:text-gray-200"
											>
												<svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
													<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
												</svg>
												<span className="text-sm">Facebook</span>
											</button>
										</div>
									</PopoverPopup>
								</PopoverPositioner>
							</PopoverPortal>
						</Popover>
								
								{/* Report to Authority Button with Tooltip */}
								{likeCount >= 5 && (
									<Tooltip delay={300}>
										<TooltipTrigger
											onClick={(e) => {
												e.stopPropagation();
												alert('Report to MP/Authority feature - Coming soon!');
											}}
											className="action-button flex items-center gap-1 text-gray-600 hover:text-red-600"
										>
											<AlertTriangle className="h-5 w-5 transition-all duration-200" />
										</TooltipTrigger>
										<TooltipPanel className="bg-red-600 text-white text-xs rounded-md px-3 py-2 shadow-xl border border-red-500 animate-tooltip-bounce">
											Report
										</TooltipPanel>
									</Tooltip>
								)}
						</div>
					</div>


					{/* More Options */}
					<div className="flex justify-end">
						{isOwnPost && (
							<Popover>
								<PopoverTrigger 
									className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreHorizontal className="h-4 w-4" />
								</PopoverTrigger>
								<PopoverPortal>
									<PopoverPositioner>
										<PopoverPopup className="w-48 p-1 bg-white border border-gray-200 rounded-lg shadow-lg">
											<div className="flex flex-col gap-1">
												<button
													onClick={() => setIsEditingStatus(true)}
													className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 w-full text-left text-gray-700"
												>
													<Edit className="h-4 w-4 text-gray-500" />
													<span className="text-sm">Edit Status</span>
												</button>
												<button
													onClick={() => setShowDeleteDialog(true)}
													disabled={isDeleting}
													className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 w-full text-left text-red-600"
												>
													<Trash2 className="h-4 w-4" />
													<span className="text-sm">{isDeleting ? 'Deleting...' : 'Delete'}</span>
												</button>
											</div>
										</PopoverPopup>
									</PopoverPositioner>
								</PopoverPortal>
							</Popover>
						)}
					</div>
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
		
		{/* Delete Confirmation Dialog */}
		<Dialog 
			open={showDeleteDialog} 
			onOpenChange={setShowDeleteDialog}
			title="Delete Experience"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-2 text-red-600 mb-2">
					<AlertTriangle className="h-5 w-5" />
					<span className="font-semibold">Are you sure?</span>
				</div>
				<p className="text-gray-600 text-sm">
					This action cannot be undone and will permanently remove the experience report.
				</p>
				<div className="flex gap-2 justify-end pt-4">
					<Button
						variant="outline"
						onClick={() => setShowDeleteDialog(false)}
						className="border-gray-300 text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Button>
					<Button
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700 text-white px-6"
					>
						{isDeleting ? 'Deleting...' : 'Delete Experience'}
					</Button>
				</div>
			</div>
		</Dialog>
		</>
	);
}
