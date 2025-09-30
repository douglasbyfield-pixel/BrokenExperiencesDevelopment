"use client";

import { useRouter } from "next/navigation";
import { Button } from "@web/components/ui/button";

export default function BiometricsPermissionPage() {
	const router = useRouter();

	return (
		<div className="container mx-auto max-w-sm px-4 py-6">
			<div className="flex items-center justify-between">
				<button
					type="button"
					aria-label="Back"
					onClick={() => router.replace("/onboarding/permissions/location")}
					className="grid h-9 w-9 place-items-center rounded-full border"
				>
					←
				</button>
				<div />
				<div />
			</div>

			<div className="mt-10 flex flex-col items-center">
				<div className="h-40 w-52 rounded-3xl border bg-gray-100" />

				<h1 className="mt-8 text-center font-semibold text-2xl">
					Secure your account
					<br />
					with biometrics
				</h1>
				<p className="mt-3 text-center text-gray-600 text-sm">
					Protect your account with biometrics. You’ll use this to sign in.
				</p>
			</div>

			<div className="mt-12 space-y-3">
				<Button
					className="h-12 w-full cursor-not-allowed opacity-60"
					disabled
					type="button"
				>
					Enable biometrics
				</Button>
				<Button
					className="h-12 w-full"
					variant="outline"
					type="button"
					onClick={() => router.replace("/home")}
				>
					Skip for now
				</Button>
			</div>
		</div>
	);
}
