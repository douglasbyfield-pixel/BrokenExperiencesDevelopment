"use client";

import { useForm } from "@tanstack/react-form";
import { createExperienceAction } from "@web/action/experience";
import {
	Tooltip,
	TooltipPanel,
	TooltipTrigger,
} from "@web/components/animate-ui/components/base/tooltip";
import { AnimatedReportText } from "@web/components/ui/animated-report-text";
import { Button } from "@web/components/ui/button";
import { CameraCapture } from "@web/components/ui/camera-capture";
import { ImageModal } from "@web/components/ui/image-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web/components/ui/select";
import { useCreateExperience } from "@web/hooks/use-experiences";
import type { Category } from "@web/types";
import { Camera, MapPin, Image as Picture, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useNotifications } from "@web/components/notifications";
import z from "zod";

interface PhotoFile {
	id: string;
	file: File;
	preview: string;
}

interface CreateExperienceCardProps {
	categoryOptions: Category;
}

export default function CreateExperienceCard({
	categoryOptions,
}: CreateExperienceCardProps) {
	const { success, error: notifyError, info, warning } = useNotifications();
	
	const [location, setLocation] = useState<{
		latitude: string;
		longitude: string;
		address: string;
	} | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [locationPermission, setLocationPermission] = useState<
		"granted" | "denied" | "prompt" | "unknown"
	>("unknown");
	const [photos, setPhotos] = useState<PhotoFile[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Image modal state
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Camera state
	const [isCameraOpen, setIsCameraOpen] = useState(false);

	// Request location permission on component mount
	useEffect(() => {
		// Check if device is mobile
		const checkMobile = () => {
			const userAgent =
				navigator.userAgent || navigator.vendor || (window as any).opera;
			const isMobileDevice =
				/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
					userAgent,
				) || window.innerWidth <= 768;
			setIsMobile(isMobileDevice);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		const requestLocationPermission = () => {
			if (navigator.geolocation) {
				// Check if we can get the current position (this will trigger permission request)
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// Permission granted, get location immediately
						const lat = position.coords.latitude.toString();
						const lng = position.coords.longitude.toString();

						// Get address from coordinates using OpenStreetMap Nominatim for street-level precision
						fetch(
							`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
							{
								headers: {
									"User-Agent":
										"BrokenExperiences/1.0 (https://brokenexperiences.com)",
								},
							},
						)
							.then((response) => response.json())
							.then((data) => {
								console.log(
									"🌍 OpenStreetMap Nominatim API response:",
									JSON.stringify(data, null, 2),
								);

								// Extract detailed address components from Nominatim
								const address = data.address || {};
								const components: string[] = [];

								// Build address from most specific to least specific
								if (address.house_number && address.road) {
									components.push(`${address.house_number} ${address.road}`);
								} else if (address.road) {
									components.push(address.road);
								}

								// Add neighborhood/suburb/district
								if (address.neighbourhood) {
									components.push(address.neighbourhood);
								} else if (address.suburb) {
									components.push(address.suburb);
								} else if (address.district) {
									components.push(address.district);
								}

								// Add city/town/village
								if (address.city) {
									components.push(address.city);
								} else if (address.town) {
									components.push(address.town);
								} else if (address.village) {
									components.push(address.village);
								}

								// Add parish/county/state (for Jamaica context)
								if (address.county && !components.includes(address.county)) {
									components.push(address.county);
								} else if (
									address.state &&
									!components.includes(address.state)
								) {
									components.push(address.state);
								}

								// Create final address string
								let finalAddress =
									components.length > 0
										? components
												.slice(0, 3)
												.join(", ") // Limit to 3 most specific components
										: data.display_name?.split(",").slice(0, 3).join(", ") ||
											null;

								// Fallback to coordinate-based description if no detailed address
								if (
									!finalAddress ||
									(finalAddress.includes("Jamaica") && components.length === 0)
								) {
									const latRounded = Number.parseFloat(lat).toFixed(4);
									const lngRounded = Number.parseFloat(lng).toFixed(4);
									finalAddress = `Location at ${latRounded}°N, ${lngRounded}°W`;
								}

								console.log("📍 Nominatim address parsing:", {
									addressComponents: address,
									extractedComponents: components,
									finalAddress: finalAddress,
									displayName: data.display_name,
								});

								setLocation({
									latitude: lat,
									longitude: lng,
									address: finalAddress,
								});
								setLocationPermission("granted");
							})
							.catch(() => {
								// If reverse geocoding fails, still set location with coordinates
								setLocation({
									latitude: lat,
									longitude: lng,
									address: "Location obtained",
								});
								setLocationPermission("granted");
							});
					},
					(error) => {
						console.log("Location permission denied or error:", error);
						setLocationPermission("denied");
					},
					{
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 300000, // 5 minutes
					},
				);
			} else {
				setLocationPermission("denied");
			}
		};

		requestLocationPermission();

		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	const handleGetLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const lat = position.coords.latitude.toString();
					const lng = position.coords.longitude.toString();

					console.log("📍 Got location:", { lat, lng });

					// Get address from coordinates using OpenStreetMap Nominatim for street-level precision
					fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
						{
							headers: {
								"User-Agent":
									"BrokenExperiences/1.0 (https://brokenexperiences.com)",
							},
						},
					)
						.then((response) => response.json())
						.then((data) => {
							console.log(
								"🌍 Manual - OpenStreetMap Nominatim API response:",
								JSON.stringify(data, null, 2),
							);

							// Extract detailed address components from Nominatim
							const address = data.address || {};
							const components: string[] = [];

							// Build address from most specific to least specific
							if (address.house_number && address.road) {
								components.push(`${address.house_number} ${address.road}`);
							} else if (address.road) {
								components.push(address.road);
							}

							// Add neighborhood/suburb/district
							if (address.neighbourhood) {
								components.push(address.neighbourhood);
							} else if (address.suburb) {
								components.push(address.suburb);
							} else if (address.district) {
								components.push(address.district);
							}

							// Add city/town/village
							if (address.city) {
								components.push(address.city);
							} else if (address.town) {
								components.push(address.town);
							} else if (address.village) {
								components.push(address.village);
							}

							// Add parish/county/state (for Jamaica context)
							if (address.county && !components.includes(address.county)) {
								components.push(address.county);
							} else if (address.state && !components.includes(address.state)) {
								components.push(address.state);
							}

							// Create final address string
							let finalAddress =
								components.length > 0
									? components
											.slice(0, 3)
											.join(", ") // Limit to 3 most specific components
									: data.display_name?.split(",").slice(0, 3).join(", ") ||
										null;

							// Fallback to coordinate-based description if no detailed address
							if (
								!finalAddress ||
								(finalAddress.includes("Jamaica") && components.length === 0)
							) {
								const latRounded = Number.parseFloat(lat).toFixed(4);
								const lngRounded = Number.parseFloat(lng).toFixed(4);
								finalAddress = `Location at ${latRounded}°N, ${lngRounded}°W`;
							}

							console.log("📍 Manual - Nominatim address parsing:", {
								addressComponents: address,
								extractedComponents: components,
								finalAddress: finalAddress,
								displayName: data.display_name,
							});

							setLocation({
								latitude: lat,
								longitude: lng,
								address: finalAddress,
							});
							setLocationPermission("granted");
							setIsGettingLocation(false);
						})
						.catch(() => {
							// If reverse geocoding fails, still set location with coordinates
							setLocation({
								latitude: lat,
								longitude: lng,
								address: "Location obtained",
							});
							setLocationPermission("granted");
							setIsGettingLocation(false);
						});
				},
				(error) => {
					console.error("Geolocation error:", error);
					setLocationPermission("denied");
					setIsGettingLocation(false);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				},
			);
		} else {
			console.error("Geolocation is not supported by your browser.");
			setLocationPermission("denied");
			setIsGettingLocation(false);
		}
	};

	const handleImageClick = (index: number) => {
		setCurrentImageIndex(index);
		setIsImageModalOpen(true);
	};

	const handleCancel = () => {
		// Reset form
		form.reset();
		// Clear photos and revoke object URLs
		photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
		setPhotos([]);
		// Clear location
		setLocation(null);
		// Collapse form
		setIsExpanded(false);
	};

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const newPhotos: PhotoFile[] = files.map((file) => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			preview: URL.createObjectURL(file),
		}));
		setPhotos((prev) => [...prev, ...newPhotos]);
		// Expand the form when photos are added so they're visible immediately
		setIsExpanded(true);
	};

	const removePhoto = (id: string) => {
		setPhotos((prev) => {
			const photo = prev.find((p) => p.id === id);
			if (photo) {
				URL.revokeObjectURL(photo.preview);
			}
			return prev.filter((p) => p.id !== id);
		});
	};

	const handleCameraCapture = (file: File) => {
		const newPhoto: PhotoFile = {
			id: Math.random().toString(36).substr(2, 9),
			file,
			preview: URL.createObjectURL(file),
		};
		setPhotos((prev) => [...prev, newPhoto]);
		// Expand the form when photos are captured so they're visible immediately
		setIsExpanded(true);
	};

	const form = useForm({
		defaultValues: {
			description: "",
			categoryId: "",
			priority: "medium",
			status: "pending",
		},
		onSubmit: async ({ value }) => {
			if (!location) {
				notifyError("Location is required");
				return;
			}

			// Upload images if any
			let imageUrls: string[] = [];
			if (photos.length > 0) {
				try {
					console.log("📸 Starting image upload for", photos.length, "files");
					info("Uploading images...");
					const { uploadMultipleImages } = await import(
						"@web/lib/supabase/storage"
					);
					imageUrls = await uploadMultipleImages(photos.map((p) => p.file));
					console.log("✅ Images uploaded successfully:", imageUrls);
					success(`${imageUrls.length} image(s) uploaded!`);
				} catch (error) {
					console.error("❌ Image upload failed:", error);
					notifyError("Failed to upload images. Posting without images...");
				}
			}

			const submission = {
				categoryId: value.categoryId,
				title: value.description.substring(0, 50),
				description: value.description,
				priority: value.priority || "medium",
				status: value.status || "pending",
				latitude: location.latitude,
				longitude: location.longitude,
				address: location.address,
				imageUrls: imageUrls,
			};
			console.log("📤 Submitting experience with data:", submission);
			// Use TanStack Query mutation for better performance
			createExperience(submission, {
				onSuccess: () => {
					console.log("✅ Experience created successfully with TanStack Query");
					success("Experience posted successfully!");
					// Reset form on success
					form.reset();
					// Reset location and photos
					setLocation(null);
					photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
					setPhotos([]);
					setIsExpanded(false);
					// TanStack Query will automatically refetch and update the feed
				},
				onError: (error) => {
					console.error("❌ Experience creation failed:", error);
					notifyError("Failed to create experience. Please try again.");
				},
			});
		},
		validators: {
			onSubmit: z.object({
				description: z.string().min(5, "Please provide at least 5 characters"),
				categoryId: z.string().min(1, "Category is required"),
				priority: z.string(),
				status: z.string(),
			}),
		},
	});

	// Use TanStack Query for creating experiences
	const { mutate: createExperience, isPending: isExecuting } =
		useCreateExperience();

	const { execute, isExecuting: isExecutingAction } = useAction(
		createExperienceAction,
		{
			onSuccess: (data) => {
				console.log("✅ Experience created successfully:", data);

				// Check if there was actually an error in the response
				if (data && typeof data === "object" && "error" in data) {
					console.error("❌ Server returned error:", data);
					const errorData = data as any;
					notifyError(
						`Failed: ${errorData.message || errorData.error || "Unknown error"}`,
					);
					return;
				}

				// Show success toast
				success("Experience posted successfully!");

				// Reset form on success
				form.reset();
				// Reset location and photos
				setLocation(null);
				photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
				setPhotos([]);
				setIsExpanded(false);
				// Reload page to show new post
				setTimeout(() => {
					window.location.reload();
				}, 500);
			},
			onError: (error) => {
				console.error("❌ Failed to create experience:", error);
				console.error("Error details:", JSON.stringify(error, null, 2));

				// Extract more detailed error message
				let errorMessage = "Failed to create experience. Please try again.";
				if (error?.error?.serverError) {
					errorMessage = `Server error: ${error.error.serverError}`;
				} else if (error?.error?.validationErrors) {
					errorMessage = `Validation error: ${JSON.stringify(error.error.validationErrors)}`;
				} else if (error?.error) {
					errorMessage = `Error: ${JSON.stringify(error.error)}`;
				}

				alert(errorMessage);
			},
		},
	);

	return (
		<div className="border-gray-200 border-b bg-white p-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-2"
			>
				<div className="flex space-x-3">
					<div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200" />
					<div className="flex-1 relative">
						{!isExpanded && (
							<div 
								className="absolute inset-0 flex items-center cursor-text text-lg text-gray-400 sm:text-xl"
								onClick={() => setIsExpanded(true)}
							>
								<AnimatedReportText />
							</div>
						)}
						<form.Field name="description">
							{(field) => (
								<>
									<textarea
										id={field.name}
										name={field.name}
										placeholder={
											isExpanded
												? "Describe the slackness you want fixed..."
												: ""
										}
										value={field.state.value}
										onFocus={() => {
											// Expand when user clicks/focuses on the input
											if (!isExpanded) {
												setIsExpanded(true);
											}
										}}
										onBlur={field.handleBlur}
										onChange={(e) => {
											field.handleChange(e.target.value);
										}}
										className={`min-h-[40px] w-full resize-none break-words bg-transparent text-black text-lg focus:outline-none sm:text-xl ${
											isExpanded ? "placeholder:text-gray-400" : "text-transparent"
										}`}
										rows={isExpanded ? 3 : 1}
										maxLength={500}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-0.5 text-red-500 text-xs">
											{typeof field.state.meta.errors[0] === "string"
												? field.state.meta.errors[0]
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
									{isExpanded && (
										<p className="mt-0.5 text-gray-400 text-xs">
											{field.state.value.length}/500
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>
				</div>

				{/* Enhanced features when expanded */}
				{isExpanded && (
					<>
						{/* Photo upload section */}
						<div className="ml-10 space-y-2">
							{photos.length > 0 && (
								<div className="flex flex-wrap gap-2.5">
									{photos.map((photo, index) => (
										<div key={photo.id} className="group relative">
											<div
												className="h-24 w-24 cursor-pointer overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm transition-shadow hover:shadow-md"
												onClick={() => handleImageClick(index)}
											>
												<img
													src={photo.preview}
													alt="Upload preview"
													className="h-full w-full object-cover"
													loading="eager"
													onLoad={() =>
														console.log("✅ Image loaded:", photo.preview)
													}
													onError={(e) => {
														console.error(
															"❌ Image preview error:",
															photo.preview,
														);
													}}
												/>
											</div>
											<button
												type="button"
												onClick={() => removePhoto(photo.id)}
												className="-top-2 -right-2 absolute flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									))}
								</div>
							)}

							{/* Location display only when permission is denied */}
							{locationPermission === "denied" && (
								<div className="rounded-md bg-red-50 p-1.5 text-red-600 text-xs">
									<p className="flex items-center gap-1">
										<MapPin className="h-2.5 w-2.5" />
										<span className="font-medium">
											Location permission required
										</span>
									</p>
								</div>
							)}
						</div>
					</>
				)}

				{/* Mobile and Desktop Layout */}
				<div className="ml-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
					{/* Top row on mobile: Action buttons */}
					<div className="flex items-center justify-between sm:justify-start">
						<div className="flex items-center space-x-2">
							{/* Photo upload button - Always visible */}
							<label className="flex-shrink-0 cursor-pointer">
								<div className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700">
									<Picture className="h-4 w-4" />
								</div>
								<input
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={handlePhotoUpload}
								/>
							</label>

							{/* Camera button for mobile devices */}
							{isMobile && (
								<button
									type="button"
									onClick={() => setIsCameraOpen(true)}
									className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
								>
									<Camera className="h-4 w-4" />
								</button>
							)}

							{/* Location button - hide when location is granted */}
							{!(location && locationPermission === "granted") && (
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={handleGetLocation}
												disabled={
													isGettingLocation || locationPermission === "denied"
												}
												className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
													locationPermission === "denied"
														? "cursor-not-allowed border border-red-200 bg-red-50 text-red-600"
														: "border border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
												}`}
											>
												<MapPin className="h-4 w-4" />
											</button>
										}
									/>
									<TooltipPanel>
										{locationPermission === "denied"
											? "Enable location to post"
											: "Get location..."}
									</TooltipPanel>
								</Tooltip>
							)}
						</div>

						{/* Category selector - always on right side on mobile */}
						<form.Field name="categoryId">
							{(field) => (
								<>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger className="h-8 w-[90px] flex-shrink-0 border-gray-200 bg-white text-gray-700 text-xs sm:w-[100px]">
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											{Array.isArray(categoryOptions) &&
												categoryOptions.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-red-500 text-xs">
											{typeof field.state.meta.errors[0] === "string"
												? field.state.meta.errors[0]
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>

					{/* Bottom row on mobile: Action buttons */}
					<div className="mt-2 flex items-center justify-end gap-2 sm:mt-0">
						{isExpanded && (
							<Button
								type="button"
								onClick={handleCancel}
								className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-200"
							>
								Cancel
							</Button>
						)}
						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="rounded-full bg-black px-6 py-2 font-medium text-sm text-white hover:bg-gray-800 disabled:opacity-50"
									disabled={
										!state.canSubmit ||
										state.isSubmitting ||
										isExecuting ||
										!location ||
										!location.latitude ||
										!location.longitude
									}
								>
									{state.isSubmitting || isExecuting ? "Posting..." : "Post"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form>

			{/* Image Modal */}
			{photos.length > 0 && (
				<ImageModal
					images={photos.map((photo) => photo.preview)}
					currentIndex={currentImageIndex}
					isOpen={isImageModalOpen}
					onClose={() => setIsImageModalOpen(false)}
					onIndexChange={setCurrentImageIndex}
				/>
			)}

			{/* Camera Capture Modal */}
			<CameraCapture
				isOpen={isCameraOpen}
				onCapture={handleCameraCapture}
				onClose={() => setIsCameraOpen(false)}
			/>
		</div>
	);
}
