"use client";

import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { cn } from "@web/lib/utils";
import type { Stats, UserStats, TrendingCategory, Experience } from "@web/types";
import { 
  TrendingUp, 
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@web/context/SearchContext";
import { useExperiencesContext } from "@web/context/ExperiencesContext";

interface RightSidebarProps {
  className?: string;
  stats?: Stats | null;
  userStats?: UserStats | null;
  trendingCategories?: TrendingCategory[] | null;
  recentExperiences?: Experience[] | null;
}

export default function RightSidebar({
  className,
  stats,
  userStats,
  trendingCategories,
  recentExperiences,
}: RightSidebarProps) {
  const { onCategoryFilter } = useSearch();
  
  // Get experiences from context if available, otherwise use prop
  let contextExperiences: Experience[] = [];
  try {
    const context = useExperiencesContext();
    contextExperiences = context.experiences;
  } catch {
    // Context not available, use prop
  }
  const experiencesToUse = contextExperiences.length > 0 ? contextExperiences : (recentExperiences || []);
  
  const [currentPage, setCurrentPage] = useState(0);
  const categoriesPerPage = 5;
  const sidebarRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<"relative" | "sticky">("relative");
  const [top, setTop] = useState<number>(0);
  const [prevScrollTop, setPrevScrollTop] = useState(0);
  const [initialOffset, setInitialOffset] = useState(0);

  // Calculate visible categories
  const visibleCategories = trendingCategories
    ? trendingCategories.slice(
        currentPage * categoriesPerPage,
        (currentPage + 1) * categoriesPerPage
      )
    : [];

  const totalPages = trendingCategories
    ? Math.ceil(trendingCategories.length / categoriesPerPage)
    : 0;

  // Auto-cycle through categories every 5 seconds
  useEffect(() => {
    if (!trendingCategories || trendingCategories.length <= categoriesPerPage) {
      return; // Don't cycle if we have 5 or fewer categories
    }

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(interval);
  }, [trendingCategories, totalPages, categoriesPerPage]);

  // Initialize sidebar offset
  useEffect(() => {
    if (sidebarRef.current) {
      setInitialOffset(sidebarRef.current.offsetTop);
    }
  }, []);

  // Twitter-like sticky sidebar implementation
  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      const scrollYOffset = window.scrollY;
      const isScrollingUp = scrollYOffset < prevScrollTop;
      const isScrollingDown = scrollYOffset > prevScrollTop;

      const element = sidebarRef.current;
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const isTopEndBetweenViewport =
        elementRect.top >= 0 && elementRect.top <= viewportHeight;
      const isBottomEndBetweenViewport =
        elementRect.bottom >= 0 && elementRect.bottom <= viewportHeight;
      const isTopEndBelowViewport = elementRect.top > viewportHeight;
      const isBottomEndAboveViewport = elementRect.bottom < 0;
      const areBothTopAndBottomEndsOnOppositeEndsOfViewport =
        elementRect.top < 0 && elementRect.bottom > viewportHeight;
      const areBothTopAndBottomEndsBetweenViewport =
        isTopEndBetweenViewport && isBottomEndBetweenViewport;

      // Early exit conditions
      if (isTopEndBelowViewport || isBottomEndAboveViewport) {
        setPosition("relative");
        setTop(scrollYOffset);
        setPrevScrollTop(scrollYOffset);
        return;
      }

      if (areBothTopAndBottomEndsOnOppositeEndsOfViewport) {
        setPosition("relative");
        setTop(element.offsetTop - initialOffset);
        setPrevScrollTop(scrollYOffset);
        return;
      }

      if (areBothTopAndBottomEndsBetweenViewport) {
        setPosition("sticky");
        setTop(0);
        setPrevScrollTop(scrollYOffset);
        return;
      }

      // Direction-based logic
      if (isScrollingUp) {
        if (isTopEndBetweenViewport) {
          setPosition("sticky");
          setTop(0);
        } else if (isBottomEndBetweenViewport) {
          setPosition("relative");
          setTop(element.offsetTop - initialOffset);
        }
      } else if (isScrollingDown) {
        if (isTopEndBetweenViewport) {
          setPosition("relative");
          setTop(element.offsetTop - initialOffset);
        } else if (isBottomEndBetweenViewport) {
          setPosition("sticky");
          setTop(elementRect.top);
        }
      }

      setPrevScrollTop(scrollYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollTop, initialOffset]);

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "hidden w-72 lg:w-80 flex-col bg-white lg:flex",
        className
      )}
      style={{
        position,
        top: `${top}px`,
        height: "fit-content",
      }}
    >
      <div className="px-3 lg:px-4 py-4">
        <div className="space-y-6">

          {/* User Statistics */}
          {userStats && (
            <Card className="border-gray-200 bg-gray-50 p-6">
              <h3 className="font-bold text-lg text-black mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">
                    {userStats.impactScore}
                  </div>
                  <p className="text-sm text-gray-600">Impact Score</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-semibold text-black">
                      {userStats.totalReports}
                    </div>
                    <p className="text-xs text-gray-600">Reports</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-green-600">
                      {userStats.resolvedReports}
                    </div>
                    <p className="text-xs text-gray-600">Resolved</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-orange-600">
                      {userStats.inProgressReports}
                    </div>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">
                    Contribution Level
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{
                          width: `${Math.min((userStats.impactScore / 500) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {userStats.impactScore < 100
                        ? "Newcomer"
                        : userStats.impactScore < 250
                          ? "Contributor"
                          : userStats.impactScore < 500
                            ? "Advocate"
                            : "Champion"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}


          {/* Live Activity */}
          {!userStats && (
            <Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
              <h3 className="font-bold text-lg text-black mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                Live Activity
              </h3>
              <div className="space-y-3">
                {experiencesToUse && experiencesToUse.length > 0 ? (
                  experiencesToUse.slice(0, 3).map((experience, index) => {
                    const timeAgo = new Date().getTime() - new Date(experience.createdAt).getTime();
                    const minutesAgo = Math.floor(timeAgo / (1000 * 60));
                    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                    const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
                    
                    let timeText = "Just now";
                    if (minutesAgo > 0 && minutesAgo < 60) {
                      timeText = `${minutesAgo}m ago`;
                    } else if (hoursAgo > 0 && hoursAgo < 24) {
                      timeText = `${hoursAgo}h ago`;
                    } else if (daysAgo > 0) {
                      timeText = `${daysAgo}d ago`;
                    }
                    
                    const statusColor = experience.status === 'resolved' ? 'bg-gray-400' : 
                                       experience.status === 'in_progress' ? 'bg-gray-500' : 
                                       'bg-gray-400';
                    const actionText = experience.status === 'resolved' ? 'resolved' : 'reported';
                    
                    return (
                      <div key={experience.id} className="flex items-center gap-3 p-2 rounded bg-white/50">
                        <div className={`w-2 h-2 ${statusColor} rounded-full ${index === 0 ? 'animate-pulse' : ''}`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Issue {actionText} {experience.address ? `at ${experience.address.split(',')[0]}` : 'in your area'}
                          </p>
                          <p className="text-xs text-gray-500">{timeText}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-3 p-2 rounded bg-white/50">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">No recent activity</p>
                      <p className="text-xs text-gray-500">Check back later</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Trending Categories */}
          {trendingCategories &&
            Array.isArray(trendingCategories) &&
            trendingCategories.length > 0 && (
              <Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-black flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-600" />
                    Top Issues
                  </h3>
                  {totalPages > 1 && (
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === currentPage
                              ? "w-6 bg-gray-600"
                              : "w-1.5 bg-gray-300 hover:bg-gray-400"
                          }`}
                          aria-label={`View page ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {visibleCategories.map((category) => {
                    return (
                      <button
                        key={category.id}
                        className="w-full text-left p-2 rounded-lg hover:bg-white transition-colors border border-gray-200"
                        onClick={() => onCategoryFilter(category.name)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-black text-sm">
                            #{category.name}
                          </p>
                          <span className="text-xs text-white bg-gray-600 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Click to filter by this category
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

          {/* Weekly Summary */}
          <Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
            <h3 className="font-bold text-lg text-black mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Reports</span>
                <span className="font-semibold text-black">{stats?.totalExperiences ? Math.floor(stats.totalExperiences * 0.1) : 12}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="font-semibold text-gray-700">{stats?.resolvedExperiences ? Math.floor(stats.resolvedExperiences * 0.15) : 8}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold text-gray-700">{stats?.totalExperiences ? Math.floor(stats.totalExperiences * 0.05) : 4}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-black ml-auto">{stats?.activeUsers || 24}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="pt-4 text-xs text-gray-500 space-y-2">
            <div className="flex flex-wrap gap-2">
              <a href="#" className="hover:underline">
                Terms
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Cookie Policy
              </a>
            </div>
            <p>© 2025 Broken Experiences</p>
          </div>
        </div>
      </div>
    </aside>
  );
}