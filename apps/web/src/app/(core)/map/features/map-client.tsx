"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
	Popover,
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverTrigger,
} from "@web/components/animate-ui/primitives/base/popover";
import { BackButton } from "@web/components/ui/back-button";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
// Removed useVoteExperience - voting not available on map
import { useShare } from "@web/hooks/use-share";
import { CATEGORY_STYLING, getCategoryStyling } from "@web/lib/category-config";
import type { Experience } from "@web/types";
import {
	AlertCircle,
	ArrowLeft,
	Building,
	Car,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	Compass,
	Construction,
	Copy,
	Droplets,
	Facebook,
	Filter,
	Info,
	Lightbulb,
	Link,
	MapPin,
	MessageCircle,
	Navigation,
	Route,
	Search,
	Share,
	Share2,
	Shield,
	ThumbsUp,
	Timer,
	Trash2,
	TreePine,
	Twitter,
	X,
	Zap,
} from "lucide-react";
import { MAP_CONFIG } from "../constants/mapConstants";
import { applyFilters } from "../utils/filterUtils";
import { locationActions } from "../utils/locationActions";
import { mapOperations } from "../utils/mapOperations";
import { createReactCluster, createReactMarker } from "../utils/markerUtils";

// Using Elysia API backend (which connects to Supabase underneath)

const statusConfig = {
	pending: {
		icon: AlertCircle,
		color: "#ef4444",
		label: "Reported",
		bgColor: "bg-red-100 dark:bg-red-900/20",
		textColor: "text-red-700 dark:text-red-400",
	},
	in_progress: {
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

const priorityConfig = {
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
	traffic: { icon: Car, color: "#ef4444", label: "Traffic" },
	lighting: { icon: Lightbulb, color: "#f59e0b", label: "Lighting" },
	environment: { icon: TreePine, color: "#10b981", label: "Environment" },
	sanitation: { icon: Trash2, color: "#8b5cf6", label: "Sanitation" },
	utilities: { icon: Zap, color: "#06b6d4", label: "Utilities" },
	water: { icon: Droplets, color: "#3b82f6", label: "Water" },
	roads: { icon: Construction, color: "#f97316", label: "Roads" },
	safety: { icon: Shield, color: "#dc2626", label: "Safety" },
	"digital aids": { icon: Zap, color: "#9333ea", label: "Digital Aids" },
	other: { icon: Building, color: "#64748b", label: "Other" },
};

interface MapClientProps {
	experiences: Experience[];
}

export default function MapClient({ experiences }: MapClientProps) {
	const mapRef = useRef<any>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<any>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [filteredExperiences, setFilteredExperiences] =
		useState<Experience[]>(experiences);
	const [selectedExperience, setSelectedExperience] =
		useState<Experience | null>(null);
	const [categories, setCategories] = useState<
		Array<{ id: string; name: string }>
	>([]);
	const searchParams = useSearchParams();
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [activeFilters, setActiveFilters] = useState<{
		status: string[];
		priority: string[];
		category: string[];
	}>({
		status: [],
		priority: [],
		category: [],
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [showLegend, setShowLegend] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [mapError, setMapError] = useState<string | null>(null);
	const [showSearchPanel, setShowSearchPanel] = useState(false);
	const [isLiveTracking, setIsLiveTracking] = useState(false);
	const [watchId, setWatchId] = useState<number | null>(null);
	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
	const [showQuickActions, setShowQuickActions] = useState(false);
	const [currentRoute, setCurrentRoute] = useState<any>(null);
	const [isNavigating, setIsNavigating] = useState(false);
	const [navPanelMinimized, setNavPanelMinimized] = useState(false);
	const [clusters, setClusters] = useState<
		Array<{
			id: string;
			lat: number;
			lng: number;
			experiences: Experience[];
			count: number;
		}>
	>([]);
	const [selectedCluster, setSelectedCluster] = useState<Experience[] | null>(
		null,
	);
	const router = useRouter();
	const {
		copyToClipboard,
		shareToWhatsApp,
		shareToTwitter,
		shareToFacebook,
		shareViaWebShare,
	} = useShare();

	// Fetch categories from database - memoized to prevent refetching
	const categoriesMemo = useMemo(() => {
		let isMounted = true;

		const fetchCategories = async () => {
			try {
				const { eden } = await import("@web/lib/eden");
				const result = await eden.category.get({
					$query: { limit: 50, offset: 0 },
				});
				if (Array.isArray(result?.data) && isMounted) {
					const sorted = result.data.sort((a: any, b: any) =>
						a.name.localeCompare(b.name),
					);
					setCategories(sorted);
				}
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		fetchCategories();

		return () => {
			isMounted = false;
		};
	}, []); // Only run once on mount

	// Removed voting state - not needed for map view

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Request user location with high accuracy
	const requestLocation = useCallback(() => {
		if (!navigator.geolocation) {
			setMapError("Geolocation is not supported by this browser");
			setIsLoading(false);
			return;
		}

		const options = MAP_CONFIG.GEOLOCATION_OPTIONS;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				setUserLocation(location);
				setLocationAccuracy(position.coords.accuracy);
				setIsLoading(false);
				console.log(
					"✅ User location acquired:",
					location,
					`Accuracy: ${position.coords.accuracy}m`,
				);
			},
			(error) => {
				console.error("❌ Location error:", error);
				// Set a default location (Jamaica) if geolocation fails
				const defaultLocation = { lat: 18.1096, lng: -77.2975 };
				setUserLocation(defaultLocation);
				setIsLoading(false);
				setMapError(
					`Location access denied. Please refresh the page and allow location access, or we'll use a default location. ${error.message}`,
				);
			},
			options,
		);
	}, []);

	useEffect(() => {
		requestLocation();
	}, []);

	// Update filtered experiences when experiences prop changes
	useEffect(() => {
		setFilteredExperiences(experiences);
	}, [experiences]);

	// Memoized filtering function for better performance
	const filteredExperiencesMemo = useMemo(() => {
		return applyFilters(experiences, activeFilters, debouncedSearchQuery);
	}, [experiences, activeFilters, debouncedSearchQuery]);

	// Update filtered experiences when memo changes
	useEffect(() => {
		setFilteredExperiences(filteredExperiencesMemo);
	}, [filteredExperiencesMemo]);

	// Handle URL parameters for focusing on specific markers
	useEffect(() => {
		if (!map || !mapLoaded || !experiences.length) return;

		const lat = searchParams.get("lat");
		const lng = searchParams.get("lng");
		const zoom = searchParams.get("zoom");
		const focusId = searchParams.get("focus");

		if (lat && lng) {
			// Fly to the specified coordinates
			map.flyTo({
				center: [Number.parseFloat(lng), Number.parseFloat(lat)],
				zoom: zoom ? Number.parseFloat(zoom) : 16,
				duration: 1500,
			});

			// If there's a focus ID, find and select that experience
			if (focusId) {
				const targetExperience = experiences.find(
					(exp) => exp.id.toString() === focusId,
				);
				if (targetExperience) {
					// Delay the selection to ensure the map has moved
					setTimeout(() => {
						setSelectedExperience(targetExperience);
					}, 1000);
				}
			}
		}
	}, [map, mapLoaded, experiences, searchParams]);

	const toggleFilter = (
		type: "status" | "priority" | "category",
		value: string,
	) => {
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

	// Removed voting functionality from map - users should vote from feed/details pages

	// Removed vote cleanup - not needed for map view

	// Share handlers
	const handleNativeShare = async () => {
		if (!selectedExperience) return;

		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${selectedExperience.id}`;
			const shareText = `Check out this issue: ${selectedExperience.title}`;

			const success = await shareViaWebShare(shareText, shareText, shareUrl);
			if (!success) {
				// Fallback to copy to clipboard
				await handleCopyLink();
			}
		} catch (error) {
			console.error("Failed to share natively:", error);
			alert("Failed to share");
		}
	};

	const handleCopyLink = async () => {
		if (!selectedExperience) return;

		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${selectedExperience.id}`;

			const success = await copyToClipboard(shareUrl);
			if (success) {
				alert("Share link copied to clipboard!");
			} else {
				alert("Failed to copy to clipboard");
			}
		} catch (error) {
			console.error("Failed to copy link:", error);
			alert("Failed to copy link");
		}
	};

	const handleWhatsAppShare = async () => {
		if (!selectedExperience) return;

		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${selectedExperience.id}`;
			const shareText = `Check out this issue: ${selectedExperience.title}`;
			shareToWhatsApp(shareText, shareUrl);
		} catch (error) {
			console.error("Failed to share to WhatsApp:", error);
			alert("Failed to share to WhatsApp");
		}
	};

	const handleTwitterShare = async () => {
		if (!selectedExperience) return;

		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${selectedExperience.id}`;
			const shareText = `Check out this issue: ${selectedExperience.title}`;
			shareToTwitter(shareText, shareUrl);
		} catch (error) {
			console.error("Failed to share to Twitter:", error);
			alert("Failed to share to Twitter");
		}
	};

	const handleFacebookShare = async () => {
		if (!selectedExperience) return;

		try {
			const baseUrl = window.location.origin;
			const shareUrl = `${baseUrl}/shared/experience/${selectedExperience.id}`;
			shareToFacebook(shareUrl);
		} catch (error) {
			console.error("Failed to share to Facebook:", error);
			alert("Failed to share to Facebook");
		}
	};

	const getDirections = async (
		startLng: number,
		startLat: number,
		endLng: number,
		endLat: number,
	) => {
		try {
			const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
			const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?steps=true&geometries=geojson&access_token=${accessToken}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.routes && data.routes.length > 0) {
				return data.routes[0];
			}
			return null;
		} catch (error) {
			console.error("Error getting directions:", error);
			return null;
		}
	};

	const showRoute = async (
		startLocation: { lat: number; lng: number },
		endLocation: { lat: number; lng: number },
	) => {
		if (!map) return;

		const route = await getDirections(
			startLocation.lng,
			startLocation.lat,
			endLocation.lng,
			endLocation.lat,
		);

		if (route) {
			setCurrentRoute(route);
			setIsNavigating(true);
			setNavPanelMinimized(false);

			if (map.getSource("route")) {
				map.removeLayer("route");
				map.removeSource("route");
			}

			map.addSource("route", {
				type: "geojson",
				data: {
					type: "Feature",
					properties: {},
					geometry: route.geometry,
				},
			});

			map.addLayer({
				id: "route",
				type: "line",
				source: "route",
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "#3b82f6",
					"line-width": 5,
					"line-opacity": 0.8,
				},
			});

			const coordinates = route.geometry.coordinates;
			const bounds = new (window as any).mapboxgl.LngLatBounds();
			coordinates.forEach((coord: any) => bounds.extend(coord));

			map.fitBounds(bounds, {
				padding: 50,
				pitch: 68,
				duration: 1500,
			});

			// Auto-minimize after 5 seconds for better UX
			setTimeout(() => {
				setNavPanelMinimized(true);
			}, 5000);
		}
	};

	const clearRoute = () => {
		if (map && map.getSource("route")) {
			map.removeLayer("route");
			map.removeSource("route");
		}
		setCurrentRoute(null);
		setIsNavigating(false);
		setNavPanelMinimized(false);
	};

	// Initialize Mapbox when component mounts and user location is available
	useEffect(() => {
		if (!userLocation || !mapContainerRef.current) return;

		// Prevent multiple initializations
		if (map) return;

		const initializeMap = async () => {
			try {
				// Dynamically import mapboxgl to avoid SSR issues
				const mapboxgl = (await import("mapbox-gl")).default;

				// Lightweight telemetry blocking - only block in transformRequest
				// This is more efficient than intercepting all network requests

				// Mapbox access token - using correct env var name
				mapboxgl.accessToken =
					process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
					"pk.eyJ1IjoidXNlciIsImEiOiJhYmMxMjMifQ.fake-token-replace-with-real";

				const mapInstance = new mapboxgl.Map({
					container: mapContainerRef.current!,
					style: "mapbox://styles/mapbox/dark-v11",
					center: [userLocation.lng, userLocation.lat],
					zoom: 14,
					pitch: 68,
					bearing: 0,
					transformRequest: (url) => {
						// Block all telemetry and analytics requests
						if (
							url.includes("events.mapbox.com") ||
							url.includes("api.mapbox.com/events") ||
							url.includes("/events/")
						) {
							console.log("🚫 Blocked telemetry:", url);
							return { url: "" };
						}
						return { url };
					},
				});

				mapInstance.on("load", () => {
					console.log("✅ Map loaded successfully");

					// Add 3D buildings layer asynchronously to not block initial render
					requestAnimationFrame(() => {
						const layers = mapInstance.getStyle().layers;
						const labelLayerId = layers.find(
							(layer) =>
								layer.type === "symbol" &&
								layer.layout &&
								layer.layout["text-field"],
						)?.id;

						if (labelLayerId) {
							mapInstance.addLayer(
								{
									id: "add-3d-buildings",
									source: "composite",
									"source-layer": "building",
									filter: ["==", "extrude", "true"],
									type: "fill-extrusion",
									minzoom: 15,
									paint: {
										"fill-extrusion-color": "#aaa",
										"fill-extrusion-height": [
											"interpolate",
											["linear"],
											["zoom"],
											15,
											0,
											15.05,
											["get", "height"],
										],
										"fill-extrusion-base": [
											"interpolate",
											["linear"],
											["zoom"],
											15,
											0,
											15.05,
											["get", "min_height"],
										],
										"fill-extrusion-opacity": 0.6,
									},
								},
								labelLayerId,
							);
						}
					});

					// Set map as loaded immediately for better UX
					setMapLoaded(true);

					// Fly to location with reduced duration for faster initial load
					setTimeout(() => {
						mapInstance.flyTo({
							center: [userLocation.lng, userLocation.lat],
							zoom: 16.5,
							pitch: 68,
							bearing: 0,
							duration: 1500, // Reduced from 2500ms
							essential: true,
						});
					}, 200); // Reduced from 500ms
				});

				const nav = new mapboxgl.NavigationControl({
					visualizePitch: true,
					showZoom: false,
					showCompass: true,
				});
				mapInstance.addControl(nav, "top-right");

				// Add geolocate control with custom options and 3D view preserved
				// Load geolocate control asynchronously to not block initial render
				let geolocate: any;
				requestAnimationFrame(() => {
					geolocate = new mapboxgl.GeolocateControl({
						positionOptions: {
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 0,
						},
						trackUserLocation: true,
						showUserHeading: true,
						showAccuracyCircle: true,
						fitBoundsOptions: {
							maxZoom: 15,
							pitch: 68,
							bearing: 0,
						},
					});
					mapInstance.addControl(geolocate, "top-right");

					// Add popup for location features with enhanced quick actions
					geolocate.on("geolocate", (e: any) => {
						console.log("📍 Geolocate triggered:", e);

						if (e.coords) {
							const newLocation = {
								lat: e.coords.latitude,
								lng: e.coords.longitude,
							};

							setUserLocation(newLocation);
							setLocationAccuracy(e.coords?.accuracy || null);

							mapInstance.flyTo({
								center: [newLocation.lng, newLocation.lat],
								zoom: 16,
								pitch: 68,
								bearing: 0,
								duration: 1500,
							});

							const popup = new mapboxgl.Popup({
								offset: 25,
								closeOnClick: false,
								className: "location-popup",
							})
								.setLngLat([newLocation.lng, newLocation.lat])
								.setHTML(`
						<div class="p-4 min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
							<div class="flex items-center gap-2 mb-3">
								<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
								<h3 class="font-semibold text-sm">Your Location</h3>
							</div>
							<div class="space-y-2">
								<button onclick="reportIssueHere()" class="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
									<span class="text-lg">📍</span>
									Report Issue Here
								</button>
								<button onclick="findNearbyIssues()" class="w-full text-left px-3 py-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
									<span class="text-lg">🔍</span>
									Find Issues Near Me
								</button>
								<button onclick="showClosestIssue()" class="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
									<span class="text-lg">🎯</span>
									Show Closest Issue
								</button>
								<button onclick="shareLocation()" class="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
									<span class="text-lg">📤</span>
									Share My Location
								</button>
							</div>
							<div class="text-xs text-gray-500 mt-2 pt-2 border-t">
								Accuracy: ±${Math.round(e.coords.accuracy || 0)}m
							</div>
						</div>
						`)
								.addTo(mapInstance);

							(window as any).reportIssueHere = () => {
								locationActions.reportIssueHere(newLocation);
								popup.remove();
							};

							(window as any).findNearbyIssues = () => {
								locationActions.findNearbyIssues(
									newLocation,
									filteredExperiences,
									mapInstance,
								);
								popup.remove();
							};

							(window as any).showClosestIssue = () => {
								locationActions.showClosestIssue(
									newLocation,
									filteredExperiences,
									mapInstance,
									setSelectedExperience,
								);
								popup.remove();
							};

							(window as any).shareLocation = () => {
								locationActions.shareLocation(newLocation);
								popup.remove();
							};

							setTimeout(() => {
								if (popup.isOpen()) popup.remove();
							}, 15000);
						}
					});

					// Trigger geolocation after a shorter delay
					setTimeout(() => {
						geolocate.trigger();
					}, 500); // Reduced from 1000ms
				});

				setMap(mapInstance);
				mapRef.current = mapInstance;
			} catch (error) {
				console.error("❌ Map initialization failed:", error);
				setMapError(
					`Failed to initialize map: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		};

		initializeMap();

		// Cleanup function
		return () => {
			if (map) {
				map.remove();
				setMap(null);
				setMapLoaded(false);
			}
		};
	}, [userLocation]); // Only depend on userLocation

	// Helper function to calculate distance between two points
	const getDistance = (
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number,
	): number => {
		const R = 6371; // Radius of the Earth in km
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c; // Distance in km
	};

	// Clustering function to group nearby markers
	const createClusters = (experiences: Experience[], currentZoom = 15) => {
		if (!experiences.length) return [];

		// Only cluster when zoomed out - show individual markers when zoomed in
		if (currentZoom >= 14) {
			// Zoomed in enough - show individual markers
			return experiences.map((experience) => ({
				id: `individual-${experience.id}`,
				lat: Number(experience.latitude),
				lng: Number(experience.longitude),
				experiences: [experience],
				count: 1,
			}));
		}

		// Zoomed out - create clusters
		const clusterDistance =
			currentZoom > 12 ? 0.15 : currentZoom > 10 ? 0.3 : 0.5; // km

		const clusters: Array<{
			id: string;
			lat: number;
			lng: number;
			experiences: Experience[];
			count: number;
		}> = [];

		const processedExperiences = new Set<string>();

		experiences.forEach((experience, index) => {
			if (processedExperiences.has(experience.id)) return;

			const lat = Number(experience.latitude);
			const lng = Number(experience.longitude);

			if (isNaN(lat) || isNaN(lng)) return;

			// Find nearby experiences
			const nearbyExperiences = experiences.filter((otherExp, otherIndex) => {
				if (processedExperiences.has(otherExp.id) || otherIndex === index)
					return false;

				const otherLat = Number(otherExp.latitude);
				const otherLng = Number(otherExp.longitude);

				if (isNaN(otherLat) || isNaN(otherLng)) return false;

				const distance = getDistance(lat, lng, otherLat, otherLng);
				return distance <= clusterDistance;
			});

			// Create cluster with this experience and nearby ones
			const clusterExperiences = [experience, ...nearbyExperiences];

			// Mark all experiences in this cluster as processed
			clusterExperiences.forEach((exp) => processedExperiences.add(exp.id));

			// Calculate cluster center (average position)
			const centerLat =
				clusterExperiences.reduce((sum, exp) => sum + Number(exp.latitude), 0) /
				clusterExperiences.length;
			const centerLng =
				clusterExperiences.reduce(
					(sum, exp) => sum + Number(exp.longitude),
					0,
				) / clusterExperiences.length;

			clusters.push({
				id: `cluster-${index}`,
				lat: centerLat,
				lng: centerLng,
				experiences: clusterExperiences,
				count: clusterExperiences.length,
			});
		});

		return clusters;
	};

	// Memoized marker creation function for better performance
	const createMarkers = useCallback(
		async (experiences: Experience[], zoom: number) => {
			if (!map || !experiences.length) return;

			// Create clusters
			const newClusters = createClusters(experiences, zoom);
			setClusters(newClusters);

			// Remove existing markers efficiently
			const existingMarkers = document.querySelectorAll(
				".custom-marker, .cluster-marker",
			);
			existingMarkers.forEach((marker) => marker.remove());

			// Dynamically import mapboxgl for markers
			const { default: mapboxgl } = await import("mapbox-gl");

			// Create markers for each cluster
			newClusters.forEach((cluster) => {
				if (cluster.count === 1) {
					// Single marker - show individual experience
					const experience = cluster.experiences[0];
					const markerEl = createReactMarker(experience, setSelectedExperience);

					new mapboxgl.Marker(markerEl)
						.setLngLat([cluster.lng, cluster.lat])
						.addTo(map);
				} else {
					// Cluster marker - simple design matching original style
					const markerEl = document.createElement("div");
					markerEl.className = "cluster-marker";
					markerEl.innerHTML = `
					<div class="relative drop-shadow-lg">
						<div class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-200 border-4 border-white shadow-2xl"
							 style="background-color: #374151;">
							<div class="text-white font-bold text-sm">${cluster.count}</div>
						</div>
					</div>
				`;

					markerEl.addEventListener("click", (e) => {
						e.stopPropagation();
						setSelectedCluster(cluster.experiences);
					});

					new mapboxgl.Marker(markerEl)
						.setLngLat([cluster.lng, cluster.lat])
						.addTo(map);
				}
			});
		},
		[map],
	);

	// Create markers when map loads and we have issues - optimized
	useEffect(() => {
		if (!map || !mapLoaded || !filteredExperiences.length) return;

		const currentZoom = map.getZoom();
		createMarkers(filteredExperiences, currentZoom);
	}, [map, mapLoaded, filteredExperiences, createMarkers]);

	// Handle zoom changes with debouncing to prevent excessive re-renders
	useEffect(() => {
		if (!map) return;

		let timeoutId: NodeJS.Timeout;

		const handleZoomEnd = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				const currentZoom = map.getZoom();
				createMarkers(filteredExperiences, currentZoom);
			}, 150); // Debounce zoom changes
		};

		map.on("zoomend", handleZoomEnd);

		return () => {
			clearTimeout(timeoutId);
			if (map) {
				map.off("zoomend", handleZoomEnd);
			}
		};
	}, [map, filteredExperiences, createMarkers]);

	// Real-time location tracking with high accuracy
	const startLiveTracking = useCallback(() => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by this browser");
			return;
		}

		const options = MAP_CONFIG.LIVE_TRACKING_OPTIONS;

		const id = navigator.geolocation.watchPosition(
			(position) => {
				const newLocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				setUserLocation(newLocation);
				setLocationAccuracy(position.coords.accuracy);

				if (map) {
					mapOperations.flyToLocation(map, newLocation, 15);
				}
				console.log(
					"📍 Live location updated:",
					newLocation,
					`Accuracy: ${position.coords.accuracy}m`,
				);
			},
			(error) => {
				console.error("❌ Live tracking error:", error);
				setIsLiveTracking(false);
			},
			options,
		);

		setWatchId(id);
	}, [map]);

	const stopLiveTracking = useCallback(() => {
		if (watchId !== null) {
			navigator.geolocation.clearWatch(watchId);
			setWatchId(null);
		}
	}, [watchId]);

	// Toggle live tracking
	useEffect(() => {
		if (isLiveTracking) {
			startLiveTracking();
		} else {
			stopLiveTracking();
		}
	}, [isLiveTracking, startLiveTracking, stopLiveTracking]);

	if (isLoading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2" />
					<p className="text-gray-600 dark:text-gray-400">Loading map...</p>
				</div>
			</div>
		);
	}

	if (mapError) {
		// Check if it's a location permission error
		const isLocationError =
			mapError.includes("Location access denied") ||
			mapError.includes("denied");

		return (
			<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
				<Card className="w-full max-w-lg border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
							<MapPin className="h-10 w-10 text-white" />
						</div>
						<CardTitle className="font-bold text-2xl text-gray-900">
							{isLocationError
								? "Unlock Your Local Experience"
								: "Map Unavailable"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 text-center">
						{isLocationError ? (
							<>
								<div className="space-y-4">
									<p className="text-gray-700 text-lg leading-relaxed">
										🌟 <strong>You're missing out!</strong> Enable location
										access to unlock the full Broken Experiences magic.
									</p>

									<div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
										<h3 className="mb-3 font-semibold text-blue-900">
											✨ What you'll get with location:
										</h3>
										<div className="grid grid-cols-1 gap-2 text-blue-800 text-sm">
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-blue-500" />
												<span>📍 Find issues happening right around you</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-blue-500" />
												<span>🎯 Get personalized local recommendations</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-blue-500" />
												<span>
													🚀 Report issues with precise GPS coordinates
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 rounded-full bg-blue-500" />
												<span>🌈 Navigate to nearby community reports</span>
											</div>
										</div>
									</div>

									<div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
										<p className="text-amber-800 text-sm">
											<strong>⚠️ Without location:</strong> You'll only see a
											basic map without the personalized, location-aware
											features that make this app powerful.
										</p>
									</div>
								</div>

								<div className="space-y-3">
									<Button
										onClick={() => window.location.reload()}
										className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-lg text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
									>
										🔓 Enable Location & Retry
									</Button>

									<p className="text-gray-500 text-xs">
										Click "Allow" when your browser asks for location permission
									</p>
								</div>
							</>
						) : (
							<>
								<p className="text-gray-600">{mapError}</p>
								<Button
									onClick={() => window.location.reload()}
									className="w-full bg-gray-900 text-white hover:bg-gray-800"
								>
									Try Again
								</Button>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div
			className={`mobile-map-page fixed inset-0 h-screen w-full ${showSearchPanel ? "search-visible" : ""}`}
		>
			{/* Loading Overlay - only show for initial load */}
			{isLoading && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
					<div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-2xl">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
						<div className="text-center">
							<h3 className="font-semibold text-gray-900 text-lg">
								Loading Map
							</h3>
							<p className="text-gray-600 text-sm">
								Preparing your local experience...
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Map Container */}
			<div ref={mapContainerRef} className="h-full w-full" />

			{/* Search & Quick Actions Buttons */}
			{!showSearchPanel && !showQuickActions && (
				<div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
					<BackButton
						fallbackUrl="/home"
						variant="default"
						size="icon"
						className="shadow-lg backdrop-blur-sm"
					/>
					<Button
						size="icon"
						variant="default"
						className="shadow-lg"
						onClick={() => setShowSearchPanel(true)}
						data-search-button
					>
						<Search className="h-4 w-4" />
					</Button>
					<Button
						size="icon"
						variant="outline"
						className="bg-white shadow-lg"
						onClick={() => setShowQuickActions(true)}
					>
						<Compass className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Live Tracking Button */}
			<div className="absolute top-4 right-20 z-10">
				<Button
					size="icon"
					variant={isLiveTracking ? "default" : "outline"}
					className="bg-white shadow-lg"
					onClick={() => setIsLiveTracking(!isLiveTracking)}
				>
					<Navigation
						className={`h-4 w-4 ${isLiveTracking ? "text-blue-600" : ""}`}
					/>
				</Button>
			</div>

			{/* Location Accuracy Indicator */}
			{locationAccuracy && (
				<div className="absolute top-16 right-20 z-10">
					<Badge variant="secondary" className="text-xs">
						±{Math.round(locationAccuracy)}m
					</Badge>
				</div>
			)}

			{/* Quick Actions Panel */}
			{showQuickActions && (
				<div
					className="absolute top-4 right-4 left-4 z-20 max-w-sm rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900"
					data-quick-actions-panel
				>
					<div className="mb-3 flex items-center gap-2">
						<Compass className="h-4 w-4 text-blue-500" />
						<h3 className="font-semibold text-sm">Quick Actions</h3>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setShowQuickActions(false)}
							className="ml-auto"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<Button
							size="sm"
							variant="ghost"
							className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
							onClick={() => {
								if (userLocation && filteredExperiences.length > 0) {
									let closestExperience = filteredExperiences[0];
									let closestDistance = getDistance(
										userLocation.lat,
										userLocation.lng,
										Number(closestExperience.latitude),
										Number(closestExperience.longitude),
									);

									filteredExperiences.forEach((experience) => {
										const distance = getDistance(
											userLocation.lat,
											userLocation.lng,
											Number(experience.latitude),
											Number(experience.longitude),
										);
										if (distance < closestDistance) {
											closestDistance = distance;
											closestExperience = experience;
										}
									});

									mapOperations.flyToWithPitch(
										map,
										[
											Number(closestExperience.longitude),
											Number(closestExperience.latitude),
										],
										17,
										68,
									);

									setSelectedExperience(closestExperience);
									setShowQuickActions(false);
								}
							}}
						>
							<Navigation className="h-4 w-4" />
							<span>Find Nearest</span>
						</Button>

						<Button
							size="sm"
							variant="ghost"
							className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
							onClick={() => {
								setShowSearchPanel(true);
								setShowQuickActions(false);
							}}
						>
							<Search className="h-4 w-4" />
							<span>Search Issues</span>
						</Button>

						<Button
							size="sm"
							variant="ghost"
							className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
							onClick={() => {
								const recentIssues = filteredExperiences
									.sort((a, b) => {
										const dateA = new Date(a.createdAt);
										const dateB = new Date(b.createdAt);
										if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
											return 0; // Keep original order if dates are invalid
										}
										return dateB.getTime() - dateA.getTime();
									})
									.slice(0, 10);

								if (recentIssues.length > 0) {
									import("mapbox-gl").then(({ default: mapboxgl }) => {
										const bounds = new mapboxgl.LngLatBounds();
										recentIssues.forEach((experience) => {
											bounds.extend([
												Number(experience.longitude),
												Number(experience.latitude),
											]);
										});

										map?.fitBounds(bounds, {
											padding: 50,
											pitch: 68,
											duration: 1500,
										});
									});
								}
								setShowQuickActions(false);
							}}
						>
							<Timer className="h-4 w-4" />
							<span>Recent Issues</span>
						</Button>

						<Button
							size="sm"
							variant="ghost"
							className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
							onClick={() => {
								if (userLocation && map) {
									mapOperations.flyToLocation(map, userLocation, 16.5);
									setShowQuickActions(false);
								}
							}}
						>
							<Compass className="h-4 w-4" />
							<span>My Location</span>
						</Button>

						<Button
							size="sm"
							variant="ghost"
							className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
							onClick={() => {
								if (filteredExperiences.length > 0 && map) {
									import("mapbox-gl").then(({ default: mapboxgl }) => {
										const bounds = new mapboxgl.LngLatBounds();
										filteredExperiences.forEach((experience) => {
											bounds.extend([
												Number(experience.longitude),
												Number(experience.latitude),
											]);
										});

										map.fitBounds(bounds, {
											padding: 50,
											pitch: 0,
											duration: 2000,
										});
									});
									setShowQuickActions(false);
								}
							}}
						>
							<MapPin className="h-4 w-4" />
							<span>Show All ({filteredExperiences.length})</span>
						</Button>
					</div>
				</div>
			)}

			{/* Search Panel */}
			{showSearchPanel && (
				<div
					className="absolute top-4 right-4 left-4 z-20 max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900"
					data-search-panel
				>
					<div className="mb-3 flex items-center gap-2">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								placeholder="Search issues..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
								autoFocus
							/>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setShowSearchPanel(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Quick Filters */}
					<div className="mb-3 flex flex-wrap gap-2">
						<Button
							size="sm"
							variant={showLegend ? "default" : "outline"}
							onClick={() => setShowLegend(!showLegend)}
							className="text-xs"
						>
							<Info className="mr-1 h-3 w-3" />
							Legend
						</Button>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="mb-4 space-y-3">
							<div>
								<h4 className="mb-2 font-medium text-sm">Status</h4>
								<div className="flex flex-wrap gap-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<Button
											key={status}
											size="sm"
											variant={
												activeFilters.status.includes(status)
													? "default"
													: "outline"
											}
											onClick={() => toggleFilter("status", status)}
											className="text-xs"
										>
											<config.icon className="mr-1 h-3 w-3" />
											{config.label}
										</Button>
									))}
								</div>
							</div>
							{/* <div>
								<h4 className="mb-2 font-medium text-sm">Priority</h4>
								<div className="flex flex-wrap gap-2">
									{Object.entries(priorityConfig).map(([priority, config]) => (
										<Button
											key={priority}
											size="sm"
											variant={
												activeFilters.priority.includes(priority)
													? "default"
													: "outline"
											}
											onClick={() => toggleFilter("priority", priority)}
											className={`text-xs ${config.bgColor} ${config.textColor}`}
										>
											{priority.charAt(0).toUpperCase() + priority.slice(1)}
										</Button>
									))}
								</div>
							</div> */}
						</div>
					)}

					{/* Legend */}
					{showLegend && (
						<div className="mb-4 space-y-2">
							<h4 className="font-medium text-sm">Map Legend</h4>
							<div className="grid grid-cols-2 gap-2 text-xs">
								{categories.map((category) => {
									const styling = getCategoryStyling(category.name);
									const IconComponent = styling.icon;
									return (
										<div key={category.id} className="flex items-center gap-2">
											<div
												className="flex h-4 w-4 items-center justify-center rounded-full"
												style={{ backgroundColor: styling.color }}
											>
												<IconComponent className="h-2 w-2 text-white" />
											</div>
											<span className="text-gray-600 dark:text-gray-400">
												{category.name}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Search Results */}
					{searchQuery && (
						<div className="max-h-48 overflow-y-auto">
							<h4 className="mb-2 font-medium text-sm">
								Results ({filteredExperiences.length})
							</h4>
							{filteredExperiences.slice(0, 5).map((experience) => (
								<div
									key={experience.id}
									className="cursor-pointer rounded border-b p-2 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
									onClick={() => {
										setSelectedExperience(experience);
										if (map) {
											map.flyTo({
												center: [
													Number(experience.longitude),
													Number(experience.latitude),
												],
												zoom: 16,
												duration: 1000,
											});
										}
									}}
								>
									<h5 className="font-medium text-sm">{experience.title}</h5>
									<p className="truncate text-gray-600 text-xs dark:text-gray-400">
										{experience.description}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Cluster Modal */}
			{selectedCluster && (
				<div className="absolute right-4 bottom-4 left-4 z-20 mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
					<div className="mb-3 flex items-center justify-between">
						<h3 className="font-semibold text-lg">
							{selectedCluster.length} Issues in this area
						</h3>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setSelectedCluster(null)}
							className="shrink-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="max-h-64 space-y-2 overflow-y-auto">
						{selectedCluster.map((experience) => {
							const categoryName = experience.category?.name || "Other";
							const categoryStyling = getCategoryStyling(categoryName);
							const IconComponent = categoryStyling.icon;

							return (
								<div
									key={experience.id}
									className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
									onClick={() => {
										setSelectedExperience(experience);
										setSelectedCluster(null);
										if (map) {
											map.flyTo({
												center: [
													Number(experience.longitude),
													Number(experience.latitude),
												],
												zoom: 17,
												duration: 1000,
											});
										}
									}}
								>
									<div
										className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
										style={{ backgroundColor: categoryStyling.color }}
									>
										<IconComponent className="h-4 w-4 text-white" />
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="truncate font-medium text-sm">
											{experience.title}
										</h4>
										<p className="truncate text-gray-600 text-xs dark:text-gray-400">
											{experience.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Issue Details Panel */}
			{selectedExperience && (
				<div className="absolute right-4 bottom-4 left-4 z-20 mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
					<div className="mb-3 flex items-start justify-between">
						<div className="flex-1">
							<h3 className="mb-1 font-semibold text-lg">
								{selectedExperience.title}
							</h3>
							<p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
								{selectedExperience.description}
							</p>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setSelectedExperience(null)}
							className="shrink-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					{/* 
					<div className="mb-3 flex items-center gap-2">
						<Badge
							variant={
								selectedExperience.priority === "high"
									? "destructive"
									: selectedExperience.priority === "medium"
										? "default"
										: "secondary"
							}
						>
							{selectedExperience.priority}
						</Badge>
						<Badge
							variant="outline"
							className={statusConfig[selectedExperience.status].textColor}
						>
							{statusConfig[selectedExperience.status].label}
						</Badge>
						{selectedExperience.category && (
							<Badge variant="secondary">
								{selectedExperience.category.name || "Other"}
							</Badge>
						)}
					</div> */}

					{selectedExperience.address && (
						<p className="mb-3 flex items-center gap-1 text-gray-500 text-xs">
							<MapPin className="h-3 w-3" />
							{selectedExperience.address}
						</p>
					)}

					<div className="flex items-center justify-between">
						{/* Removed voting from map - users can vote from feed/details pages */}
						<div />

						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant={isNavigating ? "default" : "outline"}
								onClick={() => {
									if (userLocation && selectedExperience) {
										if (isNavigating) {
											clearRoute();
										} else {
											showRoute(userLocation, {
												lat: Number(selectedExperience.latitude),
												lng: Number(selectedExperience.longitude),
											});
										}
									}
								}}
							>
								<Route className="mr-1 h-3 w-3" />
								{isNavigating ? "Clear Route" : "Get Directions"}
							</Button>
							<Button size="sm" variant="outline" onClick={handleCopyLink}>
								<Share2 className="mr-1 h-3 w-3" />
								Share
							</Button>
						</div>
					</div>

					<div className="mt-2 border-t pt-2 text-gray-500 text-xs">
						Reported {(() => {
							try {
								const date = new Date(selectedExperience.createdAt);
								if (isNaN(date.getTime())) {
									return "Unknown date";
								}
								return date.toLocaleDateString();
							} catch (error) {
								return "Unknown date";
							}
						})()}
						{selectedExperience.status === "resolved" && (
							<span className="ml-2">• Resolved</span>
						)}
					</div>
				</div>
			)}

			{/* Navigation Panel */}
			{isNavigating && currentRoute && (
				<div
					className={`absolute right-4 bottom-4 z-20 rounded-lg bg-white shadow-lg transition-all duration-300 dark:bg-gray-900 ${
						navPanelMinimized ? "w-48" : "w-80"
					}`}
				>
					{/* Minimized State */}
					{navPanelMinimized ? (
						<div className="p-3">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Navigation className="h-4 w-4 text-blue-500" />
									<span className="font-medium text-sm">
										{(currentRoute.distance / 1000).toFixed(1)} km •{" "}
										{Math.round(currentRoute.duration / 60)} min
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Button
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={() => setNavPanelMinimized(false)}
									>
										<ChevronUp className="h-3 w-3" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={clearRoute}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
							{currentRoute.legs?.[0]?.steps?.[0] && (
								<div className="truncate text-gray-600 text-xs dark:text-gray-400">
									Next:{" "}
									{currentRoute.legs[0].steps[0].maneuver?.instruction ||
										"Continue straight"}
								</div>
							)}
						</div>
					) : (
						/* Expanded State */
						<div className="p-4">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Navigation className="h-4 w-4 text-blue-500" />
									<h3 className="font-semibold text-sm">Navigation</h3>
								</div>
								<div className="flex items-center gap-1">
									<Button
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={() => setNavPanelMinimized(true)}
									>
										<ChevronDown className="h-3 w-3" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={clearRoute}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>

							<div className="mb-3 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 text-sm dark:text-gray-400">
										Distance:
									</span>
									<span className="font-medium text-sm">
										{(currentRoute.distance / 1000).toFixed(1)} km
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 text-sm dark:text-gray-400">
										Duration:
									</span>
									<span className="font-medium text-sm">
										{Math.round(currentRoute.duration / 60)} min
									</span>
								</div>
							</div>

							<div className="max-h-32 space-y-1 overflow-y-auto">
								{currentRoute.legs?.[0]?.steps
									?.slice(0, 5)
									.map((step: any, index: number) => (
										<div
											key={index}
											className="flex items-start gap-2 rounded bg-gray-50 p-2 text-xs dark:bg-gray-800"
										>
											<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600 text-xs dark:bg-blue-900 dark:text-blue-400">
												{index + 1}
											</div>
											<p className="text-gray-700 leading-relaxed dark:text-gray-300">
												{step.maneuver?.instruction || "Continue straight"}
											</p>
										</div>
									))}
							</div>
						</div>
					)}
				</div>
			)}

			<style jsx>{`
				.mobile-map-page {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					z-index: 1000;
					width: 100vw;
					height: 100vh;
					overflow: hidden;
				}

				.mobile-map-page.search-visible {
					/* Adjust when search panel is visible */
				}

				.custom-marker, .cluster-marker {
					cursor: pointer;
					transition: transform 0.2s ease;
				}

				.custom-marker:hover, .cluster-marker:hover {
					transform: scale(1.1);
					z-index: 1000;
				}


				/* Mapbox popup styling */
				.mapboxgl-popup-content {
					border-radius: 8px;
					box-shadow: 0 10px 25px rgba(0,0,0,0.2);
				}

				.mapboxgl-popup-close-button {
					color: #374151;
					font-size: 20px;
				}

				/* Panel animations */
				.mobile-map-page [data-search-panel],
				.mobile-map-page [data-quick-actions-panel] {
					animation: slideInFromTop 0.3s ease-out;
				}

				@keyframes slideInFromTop {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
}
