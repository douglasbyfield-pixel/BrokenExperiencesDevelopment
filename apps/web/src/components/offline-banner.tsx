"use client";

import { useOfflineDetection } from "@web/hooks/use-offline-detection";
import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { Wifi, WifiOff, RefreshCw, X } from "lucide-react";

export function OfflineBanner() {
	const { isOnline, wasOffline } = useOfflineDetection();
	const [showBanner, setShowBanner] = useState(false);
	const [isRetrying, setIsRetrying] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		if (!isOnline && !isDismissed) {
			setShowBanner(true);
		} else if (isOnline && wasOffline && !isDismissed) {
			// Show "back online" message briefly
			setShowBanner(true);
			setTimeout(() => {
				setShowBanner(false);
				setIsDismissed(false);
			}, 3000);
		} else if (isOnline) {
			setShowBanner(false);
			setIsDismissed(false);
		}
	}, [isOnline, wasOffline, isDismissed]);

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			// Attempt to fetch a small resource to test connectivity
			await fetch("/favicon.ico", { cache: "no-cache" });
			// If successful, the useOfflineDetection hook will detect it
		} catch (error) {
			console.log("Retry failed:", error);
		} finally {
			setTimeout(() => setIsRetrying(false), 1000);
		}
	};

	const handleDismiss = () => {
		setIsDismissed(true);
		setShowBanner(false);
	};

	if (!showBanner) {
		return null;
	}

	// Different styles for offline vs back online
	const bannerClass = isOnline 
		? "bg-green-500 text-white" 
		: "bg-amber-600 text-white";

	const message = isOnline
		? "You're back online! All features are now available."
		: "You're offline. Viewing cached content. Some features may be limited.";

	const icon = isOnline 
		? <Wifi className="h-4 w-4" />
		: <WifiOff className="h-4 w-4" />;

	return (
		<div className={`${bannerClass} px-4 py-2 shadow-sm`}>
			<div className="flex items-center justify-between max-w-6xl mx-auto">
				<div className="flex items-center gap-2 flex-1">
					{icon}
					<span className="text-sm font-medium">
						{message}
					</span>
				</div>
				
				<div className="flex items-center gap-2">
					{!isOnline && (
						<Button
							onClick={handleRetry}
							disabled={isRetrying}
							size="sm"
							variant="ghost"
							className="text-white hover:bg-white/20 h-6 px-2 text-xs"
						>
							<RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
							{isRetrying ? 'Checking...' : 'Retry'}
						</Button>
					)}
					
					<Button
						onClick={handleDismiss}
						size="sm"
						variant="ghost"
						className="text-white hover:bg-white/20 h-6 w-6 p-0"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
}
