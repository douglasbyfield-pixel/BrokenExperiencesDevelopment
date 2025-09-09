import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment, EMOJI_REACTIONS, ReactionType } from '../types/comments';
import { useComment } from '../context/CommentContext';
import CommentInput from './CommentInput';
import { formatTimeAgo } from '../data/mockData';

interface CommentItemProps {
  comment: Comment;
  issueId: string;
  onReply?: () => void;
}

export default function CommentItem({ comment, issueId, onReply }: CommentItemProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { 
    addReaction, 
    removeReaction, 
    getUserReaction, 
    getReactionCount,
    deleteComment 
  } = useComment();

  const userReaction = getUserReaction(comment.id);
  const canReply = comment.depth < 5;

  const handleReaction = (reactionType: ReactionType) => {
    if (userReaction === reactionType) {
      removeReaction(comment.id, reactionType);
    } else {
      addReaction(comment.id, reactionType);
    }
    setShowReactions(false);
  };

  const handleReply = () => {
    if (canReply) {
      setShowReplyInput(true);
      onReply?.();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteComment(comment.id)
        }
      ]
    );
  };

  const renderReactions = () => {
    return EMOJI_REACTIONS.map(({ type, emoji, label }) => {
      const count = getReactionCount(comment.id, type);
      const isActive = userReaction === type;
      
      if (count === 0 && !isActive) return null;

      return (
        <TouchableOpacity
          key={type}
          style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
          onPress={() => handleReaction(type)}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          {count > 0 && (
            <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
              {count}
            </Text>
          )}
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={[styles.container, { marginLeft: comment.depth * 16 }]}>
      <View style={styles.commentHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {comment.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{comment.author.name}</Text>
              {comment.author.verified && (
                <Ionicons name="checkmark-circle" size={14} color="#1DA1F2" />
              )}
              {comment.isEdited && (
                <Text style={styles.editedLabel}>(edited)</Text>
              )}
            </View>
            <Text style={styles.commentTime}>
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.commentText}>{comment.text}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowReactions(true)}
        >
          <Ionicons name="happy-outline" size={16} color="#666" />
          <Text style={styles.actionButtonText}>React</Text>
        </TouchableOpacity>

        {canReply && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReply}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.actionButtonText}>Reply</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={16} color="#666" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {comment.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {renderReactions()}
        </View>
      )}

      {showReplyInput && (
        <View style={styles.replyInputContainer}>
          <CommentInput
            issueId={issueId}
            parentId={comment.id}
            placeholder={`Reply to ${comment.author.name}...`}
            onCommentAdded={() => setShowReplyInput(false)}
          />
        </View>
      )}

      {/* Reactions Modal */}
      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactions(false)}
        >
          <View style={styles.reactionsModal}>
            {EMOJI_REACTIONS.map(({ type, emoji, label }) => (
              <TouchableOpacity
                key={type}
                style={styles.reactionModalButton}
                onPress={() => handleReaction(type)}
              >
                <Text style={styles.reactionModalEmoji}>{emoji}</Text>
                <Text style={styles.reactionModalLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
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
  editedLabel: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionButtonActive: {
    backgroundColor: '#ffe3e3',
    borderColor: '#ff6b6b',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reactionCountActive: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  replyInputContainer: {
    marginTop: 12,
    marginLeft: -16,
    marginRight: -16,
    marginBottom: -16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionModalButton: {
    alignItems: 'center',
    padding: 8,
  },
  reactionModalEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  reactionModalLabel: {
    fontSize: 10,
    color: '#666',
  },
});
