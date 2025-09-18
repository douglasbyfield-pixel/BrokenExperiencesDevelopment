"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState } from "react";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="min-h-screen bg-white flex flex-col lg:flex-row">
			{/* Left side - Branding (hidden on mobile, visible on desktop) */}
			<div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-center items-center p-12 text-white">
				<div className="max-w-md text-center">
					<div className="w-24 h-24 mx-auto mb-8 bg-white rounded-3xl flex items-center justify-center p-4">
						<img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
					</div>
					<h1 className="text-4xl font-bold mb-4">Welcome to Broken Experiences</h1>
					<p className="text-xl text-gray-300 leading-relaxed">
						Share your stories, discover new perspectives, and connect with others through authentic experiences.
					</p>
					<div className="mt-12 space-y-4 text-left">
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-white rounded-full"></div>
							<span className="text-gray-300">Share authentic experiences</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-white rounded-full"></div>
							<span className="text-gray-300">Connect with community</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-white rounded-full"></div>
							<span className="text-gray-300">Discover new perspectives</span>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Auth forms */}
			<div className="flex-1 lg:w-1/2 flex flex-col">
				{/* Mobile Header with Logo */}
				<div className="flex-shrink-0 pt-8 pb-6 px-6 lg:hidden">
					<div className="flex justify-center">
						<div className="text-center">
							<div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-black rounded-2xl flex items-center justify-center p-3">
								<img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
							</div>
							<h1 className="text-2xl font-bold text-black">Broken Experiences</h1>
							<p className="text-sm text-gray-600 mt-1">Share and discover experiences</p>
						</div>
					</div>
				</div>

				{/* Desktop Header */}
				<div className="hidden lg:block flex-shrink-0 pt-12 pb-8 px-12">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center p-2">
							<img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
						</div>
						<span className="text-xl font-bold text-black">Broken Experiences</span>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex flex-col justify-center px-6 lg:px-12 pb-8">
					<div className="w-full max-w-sm mx-auto lg:mx-0 lg:max-w-md">
						{showSignIn ? (
							<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
						) : (
							<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex-shrink-0 pb-6 px-6 lg:px-12">
					<div className="text-center lg:text-left text-xs text-gray-500">
						<p>© 2025 Broken Experiences. All rights reserved.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
