"use client";

import {
	AlertCircle,
	Building,
	Car,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	Construction,
	Droplets,
	Filter,
	Lightbulb,
	MapPin,
	Search,
	Shield,
	ThumbsUp,
	Trash2,
	TreePine,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Issue {
	id: string;
	title: string;
	description: string;
	latitude: number;
	longitude: number;
	address?: string;
	status: "reported" | "pending" | "resolved";
	severity: "low" | "medium" | "high" | "critical";
	reporterId: string;
	categoryId?: string;
	imageUrls?: string[];
	createdAt: Date;
	updatedAt: Date;
	resolvedAt?: Date;
	upvotes: number;
	downvotes: number;
}

const statusConfig = {
	reported: {
		icon: AlertCircle,
		color: "#ef4444",
		label: "Reported",
		bgColor: "bg-red-100 dark:bg-red-900/20",
		textColor: "text-red-700 dark:text-red-400",
	},
	pending: {
		icon: Clock,
		color: "#f59e0b",
		label: "In Progress",
		bgColor: "bg-amber-100 dark:bg-amber-900/20",
		textColor: "text-amber-700 dark:text-amber-400",
	},
	resolved: {
		icon: CheckCircle,
		color: "#10b981",
		label: "Resolved",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
		textColor: "text-emerald-700 dark:text-emerald-400",
	},
};

const severityConfig = {
	low: {
		scale: 0.8,
		zIndex: 1,
		color: "#10b981",
		bgColor: "bg-emerald-500",
		textColor: "text-white",
	},
	medium: {
		scale: 1.0,
		zIndex: 2,
		color: "#f59e0b",
		bgColor: "bg-amber-500",
		textColor: "text-white",
	},
	high: {
		scale: 1.2,
		zIndex: 3,
		color: "#ef4444",
		bgColor: "bg-red-500",
		textColor: "text-white",
	},
	critical: {
		scale: 1.4,
		zIndex: 4,
		color: "#dc2626",
		bgColor: "bg-red-600",
		textColor: "text-white",
	},
};

const categoryConfig = {
	infrastructure: {
		icon: Construction,
		color: "#8b5cf6",
		label: "Infrastructure",
	},
	roads: { icon: Car, color: "#3b82f6", label: "Roads" },
	lighting: { icon: Lightbulb, color: "#f59e0b", label: "Lighting" },
	environment: { icon: TreePine, color: "#10b981", label: "Environment" },
	sanitation: { icon: Trash2, color: "#6b7280", label: "Sanitation" },
	utilities: { icon: Zap, color: "#ef4444", label: "Utilities" },
	water: { icon: Droplets, color: "#06b6d4", label: "Water" },
	safety: { icon: Shield, color: "#f97316", label: "Safety" },
	building: { icon: Building, color: "#84cc16", label: "Building" },
	traffic: { icon: Car, color: "#ec4899", label: "Traffic" },
	vandalism: { icon: AlertCircle, color: "#64748b", label: "Vandalism" },
	other: { icon: MapPin, color: "#6366f1", label: "Other" },
};

// Helper function to get icon SVG paths based on category
const getIconPath = (categoryId: string) => {
	// Use exact Lucide React icon paths to match the legend
	const iconPaths: { [key: string]: string } = {
		// Construction icon (simple hammer and wrench)
		infrastructure:
			"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
		// Car icon (matches legend)
		roads:
			"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		// Lightbulb icon (matches legend)
		lighting:
			"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4",
		// TreePine icon (matches legend)
		environment:
			"m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2a1 1 0 0 1-.8-1.7L12 2l4 5.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z M12 22v-3",
		// Trash2 icon (matches legend)
		sanitation:
			"M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2 M10 11v6 M14 11v6",
		// Zap icon (matches legend)
		utilities: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
		// Droplets icon (matches legend)
		water:
			"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.14 3 12.25c0 2.22 1.8 4.05 4 4.05z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.26 4.89 4.56 6.96a7.93 7.93 0 0 1 2.78 3.52c.22.58.33 1.21.33 1.84C21.67 17.9 20.14 20 18 20c-2.08 0-3.8-1.88-3.8-4.13 0-1.48.73-2.96 1.87-3.96l.49-.69z",
		// Shield icon (matches legend)
		safety: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
		// Building icon (matches legend)
		building:
			"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12h12 M6 16h12 M10 6h4 M10 10h4",
		// Car icon for traffic (same as roads)
		traffic:
			"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		// AlertCircle for vandalism
		vandalism:
			"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
		// MapPin for other/default
		other:
			"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
	};
	return iconPaths[categoryId] || iconPaths.other;
};

// Helper function to get darker color for gradient
const getDarkerColor = (color: string) => {
	const colorMap: { [key: string]: string } = {
		"#ef4444": "#dc2626", // red-500 to red-600
		"#f59e0b": "#d97706", // amber-500 to amber-600
		"#10b981": "#059669", // emerald-500 to emerald-600
	};
	return colorMap[color] || color;
};

// Helper function to get category icon (placeholder)
const getCategoryIcon = (categoryId: string) => {
	return getIconPath(categoryId);
};

export default function MapPage() {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<any>(null);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [activeFilters, setActiveFilters] = useState<{
		status: string[];
		severity: string[];
	}>({
		status: [],
		severity: [],
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [showLegend, setShowLegend] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [showSearchPanel, setShowSearchPanel] = useState(true);

	// Function to calculate distance between two coordinates
	const calculateDistance = (
		lat1: number,
		lng1: number,
		lat2: number,
		lng2: number,
	): number => {
		const R = 6371; // Radius of the Earth in kilometers
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in kilometers
		return distance;
	};

	// Get user's current location
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.log("Location access denied or unavailable");
				},
			);
		}
	}, []);

	// Fetch issues on mount
	useEffect(() => {
		fetchIssues();
		// Load mock data immediately as fallback
		setMockData();
	}, []);

	// Initialize Mapbox map
	useEffect(() => {
		const initializeMap = async () => {
			if (map.current || !mapContainer.current) return;

			try {
				// Dynamic import to avoid SSR issues
				const mapboxgl = await import("mapbox-gl");

				// Make mapboxgl available globally for marker creation
				(window as any).mapboxgl = mapboxgl.default;

				mapboxgl.default.accessToken =
					process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

				map.current = new mapboxgl.default.Map({
					container: mapContainer.current,
					style: "mapbox://styles/mapbox/streets-v12",
					center: [-77.2975, 18.1096], // Jamaica center
					zoom: 9, // Better zoom for Jamaica
					maxBounds: [
						[-78.5, 17.5], // Southwest coordinates of Jamaica
						[-76.0, 18.8], // Northeast coordinates of Jamaica
					],
				});

				map.current.addControl(new mapboxgl.default.NavigationControl());
				map.current.addControl(
					new mapboxgl.default.GeolocateControl({
						positionOptions: {
							enableHighAccuracy: true,
						},
						trackUserLocation: true,
					}),
				);

				map.current.on("load", () => {
					console.log("Map loaded successfully");
					// Fit map to Jamaica bounds
					map.current.fitBounds(
						[
							[-78.5, 17.5], // Southwest coordinates of Jamaica
							[-76.0, 18.8], // Northeast coordinates of Jamaica
						],
						{
							padding: 20,
						},
					);

					// Create and load custom SVG icons as images
					const createSVGIcon = (iconPath: string, color = "#000000") => {
						const svg = `
							<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="12" r="10" fill="white" opacity="0.9"/>
								<path d="${iconPath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						`;
						const blob = new Blob([svg], { type: "image/svg+xml" });
						return URL.createObjectURL(blob);
					};

					// Load category icons
					const categoryIcons = {
						lighting: getIconPath("lighting"),
						roads: getIconPath("roads"),
						water: getIconPath("water"),
						traffic: getIconPath("traffic"),
						sanitation: getIconPath("sanitation"),
						environment: getIconPath("environment"),
						utilities: getIconPath("utilities"),
						infrastructure: getIconPath("infrastructure"),
						safety: getIconPath("safety"),
						other: getIconPath("other"),
					};

					// Load each icon into Mapbox
					Object.entries(categoryIcons).forEach(([category, iconPath]) => {
						const img = new Image();
						img.onload = () => {
							if (!map.current.hasImage(`icon-${category}`)) {
								map.current.addImage(`icon-${category}`, img);
							}
						};
						img.src = createSVGIcon(iconPath);
					});

					setMapLoaded(true);
				});
			} catch (error) {
				console.error("Failed to load Mapbox:", error);
				setMapLoaded(true); // Still show the interface
			}
		};

		initializeMap();

		return () => {
			// Cleanup markers and layers
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];

			if (map.current) {
				// Remove layers if they exist
				try {
					if (map.current.getLayer("issues-labels")) {
						map.current.removeLayer("issues-labels");
					}
					if (map.current.getLayer("issues-layer")) {
						map.current.removeLayer("issues-layer");
					}
					if (map.current.getSource("issues")) {
						map.current.removeSource("issues");
					}
				} catch (e) {
					console.log("Cleanup layers error:", e);
				}
				map.current.remove();
			}
		};
	}, []);

	// Store markers for cleanup
	const markersRef = useRef<any[]>([]);

	// Native Mapbox layers with zoom-responsive markers
	useEffect(() => {
		if (!map.current || !mapLoaded || filteredIssues.length === 0) return;

		console.log(
			"Creating zoom-responsive markers for",
			filteredIssues.length,
			"Jamaica issues",
		);

		// Clear existing markers and layers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Remove existing layers
		try {
			if (map.current.getLayer("issues-icons")) {
				map.current.removeLayer("issues-icons");
			}
			if (map.current.getLayer("issues-layer")) {
				map.current.removeLayer("issues-layer");
			}
			if (map.current.getSource("issues")) {
				map.current.removeSource("issues");
			}
		} catch (e) {
			console.log("No existing layers to remove");
		}

		// Create GeoJSON features from issues
		const geojsonData = {
			type: "FeatureCollection",
			features: filteredIssues.map((issue) => ({
				type: "Feature",
				properties: {
					id: issue.id,
					title: issue.title,
					description: issue.description,
					status: issue.status,
					severity: issue.severity,
					categoryId: issue.categoryId,
					address: issue.address,
					upvotes: issue.upvotes,
					downvotes: issue.downvotes,
					color: statusConfig[issue.status].color,
				},
				geometry: {
					type: "Point",
					coordinates: [issue.longitude, issue.latitude],
				},
			})),
		};

		console.log(
			"Adding GeoJSON source with",
			geojsonData.features.length,
			"features",
		);

		// Add source
		map.current.addSource("issues", {
			type: "geojson",
			data: geojsonData,
		});

		// Add circle layer for markers with zoom-based sizing
		map.current.addLayer({
			id: "issues-layer",
			type: "circle",
			source: "issues",
			paint: {
				"circle-radius": [
					"interpolate",
					["linear"],
					["zoom"],
					8, // At zoom 8
					[
						"case",
						["==", ["get", "severity"], "critical"],
						8,
						["==", ["get", "severity"], "high"],
						6,
						["==", ["get", "severity"], "medium"],
						5,
						4, // low
					],
					12, // At zoom 12
					[
						"case",
						["==", ["get", "severity"], "critical"],
						20,
						["==", ["get", "severity"], "high"],
						16,
						["==", ["get", "severity"], "medium"],
						14,
						12, // low
					],
				],
				"circle-color": ["get", "color"],
				"circle-stroke-width": [
					"interpolate",
					["linear"],
					["zoom"],
					8,
					2,
					12,
					3,
				],
				"circle-stroke-color": "#ffffff",
				"circle-opacity": 0.9,
				"circle-stroke-opacity": 1,
			},
		});

		// Add custom SVG icon symbols with zoom-based sizing
		map.current.addLayer({
			id: "issues-icons",
			type: "symbol",
			source: "issues",
			layout: {
				"icon-image": [
					"case",
					["==", ["get", "categoryId"], "lighting"],
					"icon-lighting",
					["==", ["get", "categoryId"], "roads"],
					"icon-roads",
					["==", ["get", "categoryId"], "water"],
					"icon-water",
					["==", ["get", "categoryId"], "traffic"],
					"icon-traffic",
					["==", ["get", "categoryId"], "sanitation"],
					"icon-sanitation",
					["==", ["get", "categoryId"], "environment"],
					"icon-environment",
					["==", ["get", "categoryId"], "utilities"],
					"icon-utilities",
					["==", ["get", "categoryId"], "infrastructure"],
					"icon-infrastructure",
					["==", ["get", "categoryId"], "safety"],
					"icon-safety",
					"icon-other", // default
				],
				"icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 12, 1.2],
				"icon-allow-overlap": true,
				"icon-ignore-placement": true,
			},
		});

		// Add click handler for markers
		map.current.on("click", "issues-layer", (e: any) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				const issue = filteredIssues.find(
					(i) => i.id === feature.properties.id,
				);
				if (issue) {
					console.log("Native marker clicked:", issue.title);
					setSelectedIssue(issue);
				}
			}
		});

		// Add hover effects
		map.current.on("mouseenter", "issues-layer", () => {
			map.current.getCanvas().style.cursor = "pointer";
		});

		map.current.on("mouseleave", "issues-layer", () => {
			map.current.getCanvas().style.cursor = "";
		});

		console.log("✅ Zoom-responsive markers created successfully");
	}, [filteredIssues, mapLoaded]);

	const setMockData = () => {
		// Clear existing issues and set new Jamaica-specific issues (matching server data)
		const mockIssues: Issue[] = [
			{
				id: "issue-1",
				title: "Broken Streetlight on Hope Road",
				description: "The streetlight near UWI campus has been out for 2 weeks",
				latitude: 18.0179,
				longitude: -76.7426,
				address: "Hope Road, Kingston 6, Jamaica",
				status: "reported",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "lighting",
				createdAt: new Date("2024-01-15"),
				updatedAt: new Date("2024-01-15"),
				upvotes: 12,
				downvotes: 1,
			},
			{
				id: "issue-2",
				title: "Pothole on Spanish Town Road",
				description:
					"Large pothole causing damage to vehicles near Coronation Market",
				latitude: 17.9692,
				longitude: -76.8103,
				address: "Spanish Town Road, Kingston, Jamaica",
				status: "pending",
				severity: "critical",
				reporterId: "demo-user",
				categoryId: "roads",
				createdAt: new Date("2024-01-20"),
				updatedAt: new Date("2024-01-22"),
				upvotes: 25,
				downvotes: 0,
			},
			{
				id: "issue-3",
				title: "Water Main Break in Half Way Tree",
				description:
					"Water main burst causing flooding on Constant Spring Road",
				latitude: 18.0175,
				longitude: -76.7966,
				address: "Constant Spring Road, Kingston 10, Jamaica",
				status: "pending",
				severity: "critical",
				reporterId: "demo-user",
				categoryId: "water",
				createdAt: new Date("2024-01-10"),
				updatedAt: new Date("2024-01-18"),
				upvotes: 35,
				downvotes: 0,
			},
			{
				id: "issue-4",
				title: "Broken Traffic Light in New Kingston",
				description: "Traffic light not working properly at major intersection",
				latitude: 18.0051,
				longitude: -76.7837,
				address: "Knutsford Boulevard & Trafalgar Road, Kingston 5, Jamaica",
				status: "pending",
				severity: "critical",
				reporterId: "demo-user",
				categoryId: "traffic",
				createdAt: new Date("2024-01-25"),
				updatedAt: new Date("2024-01-25"),
				upvotes: 30,
				downvotes: 0,
			},
			{
				id: "issue-5",
				title: "Overflowing Garbage Collection Point",
				description:
					"Garbage collection point hasn't been emptied in days, attracting pests",
				latitude: 18.0199,
				longitude: -76.8018,
				address: "Cross Roads, Kingston, Jamaica",
				status: "reported",
				severity: "medium",
				reporterId: "demo-user",
				categoryId: "sanitation",
				createdAt: new Date("2024-01-28"),
				updatedAt: new Date("2024-01-28"),
				upvotes: 18,
				downvotes: 1,
			},
			{
				id: "issue-6",
				title: "Fallen Tree Blocking Road",
				description:
					"Large tree fell across road after storm, blocking traffic",
				latitude: 18.0456,
				longitude: -76.73,
				address: "Blue Mountain Road, Kingston, Jamaica",
				status: "resolved",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "environment",
				createdAt: new Date("2024-01-20"),
				updatedAt: new Date("2024-01-21"),
				resolvedAt: new Date("2024-01-21"),
				upvotes: 22,
				downvotes: 0,
			},
			{
				id: "issue-7",
				title: "Power Line Down in Downtown Kingston",
				description: "Electrical power line down after storm, area unsafe",
				latitude: 17.9712,
				longitude: -76.7655,
				address: "Orange Street, Kingston, Jamaica",
				status: "pending",
				severity: "critical",
				reporterId: "demo-user",
				categoryId: "utilities",
				createdAt: new Date("2024-01-26"),
				updatedAt: new Date("2024-01-26"),
				upvotes: 45,
				downvotes: 0,
			},
			{
				id: "issue-8",
				title: "Bridge Damage in Montego Bay",
				description: "Bridge structure showing cracks and needs urgent repair",
				latitude: 18.4762,
				longitude: -77.8939,
				address: "Hip Strip, Montego Bay, St. James, Jamaica",
				status: "reported",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "infrastructure",
				createdAt: new Date("2024-01-22"),
				updatedAt: new Date("2024-01-22"),
				upvotes: 28,
				downvotes: 2,
			},
			{
				id: "issue-9",
				title: "Sewer Overflow in Spanish Town",
				description: "Sewer system overflowing causing unsanitary conditions",
				latitude: 17.9909,
				longitude: -76.9552,
				address: "Spanish Town Square, St. Catherine, Jamaica",
				status: "pending",
				severity: "critical",
				reporterId: "demo-user",
				categoryId: "sanitation",
				createdAt: new Date("2024-01-24"),
				updatedAt: new Date("2024-01-25"),
				upvotes: 38,
				downvotes: 1,
			},
			{
				id: "issue-10",
				title: "Road Closure in Ocho Rios",
				description: "Landslide blocking main road to tourist attractions",
				latitude: 18.4078,
				longitude: -77.103,
				address: "Main Street, Ocho Rios, St. Ann, Jamaica",
				status: "pending",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "roads",
				createdAt: new Date("2024-01-27"),
				updatedAt: new Date("2024-01-27"),
				upvotes: 42,
				downvotes: 0,
			},
			{
				id: "issue-11",
				title: "Port Security Concerns",
				description: "Inadequate lighting at port area creating safety issues",
				latitude: 18.4692,
				longitude: -77.9197,
				address: "Port of Montego Bay, Jamaica",
				status: "reported",
				severity: "medium",
				reporterId: "demo-user",
				categoryId: "safety",
				createdAt: new Date("2024-01-29"),
				updatedAt: new Date("2024-01-29"),
				upvotes: 15,
				downvotes: 3,
			},
		];
		console.log("Setting Jamaica mock data with", mockIssues.length, "issues");
		setIssues(mockIssues);
	};

	// Apply filters whenever issues or filters change
	useEffect(() => {
		let filtered = [...issues];

		// Apply status filters
		if (activeFilters.status.length > 0) {
			filtered = filtered.filter((issue) =>
				activeFilters.status.includes(issue.status),
			);
		}

		// Apply severity filters
		if (activeFilters.severity.length > 0) {
			filtered = filtered.filter((issue) =>
				activeFilters.severity.includes(issue.severity),
			);
		}

		// Apply search query
		if (searchQuery) {
			filtered = filtered.filter(
				(issue) =>
					issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					issue.address?.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		setFilteredIssues(filtered);
	}, [issues, activeFilters, searchQuery]);

	const fetchIssues = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/issue`,
			);
			if (response.ok) {
				const data = await response.json();
				setIssues(data);
			}
		} catch (error) {
			console.error("Failed to fetch issues:", error);
		}
	};

	const toggleFilter = (type: "status" | "severity", value: string) => {
		setActiveFilters((prev) => {
			const current = prev[type];
			if (current.includes(value)) {
				return {
					...prev,
					[type]: current.filter((v) => v !== value),
				};
			}
			return {
				...prev,
				[type]: [...current, value],
			};
		});
	};

	const handleVote = async (issueId: string, type: "upvote" | "downvote") => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/issue/${issueId}/vote`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ type }),
				},
			);

			if (response.ok) {
				const updatedIssue = await response.json();
				setIssues((prev) =>
					prev.map((issue) => (issue.id === issueId ? updatedIssue : issue)),
				);
				if (selectedIssue?.id === issueId) {
					setSelectedIssue(updatedIssue);
				}
			}
		} catch (error) {
			console.error("Failed to vote:", error);
		}
	};

	return (
		<div
			className={`mobile-map-page h-full w-full md:absolute md:inset-0 ${showSearchPanel ? "search-visible" : ""}`}
		>
			{/* Mapbox Container */}
			<div ref={mapContainer} className="h-full w-full" />

			{/* Toggle Search Button (visible when search is hidden) */}
			{!showSearchPanel && (
				<div className="absolute top-2 left-2 z-10">
					<Button
						variant="default"
						size="sm"
						onClick={() => setShowSearchPanel(true)}
						className="border border-gray-200 bg-white text-black shadow-lg hover:bg-gray-50"
					>
						<Search className="mr-2 h-4 w-4" />
						<span>Show Search</span>
					</Button>
				</div>
			)}

			{/* Search Bar */}
			{showSearchPanel && (
				<div className="absolute top-2 right-2 left-2 z-10 w-auto sm:top-4 sm:right-4 sm:left-4 sm:max-w-md">
					<Card className="border border-gray-200 bg-white shadow-lg">
						<CardContent className="p-2 sm:p-3">
							<div className="space-y-2">
								{/* Search and Hide Button Row */}
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 transform text-gray-400 sm:left-3" />
										<Input
											placeholder="Search issues..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="h-9 border-gray-300 bg-white pl-8 text-black text-sm focus:border-gray-500 focus:ring-0 sm:h-10 sm:pl-10 sm:text-base"
										/>
									</div>
									<Button
										variant="default"
										size="icon"
										onClick={() => setShowSearchPanel(false)}
										className="h-9 w-9 shrink-0 bg-gray-800 text-white hover:bg-gray-700 sm:h-10 sm:w-10"
										title="Hide Search"
									>
										<ChevronUp className="h-4 w-4" />
									</Button>
								</div>
								{/* Filter and Legend Buttons */}
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() => setShowFilters(!showFilters)}
										className="relative h-9 w-9 shrink-0 border-gray-400 hover:border-gray-600 sm:h-10 sm:w-10"
									>
										<Filter className="h-4 w-4 text-black" />
										{activeFilters.status.length +
											activeFilters.severity.length >
											0 && (
											<div className="-top-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full bg-primary sm:h-3 sm:w-3" />
										)}
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={() => setShowLegend(!showLegend)}
										className="h-9 w-9 shrink-0 border-gray-400 hover:border-gray-600 sm:h-10 sm:w-10"
										title="Show Legend"
									>
										<MapPin className="h-4 w-4 text-black" />
									</Button>
								</div>
							</div>
							{/* Status Legend in Search Area */}
							<div className="mt-2 space-y-2">
								<span className="block font-medium text-black text-xs">
									Showing {filteredIssues.length} of {issues.length} issues
								</span>
								<div className="flex flex-wrap items-center gap-2 sm:gap-3">
									<div className="flex items-center gap-1">
										<div className="h-2.5 w-2.5 rounded-full bg-red-500" />
										<span className="text-[11px] text-black sm:text-xs">
											Reported
										</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
										<span className="text-[11px] text-black sm:text-xs">
											In Progress
										</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
										<span className="text-[11px] text-black sm:text-xs">
											Resolved
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters Panel */}
			{showFilters && (
				<div className="absolute top-[120px] right-2 left-2 z-10 max-h-[calc(100vh-140px)] w-auto overflow-y-auto sm:top-24 sm:right-4 sm:left-auto sm:max-h-[calc(100vh-120px)] sm:w-80">
					<Card className="border border-gray-300 bg-gray-50 shadow-lg">
						<CardHeader className="pb-2 sm:pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base text-black sm:text-lg">
									Filters
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowFilters(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h4 className="mb-3 font-medium text-black">Status</h4>
								<div className="space-y-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<label
											key={status}
											className="flex cursor-pointer items-center gap-3"
										>
											<input
												type="checkbox"
												checked={activeFilters.status.includes(status)}
												onChange={() => toggleFilter("status", status)}
												className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<div className="flex items-center gap-2 text-black">
												<config.icon className="h-4 w-4" />
												<span className="text-black">{config.label}</span>
											</div>
										</label>
									))}
								</div>
							</div>

							<div>
								<h4 className="mb-3 font-medium text-black">Severity</h4>
								<div className="space-y-2">
									{Object.keys(severityConfig).map((severity) => (
										<label
											key={severity}
											className="flex cursor-pointer items-center gap-3"
										>
											<input
												type="checkbox"
												checked={activeFilters.severity.includes(severity)}
												onChange={() => toggleFilter("severity", severity)}
												className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-black capitalize">{severity}</span>
										</label>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Legend Panel */}
			{showLegend && (
				<div className="absolute top-[120px] right-2 left-2 z-10 max-h-[calc(100vh-140px)] w-auto overflow-y-auto sm:top-24 sm:right-auto sm:left-4 sm:max-h-[calc(100vh-120px)] sm:w-72">
					<Card className="border border-gray-300 bg-gray-50 shadow-lg">
						<CardHeader className="pb-2 sm:pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base text-black sm:text-lg">
									Map Legend
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowLegend(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Status Legend */}
							<div>
								<h4 className="mb-3 font-medium text-black">Issue Status</h4>
								<div className="space-y-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<div key={status} className="flex items-center gap-3">
											<div
												className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
												style={{ backgroundColor: config.color }}
											/>
											<span className="font-medium text-black text-sm">
												{config.label}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Category Legend */}
							<div>
								<h4 className="mb-3 font-medium text-black">
									Issue Categories
								</h4>
								<div className="grid grid-cols-2 gap-2">
									{Object.entries(categoryConfig).map(
										([categoryId, config]) => {
											const Icon = config.icon;
											return (
												<div
													key={categoryId}
													className="flex items-center gap-2"
												>
													<Icon className="h-4 w-4 text-black" />
													<span className="text-black text-xs">
														{config.label}
													</span>
												</div>
											);
										},
									)}
								</div>
							</div>

							{/* Severity Legend */}
							<div>
								<h4 className="mb-3 font-medium text-black">Severity Levels</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-3">
										<div className="h-6 w-6 rounded-full border-2 border-white bg-gray-300" />
										<span className="text-black text-sm">Low</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="h-7 w-7 rounded-full border-2 border-white bg-gray-400" />
										<span className="text-black text-sm">Medium</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-full border-2 border-white bg-gray-500" />
										<span className="text-black text-sm">High</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full border-2 border-white bg-gray-600" />
										<span className="text-black text-sm">Critical</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Issue Detail Popup */}
			{selectedIssue && (
				<div className="sm:-translate-x-1/2 sm:-translate-y-1/2 pointer-events-none fixed right-0 bottom-0 left-0 z-10 p-2 sm:absolute sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:transform sm:p-0">
					<Card className="pointer-events-auto max-h-[50vh] w-full overflow-y-auto border border-gray-200 bg-white shadow-xl sm:max-h-none sm:w-auto sm:min-w-[320px] sm:max-w-[400px]">
						<CardContent className="p-3 sm:p-4">
							<div className="mb-3 flex items-start justify-between">
								<h3 className="pr-2 font-semibold text-base text-black sm:text-lg">
									{selectedIssue.title}
								</h3>
								<div className="flex items-center gap-2">
									<Badge
										className={`${statusConfig[selectedIssue.status].bgColor} ${statusConfig[selectedIssue.status].textColor} shrink-0 transition-none hover:bg-current`}
									>
										{statusConfig[selectedIssue.status].label}
									</Badge>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedIssue(null)}
										className="shrink-0 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
										title="Close"
									>
										<X className="h-4 w-4 text-gray-600" />
									</Button>
								</div>
							</div>

							<p className="mb-3 text-gray-700 text-sm leading-relaxed">
								{selectedIssue.description}
							</p>

							{selectedIssue.address && (
								<p className="mb-3 flex items-center text-gray-600 text-xs">
									<MapPin className="mr-1 inline h-3 w-3" />
									{selectedIssue.address}
								</p>
							)}

							{/* Distance from user */}
							{userLocation && (
								<p className="mb-3 flex items-center text-gray-600 text-xs">
									<span className="mr-1 inline">📍</span>
									{calculateDistance(
										userLocation.lat,
										userLocation.lng,
										selectedIssue.latitude,
										selectedIssue.longitude,
									).toFixed(1)}{" "}
									km away
								</p>
							)}

							{/* Additional details */}
							<div className="mb-3 rounded-lg bg-gray-50 p-2">
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div>
										<span className="text-gray-500">Category:</span>
										<span className="ml-1 font-medium text-black capitalize">
											{selectedIssue.categoryId}
										</span>
									</div>
									<div>
										<span className="text-gray-500">Reported:</span>
										<span className="ml-1 font-medium text-black">
											{new Date(selectedIssue.createdAt).toLocaleDateString()}
										</span>
									</div>
									<div>
										<span className="text-gray-500">Reporter:</span>
										<span className="ml-1 font-medium text-black">
											{selectedIssue.reporterId}
										</span>
									</div>
									<div>
										<span className="text-gray-500">Updated:</span>
										<span className="ml-1 font-medium text-black">
											{new Date(selectedIssue.updatedAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Button
										size="sm"
										variant="ghost"
										className="flex items-center gap-1 text-gray-700 hover:text-green-600"
										onClick={(e) => {
											e.stopPropagation();
											handleVote(selectedIssue.id, "upvote");
										}}
									>
										<ThumbsUp className="h-4 w-4" />
										<span>{selectedIssue.upvotes}</span>
									</Button>
								</div>
								<Badge
									className={`${severityConfig[selectedIssue.severity as keyof typeof severityConfig].bgColor} ${severityConfig[selectedIssue.severity as keyof typeof severityConfig].textColor} px-3 py-1 font-medium capitalize`}
								>
									{selectedIssue.severity}
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
