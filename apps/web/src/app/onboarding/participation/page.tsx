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
        "rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer bg-white hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transform";
    const selected = "border-black shadow-2xl scale-[1.02] bg-gray-50";
    const unselected = "border-gray-300 hover:border-gray-500";

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-6">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-black rounded-2xl flex items-center justify-center p-3 hover:rotate-6 transition-transform duration-300 shadow-lg">
                        <img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-black animate-slide-up">Choose how you want to participate</h1>
                    <p className="text-gray-600 mt-2 animate-slide-up animation-delay-200">It only takes a minute to start making an impact.</p>
                </div>

                <div className="space-y-4">
                    <div
                        className={`${cardBase} ${role === "reporter" ? selected : unselected} animate-slide-up animation-delay-300 group`}
                        onClick={() => setRole("reporter")}
                        aria-pressed={role === "reporter"}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${role === "reporter" ? "bg-black text-white shadow-lg" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                                <Globe className={`${role === "reporter" ? "text-white" : "text-black"} transition-colors duration-300`} size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-black mb-2 group-hover:text-gray-800 transition-colors duration-300">Reporter</div>
                                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                    Spot an issue? Share it with a photo, and description. Help us see what's broken.
                                </p>
                            </div>
                            {role === "reporter" && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={`${cardBase} ${role === "organiser" ? selected : unselected} animate-slide-up animation-delay-500 group relative`}
                        onClick={() => setRole("organiser")}
                        aria-pressed={role === "organiser"}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${role === "organiser" ? "bg-black text-white shadow-lg" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                                <Lock className={`${role === "organiser" ? "text-white" : "text-black"} transition-colors duration-300`} size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-black mb-2 group-hover:text-gray-800 transition-colors duration-300">Organiser</div>
                                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                    Manage issues across your area. Assign, track, and publish impact reports.
                                </p>
                            </div>
                            {role === "organiser" && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 animate-slide-up animation-delay-700">
                        <Button
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transform group"
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
                            <span className="flex items-center justify-center gap-2">
                                Next
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in animation-delay-1000">
                    <p>© 2025 Broken Experiences. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}


