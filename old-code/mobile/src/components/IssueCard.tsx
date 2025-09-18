import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimeAgo } from '../data/mockData';
import { AnimationUtils } from '../utils/animations';
import OptimizedImage from './OptimizedImage';

interface IssueCardProps {
  issue: any;
  userUpvotes: string[];
  isBookmarked: boolean;
  onPress: (issue: any) => void;
  onUpvote: (issueId: string) => void;
  onBookmark: (issueId: string) => void;
  onShare: (issue: any) => void;
  onMenuPress: (issueId: string) => void;
  activeMenu: string | null;
  navigation: any;
}

const IssueCard = memo(({
  issue,
  userUpvotes,
  isBookmarked,
  onPress,
  onUpvote,
  onBookmark,
  onShare,
  onMenuPress,
  activeMenu,
  navigation
}: IssueCardProps) => {
  const hasUpvoted = userUpvotes.includes(issue.id);
  const bookmarked = isBookmarked(issue.id);
  
  const categoryIcon = useMemo(() => {
    const icons: { [key: string]: string } = {
      infrastructure: 'construct-outline',
      safety: 'shield-outline',
      environment: 'leaf-outline',
      maintenance: 'hammer-outline',
      accessibility: 'accessibility-outline',
      road_maintenance: 'car-outline',
    };
    return icons[issue.category] || 'help-outline';
  }, [issue.category]);

  const priorityColor = useMemo(() => {
    const colors: { [key: string]: string } = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };
    return colors[issue.priority] || '#6b7280';
  }, [issue.priority]);

  const statusColor = useMemo(() => {
    const colors: { [key: string]: string } = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      resolved: '#22c55e',
      closed: '#6b7280',
    };
    return colors[issue.status] || '#6b7280';
  }, [issue.status]);

  const handleUpvote = useCallback(async () => {
    await AnimationUtils.mediumHaptic();
    onUpvote(issue.id);
  }, [issue.id, onUpvote]);

  const handleBookmark = useCallback(async () => {
    await AnimationUtils.lightHaptic();
    onBookmark(issue.id);
  }, [issue.id, onBookmark]);

  const handleShare = useCallback(() => {
    onShare(issue);
  }, [issue, onShare]);

  const handleMenuPress = useCallback(() => {
    onMenuPress(issue.id);
  }, [issue.id, onMenuPress]);

  const authorName = issue.profiles?.name || 'Anonymous';
  const authorAvatar = issue.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=000&color=fff`;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(issue)}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.authorSection}>
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.timeText}>{formatTimeAgo(issue.created_at)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.badgesRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {issue.status.replace('_', ' ')}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {issue.priority}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryIcon as any} size={14} color="#6b7280" />
            <Text style={styles.categoryText}>
              {issue.category.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>
          {issue.description && (
            <Text style={styles.description} numberOfLines={3}>{issue.description}</Text>
          )}
        </View>

        {issue.image_url && (
          <OptimizedImage 
            source={{ uri: issue.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.location}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.locationText} numberOfLines={1}>{issue.address}</Text>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[styles.actionButton, hasUpvoted && styles.actionButtonActive]}
            onPress={handleUpvote}
          >
            <Ionicons 
              name={hasUpvoted ? "arrow-up" : "arrow-up-outline"} 
              size={20} 
              color={hasUpvoted ? "#000" : "#6b7280"} 
            />
            <Text style={[styles.actionText, hasUpvoted && styles.actionTextActive]}>
              {issue.upvotes?.[0]?.count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map', { 
              issueId: issue.id,
              latitude: issue.latitude,
              longitude: issue.longitude 
            })}
          >
            <Ionicons name="map-outline" size={20} color="#6b7280" />
            <Text style={styles.actionText}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, bookmarked && styles.actionButtonActive]}
            onPress={handleBookmark}
          >
            <Ionicons 
              name={bookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={bookmarked ? "#000" : "#6b7280"} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.issue.id === nextProps.issue.id &&
    prevProps.issue.upvotes?.[0]?.count === nextProps.issue.upvotes?.[0]?.count &&
    prevProps.userUpvotes.includes(prevProps.issue.id) === nextProps.userUpvotes.includes(nextProps.issue.id) &&
    prevProps.isBookmarked(prevProps.issue.id) === nextProps.isBookmarked(nextProps.issue.id) &&
    prevProps.activeMenu === nextProps.activeMenu
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default IssueCard;