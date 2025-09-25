"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(true);
	const router = useRouter();

	return (
		<div className="min-h-screen bg-white flex items-center justify-center">
			<div className="w-full max-w-md mx-auto px-6">
				{/* Logo */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-black rounded-2xl flex items-center justify-center p-3">
						<img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
					</div>
					<h1 className="text-2xl font-bold text-black">Broken Experiences</h1>
					<p className="text-sm text-gray-600 mt-1">Share and discover experiences</p>
				</div>

				{/* Auth Forms */}
				{showSignIn ? (
					<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
				) : (
					<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
				)}
				
				{/* Demo button */}
				<div className="mt-6 pt-6 border-t border-gray-200">
					<Button 
						variant="outline" 
						className="w-full"
						onClick={() => router.push('/home')}
					>
						Continue as Demo User (No Sign In)
					</Button>
				</div>
				
				{/* Footer */}
				<div className="mt-8 text-center text-xs text-gray-500">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
