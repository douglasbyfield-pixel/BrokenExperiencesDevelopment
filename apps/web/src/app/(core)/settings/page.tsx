"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, Bell, Eye, Palette, Globe, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
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
			const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/settings/account`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ confirmPassword: deletePassword }),
			});

			if (response.ok) {
				alert("Account deleted successfully");
				router.push('/login');
			} else {
				alert("Failed to delete account. Please check your password.");
			}
		} catch (error) {
			console.error("Failed to delete account:", error);
			alert("An error occurred while deleting your account");
		}
	};

	const updateSetting = async (section: keyof UserSettings, key: string, value: any) => {
		if (!settings) return;
		
		const newSettings = {
			[section]: {
				...settings[section],
				[key]: value
			}
		};
		
		await updateSettings(newSettings);
		
		// Show immediate feedback for certain settings
		if (section === 'display') {
			if (key === 'theme') {
				toast.success(`${t('settings.theme')} changed to ${t(`theme.${value}`)}`);
			} else if (key === 'language') {
				const langName = value === 'en' ? t('lang.english') : value === 'es' ? t('lang.spanish') : t('lang.french');
				toast.success(`${t('settings.language')} changed to ${langName}`);
			} else if (key === 'mapStyle') {
				toast.success(`${t('settings.mapStyle')} changed to ${value.replace('-', ' ')}`);
			}
		} else if (section === 'notifications') {
			const setting = key.replace(/([A-Z])/g, ' $1').toLowerCase();
			toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
		} else if (section === 'privacy') {
			const setting = key.replace(/([A-Z])/g, ' $1').toLowerCase();
			toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
				<div className="text-black dark:text-white">Loading settings...</div>
			</div>
		);
	}

	if (!settings) {
		return (
			<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
				<div className="text-black dark:text-white">Failed to load settings</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button 
						variant="outline" 
						size="icon"
						onClick={() => router.push('/profile')}
						className="border-gray-300 dark:border-gray-700"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-3xl font-bold text-black dark:text-white">{t('settings.title')}</h1>
				</div>

				<div className="space-y-6">
					{/* Notifications */}
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Bell className="h-5 w-5 text-black dark:text-white" />
								<CardTitle className="text-black dark:text-white">{t('settings.notifications')}</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Email Notifications</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.email}
									onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Push Notifications</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications in browser</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.push}
									onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Issue Updates</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Get notified about updates to your reported issues</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.issueUpdates}
									onChange={(e) => updateSetting('notifications', 'issueUpdates', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Weekly Report</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly summary of community activity</p>
								</div>
								<input
									type="checkbox"
									checked={settings.notifications.weeklyReport}
									onChange={(e) => updateSetting('notifications', 'weeklyReport', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Privacy */}
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Eye className="h-5 w-5 text-black dark:text-white" />
								<CardTitle className="text-black dark:text-white">Privacy</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Show Profile</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to other users</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showProfile}
									onChange={(e) => updateSetting('privacy', 'showProfile', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Show Activity</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Display your activity timeline publicly</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showActivity}
									onChange={(e) => updateSetting('privacy', 'showActivity', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Show Statistics</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Display your contribution statistics</p>
								</div>
								<input
									type="checkbox"
									checked={settings.privacy.showStats}
									onChange={(e) => updateSetting('privacy', 'showStats', e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Display */}
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Palette className="h-5 w-5 text-black dark:text-white" />
								<CardTitle className="text-black dark:text-white">Display</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Theme</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
								</div>
								<select
									value={settings.display.theme}
									onChange={(e) => updateSetting('display', 'theme', e.target.value)}
									className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-black text-black dark:text-white"
								>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
									<option value="system">System</option>
								</select>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-black dark:text-white font-medium">Map Style</Label>
									<p className="text-sm text-gray-600 dark:text-gray-400">Choose map appearance</p>
								</div>
								<select
									value={settings.display.mapStyle}
									onChange={(e) => updateSetting('display', 'mapStyle', e.target.value)}
									className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-black text-black dark:text-white"
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
							className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
						>
							<Save className="h-4 w-4 mr-2" />
							{saving ? 'Saving...' : 'Save Settings'}
						</Button>
					</div>

					{/* Danger Zone */}
					<Card className="border border-red-200 dark:border-red-800 bg-white dark:bg-black shadow-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Trash2 className="h-5 w-5 text-red-600" />
								<CardTitle className="text-red-600">Danger Zone</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
									Once you delete your account, there is no going back. Please be certain.
								</p>
								
								{!showDeleteSection ? (
									<Button 
										variant="outline"
										onClick={() => setShowDeleteSection(true)}
										className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
									>
										Delete Account
									</Button>
								) : (
									<div className="space-y-4 p-4 border border-red-200 dark:border-red-800 rounded-lg">
										<div>
											<Label htmlFor="deletePassword" className="text-black dark:text-white font-medium">
												Enter your password to confirm
											</Label>
											<Input
												id="deletePassword"
												type="password"
												value={deletePassword}
												onChange={(e) => setDeletePassword(e.target.value)}
												placeholder="Your password"
												className="mt-2 text-black dark:text-white bg-white dark:bg-black border-red-300 dark:border-red-700"
											/>
										</div>
										<div className="flex gap-3">
											<Button 
												variant="outline"
												onClick={() => {
													setShowDeleteSection(false);
													setDeletePassword("");
												}}
												className="border-gray-300 dark:border-gray-700"
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