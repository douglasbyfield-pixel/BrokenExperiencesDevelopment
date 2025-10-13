"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useOfflineDetection } from "@web/hooks/use-offline-detection";
import { useNotifications } from "./notifications/notification-provider";
import { notificationTemplates } from "./notifications/notification-system";

// Offline Queue Context
interface OfflineAction {
	id: string;
	type: string;
	data: any;
	timestamp: number;
	description: string;
}

interface OfflineContextType {
	queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void;
	pendingActions: OfflineAction[];
	retryActions: () => Promise<void>;
	clearQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineQueueProvider({ children }: { children: ReactNode }) {
	const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
	const { isOnline } = useOfflineDetection();
	const { notify } = useNotifications();

	// Load pending actions from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem('offline-queue');
		if (saved) {
			try {
				const actions = JSON.parse(saved);
				setPendingActions(actions);
			} catch (error) {
				console.error("Failed to parse offline queue:", error);
			}
		}
	}, []);

	// Save pending actions to localStorage
	useEffect(() => {
		localStorage.setItem('offline-queue', JSON.stringify(pendingActions));
	}, [pendingActions]);

	const retryAction = async (action: OfflineAction) => {
		// Get auth token if needed
		const getAuthHeaders = async (): Promise<Record<string, string>> => {
			const baseHeaders: Record<string, string> = {
				'Content-Type': 'application/json'
			};
			
			try {
				const { createClient } = await import("@web/lib/supabase/client");
				const supabase = createClient();
				const { data: { session } } = await supabase.auth.getSession();
				
				if (session?.access_token) {
					return {
						...baseHeaders,
						'Authorization': `Bearer ${session.access_token}`
					};
				}
			} catch (error) {
				console.error("Failed to get auth headers:", error);
			}
			
			return baseHeaders;
		};

		const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
		
		switch (action.type) {
			case 'vote': {
				const headers = await getAuthHeaders();
				const response = await fetch(`${apiUrl}/experience/${action.data.experienceId}/vote`, {
					method: 'POST',
					headers,
					body: JSON.stringify({ vote: action.data.vote }),
				});
				if (!response.ok) throw new Error('Vote failed');
				break;
			}
			
			case 'create-experience': {
				const createHeaders = await getAuthHeaders();
				const createResponse = await fetch(`${apiUrl}/experience`, {
					method: 'POST',
					headers: createHeaders,
					body: JSON.stringify(action.data),
				});
				if (!createResponse.ok) throw new Error('Create experience failed');
				break;
			}
			
			case 'claim-fix': {
				const claimHeaders = await getAuthHeaders();
				const claimResponse = await fetch(`${apiUrl}/experience/${action.data.experienceId}/claim-fix`, {
					method: 'POST',
					headers: claimHeaders,
					body: JSON.stringify(action.data),
				});
				if (!claimResponse.ok) throw new Error('Claim fix failed');
				break;
			}
			
			default:
				console.warn(`Unknown action type: ${action.type}`);
		}
	};

	const retryActions = useCallback(async () => {
		const actions = [...pendingActions];
		let successCount = 0;
		
		for (const action of actions) {
			try {
				// Retry the action based on type
				await retryAction(action);
				successCount++;
				
				// Remove successful action from queue
				setPendingActions(prev => prev.filter(a => a.id !== action.id));
			} catch (error) {
				console.error(`Failed to retry action ${action.id}:`, error);
			}
		}
		
		if (successCount > 0) {
			notify(notificationTemplates.syncComplete(successCount));
		}
		
		if (successCount < actions.length) {
			notify(notificationTemplates.syncFailed(actions.length - successCount));
		}
	}, [pendingActions, notify]);

	const queueAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
		const newAction: OfflineAction = {
			...action,
			id: Date.now().toString(),
			timestamp: Date.now(),
		};
		
		setPendingActions(prev => [...prev, newAction]);
		notify(notificationTemplates.actionQueued(action.description));
	};

	// Auto-retry when coming back online
	useEffect(() => {
		if (isOnline && pendingActions.length > 0) {
			notify({
				title: "Syncing Actions",
				message: `Processing ${pendingActions.length} pending actions...`,
				type: "info"
			});
			retryActions();
		}
	}, [isOnline, pendingActions.length, notify, retryActions]);

	const clearQueue = () => {
		setPendingActions([]);
		localStorage.removeItem('offline-queue');
		notify({
			title: "Queue Cleared",
			message: "All pending actions have been removed",
			type: "success"
		});
	};

	const value = {
		queueAction,
		pendingActions,
		retryActions,
		clearQueue,
	};

	return (
		<OfflineContext.Provider value={value}>
			{children}
		</OfflineContext.Provider>
	);
}

export function useOfflineQueue() {
	const context = useContext(OfflineContext);
	if (!context) {
		throw new Error('useOfflineQueue must be used within OfflineQueueProvider');
	}
	return context;
}