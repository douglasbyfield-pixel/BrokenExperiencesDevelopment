"use client";

import { AddToHomeScreen } from "@web/components/add-to-home-screen";
import { useAuth } from "@web/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CoreLayout(props: {
	children: React.ReactNode;
}) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	// Redirect unauthenticated users to login
	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/login");
		}
	}, [user, isLoading, router]);

	// Register service worker for push notifications
	useEffect(() => {
		if ("serviceWorker" in navigator && user) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("Service Worker registered:", registration);
				})
				.catch((error) => {
					console.error("Service Worker registration failed:", error);
				});
		}
	}, [user]);

	// Show loading state while checking auth
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	// Don't render content if not authenticated
	if (!user) {
		return null;
	}

	return (
		<div>
			{props.children}
			<AddToHomeScreen />
		</div>
	);
}
