"use client";

import { MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function LocationPermissionPage() {
	const router = useRouter();
	const [requesting, setRequesting] = useState(false);

	const requestLocationPermission = async () => {
		setRequesting(true);
		try {
			if ("geolocation" in navigator) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						console.log("Location permission granted:", position.coords);
						toast.success("Location access enabled successfully!");
						// Small delay to show success before navigating
						setTimeout(() => {
							router.replace("/home"); // Navigate to main app
						}, 1000);
					},
					(error) => {
						console.error("Location permission denied:", error);
						toast.error("Location permission denied");
						router.replace("/home"); // Still proceed to app
					},
					{
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 0,
					},
				);
			} else {
				toast.error("Location services not supported in this browser");
				router.replace("/home");
			}
		} catch (error) {
			console.error("Error requesting location permission:", error);
			toast.error("Failed to request location access");
			router.replace("/home");
		} finally {
			setRequesting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Header */}
				<div className="mb-16 flex animate-fade-in items-center justify-between">
					<button
						onClick={() => router.back()}
						aria-label="Back"
						className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-blue-400 text-white transition-all duration-200 hover:scale-105 hover:border-white hover:shadow-md"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<div className="w-10" />
				</div>

				{/* Illustration */}
				<div className="animation-delay-200 mb-12 animate-slide-up text-center">
					<div className="mx-auto mb-8 flex h-32 w-32 animate-float items-center justify-center rounded-3xl bg-white shadow-2xl">
						<div className="relative">
							<MapPin className="h-16 w-16 text-blue-600" />
							<div className="-top-2 -right-2 absolute flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-green-500">
								<div className="h-3 w-3 rounded-full bg-white" />
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="animation-delay-300 mb-12 animate-slide-up text-center">
					<h1 className="mb-4 font-bold text-3xl text-white">
						Find issues closest to you
					</h1>
					<p className="text-blue-100 text-lg leading-relaxed">
						Allow location access to discover and report issues in your area and
						get relevant updates.
					</p>
				</div>

				{/* Buttons */}
				<div className="animation-delay-500 animate-slide-up space-y-4">
					<Button
						className="group h-12 w-full transform rounded-xl bg-white font-medium text-blue-900 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-50 hover:shadow-xl"
						onClick={requestLocationPermission}
						disabled={requesting}
					>
						<span className="flex items-center justify-center gap-2">
							{requesting ? (
								<>
									<svg
										className="h-4 w-4 animate-spin"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Requesting...
								</>
							) : (
								<>
									<Navigation className="h-4 w-4 group-hover:animate-pulse" />
									Turn on location services
								</>
							)}
						</span>
					</Button>

					<Button
						className="h-12 w-full transform rounded-xl border-2 border-blue-400 bg-transparent font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-white hover:bg-white hover:text-blue-900"
						onClick={() => router.replace("/home")}
					>
						Skip for now
					</Button>
				</div>

				{/* Footer */}
				<div className="animation-delay-700 mt-8 animate-fade-in text-center text-blue-300 text-xs">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
