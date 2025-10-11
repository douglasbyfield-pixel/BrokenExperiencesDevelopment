"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Badge } from "@web/components/ui/badge";
import { 
  Search, 
  X, 
  Filter, 
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight
} from "lucide-react";
import type { Experience } from "@web/types";

interface EnhancedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredExperiences: Experience[];
  onExperienceSelect: (experience: Experience) => void;
  categories: Array<{ id: string; name: string }>;
  activeFilters: {
    status: string[];
    priority: string[];
    category: string[];
  };
  onFilterToggle: (type: "status" | "priority" | "category", value: string) => void;
}

export const EnhancedSearchPanel = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  filteredExperiences,
  onExperienceSelect,
  categories,
  activeFilters,
  onFilterToggle
}: EnhancedSearchPanelProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches] = useState(['Traffic lights', 'Pothole', 'Broken sidewalk']);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const quickSuggestions = [
    { icon: "🚦", text: "Traffic Issues", filter: "traffic" },
    { icon: "🚧", text: "Construction", filter: "infrastructure" },
    { icon: "💡", text: "Lighting", filter: "lighting" },
    { icon: "🌳", text: "Environment", filter: "environment" }
  ];

  const trendingIssues = [
    { title: "Broken Traffic Light", distance: "0.2km", priority: "high" },
    { title: "Pothole on Main St", distance: "0.5km", priority: "medium" },
    { title: "Street Light Out", distance: "0.8km", priority: "low" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Main Search Panel */}
      <div className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl 
        animate-in slide-in-from-top duration-300 ease-out">
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-500" />
              Discover Issues
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Enhanced Search Input */}
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <Input
              ref={inputRef}
              placeholder="What's happening around you?"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 h-14 rounded-2xl border-2 border-gray-100 
                focus:border-purple-500 text-lg bg-gray-50 focus:bg-white
                transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={() => onSearchChange('')}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-h-[70vh] overflow-y-auto">
          {!searchQuery ? (
            <>
              {/* Quick Suggestions */}
              <div className="px-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  Quick Search
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 rounded-2xl border-gray-200 hover:border-purple-300 
                        hover:bg-purple-50 transition-all duration-200 justify-start"
                      onClick={() => onFilterToggle('category', suggestion.filter)}
                    >
                      <span className="text-2xl mr-3">{suggestion.icon}</span>
                      <span className="text-sm font-medium">{suggestion.text}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trending Issues */}
              <div className="px-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  Trending Near You
                </h3>
                <div className="space-y-3">
                  {trendingIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-2xl 
                        bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{issue.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{issue.distance}</span>
                          <Badge 
                            variant={issue.priority === 'high' ? 'destructive' : 
                                   issue.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div className="px-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-200 hover:border-blue-300 
                        hover:bg-blue-50 transition-all duration-200"
                      onClick={() => onSearchChange(search)}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Search Results */
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {filteredExperiences.length} Results Found
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-full"
                >
                  <Filter size={14} className="mr-1" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">STATUS</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['pending', 'in_progress', 'resolved'].map((status) => (
                      <Button
                        key={status}
                        variant={activeFilters.status.includes(status) ? "default" : "outline"}
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => onFilterToggle('status', status)}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results List */}
              <div className="space-y-3">
                {filteredExperiences.slice(0, 8).map((experience) => (
                  <div
                    key={experience.id}
                    className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 
                      hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      onExperienceSelect(experience);
                      onClose();
                    }}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {experience.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {experience.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {experience.address || 'Location available'}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-purple-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};