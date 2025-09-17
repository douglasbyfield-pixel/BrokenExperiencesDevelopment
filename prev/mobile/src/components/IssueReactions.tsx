import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMOJI_REACTIONS, ReactionType } from '../types/comments';
import { useComment } from '../context/CommentContext';
import { AnimationUtils, GamificationAnimations } from '../utils/animations';

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

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const modalScaleValue = useRef(new Animated.Value(0)).current;
  const modalOpacityValue = useRef(new Animated.Value(0)).current;

  const userReaction = getUserIssueReaction(issueId);

  const handleReaction = async (reactionType: ReactionType) => {
    // Haptic feedback
    await AnimationUtils.mediumHaptic();
    
    // Celebration animation
    AnimationUtils.celebrationBurst(scaleValue).start();
    
    if (userReaction === reactionType) {
      removeIssueReaction(issueId, reactionType);
    } else {
      addIssueReaction(issueId, reactionType);
      // Success haptic for new reaction
      await AnimationUtils.successHaptic();
    }
    
    // Close modal with animation
    Animated.parallel([
      AnimationUtils.scaleRelease(modalScaleValue),
      AnimationUtils.fadeOut(modalOpacityValue)
    ]).start(() => {
      setShowReactions(false);
    });
  };

  const handleShowReactions = async () => {
    await AnimationUtils.lightHaptic();
    setShowReactions(true);
    
    // Modal entrance animation
    Animated.parallel([
      AnimationUtils.bounceIn(modalScaleValue, 1),
      AnimationUtils.fadeIn(modalOpacityValue)
    ]).start();
  };

  const renderReactions = () => {
    return EMOJI_REACTIONS.map(({ type, emoji, label }) => {
      const count = getIssueReactionCount(issueId, type);
      const isActive = userReaction === type;
      
      if (count === 0 && !isActive) return null;

      return (
        <Animated.View key={type} style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
            onPress={() => handleReaction(type)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {count > 0 && (
              <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
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
        onPress={handleShowReactions}
        activeOpacity={0.7}
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
        animationType="none"
        onRequestClose={() => setShowReactions(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: modalOpacityValue }
          ]}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              Animated.parallel([
                AnimationUtils.scaleRelease(modalScaleValue),
                AnimationUtils.fadeOut(modalOpacityValue)
              ]).start(() => {
                setShowReactions(false);
              });
            }}
          >
            <Animated.View 
              style={[
                styles.reactionsModal,
                { 
                  transform: [{ scale: modalScaleValue }],
                  opacity: modalOpacityValue
                }
              ]}
            >
              {EMOJI_REACTIONS.map(({ type, emoji, label }) => (
                <TouchableOpacity
                  key={type}
                  style={styles.reactionModalButton}
                  onPress={() => handleReaction(type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reactionModalEmoji}>{emoji}</Text>
                  <Text style={styles.reactionModalLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
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
