"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Loader from "@/components/loader";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const run = async () => {
            try {
                const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                if (error) {
                    // If exchange fails, send back to login
                    router.replace("/login");
                    return;
                }
                router.replace("/onboarding/participation");
            } catch {
                router.replace("/login");
            }
        };
        run();
    }, [router]);

    return <Loader />;
}


