import { Button } from "@/components/ui/button";

export function HomePage() {
	return (
		<div className="min-h-screen space-y-6 bg-background p-4 text-foreground">
			<div className="text-center">
				<h1 className="mb-2 font-bold text-3xl text-foreground">
					Broken Experiences
				</h1>
				<p className="text-muted-foreground">
					Report and discover broken experiences
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Button className="flex h-20 flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
					<span className="text-lg">📍</span>
					<span>Map</span>
				</Button>
				<Button className="flex h-20 flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
					<span className="text-lg">📝</span>
					<span>Report</span>
				</Button>
				<Button className="flex h-20 flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
					<span className="text-lg">👤</span>
					<span>Profile</span>
				</Button>
				<Button className="flex h-20 flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
					<span className="text-lg">⚙️</span>
					<span>Settings</span>
				</Button>
			</div>
		</div>
	);
}
