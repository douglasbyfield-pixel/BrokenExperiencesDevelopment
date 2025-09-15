import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';

interface ProfileScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, profile, signOut } = useAuth();
  const [userStats, setUserStats] = useState({
    issuesReported: 0,
    issuesResolved: 0,
    reputation: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      // Get user's reported issues
      const allIssues = await DataService.getIssues();
      const userIssues = allIssues.filter(issue => issue.reported_by === user?.id);
      const resolvedIssues = userIssues.filter(issue => issue.status === 'resolved');
      
      setUserStats({
        issuesReported: userIssues.length,
        issuesResolved: resolvedIssues.length,
        reputation: profile?.reputation || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
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

  const getBadges = () => {
    const badges = [];
    
    if (userStats.issuesReported >= 5) {
      badges.push({
        id: 'community_helper',
        name: 'Community Helper',
        description: 'Reported 5+ issues',
        icon: 'medal-outline'
      });
    }
    
    if (userStats.issuesResolved >= 3) {
      badges.push({
        id: 'problem_solver',
        name: 'Problem Solver',
        description: 'Had 3+ reports resolved',
        icon: 'checkmark-circle-outline'
      });
    }
    
    if (userStats.issuesReported >= 1) {
      badges.push({
        id: 'contributor',
        name: 'Contributor',
        description: 'Made your first report',
        icon: 'star-outline'
      });
    }
    
    return badges;
  };

  const renderBadge = (badge: { id: string; name: string; description: string; icon: string }) => {
    return (
      <View key={badge.id} style={styles.badge}>
        <Ionicons name={badge.icon as any} size={24} color="#000" />
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false}>
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
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }) : 'Recently'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color="#000" />
            <Text style={styles.statNumber}>{loading ? '...' : userStats.issuesReported}</Text>
            <Text style={styles.statLabel}>Issues Reported</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <Text style={styles.statNumber}>{loading ? '...' : userStats.issuesResolved}</Text>
            <Text style={styles.statLabel}>Issues Resolved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#ca8a04" />
            <Text style={styles.statNumber}>{loading ? '...' : userStats.reputation}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgesContainer}>
            {getBadges().map((badge) => renderBadge(badge))}
            {getBadges().length === 0 && (
              <Text style={styles.noBadges}>No badges earned yet. Start reporting issues to earn achievements!</Text>
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
});