"use client";

import { useState } from "react";
import SignInForm from "./features/sign-in-form";
import SignUpForm from "./features/sign-up-form";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="flex min-h-screen items-center justify-center bg-white">
			<div className="mx-auto w-full max-w-md px-6">
				{/* Logo */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-black bg-white p-3">
					<img
						src="/images/logo.png"
						alt="Broken Experiences"
						className="h-full w-full object-contain"
					/>
					</div>
					<h1 className="font-bold text-2xl text-black">Broken Experiences</h1>
					<p className="mt-1 text-gray-600 text-sm">
						Share and discover experiences
					</p>
				</div>

				{/* Auth Forms */}
				{showSignIn ? (
					<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
				) : (
					<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
				)}


				{/* Footer */}
				<div className="mt-8 text-center text-gray-500 text-xs">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
