"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export default function ProfileSetupPage() {
    const router = useRouter();
    const [handle, setHandle] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);

    const canContinue = handle.trim().length >= 3;

    // Load saved draft from localStorage on mount
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const draft = window.localStorage.getItem('be.profile.draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                setHandle(parsed.handle ?? "");
                setDisplayName(parsed.displayName ?? "");
                setBio(parsed.bio ?? "");
            }
        } catch {}
    }, []);

    // Persist draft whenever fields change
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            window.localStorage.setItem(
                'be.profile.draft',
                JSON.stringify({ handle, displayName, bio })
            );
        } catch {}
    }, [handle, displayName, bio]);

    return (
        <div className="container mx-auto max-w-md px-4 py-6">
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} aria-label="Back" className="text-lg">←</button>
                <div className="font-semibold">Set up profile</div>
                <div />
            </div>

            <div className="flex flex-col items-center py-6">
                <div className="h-20 w-20 rounded-full bg-gray-200" />
                <button className="mt-2 text-blue-600 text-sm">Add a photo</button>
            </div>

            <div className="rounded-2xl border p-4 space-y-4 bg-white">
                <div className="space-y-2">
                    <Label htmlFor="handle">Name</Label>
                    <Input
                        id="handle"
                        placeholder="Your name"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                    />
                    <p className={`text-xs ${!canContinue && nameTouched ? 'text-red-500' : 'text-gray-500'}`}>
                        {(!canContinue && nameTouched) ? 'Name is required (min 3 characters).' : 'Enter your name (min 3 characters).'}
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="display">Display name</Label>
                    <Input id="display" placeholder="+ @brokenexperience" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="+ Write bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
            </div>

            <div className="pt-6">
                <Button
                    disabled={!canContinue || saving}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                        setSaving(true);
                        try {
                            const { data: userResp, error: userErr } = await supabase.auth.getUser();
                            if (userErr || !userResp.user) {
                                throw new Error(userErr?.message || "No authenticated user");
                            }
                            const authUserId = userResp.user.id;
                            // Optional: read selected role from previous step
                            let role: 'reporter' | 'organiser' = 'reporter';
                            try {
                                const stored = typeof window !== 'undefined' ? window.localStorage.getItem('be.role') : null;
                                if (stored === 'organiser' || stored === 'reporter') role = stored;
                            } catch {}

                            const nameValue = handle.trim();
                            const display = (displayName.trim() || nameValue);

                            // Upsert into Supabase Postgres
                            const { error: upsertErr } = await supabase
                                .from('user_profiles')
                                .upsert(
                                    {
                                        auth_user_id: authUserId,
                                        handle: nameValue,
                                        display_name: display,
                                        bio: bio.trim() || null,
                                        role,
                                    },
                                    { onConflict: 'auth_user_id' }
                                );
                            if (upsertErr) throw upsertErr;

                            // Also mirror to auth metadata for quick reads (optional)
                            await supabase.auth.updateUser({
                                data: { handle: nameValue, displayName: display, bio: bio.trim(), role },
                            });

                            toast.success('Profile saved');
                            // Clear draft on save
                            try { if (typeof window !== 'undefined') window.localStorage.removeItem('be.profile.draft'); } catch {}
                            router.replace('/onboarding/permissions/notifications');
                        } catch (e: any) {
                            const msg = e?.message || 'Failed to save profile';
                            toast.error(msg);
                        } finally {
                            setSaving(false);
                        }
                    }}
                >
                    {saving ? 'Saving...' : 'Next'}
                </Button>
                {!canContinue ? (
                    <p className="mt-2 text-center text-xs text-gray-500">Enter your name to continue</p>
                ) : null}
            </div>
        </div>
    );
}


