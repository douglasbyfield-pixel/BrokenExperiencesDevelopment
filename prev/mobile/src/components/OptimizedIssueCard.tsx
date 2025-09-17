import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedIssueCardProps {
  item: any;
  isUpvoted: boolean;
  isBookmarked: boolean;
  activeMenu: string | null;
  onUpvote: (id: string) => void;
  onBookmark: (id: string) => void;
  onMenuPress: (id: string) => void;
  onMenuAction: (action: string, item: any) => void;
  onIssuePress: (item: any) => void;
}

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    infrastructure: 'construct-outline',
    safety: 'shield-outline',
    environment: 'leaf-outline',
    maintenance: 'hammer-outline',
    accessibility: 'accessibility-outline',
    road_maintenance: 'car-outline',
  };
  return icons[category] || 'help-outline';
};

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#22c55e',
    closed: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

function OptimizedIssueCard({
  item,
  isUpvoted,
  isBookmarked,
  activeMenu,
  onUpvote,
  onBookmark,
  onMenuPress,
  onMenuAction,
  onIssuePress
}: OptimizedIssueCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const priorityColor = getPriorityColor(item.priority);
  const statusColor = getStatusColor(item.status);
  
  const upvoteCount = item.upvotes?.[0]?.count || 0;
  const commentCount = item.comments?.[0]?.count || 0;
  const authorName = item.profiles?.name || 'Unknown User';
  const authorAvatar = item.profiles?.avatar;

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarContainer}>
            {authorAvatar ? (
              <Image source={{ uri: authorAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.defaultAvatarText}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{authorName}</Text>
            </View>
            <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={() => onBookmark(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isBookmarked ? "#FFD700" : "#000"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => onMenuPress(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {activeMenu === item.id && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuAction('share', item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color="#374151" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuAction('edit', item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#374151" />
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuAction('delete', item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuAction('report', item)}
            activeOpacity={0.7}
          >
            <Ionicons name="flag-outline" size={18} color="#f59e0b" />
            <Text style={[styles.menuText, { color: '#f59e0b' }]}>Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status and Priority Badges */}
      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: priorityColor + '20' }]}>
          <Text style={[styles.badgeText, { color: priorityColor }]}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={14} color="#666" />
          <Text style={styles.categoryText}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <TouchableOpacity onPress={() => onIssuePress(item)} activeOpacity={0.95}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        {/* Issue Image */}
        {item.image_url && !imageError && (
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#666" />
              </View>
            )}
            <Image 
              source={{ uri: item.image_url, cache: 'force-cache' }}
              style={styles.issueImage}
              resizeMode="cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
                console.log('Failed to load image:', item.image_url);
              }}
              fadeDuration={200}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <View style={styles.engagementRow}>
          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => onUpvote(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isUpvoted ? "heart" : "heart-outline"} 
              size={24} 
              color={isUpvoted ? "#ef4444" : "#000"} 
            />
            <Text style={styles.engagementText}>{upvoteCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => onIssuePress(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
            <Text style={styles.engagementText}>{commentCount}</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedIssueCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isUpvoted === nextProps.isUpvoted &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.activeMenu === nextProps.activeMenu &&
    prevProps.item.upvotes === nextProps.item.upvotes &&
    prevProps.item.comments === nextProps.item.comments &&
    prevProps.item.image_url === nextProps.item.image_url
  );
});

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#000',
  },
  postTime: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
    marginLeft: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 24,
  },
  postDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    zIndex: 1,
  },
  issueImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    padding: 4,
  },
  engagementText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 55,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 1000,
    minWidth: 140,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});