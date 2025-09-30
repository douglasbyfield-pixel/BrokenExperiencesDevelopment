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
import type { CategoryOption } from "@web/types";
import { MapPin } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import z from "zod";

interface CreateExperienceCardProps {
	categoryOptions: CategoryOption;
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

	const handleGetLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const lat = position.coords.latitude.toString();
					const lng = position.coords.longitude.toString();
					
					// Try to get address from coordinates using reverse geocoding
					let address = `${lat}, ${lng}`;
					try {
						const response = await fetch(
							`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
						);
						const data = await response.json();
						if (data.features && data.features.length > 0) {
							address = data.features[0].place_name;
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
					// Set default location if geolocation fails
					setLocation({
						latitude: "0",
						longitude: "0",
						address: "Location not specified"
					});
					setIsGettingLocation(false);
				}
			);
		} else {
			// Geolocation not supported, use default
			setLocation({
				latitude: "0",
				longitude: "0",
				address: "Location not specified"
			});
			setIsGettingLocation(false);
		}
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
				title: value.description.substring(0, 50), // Use first 50 chars of description as title
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
			console.log("Experience created successfully:", data);
			// Reset form on success
			form.reset();
			// Reset location
			setLocation(null);
			// Reload page to show new post
			setTimeout(() => {
				window.location.reload();
			}, 500);
		},
		onError: (error) => {
			console.error("Failed to create experience:", error);
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
										placeholder="What's your broken experience?"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="w-full resize-none bg-transparent text-lg lg:text-xl text-black placeholder:text-gray-400 focus:outline-none min-h-[50px] lg:min-h-[60px]"
										rows={3}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-sm text-red-500">
											{String(field.state.meta.errors[0] || "Error")}
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>
				</div>
				<div className="ml-10 lg:ml-14 flex items-center justify-between">
					<div className="flex items-center space-x-2 lg:space-x-4">
						<button 
							type="button" 
							onClick={handleGetLocation}
							disabled={isGettingLocation}
							className={`flex items-center space-x-1 text-gray-600 hover:text-black disabled:opacity-50 ${location ? 'text-green-600' : ''}`}
							title={location ? `Location: ${location.address}` : 'Click to get your location'}
						>
							<MapPin className="h-5 w-5" />
							{isGettingLocation && <span className="text-xs">Getting...</span>}
							{location && <span className="text-xs text-green-600">✓</span>}
						</button>
						<form.Field name="categoryId">
							{(field) => (
								<>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger className="w-[140px] lg:w-[180px] border-gray-200 bg-white text-gray-700">
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											{categoryOptions.map((category) => (
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
								className="rounded-full bg-black px-4 lg:px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50 text-sm lg:text-base"
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