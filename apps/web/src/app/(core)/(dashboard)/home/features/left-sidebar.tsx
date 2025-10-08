"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { cn, getInitials } from "@web/lib/utils";
import { useAuth } from "@web/components/auth-provider";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
<<<<<<< HEAD
import { LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
=======
import { Home, MapPin, User as UserIcon, Trophy, Award, Settings, Search, LogOut } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSearch } from "@web/context/SearchContext";
import { Input } from "@web/components/ui/input";
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187

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
<<<<<<< HEAD
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
=======
    icon: <Home className="w-5 h-5" />,
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
  },
  {
    href: "/map",
    label: "Map",
<<<<<<< HEAD
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
=======
    icon: <MapPin className="w-5 h-5" />,
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
  },
  {
    href: "/profile",
    label: "Profile",
<<<<<<< HEAD
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
=======
    icon: <UserIcon className="w-5 h-5" />,
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
<<<<<<< HEAD
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
=======
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    href: "/achievements",
    label: "Achievements",
    icon: <Award className="w-5 h-5" />,
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
  },
  {
    href: "/settings",
    label: "Settings",
<<<<<<< HEAD
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
=======
    icon: <Settings className="w-5 h-5" />,
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
  },
];

export default function LeftSidebar({ className }: LeftSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
<<<<<<< HEAD
=======
  const { onSearchChange } = useSearch();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187

  return (
    <aside
      className={cn(
<<<<<<< HEAD
        "hidden w-60 lg:w-64 xl:w-72 flex-col bg-white lg:flex h-full overflow-y-auto",
=======
        "hidden w-60 lg:w-64 xl:w-72 flex-col bg-white/95 backdrop-blur-sm border-r border-gray-100 lg:flex h-screen overflow-y-auto sticky top-0",
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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

<<<<<<< HEAD
=======
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

>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
<<<<<<< HEAD
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors",
                    isActive 
                      ? "bg-gray-100 font-semibold" 
                      : "hover:bg-gray-100"
                  )}
                >
                  {item.icon}
=======
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
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile - moved to bottom */}
        {user && (
<<<<<<< HEAD
          <div className="mt-auto p-3 lg:p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100">
=======
          <div className="mt-auto p-3 lg:p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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
<<<<<<< HEAD
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
=======
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-md"
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
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
