"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // When arriving from the email link, Supabase will have a recovery session.
        // If not present, we can still try to submit; Supabase will validate the token from URL.
        void supabase.auth.getSession();
    }, []);

    const canSubmit = password.length >= 8 && password === confirm && !loading;

    return (
        <div className="container mx-auto max-w-md px-4 py-10">
            <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
            <p className="text-sm text-gray-600 mb-6">Enter your new password below.</p>
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>
                <Button
                    disabled={!canSubmit}
                    onClick={async () => {
                        setLoading(true);
                        const { error } = await supabase.auth.updateUser({ password });
                        setLoading(false);
                        if (error) return toast.error(error.message);
                        toast.success("Password updated. You can now sign in.");
                        router.replace("/login");
                    }}
                >
                    {loading ? "Updating..." : "Update password"}
                </Button>
            </div>
        </div>
    );
}


