export interface Location {
	lat: number;
	lng: number;
}

export interface MapBounds {
	north: number;
	south: number;
	east: number;
	west: number;
}

export interface MapMarker {
	id: string;
	position: Location;
	title?: string;
	description?: string;
	color?: string;
	clickable?: boolean;
}
