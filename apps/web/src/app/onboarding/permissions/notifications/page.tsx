"use client";

import { Bell, BellRing } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function NotificationsPermissionPage() {
	const router = useRouter();
	const [requesting, setRequesting] = useState(false);

	const requestNotificationPermission = async () => {
		setRequesting(true);
		try {
			if ("Notification" in window) {
				const permission = await Notification.requestPermission();
				if (permission === "granted") {
					toast.success("Notifications enabled successfully!");
					// Small delay to show success before navigating
					setTimeout(() => {
						router.replace("/onboarding/permissions/location");
					}, 1000);
				} else {
					toast.error("Notifications permission denied");
					router.replace("/onboarding/permissions/location");
				}
			} else {
				toast.error("Notifications not supported in this browser");
				router.replace("/onboarding/permissions/location");
			}
		} catch (error) {
			console.error("Error requesting notification permission:", error);
			toast.error("Failed to request notifications");
			router.replace("/onboarding/permissions/location");
		} finally {
			setRequesting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Header */}
				<div className="mb-16 flex animate-fade-in items-center justify-between">
					<button
						onClick={() => router.back()}
						aria-label="Back"
						className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-600 text-white transition-all duration-200 hover:scale-105 hover:border-white hover:shadow-md"
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
							<Bell className="h-16 w-16 text-gray-800" />
							<div className="-top-1 -right-1 absolute flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-red-500">
								<div className="h-2 w-2 rounded-full bg-white" />
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="animation-delay-300 mb-12 animate-slide-up text-center">
					<h1 className="mb-4 font-bold text-3xl text-white">
						Stay updated on new issues
					</h1>
					<p className="text-gray-300 text-lg leading-relaxed">
						Get notified when issues are reported in your area or when there are
						updates on your reports.
					</p>
				</div>

				{/* Buttons */}
				<div className="animation-delay-500 animate-slide-up space-y-4">
					<Button
						className="group h-12 w-full transform rounded-xl bg-white font-medium text-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-xl"
						onClick={requestNotificationPermission}
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
									<BellRing className="h-4 w-4 group-hover:animate-pulse" />
									Enable notifications
								</>
							)}
						</span>
					</Button>

					<Button
						className="h-12 w-full transform rounded-xl border-2 border-gray-600 bg-transparent font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-white hover:bg-white hover:text-black"
						onClick={() => router.replace("/onboarding/permissions/location")}
					>
						Skip for now
					</Button>
				</div>

				{/* Footer */}
				<div className="animation-delay-700 mt-8 animate-fade-in text-center text-gray-500 text-xs">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
