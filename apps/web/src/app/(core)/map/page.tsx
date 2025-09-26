"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { 
	MapPin, 
	Filter, 
	Search, 
	AlertCircle, 
	CheckCircle, 
	Clock,
	ThumbsUp,
	X,
	Construction,
	Car,
	Lightbulb,
	TreePine,
	Trash2,
	Zap,
	Droplets,
	Shield,
	Building,
	ChevronUp,
	ChevronDown,
	Navigation,
	Route,
	Share2,
	Bookmark,
	Timer,
	User,
	Calendar,
	TrendingUp,
	ExternalLink,
	Info,
	Focus,
	ArrowUp,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	RotateCcw,
	Compass
} from "lucide-react";

// Using Elysia API backend (which connects to Supabase underneath)

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
		textColor: "text-red-700 dark:text-red-400"
	},
	pending: { 
		icon: Clock, 
		color: "#f59e0b", 
		label: "In Progress",
		bgColor: "bg-amber-100 dark:bg-amber-900/20",
		textColor: "text-amber-700 dark:text-amber-400"
	},
	resolved: { 
		icon: CheckCircle, 
		color: "#10b981", 
		label: "Resolved",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
		textColor: "text-emerald-700 dark:text-emerald-400"
	},
};

const severityConfig = {
	low: { scale: 0.8, zIndex: 1, color: "#10b981", bgColor: "bg-emerald-500", textColor: "text-white" },
	medium: { scale: 1.0, zIndex: 2, color: "#f59e0b", bgColor: "bg-amber-500", textColor: "text-white" },
	high: { scale: 1.2, zIndex: 3, color: "#ef4444", bgColor: "bg-red-500", textColor: "text-white" },
	critical: { scale: 1.4, zIndex: 4, color: "#dc2626", bgColor: "bg-red-600", textColor: "text-white" },
};

const categoryConfig = {
	infrastructure: { icon: Construction, color: "#8b5cf6", label: "Infrastructure" },
	traffic: { icon: Car, color: "#ef4444", label: "Traffic" },
	lighting: { icon: Lightbulb, color: "#f59e0b", label: "Lighting" },
	environment: { icon: TreePine, color: "#10b981", label: "Environment" },
	sanitation: { icon: Trash2, color: "#8b5cf6", label: "Sanitation" },
	utilities: { icon: Zap, color: "#06b6d4", label: "Utilities" },
	water: { icon: Droplets, color: "#3b82f6", label: "Water" },
	roads: { icon: Construction, color: "#f97316", label: "Roads" },
	safety: { icon: Shield, color: "#dc2626", label: "Safety" },
	other: { icon: Building, color: "#64748b", label: "Other" }
};

// Elysia Backend API functions
const getAllIssues = async (): Promise<Issue[]> => {
	console.log('🔄 Fetching all issues from Elysia API...');
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/issue`);
		
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const issues: Issue[] = await response.json();
		console.log(`✅ Successfully fetched ${issues.length} issues from Elysia API`);
		return issues;
	} catch (error) {
		console.error('❌ Failed to fetch issues from API:', error);
		return [];
	}
};

const updateIssueUpvotes = async (issueId: string): Promise<Issue | null> => {
	console.log(`🔄 Voting on issue ${issueId} via Elysia API...`);
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/issue/${issueId}/vote`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ type: 'upvote' })
		});

		if (!response.ok) {
			throw new Error(`Vote API error: ${response.status}`);
		}

		const updatedIssue: Issue = await response.json();
		console.log(`✅ Successfully voted on issue ${issueId}`);
		return updatedIssue;
	} catch (error) {
		console.error('❌ Failed to vote via API:', error);
		return null;
	}
};

export default function MapPage() {
	const mapRef = useRef<any>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<any>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
	const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
	const [activeFilters, setActiveFilters] = useState<{
		status: string[];
		severity: string[];
		category: string[];
	}>({
		status: [],
		severity: [],
		category: []
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
	const { settings } = useSettings();

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

		const options = {
			enableHighAccuracy: true,
			timeout: 15000,
			maximumAge: 60000
		};

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				setUserLocation(location);
				setLocationAccuracy(position.coords.accuracy);
				setIsLoading(false);
				console.log("✅ User location acquired:", location, `Accuracy: ${position.coords.accuracy}m`);
			},
			(error) => {
				console.error("❌ Location error:", error);
				// Set a default location (Jamaica) if geolocation fails
				const defaultLocation = { lat: 18.1096, lng: -77.2975 };
				setUserLocation(defaultLocation);
				setIsLoading(false);
				setMapError(`Location access denied. Please refresh the page and allow location access, or we'll use a default location. ${error.message}`);
			},
			options
		);
	}, []);

	useEffect(() => {
		requestLocation();
	}, []);

	// Fetch issues on mount - use Elysia API (which connects to Supabase)
	useEffect(() => {
		const initializeData = async () => {
			try {
				console.log("🚀 Loading data from Elysia API...");
				await loadRealData();
				console.log("✅ Successfully loaded data from API");
			} catch (error) {
				console.error("❌ Failed to load data from API:", error);
				// Only set empty array if API fails, no mock data
				setIssues([]);
			}
		};

		initializeData();
	}, []);

	const loadRealData = async () => {
		console.log("Loading data from Elysia API...");
		const realIssues = await getAllIssues();
		setIssues(realIssues);
		console.log(`✅ Loaded ${realIssues.length} issues from Elysia API`);
	};

	// Memoized filtering function for better performance
	const filteredIssuesMemo = useMemo(() => {
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

		// Apply category filters
		if (activeFilters.category.length > 0) {
			filtered = filtered.filter((issue) =>
				issue.categoryId && activeFilters.category.includes(issue.categoryId),
			);
		}

		// Apply debounced search query
		if (debouncedSearchQuery) {
			const searchLower = debouncedSearchQuery.toLowerCase();
			filtered = filtered.filter(
				(issue) =>
					issue.title.toLowerCase().includes(searchLower) ||
					issue.description.toLowerCase().includes(searchLower) ||
					(issue.address && issue.address.toLowerCase().includes(searchLower)),
			);
		}

		return filtered;
	}, [issues, activeFilters, debouncedSearchQuery]);

	// Update filtered issues when memo changes
	useEffect(() => {
		setFilteredIssues(filteredIssuesMemo);
	}, [filteredIssuesMemo]);

	const toggleFilter = (type: "status" | "severity" | "category", value: string) => {
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

	const handleVote = async (issueId: string) => {
		try {
			const updatedIssue = await updateIssueUpvotes(issueId);
			
			if (updatedIssue) {
				setIssues(prev => prev.map(issue => 
					issue.id === issueId ? updatedIssue : issue
				));
				if (selectedIssue?.id === issueId) {
					setSelectedIssue(updatedIssue);
				}
			}
		} catch (error) {
			console.error("Failed to vote:", error);
		}
	};

	// Initialize Mapbox when component mounts and user location is available
	useEffect(() => {
		if (!userLocation || !mapContainerRef.current) return;

		// Prevent multiple initializations
		if (map) return;

		const initializeMap = async () => {
			try {
				// Dynamically import mapboxgl to avoid SSR issues
				const mapboxgl = (await import('mapbox-gl')).default;

				// Telemetry blocking - comprehensive approach
				if (typeof window !== 'undefined') {
					// Block telemetry requests using transformRequest
					const originalFetch = window.fetch;
					window.fetch = ((input: any, init: any) => {
						const url = typeof input === 'string' ? input : input.url;
						if (url && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
							console.log('🚫 Blocked telemetry request:', url);
							return Promise.resolve(new Response());
						}
						return originalFetch(input, init);
					}) as typeof fetch;

					// Block XMLHttpRequest telemetry
					const OriginalXHR = window.XMLHttpRequest;
					window.XMLHttpRequest = function() {
						const xhr = new OriginalXHR();
						const originalOpen = xhr.open;
						xhr.open = function(method: string, url: string | URL, ...args: any[]) {
							if (typeof url === 'string' && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
								console.log('🚫 Blocked XHR telemetry request:', url);
								return;
							}
							return originalOpen.call(this, method, url, args[0], args[1], args[2]);
						};
						return xhr;
					} as any;
				}

				// Mapbox access token - using correct env var name
				mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidXNlciIsImEiOiJhYmMxMjMifQ.fake-token-replace-with-real';

				const mapInstance = new mapboxgl.Map({
					container: mapContainerRef.current!,
					style: 'mapbox://styles/mapbox/dark-v11',
					center: [userLocation.lng, userLocation.lat],
					zoom: 14,
					pitch: 60,
					bearing: 0,
					transformRequest: (url, resourceType) => {
						// Block all telemetry and analytics requests
						if (url.includes('events.mapbox.com') || 
							url.includes('api.mapbox.com/events') ||
							url.includes('/events/')) {
							console.log('🚫 Blocked telemetry:', url);
							return null;
						}
						return { url };
					}
				});

				mapInstance.on('load', () => {
					console.log("✅ Map loaded successfully");
					
					const layers = mapInstance.getStyle().layers;
					const labelLayerId = layers.find(
						(layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
					)?.id;
					mapInstance.addLayer({
						'id': 'add-3d-buildings',
						'source': 'composite',
						'source-layer': 'building',
						'filter': ['==', 'extrude', 'true'],
						'type': 'fill-extrusion',
						'minzoom': 15,
						'paint': {
							'fill-extrusion-color': '#aaa',
							'fill-extrusion-height': [
								'interpolate',
								['linear'],
								['zoom'],
								15,
								0,
								15.05,
								['get', 'height']
							],
							'fill-extrusion-base': [
								'interpolate',
								['linear'],
								['zoom'],
								15,
								0,
								15.05,
								['get', 'min_height']
							],
							'fill-extrusion-opacity': 0.6
						}
					}, labelLayerId);

					setTimeout(() => {
						mapInstance.flyTo({
							center: [userLocation.lng, userLocation.lat],
							zoom: 16.5,
							pitch: 60,
							bearing: 0,
							duration: 2500,
							essential: true
						});
					}, 500);

					setMapLoaded(true);
				});

				const nav = new mapboxgl.NavigationControl({
					visualizePitch: true,
					showZoom: false,
					showCompass: true
				});
				mapInstance.addControl(nav, 'top-right');

				// Add geolocate control with custom options and 3D view preserved
				const geolocate = new mapboxgl.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 0
					},
					trackUserLocation: true,
					showUserHeading: true,
					showAccuracyCircle: true,
					fitBoundsOptions: {
						maxZoom: 15, // Prevent zooming out too far
						pitch: 60,   // Maintain 3D tilt
						bearing: 0
					}
				});
				mapInstance.addControl(geolocate, 'top-right');
				
				setTimeout(() => {
					geolocate.trigger();
				}, 1000);

				// Add popup for location features with enhanced quick actions
				geolocate.on('geolocate', (e: any) => {
					console.log("📍 Geolocate triggered:", e);
					
					if (e.coords) {
						const newLocation = {
							lat: e.coords.latitude,
							lng: e.coords.longitude
						};
						
						setUserLocation(newLocation);
						setLocationAccuracy(e.coords?.accuracy || null);

						mapInstance.flyTo({
							center: [newLocation.lng, newLocation.lat],
							zoom: 16,
							pitch: 60,
							bearing: 0,
							duration: 1500
						});

						const popup = new mapboxgl.Popup({
							offset: 25,
							closeOnClick: false,
							className: 'location-popup'
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
							console.log("📍 Report issue at:", newLocation);
							alert(`Report issue at: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
							popup.remove();
						};

						(window as any).findNearbyIssues = () => {
							console.log("🔍 Finding nearby issues...");
							const nearby = filteredIssues.filter(issue => {
								const distance = getDistance(newLocation.lat, newLocation.lng, issue.latitude, issue.longitude);
								return distance <= 2;
							});
							
							console.log(`Found ${nearby.length} nearby issues`);
							
							if (nearby.length > 0) {
								const bounds = new mapboxgl.LngLatBounds();
								nearby.forEach(issue => {
									bounds.extend([issue.longitude, issue.latitude]);
								});
								bounds.extend([newLocation.lng, newLocation.lat]);
								
								mapInstance.fitBounds(bounds, {
									padding: 50,
									pitch: 60,
									duration: 1500
								});
								
								alert(`Found ${nearby.length} issues within 2km of your location!`);
							} else {
								alert("No issues found within 2km of your location.");
							}
							popup.remove();
						};

						(window as any).showClosestIssue = () => {
							console.log("🎯 Finding closest issue...");
						
						if (filteredIssues.length === 0) {
							alert("No issues available to show.");
							popup.remove();
							return;
						}
						
						// Find the closest issue
						let closestIssue = filteredIssues[0];
						let closestDistance = getDistance(newLocation.lat, newLocation.lng, closestIssue.latitude, closestIssue.longitude);
						
						filteredIssues.forEach(issue => {
							const distance = getDistance(newLocation.lat, newLocation.lng, issue.latitude, issue.longitude);
							if (distance < closestDistance) {
								closestDistance = distance;
								closestIssue = issue;
							}
						});
						
						// Fly to closest issue and select it
						mapInstance.flyTo({
							center: [closestIssue.longitude, closestIssue.latitude],
							zoom: 17,
							pitch: 60,
							duration: 2000
						});
						
						setSelectedIssue(closestIssue);
						console.log(`Closest issue: ${closestIssue.title} (${closestDistance.toFixed(2)}km away)`);
						popup.remove();
					};

					(window as any).shareLocation = () => {
						const locationText = `My location: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`;
						navigator.clipboard.writeText(locationText);
						console.log("📤 Location copied to clipboard");
						alert("Location copied to clipboard!");
						popup.remove();
					};

						setTimeout(() => {
							if (popup.isOpen()) popup.remove();
						}, 15000);
					}
				});

				setMap(mapInstance);
				mapRef.current = mapInstance;

			} catch (error) {
				console.error("❌ Map initialization failed:", error);
				setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
	const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
		const R = 6371; // Radius of the Earth in km
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
			Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c; // Distance in km
	};

	// Create markers when map loads and we have issues
	useEffect(() => {
		if (!map || !mapLoaded || !filteredIssues.length) return;

		console.log("🎯 Creating markers for", filteredIssues.length, "filtered issues");

		// Remove existing markers
		const existingMarkers = document.querySelectorAll('.custom-marker');
		existingMarkers.forEach(marker => marker.remove());

		// Dynamically import mapboxgl for markers
		import('mapbox-gl').then(({ default: mapboxgl }) => {
			// Create markers for each issue
			filteredIssues.forEach((issue) => {
				const severity = severityConfig[issue.severity];
				const category = categoryConfig[issue.categoryId as keyof typeof categoryConfig] || categoryConfig.other;
				
				const getIconSVG = (categoryId: string) => {
					const iconSVGs: Record<string, string> = {
						infrastructure: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
						traffic: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 8.3c-.2-.5-.8-.8-1.3-.8h-10.8c-.5 0-1.1.3-1.3.8L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
						lighting: '<path d="M15 14c.2-1 1.2-1 2.5-1s2.3 0 2.5 1c-.2 1-1.2 1-2.5 1s-2.3 0-2.5-1z"/><path d="M9 21c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-1H9v1z"/><path d="M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>',
						environment: '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 2l4 5.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z"/>',
						sanitation: '<path d="M3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6H3z"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6"/>',
						utilities: '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
						water: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
						roads: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
						safety: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .9-.99l7-1a1 1 0 0 1 .2 0l7 1A1 1 0 0 1 20 6Z"/><path d="m9 12 2 2 4-4"/>',
						other: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
					};
					return iconSVGs[categoryId] || iconSVGs.other;
				};

				const markerEl = document.createElement('div');
				markerEl.className = 'custom-marker';
				markerEl.innerHTML = `
					<div class="relative drop-shadow-lg">
						<div class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-200 border-4 border-white shadow-2xl"
							 style="background-color: ${category.color}; z-index: ${severity.zIndex};">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								${getIconSVG(issue.categoryId || 'other')}
							</svg>
						</div>
						<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg" 
							 style="background-color: ${severity.color};"></div>
						<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 opacity-50"
							 style="border-color: ${severity.color}; animation: pulse 2s infinite;"></div>
					</div>
				`;

				markerEl.addEventListener('click', (e) => {
					e.stopPropagation();
					setSelectedIssue(issue);
					console.log("📍 Issue selected:", issue.title);
				});
				new mapboxgl.Marker(markerEl)
					.setLngLat([issue.longitude, issue.latitude])
					.addTo(map);
			});

			console.log("✅ Zoom-responsive markers created successfully");
		});
	}, [map, mapLoaded, filteredIssues]);

	// Real-time location tracking with high accuracy
	const startLiveTracking = useCallback(() => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by this browser');
			return;
		}

		const options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 1000
		};

		const id = navigator.geolocation.watchPosition(
			(position) => {
				const newLocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				setUserLocation(newLocation);
				setLocationAccuracy(position.coords.accuracy);
				
				if (map) {
					map.flyTo({
						center: [newLocation.lng, newLocation.lat],
						zoom: 15,
						duration: 1000
					});
				}
				console.log("📍 Live location updated:", newLocation, `Accuracy: ${position.coords.accuracy}m`);
			},
			(error) => {
				console.error("❌ Live tracking error:", error);
				setIsLiveTracking(false);
			},
			options
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading map...</p>
				</div>
			</div>
		);
	}

	if (mapError) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-red-600 flex items-center gap-2">
							<AlertCircle className="h-5 w-5" />
							Map Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{mapError}</p>
						<Button onClick={() => window.location.reload()} className="w-full">
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className={`mobile-map-page md:fixed md:inset-0 w-full h-screen ${showSearchPanel ? 'search-visible' : ''}`}>
			{/* Loading Overlay */}
			{!mapLoaded && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 flex items-center gap-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<span>Loading map...</span>
					</div>
				</div>
			)}

			{/* Map Container */}
			<div ref={mapContainerRef} className="w-full h-full" />

			{/* Search & Quick Actions Buttons */}
			{!showSearchPanel && !showQuickActions && (
				<div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
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
						className="shadow-lg bg-white"
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
					className="shadow-lg bg-white"
					onClick={() => setIsLiveTracking(!isLiveTracking)}
				>
					<Navigation className={`h-4 w-4 ${isLiveTracking ? 'text-blue-600' : ''}`} />
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
					className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 z-20 max-w-sm"
					data-quick-actions-panel
				>
					<div className="flex items-center gap-2 mb-3">
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
							className="flex flex-col items-center gap-1 h-auto p-3 text-xs"
							onClick={() => {
								if (userLocation && filteredIssues.length > 0) {
									let closestIssue = filteredIssues[0];
									let closestDistance = getDistance(userLocation.lat, userLocation.lng, closestIssue.latitude, closestIssue.longitude);
									
									filteredIssues.forEach(issue => {
										const distance = getDistance(userLocation.lat, userLocation.lng, issue.latitude, issue.longitude);
										if (distance < closestDistance) {
											closestDistance = distance;
											closestIssue = issue;
										}
									});
									
									map?.flyTo({
										center: [closestIssue.longitude, closestIssue.latitude],
										zoom: 17,
										pitch: 60,
										duration: 2000
									});
									
									setSelectedIssue(closestIssue);
									setShowQuickActions(false);
								}
							}}
						>
							<Navigation className="h-4 w-4" />
							<span>Nearest</span>
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							className="flex flex-col items-center gap-1 h-auto p-3 text-xs"
							onClick={() => {
								if (userLocation) {
									const nearby = filteredIssues.filter(issue => {
										const distance = getDistance(userLocation.lat, userLocation.lng, issue.latitude, issue.longitude);
										return distance <= 2;
									});
									
									if (nearby.length > 0) {
										import('mapbox-gl').then(({ default: mapboxgl }) => {
											const bounds = new mapboxgl.LngLatBounds();
											nearby.forEach(issue => {
												bounds.extend([issue.longitude, issue.latitude]);
											});
											bounds.extend([userLocation.lng, userLocation.lat]);
											
											map?.fitBounds(bounds, {
												padding: 50,
												pitch: 60,
												duration: 1500
											});
										});
									}
									setShowQuickActions(false);
								}
							}}
						>
							<Focus className="h-4 w-4" />
							<span>Nearby</span>
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							className="flex flex-col items-center gap-1 h-auto p-3 text-xs"
							onClick={() => {
								const highPriority = filteredIssues.filter(issue => 
									issue.severity === 'high' || issue.severity === 'critical'
								);
								
								if (highPriority.length > 0) {
									import('mapbox-gl').then(({ default: mapboxgl }) => {
										const bounds = new mapboxgl.LngLatBounds();
										highPriority.forEach(issue => {
											bounds.extend([issue.longitude, issue.latitude]);
										});
										
										map?.fitBounds(bounds, {
											padding: 50,
											pitch: 60,
											duration: 1500
										});
									});
								}
								setShowQuickActions(false);
							}}
						>
							<AlertCircle className="h-4 w-4" />
							<span>High Priority</span>
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							className="flex flex-col items-center gap-1 h-auto p-3 text-xs"
							onClick={() => {
								if (userLocation && map) {
									map.flyTo({
										center: [userLocation.lng, userLocation.lat],
										zoom: 16.5,
										pitch: 60,
										duration: 1500
									});
									setShowQuickActions(false);
								}
							}}
						>
							<MapPin className="h-4 w-4" />
							<span>My Location</span>
						</Button>
					</div>
				</div>
			)}

			{/* Search Panel */}
			{showSearchPanel && (
				<div 
					className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 z-20 max-w-md"
					data-search-panel
				>
					<div className="flex items-center gap-2 mb-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
					<div className="flex gap-2 mb-3 flex-wrap">
						<Button
							size="sm"
							variant={showFilters ? "default" : "outline"}
							onClick={() => setShowFilters(!showFilters)}
							className="text-xs"
						>
							<Filter className="h-3 w-3 mr-1" />
							Filters
						</Button>
						<Button
							size="sm"
							variant={showLegend ? "default" : "outline"}
							onClick={() => setShowLegend(!showLegend)}
							className="text-xs"
						>
							<Info className="h-3 w-3 mr-1" />
							Legend
						</Button>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="space-y-3 mb-4">
							<div>
								<h4 className="text-sm font-medium mb-2">Status</h4>
								<div className="flex gap-2 flex-wrap">
									{Object.entries(statusConfig).map(([status, config]) => (
										<Button
											key={status}
											size="sm"
											variant={activeFilters.status.includes(status) ? "default" : "outline"}
											onClick={() => toggleFilter("status", status)}
											className="text-xs"
										>
											<config.icon className="h-3 w-3 mr-1" />
											{config.label}
										</Button>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-sm font-medium mb-2">Severity</h4>
								<div className="flex gap-2 flex-wrap">
									{Object.entries(severityConfig).map(([severity, config]) => (
										<Button
											key={severity}
											size="sm"
											variant={activeFilters.severity.includes(severity) ? "default" : "outline"}
											onClick={() => toggleFilter("severity", severity)}
											className={`text-xs ${config.bgColor} ${config.textColor}`}
										>
											{severity.charAt(0).toUpperCase() + severity.slice(1)}
										</Button>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Legend */}
					{showLegend && (
						<div className="space-y-2 mb-4">
							<h4 className="text-sm font-medium">Map Legend</h4>
							<div className="grid grid-cols-2 gap-2 text-xs">
								{Object.entries(categoryConfig).map(([category, config]) => (
									<div key={category} className="flex items-center gap-2">
										<div 
											className="w-4 h-4 rounded-full flex items-center justify-center"
											style={{ backgroundColor: config.color }}
										>
											<config.icon className="h-2 w-2 text-white" />
										</div>
										<span className="text-gray-600 dark:text-gray-400">{config.label}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Search Results */}
					{searchQuery && (
						<div className="max-h-48 overflow-y-auto">
							<h4 className="text-sm font-medium mb-2">Results ({filteredIssues.length})</h4>
							{filteredIssues.slice(0, 5).map((issue) => (
								<div
									key={issue.id}
									className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer border-b last:border-b-0"
									onClick={() => {
										setSelectedIssue(issue);
										if (map) {
											map.flyTo({
												center: [issue.longitude, issue.latitude],
												zoom: 16,
												duration: 1000
											});
										}
									}}
								>
									<h5 className="font-medium text-sm">{issue.title}</h5>
									<p className="text-xs text-gray-600 dark:text-gray-400 truncate">
										{issue.description}
									</p>
									<div className="flex items-center gap-2 mt-1">
										<Badge
											variant={issue.severity === 'high' ? 'destructive' : 
													issue.severity === 'medium' ? 'default' : 'secondary'}
											className="text-xs"
										>
											{issue.severity}
										</Badge>
										<span className="text-xs text-gray-500">
											👍 {issue.upvotes}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Issue Details Panel */}
			{selectedIssue && (
				<div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 z-20 max-w-md mx-auto">
					<div className="flex items-start justify-between mb-3">
						<div className="flex-1">
							<h3 className="font-semibold text-lg mb-1">{selectedIssue.title}</h3>
							<p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
								{selectedIssue.description}
							</p>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setSelectedIssue(null)}
							className="shrink-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="flex items-center gap-2 mb-3">
						<Badge
							variant={selectedIssue.severity === 'high' ? 'destructive' : 
									selectedIssue.severity === 'medium' ? 'default' : 'secondary'}
						>
							{selectedIssue.severity}
						</Badge>
						<Badge variant="outline" className={statusConfig[selectedIssue.status].textColor}>
							{statusConfig[selectedIssue.status].label}
						</Badge>
						{selectedIssue.categoryId && (
							<Badge variant="secondary">
								{categoryConfig[selectedIssue.categoryId as keyof typeof categoryConfig]?.label || 'Other'}
							</Badge>
						)}
					</div>

					{selectedIssue.address && (
						<p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{selectedIssue.address}
						</p>
					)}

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								size="sm"
								variant="ghost"
								className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
								onClick={(e) => {
									e.stopPropagation();
									handleVote(selectedIssue.id);
								}}
							>
								<ThumbsUp className="h-4 w-4" />
								<span className="font-medium">{selectedIssue.upvotes}</span>
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<Button 
								size="sm" 
								variant="outline"
								onClick={() => {
									if (userLocation && selectedIssue) {
										// Open directions in default map app
										const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedIssue.latitude},${selectedIssue.longitude}`;
										window.open(url, '_blank');
									}
								}}
							>
								<Route className="h-3 w-3 mr-1" />
								Directions
							</Button>
							<Button 
								size="sm" 
								variant="outline"
								onClick={() => {
									if (selectedIssue) {
										// Copy issue location to clipboard
										const shareText = `Check out this issue: ${selectedIssue.title} at ${selectedIssue.latitude},${selectedIssue.longitude}`;
										navigator.clipboard.writeText(shareText);
									}
								}}
							>
								<Share2 className="h-3 w-3 mr-1" />
								Share
							</Button>
						</div>
					</div>

					<div className="text-xs text-gray-500 mt-2 pt-2 border-t">
						Reported {new Date(selectedIssue.createdAt).toLocaleDateString()}
						{selectedIssue.resolvedAt && (
							<span className="ml-2">
								• Resolved {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
							</span>
						)}
					</div>
				</div>
			)}

			<style jsx>{`
				.mobile-map-page {
					position: relative;
				}

				@media (max-width: 768px) {
					.mobile-map-page {
						position: fixed;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						z-index: 1000;
					}

					.mobile-map-page.search-visible {
						/* Adjust when search panel is visible on mobile */
					}
				}

				.custom-marker {
					cursor: pointer;
					transition: transform 0.2s ease;
				}

				.custom-marker:hover {
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