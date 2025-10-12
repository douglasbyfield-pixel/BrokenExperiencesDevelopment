"use client";

import { useOfflineQueue } from "@web/components/offline-queue-provider";
import { useOfflineDetection } from "@web/hooks/use-offline-detection";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { Clock, Upload, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

export function OfflineStatus() {
	const { isOnline } = useOfflineDetection();
	const { pendingActions, retryActions, clearQueue } = useOfflineQueue();
	const [isRetrying, setIsRetrying] = useState(false);

	// Don't show if online and no pending actions
	if (isOnline && pendingActions.length === 0) {
		return null;
	}

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			await retryActions();
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<div className="fixed bottom-4 left-4 z-50 max-w-xs">
			<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
				{/* Connection Status */}
				<div className="flex items-center gap-2 mb-2">
					{isOnline ? (
						<>
							<Wifi className="h-4 w-4 text-green-600" />
							<span className="text-sm font-medium text-green-700">Online</span>
						</>
					) : (
						<>
							<WifiOff className="h-4 w-4 text-amber-600" />
							<span className="text-sm font-medium text-amber-700">Offline</span>
						</>
					)}
				</div>

				{/* Pending Actions */}
				{pendingActions.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-gray-500" />
							<span className="text-sm text-gray-600">
								{pendingActions.length} pending action{pendingActions.length !== 1 ? 's' : ''}
							</span>
						</div>

						{/* Action List */}
						<div className="space-y-1 max-h-20 overflow-y-auto">
							{pendingActions.slice(0, 3).map((action) => (
								<div key={action.id} className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">
										{action.type}
									</Badge>
									<span className="text-xs text-gray-500 truncate">
										{action.description}
									</span>
								</div>
							))}
							{pendingActions.length > 3 && (
								<div className="text-xs text-gray-400 text-center">
									+{pendingActions.length - 3} more...
								</div>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex gap-2 pt-2">
							{isOnline && (
								<Button
									onClick={handleRetry}
									disabled={isRetrying}
									size="sm"
									className="flex-1 h-7 text-xs"
								>
									<Upload className="h-3 w-3 mr-1" />
									{isRetrying ? 'Syncing...' : 'Sync'}
								</Button>
							)}
							
							<Button
								onClick={clearQueue}
								variant="outline"
								size="sm"
								className="h-7 text-xs"
							>
								Clear
							</Button>
						</div>
					</div>
				)}

				{/* Offline Mode Info */}
				{!isOnline && pendingActions.length === 0 && (
					<p className="text-xs text-gray-500 mt-1">
						Actions will be queued until you're back online
					</p>
				)}
			</div>
		</div>
	);
}