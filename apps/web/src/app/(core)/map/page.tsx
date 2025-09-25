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
	other: { icon: MapPin, color: "#6366f1", label: "Other" }
};

// Helper function to get icon SVG paths based on category
const getIconPath = (categoryId: string) => {
	// Use exact Lucide React icon paths to match the legend
	const iconPaths: { [key: string]: string } = {
		// Construction icon (simple hammer and wrench)
		infrastructure: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
		// Car icon (matches legend)
		roads: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		// Lightbulb icon (matches legend)
		lighting: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4",
		// TreePine icon (matches legend)  
		environment: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2a1 1 0 0 1-.8-1.7L12 2l4 5.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z M12 22v-3",
		// Trash2 icon (matches legend)
		sanitation: "M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2 M10 11v6 M14 11v6",
		// Zap icon (matches legend)
		utilities: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
		// Droplets icon (matches legend)
		water: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.14 3 12.25c0 2.22 1.8 4.05 4 4.05z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.26 4.89 4.56 6.96a7.93 7.93 0 0 1 2.78 3.52c.22.58.33 1.21.33 1.84C21.67 17.9 20.14 20 18 20c-2.08 0-3.8-1.88-3.8-4.13 0-1.48.73-2.96 1.87-3.96l.49-.69z",
		// Shield icon (matches legend)
		safety: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
		// Building icon (matches legend)
		building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12h12 M6 16h12 M10 6h4 M10 10h4",
		// Car icon for traffic (same as roads)
		traffic: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		// AlertCircle for vandalism  
		vandalism: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
		// MapPin for other/default
		other: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
	};
	return iconPaths[categoryId] || iconPaths.other;
};

// Helper function to get darker color for gradient
const getDarkerColor = (color: string) => {
	const colorMap: { [key: string]: string } = {
		'#ef4444': '#dc2626', // red-500 to red-600
		'#f59e0b': '#d97706', // amber-500 to amber-600  
		'#10b981': '#059669', // emerald-500 to emerald-600
	};
	return colorMap[color] || color;
};

// Helper function to get category icon (placeholder)
const getCategoryIcon = (categoryId: string) => {
	return getIconPath(categoryId);
};

export default function MapPage() {
	const { settings } = useSettings();
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<any>(null);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
	const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
	const permanentUserMarkerRef = useRef<any>(null);
	const [activeFilters, setActiveFilters] = useState<{
		status: string[];
		severity: string[];
	}>({
		status: [],
		severity: []
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [showLegend, setShowLegend] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [showSearchPanel, setShowSearchPanel] = useState(false);
	const [showUserLocationPopup, setShowUserLocationPopup] = useState(false);
	const [userLocationPopupPosition, setUserLocationPopupPosition] = useState<{x: number, y: number} | null>(null);
	const [showQuickFeatures, setShowQuickFeatures] = useState(false);

	// Rate limiting and throttling state
	const [apiCallCount, setApiCallCount] = useState(0);
	const [lastApiCallTime, setLastApiCallTime] = useState(0);
	const [apiCallCache, setApiCallCache] = useState(new Map());
	const [rateLimitRetryCount, setRateLimitRetryCount] = useState(0);
	const [consecutiveFailures, setConsecutiveFailures] = useState(0);
	const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
	
	// API rate limiting configuration
	const API_RATE_LIMIT = {
		maxCallsPerMinute: 50, // Conservative limit for Mapbox
		maxCallsPerHour: 1000,
		minTimeBetweenCalls: 1000, // 1 second minimum between calls
		cacheExpiryTime: 5 * 60 * 1000, // 5 minutes cache
		maxRetries: 3,
		baseRetryDelay: 1000, // 1 second base delay
		circuitBreakerThreshold: 5, // Open circuit after 5 consecutive failures
		circuitBreakerTimeout: 60000 // 1 minute timeout for circuit breaker
	};
	const [isLoading, setIsLoading] = useState(true);
	const [mapError, setMapError] = useState<string | null>(null);
	const [cardExpanded, setCardExpanded] = useState(false);
	const [bookmarkedIssues, setBookmarkedIssues] = useState<Set<string>>(new Set());
	const [drawnRoute, setDrawnRoute] = useState<any>(null);
	const [userLocationMarker, setUserLocationMarker] = useState<any>(null);
	const [distanceLine, setDistanceLine] = useState<any>(null);
	const [routeDirections, setRouteDirections] = useState<any>(null);
	const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
	const [showDirections, setShowDirections] = useState(false);
	
	// Real-time location tracking states
	const [isLiveTracking, setIsLiveTracking] = useState(false);
	const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
	const [watchPositionId, setWatchPositionId] = useState<number | null>(null);

	// Debounced search to improve performance
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);
		
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Auto-close search panel when not actively being used
	useEffect(() => {
		if (showSearchPanel && !searchQuery && !showFilters && !showLegend) {
			// Auto-close after 5 seconds of inactivity if search is empty
			const autoCloseTimer = setTimeout(() => {
				setShowSearchPanel(false);
			}, 5000);

			return () => clearTimeout(autoCloseTimer);
		}
	}, [showSearchPanel, searchQuery, showFilters, showLegend]);

	// Close search panel when clicking on the map (outside search area)
	useEffect(() => {
		const handleMapClick = (e: MouseEvent) => {
			// Check if click is outside the search panel area
			const target = e.target as HTMLElement;
			const searchPanel = target.closest('[data-search-panel]');
			const searchButton = target.closest('[data-search-button]');
			
			if (!searchPanel && !searchButton && showSearchPanel && !searchQuery) {
				setShowSearchPanel(false);
			}
		};

		if (showSearchPanel) {
			document.addEventListener('click', handleMapClick);
			return () => document.removeEventListener('click', handleMapClick);
		}
	}, [showSearchPanel, searchQuery]);

	// Auto-close search when an issue is selected (from marker click or search result)
	useEffect(() => {
		if (selectedIssue && showSearchPanel && !searchQuery) {
			// Close search panel when viewing an issue
			const closeTimer = setTimeout(() => {
				setShowSearchPanel(false);
			}, 1000); // Give user time to see the transition

			return () => clearTimeout(closeTimer);
		}
	}, [selectedIssue, showSearchPanel, searchQuery]);

	// Real-time location tracking with high accuracy
	const startLiveTracking = useCallback(() => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by this browser');
			return;
		}

		setIsLiveTracking(true);
		
		const watchId = navigator.geolocation.watchPosition(
			(position) => {
				const { latitude, longitude, accuracy, heading } = position.coords;
				
				console.log('Live location update:', {
					lat: latitude,
					lng: longitude,
					accuracy: accuracy + ' meters',
					heading: heading,
					timestamp: new Date().toLocaleTimeString()
				});

				// Update location state
				setUserLocation({ lat: latitude, lng: longitude });
				setLocationAccuracy(accuracy);
				updatePermanentUserMarker(latitude, longitude);
				
				// Update map center to follow user (use original method for live tracking)
				if (map.current && (window as any).originalMapMethods) {
					(window as any).originalMapMethods.easeTo.call(map.current, {
						center: [longitude, latitude],
						zoom: map.current.getZoom(), // Keep current zoom
						pitch: map.current.getPitch(), // Keep current 3D tilt
						bearing: map.current.getBearing(), // Keep current rotation unless updated by compass
						duration: 1000, // Smooth 1-second animation
						essential: true
					});
				}

				// Update compass heading if available from GPS
				if (heading !== null && heading !== undefined) {
					setDeviceHeading(heading);
					if (map.current && (window as any).originalMapMethods) {
						(window as any).originalMapMethods.easeTo.call(map.current, {
							bearing: heading,
							duration: 500
						});
					}
				}
			},
			(error) => {
				console.error('Live tracking error:', error);
				setIsLiveTracking(false);
				alert('Failed to get location. Please check location permissions.');
			},
			{
				enableHighAccuracy: true,
				timeout: 15000, // Allow sufficient time for GPS accuracy
				maximumAge: 5000 // Use very fresh location data (5 seconds)
			}
		);

		setWatchPositionId(watchId);
	}, []);

	const stopLiveTracking = useCallback(() => {
		setIsLiveTracking(false);
		
		if (watchPositionId !== null) {
			navigator.geolocation.clearWatch(watchPositionId);
			setWatchPositionId(null);
		}
		
		setDeviceHeading(null);
		setLocationAccuracy(null);
	}, [watchPositionId]);

	// Device orientation and real-time location tracking
	useEffect(() => {
		let orientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;

		const startOrientationTracking = () => {
			if ('DeviceOrientationEvent' in window) {
				orientationHandler = (event: DeviceOrientationEvent) => {
					if (event.alpha !== null) {
						// Convert compass heading (0-360°) where 0° is North
						const heading = event.alpha;
						setDeviceHeading(heading);
						
						// Update map bearing if live tracking is enabled
						if (isLiveTracking && map.current && (window as any).originalMapMethods) {
							(window as any).originalMapMethods.easeTo.call(map.current, {
								bearing: heading,
								duration: 200 // Quick orientation update
							});
						}
					}
				};

				// Request permission for iOS devices
				if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
					(DeviceOrientationEvent as any).requestPermission()
						.then((response: string) => {
							if (response === 'granted') {
								window.addEventListener('deviceorientation', orientationHandler);
							}
						})
						.catch(console.error);
				} else {
					// For Android and other devices
					window.addEventListener('deviceorientation', orientationHandler);
				}
			}
		};

		if (isLiveTracking) {
			startOrientationTracking();
		}

		return () => {
			if (orientationHandler) {
				window.removeEventListener('deviceorientation', orientationHandler);
			}
		};
	}, [isLiveTracking]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (watchPositionId !== null) {
				navigator.geolocation.clearWatch(watchPositionId);
			}
		};
	}, [watchPositionId]);

	// Category emojis for better visibility  
	const categoryLabels = useMemo(() => ({
		lighting: '💡',
		roads: '🚗',
		water: '💧',
		traffic: '🚦',
		sanitation: '🗑️',
		environment: '🌲',
		utilities: '⚡',
		infrastructure: '🏗️',
		safety: '🛡️',
		other: '📍'
	}), []);

	// Rate limiting and throttling utility functions
	const generateCacheKey = (userLng: number, userLat: number, targetLng: number, targetLat: number, profile: string = 'driving') => {
		// Round coordinates to reduce cache size while maintaining accuracy
		const roundedUserLng = Math.round(userLng * 10000) / 10000;
		const roundedUserLat = Math.round(userLat * 10000) / 10000;
		const roundedTargetLng = Math.round(targetLng * 10000) / 10000;
		const roundedTargetLat = Math.round(targetLat * 10000) / 10000;
		return `${profile}_${roundedUserLng},${roundedUserLat}-${roundedTargetLng},${roundedTargetLat}`;
	};

	const isRateLimited = () => {
		const now = Date.now();
		const timeSinceLastCall = now - lastApiCallTime;
		
		// Check minimum time between calls
		if (timeSinceLastCall < API_RATE_LIMIT.minTimeBetweenCalls) {
			return true;
		}
		
		// Reset counter every minute
		if (timeSinceLastCall > 60000) {
			setApiCallCount(0);
		}
		
		// Check calls per minute limit
		if (apiCallCount >= API_RATE_LIMIT.maxCallsPerMinute) {
			return true;
		}
		
		return false;
	};

	const getCachedRoute = (cacheKey: string) => {
		const cached = apiCallCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < API_RATE_LIMIT.cacheExpiryTime) {
			return cached.data;
		}
		return null;
	};

	const setCachedRoute = (cacheKey: string, data: any) => {
		setApiCallCache(prev => {
			const newCache = new Map(prev);
			newCache.set(cacheKey, {
				data,
				timestamp: Date.now()
			});
			
			// Clean old cache entries (keep only last 100 entries)
			if (newCache.size > 100) {
				const entries = Array.from(newCache.entries());
				entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
				const newMap = new Map(entries.slice(0, 100));
				return newMap;
			}
			
			return newCache;
		});
	};

	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Debounce utility for preventing rapid API calls
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const debounce = (func: Function, delay: number) => {
		return (...args: any[]) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			debounceRef.current = setTimeout(() => func(...args), delay);
		};
	};

	const makeThrottledApiCall = async (url: string, cacheKey: string, retryCount = 0): Promise<any> => {
		// Check cache first
		const cachedResult = getCachedRoute(cacheKey);
		if (cachedResult) {
			console.log('Using cached route data');
			return cachedResult;
		}

		// Check circuit breaker
		if (circuitBreakerOpen) {
			setRateLimitMessage('Service temporarily unavailable. Please wait before trying again.');
			throw new Error('Circuit breaker is open. Service temporarily unavailable.');
		}

		// Check rate limits
		if (isRateLimited()) {
			if (retryCount < API_RATE_LIMIT.maxRetries) {
				const delay = API_RATE_LIMIT.baseRetryDelay * Math.pow(2, retryCount);
				setRateLimitMessage(`Please wait ${Math.ceil(delay/1000)} seconds before requesting another route...`);
				console.log(`Rate limited. Retrying in ${delay}ms...`);
				await sleep(delay);
				setRateLimitMessage(null);
				return makeThrottledApiCall(url, cacheKey, retryCount + 1);
			} else {
				setRateLimitMessage('Too many requests. Please wait a moment before trying again.');
				throw new Error('Rate limit exceeded. Please try again later.');
			}
		}

		try {
			// Update rate limiting counters
			setApiCallCount(prev => prev + 1);
			setLastApiCallTime(Date.now());
			
			const response = await fetch(url);
			
			if (!response.ok) {
				if (response.status === 429) {
					// Rate limited by API
					if (retryCount < API_RATE_LIMIT.maxRetries) {
						const delay = API_RATE_LIMIT.baseRetryDelay * Math.pow(2, retryCount);
						setRateLimitMessage(`Server busy. Retrying in ${Math.ceil(delay/1000)} seconds...`);
						console.log(`API rate limited. Retrying in ${delay}ms...`);
						await sleep(delay);
						setRateLimitMessage(null);
						return makeThrottledApiCall(url, cacheKey, retryCount + 1);
					} else {
						setRateLimitMessage('Service temporarily unavailable. Please try again later.');
						throw new Error('API rate limit exceeded. Please try again later.');
					}
				}
				throw new Error(`API request failed: ${response.status}`);
			}
			
			const data = await response.json();
			
			// Cache successful response
			setCachedRoute(cacheKey, data);
			setRateLimitRetryCount(0); // Reset retry count on success
			setConsecutiveFailures(0); // Reset failure count on success
			
			return data;
		} catch (error) {
			console.error('API call failed:', error);
			
			// Enhanced error handling and circuit breaker management
			setConsecutiveFailures(prev => {
				const newFailureCount = prev + 1;
				if (newFailureCount >= API_RATE_LIMIT.circuitBreakerThreshold) {
					setCircuitBreakerOpen(true);
					setRateLimitMessage('Multiple request failures detected. Service paused temporarily.');
					// Auto-recover after timeout
					setTimeout(() => {
						setCircuitBreakerOpen(false);
						setConsecutiveFailures(0);
						console.log('Circuit breaker reset');
					}, API_RATE_LIMIT.circuitBreakerTimeout);
				}
				return newFailureCount;
			});

			if (error instanceof TypeError && error.message.includes('fetch')) {
				setRateLimitMessage('Network connection issue. Please check your internet connection.');
			} else if (error instanceof Error) {
				if (error.message.includes('Rate limit') || error.message.includes('rate limit')) {
					// Rate limit message already set above
				} else {
					setRateLimitMessage('Unable to calculate route. Please try again later.');
				}
			}
			
			throw error;
		}
	};

	// Function to calculate distance between two coordinates
	const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
		const R = 6371; // Radius of the Earth in kilometers
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLng = (lng2 - lng1) * Math.PI / 180;
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
			Math.sin(dLng/2) * Math.sin(dLng/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		const distance = R * c; // Distance in kilometers
		return distance;
	};

	// Enhanced distance display with walking time estimation
	const getDistanceInfo = (issue: Issue) => {
		if (!userLocation) return null;
		
		const distance = calculateDistance(userLocation.lat, userLocation.lng, issue.latitude, issue.longitude);
		const walkingTime = Math.round(distance * 12); // Rough estimate: 12 minutes per km
		const drivingTime = Math.round(distance * 2); // Rough estimate: 2 minutes per km
		
		return {
			distance: distance.toFixed(1),
			walkingTime,
			drivingTime,
			isNearby: distance < 1
		};
	};

	// Draw route between user location and issue
	const drawRoute = async (issue: Issue) => {
		if (!userLocation || !map.current) return;

		// Remove existing route
		clearRoute();

		try {
			// Create a simple straight line route
			const routeCoordinates = [
				[userLocation.lng, userLocation.lat],
				[issue.longitude, issue.latitude]
			];

			const routeGeoJSON = {
				type: 'Feature' as const,
				properties: {},
				geometry: {
					type: 'LineString' as const,
					coordinates: routeCoordinates
				}
			};

			// Add route source
			map.current.addSource('route', {
				type: 'geojson',
				data: routeGeoJSON
			});

			// Add route layer
			map.current.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': '#62B1F6', // Bright blue for dark theme
					'line-width': 6,
					'line-opacity': 1
				}
			});

			setDrawnRoute(routeGeoJSON);

			// Fit map to show route
			if (!(window as any).mapboxgl) {
				console.error('Mapbox GL not loaded');
				return;
			}
			const bounds = new (window as any).mapboxgl.LngLatBounds()
				.extend([userLocation.lng, userLocation.lat])
				.extend([issue.longitude, issue.latitude]);
			
			map.current.fitBounds(bounds, { 
				padding: 50, 
				duration: 1000,
				pitch: 0, // Keep flat view
				bearing: 0 // North-up orientation
			});

		} catch (error) {
			console.error('Error drawing route:', error);
		}
	};

	// Clear drawn route
	const clearRoute = () => {
		if (!map.current) return;

		try {
			if (map.current.getLayer('route')) {
				map.current.removeLayer('route');
			}
			if (map.current.getSource('route')) {
				map.current.removeSource('route');
			}
		} catch (error) {
			console.log('Error clearing route:', error);
		}

		setDrawnRoute(null);
	};

	// Bookmark/unbookmark issue
	const toggleBookmark = (issueId: string) => {
		setBookmarkedIssues(prev => {
			const newSet = new Set(prev);
			if (newSet.has(issueId)) {
				newSet.delete(issueId);
			} else {
				newSet.add(issueId);
			}
			return newSet;
		});
	};

	// Share issue
	const shareIssue = async (issue: Issue) => {
		const shareData = {
			title: issue.title,
			text: `Check out this community issue: ${issue.description}`,
			url: `${window.location.origin}${window.location.pathname}?issue=${issue.id}`
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				// Fallback: copy to clipboard
				await navigator.clipboard.writeText(
					`${shareData.title}\n${shareData.text}\n${shareData.url}`
				);
				console.log('Issue details copied to clipboard!');
			}
		} catch (error) {
			console.error('Error sharing:', error);
		}
	};

	// Get time ago display
	const getTimeAgo = (date: Date | string) => {
		const now = new Date();
		const dateObj = new Date(date);
		const diffMs = now.getTime() - dateObj.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor(diffMs / (1000 * 60));

		if (diffDays > 0) return `${diffDays}d ago`;
		if (diffHours > 0) return `${diffHours}h ago`;
		if (diffMinutes > 0) return `${diffMinutes}m ago`;
		return 'Just now';
	};

	// Format duration from seconds to readable format
	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	// Format distance from meters to readable format
	const formatDistance = (meters: number) => {
		if (meters >= 1000) {
			return `${(meters / 1000).toFixed(1)} km`;
		}
		return `${Math.round(meters)} m`;
	};

	// Get direction icon based on maneuver type
	const getDirectionIcon = (maneuver: string) => {
		const type = maneuver.toLowerCase();
		if (type.includes('turn right') || type.includes('right')) return ArrowRight;
		if (type.includes('turn left') || type.includes('left')) return ArrowLeft;
		if (type.includes('straight') || type.includes('continue')) return ArrowUp;
		if (type.includes('u-turn') || type.includes('uturn')) return RotateCcw;
		if (type.includes('arrive') || type.includes('destination')) return MapPin;
		if (type.includes('depart') || type.includes('start')) return Compass;
		return ArrowUp; // Default
	};

	// Internal function for showing distance view (not debounced)
	const _showDistanceView = async (issue: Issue) => {
		if (!userLocation || !map.current || !mapLoaded) {
			console.warn('Cannot show distance view: map not ready');
			return;
		}

		// Clear any existing distance markers and lines
		clearDistanceView();

		try {
			// Create user location marker
			const userMarkerEl = document.createElement('div');
			userMarkerEl.className = 'user-location-marker';
			userMarkerEl.style.cssText = `
				width: 20px;
				height: 20px;
				background-color: #3b82f6;
				border: 3px solid white;
				border-radius: 50%;
				box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
				position: absolute;
				transform: translate(-50%, -50%);
				animation: pulse 2s infinite;
			`;

			// Add pulsing animation CSS if not already added
			if (!document.getElementById('user-marker-styles')) {
				const style = document.createElement('style');
				style.id = 'user-marker-styles';
				style.textContent = `
					@keyframes pulse {
						0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
						70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
						100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
					}
				`;
				document.head.appendChild(style);
			}

			// Create and add user location marker
			if (!(window as any).mapboxgl) {
				console.error('Mapbox GL not loaded');
				return;
			}
			const userMarker = new (window as any).mapboxgl.Marker({
				element: userMarkerEl,
				anchor: 'center'
			})
				.setLngLat([userLocation.lng, userLocation.lat])
				.addTo(map.current);

			setUserLocationMarker(userMarker);

			// Get actual route using Mapbox Directions API with detailed steps and rate limiting
			try {
				let accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
				
				// Fallback to the known token if env var isn't working
				if (!accessToken) {
					accessToken = 'pk.eyJ1IjoiZG91Z3kxMjMiLCJhIjoiY2xpbTZmMDloMGJhcjNycDh5dGw3YW1uZCJ9.-yKIfcvvW8cdD3NRAuxBBw';
					console.warn('Using fallback Mapbox token for directions API');
				}
				
				if (!accessToken) {
					console.error('Mapbox access token missing for directions API');
					return;
				}
				
				// Use higher precision coordinates (6 decimal places)
				const fromCoords = `${userLocation.lng.toFixed(6)},${userLocation.lat.toFixed(6)}`;
				const toCoords = `${issue.longitude.toFixed(6)},${issue.latitude.toFixed(6)}`;
				
				// Try driving first, then walking as fallback
				const profiles = ['driving', 'walking'];
				let routeData = null;
				
				for (const profile of profiles) {
					const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromCoords};${toCoords}?geometries=geojson&steps=true&overview=full&alternatives=false&continue_straight=false&annotations=duration,distance&access_token=${accessToken}`;
					
					// Generate cache key for this route
					const cacheKey = generateCacheKey(userLocation.lng, userLocation.lat, issue.longitude, issue.latitude, profile);
					
					try {
						// Use throttled API call with caching and rate limiting
						const data = await makeThrottledApiCall(directionsUrl, cacheKey);
						
						if (data.routes && data.routes.length > 0 && data.routes[0].geometry && data.routes[0].geometry.coordinates.length > 1) {
							routeData = data;
							console.log(`Successfully got ${profile} route with ${data.routes[0].geometry.coordinates.length} points`);
							break;
						}
					} catch (profileError) {
						console.warn(`${profile} routing failed:`, profileError);
						continue;
					}
				}
				
				if (!routeData) {
					throw new Error('No valid route found with any profile');
				}
				
				const data = routeData;
				
				console.log('Directions API response:', data);

				if (data.routes && data.routes.length > 0) {
					const route = data.routes[0];
					const routeGeometry = route.geometry;
					
					// Validate route geometry
					if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length === 0) {
						console.error('Invalid route geometry received');
						throw new Error('Invalid route geometry');
					}
					
					console.log('Route geometry coordinates count:', routeGeometry.coordinates.length);
					console.log('Route distance:', route.distance, 'meters');
					console.log('Route duration:', route.duration, 'seconds');

					// Store detailed route information
					setRouteDirections({
						duration: route.duration,
						distance: route.distance,
						steps: route.legs[0].steps,
						summary: route.legs[0].summary || 'Route to issue location'
					});

					// Clear any existing routes first to prevent overlap
					try {
						if (map.current.getSource('route-path')) {
							map.current.removeSource('route-path');
						}
					} catch (e) {
						// Source doesn't exist, that's fine
					}

					// Add route source with proper error handling
					map.current.addSource('route-path', {
						type: 'geojson',
						data: {
							type: 'Feature',
							properties: {
								'route-type': 'directions'
							},
							geometry: routeGeometry
						}
					});

					// Add main route layer
					map.current.addLayer({
						id: 'route-path',
						type: 'line',
						source: 'route-path',
						layout: {
							'line-join': 'round',
							'line-cap': 'round'
						},
						paint: {
							'line-color': '#62B1F6', // Bright blue for dark theme
							'line-width': 10,
							'line-opacity': 1
						}
					});

					// Add route outline for better visibility
					map.current.addLayer({
						id: 'route-path-outline',
						type: 'line',
						source: 'route-path',
						layout: {
							'line-join': 'round',
							'line-cap': 'round'
						},
						paint: {
							'line-color': '#1a1a1a',
							'line-width': 14,
							'line-opacity': 1
						}
					}, 'route-path');

					setDistanceLine(routeGeometry);

					// Don't change the map view - keep the current 3D view and zoom level
					// Route will be visible but user can pan to see it fully

					console.log('Route path shown with actual directions');

				} else {
					// Fallback to straight line if routing fails
					console.log('Routing failed, falling back to straight line');
					await showStraightLineDistance(issue);
				}

			} catch (routingError) {
				console.error('Error fetching route:', routingError);
				// Fallback to straight line if routing fails
				await showStraightLineDistance(issue);
			}

		} catch (error) {
			console.error('Error showing distance view:', error);
		}
	};

	// Debounced version to prevent rapid API calls
	const showDistanceView = useMemo(
		() => debounce(_showDistanceView, 1000), // 1 second debounce
		[_showDistanceView]
	);

	// Fallback function for straight line when routing fails
	const showStraightLineDistance = async (issue: Issue) => {
		if (!userLocation || !map.current) return;

		// Create straight line between user and issue
		const lineCoordinates = [
			[userLocation.lng, userLocation.lat],
			[issue.longitude, issue.latitude]
		];

		const lineGeoJSON = {
			type: 'Feature' as const,
			properties: {},
			geometry: {
				type: 'LineString' as const,
				coordinates: lineCoordinates
			}
		};

		// Add line source
		map.current.addSource('route-path', {
			type: 'geojson',
			data: lineGeoJSON
		});

		// Add line layer with dashed style (fallback)
		map.current.addLayer({
			id: 'route-path',
			type: 'line',
			source: 'route-path',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': '#62B1F6', // Bright blue for dark theme
				'line-width': 5,
				'line-opacity': 1,
				'line-dasharray': [2, 2]
			}
		});

		setDistanceLine(lineGeoJSON);

		// Create bounds that include both points
		if (!(window as any).mapboxgl) {
			console.error('Mapbox GL not loaded');
			return;
		}
		const bounds = new (window as any).mapboxgl.LngLatBounds()
			.extend([userLocation.lng, userLocation.lat])
			.extend([issue.longitude, issue.latitude]);
		
		// Fit the map to show both points with padding
		map.current.fitBounds(bounds, { 
			padding: 100, 
			duration: 1500,
			maxZoom: 16, // Good visibility without being too close
			pitch: 0, // Keep flat view
			bearing: 0 // North-up orientation
		});
	};

	// Clear distance view (user marker and route)
	const clearDistanceView = () => {
		if (!map.current) return;

		try {
			// Remove user location marker
			if (userLocationMarker) {
				userLocationMarker.remove();
				setUserLocationMarker(null);
			}

			// Remove route layers
			if (map.current.getLayer('route-path')) {
				map.current.removeLayer('route-path');
			}
			if (map.current.getLayer('route-path-outline')) {
				map.current.removeLayer('route-path-outline');
			}
			if (map.current.getSource('route-path')) {
				map.current.removeSource('route-path');
			}

			// Also remove old distance-line layers (for backwards compatibility)
			if (map.current.getLayer('distance-line')) {
				map.current.removeLayer('distance-line');
			}
			if (map.current.getSource('distance-line')) {
				map.current.removeSource('distance-line');
			}

			// Clear directions data
			setDistanceLine(null);
			setRouteDirections(null);
			setShowDirections(false);
		} catch (error) {
			console.log('Error clearing distance view:', error);
		}
	};

	// Create or update the permanent user location marker (disabled - using built-in marker)
	const updatePermanentUserMarker = (lat: number, lng: number) => {
		console.log('updatePermanentUserMarker called with:', lat, lng, '- using built-in marker instead');
		// We're now using the built-in Mapbox location marker, so skip custom marker creation
		return;
	};

	// Get user's current location with better error handling
	const requestLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by this browser.');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLocation({
					lat: latitude,
					lng: longitude
				});
				updatePermanentUserMarker(latitude, longitude);
				console.log('Location obtained:', position.coords.latitude, position.coords.longitude);
			},
			(error) => {
				console.log('Location error:', error);
				switch(error.code) {
					case error.PERMISSION_DENIED:
						alert("Location access was denied. Please enable location access in your browser settings and refresh the page.");
						break;
					case error.POSITION_UNAVAILABLE:
						alert("Location information is unavailable.");
						break;
					case error.TIMEOUT:
						alert("Location request timed out.");
						break;
					default:
						alert("An unknown error occurred while getting location.");
						break;
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 12000, // Allow more time for accuracy
				maximumAge: 30000 // Use recent location data (30 seconds)
			}
		);
	};

	// User location popup handlers
	const shareLocation = async () => {
		console.log('Share location clicked', { userLocation });
		if (userLocation) {
			const url = `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
			if (navigator.share) {
				try {
					await navigator.share({
						title: 'My Current Location',
						text: 'Check out my location on the map',
						url: url
					});
				} catch (err) {
					// Fallback to clipboard
					navigator.clipboard.writeText(url);
					alert('Location URL copied to clipboard!');
				}
			} else {
				navigator.clipboard.writeText(url);
				alert('Location URL copied to clipboard!');
			}
		}
		setShowUserLocationPopup(false);
		setShowQuickFeatures(false);
	};

	// Quick action handlers
	const reportIssueHere = () => {
		console.log('Report issue at current location');
		if (userLocation) {
			// Create a new issue object with current location
			const newIssue = {
				title: 'New Issue',
				description: 'Issue reported at current location',
				latitude: userLocation.lat,
				longitude: userLocation.lng,
				category: 'other',
				status: 'pending',
				priority: 'medium'
			};
			
			// Focus on the location and show issue creation
			if (map.current) {
				map.current.easeTo({
					center: [userLocation.lng, userLocation.lat],
					zoom: 18,
					pitch: 45,
					duration: 1000
				});
			}
			
			alert('Issue reporting feature coming soon! Location saved.');
		}
		setShowUserLocationPopup(false);
	};

	const showMyArea = () => {
		console.log('Show my area clicked');
		if (userLocation && map.current) {
			// Show a wider view of the user's area
			const originalMethods = (window as any).originalMapMethods;
			if (originalMethods && originalMethods.easeTo) {
				originalMethods.easeTo.call(map.current, {
					center: [userLocation.lng, userLocation.lat],
					zoom: 14, // Wider view
					pitch: 30, // Less tilt for overview
					bearing: 0,
					duration: 1500
				});
			} else {
				map.current.easeTo({
					center: [userLocation.lng, userLocation.lat],
					zoom: 14,
					pitch: 30,
					bearing: 0,
					duration: 1500
				});
			}
		}
		setShowUserLocationPopup(false);
		setShowQuickFeatures(false);
	};

	const findDirections = () => {
		console.log('Find directions clicked');
		if (userLocation) {
			// Open directions in external app
			const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${userLocation.lat},${userLocation.lng}`;
			window.open(url, '_blank');
		}
		setShowUserLocationPopup(false);
	};

	const toggleLiveTracking = () => {
		console.log('Toggle live tracking clicked');
		if (isLiveTracking) {
			stopLiveTracking();
			alert('Live tracking disabled');
		} else {
			startLiveTracking();
			alert('Live tracking enabled');
		}
		setShowUserLocationPopup(false);
	};

	const centerOnUser = () => {
		console.log('Center on user clicked', { userLocation, mapExists: !!map.current });
		if (map.current && userLocation) {
			// Use the original map methods if available, otherwise use direct easeTo
			const originalMethods = (window as any).originalMapMethods;
			if (originalMethods && originalMethods.easeTo) {
				originalMethods.easeTo.call(map.current, {
					center: [userLocation.lng, userLocation.lat],
					zoom: 18,
					pitch: 60,
					bearing: 0,
					duration: 1000
				});
			} else {
				map.current.easeTo({
					center: [userLocation.lng, userLocation.lat],
					zoom: 18,
					pitch: 60,
					bearing: 0,
					duration: 1000
				});
			}
			console.log('Centering map on user location:', userLocation);
		} else {
			console.error('Cannot center on user - missing map or location');
		}
		setShowUserLocationPopup(false);
		setShowQuickFeatures(false);
	};

	const refreshLocation = () => {
		console.log('Refresh location clicked');
		requestLocation();
		setShowUserLocationPopup(false);
	};

	const findClosestIssue = () => {
		console.log('Find closest issue clicked', { userLocation, issueCount: filteredIssues.length });
		if (userLocation && filteredIssues.length > 0) {
			// Find all valid issues with coordinates
			const validIssues = filteredIssues.filter(issue => {
				if (!issue.latitude || !issue.longitude) {
					console.warn('Issue missing coordinates:', issue);
					return false;
				}
				return true;
			});
			
			if (validIssues.length > 0) {
				// Find the closest issue
				let closestIssue = validIssues[0];
				let shortestDistance = calculateDistance(
					userLocation.lat, userLocation.lng,
					closestIssue.latitude, closestIssue.longitude
				);
				
				validIssues.forEach(issue => {
					const distance = calculateDistance(
						userLocation.lat, userLocation.lng,
						issue.latitude, issue.longitude
					);
					if (distance < shortestDistance) {
						shortestDistance = distance;
						closestIssue = issue;
					}
				});
				
				setSelectedIssue(closestIssue);
				
				// Smooth transition to the closest issue
				if (map.current) {
					const originalMethods = (window as any).originalMapMethods;
					if (originalMethods && originalMethods.easeTo) {
						originalMethods.easeTo.call(map.current, {
							center: [closestIssue.longitude, closestIssue.latitude],
							zoom: 17,
							pitch: 60,
							duration: 1500
						});
					} else {
						map.current.easeTo({
							center: [closestIssue.longitude, closestIssue.latitude],
							zoom: 17,
							pitch: 60,
							duration: 1500
						});
					}
				}
				
				console.log(`Closest issue found: ${shortestDistance.toFixed(1)}km away - "${closestIssue.title}"`);
			} else {
				alert('No issues with valid coordinates found');
			}
		} else {
			console.log('Cannot find closest issue - missing location or no issues available');
		}
		setShowUserLocationPopup(false);
		setShowQuickFeatures(false);
	};


	// Debug popup state changes
	useEffect(() => {
		console.log('User location popup state changed:', { 
			showUserLocationPopup, 
			userLocationPopupPosition,
			userLocation 
		});
	}, [showUserLocationPopup, userLocationPopupPosition, userLocation]);

	// Close popups when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showUserLocationPopup) {
				console.log('Closing location popup due to outside click');
				setShowUserLocationPopup(false);
			}
			if (showQuickFeatures) {
				console.log('Closing quick features due to outside click');
				setShowQuickFeatures(false);
			}
		};

		if (showUserLocationPopup || showQuickFeatures) {
			document.addEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [showUserLocationPopup, showQuickFeatures]);

	// Clear rate limit message after 10 seconds
	useEffect(() => {
		if (rateLimitMessage) {
			const timer = setTimeout(() => {
				setRateLimitMessage(null);
			}, 10000);
			return () => clearTimeout(timer);
		}
	}, [rateLimitMessage]);

	// Enhanced API usage monitoring and logging
	useEffect(() => {
		const logApiUsage = () => {
			if (apiCallCount > 0 || apiCallCache.size > 0) {
				console.log(`📊 API Usage Stats:
					• Calls made this session: ${apiCallCount}
					• Cached routes: ${apiCallCache.size}
					• Consecutive failures: ${consecutiveFailures}
					• Circuit breaker: ${circuitBreakerOpen ? 'OPEN' : 'CLOSED'}
					• Cache hit rate: ${apiCallCache.size > 0 ? ((apiCallCache.size / (apiCallCount + apiCallCache.size)) * 100).toFixed(1) + '%' : '0%'}`);
			}
		};

		const interval = setInterval(logApiUsage, 60000); // Log every minute
		return () => clearInterval(interval);
	}, [apiCallCount, apiCallCache.size, consecutiveFailures, circuitBreakerOpen]);

	// Log when circuit breaker changes state
	useEffect(() => {
		if (circuitBreakerOpen) {
			console.warn('🚨 Circuit breaker OPENED - API requests temporarily blocked');
		} else if (consecutiveFailures > 0) {
			console.log('✅ Circuit breaker CLOSED - API requests resumed');
		}
	}, [circuitBreakerOpen, consecutiveFailures]);

	// Get user's current location on mount
	useEffect(() => {
		requestLocation();
	}, []);

	// Fetch issues on mount
	useEffect(() => {
		fetchIssues();
		// Load mock data immediately as fallback
		setMockData();
	}, []);

	// Force markers to render when map loads and we have issues
	useEffect(() => {
		if (mapLoaded && issues.length > 0 && filteredIssues.length === 0) {
			console.log('Map loaded but no filtered issues, forcing filter update');
			setFilteredIssues([...issues]);
		}
	}, [mapLoaded, issues.length, filteredIssues.length]);

	// Initialize Mapbox map
	useEffect(() => {
		const initializeMap = async () => {
			if (map.current || !mapContainer.current) return;

			try {
				console.log('Starting map initialization...');
				
				// Ensure container is mounted
				if (!mapContainer.current || !document.body.contains(mapContainer.current)) {
					console.error('Map container not mounted');
					setMapError('Map container not ready. Please refresh the page.');
					return;
				}
				
				// Dynamic import to avoid SSR issues
				const mapboxgl = await import('mapbox-gl');
				console.log('Mapbox GL imported successfully');
				
				// Make mapboxgl available globally for marker creation
				(window as any).mapboxgl = mapboxgl.default;
				
				// Try to get token from environment variables
				let token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
				
				// Fallback to the known token if env var isn't working
				if (!token) {
					token = 'pk.eyJ1IjoiZG91Z3kxMjMiLCJhIjoiY2xpbTZmMDloMGJhcjNycDh5dGw3YW1uZCJ9.-yKIfcvvW8cdD3NRAuxBBw';
					console.warn('Using fallback Mapbox token - environment variable not found');
				}
				
				console.log('Mapbox token exists:', !!token);
				console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
				
				if (!token) {
					console.error('Mapbox access token is missing');
					setMapError('Map configuration error: Missing access token. Please check environment setup.');
					throw new Error('Mapbox access token is missing');
				}
				
				mapboxgl.default.accessToken = token;
				
				// Completely disable Mapbox telemetry to prevent ERR_NAME_NOT_RESOLVED
				try {
					// Set environment variable to disable telemetry
					if (typeof window !== 'undefined') {
						(window as any).MapboxGLTelemetryDisabled = true;
						// Also try setting the process env for completeness
						if (typeof process !== 'undefined' && process.env) {
							process.env.MapboxGLTelemetryDisabled = 'true';
						}
					}
					
					// Block telemetry at the network level using a more comprehensive approach
					const originalFetch = window.fetch;
					const originalXMLHttpRequest = window.XMLHttpRequest;
					
					// Override fetch
					window.fetch = function(input, init) {
						const url = typeof input === 'string' ? input : input.url;
						if (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events')) {
							console.log('Blocked telemetry request:', url);
							return Promise.resolve(new Response('{"success": true}', { 
								status: 200, 
								statusText: 'OK',
								headers: { 'Content-Type': 'application/json' }
							}));
						}
						return originalFetch.call(this, input, init);
					};
					
					// Override XMLHttpRequest for older telemetry code
					window.XMLHttpRequest = function() {
						const xhr = new originalXMLHttpRequest();
						const originalOpen = xhr.open;
						xhr.open = function(method, url, ...args) {
							if (typeof url === 'string' && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
								console.log('Blocked XHR telemetry request:', url);
								// Create a dummy request that does nothing
								return originalOpen.call(this, method, 'data:,', ...args);
							}
							return originalOpen.call(this, method, url, ...args);
						};
						return xhr;
					};
				} catch (e) {
					console.log('Telemetry blocking error:', e);
				}

				// Get user location first, then create map
				if (navigator.geolocation) {
					// First try to get a quick location (less accurate but faster)
					navigator.geolocation.getCurrentPosition(
						(position) => {
							const userLng = position.coords.longitude;
							const userLat = position.coords.latitude;
							
							// Create map centered on user location with enhanced 3D appearance
							try {
								map.current = new mapboxgl.default.Map({
								container: mapContainer.current,
								style: 'mapbox://styles/mapbox/dark-v11', // Dark theme style
								center: [userLng, userLat], // Start at user location
								zoom: 18, // Street level detail
								pitch: 60, // More dramatic 3D tilt (increased from 45)
								bearing: 0, // North-up initially
								minZoom: 10,
								maxZoom: 22,
								maxBounds: [
									[-78.5, 17.5], // Southwest coordinates of Jamaica
									[-76.0, 18.8]  // Northeast coordinates of Jamaica
								],
								// Disable default controls to prevent duplicates
								attributionControl: false,
								// Comprehensive telemetry blocking
								transformRequest: (url, resourceType) => {
									if (url.includes('events.mapbox.com') || 
									    url.includes('api.mapbox.com/events') ||
									    resourceType === 'Unknown' && url.includes('mapbox.com/events')) {
										// Return null to completely block the request
										return null;
									}
									return { url };
								},
								antialias: true, // Better rendering for 3D
								// Optimize for mobile and 3D
								trackResize: true,
								touchZoomRotate: true,
								doubleClickZoom: true,
								keyboard: false,
								dragRotate: true, // Allow rotation for better 3D navigation
								touchPitch: true, // Allow touch pitch control
								// Enhanced 3D settings
								projection: 'mercator'
							});
							
							// Set user location immediately
							setUserLocation({
								lat: userLat,
								lng: userLng
							});
							
							// Create user marker immediately after map is loaded
							map.current.on('load', () => {
								updatePermanentUserMarker(userLat, userLng);
							});
							
								// Continue with map setup
								setupMapControls();
							} catch (mapError) {
								console.error('Failed to create Mapbox map:', mapError);
								setMapError('Failed to initialize map. Please check your internet connection and try again.');
								return;
							}
						},
						(error) => {
							console.log('Quick geolocation failed, using default center:', error);
							// Fallback to default location with enhanced 3D appearance
							try {
								map.current = new mapboxgl.default.Map({
								container: mapContainer.current,
								style: 'mapbox://styles/mapbox/dark-v11', // Dark theme style
								center: [-77.2975, 18.1096], // Jamaica center
								zoom: 18, // Street level detail
								pitch: 60, // More dramatic 3D tilt
								bearing: 0, // North-up
								minZoom: 10,
								maxZoom: 22,
								maxBounds: [
									[-78.5, 17.5], // Southwest coordinates of Jamaica
									[-76.0, 18.8]  // Northeast coordinates of Jamaica
								],
								// Disable default controls to prevent duplicates
								attributionControl: false,
								antialias: true, // Better rendering for 3D
								// Enhanced 3D controls
								trackResize: true,
								touchZoomRotate: true,
								doubleClickZoom: true,
								keyboard: false,
								dragRotate: true,
								touchPitch: true,
								projection: 'mercator'
								});
								
								setupMapControls();
							} catch (mapError) {
								console.error('Failed to create Mapbox map (fallback):', mapError);
								setMapError('Failed to initialize map. Please check your internet connection and try again.');
								return;
							}
						},
						{
							enableHighAccuracy: true, // Use GPS for highest accuracy
							timeout: 8000, // Allow more time for accurate location
							maximumAge: 60000 // Use 1 minute cache for better accuracy
						}
					);
				} else {
					// Fallback if geolocation not supported with enhanced 3D appearance
					try {
						map.current = new mapboxgl.default.Map({
						container: mapContainer.current,
						style: 'mapbox://styles/mapbox/dark-v11', // Dark theme style
						center: [-77.2975, 18.1096], // Jamaica center
						zoom: 18, // Street level detail
						pitch: 60, // More dramatic 3D tilt
						bearing: 0, // North-up
						minZoom: 10,
						maxZoom: 22,
						maxBounds: [
							[-78.5, 17.5], // Southwest coordinates of Jamaica
							[-76.0, 18.8]  // Northeast coordinates of Jamaica
						],
						// Disable default controls to prevent duplicates
						attributionControl: false,
						// Comprehensive telemetry blocking
						transformRequest: (url, resourceType) => {
							if (url.includes('events.mapbox.com') || 
							    url.includes('api.mapbox.com/events') ||
							    resourceType === 'Unknown' && url.includes('mapbox.com/events')) {
								// Return null to completely block the request
								return null;
							}
							return { url };
						},
						antialias: true, // Better rendering for 3D
						// Enhanced 3D controls
						trackResize: true,
						touchZoomRotate: true,
						doubleClickZoom: true,
						keyboard: false,
						dragRotate: true,
						touchPitch: true,
						projection: 'mercator'
						});
						
						setupMapControls();
					} catch (mapError) {
						console.error('Failed to create Mapbox map (no geolocation):', mapError);
						setMapError('Failed to initialize map. Please check your internet connection and try again.');
						return;
					}
				}
				
				function setupMapControls() {
					// Remove navigation controls for cleaner interface
				// Store original methods for selective use (like search panning)
				const originalMethods = {
					flyTo: map.current.flyTo,
					jumpTo: map.current.jumpTo,
					easeTo: map.current.easeTo,
					fitBounds: map.current.fitBounds,
					setCenter: map.current.setCenter,
					setZoom: map.current.setZoom,
					zoomTo: map.current.zoomTo
				};
				
				// Store in window for access from search functions
				(window as any).originalMapMethods = originalMethods;
				
				// Disable view-changing methods but allow manual zoom controls to work
				map.current.flyTo = () => { console.log('flyTo blocked to maintain 3D view'); };
				map.current.jumpTo = () => { console.log('jumpTo blocked to maintain 3D view'); };
				map.current.easeTo = () => { console.log('easeTo blocked to maintain 3D view'); };
				// Allow fitBounds for location-based operations, block for others
				map.current.fitBounds = (bounds, options) => { 
					// Allow fitBounds when explicitly called for location features
					if (options && options.allowForLocation) {
						console.log('fitBounds allowed for location operation');
						return (window as any).originalMapMethods.fitBounds.call(map.current, bounds, options);
					} else {
						console.log('fitBounds blocked to maintain 3D view'); 
					}
				};
				map.current.setCenter = () => { console.log('setCenter blocked to maintain 3D view'); };
				// Allow setZoom for manual zoom controls
				// map.current.setZoom = () => { console.log('setZoom blocked to maintain 3D view'); };
				// map.current.zoomTo = () => { console.log('zoomTo blocked to maintain 3D view'); };

				// Add geolocate control with built-in user marker (as you preferred)
				const geolocateControl = new mapboxgl.default.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true, // Use GPS for maximum accuracy
						timeout: 15000, // Allow up to 15 seconds for high accuracy
						maximumAge: 10000 // Only use recent location data (10 seconds)
					},
					trackUserLocation: true, // Continuously track location changes
					showUserHeading: true, // Show direction arrow
					showAccuracyCircle: true, // Show accuracy circle
					showUserLocation: true // Show the built-in blue dot
				});
				
				// Add geolocateControl with click handling for popup
				map.current.addControl(geolocateControl, 'top-right');
				
				// Add click handler to the built-in user location marker
				geolocateControl.on('geolocate', () => {
					// Wait for the location dot to be added to DOM
					setTimeout(() => {
						const locationDot = document.querySelector('.mapboxgl-user-location-dot');
						if (locationDot && !locationDot.dataset.clickHandlerAdded) {
							locationDot.dataset.clickHandlerAdded = 'true';
							locationDot.addEventListener('click', (e) => {
								console.log('Built-in location marker clicked!');
								e.stopPropagation();
								
								if (map.current && userLocation) {
									// Get screen position of the location dot
									const rect = (locationDot as HTMLElement).getBoundingClientRect();
									
									setUserLocationPopupPosition({
										x: rect.left + rect.width / 2,
										y: rect.top
									});
									setShowUserLocationPopup(true);
								}
							});
							
							// Add cursor pointer style
							(locationDot as HTMLElement).style.cursor = 'pointer';
						}
					}, 500);
				});
				
				// Hide the geolocate button but keep the functionality
				setTimeout(() => {
					const geoButton = document.querySelector('.mapboxgl-ctrl-geolocate');
					if (geoButton) {
						(geoButton as HTMLElement).style.display = 'none';
					}
				}, 100);
				
				// Listen for geolocate events to update our state with accuracy info
				geolocateControl.on('geolocate', (e) => {
					// Properly handle different event types from geolocate control
					if (e && e.coords && typeof e.coords.latitude === 'number' && typeof e.coords.longitude === 'number') {
						console.log('High accuracy location found:', {
							lat: e.coords.latitude,
							lng: e.coords.longitude,
							accuracy: e.coords.accuracy ? e.coords.accuracy + ' meters' : 'unknown',
							heading: e.coords.heading,
							speed: e.coords.speed
						});
						const { latitude, longitude } = e.coords;
						setUserLocation({
							lat: latitude,
							lng: longitude
						});
						updatePermanentUserMarker(latitude, longitude);
					} else if (e && e.lngLat) {
						// Handle different event structure from geolocate control
						console.log('Location from geolocate control:', {
							lat: e.lngLat.lat,
							lng: e.lngLat.lng
						});
						setUserLocation({
							lat: e.lngLat.lat,
							lng: e.lngLat.lng
						});
						updatePermanentUserMarker(e.lngLat.lat, e.lngLat.lng);
					}
					// Silently ignore events without location data (like trackuserlocationstart/end)
				});

				// Handle location errors
				geolocateControl.on('error', (e) => {
					console.error('Geolocation error:', e);
					// Fallback to less accurate but faster location
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(
							(position) => {
								console.log('Fallback location obtained');
								const { latitude, longitude } = position.coords;
								setUserLocation({
									lat: latitude,
									lng: longitude
								});
								updatePermanentUserMarker(latitude, longitude);
							},
							(error) => console.error('Fallback location failed:', error),
							{
								enableHighAccuracy: true, // Use high accuracy for fallback too
								timeout: 10000, // Allow more time for accuracy
								maximumAge: 30000 // Use recent data (30 seconds)
							}
						);
					}
				});
				
				// Keep attribution minimal and compact
				map.current.addControl(new mapboxgl.default.AttributionControl({
					compact: true,
					customAttribution: ''
				}), 'bottom-left');

				// Remove basemap control for cleaner interface

				// Add error handler
				map.current.on('error', (e) => {
					console.error('Mapbox error:', e);
					
					let errorMessage = 'Failed to load map. Please check your internet connection.';
					
					if (e.error) {
						if (e.error.message.includes('401')) {
							errorMessage = 'Map access denied. Invalid API token.';
						} else if (e.error.message.includes('network')) {
							errorMessage = 'Network error loading map. Please check your internet connection.';
						} else if (e.error.message.includes('style')) {
							errorMessage = 'Map style failed to load. Please try refreshing.';
						}
					}
					
					setMapError(errorMessage);
				});

				// Add style load handler
				map.current.on('style.load', () => {
					console.log('Map style loaded');
				});

				// Add error event listener with more specific error handling
				map.current.on('error', (e) => {
					console.error('Map error:', e);
					
					// Handle specific error types
					if (e.error && e.error.message) {
						if (e.error.message.includes('NetworkError') || e.error.message.includes('Failed to fetch')) {
							setMapError('Network error: Unable to connect to map servers. Please check your internet connection.');
						} else if (e.error.message.includes('Unauthorized') || e.error.message.includes('token')) {
							setMapError('Authentication error: Invalid map token. Please check configuration.');
						} else {
							setMapError(`Map error: ${e.error.message}`);
						}
					} else {
						setMapError('Map failed to load. Please refresh the page and try again.');
					}
					setIsLoading(false);
				});

				map.current.on('load', () => {
					console.log('Map loaded successfully');
					setMapLoaded(true);
					setIsLoading(false);
					
					// Add enhanced 3D buildings layer with better rendering
					try {
						map.current.addLayer({
							'id': '3d-buildings',
							'source': 'composite',
							'source-layer': 'building',
							'filter': ['==', 'extrude', 'true'],
							'type': 'fill-extrusion',
							'minzoom': 14,
							'paint': {
								'fill-extrusion-color': [
									'interpolate',
									['linear'],
									['get', 'height'],
									0, '#f8f9fa',
									25, '#e9ecef', 
									50, '#dee2e6',
									100, '#adb5bd',
									200, '#6c757d'
								],
								'fill-extrusion-height': [
									'case',
									['has', 'height'],
									['get', 'height'],
									[
										'case',
										['==', ['get', 'type'], 'house'], 8,
										['==', ['get', 'type'], 'apartments'], 24,
										15 // default height
									]
								],
								'fill-extrusion-base': [
									'case',
									['has', 'min_height'],
									['get', 'min_height'],
									0
								],
								'fill-extrusion-opacity': [
									'interpolate',
									['linear'],
									['zoom'],
									14, 0.3,
									16, 0.7,
									18, 0.8
								],
								'fill-extrusion-vertical-gradient': true
							}
						});
						console.log('3D buildings layer added successfully');
					} catch (error) {
						console.warn('Failed to add 3D buildings layer:', error);
					}
					
					// Trigger high accuracy geolocation immediately and continuously
					setTimeout(() => {
						if (geolocateControl && geolocateControl._geolocateButton) {
							console.log('Triggering high accuracy geolocation...');
							geolocateControl._geolocateButton.click();
						}
					}, 100);

					// Also trigger watchPosition for maximum accuracy and real-time updates
					if (navigator.geolocation) {
						const watchId = navigator.geolocation.watchPosition(
							(position) => {
								console.log('Continuous high accuracy location:', {
									lat: position.coords.latitude,
									lng: position.coords.longitude,
									accuracy: position.coords.accuracy + ' meters',
									timestamp: new Date(position.timestamp).toLocaleTimeString()
								});
								
								// Only update if this reading is more accurate than previous
								if (position.coords.accuracy <= 20) { // Within 20 meters
									const { latitude, longitude } = position.coords;
									setUserLocation({
										lat: latitude,
										lng: longitude
									});
									updatePermanentUserMarker(latitude, longitude);
								}
							},
							(error) => {
								console.error('Watch position error:', error);
							},
							{
								enableHighAccuracy: true,
								timeout: 10000, // Allow more time for high accuracy GPS fix
								maximumAge: 15000 // Use only very recent location data (15 seconds)
							}
						);

						// Store watch ID for cleanup
						(window as any).locationWatchId = watchId;
					}

					// Add mobile-optimized styles for navigation controls
					if (!document.getElementById('mobile-map-controls')) {
						const style = document.createElement('style');
						style.id = 'mobile-map-controls';
						style.textContent = `
							/* Mobile-optimized navigation controls */
							.mapboxgl-ctrl-top-right {
								top: 10px !important;
								right: 10px !important;
							}
							
							/* Remove any duplicate controls */
							.mapboxgl-ctrl-top-right .mapboxgl-ctrl-group:not(:first-child) {
								margin-top: 8px !important;
							}
							
							@media (max-width: 640px) {
								.mapboxgl-ctrl-group {
									box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
									border-radius: 8px !important;
									overflow: hidden !important;
									background: white !important;
								}
								
								.mapboxgl-ctrl-zoom-in,
								.mapboxgl-ctrl-zoom-out {
									width: 44px !important;
									height: 44px !important;
									font-size: 18px !important;
									line-height: 44px !important;
									border: none !important;
									background: white !important;
									cursor: pointer !important;
								}
								
								.mapboxgl-ctrl-zoom-in {
									border-bottom: 1px solid #e5e5e5 !important;
								}
								
								.mapboxgl-ctrl-zoom-in:hover,
								.mapboxgl-ctrl-zoom-out:hover {
									background: #f5f5f5 !important;
								}
								
								/* Better touch targets for mobile */
								.mapboxgl-ctrl button {
									touch-action: manipulation !important;
									user-select: none !important;
									-webkit-tap-highlight-color: transparent !important;
								}
								
								/* Geolocate control mobile optimization */
								.mapboxgl-ctrl-geolocate {
									width: 44px !important;
									height: 44px !important;
									border-radius: 8px !important;
									background: white !important;
									border: none !important;
									box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
									cursor: pointer !important;
								}
								
								/* Compass control for 3D view */
								.mapboxgl-ctrl-compass {
									width: 44px !important;
									height: 44px !important;
								}
								
								/* Pitch control for 3D tilting */
								.mapboxgl-ctrl-pitch {
									width: 44px !important;
									height: 44px !important;
								}
								
								.mapboxgl-ctrl-geolocate:hover {
									background: #f5f5f5 !important;
								}
								
								.mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
									background-size: 20px !important;
								}
								
								/* Hide Mapbox branding for cleaner look */
								.mapboxgl-ctrl-logo {
									display: none !important;
								}
								
								.mapboxgl-ctrl-attrib {
									display: none !important;
								}
								
								/* Remove marker hover effects */
								.custom-marker:hover {
									outline: none !important;
									border: none !important;
									box-shadow: none !important;
								}
								
								.custom-marker:focus {
									outline: none !important;
									border: none !important;
								}
							}
						`;
						document.head.appendChild(style);
					}
				});

				// Add click handler to clear routes when clicking on empty map areas
				map.current.on('click', (e) => {
					// Only clear routes if no issue is selected (card is hidden)
					// This allows routes to persist when card is visible
					if (!selectedIssue) {
						clearRoute();
						clearDistanceView();
						setShowDirections(false);
						setRouteDirections(null);
					}
				});
				} // End setupMapControls function

			} catch (error) {
				console.error('Failed to load Mapbox:', error);
				setMapError('Failed to load map. Please check your internet connection and try again.');
				setMapLoaded(true);
				setIsLoading(false);
			}
		};

		// Initialize map with retry logic
		let retryCount = 0;
		const maxRetries = 3;
		
		const initWithRetry = async () => {
			try {
				await initializeMap();
			} catch (error) {
				console.error(`Map initialization attempt ${retryCount + 1} failed:`, error);
				if (retryCount < maxRetries - 1 && !map.current) {
					retryCount++;
					setTimeout(initWithRetry, 2000); // Retry after 2 seconds
				} else {
					setMapError('Unable to load map. Please check your internet connection and refresh the page.');
					setIsLoading(false);
				}
			}
		};
		
		initWithRetry();

		return () => {
			// Cleanup markers and layers
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
			
			// Clean up permanent user marker
			if (permanentUserMarkerRef.current) {
				permanentUserMarkerRef.current.remove();
				permanentUserMarkerRef.current = null;
			}
			
			// Clean up distance view
			clearDistanceView();
			
			if (map.current) {
				// Remove layers if they exist
				try {
					if (map.current.getLayer('issues-layer')) {
						map.current.removeLayer('issues-layer');
					}
					if (map.current.getSource('issues')) {
						map.current.removeSource('issues');
					}
					// Clean up route layers
					if (map.current.getLayer('route')) {
						map.current.removeLayer('route');
					}
					if (map.current.getSource('route')) {
						map.current.removeSource('route');
					}
					// Clean up distance/route layers
					if (map.current.getLayer('distance-line')) {
						map.current.removeLayer('distance-line');
					}
					if (map.current.getSource('distance-line')) {
						map.current.removeSource('distance-line');
					}
					if (map.current.getLayer('route-path')) {
						map.current.removeLayer('route-path');
					}
					if (map.current.getLayer('route-path-outline')) {
						map.current.removeLayer('route-path-outline');
					}
					if (map.current.getSource('route-path')) {
						map.current.removeSource('route-path');
					}
				} catch (e) {
					console.log('Cleanup layers error:', e);
				}
				map.current.remove();
			}
		};
	}, []); // Remove settings dependency to prevent map recreation

	// Update map style when settings change
	useEffect(() => {
		if (map.current && mapLoaded && settings?.display?.mapStyle) {
			const newStyle = `mapbox://styles/mapbox/${settings.display.mapStyle}`;
			const currentStyle = map.current.getStyle();
			
			// Only change style if it's different
			if (!currentStyle.name || !currentStyle.name.includes(settings.display.mapStyle)) {
				console.log('Changing map style to:', settings.display.mapStyle);
				map.current.setStyle(newStyle);
				
				// Re-add markers after style change
				map.current.once('styledata', () => {
					console.log('Map style loaded, re-adding markers');
					// Trigger markers to be re-added by updating filteredIssues
					setFilteredIssues(prev => [...prev]);
				});
			}
		}
	}, [settings?.display?.mapStyle, mapLoaded]);

	// Store markers for cleanup
	const markersRef = useRef<any[]>([]);

	// Native Mapbox layers with zoom-responsive markers
	useEffect(() => {
		console.log('Marker creation effect triggered:', { 
			mapExists: !!map.current, 
			mapLoaded, 
			issueCount: filteredIssues.length,
			issuesData: filteredIssues.map(i => ({ id: i.id, title: i.title }))
		});
		
		if (!map.current || !mapLoaded || filteredIssues.length === 0) {
			console.log('Markers not created - requirements not met');
			return;
		}

		console.log('Creating zoom-responsive markers for', filteredIssues.length, 'Jamaica issues');

		// Clear existing markers and layers
		markersRef.current.forEach(marker => marker.remove());
		markersRef.current = [];

		// Clear existing HTML markers only
		console.log('Clearing existing markers, creating new ones');

		// Create simple HTML markers that work across all browsers
		console.log('Creating HTML markers for all browsers');
		console.log('Issues to create markers for:', filteredIssues.map(i => ({ 
			id: i.id, 
			title: i.title, 
			lat: i.latitude, 
			lng: i.longitude 
		})));
		
		// Optimize marker creation with performance improvements
		const createOptimizedMarker = (issue: Issue) => {
			const el = document.createElement('div');
			el.className = 'custom-marker';
			
			// Calculate size based on severity
			const size = issue.severity === 'critical' ? 30 : 
						issue.severity === 'high' ? 25 : 
						issue.severity === 'medium' ? 22 : 18;
			
			// Use optimized CSS assignment with proper positioning to prevent drift
			el.style.cssText = `
				width: ${size}px;
				height: ${size + 8}px;
				cursor: pointer;
				position: absolute;
				transform: translate(-50%, -100%);
				transition: box-shadow 0.2s ease, filter 0.2s ease;
				pointer-events: auto;
				z-index: ${severityConfig[issue.severity]?.zIndex || 1};
			`;
			
			// Create professional pin shape with SVG icon
			el.innerHTML = `
				<div style="
					width: ${size}px;
					height: ${size + 8}px;
					display: flex;
					flex-direction: column;
					align-items: center;
					filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
					position: relative;
				">
					<!-- Main pin body -->
					<div style="
						width: ${size}px;
						height: ${size}px;
						background: linear-gradient(135deg, ${statusConfig[issue.status].color} 0%, ${statusConfig[issue.status].color}dd 100%);
						border: 3px solid white;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						z-index: 2;
						font-size: ${size * 0.5}px;
					">
						${categoryLabels[issue.categoryId || 'other'] || '📍'}
					</div>
					<!-- Pin tail -->
					<div style="
						width: 0;
						height: 0;
						border-left: 6px solid transparent;
						border-right: 6px solid transparent;
						border-top: 10px solid ${statusConfig[issue.status].color};
						margin-top: -2px;
						z-index: 1;
					"></div>
				</div>
			`;
			
			// Add optimized click handler and remove hover effects
			el.addEventListener('click', () => setSelectedIssue(issue), { passive: true });
			
			// Remove any hover effects completely
			el.style.outline = 'none';
			el.style.border = 'none';
			
			// Create marker with explicit positioning options
			if (!(window as any).mapboxgl) {
				console.error('Mapbox GL not loaded');
				return null;
			}
			return new (window as any).mapboxgl.Marker({
				element: el,
				anchor: 'center'
			})
				.setLngLat([issue.longitude, issue.latitude])
				.addTo(map.current);
		};

		// Create markers in batches for better performance with many markers
		const batchSize = 20;
		let currentBatch = 0;
		
		const createMarkerBatch = () => {
			const start = currentBatch * batchSize;
			const end = Math.min(start + batchSize, filteredIssues.length);
			
			for (let i = start; i < end; i++) {
				const marker = createOptimizedMarker(filteredIssues[i]);
				if (marker) {
					markersRef.current.push(marker);
				}
			}
			
			currentBatch++;
			
			if (end < filteredIssues.length) {
				// Use requestAnimationFrame for smooth rendering
				requestAnimationFrame(createMarkerBatch);
			} else {
				setIsLoading(false);
				console.log(`✅ Created ${filteredIssues.length} markers successfully`);
			}
		};
		
		// Start creating markers
		if (filteredIssues.length > 0) {
			setIsLoading(true);
			createMarkerBatch();
		} else {
			setIsLoading(false);
		}

		// Click handlers are now on individual HTML markers

		console.log('✅ Zoom-responsive markers created successfully');

	}, [filteredIssues, mapLoaded]);

	const setMockData = () => {
		console.log('Setting Jamaica mock data...');
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
				downvotes: 1
			},
			{
				id: "issue-2",
				title: "Pothole on Spanish Town Road",
				description: "Large pothole causing damage to vehicles near Coronation Market",
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
				downvotes: 0
			},
			{
				id: "issue-3",
				title: "Water Main Break in Half Way Tree",
				description: "Water main burst causing flooding on Constant Spring Road",
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
				downvotes: 0
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
				downvotes: 0
			},
			{
				id: "issue-5",
				title: "Overflowing Garbage Collection Point",
				description: "Garbage collection point hasn't been emptied in days, attracting pests",
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
				downvotes: 1
			},
			{
				id: "issue-6",
				title: "Fallen Tree Blocking Road",
				description: "Large tree fell across road after storm, blocking traffic",
				latitude: 18.0456,
				longitude: -76.7300,
				address: "Blue Mountain Road, Kingston, Jamaica",
				status: "resolved",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "environment",
				createdAt: new Date("2024-01-20"),
				updatedAt: new Date("2024-01-21"),
				resolvedAt: new Date("2024-01-21"),
				upvotes: 22,
				downvotes: 0
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
				downvotes: 0
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
				downvotes: 2
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
				downvotes: 1
			},
			{
				id: "issue-10",
				title: "Road Closure in Ocho Rios",
				description: "Landslide blocking main road to tourist attractions",
				latitude: 18.4078,
				longitude: -77.1030,
				address: "Main Street, Ocho Rios, St. Ann, Jamaica",
				status: "pending",
				severity: "high",
				reporterId: "demo-user",
				categoryId: "roads",
				createdAt: new Date("2024-01-27"),
				updatedAt: new Date("2024-01-27"),
				upvotes: 42,
				downvotes: 0
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
				downvotes: 3
			}
		];
		console.log('✅ Setting Jamaica mock data with', mockIssues.length, 'issues');
		setIssues(mockIssues);
		console.log('✅ Mock data set, issues state updated');
	};

	// Memoized filtering function for better performance
	const filteredIssuesMemo = useMemo(() => {
		let filtered = [...issues];
		
		// Apply status filters
		if (activeFilters.status.length > 0) {
			filtered = filtered.filter(issue => activeFilters.status.includes(issue.status));
		}
		
		// Apply severity filters
		if (activeFilters.severity.length > 0) {
			filtered = filtered.filter(issue => activeFilters.severity.includes(issue.severity));
		}
		
		// Apply debounced search query
		if (debouncedSearchQuery) {
			const searchLower = debouncedSearchQuery.toLowerCase();
			filtered = filtered.filter(issue => 
				issue.title.toLowerCase().includes(searchLower) ||
				issue.description.toLowerCase().includes(searchLower) ||
				issue.address?.toLowerCase().includes(searchLower)
			);
		}
		
		return filtered;
	}, [issues, activeFilters, debouncedSearchQuery]);

	// Update filtered issues when memoized result changes
	useEffect(() => {
		setFilteredIssues(filteredIssuesMemo);
	}, [filteredIssuesMemo]);

	const fetchIssues = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/issue`);
			if (response.ok) {
				const data = await response.json();
				setIssues(data);
			}
		} catch (error) {
			console.error("Failed to fetch issues:", error);
		}
	};

	const toggleFilter = (type: "status" | "severity", value: string) => {
		setActiveFilters(prev => {
			const current = prev[type];
			if (current.includes(value)) {
				return {
					...prev,
					[type]: current.filter(v => v !== value)
				};
			} else {
				return {
					...prev,
					[type]: [...current, value]
				};
			}
		});
	};

	const handleVote = async (issueId: string, type: "upvote" | "downvote") => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/issue/${issueId}/vote`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ type })
			});
			
			if (response.ok) {
				const updatedIssue = await response.json();
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

	return (
		<div className={`mobile-map-page md:fixed md:inset-0 w-full h-screen ${showSearchPanel ? 'search-visible' : ''}`}>
			{/* Loading Overlay */}
			{isLoading && (
				<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading map markers...</p>
					</div>
				</div>
			)}

			{/* Error Overlay */}
			{mapError && (
				<div className="absolute inset-0 bg-red-50 flex items-center justify-center z-50">
					<div className="text-center p-6">
						<div className="text-red-600 text-6xl mb-4">⚠️</div>
						<h3 className="text-lg font-semibold text-red-800 mb-2">Map Error</h3>
						<p className="text-red-600 mb-4">{mapError}</p>
						<Button onClick={() => window.location.reload()} variant="outline">
							Reload Page
						</Button>
					</div>
				</div>
			)}

			{/* Mapbox Container */}
			<div ref={mapContainer} className="w-full h-full min-h-screen" />

			{/* Control Buttons - Search and Live Location */}

		{!showSearchPanel && (
				<div className="absolute top-16 left-3 z-10 flex flex-col gap-2">
					{/* Search Button */}
					<Button
						variant="default"
						size="sm"
						onClick={() => setShowSearchPanel(true)}
						className="shadow-lg bg-white/90 text-gray-700 border-none hover:bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
						data-search-button
					>
						<Search className="h-4 w-4" />
					</Button>
					
					{/* Live Location Tracking Button */}
					<Button
						variant="default"
						size="sm"
						onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
						className={`shadow-lg border-none p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all ${
							isLiveTracking 
								? 'bg-blue-500 text-white hover:bg-blue-600' 
								: 'bg-white/90 text-gray-700 hover:bg-white'
						}`}
						title={isLiveTracking ? 'Stop live tracking' : 'Start live tracking'}
					>
						<Compass className={`h-4 w-4 ${isLiveTracking ? 'animate-pulse' : ''}`} />
					</Button>

					{/* Quick Features Button */}
					{userLocation && (
						<Button
							variant="default"
							size="sm"
							onClick={() => setShowQuickFeatures(!showQuickFeatures)}
							className="shadow-lg bg-orange-500/90 text-white border-none hover:bg-orange-600 p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all"
							title="Quick Location Features"
						>
							<MapPin className="h-4 w-4" />
						</Button>
					)}
					
					{/* Accuracy Indicator */}
					{isLiveTracking && locationAccuracy && (
						<div className="bg-black/75 text-white text-xs px-2 py-1 rounded-full">
							±{Math.round(locationAccuracy)}m
						</div>
					)}
				</div>
			)}

			{/* Search Bar */}
			{showSearchPanel && (
				<div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-10 w-auto sm:max-w-md" data-search-panel>
					<Card className="shadow-lg bg-white border border-gray-200">
						<CardContent className="p-2 sm:p-3">
						<div className="space-y-2">
							{/* Search and Hide Button Row */}
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										placeholder="Search issues..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10 text-black bg-white border-gray-300 focus:border-gray-500 focus:ring-0"
									/>
								</div>
								<Button
									variant="default"
									size="icon"
									onClick={() => setShowSearchPanel(false)}
									className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 bg-gray-800 hover:bg-gray-700 text-white"
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
									className="relative shrink-0 h-9 w-9 sm:h-10 sm:w-10 border-gray-400 hover:border-gray-600"
								>
									<Filter className="h-4 w-4 text-black" />
									{(activeFilters.status.length + activeFilters.severity.length) > 0 && (
										<div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full" />
									)}
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setShowLegend(!showLegend)}
									className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 border-gray-400 hover:border-gray-600"
									title="Show Legend"
								>
									<MapPin className="h-4 w-4 text-black" />
								</Button>
							</div>
						</div>
						{/* Search Results List - Only show when searching */}
						{debouncedSearchQuery && (
							<div className="mt-3 max-h-60 overflow-y-auto border-t border-gray-200 pt-3">
								<div className="space-y-2">
									<span className="text-black text-xs font-medium block">
										Search Results ({filteredIssues.length} found)
									</span>
									{filteredIssues.length > 0 ? (
										<div className="space-y-1">
											{filteredIssues.slice(0, 5).map((issue) => (
												<div
													key={issue.id}
													onClick={() => {
														// Pan map to issue location while maintaining 3D view
														if (map.current && (window as any).originalMapMethods) {
															// Get current view settings to maintain 3D appearance
															const currentZoom = map.current.getZoom();
															const currentPitch = map.current.getPitch();
															const currentBearing = map.current.getBearing();
															
															// Use original easeTo method directly for smooth panning
															(window as any).originalMapMethods.easeTo.call(map.current, {
																center: [issue.longitude, issue.latitude],
																zoom: currentZoom, // Keep current zoom
																pitch: currentPitch, // Keep current 3D tilt
																bearing: currentBearing, // Keep current rotation
																duration: 1000 // Smooth animation
															});
														}
														setSelectedIssue(issue);
														setSearchQuery(""); // Clear search to show normal view
													}}
													className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
												>
													<div className={`w-3 h-3 rounded-full ${statusConfig[issue.status].bgColor}`} />
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-medium text-black truncate">
															{issue.title}
														</h4>
														<p className="text-xs text-gray-600 truncate">
															{issue.description}
														</p>
														{issue.address && (
															<p className="text-xs text-gray-500 truncate">
																📍 {issue.address}
															</p>
														)}
													</div>
													<div className="flex items-center gap-1">
														<Badge className={`${severityConfig[issue.severity as keyof typeof severityConfig].bgColor} ${severityConfig[issue.severity as keyof typeof severityConfig].textColor} text-xs`}>
															{issue.severity}
														</Badge>
													</div>
												</div>
											))}
											{filteredIssues.length > 5 && (
												<div className="text-xs text-gray-500 text-center py-2">
													Showing first 5 of {filteredIssues.length} results
												</div>
											)}
										</div>
									) : (
										<div className="text-center py-4 text-gray-500 text-sm">
											No issues found matching "{debouncedSearchQuery}"
										</div>
									)}
								</div>
							</div>
						)}

						{/* Status Legend in Search Area */}
						{!debouncedSearchQuery && (
							<div className="mt-2 space-y-2">
								<span className="text-black text-xs font-medium block">
									Showing {filteredIssues.length} of {issues.length} issues
								</span>
							<div className="flex items-center gap-2 sm:gap-3 flex-wrap">
								<div className="flex items-center gap-1">
									<div className="w-2.5 h-2.5 rounded-full bg-red-500" />
									<span className="text-[11px] sm:text-xs text-black">Reported</span>
								</div>
								<div className="flex items-center gap-1">
									<div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
									<span className="text-[11px] sm:text-xs text-black">In Progress</span>
								</div>
								<div className="flex items-center gap-1">
									<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
									<span className="text-[11px] sm:text-xs text-black">Resolved</span>
								</div>
							</div>
						</div>
						)}
					</CardContent>
				</Card>
			</div>
			)}

			{/* Filters Panel */}
			{showFilters && (
				<div className="absolute top-[120px] sm:top-24 left-2 right-2 sm:left-auto sm:right-4 z-10 w-auto sm:w-80 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-120px)] overflow-y-auto" data-search-panel>
					<Card className="shadow-lg bg-gray-50 border border-gray-300">
						<CardHeader className="pb-2 sm:pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base sm:text-lg text-black">Filters</CardTitle>
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
								<h4 className="font-medium mb-3 text-black">Status</h4>
								<div className="space-y-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<label key={status} className="flex items-center gap-3 cursor-pointer">
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
								<h4 className="font-medium mb-3 text-black">Severity</h4>
								<div className="space-y-2">
									{Object.keys(severityConfig).map((severity) => (
										<label key={severity} className="flex items-center gap-3 cursor-pointer">
											<input
												type="checkbox"
												checked={activeFilters.severity.includes(severity)}
												onChange={() => toggleFilter("severity", severity)}
												className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="capitalize text-black">{severity}</span>
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
				<div className="absolute top-[120px] sm:top-24 left-2 right-2 sm:left-4 sm:right-auto z-10 w-auto sm:w-72 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-120px)] overflow-y-auto">
					<Card className="shadow-lg bg-gray-50 border border-gray-300">
						<CardHeader className="pb-2 sm:pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base sm:text-lg text-black">Map Legend</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowLegend(false)}
									className="text-black hover:text-gray-700"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Status Legend */}
							<div>
								<h4 className="font-medium mb-3 text-black">Issue Status</h4>
								<div className="space-y-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<div key={status} className="flex items-center gap-3">
											<div 
												className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
												style={{ backgroundColor: config.color }}
											/>
											<span className="text-sm font-medium text-black">{config.label}</span>
										</div>
									))}
								</div>
							</div>

							{/* Category Legend */}
							<div>
								<h4 className="font-medium mb-3 text-black">Issue Categories</h4>
								<div className="grid grid-cols-2 gap-2">
									{Object.entries({
										lighting: { emoji: '💡', label: 'Lighting' },
										roads: { emoji: '🚗', label: 'Roads' },
										water: { emoji: '💧', label: 'Water' },
										traffic: { emoji: '🚦', label: 'Traffic' },
										sanitation: { emoji: '🗑️', label: 'Sanitation' },
										environment: { emoji: '🌲', label: 'Environment' },
										utilities: { emoji: '⚡', label: 'Utilities' },
										infrastructure: { emoji: '🏗️', label: 'Infrastructure' },
										safety: { emoji: '🛡️', label: 'Safety' },
										other: { emoji: '📍', label: 'Other' }
									}).map(([categoryId, config]) => (
										<div key={categoryId} className="flex items-center gap-2">
											<span className="text-sm">{config.emoji}</span>
											<span className="text-xs text-black">{config.label}</span>
										</div>
									))}
								</div>
							</div>

							{/* Severity Legend */}
							<div>
								<h4 className="font-medium mb-3 text-black">Severity Levels</h4>
								<div className="space-y-1">
									<div className="flex items-center gap-3">
										<div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
										<span className="text-sm text-black">Low</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white" />
										<span className="text-sm text-black">Medium</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white" />
										<span className="text-sm text-black">High</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-white" />
										<span className="text-sm text-black">Critical</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Enhanced Issue Detail Card - Simple with Expandable Details */}
			{selectedIssue && (
				<div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-4 sm:left-4 sm:right-auto sm:top-auto sm:transform-none z-20 p-0 sm:p-0 pointer-events-none">
					<Card 
						className="shadow-2xl border w-full sm:w-80 sm:max-w-sm bg-white/98 backdrop-blur-sm border-gray-200 max-h-[50vh] sm:max-h-[75vh] overflow-hidden pointer-events-auto rounded-t-3xl sm:rounded-2xl transition-all duration-300 ease-out"
					>
						{/* Mobile Handle Bar */}
						<div className="flex justify-center py-2 sm:hidden">
							<div className="w-10 h-1 bg-gray-300 rounded-full"></div>
						</div>
						
						<CardContent className="p-4 pt-2 sm:pt-4 overflow-y-auto max-h-[45vh] sm:max-h-[70vh]">
							{/* Simple Header */}
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1 pr-2">
									<h3 className="font-semibold text-lg text-black leading-tight">{selectedIssue.title}</h3>
									<div className="flex items-center gap-2 mt-2">
										<Badge className={`${statusConfig[selectedIssue.status].bgColor} ${statusConfig[selectedIssue.status].textColor} text-xs`}>
											{statusConfig[selectedIssue.status].label}
										</Badge>
										<Badge className={`${severityConfig[selectedIssue.severity as keyof typeof severityConfig].bgColor} ${severityConfig[selectedIssue.severity as keyof typeof severityConfig].textColor} text-xs capitalize`}>
											{selectedIssue.severity}
										</Badge>
									</div>
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => toggleBookmark(selectedIssue.id)}
										className="h-8 w-8 p-0 hover:bg-blue-50"
										title={bookmarkedIssues.has(selectedIssue.id) ? "Remove bookmark" : "Bookmark issue"}
									>
										<Bookmark className={`h-4 w-4 ${bookmarkedIssues.has(selectedIssue.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setSelectedIssue(null);
											setCardExpanded(false);
											// Keep route and directions visible - don't clear them
										}}
										className="h-8 w-8 p-0 border-gray-300 hover:border-gray-500 hover:bg-gray-50"
										title="Hide Issue Card"
									>
										<X className="h-4 w-4 text-gray-600" />
									</Button>
								</div>
							</div>
							
							{/* Brief Description */}
							<p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-2">
								{selectedIssue.description}
							</p>
							
							{/* Location & Distance - Always Visible */}
							{selectedIssue.address && (
								<div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
										<div className="flex-1">
											<p className="text-sm text-blue-900 font-medium">{selectedIssue.address}</p>
											{(() => {
												const distanceInfo = getDistanceInfo(selectedIssue);
												return distanceInfo ? (
													<div className="mt-1">
														<div className="flex items-center gap-4 text-xs text-blue-700">
															<span className="flex items-center gap-1">
																<span>📍</span>
																<strong>{distanceInfo.distance} km</strong> away
																{distanceInfo.isNearby && <span className="text-green-600 font-medium">(Nearby!)</span>}
															</span>
														</div>
													</div>
												) : null;
											})()}
										</div>
									</div>
								</div>
							)}

							{/* Action Buttons - Always Visible */}
							<div className="flex flex-wrap gap-2 mb-3">
								<Button
									size="sm"
									variant="ghost"
									className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
									onClick={(e) => {
										e.stopPropagation();
										handleVote(selectedIssue.id, "upvote");
									}}
								>
									<ThumbsUp className="h-4 w-4" />
									<span className="font-medium">{selectedIssue.upvotes}</span>
								</Button>

								<Button
									variant="ghost"
									size="sm"
									onClick={() => shareIssue(selectedIssue)}
									className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
									title="Share issue"
								>
									<Share2 className="h-3 w-3" />
									<span className="text-xs">Share</span>
								</Button>

								<Button
									size="sm"
									variant="ghost"
									onClick={() => {
										if (userLocation) {
											showDistanceView(selectedIssue);
										} else {
											// Try to request location again
											console.log('Requesting location for Show Distance...');
											requestLocation();
											// If still no location after a moment, show message
											setTimeout(() => {
												if (!userLocation) {
													alert('Please allow location access in your browser to use this feature. You may need to refresh the page after enabling location.');
												} else {
													showDistanceView(selectedIssue);
												}
											}, 1000);
										}
									}}
									className="flex items-center gap-1 text-gray-600 hover:text-purple-600"
									title="Show route on map"
								>
									<Focus className="h-3 w-3" />
									<span className="text-xs">Show Route</span>
								</Button>

								{routeDirections && (
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setShowDirections(!showDirections)}
										className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
										title="Show turn-by-turn directions"
									>
										<Compass className="h-3 w-3" />
										<span className="text-xs">Directions</span>
									</Button>
								)}

								<Button
									size="sm"
									variant="ghost"
									onClick={() => {
										if (userLocation) {
											const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedIssue.latitude},${selectedIssue.longitude}`;
											window.open(url, '_blank');
										} else {
											const url = `https://www.google.com/maps/place/${selectedIssue.latitude},${selectedIssue.longitude}`;
											window.open(url, '_blank');
										}
									}}
									className="flex items-center gap-1 text-gray-600 hover:text-green-600"
								>
									<Navigation className="h-3 w-3" />
									<span className="text-xs">Navigate</span>
								</Button>
							</div>

							{/* Expand/Collapse Button - Make it more prominent */}
							{/* Rate Limit Message */}
							{rateLimitMessage && (
								<div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
									<div className="flex items-center">
										<AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
										<span className="text-sm text-yellow-800">{rateLimitMessage}</span>
									</div>
								</div>
							)}

							<Button
								variant="outline"
								size="default"
								onClick={() => setCardExpanded(!cardExpanded)}
								className="w-full mb-3 border-gray-400 hover:border-gray-600 bg-white hover:bg-white font-medium text-black hover:text-black"
							>
								<Info className="h-4 w-4 mr-2 text-black" />
								{cardExpanded ? "Hide Details" : "Show More Details"}
								{cardExpanded ? <ChevronUp className="h-4 w-4 ml-2 text-black" /> : <ChevronDown className="h-4 w-4 ml-2 text-black" />}
							</Button>

							{/* Directions Panel (when route is shown) */}
							{showDirections && routeDirections && (
								<div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-center justify-between mb-3">
										<h4 className="font-medium text-sm text-blue-900 flex items-center gap-2">
											<Compass className="h-4 w-4" />
											Turn-by-Turn Directions
										</h4>
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-3 text-xs text-blue-700">
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{formatDuration(routeDirections.duration)}
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{formatDistance(routeDirections.distance)}
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													clearRoute();
													clearDistanceView();
													setShowDirections(false);
													setRouteDirections(null);
												}}
												className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
												title="Clear Route"
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									</div>
									
									<div className="space-y-2 max-h-48 overflow-y-auto">
										{routeDirections.steps.map((step: any, index: number) => {
											const DirectionIcon = getDirectionIcon(step.maneuver.instruction);
											return (
												<div key={index} className="flex items-start gap-3 p-2 bg-white rounded border border-blue-100">
													<div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full shrink-0 mt-0.5">
														<DirectionIcon className="h-3 w-3 text-blue-600" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 leading-tight">
															{step.maneuver.instruction}
														</p>
														{step.name && (
															<p className="text-xs text-gray-600 mt-1">
																{step.name} • {formatDistance(step.distance)}
															</p>
														)}
													</div>
												</div>
											);
										})}
									</div>

									{/* Quick action buttons */}
									<div className="mt-3 flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												const url = `https://www.google.com/maps/dir/${userLocation?.lat},${userLocation?.lng}/${selectedIssue.latitude},${selectedIssue.longitude}`;
												window.open(url, '_blank');
											}}
											className="flex-1 text-xs"
										>
											<ExternalLink className="h-3 w-3 mr-1" />
											Open in Google Maps
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												const url = `https://waze.com/ul?ll=${selectedIssue.latitude}%2C${selectedIssue.longitude}&navigate=yes`;
												window.open(url, '_blank');
											}}
											className="flex-1 text-xs"
										>
											<Navigation className="h-3 w-3 mr-1" />
											Open in Waze
										</Button>
									</div>
								</div>
							)}

							{/* Expandable Details Section */}
							{cardExpanded && (
								<div className="space-y-4 border-t border-gray-200 pt-4">
									{/* Enhanced Distance & Travel Info */}
									{userLocation && (() => {
										const distanceInfo = getDistanceInfo(selectedIssue);
										return distanceInfo ? (
											<div className="p-3 bg-gray-50 rounded-lg">
												<h4 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-2">
													<MapPin className="h-4 w-4" />
													Travel Information
												</h4>
												<div className="grid grid-cols-2 gap-3 text-xs">
													<div className="flex items-center gap-2">
														<span>🚶‍♀️</span>
														<div>
															<span className="text-gray-500">Walking:</span>
															<div className="font-medium text-gray-900">~{distanceInfo.walkingTime} min</div>
														</div>
													</div>
													<div className="flex items-center gap-2">
														<span>🚗</span>
														<div>
															<span className="text-gray-500">Driving:</span>
															<div className="font-medium text-gray-900">~{distanceInfo.drivingTime} min</div>
														</div>
													</div>
												</div>
												{userLocation && (
													<div className="mt-3 flex gap-2">
														<Button
															size="sm"
															variant={drawnRoute ? "default" : "outline"}
															onClick={() => drawnRoute ? clearRoute() : drawRoute(selectedIssue)}
															className="flex-1 text-xs"
														>
															<Route className="h-3 w-3 mr-1" />
															{drawnRoute ? "Hide Route" : "Show Route"}
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => {
																const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedIssue.latitude},${selectedIssue.longitude}`;
																window.open(url, '_blank');
															}}
															className="flex items-center gap-1 text-xs"
														>
															<ExternalLink className="h-3 w-3" />
															Open in Maps
														</Button>
													</div>
												)}
											</div>
										) : null;
									})()}

									{/* Detailed Issue Information */}
									<div className="p-3 bg-gray-50 rounded-lg">
										<h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
											<Info className="h-4 w-4" />
											Issue Details
										</h4>
										<div className="space-y-3">
											<div>
												<span className="text-xs text-gray-500 uppercase tracking-wide">Full Description</span>
												<p className="text-sm text-gray-900 mt-1 leading-relaxed">{selectedIssue.description}</p>
											</div>
											
											<div className="grid grid-cols-2 gap-4">
												<div>
													<span className="text-xs text-gray-500 uppercase tracking-wide">Category</span>
													<div className="flex items-center gap-2 mt-1">
														<span>{categoryLabels[selectedIssue.categoryId || 'other']}</span>
														<span className="text-sm font-medium text-gray-900 capitalize">{selectedIssue.categoryId}</span>
													</div>
												</div>
												<div>
													<span className="text-xs text-gray-500 uppercase tracking-wide">Reporter</span>
													<div className="flex items-center gap-1 mt-1">
														<User className="h-3 w-3 text-gray-400" />
														<span className="text-sm font-medium text-gray-900">{selectedIssue.reporterId}</span>
													</div>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<span className="text-xs text-gray-500 uppercase tracking-wide">Reported</span>
													<div className="mt-1">
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3 text-gray-400" />
															<span className="text-sm font-medium text-gray-900">{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
														</div>
														<div className="flex items-center gap-1 mt-1">
															<Timer className="h-3 w-3 text-gray-400" />
															<span className="text-xs text-gray-500">{getTimeAgo(selectedIssue.createdAt)}</span>
														</div>
													</div>
												</div>
												<div>
													<span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
													<div className="mt-1">
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3 text-gray-400" />
															<span className="text-sm font-medium text-gray-900">{new Date(selectedIssue.updatedAt).toLocaleDateString()}</span>
														</div>
														<div className="flex items-center gap-1 mt-1">
															<Timer className="h-3 w-3 text-gray-400" />
															<span className="text-xs text-gray-500">{getTimeAgo(selectedIssue.updatedAt)}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Community Engagement */}
									<div className="p-3 bg-gray-50 rounded-lg">
										<h4 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-2">
											<TrendingUp className="h-4 w-4" />
											Community Engagement
										</h4>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div className="text-center">
													<div className="text-lg font-bold text-green-600">{selectedIssue.upvotes}</div>
													<div className="text-xs text-gray-500">Upvotes</div>
												</div>
												<div className="text-center">
													<div className="text-lg font-bold text-gray-600">{selectedIssue.upvotes + selectedIssue.downvotes}</div>
													<div className="text-xs text-gray-500">Total Interactions</div>
												</div>
											</div>
											<Button
												size="sm"
												variant="ghost"
												className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													handleVote(selectedIssue.id, "upvote");
												}}
											>
												<ThumbsUp className="h-4 w-4" />
												<span>Support This Issue</span>
											</Button>
										</div>
									</div>

									{/* Resolution Status */}
									{selectedIssue.status === 'resolved' && selectedIssue.resolvedAt && (
										<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
											<div className="flex items-center gap-2 text-sm text-green-800">
												<CheckCircle className="h-4 w-4" />
												<span className="font-medium">Issue Resolved</span>
											</div>
											<p className="text-xs text-green-700 mt-1">
												Resolved {getTimeAgo(selectedIssue.resolvedAt)} on {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
											</p>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{/* Quick Features Popup */}
			{showQuickFeatures && userLocation && (
				<div 
					className="fixed top-20 left-3 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200"
					style={{ width: '220px' }}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4" />
								<span className="font-medium text-sm">Quick Features</span>
							</div>
							<button 
								onClick={() => setShowQuickFeatures(false)}
								className="text-orange-100 hover:text-white transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="py-2">
						<button
							onClick={findClosestIssue}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
								<Compass className="h-3.5 w-3.5 text-orange-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Find Closest</div>
								<div className="text-xs text-gray-500">Navigate to nearest issue</div>
							</div>
						</button>

						<button
							onClick={centerOnUser}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
								<Focus className="h-3.5 w-3.5 text-blue-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Center Map</div>
								<div className="text-xs text-gray-500">Focus on your location</div>
							</div>
						</button>

						<button
							onClick={shareLocation}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
								<ExternalLink className="h-3.5 w-3.5 text-purple-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Share Location</div>
								<div className="text-xs text-gray-500">Copy location URL</div>
							</div>
						</button>
					</div>
				</div>
			)}

			{/* User Location Popup Menu */}
			{showUserLocationPopup && userLocationPopupPosition && (
				<div 
					className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200"
					style={{
						left: userLocationPopupPosition.x - 120, // Center the 240px wide popup
						top: userLocationPopupPosition.y - 10,
						transform: 'translateY(-100%)',
						width: '240px'
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Popup Arrow */}
					<div 
						className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
						style={{ 
							width: 0, 
							height: 0, 
							borderLeft: '8px solid transparent',
							borderRight: '8px solid transparent',
							borderTop: '8px solid white'
						}}
					/>
					
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
							<span className="font-medium text-sm">Your Location</span>
						</div>
						{userLocation && locationAccuracy && (
							<p className="text-xs text-blue-100 mt-1">
								Accuracy: {locationAccuracy}
							</p>
						)}
					</div>

					{/* Quick Actions Section */}
					<div className="py-2 border-b border-gray-100">
						<div className="px-4 py-2">
							<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</div>
						</div>
						
						<button
							onClick={centerOnUser}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
								<Focus className="h-4 w-4 text-blue-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Center Map</div>
								<div className="text-xs text-gray-500">Focus on your location</div>
							</div>
						</button>

						<button
							onClick={showMyArea}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
								<ArrowUp className="h-4 w-4 text-green-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Show My Area</div>
								<div className="text-xs text-gray-500">Wider neighborhood view</div>
							</div>
						</button>

						<button
							onClick={reportIssueHere}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
								<MapPin className="h-4 w-4 text-red-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Report Issue Here</div>
								<div className="text-xs text-gray-500">Create issue at location</div>
							</div>
						</button>
					</div>

					{/* Main Actions Section */}
					<div className="py-2">
						<div className="px-4 py-2">
							<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Explore</div>
						</div>

						<button
							onClick={findClosestIssue}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
								<Compass className="h-4 w-4 text-orange-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Find Closest Issue</div>
								<div className="text-xs text-gray-500">Navigate to nearest issue</div>
							</div>
						</button>

						<button
							onClick={findDirections}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
								<Route className="h-4 w-4 text-indigo-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Get Directions</div>
								<div className="text-xs text-gray-500">Open in maps app</div>
							</div>
						</button>

						<button
							onClick={toggleLiveTracking}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLiveTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
								<Timer className={`h-4 w-4 ${isLiveTracking ? 'text-green-600' : 'text-gray-600'}`} />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">
									{isLiveTracking ? 'Stop' : 'Start'} Live Tracking
								</div>
								<div className="text-xs text-gray-500">
									{isLiveTracking ? 'Disable location updates' : 'Enable location updates'}
								</div>
							</div>
						</button>

						<button
							onClick={shareLocation}
							className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
								<ExternalLink className="h-4 w-4 text-purple-600" />
							</div>
							<div>
								<div className="font-medium text-sm text-gray-900">Share Location</div>
								<div className="text-xs text-gray-500">Copy location link</div>
							</div>
						</button>
					</div>

					{/* Footer */}
					<div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
						<p className="text-xs text-gray-500 text-center">
							Tap anywhere to close
						</p>
					</div>
				</div>
			)}

		</div>
	);
}