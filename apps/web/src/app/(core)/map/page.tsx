"use client";

import { eden } from "@web/lib/eden";
import { createClient } from "@web/lib/supabase/client";
import { useEffect, useState } from "react";
import MapClient from "./features/map-client";

export default function MapPage() {
	const [experiences, setExperiences] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMapMarkers = async () => {
			try {
				// Use the new lightweight markers endpoint
				const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
				
				const response = await fetch(`${apiUrl}/experience/markers`, {
					headers: {
						"Content-Type": "application/json",
					},
				});
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				const data = await response.json();
				
				console.log("📍 Map: Fetched markers:", data?.length || 0);
				setExperiences(data || []);
			} catch (error) {
				console.error("Error fetching map markers:", error);
				// Fallback to full experiences if markers endpoint fails
				try {
					const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
					const response = await fetch(`${apiUrl}/experience`);
					const data = await response.json();
					setExperiences(data || []);
				} catch (fallbackError) {
					console.error("Fallback fetch also failed:", fallbackError);
					setExperiences([]);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchMapMarkers();
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
