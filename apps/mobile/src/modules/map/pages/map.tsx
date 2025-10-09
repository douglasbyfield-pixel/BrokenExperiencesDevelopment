import { Button } from "@/components/ui/button";

export function MapPage() {
	return (
		<div className="min-h-screen space-y-4 p-4">
			<div className="text-center">
				<h1 className="mb-2 font-bold text-2xl">Map View</h1>
				<p className="text-muted-foreground">
					View broken experiences on the map
				</p>
			</div>

			<div className="flex h-64 items-center justify-center rounded-lg bg-muted">
				<p className="text-muted-foreground">Map will be implemented here</p>
			</div>

			<div className="space-y-2">
				<Button className="w-full">📍 Use Current Location</Button>
				<Button variant="outline" className="w-full">
					🔍 Search Location
				</Button>
			</div>
		</div>
	);
}
