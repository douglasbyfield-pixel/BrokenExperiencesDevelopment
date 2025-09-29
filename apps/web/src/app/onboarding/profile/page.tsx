"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase-client";

export default function ProfileSetupPage() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [handle, setHandle] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [saving, setSaving] = useState(false);
	const [nameTouched, setNameTouched] = useState(false);
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const canContinue = handle.trim().length >= 3;

	// Load saved draft from localStorage on mount
	useEffect(() => {
		try {
			if (typeof window === "undefined") return;
			const draft = window.localStorage.getItem("be.profile.draft");
			if (draft) {
				const parsed = JSON.parse(draft);
				setHandle(parsed.handle ?? "");
				setDisplayName(parsed.displayName ?? "");
				setBio(parsed.bio ?? "");
			}
		} catch {}
	}, []);

	// Persist draft whenever fields change
	useEffect(() => {
		try {
			if (typeof window === "undefined") return;
			window.localStorage.setItem(
				"be.profile.draft",
				JSON.stringify({ handle, displayName, bio }),
			);
		} catch {}
	}, [handle, displayName, bio]);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				toast.error("Image must be smaller than 5MB");
				return;
			}

			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			setProfileImage(file);

			// Create preview
			const reader = new FileReader();
			reader.onload = () => setImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const uploadProfileImage = async (userId: string): Promise<string | null> => {
		if (!profileImage) return null;

		setUploading(true);
		try {
			const fileExt = profileImage.name.split(".").pop();
			const fileName = `${userId}-${Date.now()}.${fileExt}`;

			const { error: uploadError } = await supabase.storage
				.from("profile-images")
				.upload(fileName, profileImage);

			if (uploadError) throw uploadError;

			const { data } = supabase.storage
				.from("profile-images")
				.getPublicUrl(fileName);

			return data.publicUrl;
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload image");
			return null;
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Header */}
				<div className="mb-12 flex animate-fade-in items-center justify-between">
					<button
						onClick={() => router.back()}
						aria-label="Back"
						className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-300 transition-all duration-200 hover:scale-105 hover:border-black hover:shadow-md"
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
					<div className="font-bold text-black text-xl">Set up profile</div>
					<div className="w-10" />
				</div>

				{/* Profile Photo */}
				<div className="animation-delay-200 mb-8 flex animate-slide-up flex-col items-center">
					<div className="group relative">
						<div
							className={`h-24 w-24 cursor-pointer rounded-full border-2 transition-all duration-300 group-hover:scale-105 ${
								imagePreview
									? "border-black"
									: "border-gray-300 bg-gray-100 group-hover:border-gray-400"
							}`}
							onClick={() => fileInputRef.current?.click()}
						>
							{imagePreview ? (
								<img
									src={imagePreview}
									alt="Profile preview"
									className="h-full w-full rounded-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 transition-colors duration-300 group-hover:bg-gray-200">
									<Camera className="h-8 w-8 text-gray-400 transition-colors duration-300 group-hover:text-gray-600" />
								</div>
							)}
						</div>
						{uploading && (
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-20">
								<svg
									className="h-6 w-6 animate-spin text-white"
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
							</div>
						)}
					</div>
					<button
						onClick={() => fileInputRef.current?.click()}
						className="mt-3 transform font-medium text-black text-sm underline transition-colors duration-200 hover:scale-105 hover:text-gray-700"
					>
						{imagePreview ? "Change photo" : "Add a photo"}
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						className="hidden"
					/>
				</div>

				{/* Form */}
				<div className="animation-delay-300 animate-slide-up space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 transition-all duration-300 hover:shadow-lg">
					<div className="group space-y-2">
						<Label
							htmlFor="handle"
							className="flex items-center gap-2 font-medium text-black text-sm"
						>
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							Name
						</Label>
						<Input
							id="handle"
							placeholder="Your name"
							value={handle}
							onChange={(e) => setHandle(e.target.value)}
							onBlur={() => setNameTouched(true)}
							className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 transition-all duration-200 hover:border-gray-400 focus:border-black focus:ring-2 focus:ring-black"
						/>
						<p
							className={`text-xs transition-colors duration-200 ${!canContinue && nameTouched ? "text-red-500" : "text-gray-600"}`}
						>
							{!canContinue && nameTouched
								? "Name is required (min 3 characters)."
								: "Enter your name (min 3 characters)."}
						</p>
					</div>
					<div className="group space-y-2">
						<Label
							htmlFor="display"
							className="flex items-center gap-2 font-medium text-black text-sm"
						>
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
								/>
							</svg>
							Display name
						</Label>
						<Input
							id="display"
							placeholder="@brokenexperience"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 transition-all duration-200 hover:border-gray-400 focus:border-black focus:ring-2 focus:ring-black"
						/>
					</div>
					<div className="group space-y-2">
						<Label
							htmlFor="bio"
							className="flex items-center gap-2 font-medium text-black text-sm"
						>
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Bio
						</Label>
						<Input
							id="bio"
							placeholder="Write a short bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 transition-all duration-200 hover:border-gray-400 focus:border-black focus:ring-2 focus:ring-black"
						/>
					</div>
				</div>

				<div className="animation-delay-500 animate-slide-up pt-6">
					<Button
						disabled={!canContinue || saving}
						className="group h-12 w-full transform rounded-xl bg-black font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
						onClick={async () => {
							setSaving(true);
							try {
								const { data: userResp, error: userErr } =
									await supabase.auth.getUser();
								if (userErr || !userResp.user) {
									throw new Error(userErr?.message || "No authenticated user");
								}
								const authUserId = userResp.user.id;

								// Upload profile image if selected
								let profileImageUrl: string | null = null;
								if (profileImage) {
									profileImageUrl = await uploadProfileImage(authUserId);
								}

								// Optional: read selected role from previous step
								let role: "reporter" | "organiser" = "reporter";
								try {
									const stored =
										typeof window !== "undefined"
											? window.localStorage.getItem("be.role")
											: null;
									if (stored === "organiser" || stored === "reporter")
										role = stored;
								} catch {}

								const nameValue = handle.trim();
								const display = displayName.trim() || nameValue;

								// Upsert into Supabase Postgres
								const { error: upsertErr } = await supabase
									.from("user_profiles")
									.upsert(
										{
											auth_user_id: authUserId,
											handle: nameValue,
											display_name: display,
											bio: bio.trim() || null,
											avatar_url: profileImageUrl,
											role,
										},
										{ onConflict: "auth_user_id" },
									);
								if (upsertErr) throw upsertErr;

								// Also mirror to auth metadata for quick reads (optional)
								await supabase.auth.updateUser({
									data: {
										handle: nameValue,
										displayName: display,
										bio: bio.trim(),
										avatar_url: profileImageUrl,
										role,
									},
								});

								toast.success("Profile saved");
								// Clear draft on save
								try {
									if (typeof window !== "undefined")
										window.localStorage.removeItem("be.profile.draft");
								} catch {}
								router.replace("/onboarding/permissions/notifications");
							} catch (e: any) {
								const msg = e?.message || "Failed to save profile";
								toast.error(msg);
							} finally {
								setSaving(false);
							}
						}}
					>
						<span className="flex items-center justify-center gap-2">
							{saving ? (
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
									Saving...
								</>
							) : (
								<>
									Next
									<svg
										className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 7l5 5m0 0l-5 5m5-5H6"
										/>
									</svg>
								</>
							)}
						</span>
					</Button>
					{!canContinue ? (
						<p className="mt-3 animate-fade-in text-center text-gray-600 text-sm">
							Enter your name to continue
						</p>
					) : null}
				</div>

				{/* Footer */}
				<div className="animation-delay-700 mt-8 animate-fade-in text-center text-gray-500 text-xs">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
