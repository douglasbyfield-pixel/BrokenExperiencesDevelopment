"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LocationPermissionPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-sm px-4 py-6">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    aria-label="Back"
                    onClick={() => router.back()}
                    className="h-9 w-9 grid place-items-center rounded-full border"
                >
                    ←
                </button>
                <div />
                <div />
            </div>

            <div className="mt-10 flex flex-col items-center">
                <div className="w-52 h-40 rounded-3xl bg-gray-100 border" />

                <h1 className="mt-8 text-2xl font-semibold text-center">
                    Get matched to jobs
                    <br />
                    closest to you
                </h1>
                <p className="mt-3 text-center text-sm text-gray-600">
                    Allow location access for instant matches with relevant job opportunities in your area
                </p>
            </div>

            <div className="mt-12 space-y-3">
                <Button
                    className="w-full h-12 opacity-60 cursor-not-allowed"
                    disabled
                    type="button"
                >
                    Turn on location services
                </Button>
                <Button
                    className="w-full h-12"
                    variant="outline"
                    type="button"
                    onClick={() => router.replace("/onboarding/permissions/biometrics")}
                >
                    Skip for now
                </Button>
            </div>
        </div>
    );
}


