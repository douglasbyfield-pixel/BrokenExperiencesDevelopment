import { redirect } from "next/navigation";

export default function RootPage() {
	// For now, just redirect to login to avoid authentication complexity
	redirect("/login");
}
