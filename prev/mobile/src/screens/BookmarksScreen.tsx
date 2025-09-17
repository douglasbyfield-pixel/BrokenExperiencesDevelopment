import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image, RefreshControl, Alert, Share, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryIcon, getPriorityColor, getStatusColor, formatTimeAgo } from '../data/mockData';
import { useBookmark } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import type { Issue } from '../types/database';
import IssueDetailScreen from './IssueDetailScreen';
import { AnimationUtils, GamificationAnimations } from '../utils/animations';
import LoadingAnimation from '../components/LoadingAnimation';

interface BookmarksScreenProps {
  navigation: any;
}
// grngnhfhf

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
  const { getBookmarkedIssues, isBookmarked, toggleBookmark, loading, loadUserBookmarks } = useBookmark();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Animation values for interactions
  const animationRefs = useRef<{[key: string]: {
    bookmark: Animated.Value;
  }}>({}).current;

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) {
      setBookmarkedIssues([]);
      return;
    }
    try {
      const issues = await getBookmarkedIssues();
      setBookmarkedIssues(issues);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserBookmarks();
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleIssuePress = (issue: any) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedIssue(null);
  };

  const handleNavigateToIssue = (issueId: string) => {
    const issue = bookmarkedIssues.find(i => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
    }
  };

  const handleBookmarkPress = async (issueId: string) => {
    await AnimationUtils.lightHaptic();
    const wasBookmarked = isBookmarked(issueId);
    
    toggleBookmark(issueId);
    
    if (!wasBookmarked) {
      // Success haptic for new bookmark
      await AnimationUtils.successHaptic();
    }
  };

  const handleMenuPress = (issueId: string) => {
    setActiveMenu(activeMenu === issueId ? null : issueId);
  };

  const handleMenuAction = async (action: string, issue: any) => {
    setActiveMenu(null);
    
    switch (action) {
      case 'share':
        try {
          const shareContent = {
            title: 'Jamaica Issue Report',
            message: `Check out this issue in Jamaica: "${issue.title}"\n\n${issue.description}\n\nLocation: ${issue.address}`,
            url: `jamaicaissues://issue/${issue.id}`, // Deep link format
          };
          
          await Share.share(shareContent);
        } catch (error) {
          console.error('Error sharing issue:', error);
          Alert.alert('Error', 'Failed to share issue. Please try again.');
        }
        break;
        
      case 'copy_link':
        try {
          const issueLink = `jamaicaissues://issue/${issue.id}`;
          await Clipboard.setStringAsync(issueLink);
          Alert.alert('Link Copied', 'Issue link copied to clipboard');
        } catch (error) {
          console.error('Error copying link:', error);
          Alert.alert('Error', 'Failed to copy link. Please try again.');
        }
        break;
        
      case 'view_location':
        navigation.navigate('Map', {
          issueId: issue.id,
          latitude: issue.latitude,
          longitude: issue.longitude
        });
        break;
        
      case 'report':
        Alert.alert('Report Issue', 'Report this issue as inappropriate?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', style: 'destructive', onPress: () => console.log('Report functionality would go here') }
        ]);
        break;
    }
  };

  const getAnimationValues = (issueId: string) => {
    if (!animationRefs[issueId]) {
      animationRefs[issueId] = {
        bookmark: new Animated.Value(1)
      };
    }
    return animationRefs[issueId];
  };

  const renderIssue = (item: any) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);
    const upvoteCount = item.upvotes?.[0]?.count || 0;
    const commentCount = item.comments?.[0]?.count || 0;
    const authorName = item.profiles?.name || 'Unknown User';
    const authorAvatar = item.profiles?.avatar;
    
    // Get animation values for this specific issue
    const { bookmark: bookmarkScaleValue } = getAnimationValues(item.id);

    return (
      <View key={item.id} style={styles.postCard}>
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
            <Animated.View style={{ transform: [{ scale: bookmarkScaleValue }] }}>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={async () => {
                  AnimationUtils.celebrationBurst(bookmarkScaleValue).start();
                  await handleBookmarkPress(item.id);
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isBookmarked(item.id) ? "#FFD700" : "#000"} 
                />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => handleMenuPress(item.id)}
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
              onPress={() => handleMenuAction('share', item)}
            >
              <Ionicons name="share-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Share Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('copy_link', item)}
            >
              <Ionicons name="link-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Copy Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('view_location', item)}
            >
              <Ionicons name="location-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>View on Map</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('report', item)}
            >
              <Ionicons name="flag-outline" size={20} color="#dc3545" />
              <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Post Content */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => handleIssuePress(item)}
        >
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postText}>{item.description}</Text>
          
          {/* Image */}
          {item.image_url && (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <View style={styles.engagementRow}>
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{upvoteCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => handleIssuePress(item)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{commentCount}</Text>
            </TouchableOpacity>
            
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{item.status.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityBadgeText}>{item.priority}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyText}>
        {!user ? 'Sign in to view bookmarks' : 'No bookmarked issues'}
      </Text>
      <Text style={styles.emptySubtext}>
        {!user 
          ? 'Sign in to bookmark issues you want to save for later'
          : 'Bookmark issues you want to save for later by tapping the bookmark icon'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1}
        onPress={() => setActiveMenu(null)}
      >
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#000" />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingAnimation 
              visible={loading} 
              size="large" 
              useCustomLoader={true}
              animationType="pulse"
              color="#FFD700"
            />
            <Text style={styles.loadingText}>Loading bookmarks...</Text>
          </View>
        ) : bookmarkedIssues.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.feedContainer}>
            {bookmarkedIssues.map((issue) => renderIssue(issue))}
          </View>
        )}
      </ScrollView>

      {/* Issue Detail Modal */}
      <IssueDetailScreen
        issue={selectedIssue}
        visible={showDetailModal}
        onClose={handleCloseDetail}
        onNavigateToIssue={handleNavigateToIssue}
        allIssues={bookmarkedIssues}
      />

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  feedContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 8,
    marginRight: 8,
  },
  moreButton: {
    padding: 8,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  postText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontWeight: '400',
  },
  postImage: {
    width: '100%',
    height: 250,
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    color: '#1DA1F2',
    marginRight: 8,
    marginBottom: 4,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    minWidth: 50,
    justifyContent: 'center',
  },
  engagementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Dropdown Menu Styles
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
});

