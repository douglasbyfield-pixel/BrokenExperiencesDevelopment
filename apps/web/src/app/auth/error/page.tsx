"use client";

import { Button } from "@web/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-white">
			<div className="mx-auto max-w-md p-6 text-center">
				<div className="mb-6">
					<h1 className="mb-2 font-bold text-2xl text-gray-900">
						Authentication Error
					</h1>
					<p className="text-gray-600">
						Something went wrong during the sign-in process. Please try again.
					</p>
				</div>

				<div className="space-y-4">
					<Link href="/login">
						<Button className="w-full bg-black text-white hover:bg-gray-800">
							Try Again
						</Button>
					</Link>

					<Link href="/home">
						<Button variant="outline" className="w-full">
							Back to Home
						</Button>
					</Link>
				</div>

				<div className="mt-6 text-gray-500 text-sm">
					<p>If this problem persists, please contact support.</p>
				</div>
			</div>
		</div>
	);
}
