import {
	Building,
	Bus,
	Car,
	Droplets,
	Footprints,
	Home,
	Leaf,
	Lightbulb,
	type LucideIcon,
	Paintbrush,
	ParkingCircle,
	Shield,
	Sparkles,
	TrafficCone,
	Trash2,
	TreePine,
	Volume2,
	Wrench,
} from "lucide-react";

// Define a type for category styling
export interface CategoryStyling {
	icon: React.ElementType;
	color: string;
	bgColor: string;
	textColor: string;
	name: string; // Display name
	svgPath: string; // For map markers
}

// Centralized configuration for category styling
// The keys here should match the 'name' field of categories in your database
export const CATEGORY_STYLING: Record<string, CategoryStyling> = {
	"Building Maintenance": {
		icon: Wrench,
		color: "#6b7280", // Gray
		bgColor: "bg-gray-500",
		textColor: "text-gray-700",
		name: "Building Maintenance",
		svgPath:
			'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
	},
	"Environmental Issues": {
		icon: Leaf,
		color: "#10b981", // Green
		bgColor: "bg-green-500",
		textColor: "text-green-700",
		name: "Environmental Issues",
		svgPath:
			'<path d="M11 20A7 7 0 0 0 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
	},
	"Graffiti & Vandalism": {
		icon: Paintbrush,
		color: "#ef4444", // Red
		bgColor: "bg-red-500",
		textColor: "text-red-700",
		name: "Graffiti & Vandalism",
		svgPath:
			'<path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/>',
	},
	"Noise & Disturbances": {
		icon: Volume2,
		color: "#f59e0b", // Amber
		bgColor: "bg-amber-500",
		textColor: "text-amber-700",
		name: "Noise & Disturbances",
		svgPath:
			'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
	},
	Other: {
		icon: Building,
		color: "#64748b", // Slate
		bgColor: "bg-slate-500",
		textColor: "text-slate-700",
		name: "Other",
		svgPath:
			'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
	},
	"Parks & Recreation": {
		icon: TreePine,
		color: "#10b981", // Green
		bgColor: "bg-green-500",
		textColor: "text-green-700",
		name: "Parks & Recreation",
		svgPath:
			'<path d="M17 8C8 10 5.9 16.17 3.82 21.34l2.71.9.95-2.3c.48.17.98.3 1.52.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75S7 14 17 14s11.25.5 11.25 1.5-7.25 3.25-12.25 3.25S2 19.5 2 21.5s1.75 3.75 1.75 3.75S7 22 17 22s11.25.5 11.25 1.5-7.25 3.25-12.25 3.25"/>',
	},
	"Public Safety": {
		icon: Shield,
		color: "#dc2626", // Red
		bgColor: "bg-red-500",
		textColor: "text-red-700",
		name: "Public Safety",
		svgPath:
			'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .9-.99l7-1a1 1 0 0 1 .2 0l7 1A1 1 0 0 1 20 6Z"/><path d="m9 12 2 2 4-4"/>',
	},
	"Public Transportation": {
		icon: Bus,
		color: "#0ea5e9", // Sky blue
		bgColor: "bg-sky-500",
		textColor: "text-sky-700",
		name: "Public Transportation",
		svgPath:
			'<path d="M8 6v6M16 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
	},
	"Road & Infrastructure": {
		icon: TrafficCone,
		color: "#8b5cf6", // Purple
		bgColor: "bg-purple-500",
		textColor: "text-purple-700",
		name: "Road & Infrastructure",
		svgPath:
			'<path d="M9.6 2.6 2 22h3.2l1.1-3h11.4l1.1 3H22L14.4 2.6a1.5 1.5 0 0 0-2.8 0Z"/><path d="M7.5 16h9"/>',
	},
	"Sidewalks & Walkways": {
		icon: Footprints,
		color: "#a855f7", // Violet
		bgColor: "bg-violet-500",
		textColor: "text-violet-700",
		name: "Sidewalks & Walkways",
		svgPath:
			'<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>',
	},
	"Street Lighting": {
		icon: Lightbulb,
		color: "#f59e0b", // Amber
		bgColor: "bg-amber-500",
		textColor: "text-amber-700",
		name: "Street Lighting",
		svgPath:
			'<path d="M15 14c.2-1 1.2-1 2.5-1s2.3 0 2.5 1c-.2 1-1.2 1-2.5 1s-2.3 0-2.5-1z"/><path d="M9 21c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-1H9v1z"/><path d="M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>',
	},
	"Traffic & Parking": {
		icon: Car,
		color: "#ef4444", // Red
		bgColor: "bg-red-500",
		textColor: "text-red-700",
		name: "Traffic & Parking",
		svgPath:
			'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 8.3c-.2-.5-.8-.8-1.3-.8h-10.8c-.5 0-1.1.3-1.3.8L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
	},
	"Waste Management": {
		icon: Trash2,
		color: "#6b7280", // Gray
		bgColor: "bg-gray-500",
		textColor: "text-gray-700",
		name: "Waste Management",
		svgPath:
			'<path d="M3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6H3z"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6"/>',
	},
	"Water & Drainage": {
		icon: Droplets,
		color: "#3b82f6", // Blue
		bgColor: "bg-blue-500",
		textColor: "text-blue-700",
		name: "Water & Drainage",
		svgPath:
			'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
	},
};

// Default styling for categories not found in the config
const DEFAULT_CATEGORY_STYLING: CategoryStyling = {
	icon: Building, // Default icon
	color: "#64748b", // Default color (slate)
	bgColor: "bg-slate-500",
	textColor: "text-slate-700",
	name: "Other",
	svgPath:
		'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
};

// Helper function to get styling for a given category name
export function getCategoryStyling(categoryName: string): CategoryStyling {
	// Normalize category name for lookup
	const normalizedName = categoryName.trim();
	return CATEGORY_STYLING[normalizedName] || DEFAULT_CATEGORY_STYLING;
}
