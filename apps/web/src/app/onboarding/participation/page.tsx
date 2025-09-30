"use client";

import { Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@web/components/ui/button";
import logoImage from "../../../../public/images/logo.png";

type Role = "reporter" | "organiser";

export default function ParticipationPage() {
	const router = useRouter();
	const [role, setRole] = useState<Role | null>(null);

	const cardBase =
		"rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer bg-white hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transform";
	const selected = "border-black shadow-2xl scale-[1.02] bg-gray-50";
	const unselected = "border-gray-300 hover:border-gray-500";

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Logo */}
				<div className="mb-8 animate-fade-in text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-white p-3 shadow-lg transition-transform duration-300 hover:rotate-6">
						<img
							src={logoImage.src}
							alt="Broken Experiences"
							className="h-full w-full object-contain"
						/>
					</div>
					<h1 className="animate-slide-up font-bold text-2xl text-black">
						Choose how you want to participate
					</h1>
					<p className="animation-delay-200 mt-2 animate-slide-up text-gray-600">
						It only takes a minute to start making an impact.
					</p>
				</div>

				<div className="space-y-4">
					<div
						className={`${cardBase} ${role === "reporter" ? selected : unselected} animation-delay-300 group animate-slide-up`}
						onClick={() => setRole("reporter")}
						aria-pressed={role === "reporter"}
					>
						<div className="flex items-start gap-4">
							<div
								className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${role === "reporter" ? "bg-black text-white shadow-lg" : "bg-gray-100 group-hover:bg-gray-200"}`}
							>
								<Globe
									className={`${role === "reporter" ? "text-white" : "text-black"} transition-colors duration-300`}
									size={20}
								/>
							</div>
							<div className="flex-1">
								<div className="mb-2 font-semibold text-black transition-colors duration-300 group-hover:text-gray-800">
									Reporter
								</div>
								<p className="text-gray-600 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
									Spot an issue? Share it with a photo, and description. Help us
									see what's broken.
								</p>
							</div>
							{role === "reporter" && (
								<div className="-top-2 -right-2 absolute flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-black">
									<svg
										className="h-3 w-3 text-white"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							)}
						</div>
					</div>

					<div
						className={`${cardBase} ${role === "organiser" ? selected : unselected} animation-delay-500 group relative animate-slide-up`}
						onClick={() => setRole("organiser")}
						aria-pressed={role === "organiser"}
					>
						<div className="flex items-start gap-4">
							<div
								className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${role === "organiser" ? "bg-black text-white shadow-lg" : "bg-gray-100 group-hover:bg-gray-200"}`}
							>
								<Lock
									className={`${role === "organiser" ? "text-white" : "text-black"} transition-colors duration-300`}
									size={20}
								/>
							</div>
							<div className="flex-1">
								<div className="mb-2 font-semibold text-black transition-colors duration-300 group-hover:text-gray-800">
									Organiser
								</div>
								<p className="text-gray-600 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
									Manage issues across your area. Assign, track, and publish
									impact reports.
								</p>
							</div>
							{role === "organiser" && (
								<div className="-top-2 -right-2 absolute flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-black">
									<svg
										className="h-3 w-3 text-white"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							)}
						</div>
					</div>

					<div className="animation-delay-700 animate-slide-up pt-6">
						<Button
							className="group h-12 w-full transform rounded-xl bg-black font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!role}
							onClick={() => {
								if (!role) return;
								try {
									if (typeof window !== "undefined") {
										window.localStorage.setItem("be.role", role);
									}
								} catch {}
								router.replace("/onboarding/permissions/location");
							}}
						>
							<span className="flex items-center justify-center gap-2">
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
							</span>
						</Button>
					</div>
				</div>

				{/* Footer */}
				<div className="animation-delay-1000 mt-8 animate-fade-in text-center text-gray-500 text-xs">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
