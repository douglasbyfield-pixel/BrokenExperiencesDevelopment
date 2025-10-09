import { createClient } from "@web/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
	// Check for existing session
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// If user has a session, redirect to home, otherwise to login
	if (session) {
		redirect("/home");
	} else {
		redirect("/login");
	}
}
