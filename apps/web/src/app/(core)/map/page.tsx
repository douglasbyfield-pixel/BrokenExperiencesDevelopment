"use client";

import { eden } from "@web/lib/eden";
import { createClient } from "@web/lib/supabase/client";
import { useEffect, useState } from "react";
import MapClient from "./features/map-client";

export default function MapPage() {
	const [experiences, setExperiences] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchExperiences = async () => {
			try {
				// Get auth token
				const supabase = createClient();
				const { data: { session } } = await supabase.auth.getSession();
				
				// Fetch experiences with auth header if available
				const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
				const headers: HeadersInit = {
					"Content-Type": "application/json",
				};
				
				if (session?.access_token) {
					headers["Authorization"] = `Bearer ${session.access_token}`;
				}
				
				const response = await fetch(`${apiUrl}/experience`, { headers });
				const data = await response.json();
				
				console.log("📍 Map: Fetched experiences:", data?.length || 0);
				setExperiences(data || []);
			} catch (error) {
				console.error("Error fetching experiences for map:", error);
				setExperiences([]);
			} finally {
				setLoading(false);
			}
		};

		fetchExperiences();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-black">Loading map...</div>
			</div>
		);
	}

	return <MapClient experiences={experiences} />;
}
