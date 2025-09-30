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
import { useState } from "react";
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
	const [location, setLocation] = useState<{
		latitude: string;
		longitude: string;
		address: string;
	} | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [photos, setPhotos] = useState<PhotoFile[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);

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
					setIsGettingLocation(false);
				},
				(error) => {
					console.error("Geolocation error:", error);
					alert(`Location access denied: ${error.message}. Using default location.`);
					// Set default location if geolocation fails
					setLocation({
						latitude: "0",
						longitude: "0",
						address: "Location not specified"
					});
					setIsGettingLocation(false);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				}
			);
		} else {
			alert("Geolocation is not supported by your browser. Using default location.");
			// Geolocation not supported, use default
			setLocation({
				latitude: "0",
				longitude: "0",
				address: "Location not specified"
			});
			setIsGettingLocation(false);
		}
	};

	const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
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
			const photoToRemove = prev.find(photo => photo.id !== photoId);
			if (photoToRemove) {
				URL.revokeObjectURL(photoToRemove.preview);
			}
			return updated;
		});
	};

	const form = useForm({
		defaultValues: {
			description: "",
			categoryId: "",
		},
		onSubmit: ({ value }) => {
			// Ensure we have location data
			const currentLocation = location || {
			  latitude: "0",
			  longitude: "0",
			  address: "Location not specified"
			};
		  
		const submission = {
		  categoryId: value.categoryId,
		  title: value.description.substring(0, 50),
		  description: value.description,
		  latitude: currentLocation.latitude,
		  longitude: currentLocation.longitude,
		  address: currentLocation.address,
		};
			execute(submission);
		  },
		validators: {
			onSubmit: z.object({
				description: z.string().min(5, "Please provide at least 5 characters"),
				categoryId: z.string().min(1, "Category is required"),
			}),
		},
	});

	const { execute, isExecuting } = useAction(createExperienceAction, {
		onSuccess: (data) => {
			console.log("✅ Experience created successfully:", data);
			
			// Check if there was actually an error in the response
			if (data && typeof data === 'object' && 'error' in data) {
				console.error("❌ Server returned error:", data);
				alert(`Failed: ${data.message || data.error}`);
				return;
			}
			
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
											if (!isExpanded && e.target.value.length > 0) {
												setIsExpanded(true);
											}
										}}
										className="w-full resize-none bg-transparent text-lg lg:text-xl text-black placeholder:text-gray-400 focus:outline-none min-h-[50px] lg:min-h-[60px]"
										rows={isExpanded ? 4 : 2}
										maxLength={500}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-sm text-red-500">
											{String(field.state.meta.errors[0] || "Error")}
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
				
				<div className="ml-10 lg:ml-14 flex items-center justify-between">
					<div className="flex items-center space-x-2 lg:space-x-4">
						{/* Photo upload button */}
						{isExpanded && (
							<label className="cursor-pointer">
								<div className="flex items-center space-x-1 text-gray-600 hover:text-black p-1">
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
						)}
						<button 
							type="button" 
							onClick={handleGetLocation}
							disabled={isGettingLocation}
							className={`flex items-center space-x-1 text-gray-600 hover:text-black disabled:opacity-50 ${location ? 'text-green-600' : ''} p-1`}
							title={location ? `Location: ${location.address}` : 'Add location'}
						>
							<MapPin className="h-5 w-5" />
							{isGettingLocation && !isExpanded && <span className="text-xs">Getting...</span>}
							{location && !isExpanded && <span className="text-xs text-green-600">✓</span>}
						</button>
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
											{String(field.state.meta.errors[0] || "Error")}
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
								disabled={!state.canSubmit || state.isSubmitting || isExecuting}
							>
								{state.isSubmitting || isExecuting ? "Posting..." : "Post"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}