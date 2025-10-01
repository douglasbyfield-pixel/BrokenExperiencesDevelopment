"use client";

import { createClient } from "@web/lib/supabase/client";
import { type User, type Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signIn: (provider: "google" | "apple") => Promise<void>;
	signInEmail: (email: string, password: string) => Promise<void>;
	signUpEmail: (email: string, password: string, name: string) => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
			
			if (requireAuth && !session) {
				router.push('/login');
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
			setSession(session);
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [requireAuth, router, supabase.auth]);

	// Auth methods
	const signIn = async (provider: "google" | "apple") => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) {
			console.error("Sign in error:", error);
			throw error;
		}
	};

	const signInEmail = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			console.error("Sign in error:", error);
			throw error;
		}
		router.push('/home');
	};

	const signUpEmail = async (email: string, password: string, name: string) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name },
			},
		});
		if (error) {
			console.error("Sign up error:", error);
			throw error;
		}
		router.push('/home');
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Sign out error:", error);
			throw error;
		}
		router.push('/login');
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Loading...</div>
			</div>
		);
	}

	if (requireAuth && !user) {
		return null; // Will redirect to login
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				isLoading,
				signIn,
				signInEmail,
				signUpEmail,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}