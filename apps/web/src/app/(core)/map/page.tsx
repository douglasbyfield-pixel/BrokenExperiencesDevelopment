"use client";

import { useMapMarkers } from "@web/hooks/use-experiences";
import { eden } from "@web/lib/eden";
import { createClient } from "@web/lib/supabase/client";
import { useEffect, useState } from "react";
import MapClient from "./features/map-client";

export default function MapPage() {
	// Use TanStack Query for map markers - much faster with caching!
	const { data: experiences = [], isLoading: loading, error } = useMapMarkers();

	if (error) {
		console.error("Error fetching map markers:", error);
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-black">Loading map...</div>
			</div>
		);
	}

	return <MapClient experiences={experiences} />;
}
