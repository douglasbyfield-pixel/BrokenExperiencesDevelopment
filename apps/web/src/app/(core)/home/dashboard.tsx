"use client";
import { Button } from "@/components/ui/button";
import { useSupabaseSession } from "@/lib/use-supabase-session";
import { supabase } from "@/lib/supabase-client";

export default function Dashboard() {
    const { user, loading } = useSupabaseSession();

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="p-4">
            <p className="mb-2">Welcome {user.email}</p>
            <Button
                variant="destructive"
                onClick={() => {
                    supabase.auth.signOut();
                }}
            >
                Sign out
            </Button>
        </div>
    );
}
