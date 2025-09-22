"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get("email") ?? "";
    const [email, setEmail] = useState<string>(emailFromQuery);
    const [resending, setResending] = useState(false);
    const [justResent, setJustResent] = useState(false);

    useEffect(() => {
        // If user completes email confirmation, Supabase will sign them in and
        // we'll see an auth state change → redirect to /home.
        const sub = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                router.replace("/home");
            }
        });

        // Also check current session in case email confirmation is disabled.
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                router.replace("/home");
            }
        });

        return () => {
            sub.data.subscription.unsubscribe();
        };
    }, [router]);

    const canResend = useMemo(() => {
        return email.length > 3 && email.includes("@");
    }, [email]);

    return (
        <div className="container mx-auto max-w-md px-4 py-10">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-semibold">Verify your email</h1>
                <p className="text-muted-foreground">
                    We sent a verification link to your email. Please click the link to
                    complete your registration.
                </p>
                <div className="flex justify-center py-6">
                    <Loader />
                </div>
                <div className="space-y-2">
                    <p className="text-sm">Didn&apos;t get the email? You can resend it.</p>
                    <div className="flex gap-2 justify-center">
                        <input
                            type="email"
                            className="border rounded px-3 py-2 w-64"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            disabled={!canResend || resending}
                            onClick={async () => {
                                if (!canResend) return;
                                setResending(true);
                                setJustResent(false);
                                const { error } = await supabase.auth.resend({
                                    type: "signup",
                                    email,
                                });
                                setResending(false);
                                if (!error) {
                                    setJustResent(true);
                                }
                            }}
                        >
                            {resending ? "Resending..." : "Resend email"}
                        </Button>
                    </div>
                    {justResent ? (
                        <p className="text-xs text-green-600">Verification email sent.</p>
                    ) : null}
                </div>
                <div className="pt-4 text-xs text-muted-foreground">
                    After confirming, you&apos;ll be redirected automatically.
                </div>
            </div>
        </div>
    );
}


