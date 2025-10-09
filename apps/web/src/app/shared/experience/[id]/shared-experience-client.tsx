"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { ImageModal } from "@web/components/ui/image-modal";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SharedExperienceClientProps {
	experience: any;
	displayName: string;
	formatRelativeTime: (date: string) => string;
}

export default function SharedExperienceClient({
	experience,
	displayName,
	formatRelativeTime,
}: SharedExperienceClientProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
		null,
	);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);

	// Filter out broken images and placeholders
	const validImages =
		experience.experienceImages?.filter(
			(img: any) =>
				img.imageUrl &&
				img.imageUrl.trim() !== "" &&
				!img.imageUrl.includes("placeholder") &&
				!img.imageUrl.includes("null") &&
				!img.imageUrl.includes("undefined") &&
				img.imageUrl.startsWith("http"),
		) || [];

	const handleImageClick = (index: number) => {
		setSelectedImageIndex(index);
		setIsImageModalOpen(true);
	};

	const handleCloseImageModal = () => {
		setIsImageModalOpen(false);
		setSelectedImageIndex(null);
	};

	const handleImageIndexChange = (index: number) => {
		setSelectedImageIndex(index);
	};

	return (
		<>
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<div className="border-gray-200 border-b bg-white">
					<div className="mx-auto max-w-2xl px-4 py-6">
						<div className="mb-4 flex items-center gap-3">
							<Link
								href="/"
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
									<span className="font-bold text-sm text-white">BE</span>
								</div>
								<span className="font-semibold">Broken Experiences</span>
							</Link>
						</div>
						<h1 className="font-bold text-2xl text-gray-900">
							Shared Experience
						</h1>
						<p className="mt-1 text-gray-600">
							View this experience shared from Broken Experiences
						</p>
					</div>
				</div>

				{/* Experience Content */}
				<div className="mx-auto max-w-2xl px-4 py-8">
					<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
						{/* Header */}
						<div className="border-gray-200 border-b p-6">
							<div className="flex items-start gap-4">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={experience.reportedBy?.image || undefined}
										alt={`${displayName}'s avatar`}
									/>
									<AvatarFallback className="bg-gray-200 font-medium text-gray-600">
										{displayName?.charAt(0)?.toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>

								<div className="min-w-0 flex-1">
									<div className="mb-2 flex items-center gap-1">
										<span className="cursor-pointer font-semibold text-gray-900 transition-colors hover:text-gray-600">
											{displayName}
										</span>
										<span className="text-gray-500 text-sm">
											@{experience.reportedBy?.email?.split("@")[0] || "user"}
										</span>
										<span className="text-gray-400">·</span>
										<span className="cursor-pointer text-gray-500 text-sm transition-colors hover:text-gray-700">
											{formatRelativeTime(experience.createdAt.toString())}
										</span>
									</div>

									<div className="mb-4 flex items-center gap-2">
										<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
											#{experience.category?.name || "general"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="p-6">
							<p className="mb-6 whitespace-pre-wrap text-base text-gray-900 leading-relaxed">
								{experience.description}
							</p>

							{/* Images */}
							{validImages.length > 0 && (
								<div className="mb-6">
									{validImages.length === 1 ? (
										<div className="overflow-hidden rounded-lg border border-gray-200">
											<img
												src={validImages[0].imageUrl}
												alt="Experience"
												className="h-auto max-h-96 w-full cursor-pointer object-cover transition-opacity hover:opacity-95"
												style={{ objectPosition: "center 20%" }}
												onClick={() => handleImageClick(0)}
											/>
										</div>
									) : (
										<div className="grid grid-cols-2 gap-2 overflow-hidden rounded-lg">
											{validImages.slice(0, 4).map((img: any, idx: number) => (
												<div key={img.id} className="relative">
													<img
														src={img.imageUrl}
														alt={`Experience ${idx + 1}`}
														className="h-48 w-full cursor-pointer object-cover transition-opacity hover:opacity-95"
														style={{ objectPosition: "center 25%" }}
														onClick={() => handleImageClick(idx)}
													/>
													{idx === 3 && validImages.length > 4 && (
														<div
															className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 transition-all hover:bg-opacity-60"
															onClick={() => handleImageClick(3)}
														>
															<span className="font-semibold text-white">
																+{validImages.length - 4} more
															</span>
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Location */}
							{experience.address && (
								<div className="mb-6 flex items-center gap-2 text-gray-600">
									<MapPin className="h-4 w-4 flex-shrink-0" />
									<span className="text-sm">{experience.address}</span>
								</div>
							)}

							{/* Stats - NO UPVOTES, only reported date */}
							<div className="flex items-center gap-6 text-gray-500 text-sm">
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									<span>
										Reported{" "}
										{new Date(experience.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="border-gray-200 border-t bg-gray-50 px-6 py-4">
							<div className="flex items-center justify-between">
								<p className="text-gray-600 text-sm">
									This experience was shared from Broken Experiences
								</p>
								<Link href="/">
									<Button variant="outline" size="sm">
										View More Experiences
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Image Modal */}
			{validImages.length > 0 && (
				<ImageModal
					images={validImages.map((img: any) => img.imageUrl)}
					currentIndex={selectedImageIndex || 0}
					isOpen={isImageModalOpen}
					onClose={handleCloseImageModal}
					onIndexChange={handleImageIndexChange}
				/>
			)}
		</>
	);
}
