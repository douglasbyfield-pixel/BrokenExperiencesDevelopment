import { eden } from "@web/lib/eden";
import MapClient from "./features/map-client";

export default async function MapPage() {
	const experiences = await eden.experience.get({ $query: {} });

	return <MapClient experiences={experiences.data || []} />;
}
