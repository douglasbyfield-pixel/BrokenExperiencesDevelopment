"use client";

import { authClient } from "@web/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Check session
		const checkAuth = async () => {
			const { data: session } = authClient.useSession();
			
			if (session) {
				setIsAuthenticated(true);
			} else if (requireAuth) {
				router.push('/login');
				return;
			}
			
			setIsLoading(false);
		};

		checkAuth();
	}, [requireAuth, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Loading...</div>
			</div>
		);
	}

	if (requireAuth && !isAuthenticated) {
		return null; // Will redirect to login
	}

	return <>{children}</>;
}