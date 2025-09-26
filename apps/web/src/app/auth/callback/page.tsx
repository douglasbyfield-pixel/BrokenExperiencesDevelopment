"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
	const router = useRouter();
	const [message, setMessage] = useState<string>("Finishing sign in…");

	useEffect(() => {
		const run = async () => {
			try {
				// Implicit flow: session is in URL fragment and auto-parsed by the client
				const { data } = await supabase.auth.getSession();
				if (!data.session) {
					setMessage("No session found. Returning to login…");
					setTimeout(() => router.replace("/login"), 800);
					return;
				}

				// Check if user already completed onboarding (has profile row)
				const userId = data.session.user.id;
				const { data: prof, error: profErr } = await supabase
					.from("user_profiles")
					.select("id")
					.eq("auth_user_id", userId)
					.limit(1)
					.maybeSingle();
				if (!profErr && prof) {
					router.replace("/home");
				} else {
					router.replace("/onboarding/participation");
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
		<div className="flex h-svh flex-col items-center justify-center gap-3">
			<Loader />
			<p className="text-gray-600 text-sm">{message}</p>
		</div>
	);
}
