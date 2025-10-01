"use client";

import { useForm } from "@tanstack/react-form";
import { createExperienceAction } from "@web/action/experience";
import { Button } from "@web/components/ui/button";
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
		if (files) {
			setIsExpanded(true); // Expand form when photo is added
			Array.from(files).forEach(file => {
				const id = Date.now().toString() + Math.random().toString();
				const preview = URL.createObjectURL(file);
				setPhotos(prev => [...prev, { id, file, preview }]);
			});
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

	const form = useForm({
		defaultValues: {
			description: "",
			categoryId: "",
			priority: "medium",
			status: "pending",
		},
		onSubmit: ({ value }) => {
			// Require location data - prevent submission without coordinates
			if (!location || !location.latitude || !location.longitude) {
				toast.error('Please enable location access and get your current location before posting.');
				return;
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
		};
			execute(submission);
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

	const { execute, isExecuting } = useAction(createExperienceAction, {
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
		<div className="border-b border-gray-200 p-3 lg:p-4 bg-white">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-3 lg:space-y-4"
			>
				<div className="flex space-x-3">
					<div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gray-200 flex-shrink-0" />
					<div className="flex-1">
						<form.Field name="description">
							{(field) => (
								<>
									<textarea
										id={field.name}
										name={field.name}
										placeholder={isExpanded ? "Describe your experience in detail..." : "What's your broken experience?"}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											field.handleChange(e.target.value);
											// Expand when user types
											if (!isExpanded && e.target.value.length > 0) {
												setIsExpanded(true);
											}
											// Minimize when user clears the text (and no photos)
											if (isExpanded && e.target.value.length === 0 && photos.length === 0) {
												setIsExpanded(false);
											}
										}}
										className="w-full resize-none bg-transparent text-lg lg:text-xl text-black placeholder:text-gray-400 focus:outline-none min-h-[50px] lg:min-h-[60px]"
										rows={isExpanded ? 4 : 2}
										maxLength={500}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-sm text-red-500">
											{typeof field.state.meta.errors[0] === 'string' 
												? field.state.meta.errors[0] 
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
									{isExpanded && (
										<p className="mt-1 text-xs text-gray-500">
											{field.state.value.length}/500 characters
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
						<div className="ml-10 lg:ml-14 space-y-3">
							{photos.length > 0 && (
								<div className="flex gap-2 flex-wrap">
									{photos.map((photo) => (
										<div key={photo.id} className="relative">
											<div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
												<img 
													src={photo.preview} 
													alt="Upload preview" 
													className="w-full h-full object-cover"
												/>
											</div>
											<button
												type="button"
												onClick={() => removePhoto(photo.id)}
												className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
											>
												<X className="w-3 h-3" />
											</button>
										</div>
									))}
								</div>
							)}
							
							{/* Location display when captured */}
							{location && (
								<div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
									<p className="flex items-center gap-1">
										<MapPin className="w-3 h-3" />
										<span className="font-medium">{location.address}</span>
									</p>
								</div>
							)}
						</div>
					</>
				)}
				
				{/* Priority and Status Selection - Show when expanded */}
				{isExpanded && (
					<div className="ml-10 lg:ml-14 space-y-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
						{/* Category chips */}
						<div>
							<p className="text-xs text-gray-500 font-medium mb-2">Category</p>
							<div className="flex flex-wrap gap-2">
								{Array.isArray(categoryOptions) && categoryOptions.slice(0, 8).map((category: any) => (
									<form.Subscribe key={category.id} selector={(state) => [state.values.categoryId]}>
										{([categoryId]) => (
											<button
												type="button"
												onClick={() => {
													form.setFieldValue('categoryId', category.id);
												}}
												className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
													categoryId === category.id
														? 'bg-black text-white'
														: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
												}`}
											>
												#{category.name}
											</button>
										)}
									</form.Subscribe>
								))}
							</div>
						</div>
						
						{/* Priority Selection */}
						<div>
							<p className="text-xs text-gray-500 font-medium mb-2">Priority Level</p>
							<form.Field name="priority">
								{(field) => (
									<div className="flex gap-2">
										{['low', 'medium', 'high'].map((priority) => (
											<button
												key={priority}
												type="button"
												onClick={() => field.handleChange(priority)}
												className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all font-medium ${
													field.state.value === priority
														? priority === 'high'
															? 'bg-red-500 text-white'
															: priority === 'medium'
															? 'bg-amber-500 text-white'
															: 'bg-emerald-500 text-white'
														: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
												}`}
											>
												{priority.charAt(0).toUpperCase() + priority.slice(1)}
											</button>
										))}
									</div>
								)}
							</form.Field>
						</div>
						
						{/* Status Selection */}
						<div>
							<p className="text-xs text-gray-500 font-medium mb-2">Current Status</p>
							<form.Field name="status">
								{(field) => (
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => field.handleChange('pending')}
											className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all font-medium ${
												field.state.value === 'pending'
													? 'bg-red-500 text-white'
													: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
											}`}
										>
											Reported
										</button>
										<button
											type="button"
											onClick={() => field.handleChange('in-progress')}
											className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all font-medium ${
												field.state.value === 'in-progress'
													? 'bg-amber-500 text-white'
													: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
											}`}
										>
											In Progress
										</button>
										<button
											type="button"
											onClick={() => field.handleChange('resolved')}
											className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all font-medium ${
												field.state.value === 'resolved'
													? 'bg-emerald-500 text-white'
													: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
											}`}
										>
											Resolved
										</button>
									</div>
								)}
							</form.Field>
						</div>
					</div>
				)}
				
				<div className="ml-10 lg:ml-14 flex items-center justify-between">
					<div className="flex items-center space-x-3 lg:space-x-4">
						{/* Photo upload button - Always visible */}
						<label className="cursor-pointer">
							<div className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors">
								<Camera className="h-5 w-5" />
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
											className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors disabled:opacity-50 ${
												locationPermission === 'denied'
													? 'bg-red-50 text-red-600 border-2 border-red-200 cursor-not-allowed'
													: 'hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-2 border-blue-200'
											}`}
										>
											<MapPin className="h-5 w-5" />
										</button>
									}
								/>
								<TooltipPanel>
									{locationPermission === 'denied'
										? 'Enable location permissions in your browser settings to start posting'
										: 'Getting location...'
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
										<SelectTrigger className={`${isExpanded ? 'w-[160px] lg:w-[200px]' : 'w-[140px] lg:w-[180px]'} border-gray-200 bg-white text-gray-700`}>
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
										<p className="text-sm text-red-500">
											{typeof field.state.meta.errors[0] === 'string' 
												? field.state.meta.errors[0] 
												: field.state.meta.errors[0]?.message || "Error"}
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>
					
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className={`rounded-full bg-black font-medium text-white hover:bg-gray-800 disabled:opacity-50 ${isExpanded ? 'px-6 py-2.5 text-base' : 'px-4 lg:px-6 py-2 text-sm lg:text-base'}`}
								disabled={!state.canSubmit || state.isSubmitting || isExecuting || !location || !location.latitude || !location.longitude}
							>
								{state.isSubmitting || isExecuting ? "Posting..." : (!location || !location.latitude || !location.longitude) ? "Location Required" : "Post"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}