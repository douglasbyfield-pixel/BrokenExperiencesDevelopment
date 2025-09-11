import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Issue, getCategoryIcon, getPriorityColor, formatTimeAgo } from '../data/mockData';

const { width, height } = Dimensions.get('window');

interface IssueDetailScreenProps {
  issue: Issue | null;
  visible: boolean;
  onClose: () => void;
  onNavigateToIssue: (issueId: string) => void;
  allIssues: Issue[];
}

export default function IssueDetailScreen({ issue, visible, onClose, onNavigateToIssue, allIssues }: IssueDetailScreenProps) {
  if (!issue) return null;

  const currentIndex = allIssues.findIndex(i => i.id === issue.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allIssues.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigateToIssue(allIssues[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigateToIssue(allIssues[currentIndex + 1].id);
    }
  };

  const priorityColor = getPriorityColor(issue.priority);
  const categoryIcon = getCategoryIcon(issue.category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Issue Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Issue Card */}
          <View style={styles.issueCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryContainer}>
                <Ionicons name={categoryIcon as any} size={24} color="#000" />
                <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {issue.priority.toUpperCase()}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: priorityColor }]} />
                <Text style={[styles.statusText, { color: priorityColor }]}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.issueTitle}>{issue.title}</Text>
            
            <Text style={styles.issueDescription}>{issue.description}</Text>

            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{issue.location.address}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.metaText}>Reported by {issue.reportedBy}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{formatTimeAgo(issue.reportedAt)}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{issue.upvotes} upvotes</Text>
              </View>
            </View>

            {/* Coordinates */}
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesLabel}>Coordinates:</Text>
              <Text style={styles.coordinatesText}>
                {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({issue.comments.length})</Text>
            
            {issue.comments.length === 0 ? (
              <View style={styles.noComments}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment on this issue</Text>
              </View>
            ) : (
              issue.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="thumbs-up-outline" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Upvote</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Comment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]} 
            onPress={handlePrevious}
            disabled={!hasPrevious}
          >
            <Ionicons name="chevron-back" size={24} color={hasPrevious ? "#000" : "#ccc"} />
            <Text style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.navigationInfo}>
            {currentIndex + 1} of {allIssues.length}
          </Text>
          
          <TouchableOpacity 
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]} 
            onPress={handleNext}
            disabled={!hasNext}
          >
            <Text style={[styles.navButtonText, !hasNext && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={24} color={hasNext ? "#000" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  issueCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  issueTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 30,
  },
  issueDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  metaInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  coordinatesContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  commentsSection: {
    margin: 20,
    marginTop: 0,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  commentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButtonDisabled: {
    backgroundColor: '#f8f9fa',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  navigationInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

