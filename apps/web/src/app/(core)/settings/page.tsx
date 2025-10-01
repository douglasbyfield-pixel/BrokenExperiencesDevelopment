"use client";

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
import { ArrowLeft, Bell, Eye, Palette, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserSettings {
	notifications: {
		email: boolean;
		push: boolean;
		issueUpdates: boolean;
		weeklyReport: boolean;
	};
	privacy: {
		showProfile: boolean;
		showActivity: boolean;
		showStats: boolean;
	};
	display: {
		theme: "light" | "dark" | "system";
		language: string;
		mapStyle: string;
	};
}

export default function SettingsPage() {
	const { settings, updateSettings, loading } = useSettings();
	const [saving, setSaving] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [showDeleteSection, setShowDeleteSection] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const router = useRouter();

	const handleSaveSettings = async () => {
		setSaving(true);
		try {
			// Settings are already updated via context
			toast.success("Settings saved successfully!");
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!deletePassword.trim()) {
			alert("Please enter your password to delete your account");
			return;
		}

		if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/settings/account`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ confirmPassword: deletePassword }),
				},
			);

			if (response.ok) {
				alert("Account deleted successfully");
				router.push("/login");
			} else {
				alert("Failed to delete account. Please check your password.");
			}
		} catch (error) {
			console.error("Failed to delete account:", error);
			alert("An error occurred while deleting your account");
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
		if (section === "display") {
			if (key === "theme") {
				toast.success(`Settings Theme changed to ${value}`);
			}
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
		} else {
			const setting = key.replace(/([A-Z])/g, " $1").toLowerCase();
			toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
		}
	};

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
		<div className="min-h-screen bg-white">
			<div className="container mx-auto max-w-4xl px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => router.push("/profile")}
						className="border-gray-300"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="font-bold text-3xl text-black">
						Settings
					</h1>
				</div>

				<div className="space-y-6">
					{/* Notifications */}
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
										Email Notifications
									</Label>
									<p className="text-gray-600 text-sm">
										Receive notifications via email
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.email}
									onChange={(e) =>
										updateSetting("notifications", "email", e.target.checked)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Push Notifications
									</Label>
									<p className="text-gray-600 text-sm">
										Receive push notifications in browser
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
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Issue Updates
									</Label>
									<p className="text-gray-600 text-sm">
										Get notified about updates to your reported issues
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.issueUpdates}
									onChange={(e) =>
										updateSetting(
											"notifications",
											"issueUpdates",
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Weekly Report
									</Label>
									<p className="text-gray-600 text-sm">
										Receive weekly summary of community activity
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.weeklyReport}
									onChange={(e) =>
										updateSetting(
											"notifications",
											"weeklyReport",
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Privacy */}
					<Card className="border border-gray-200 bg-white shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Eye className="h-5 w-5 text-black" />
								<CardTitle className="text-black">
									Privacy
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Show Profile
									</Label>
									<p className="text-gray-600 text-sm">
										Make your profile visible to other users
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showProfile}
									onChange={(e) =>
										updateSetting("privacy", "showProfile", e.target.checked)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Show Activity
									</Label>
									<p className="text-gray-600 text-sm">
										Display your activity timeline publicly
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showActivity}
									onChange={(e) =>
										updateSetting("privacy", "showActivity", e.target.checked)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Show Statistics
									</Label>
									<p className="text-gray-600 text-sm">
										Display your contribution statistics
									</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showStats}
									onChange={(e) =>
										updateSetting("privacy", "showStats", e.target.checked)
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Display */}
					<Card className="border border-gray-200 bg-white shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Palette className="h-5 w-5 text-black" />
								<CardTitle className="text-black">
									Display
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Theme
									</Label>
									<p className="text-gray-600 text-sm">
										Choose your preferred theme
									</p>
								</div>
								<select
									value={settings.display.theme}
									onChange={(e) =>
										updateSetting("display", "theme", e.target.value)
									}
									className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
								>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
									<option value="system">System</option>
								</select>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="font-medium text-black">
										Map Style
									</Label>
									<p className="text-gray-600 text-sm">
										Choose map appearance
									</p>
								</div>
								<select
									value={settings.display.mapStyle}
									onChange={(e) =>
										updateSetting("display", "mapStyle", e.target.value)
									}
									className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
								>
									<option value="streets-v12">Streets</option>
									<option value="satellite-v9">Satellite</option>
									<option value="outdoors-v12">Outdoors</option>
								</select>
							</div>
						</CardContent>
					</Card>

					{/* Save Button */}
					<div className="flex justify-end">
						<Button
							onClick={handleSaveSettings}
							disabled={saving}
							className="bg-black text-white hover:bg-gray-800"
						>
							<Save className="mr-2 h-4 w-4" />
							{saving ? "Saving..." : "Save Settings"}
						</Button>
					</div>

					{/* Danger Zone */}
					<Card className="border border-red-200 bg-white shadow-sm">
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
											/>
										</div>
										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setShowDeleteSection(false);
													setDeletePassword("");
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
	);
}
