"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";
import { useSupabaseSession } from "@/lib/use-supabase-session";

export default function RootRedirect() {
	const router = useRouter();
	const { user, loading } = useSupabaseSession();

	useEffect(() => {
		if (loading) return;
		if (user) router.replace("/home");
		else router.replace("/login");
	}, [loading, user, router]);

	return <Loader />;
}
