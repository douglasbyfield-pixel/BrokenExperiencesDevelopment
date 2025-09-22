"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Loader from "@/components/loader";
import { toast } from "sonner";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [message, setMessage] = useState<string>("Finishing sign in…");

    useEffect(() => {
        const run = async () => {
            try {
                // Implicit flow: session is in URL fragment and auto-parsed by the client
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    router.replace("/onboarding/participation");
                } else {
                    setMessage("No session found. Returning to login…");
                    setTimeout(() => router.replace("/login"), 800);
                }
            } catch (e) {
                console.error(e);
                toast.error("Unexpected error during sign in");
                setMessage("Unexpected error. Returning to login…");
                setTimeout(() => router.replace("/login"), 800);
            }
        };
        run();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-svh gap-3">
            <Loader />
            <p className="text-sm text-gray-600">{message}</p>
        </div>
    );
}


