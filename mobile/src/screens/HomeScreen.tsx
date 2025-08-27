import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, StatusBar, Dimensions, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockIssues, Issue, getCategoryIcon, getPriorityColor, getStatusColor, formatTimeAgo, mockUserProfile } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Community stats
  const communityStats = {
    totalIssues: issues.length,
    resolvedThisWeek: issues.filter(i => i.status === 'resolved').length,
    activeReporters: 127,
    impactScore: 342
  };

  const trendingIssues = issues.slice(0, 3).sort((a, b) => b.upvotes - a.upvotes);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for trending badges
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setIssues([...mockIssues]);
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredIssues = selectedFilter === 'all' ? issues : issues.filter(issue => issue.status === selectedFilter);

  const renderFilterButton = (filter: typeof selectedFilter, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderIssue = ({ item }: { item: Issue }) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);
    const categoryIcon = getCategoryIcon(item.category);

    return (
      <Animated.View
        style={[
          styles.issueCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim,
            }],
          },
        ]}
      >
        <TouchableOpacity style={styles.cardContent} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryContainer}>
              <Ionicons name={categoryIcon as any} size={20} color="#000" />
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>

          <Text style={styles.issueTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.issueDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location.address}
              </Text>
            </View>
            
            <View style={styles.metaContainer}>
              <View style={styles.upvoteContainer}>
                <Ionicons name="chevron-up-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{item.upvotes}</Text>
              </View>
              <Text style={styles.timeText}>{formatTimeAgo(item.reportedAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.emptyIconContainer, { transform: [{ scale: headerScaleAnim }] }]}>
        <Ionicons name="document-text-outline" size={80} color="#ccc" />
      </Animated.View>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' ? 'No issues reported yet' : `No ${selectedFilter.replace('_', ' ')} issues`}
      </Text>
      <Text style={styles.emptySubtext}>
        {selectedFilter === 'all' 
          ? 'Be the first to report an issue in your community'
          : 'Try switching to another filter'
        }
      </Text>
    </Animated.View>
  );

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim, 
            transform: [
              { translateY: slideAnim },
              { scale: headerScaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.titleContainer}>
          <Ionicons name="home" size={32} color="#000" style={styles.titleIcon} />
          <Text style={styles.title}>Community Issues</Text>
        </View>
        <Text style={styles.subtitle}>Stay informed about your neighborhood</Text>
      </Animated.View>

      {/* Community Stats */}
      <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Animated.View style={[styles.statIconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="pulse-outline" size={24} color="#000" />
            </Animated.View>
            <Text style={styles.statNumber}>{communityStats.impactScore}</Text>
            <Text style={styles.statLabel}>Impact Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={24} color="#000" />
            </View>
            <Text style={styles.statNumber}>{communityStats.activeReporters}</Text>
            <Text style={styles.statLabel}>Active Members</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-done-outline" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statNumber}>{communityStats.resolvedThisWeek}</Text>
            <Text style={styles.statLabel}>Resolved This Week</Text>
          </View>
        </View>
      </Animated.View>

      {/* Trending Issues */}
      <Animated.View style={[styles.trendingSection, { opacity: fadeAnim }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={24} color="#000" />
          <Text style={styles.sectionTitle}>Trending Issues</Text>
          <Animated.View style={[styles.trendingBadge, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.trendingBadgeText}>HOT</Text>
          </Animated.View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
          {trendingIssues.map((issue) => (
            <TouchableOpacity key={issue.id} style={styles.trendingCard}>
              <View style={styles.trendingHeader}>
                <Ionicons name={getCategoryIcon(issue.category) as any} size={20} color="#000" />
                <View style={[styles.trendingPriority, { backgroundColor: getPriorityColor(issue.priority) }]} />
              </View>
              <Text style={styles.trendingTitle} numberOfLines={2}>
                {issue.title}
              </Text>
              <View style={styles.trendingMeta}>
                <Text style={styles.trendingUpvotes}>↑ {issue.upvotes}</Text>
                <Text style={styles.trendingTime}>{formatTimeAgo(issue.reportedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Community Issues</Text>
          <Text style={styles.filterSubtitle}>Filter by status</Text>
        </View>
        <View style={styles.filterButtons}>
          {renderFilterButton('all', 'All', issues.length)}
          {renderFilterButton('pending', 'Pending', pendingCount)}
          {renderFilterButton('in_progress', 'Active', inProgressCount)}
          {renderFilterButton('resolved', 'Resolved', resolvedCount)}
        </View>
      </Animated.View>

      {filteredIssues.length === 0 ? (
        renderEmptyState()
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={filteredIssues}
            renderItem={renderIssue}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
            }
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    paddingLeft: 44,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  trendingSection: {
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  trendingBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trendingList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 16,
  },
  trendingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingUpvotes: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  trendingTime: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  filterSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  issueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    color: '#000',
    lineHeight: 24,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginLeft: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
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