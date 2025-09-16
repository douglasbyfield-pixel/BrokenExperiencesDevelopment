import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useComment } from '../context/CommentContext';
// Remove the import since we'll use the Comment type from context
import { formatTimeAgo } from '../data/mockData';

interface UserCommentsScreenProps {
  navigation: any;
}

export default function UserCommentsScreen({ navigation }: UserCommentsScreenProps) {
  const { getUserComments, loadUserComments, commentsLoading, deleteComment } = useComment();
  const userComments = getUserComments();

  useEffect(() => {
    loadUserComments();
  }, [loadUserComments]);

  const handleCommentPress = (comment: any) => {
    if (comment.issueId) {
      // Navigate directly to the issue detail screen
      navigation.navigate('IssueDetail', { issueId: comment.issueId });
    }
  };

  const handleCommentLongPress = (comment: any) => {
    Alert.alert(
      'Comment Options',
      'What would you like to do with this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Issue', onPress: () => handleCommentPress(comment) },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handleDeleteComment(comment)
        }
      ]
    );
  };

  const handleDeleteComment = (comment: any) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(comment.id);
              Alert.alert('Success', 'Comment deleted successfully');
            } catch (error) {
              console.error('Failed to delete comment:', error);
              Alert.alert(
                'Error', 
                error instanceof Error ? error.message : 'Failed to delete comment. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const renderComment = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.commentCard}
      onPress={() => handleCommentPress(item)}
      onLongPress={() => handleCommentLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.commentHeader}>
        <View style={styles.issueInfo}>
          <Text style={styles.issueTitle} numberOfLines={2}>
            {item.issueTitle || 'Unknown Issue'}
          </Text>
          <Text style={styles.commentTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.depthIndicator}>
            {item.depth === 0 ? 'Top-level' : `Reply (Level ${item.depth})`}
          </Text>
        </View>
      </View>

      <Text style={styles.commentText}>{item.text}</Text>

      {item.reactions && item.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {item.reactions.map((reaction: any, index: number) => (
            <View key={index} style={styles.reactionItem}>
              <Text style={styles.reactionEmoji}>
                {reaction.type === 'like' ? '👍' :
                 reaction.type === 'love' ? '❤️' :
                 reaction.type === 'laugh' ? '😂' :
                 reaction.type === 'angry' ? '😠' :
                 reaction.type === 'sad' ? '😢' :
                 reaction.type === 'wow' ? '😮' : '👍'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          <Text style={styles.repliesText}>
            {item.replies.length} repl{item.replies.length === 1 ? 'y' : 'ies'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyText}>No comments yet</Text>
      <Text style={styles.emptySubtext}>
        Start engaging with the community by commenting on issues
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
        <Text style={styles.headerTitle}>My Comments</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {commentsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your comments...</Text>
        </View>
      ) : userComments.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userComments.length}</Text>
              <Text style={styles.statLabel}>Total Comments</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userComments.filter(c => c.depth === 0).length}
              </Text>
              <Text style={styles.statLabel}>Top-level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userComments.filter(c => c.depth > 0).length}
              </Text>
              <Text style={styles.statLabel}>Replies</Text>
            </View>
          </View>

          <FlatList
            data={userComments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentsList}
          />
        </View>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  commentsList: {
    padding: 16,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentMeta: {
    alignItems: 'flex-end',
  },
  depthIndicator: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  reactionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  repliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repliesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
