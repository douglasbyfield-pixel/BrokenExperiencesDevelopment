import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMOJI_REACTIONS, ReactionType } from '../types/comments';
import { useComment } from '../context/CommentContext';

interface IssueReactionsProps {
  issueId: string;
}

export default function IssueReactions({ issueId }: IssueReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { 
    addIssueReaction, 
    removeIssueReaction, 
    getUserIssueReaction, 
    getIssueReactionCount 
  } = useComment();

  const userReaction = getUserIssueReaction(issueId);

  const handleReaction = (reactionType: ReactionType) => {
    if (userReaction === reactionType) {
      removeIssueReaction(issueId, reactionType);
    } else {
      addIssueReaction(issueId, reactionType);
    }
    setShowReactions(false);
  };

  const renderReactions = () => {
    return EMOJI_REACTIONS.map(({ type, emoji, label }) => {
      const count = getIssueReactionCount(issueId, type);
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

  const hasAnyReactions = EMOJI_REACTIONS.some(({ type }) => 
    getIssueReactionCount(issueId, type) > 0 || userReaction === type
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.reactButton}
        onPress={() => setShowReactions(true)}
      >
        <Ionicons name="happy-outline" size={20} color="#666" />
        <Text style={styles.reactButtonText}>React</Text>
      </TouchableOpacity>

      {hasAnyReactions && (
        <View style={styles.reactionsContainer}>
          {renderReactions()}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
