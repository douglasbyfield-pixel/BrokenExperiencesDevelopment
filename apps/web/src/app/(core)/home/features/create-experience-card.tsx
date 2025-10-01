"use client";

import { useForm } from "@tanstack/react-form";
import { createExperienceAction } from "@web/action/experience";
import { Button } from "@web/components/ui/button";
import { useCreateExperience } from "@web/hooks/use-experiences";
import { ImageModal } from "@web/components/ui/image-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web/components/ui/select";
import type { Category } from "@web/types";
import { MapPin, Camera, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState, useEffect } from "react";
import z from "zod";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipPanel,
	TooltipTrigger,
} from "@web/components/animate-ui/components/base/tooltip";

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
	const [location, setLocation] = useState<{
		latitude: string;
		longitude: string;
		address: string;
	} | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
	const [photos, setPhotos] = useState<PhotoFile[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	
	// Image modal state
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Request location permission on component mount
	useEffect(() => {
		const requestLocationPermission = () => {
			if (navigator.geolocation) {
				// Check if we can get the current position (this will trigger permission request)
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// Permission granted, get location immediately
						const lat = position.coords.latitude.toString();
						const lng = position.coords.longitude.toString();
						
						// Get address from coordinates
						fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
							.then(response => response.json())
							.then(data => {
								const address = data.localityInfo?.administrative?.[0]?.name || 
											  data.localityInfo?.administrative?.[1]?.name || 
											  data.city || 
											  data.principalSubdivision || 
											  'Location obtained';
								
								setLocation({
									latitude: lat,
									longitude: lng,
									address: address
								});
								setLocationPermission('granted');
							})
							.catch(() => {
								// If reverse geocoding fails, still set location with coordinates
								setLocation({
									latitude: lat,
									longitude: lng,
									address: 'Location obtained'
								});
								setLocationPermission('granted');
							});
					},
					(error) => {
						console.log('Location permission denied or error:', error);
						setLocationPermission('denied');
					},
					{
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 300000 // 5 minutes
					}
				);
			} else {
				setLocationPermission('denied');
			}
		};

		requestLocationPermission();
	}, []);

	const handleGetLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const lat = position.coords.latitude.toString();
					const lng = position.coords.longitude.toString();
					
					console.log("📍 Got location:", { lat, lng });
					
					// Try to get address from coordinates using reverse geocoding
					let address = `${lat}, ${lng}`;
					try {
						const response = await fetch(
							`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
						);
						const data = await response.json();
						if (data.features && data.features.length > 0) {
							address = data.features[0].place_name;
							console.log("📍 Got address:", address);
						}
					} catch (error) {
						console.error("Failed to get address:", error);
					}

					setLocation({
						latitude: lat,
						longitude: lng,
						address: address
					});
					setLocationPermission('granted');
					setIsGettingLocation(false);
				},
				(error) => {
					console.error("Geolocation error:", error);
					setLocationPermission('denied');
					setIsGettingLocation(false);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				}
			);
		} else {
			console.error("Geolocation is not supported by your browser.");
			setLocationPermission('denied');
			setIsGettingLocation(false);
		}
	};

	const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			console.log('📸 Uploading files:', files.length);
			setIsExpanded(true); // Expand form when photo is added
			
			Array.from(files).forEach(file => {
				const id = Date.now().toString() + Math.random().toString();
				const preview = URL.createObjectURL(file);
				console.log('Created preview:', preview);
				setPhotos(prev => [...prev, { id, file, preview }]);
			});
			
			// Reset input so same file can be selected again
			event.target.value = '';
		}
	};

	const removePhoto = (photoId: string) => {
		setPhotos(prev => {
			const updated = prev.filter(photo => photo.id !== photoId);
			// Clean up object URL
			const photoToRemove = prev.find(photo => photo.id === photoId);
			if (photoToRemove) {
				URL.revokeObjectURL(photoToRemove.preview);
			}
			
			// Minimize form if no photos and no text
			if (updated.length === 0) {
				const descriptionValue = form.getFieldValue('description');
				if (!descriptionValue || descriptionValue.length === 0) {
					setIsExpanded(false);
				}
			}
			
			return updated;
		});
	};

	const handleImageClick = (index: number) => {
		setCurrentImageIndex(index);
		setIsImageModalOpen(true);
	};

	const handleCancel = () => {
		// Reset form
		form.reset();
		// Clear photos and revoke object URLs
		photos.forEach(photo => URL.revokeObjectURL(photo.preview));
		setPhotos([]);
		// Clear location
		setLocation(null);
		// Collapse form
		setIsExpanded(false);
	};

	const form = useForm({
		defaultValues: {
			description: "",
			categoryId: "",
			priority: "medium",
			status: "pending",
		},
		onSubmit: async ({ value }) => {
			// Require location data - prevent submission without coordinates
			if (!location || !location.latitude || !location.longitude) {
				toast.error('Please enable location access and get your current location before posting.');
				return;
			}

			// Upload images if any
			let imageUrls: string[] = [];
			if (photos.length > 0) {
				try {
					console.log('📸 Starting image upload for', photos.length, 'files');
					toast.info('Uploading images...');
					const { uploadMultipleImages } = await import('@web/lib/supabase/storage');
					imageUrls = await uploadMultipleImages(photos.map(p => p.file));
					console.log('✅ Images uploaded successfully:', imageUrls);
					toast.success(`${imageUrls.length} image(s) uploaded!`);
				} catch (error) {
					console.error('❌ Image upload failed:', error);
					toast.error('Failed to upload images. Posting without images...');
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
			console.log('📤 Submitting experience with data:', submission);
			// Use TanStack Query mutation for better performance
			createExperience(submission, {
				onSuccess: () => {
					console.log('✅ Experience created successfully with TanStack Query');
					toast.success('Experience posted successfully!');
					// Reset form on success
					form.reset();
					// Reset location and photos
					setLocation(null);
					photos.forEach(photo => URL.revokeObjectURL(photo.preview));
					setPhotos([]);
					setIsExpanded(false);
					// TanStack Query will automatically refetch and update the feed
				},
				onError: (error) => {
					console.error('❌ Experience creation failed:', error);
					toast.error('Failed to create experience. Please try again.');
				}
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
	const { mutate: createExperience, isPending: isExecuting } = useCreateExperience();
	
	const { execute, isExecuting: isExecutingAction } = useAction(createExperienceAction, {
		onSuccess: (data) => {
			console.log("✅ Experience created successfully:", data);
			
			// Check if there was actually an error in the response
			if (data && typeof data === 'object' && 'error' in data) {
				console.error("❌ Server returned error:", data);
				const errorData = data as any;
				toast.error(`Failed: ${errorData.message || errorData.error || 'Unknown error'}`);
				return;
			}
			
			// Show success toast
			toast.success('Experience posted successfully!');
			
			// Reset form on success
			form.reset();
			// Reset location and photos
			setLocation(null);
			photos.forEach(photo => URL.revokeObjectURL(photo.preview));
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
		}
	});

	return (
		<div className="border-b border-gray-200 p-2 bg-white">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-2"
			>
				<div className="flex space-x-2">
					<div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
					<div className="flex-1">
						<form.Field name="description">
							{(field) => (
								<>
									<textarea
										id={field.name}
										name={field.name}
										placeholder={isExpanded ? "Describe your experience..." : "What's broken?"}
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
										className="w-full resize-none bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none min-h-[32px]"
										rows={isExpanded ? 3 : 1}
										maxLength={500}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-0.5 text-xs text-red-500">
											{typeof field.state.meta.errors[0] === 'string' 
												? field.state.meta.errors[0] 
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
									{isExpanded && (
										<p className="mt-0.5 text-xs text-gray-400">
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
								<div className="flex gap-2.5 flex-wrap">
									{photos.map((photo, index) => (
										<div key={photo.id} className="relative group">
											<div 
												className="w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
												onClick={() => handleImageClick(index)}
											>
												<img 
													src={photo.preview} 
													alt="Upload preview" 
													className="w-full h-full object-cover"
													loading="eager"
													onLoad={() => console.log('✅ Image loaded:', photo.preview)}
													onError={(e) => {
														console.error('❌ Image preview error:', photo.preview);
													}}
												/>
											</div>
											<button
												type="button"
												onClick={() => removePhoto(photo.id)}
												className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all hover:scale-110"
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									))}
								</div>
							)}
							
							{/* Location display when captured */}
							{location && (
								<div className="text-xs text-gray-600 p-1.5 bg-gray-50 rounded-md">
									<p className="flex items-center gap-1">
										<MapPin className="w-2.5 h-2.5" />
										<span className="font-medium truncate">{location.address}</span>
									</p>
								</div>
							)}
						</div>
					</>
				)}
				
				<div className="ml-10 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						{/* Photo upload button - Always visible */}
						<label className="cursor-pointer">
							<div className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors">
								<Camera className="h-4 w-4" />
							</div>
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={handlePhotoUpload}
							/>
						</label>
						
						{/* Location button - hide when location is granted */}
						{!(location && locationPermission === 'granted') && (
							<Tooltip>
								<TooltipTrigger 
									render={
										<button 
											type="button" 
											onClick={handleGetLocation}
											disabled={isGettingLocation || locationPermission === 'denied'}
											className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors disabled:opacity-50 ${
												locationPermission === 'denied'
													? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
													: 'hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-200'
											}`}
										>
											<MapPin className="h-4 w-4" />
										</button>
									}
								/>
								<TooltipPanel>
									{locationPermission === 'denied'
										? 'Enable location to post'
										: 'Get location...'
									}
								</TooltipPanel>
							</Tooltip>
						)}
						<form.Field name="categoryId">
							{(field) => (
								<>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger className="w-[120px] h-7 text-xs border-gray-200 bg-white text-gray-700">
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											{Array.isArray(categoryOptions) && categoryOptions.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{field.state.meta.errors.length > 0 && (
										<p className="text-xs text-red-500">
											{typeof field.state.meta.errors[0] === 'string' 
												? field.state.meta.errors[0] 
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>
					
					<div className="flex items-center gap-1.5">
						{isExpanded && (
							<Button
								type="button"
								onClick={handleCancel}
								className="rounded-full bg-gray-100 font-medium text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs h-7"
							>
								Cancel
							</Button>
						)}
						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="rounded-full bg-black font-medium text-white hover:bg-gray-800 disabled:opacity-50 px-4 py-1 text-xs h-7"
									disabled={!state.canSubmit || state.isSubmitting || isExecuting || !location || !location.latitude || !location.longitude}
								>
									{state.isSubmitting || isExecuting ? "Posting..." : (!location || !location.latitude || !location.longitude) ? "Location" : "Post"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form>
			
			{/* Image Modal */}
			{photos.length > 0 && (
				<ImageModal
					images={photos.map(photo => photo.preview)}
					currentIndex={currentImageIndex}
					isOpen={isImageModalOpen}
					onClose={() => setIsImageModalOpen(false)}
					onIndexChange={setCurrentImageIndex}
				/>
			)}
		</div>
	);
}