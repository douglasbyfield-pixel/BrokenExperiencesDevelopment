import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationUtils, GamificationAnimations } from '../utils/animations';
import AchievementNotification from './AchievementNotification';
import ProgressBar from './ProgressBar';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'engagement' | 'community' | 'reporting' | 'milestone';
}

interface AchievementSystemProps {
  userStats: {
    upvotesGiven: number;
    issuesReported: number;
    commentsPosted: number;
    bookmarksCreated: number;
  };
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlocked'>[] = [
  {
    id: 'first_upvote',
    title: 'First Upvote',
    description: 'You gave your first upvote!',
    icon: 'heart',
    points: 10,
    maxProgress: 1,
    category: 'engagement'
  },
  {
    id: 'upvote_master',
    title: 'Upvote Master',
    description: 'You\'ve given 50 upvotes!',
    icon: 'heart',
    points: 50,
    maxProgress: 50,
    category: 'engagement'
  },
  {
    id: 'first_report',
    title: 'First Reporter',
    description: 'You reported your first issue!',
    icon: 'flag',
    points: 25,
    maxProgress: 1,
    category: 'reporting'
  },
  {
    id: 'community_contributor',
    title: 'Community Contributor',
    description: 'You\'ve reported 10 issues!',
    icon: 'flag',
    points: 100,
    maxProgress: 10,
    category: 'reporting'
  },
  {
    id: 'first_comment',
    title: 'First Comment',
    description: 'You posted your first comment!',
    icon: 'chatbubble',
    points: 15,
    maxProgress: 1,
    category: 'engagement'
  },
  {
    id: 'active_commenter',
    title: 'Active Commenter',
    description: 'You\'ve posted 25 comments!',
    icon: 'chatbubble',
    points: 75,
    maxProgress: 25,
    category: 'engagement'
  },
  {
    id: 'first_bookmark',
    title: 'First Bookmark',
    description: 'You bookmarked your first issue!',
    icon: 'bookmark',
    points: 10,
    maxProgress: 1,
    category: 'engagement'
  },
  {
    id: 'bookmark_collector',
    title: 'Bookmark Collector',
    description: 'You\'ve bookmarked 20 issues!',
    icon: 'bookmark',
    points: 60,
    maxProgress: 20,
    category: 'engagement'
  }
];

export default function AchievementSystem({ userStats, onAchievementUnlocked }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAchievements();
  }, [userStats]);

  const checkAchievements = () => {
    const updatedAchievements = ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      
      switch (achievement.id) {
        case 'first_upvote':
        case 'upvote_master':
          progress = userStats.upvotesGiven;
          break;
        case 'first_report':
        case 'community_contributor':
          progress = userStats.issuesReported;
          break;
        case 'first_comment':
        case 'active_commenter':
          progress = userStats.commentsPosted;
          break;
        case 'first_bookmark':
        case 'bookmark_collector':
          progress = userStats.bookmarksCreated;
          break;
      }

      const unlocked = progress >= achievement.maxProgress;
      
      return {
        ...achievement,
        progress: Math.min(progress, achievement.maxProgress),
        unlocked
      };
    });

    setAchievements(updatedAchievements);

    // Check for newly unlocked achievements
    updatedAchievements.forEach(achievement => {
      if (achievement.unlocked && achievement.progress === achievement.maxProgress) {
        const wasUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked;
        if (!wasUnlocked) {
          // New achievement unlocked!
          setCurrentAchievement(achievement);
          setShowAchievement(true);
          onAchievementUnlocked?.(achievement);
        }
      }
    });
  };

  const getTotalPoints = () => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, achievement) => total + achievement.points, 0);
  };

  const getUnlockedCount = () => {
    return achievements.filter(a => a.unlocked).length;
  };

  const renderAchievement = (achievement: Achievement) => {
    const progressPercentage = achievement.progress / achievement.maxProgress;
    
    return (
      <View key={achievement.id} style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: achievement.unlocked ? '#FFD700' : '#f0f0f0' }
          ]}>
            <Ionicons 
              name={achievement.icon as any} 
              size={24} 
              color={achievement.unlocked ? '#000' : '#666'} 
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              { color: achievement.unlocked ? '#000' : '#666' }
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>+{achievement.points}</Text>
          </View>
        </View>
        
        <ProgressBar
          progress={progressPercentage}
          height={4}
          backgroundColor="#f0f0f0"
          fillColor={achievement.unlocked ? '#4CAF50' : '#FFD700'}
          animated={true}
        />
        
        <Text style={styles.progressText}>
          {achievement.progress}/{achievement.maxProgress}
        </Text>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.achievementButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="trophy" size={24} color="#FFD700" />
        <View style={styles.achievementButtonText}>
          <Text style={styles.achievementButtonTitle}>Achievements</Text>
          <Text style={styles.achievementButtonSubtitle}>
            {getUnlockedCount()}/{achievements.length} • {getTotalPoints()} pts
          </Text>
        </View>
      </TouchableOpacity>

      {/* Achievement Notification */}
      <AchievementNotification
        visible={showAchievement}
        title={currentAchievement?.title || ''}
        description={currentAchievement?.description || ''}
        icon={currentAchievement?.icon}
        points={currentAchievement?.points}
        onHide={() => setShowAchievement(false)}
      />

      {/* Achievement Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Achievements</Text>
            <View style={styles.modalSpacer} />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getUnlockedCount()}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getTotalPoints()}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round((getUnlockedCount() / achievements.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>

          <View style={styles.achievementsList}>
            {achievements.map(renderAchievement)}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  achievementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  achievementButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  achievementButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  achievementButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#1DA1F2',
    fontWeight: '600',
  },
  modalSpacer: {
    width: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  pointsContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
});
