"use client";

import { useAuth } from "@web/components/auth-provider";
import GoogleLogo from "@web/components/icons/google-logo";
import { Button } from "@web/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
	const { signIn, user, isLoading } = useAuth();
	const router = useRouter();

	// Redirect authenticated users to home
	useEffect(() => {
		if (!isLoading && user) {
			router.push("/home");
		}
	}, [user, isLoading, router]);

	// Show loading state while checking auth or redirecting
	if (isLoading || user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Logo & Header */}
				<div className="mb-12 text-center">
					<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-gray-200 bg-white shadow-lg">
						<img
							src="/images/logo.png"
							alt="Broken Experiences"
							className="h-16 w-16 object-contain"
						/>
					</div>
					<h1 className="mb-2 font-bold text-3xl text-black">
						Broken Experiences
					</h1>
					<p className="text-base text-gray-600">
						Share and discover experiences worldwide
					</p>
				</div>

				{/* Sign In Card */}
				<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
					<div className="mb-6 text-center">
						<h2 className="mb-2 font-bold text-black text-xl">Welcome</h2>
						<p className="text-gray-500 text-sm">Sign in to get started</p>
					</div>

					<Button
						variant="outline"
						className="h-14 w-full justify-center rounded-xl border-2 border-gray-200 font-medium text-black shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-black hover:shadow-md"
						onClick={async () => {
							try {
								await signIn("google");
							} catch (error: any) {
								toast.error(error.message || "Sign in failed");
							}
						}}
					>
						<GoogleLogo className="mr-3 h-5 w-5" />
						Continue with Google
					</Button>

					<p className="mt-6 text-center text-gray-400 text-xs">
						By continuing, you agree to our Terms of Service and Privacy Policy
					</p>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center text-gray-400 text-xs">
					<p>© 2025 Broken Experiences · All rights reserved</p>
				</div>
			</div>
		</div>
	);
}
