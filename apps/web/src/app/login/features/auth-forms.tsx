"use client";

import { Button } from "@web/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";

export default function AuthForms() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="flex flex-1 flex-col lg:w-1/2">
			<div className="flex-shrink-0 px-6 pt-8 pb-6 lg:hidden">
				<div className="flex justify-center">
					<div className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-white p-3">
							<img
								src="/favicon/be-logoimage.png"
								alt="Broken Experiences"
								className="h-full w-full object-contain"
							/>
						</div>
						<h1 className="font-bold text-2xl text-black">
							Broken Experiences
						</h1>
						<p className="mt-1 text-gray-600 text-sm">
							Share and discover experiences
						</p>
					</div>
				</div>
			</div>

			{/* Desktop Header */}
			<div className="hidden flex-shrink-0 px-12 pt-12 pb-8 lg:block">
				<div className="flex items-center space-x-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white p-2">
						<img
							src="/favicon/be-logoimage.png"
							alt="Broken Experiences"
							className="h-full w-full object-contain"
						/>
					</div>
					<span className="font-bold text-black text-xl">
						Broken Experiences
					</span>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col justify-center px-6 pb-8 lg:px-12">
				<div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
					{showSignIn ? (
						<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
					) : (
						<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
					)}

					{/* Demo button */}
					<div className="mt-6 border-gray-200 border-t pt-6">
						<Button variant="outline" className="w-full" asChild>
							<Link href="/home">Continue as Demo User (No Sign In)</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="flex-shrink-0 px-6 pb-6 lg:px-12">
				<div className="text-center text-gray-500 text-xs lg:text-left">
					<p>© 2025 Broken Experiences. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
