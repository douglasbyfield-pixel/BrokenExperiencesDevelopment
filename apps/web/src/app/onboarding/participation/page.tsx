"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "reporter" | "organiser";

export default function ParticipationPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role | null>(null);

    const cardBase =
        "rounded-2xl border p-4 md:p-5 transition-colors cursor-pointer bg-white";
    const selected = "border-black shadow-sm";
    const unselected = "border-gray-300";

    return (
        <div className="container mx-auto max-w-md px-4 py-6">
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold leading-tight">
                    Choose how you want to participate
                </h1>
                <p className="text-sm text-gray-600">
                    It only takes a minute to start making an impact.
                </p>

                <div
                    className={`${cardBase} ${role === "reporter" ? selected : unselected}`}
                    onClick={() => setRole("reporter")}
                    aria-pressed={role === "reporter"}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <div className="font-semibold">Reporter</div>
                            <p className="mt-2 text-sm text-gray-700">
                                Spot an issue? Share it with a photo, and description. Help us see
                                what’s broken.
                            </p>
                        </div>
                        <Globe className="text-black" size={18} />
                    </div>
                </div>

                <div
                    className={`${cardBase} ${role === "organiser" ? selected : unselected}`}
                    onClick={() => setRole("organiser")}
                    aria-pressed={role === "organiser"}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <div className="font-semibold">Organiser</div>
                            <p className="mt-2 text-sm text-gray-700">
                                Manage issues across your area. Assign, track, and publish impact
                                reports.
                            </p>
                        </div>
                        <Lock className="text-black" size={18} />
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                        disabled={!role}
                        onClick={() => {
                            if (!role) return;
                            try {
                                if (typeof window !== "undefined") {
                                    window.localStorage.setItem("be.role", role);
                                }
                            } catch {}
                            router.replace("/onboarding/profile");
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}


