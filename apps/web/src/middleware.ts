import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	
	// Skip middleware for static files, API routes, and auth routes
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/auth") ||
		pathname.includes(".") ||
		pathname === "/login" ||
		pathname === "/forgot-password" ||
		pathname === "/reset-password" ||
		pathname === "/verify" ||
		pathname === "/onboarding"
	) {
		return NextResponse.next();
	}

	try {
		// Get session using betterFetch
		const { data: session } = await betterFetch<Session>(
			"/api/auth/get-session",
			{
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "https://brokenexperiences.onrender.com",
				headers: {
					//get the cookie from the request
					cookie: request.headers.get("cookie") || "",
				},
			},
		);

		// Protected routes (everything under /home, /profile, /map, etc.)
		const protectedRoutes = ["/home", "/profile", "/map", "/settings", "/activities", "/report"];
		const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

		if (isProtectedRoute && !session) {
			// Redirect to login if accessing protected route without session
			return NextResponse.redirect(new URL("/login", request.url));
		}

		if (pathname === "/" && session) {
			// Redirect to home if accessing root with session
			return NextResponse.redirect(new URL("/home", request.url));
		}

		if (pathname === "/login" && session) {
			// Redirect to home if accessing login page with active session
			return NextResponse.redirect(new URL("/home", request.url));
		}
		
		if (pathname === "/" && session) {
			// Redirect to home if accessing root with session
			return NextResponse.redirect(new URL("/home", request.url));
		}

	} catch (error) {
		console.error("Middleware auth error:", error);
		// If there's an error and user is trying to access protected routes, redirect to login
		const protectedRoutes = ["/home", "/profile", "/map", "/settings", "/activities", "/report"];
		const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
		
		if (isProtectedRoute) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};