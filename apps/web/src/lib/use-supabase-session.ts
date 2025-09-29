"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

export function useSupabaseSession() {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;

		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			setSession(data.session);
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, newSession) => {
				setSession(newSession);
				setUser(newSession?.user ?? null);
			},
		);

		return () => {
			mounted = false;
			subscription.subscription.unsubscribe();
		};
	}, []);

	return { session, user, loading };
}
