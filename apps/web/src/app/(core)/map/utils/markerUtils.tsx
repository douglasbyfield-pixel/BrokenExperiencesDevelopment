import { createRoot } from "react-dom/client";
import { MapCluster } from "../components/MapCluster";
import { MapMarker } from "../components/MapMarker";

// Create React-based markers for Mapbox
export const createReactMarker = (
	experience: any,
	onClick: (experience: any) => void,
) => {
	const markerEl = document.createElement("div");
	const root = createRoot(markerEl);
	root.render(<MapMarker experience={experience} onClick={onClick} />);
	return markerEl;
};

export const createReactCluster = (
	cluster: any,
	onClick: (experiences: any[]) => void,
) => {
	const markerEl = document.createElement("div");
	const root = createRoot(markerEl);
	root.render(<MapCluster cluster={cluster} onClick={onClick} />);
	return markerEl;
};
