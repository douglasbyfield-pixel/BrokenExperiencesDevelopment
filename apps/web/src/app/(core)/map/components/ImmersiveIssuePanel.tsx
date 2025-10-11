"use client";

import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { 
  X, 
  MapPin, 
  Navigation, 
  Share2, 
  Heart, 
  MessageCircle,
  Camera,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  Star,
  Route
} from "lucide-react";
import type { Experience } from "@web/types";
import { getCategoryStyling } from "@web/lib/category-config";

interface ImmersiveIssuePanelProps {
  experience: Experience | null;
  onClose: () => void;
  onNavigate?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
}

export const ImmersiveIssuePanel = ({
  experience,
  onClose,
  onNavigate,
  onShare,
  onLike,
  onComment,
  isLiked = false,
  likesCount = 0,
  commentsCount = 0
}: ImmersiveIssuePanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (experience) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [experience]);

  if (!experience) return null;

  const categoryName = experience.category?.name || "Other";
  const categoryStyling = getCategoryStyling(categoryName);
  const IconComponent = categoryStyling.icon;

  const statusConfig = {
    pending: { 
      icon: AlertTriangle, 
      color: "text-red-600", 
      bg: "bg-red-50", 
      label: "Reported" 
    },
    in_progress: { 
      icon: Clock, 
      color: "text-yellow-600", 
      bg: "bg-yellow-50", 
      label: "In Progress" 
    },
    resolved: { 
      icon: CheckCircle, 
      color: "text-green-600", 
      bg: "bg-green-50", 
      label: "Resolved" 
    }
  };

  const currentStatus = statusConfig[experience.status as keyof typeof statusConfig] || statusConfig.pending;

  // Mock data for demonstration
  const recentActivity = [
    { user: "Sarah M.", action: "reported this issue", time: "2 hours ago", avatar: "🙋‍♀️" },
    { user: "Mike J.", action: "confirmed the issue", time: "1 hour ago", avatar: "👨‍💼" },
    { user: "City Dept.", action: "marked as in progress", time: "30 min ago", avatar: "🏛️" }
  ];

  const similarIssues = [
    { title: "Broken streetlight nearby", distance: "50m", status: "pending" },
    { title: "Pothole on same street", distance: "120m", status: "resolved" }
  ];

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel Content */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
        {/* Header with drag indicator */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: categoryStyling.color }}
              >
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {experience.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    className={`${currentStatus.bg} ${currentStatus.color} border-0`}
                  >
                    <currentStatus.icon size={12} className="mr-1" />
                    {currentStatus.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {categoryName}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Image Gallery */}
          {experience.experienceImages && experience.experienceImages.length > 0 && (
            <div className="relative">
              <img 
                src={experience.experienceImages[currentImageIndex]?.imageUrl} 
                alt={experience.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Image indicators */}
              {experience.experienceImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {experience.experienceImages.map((_: any, index: number) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="p-4 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl">
              <MapPin size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Location</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {experience.address || "Location coordinates available"}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {experience.latitude}, {experience.longitude}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-2xl">
                <TrendingUp size={20} className="text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-blue-900">Impact</div>
                <div className="text-xs text-blue-700">High Priority</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-2xl">
                <Users size={20} className="text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-green-900">Community</div>
                <div className="text-xs text-green-700">8 people affected</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-2xl">
                <Zap size={20} className="text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-purple-900">Urgency</div>
                <div className="text-xs text-purple-700">Needs attention</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-2xl">{activity.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Issues */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Similar Issues Nearby</h3>
              <div className="space-y-2">
                {similarIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-600">{issue.distance} away</p>
                    </div>
                    <Badge 
                      variant={issue.status === 'resolved' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Social Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={`flex items-center space-x-1 ${
                  isLiked ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                <span className="text-sm">{likesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onComment}
                className="flex items-center space-x-1 text-gray-600"
              >
                <MessageCircle size={16} />
                <span className="text-sm">{commentsCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="flex items-center space-x-1 text-gray-600"
              >
                <Share2 size={16} />
                <span className="text-sm">Share</span>
              </Button>
            </div>

            {/* Reported time */}
            <div className="text-xs text-gray-500">
              Reported {new Date(experience.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onNavigate}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 flex items-center justify-center space-x-2"
            >
              <Navigation size={18} />
              <span>Navigate</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-300 rounded-2xl py-3 flex items-center justify-center space-x-2"
              onClick={() => {/* Handle help action */}}
            >
              <Star size={18} />
              <span>Help Fix</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};