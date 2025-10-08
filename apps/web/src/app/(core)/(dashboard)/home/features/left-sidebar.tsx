"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { cn, getInitials } from "@web/lib/utils";
import { useAuth } from "@web/components/auth-provider";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Home, MapPin, User as UserIcon, Trophy, Award, Settings, Search, LogOut } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSearch } from "@web/context/SearchContext";
import { Input } from "@web/components/ui/input";

interface LeftSidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: "/map",
    label: "Map",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <UserIcon className="w-5 h-5" />,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    href: "/achievements",
    label: "Achievements",
    icon: <Award className="w-5 h-5" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function LeftSidebar({ className }: LeftSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { onSearchChange } = useSearch();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <aside
      className={cn(
        "hidden w-60 lg:w-64 xl:w-72 flex-col bg-white/95 backdrop-blur-sm border-r border-gray-100 lg:flex h-screen overflow-y-auto sticky top-0",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="py-4 px-3 lg:px-4">
          {/* Logo */}
          <div className="mb-6 lg:mb-8 flex items-center space-x-3">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl border-2 border-black bg-white p-1.5">
              <img
                src="/images/logo.png"
                alt="Broken Experiences"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="font-bold text-lg lg:text-xl text-black">
              Broken
              <span className="block text-gray-600 text-sm lg:text-base">
                Experiences
              </span>
            </h1>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search experiences..."
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-md bg-gray-50/80 focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400/20 text-black placeholder:text-gray-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                   className={cn(
                     "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                     isActive 
                       ? "bg-gray-100 text-black shadow-sm" 
                       : "hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:translate-x-0.5"
                   )}
                >
                  <div className={cn(
                    "transition-colors",
                    isActive ? "text-black" : "text-gray-500"
                  )}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile - moved to bottom */}
        {user && (
          <div className="mt-auto p-3 lg:p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || undefined}
                />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(
                    user?.user_metadata?.name || user?.email || "User"
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-black">
                  {user?.user_metadata?.name || user?.email}
                </p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-md"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
