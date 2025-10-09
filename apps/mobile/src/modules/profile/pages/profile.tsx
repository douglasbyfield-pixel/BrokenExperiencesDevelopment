import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfilePage() {
	return (
		<div className="min-h-screen space-y-6 p-4">
			<div className="text-center">
				<Avatar className="mx-auto mb-4 h-20 w-20">
					<AvatarImage src="" alt="Profile" />
					<AvatarFallback>U</AvatarFallback>
				</Avatar>
				<h1 className="mb-2 font-bold text-2xl">User Profile</h1>
				<p className="text-muted-foreground">Manage your account settings</p>
			</div>

			<div className="space-y-4">
				<div className="rounded-lg bg-card p-4">
					<h3 className="mb-2 font-semibold">Account Information</h3>
					<p className="text-muted-foreground text-sm">
						Email: user@example.com
					</p>
					<p className="text-muted-foreground text-sm">Reports: 5</p>
				</div>

				<div className="space-y-2">
					<Button variant="outline" className="w-full justify-start">
						📝 My Reports
					</Button>
					<Button variant="outline" className="w-full justify-start">
						⚙️ Settings
					</Button>
					<Button variant="outline" className="w-full justify-start">
						❓ Help & Support
					</Button>
					<Button variant="destructive" className="w-full justify-start">
						🚪 Sign Out
					</Button>
				</div>
			</div>
		</div>
	);
}
