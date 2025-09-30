"use client";

import { Button } from "@web/components/ui/button";
import { authClient } from "@web/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function MobileNav() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<>
			{/* Mobile Header */}
			<div className="sticky top-0 z-50 lg:hidden bg-white border-b border-gray-200">
				<div className="flex items-center justify-between p-4">
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="p-2 rounded-lg hover:bg-gray-100"
					>
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					<div className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white p-1">
							<img
								src="/images/logo.png"
								alt="Broken Experiences"
								className="h-full w-full object-contain"
							/>
						</div>
						<h1 className="font-bold text-lg text-black">
							Broken<span className="text-gray-600">Experiences</span>
						</h1>
					</div>
					<Link href="/search" className="p-2 rounded-lg hover:bg-gray-100">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</Link>
				</div>
			</div>

			{/* Mobile Menu Overlay */}
			{isMenuOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
					<div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
						<div className="p-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="font-bold text-xl text-black">Menu</h2>
								<button
									onClick={() => setIsMenuOpen(false)}
									className="p-2 rounded-lg hover:bg-gray-100"
								>
									<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
						<nav className="p-4 space-y-2">
							<Link
								href="/home"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
								</svg>
								<span className="font-medium">Home</span>
							</Link>
							<Link
								href="/map"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
								</svg>
								<span className="font-medium">Map</span>
							</Link>
							<Link
								href="/profile"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								<span className="font-medium">Profile</span>
							</Link>
							<Button
								variant="ghost"
								onClick={async () => {
									await authClient.signOut();
									setIsMenuOpen(false);
									window.location.href = "/login";
								}}
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-red-600 hover:bg-red-50 transition-colors w-full justify-start"
							>
								<LogOut className="w-6 h-6" />
								<span className="font-medium">Sign Out</span>
							</Button>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}