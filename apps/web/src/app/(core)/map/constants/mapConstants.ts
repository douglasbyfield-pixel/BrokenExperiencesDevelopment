// Map configuration constants
export const MAP_CONFIG = {
	DEFAULT_ZOOM: 16,
	CLUSTER_ZOOM_THRESHOLD: 14,
	CLUSTER_DISTANCES: {
		ZOOM_12: 0.3,
		ZOOM_10: 0.5,
		DEFAULT: 0.15,
	},
	GEOLOCATION_OPTIONS: {
		enableHighAccuracy: true,
		timeout: 15000,
		maximumAge: 60000,
	},
	LIVE_TRACKING_OPTIONS: {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 1000,
	},
};
