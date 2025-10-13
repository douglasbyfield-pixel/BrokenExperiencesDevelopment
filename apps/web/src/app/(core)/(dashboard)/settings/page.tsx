"use client";

import { useAuth } from "@web/components/auth-provider";
import { GeofencingControls } from "@web/components/geofencing/geofencing-controls";
import { BackButton } from "@web/components/ui/back-button";
import { Button } from "@web/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { useSettings } from "@web/context/SettingsContext";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotifications } from "@web/components/notifications";

interface UserSettings {
	privacy: {
		showProfile: boolean;
		showActivity: boolean;
	};
	display: {
		theme: "light" | "dark" | "system";
		mapStyle: string;
	};
}

export default function SettingsPage() {
	const { settings, updateSettings, loading } = useSettings();
	const { user, session } = useAuth();
	const { success, error } = useNotifications();
	const [saving, setSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState("");
	const [showDeleteSection, setShowDeleteSection] = useState(false);
	const router = useRouter();

	const handleSaveSettings = async () => {
		setSaving(true);
		try {
			// Settings are already updated via context
			success("Settings saved successfully!");
		} catch (err) {
			console.error("Failed to save settings:", err);
			error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!user || !session) {
			error("You must be logged in to delete your account");
			return;
		}

		if (confirmDelete.toLowerCase() !== "delete") {
			error("Please type 'DELETE' to confirm account deletion");
			return;
		}

		if (
			!confirm(
				"Are you absolutely sure? This action cannot be undone and will permanently delete all your data.",
			)
		) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/settings/account`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ userId: user.id }),
				},
			);

			if (response.ok) {
				success("Account deleted successfully");
				router.push("/login");
			} else {
				const errorData = await response.json().catch(() => ({}));
				error(
					errorData.message || "Failed to delete account. Please try again.",
				);
			}
		} catch (deleteError) {
			console.error("Failed to delete account:", deleteError);
			error("An error occurred while deleting your account");
		}
	};

	const updateSetting = async (
		section: keyof UserSettings,
		key: string,
		value: any,
	) => {
		if (!settings) return;

		const newSettings = {
			[section]: {
				...settings[section],
				[key]: value,
			},
		};

		await updateSettings(newSettings);

		// Show immediate feedback for certain settings
		if (section === "display" && key === "theme") {
			success(`Theme changed to ${value}`);
		} else if (typeof value === "boolean") {
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			success(`${setting} ${value ? "enabled" : "disabled"}`);
		} else {
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			success(`${setting} updated`);
		}
	};

	// Redirect to login if not authenticated
	if (!user) {
		router.push("/login");
		return null;
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-black">Loading settings...</div>
			</div>
		);
	}

	if (!settings) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-black">Failed to load settings</div>
			</div>
		);
	}

	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-10 border-gray-200 border-b bg-white/80 backdrop-blur">
				<div className="flex items-center p-3 sm:p-4">
					<BackButton fallbackUrl="/home" className="mr-3 sm:mr-4" />
					<h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
						Settings
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white">
				<div className="container mx-auto max-w-4xl px-4 py-6">
					<div className="space-y-6">
						{/* Proximity Notifications */}
						<GeofencingControls />
						
						{/* Danger Zone */}
						<Card className="border border-red-200 bg-white">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Trash2 className="h-5 w-5 text-red-600" />
									<CardTitle className="text-red-600">Danger Zone</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="mb-4 text-gray-600 text-sm">
										Once you delete your account, there is no going back. Please
										be certain.
									</p>

									{!showDeleteSection ? (
										<Button
											variant="outline"
											onClick={() => setShowDeleteSection(true)}
											className="border-red-300 text-red-600 hover:bg-red-50"
										>
											Delete Account
										</Button>
									) : (
										<div className="space-y-4 rounded-lg border border-red-200 p-4">
											<div>
												<Label
													htmlFor="confirmDelete"
													className="font-medium text-black"
												>
													Type "DELETE" to confirm
												</Label>
												<p className="mt-1 mb-2 text-gray-600 text-xs">
													Since you're signed in with Google, type "DELETE" to
													confirm account deletion.
												</p>
												<Input
													id="confirmDelete"
													type="text"
													value={confirmDelete}
													onChange={(e) => setConfirmDelete(e.target.value)}
													placeholder="Type DELETE here"
													className="mt-1 border-red-300 bg-white text-black"
												/>
											</div>
											<div className="flex gap-3">
												<Button
													variant="outline"
													onClick={() => {
														setShowDeleteSection(false);
														setConfirmDelete("");
													}}
													className="border-gray-300"
												>
													Cancel
												</Button>
												<Button
													onClick={handleDeleteAccount}
													className="bg-red-600 text-white hover:bg-red-700"
												>
													Delete Account
												</Button>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
