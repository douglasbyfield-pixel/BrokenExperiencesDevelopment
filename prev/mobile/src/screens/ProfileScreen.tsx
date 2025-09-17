import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { useGamification } from '../hooks/useGamification';

interface ProfileScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { userStats, loading, calculateLevel, getNextLevel, getProgressToNextLevel } = useGamification();
  const [basicStats, setBasicStats] = useState({
    issuesReported: 0,
    issuesResolved: 0,
    reputation: 0
  });

  useEffect(() => {
    if (user) {
      fetchBasicStats();
    }
  }, [user]);

  const fetchBasicStats = async () => {
    try {
      // Get user's reported issues
      const allIssues = await DataService.getIssues();
      const userIssues = allIssues.filter(issue => issue.reported_by === user?.id);
      const resolvedIssues = userIssues.filter(issue => issue.status === 'resolved');
      
      setBasicStats({
        issuesReported: userIssues.length,
        issuesResolved: resolvedIssues.length,
        reputation: profile?.reputation || 0
      });
    } catch (error) {
      console.error('Error fetching basic user stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings page coming soon!');
  };

  const handleBookmarks = () => {
    navigation.navigate('Bookmarks');
  };

  const handleComments = () => {
    navigation.navigate('UserComments');
  };

  // Helper functions for gamification
  const getCurrentLevel = () => {
    if (!userStats) return { level: 1, title: "New Citizen", badge: "🆕" };
    return calculateLevel(userStats.experience);
  };

  const getNextLevelInfo = () => {
    if (!userStats) return null;
    const currentLevel = getCurrentLevel();
    return getNextLevel(currentLevel.level);
  };

  const getProgressPercentage = () => {
    if (!userStats) return 0;
    const currentLevel = getCurrentLevel();
    return getProgressToNextLevel(userStats.experience, currentLevel.level) * 100;
  };

  const getUserRank = () => {
    // Calculate rank based on total points compared to other users
    // For now, return a mock rank based on points
    if (!userStats) return 999;
    const pointRanks = [0, 100, 500, 1000, 2500, 5000, 10000];
    for (let i = pointRanks.length - 1; i >= 0; i--) {
      if (userStats.totalPoints >= pointRanks[i]) {
        return i + 1;
      }
    }
    return pointRanks.length;
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 65 + Math.max(insets.bottom, 0) + 25 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="person" size={24} color="#000" style={styles.titleIcon} />
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={handleBookmarks}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Manage your account and track your impact</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#000" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || user?.email || ''}</Text>
          <Text style={styles.joinDate}>
            Member since {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }) : 'Recently'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color="#000" />
            <Text style={styles.statNumber}>{loading ? '...' : userStats?.issuesReported || basicStats.issuesReported}</Text>
            <Text style={styles.statLabel}>Issues Reported</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <Text style={styles.statNumber}>{loading ? '...' : basicStats.issuesResolved}</Text>
            <Text style={styles.statLabel}>Issues Resolved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#ca8a04" />
            <Text style={styles.statNumber}>{loading ? '...' : userStats?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
        </View>

        {/* Gaming Stats Section */}
        <View style={styles.gamingSection}>
          <Text style={styles.sectionTitle}>Community Level</Text>
          <View style={styles.levelCard}>
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeEmoji}>{getCurrentLevel().badge}</Text>
                <Text style={styles.levelNumber}>{getCurrentLevel().level}</Text>
              </View>
              <View style={styles.levelDetails}>
                <Text style={styles.levelTitle}>{getCurrentLevel().title}</Text>
                <Text style={styles.levelPoints}>{userStats?.experience || 0} XP</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: '#4f46e5'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {getNextLevelInfo() ? 
                  `${(getNextLevelInfo()?.requiredXP || 0) - (userStats?.experience || 0)} XP to ${getNextLevelInfo()?.title}` : 
                  'Max level reached!'}
              </Text>
            </View>
          </View>

          <View style={styles.gamingStatsGrid}>
            <View style={styles.gameStatCard}>
              <Ionicons name="ribbon" size={20} color="#000" />
              <Text style={styles.gameStatNumber}>#{getUserRank()}</Text>
              <Text style={styles.gameStatLabel}>Community Rank</Text>
            </View>
            
            <View style={styles.gameStatCard}>
              <Ionicons name="flame" size={20} color="#ff6b35" />
              <Text style={styles.gameStatNumber}>{userStats?.streak || 0}</Text>
              <Text style={styles.gameStatLabel}>Activity Streak</Text>
            </View>
            
            <View style={styles.gameStatCard}>
              <Ionicons name="medal" size={20} color="#ffd700" />
              <Text style={styles.gameStatNumber}>{userStats?.achievements?.length || 0}</Text>
              <Text style={styles.gameStatLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgesContainer}>
            {userStats?.achievements && userStats.achievements.length > 0 ? (
              userStats.achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    <Text style={styles.achievementPoints}>+{achievement.points} XP</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noAchievements}>
                <Ionicons name="trophy-outline" size={48} color="#ccc" />
                <Text style={styles.noAchievementsText}>No achievements yet</Text>
                <Text style={styles.noAchievementsSubtext}>
                  Start reporting issues and engaging with the community to unlock achievements!
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleComments}>
            <Ionicons name="chatbubbles-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Comments</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.signOutContainer}>
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    paddingLeft: 36,
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    marginTop: 20,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  badgesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: (width - 64) / 2,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  noBadges: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    marginLeft: 12,
  },
  signOutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Gaming section styles
  gamingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  levelCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  levelDetails: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  levelPoints: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  gamingStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameStatNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 6,
    marginBottom: 2,
  },
  gameStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  levelBadgeEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  noAchievements: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAchievementsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  noAchievementsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});