import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseSession } from "@/lib/use-supabase-session";
import { supabase } from "@/lib/supabase-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu() {
    const router = useRouter();
    const { user, loading } = useSupabaseSession();

    if (loading) {
		return <Skeleton className="h-9 w-24" />;
	}

    if (!user) {
		return (
			<Button variant="outline" asChild>
				<Link href="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
                <Button variant="outline">{user.email}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
                <DropdownMenuItem>{user.email}</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Button
						variant="destructive"
						className="w-full"
						onClick={() => {
                            supabase.auth.signOut().then(() => router.push("/"));
						}}
					>
						Sign Out
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
