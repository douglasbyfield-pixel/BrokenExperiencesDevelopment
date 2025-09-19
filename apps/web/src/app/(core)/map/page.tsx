"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
	MapPin, 
	Filter, 
	Search, 
	AlertCircle, 
	CheckCircle, 
	Clock,
	ThumbsUp,
	ThumbsDown,
	X,
	Construction,
	Car,
	Lightbulb,
	TreePine,
	Trash2,
	Zap,
	Droplets,
	Shield,
	Building
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
	low: { scale: 0.8, zIndex: 1 },
	medium: { scale: 1.0, zIndex: 2 },
	high: { scale: 1.2, zIndex: 3 },
	critical: { scale: 1.4, zIndex: 4 },
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
	const iconPaths: { [key: string]: string } = {
		infrastructure: "M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0z M12 6l0 10 M12 18l-7-4 14 0z",
		roads: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		lighting: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4",
		environment: "M12 2L8 8h8l-4-6z M8 8L4 14h16L16 8 M4 14L2 18h20l-2-4",
		sanitation: "M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2 M10 11v6 M14 11v6",
		utilities: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
		water: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
		safety: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
		building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12h12 M6 16h12 M10 6h4 M10 10h4",
		traffic: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10c-.1-.1-.4-.6-.7-1.3L16.1 6.4C15.8 5.6 15 5 14.1 5H9.9c-.9 0-1.7.6-2 1.4L6.7 8.7c-.3.7-.6 1.2-.7 1.3l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2 M9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M15 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
		vandalism: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
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
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<any>(null);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
	const [activeFilters, setActiveFilters] = useState<{
		status: string[];
		severity: string[];
	}>({
		status: [],
		severity: []
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);

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
				const mapboxgl = await import('mapbox-gl');
				
				// Make mapboxgl available globally for marker creation
				(window as any).mapboxgl = mapboxgl.default;
				
				mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

				map.current = new mapboxgl.default.Map({
					container: mapContainer.current,
					style: 'mapbox://styles/mapbox/streets-v12',
					center: [-77.2975, 18.1096], // Jamaica center
					zoom: 9, // Better zoom for Jamaica
					maxBounds: [
						[-78.5, 17.5], // Southwest coordinates of Jamaica
						[-76.0, 18.8]  // Northeast coordinates of Jamaica
					]
				});

				map.current.addControl(new mapboxgl.default.NavigationControl());
				map.current.addControl(new mapboxgl.default.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true
					},
					trackUserLocation: true
				}));

				map.current.on('load', () => {
					console.log('Map loaded successfully');
					// Fit map to Jamaica bounds
					map.current.fitBounds([
						[-78.5, 17.5], // Southwest coordinates of Jamaica
						[-76.0, 18.8]  // Northeast coordinates of Jamaica
					], {
						padding: 20
					});
					setMapLoaded(true);
				});

			} catch (error) {
				console.error('Failed to load Mapbox:', error);
				setMapLoaded(true); // Still show the interface
			}
		};

		initializeMap();

		return () => {
			// Cleanup markers and layers
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
			
			if (map.current) {
				// Remove layers if they exist
				try {
					if (map.current.getLayer('issues-labels')) {
						map.current.removeLayer('issues-labels');
					}
					if (map.current.getLayer('issues-layer')) {
						map.current.removeLayer('issues-layer');
					}
					if (map.current.getSource('issues')) {
						map.current.removeSource('issues');
					}
				} catch (e) {
					console.log('Cleanup layers error:', e);
				}
				map.current.remove();
			}
		};
	}, []);

	// Store markers for cleanup
	const markersRef = useRef<any[]>([]);

	// Native Mapbox markers using GeoJSON
	useEffect(() => {
		if (!map.current || !mapLoaded || filteredIssues.length === 0) return;

		console.log('Creating native Mapbox markers for', filteredIssues.length, 'Jamaica issues');

		// Clear existing markers and layers
		markersRef.current.forEach(marker => marker.remove());
		markersRef.current = [];

		// Remove existing layers
		try {
			if (map.current.getLayer('issues-layer')) {
				map.current.removeLayer('issues-layer');
			}
			if (map.current.getSource('issues')) {
				map.current.removeSource('issues');
			}
		} catch (e) {
			console.log('No existing layers to remove');
		}

		// Create GeoJSON features from issues
		const geojsonData = {
			type: 'FeatureCollection',
			features: filteredIssues.map((issue) => ({
				type: 'Feature',
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
					color: statusConfig[issue.status].color
				},
				geometry: {
					type: 'Point',
					coordinates: [issue.longitude, issue.latitude]
				}
			}))
		};

		console.log('Adding GeoJSON source with', geojsonData.features.length, 'features');

		// Add source
		map.current.addSource('issues', {
			type: 'geojson',
			data: geojsonData
		});

		// Add circle layer for markers
		map.current.addLayer({
			id: 'issues-layer',
			type: 'circle',
			source: 'issues',
			paint: {
				'circle-radius': [
					'case',
					['==', ['get', 'severity'], 'critical'], 20,
					['==', ['get', 'severity'], 'high'], 16,
					['==', ['get', 'severity'], 'medium'], 14,
					12 // low
				],
				'circle-color': ['get', 'color'],
				'circle-stroke-width': 3,
				'circle-stroke-color': '#ffffff',
				'circle-opacity': 0.9,
				'circle-stroke-opacity': 1
			}
		});

		// Add symbol layer for category icons
		map.current.addLayer({
			id: 'issues-icons',
			type: 'symbol',
			source: 'issues',
			layout: {
				'icon-image': [
					'case',
					['==', ['get', 'categoryId'], 'lighting'], 'marker-15',
					['==', ['get', 'categoryId'], 'roads'], 'car-15',
					['==', ['get', 'categoryId'], 'water'], 'water-15',
					['==', ['get', 'categoryId'], 'traffic'], 'roadblock-15',
					['==', ['get', 'categoryId'], 'sanitation'], 'waste-basket-15',
					['==', ['get', 'categoryId'], 'environment'], 'park-15',
					['==', ['get', 'categoryId'], 'utilities'], 'industrial-15',
					['==', ['get', 'categoryId'], 'infrastructure'], 'building-15',
					['==', ['get', 'categoryId'], 'safety'], 'police-15',
					'marker-15' // default
				],
				'icon-size': 0.8,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true
			}
		});

		// Add click handler for markers
		map.current.on('click', 'issues-layer', (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				const issue = filteredIssues.find(i => i.id === feature.properties.id);
				if (issue) {
					console.log('Native marker clicked:', issue.title);
					setSelectedIssue(issue);
				}
			}
		});

		// Add hover effects
		map.current.on('mouseenter', 'issues-layer', () => {
			map.current.getCanvas().style.cursor = 'pointer';
		});

		map.current.on('mouseleave', 'issues-layer', () => {
			map.current.getCanvas().style.cursor = '';
		});

		console.log('✅ Native Mapbox markers created successfully');

	}, [filteredIssues, mapLoaded]);

	const setMockData = () => {
		// Clear existing issues and set new Jamaica-specific issues
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
			}
		];
		console.log('Setting Jamaica mock data with', mockIssues.length, 'issues');
		setIssues(mockIssues);
	};

	// Apply filters whenever issues or filters change
	useEffect(() => {
		let filtered = [...issues];
		
		// Apply status filters
		if (activeFilters.status.length > 0) {
			filtered = filtered.filter(issue => activeFilters.status.includes(issue.status));
		}
		
		// Apply severity filters
		if (activeFilters.severity.length > 0) {
			filtered = filtered.filter(issue => activeFilters.severity.includes(issue.severity));
		}
		
		// Apply search query
		if (searchQuery) {
			filtered = filtered.filter(issue => 
				issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				issue.address?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		setFilteredIssues(filtered);
	}, [issues, activeFilters, searchQuery]);

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
		<div className="h-full relative">
			{/* Mapbox Container */}
			<div ref={mapContainer} className="h-full w-full" />

			{/* Search Bar */}
			<div className="absolute top-4 left-4 right-4 z-10 max-w-md">
				<Card className="shadow-lg">
					<CardContent className="p-3">
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search issues..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowFilters(!showFilters)}
								className="relative shrink-0"
							>
								<Filter className="h-4 w-4" />
								{(activeFilters.status.length + activeFilters.severity.length) > 0 && (
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<div className="absolute top-20 right-4 z-10 w-80">
					<Card className="shadow-lg">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Filters</CardTitle>
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
								<h4 className="font-medium mb-3">Status</h4>
								<div className="space-y-2">
									{Object.entries(statusConfig).map(([status, config]) => (
										<label key={status} className="flex items-center gap-3 cursor-pointer">
											<input
												type="checkbox"
												checked={activeFilters.status.includes(status)}
												onChange={() => toggleFilter("status", status)}
												className="rounded border-gray-300"
											/>
											<div className={`flex items-center gap-2 ${config.textColor}`}>
												<config.icon className="h-4 w-4" />
												<span>{config.label}</span>
											</div>
										</label>
									))}
								</div>
							</div>
							
							<div>
								<h4 className="font-medium mb-3">Severity</h4>
								<div className="space-y-2">
									{Object.keys(severityConfig).map((severity) => (
										<label key={severity} className="flex items-center gap-3 cursor-pointer">
											<input
												type="checkbox"
												checked={activeFilters.severity.includes(severity)}
												onChange={() => toggleFilter("severity", severity)}
												className="rounded border-gray-300"
											/>
											<span className="capitalize">{severity}</span>
										</label>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Issue Detail Popup */}
			{selectedIssue && (
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
					<Card className="shadow-xl border min-w-[320px] max-w-[400px]">
						<CardContent className="p-4">
							<div className="flex items-start justify-between mb-3">
								<h3 className="font-semibold text-lg text-gray-900 pr-2">{selectedIssue.title}</h3>
								<div className="flex items-center gap-2">
									<Badge className={`${statusConfig[selectedIssue.status].bgColor} ${statusConfig[selectedIssue.status].textColor} shrink-0`}>
										{statusConfig[selectedIssue.status].label}
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedIssue(null)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
							
							<p className="text-sm text-gray-600 mb-3 leading-relaxed">{selectedIssue.description}</p>
							
							{selectedIssue.address && (
								<p className="text-xs text-gray-500 mb-3 flex items-center">
									<MapPin className="inline h-3 w-3 mr-1" />
									{selectedIssue.address}
								</p>
							)}
							
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
									<Button
										size="sm"
										variant="ghost"
										className="flex items-center gap-1 text-gray-700 hover:text-red-600"
										onClick={(e) => {
											e.stopPropagation();
											handleVote(selectedIssue.id, "downvote");
										}}
									>
										<ThumbsDown className="h-4 w-4" />
										<span>{selectedIssue.downvotes}</span>
									</Button>
								</div>
								<Badge variant="outline" className="capitalize">
									{selectedIssue.severity}
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Stats Bar */}
			<div className="absolute bottom-4 left-4 right-4 z-10">
				<Card className="shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-4">
								<span className="text-muted-foreground font-medium">
									Showing {filteredIssues.length} of {issues.length} issues
								</span>
								<div className="hidden md:flex items-center gap-4">
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
										<span className="text-gray-700">Reported</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
										<span className="text-gray-700">In Progress</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
										<span className="text-gray-700">Resolved</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}