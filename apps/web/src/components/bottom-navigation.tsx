"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@web/components/auth-provider";
import { 
    Home, 
    Search, 
    MapPin, 
    Trophy, 
    User
} from "lucide-react";

interface NavItem {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    requiresAuth?: boolean;
}

const navItems: NavItem[] = [
    {
        href: "/home",
        icon: Home,
        label: "Home",
    },
    {
        href: "/search",
        icon: Search,
        label: "Search",
    },
    {
        href: "/map",
        icon: MapPin,
        label: "Map",
    },
    {
        href: "/leaderboard",
        icon: Trophy,
        label: "Leaderboard",
    },
    {
        href: "/profile",
        icon: User,
        label: "Profile",
        requiresAuth: true,
    },
];

export function BottomNavigation() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/home") {
            return pathname === "/" || pathname === "/home";
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            {/* Background with blur effect */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md border-t border-gray-200"></div>
            
            {/* Navigation items */}
            <nav className="relative flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    // Skip items that require auth if user is not logged in
                    if (item.requiresAuth && !user) {
                        return null;
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href as any}
                            className={`
                                flex flex-col items-center justify-center 
                                min-w-0 flex-1 h-full py-2
                                transition-all duration-200 ease-out
                                ${active 
                                    ? "text-black" 
                                    : "text-gray-600 hover:text-gray-900 active:scale-95"
                                }
                            `}
                        >
                            <div className={`
                                flex items-center justify-center
                                transition-all duration-200 ease-out
                                ${active 
                                    ? "transform -translate-y-0.5 scale-110" 
                                    : "transform translate-y-0"
                                }
                            `}>
                                {/* Special handling for profile to show avatar */}
                                {item.href === "/profile" && user ? (
                                    <div className={`
                                        w-7 h-7 rounded-full border-2 transition-all duration-200
                                        flex items-center justify-center
                                        ${active 
                                            ? "border-black bg-gray-100" 
                                            : "border-gray-300 bg-gray-200"
                                        }
                                    `}>
                                        {user?.user_metadata?.avatar_url ? (
                                            <img 
                                                src={user.user_metadata.avatar_url} 
                                                alt="Profile"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-600">
                                                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Icon 
                                        className={`
                                            w-6 h-6 transition-all duration-200
                                            ${active 
                                                ? "fill-current stroke-2" 
                                                : "stroke-2"
                                            }
                                        `} 
                                    />
                                )}
                            </div>
                            
                            {/* Label */}
                            <span className={`
                                text-xs mt-1 font-medium transition-all duration-200
                                ${active 
                                    ? "text-black font-semibold" 
                                    : "text-gray-500"
                                }
                            `}>
                                {item.label}
                            </span>
                            
                            {/* Active indicator dot */}
                            {active && (
                                <div className="absolute top-1 w-1 h-1 bg-black rounded-full"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}