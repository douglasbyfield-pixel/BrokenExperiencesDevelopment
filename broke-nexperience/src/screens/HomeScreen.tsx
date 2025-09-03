import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockIssues, Issue, getCategoryIcon, getPriorityColor, getStatusColor, formatTimeAgo, mockUserProfile } from '../data/mockData';

const { width } = Dimensions.get('window');


export default function HomeScreen() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Jamaica stats
  const communityStats = {
    totalIssues: issues.length,
    resolvedThisWeek: issues.filter(i => i.status === 'resolved').length,
    activeReporters: 127,
    impactScore: 342
  };

  const trendingIssues = issues.slice(0, 3).sort((a, b) => b.upvotes - a.upvotes);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setIssues([...mockIssues]);
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredIssues = selectedFilter === 'all' ? issues : issues.filter(issue => issue.status === selectedFilter);

  const renderFilterButton = (filter: typeof selectedFilter, label: string, count: number) => {
    const isActive = selectedFilter === filter;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => {
          setSelectedFilter(filter);
          if (scrollViewRef.current && !isActive) {
            scrollViewRef.current.scrollTo({ x: 0, animated: true });
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderIssue = ({ item }: { item: Issue }) => {
    const priorityColor = getPriorityColor(item.priority);
    const categoryIcon = getCategoryIcon(item.category);

    return (
      <TouchableOpacity style={styles.issueCard} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <Ionicons name={categoryIcon as any} size={18} color="#000" />
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          </View>
          <Text style={[styles.statusText, { color: priorityColor }]}>
            {item.priority}
          </Text>
        </View>

        <Text style={styles.issueTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.issueDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.address}
            </Text>
          </View>
          <Text style={styles.upvotesText}>↑ {item.upvotes}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' ? 'No issues reported yet' : `No ${selectedFilter.replace('_', ' ')} issues`}
      </Text>
      <Text style={styles.emptySubtext}>
        {selectedFilter === 'all' 
          ? 'Be the first to report an issue in Jamaica'
          : 'Try switching to another filter'
        }
      </Text>
    </View>
  );

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="home" size={32} color="#000" style={styles.titleIcon} />
          <Text style={styles.title}>Jamaica Issues</Text>
        </View>
        <Text style={styles.subtitle}>Stay informed about Jamaica</Text>
      </View>

      {/* Jamaica Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="pulse-outline" size={24} color="#000" />
            </View>
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
          
          <View style={[styles.statCard, styles.resolvedStatCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-done-outline" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statNumber}>{communityStats.resolvedThisWeek}</Text>
            <Text style={styles.statLabel}>Resolved This Week</Text>
          </View>
        </View>
      </View>

      {/* Trending Issues */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={24} color="#000" />
          <Text style={styles.sectionTitle}>Trending Issues</Text>
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingBadgeText}>HOT</Text>
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.trendingList}
        >
          {trendingIssues.map((issue) => (
            <TouchableOpacity key={issue.id} style={styles.trendingCard} activeOpacity={0.7}>
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
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Jamaica Issues</Text>
          <Text style={styles.filterSubtitle}>Filter by status</Text>
        </View>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterButtons}
        >
          {renderFilterButton('all', 'All', issues.length)}
          {renderFilterButton('pending', 'Pending', pendingCount)}
          {renderFilterButton('in_progress', 'Active', inProgressCount)}
          {renderFilterButton('resolved', 'Resolved', resolvedCount)}
        </ScrollView>
      </View>

      {filteredIssues.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.listContainer}>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    paddingLeft: 44,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resolvedStatCard: {
    backgroundColor: '#f0fdf4',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  trendingSection: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  trendingBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
  },
  trendingList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    width: 160,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    backgroundColor: '#ffffff',
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  filterSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  filterButtons: {
    maxHeight: 50,
  },
  filterScrollContent: {
    paddingRight: 20,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#000',
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
    lineHeight: 20,
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
    flex: 1,
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
  upvotesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
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