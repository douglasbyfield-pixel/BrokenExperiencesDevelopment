"use client";

import { Button } from "@web/components/ui/button";
import { BackButton } from "@web/components/ui/back-button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { useSettings } from "@web/context/SettingsContext";
import { useAuth } from "@web/components/auth-provider";
<<<<<<< HEAD
import { Bell, Eye, Palette, Save, Trash2 } from "lucide-react";
=======
import { Trash2 } from "lucide-react";
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserSettings {
<<<<<<< HEAD
	notifications: {
		email: boolean;
		push: boolean;
		issueUpdates: boolean;
	};
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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
	const [saving, setSaving] = useState(false);
<<<<<<< HEAD
	const [deletePassword, setDeletePassword] = useState("");
=======
	const [confirmDelete, setConfirmDelete] = useState("");
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	const [showDeleteSection, setShowDeleteSection] = useState(false);
	const router = useRouter();

	const handleSaveSettings = async () => {
		setSaving(true);
		try {
			// Settings are already updated via context
			toast.success("Settings saved successfully!");
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!user || !session) {
			toast.error("You must be logged in to delete your account");
			return;
		}

<<<<<<< HEAD
		if (!deletePassword.trim()) {
			toast.error("Please enter your password to delete your account");
			return;
		}

		if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
=======
		if (confirmDelete.toLowerCase() !== "delete") {
			toast.error("Please type 'DELETE' to confirm account deletion");
			return;
		}

		if (!confirm("Are you absolutely sure? This action cannot be undone and will permanently delete all your data.")) {
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/settings/account`,
				{
					method: "DELETE",
					headers: {
						'Authorization': `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
<<<<<<< HEAD
					body: JSON.stringify({ confirmPassword: deletePassword }),
=======
					body: JSON.stringify({ userId: user.id }),
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
				},
			);

			if (response.ok) {
				toast.success("Account deleted successfully");
				router.push("/login");
			} else {
				const errorData = await response.json().catch(() => ({}));
<<<<<<< HEAD
				toast.error(errorData.message || "Failed to delete account. Please check your password.");
=======
				toast.error(errorData.message || "Failed to delete account. Please try again.");
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
			}
		} catch (error) {
			console.error("Failed to delete account:", error);
			toast.error("An error occurred while deleting your account");
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
			toast.success(`Theme changed to ${value}`);
		} else if (typeof value === "boolean") {
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
		} else {
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			toast.success(`${setting} updated`);
		}
	};

	// Redirect to login if not authenticated
	if (!user) {
		router.push('/login');
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
				<div className="text-black">
					Failed to load settings
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
				<div className="flex items-center p-3 sm:p-4">
					<BackButton fallbackUrl="/home" className="mr-3 sm:mr-4" />
					<h1 className="text-lg sm:text-xl font-semibold text-gray-900">Settings</h1>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white">
				<div className="container mx-auto max-w-4xl px-4 py-6">

				<div className="space-y-6">
<<<<<<< HEAD
					{/* Push Notifications */}
					<Card className="border border-gray-200 bg-white shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Bell className="h-5 w-5 text-black" />
								<CardTitle className="text-black">
									Notifications
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Push Notifications
									</Label>
									<p className="text-gray-600 text-sm">
										Receive push notifications about new reports in your area
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.push}
									onChange={(e) =>
										updateSetting("notifications", "push", e.target.checked)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Danger Zone */}
					<Card className="border border-red-200 bg-white shadow-sm">
=======

					{/* Danger Zone */}
					<Card className="border border-red-200 bg-white">
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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
<<<<<<< HEAD
												htmlFor="deletePassword"
												className="font-medium text-black"
											>
												Enter your password to confirm
											</Label>
											<Input
												id="deletePassword"
												type="password"
												value={deletePassword}
												onChange={(e) => setDeletePassword(e.target.value)}
												placeholder="Your password"
												className="mt-2 border-red-300 bg-white text-black"
=======
												htmlFor="confirmDelete"
												className="font-medium text-black"
											>
												Type "DELETE" to confirm
											</Label>
											<p className="text-gray-600 text-xs mt-1 mb-2">
												Since you're signed in with Google, type "DELETE" to confirm account deletion.
											</p>
											<Input
												id="confirmDelete"
												type="text"
												value={confirmDelete}
												onChange={(e) => setConfirmDelete(e.target.value)}
												placeholder="Type DELETE here"
												className="mt-1 border-red-300 bg-white text-black"
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
											/>
										</div>
										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setShowDeleteSection(false);
<<<<<<< HEAD
													setDeletePassword("");
=======
													setConfirmDelete("");
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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
