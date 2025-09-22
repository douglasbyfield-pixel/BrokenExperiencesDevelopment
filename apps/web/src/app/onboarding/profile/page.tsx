"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

    const canContinue = handle.trim().length >= 3;

    return (
        <div className="container mx-auto max-w-md px-4 py-6">
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} aria-label="Back" className="text-lg">←</button>
                <div className="font-semibold">Set up profile</div>
                <button onClick={() => router.replace('/home')} className="text-sm text-gray-600">Skip</button>
            </div>

            <div className="flex flex-col items-center py-6">
                <div className="h-20 w-20 rounded-full bg-gray-200" />
                <button className="mt-2 text-blue-600 text-sm">Add a photo</button>
            </div>

            <div className="rounded-2xl border p-4 space-y-4 bg-white">
                <div className="space-y-2">
                    <Label htmlFor="handle">Name</Label>
                    <Input id="handle" placeholder="@brokenexperience" value={handle} onChange={(e) => setHandle(e.target.value)} />
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
                        const { error } = await supabase.auth.updateUser({
                            data: { handle, displayName, bio },
                        });
                        setSaving(false);
                        if (error) {
                            toast.error(error.message);
                            return;
                        }
                        toast.success('Profile saved');
                        router.replace('/home');
                    }}
                >
                    {saving ? 'Saving...' : 'Next'}
                </Button>
            </div>
        </div>
    );
}


