import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockIssues, Issue, getCategoryIcon, getPriorityColor, getStatusColor, formatTimeAgo } from '../data/mockData';
import { useBookmark } from '../context/BookmarkContext';
import IssueDetailScreen from './IssueDetailScreen';

interface BookmarksScreenProps {
  navigation: any;
}

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
  const { getBookmarkedIssues, isBookmarked, toggleBookmark } = useBookmark();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const bookmarkedIssues = getBookmarkedIssues(mockIssues);

  const handleIssuePress = (issue: Issue) => {
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

  const handleBookmarkPress = (issueId: string) => {
    toggleBookmark(issueId);
  };

  const renderIssue = (item: Issue) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);

    return (
      <View key={item.id} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarContainer}>
              {item.author.avatar ? (
                <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.defaultAvatarText}>
                    {item.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                {item.author.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
                )}
              </View>
              <Text style={styles.postTime}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => handleBookmarkPress(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked(item.id) ? "#FFD700" : "#000"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => handleIssuePress(item)}
        >
          <Text style={styles.postText}>{item.postContent.postText}</Text>
          
          {/* Image */}
          {item.postContent.hasImage && item.postContent.imageUrl && (
            <Image 
              source={{ uri: item.postContent.imageUrl }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Hashtags */}
          <View style={styles.hashtagsContainer}>
            {item.postContent.hashtags.map((hashtag, index) => (
              <Text key={index} style={styles.hashtag}>
                {hashtag}
              </Text>
            ))}
          </View>
        </TouchableOpacity>

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <View style={styles.engagementRow}>
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.shares}</Text>
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
            {item.location.address}
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
      <Text style={styles.emptyText}>No bookmarked issues</Text>
      <Text style={styles.emptySubtext}>
        Bookmark issues you want to save for later by tapping the bookmark icon
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bookmarkedIssues.length === 0 ? (
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
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  postText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    paddingBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  engagementText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
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
});

