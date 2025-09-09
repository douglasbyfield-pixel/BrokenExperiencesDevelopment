import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, RefreshControl, ScrollView, Dimensions, Image, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockIssues, Issue, getCategoryIcon, getPriorityColor, getStatusColor, formatTimeAgo, mockUserProfile } from '../data/mockData';
import IssueDetailScreen from './IssueDetailScreen';

interface HomeScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');


export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Jamaica stats
  const communityStats = {
    totalIssues: issues.length,
    resolvedThisWeek: issues.filter(i => i.status === 'resolved').length,
    activeReporters: 127,
    impactScore: 342
  };


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setIssues([...mockIssues]);
      setRefreshing(false);
    }, 1000);
  }, []);


  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const clearAllFilters = () => {
    setSelectedStatusFilter('all');
    setSelectedPriorityFilter('all');
  };

  const handleIssuePress = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedIssue(null);
  };

  const handleNavigateToIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
    }
  };


  const filteredIssues = issues.filter(issue => {
    const statusMatch = selectedStatusFilter === 'all' || issue.status === selectedStatusFilter;
    const priorityMatch = selectedPriorityFilter === 'all' || issue.priority === selectedPriorityFilter;
    return statusMatch && priorityMatch;
  });

  const handleSearchPress = () => {
    navigation.navigate('SearchResults', { searchQuery: '' });
  };

  const renderStatusFilterButton = (filter: typeof selectedStatusFilter, label: string, count: number) => {
    const isActive = selectedStatusFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterPanelButton, isActive && styles.filterPanelButtonActive]}
        onPress={() => setSelectedStatusFilter(filter)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterPanelButtonText, isActive && styles.filterPanelButtonTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPriorityFilterButton = (filter: typeof selectedPriorityFilter, label: string, count: number) => {
    const isActive = selectedPriorityFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterPanelButton, isActive && styles.filterPanelButtonActive]}
        onPress={() => setSelectedPriorityFilter(filter)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterPanelButtonText, isActive && styles.filterPanelButtonTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderIssue = (item: Issue) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);

    return (
      <View key={item.id} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarContainer}>
              {item.author.avatar ? (
                <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.defaultAvatarText}>
                    {item.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                {item.author.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
                )}
              </View>
              <Text style={styles.postTime}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => handleIssuePress(item)}
        >
          <Text style={styles.postText}>{item.postContent.postText}</Text>
          
          {/* Image */}
          {item.postContent.hasImage && item.postContent.imageUrl && (
            <Image 
              source={{ uri: item.postContent.imageUrl }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Hashtags */}
          <View style={styles.hashtagsContainer}>
            {item.postContent.hashtags.map((hashtag, index) => (
              <Text key={index} style={styles.hashtag}>
                {hashtag}
              </Text>
            ))}
          </View>
        </TouchableOpacity>

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <View style={styles.engagementRow}>
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{item.engagement.shares}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{item.status.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityBadgeText}>{item.priority}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const hasActiveFilters = selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all';
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
        </View>
        <Text style={styles.emptyText}>
          {hasActiveFilters ? 'No issues match your filters' : 'No issues reported yet'}
        </Text>
        <Text style={styles.emptySubtext}>
          {hasActiveFilters 
            ? 'Try adjusting your filter settings'
            : 'Be the first to report an issue in Jamaica'
          }
        </Text>
      </View>
    );
  };

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  
  const lowCount = issues.filter(i => i.priority === 'low').length;
  const mediumCount = issues.filter(i => i.priority === 'medium').length;
  const highCount = issues.filter(i => i.priority === 'high').length;
  const criticalCount = issues.filter(i => i.priority === 'critical').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="home" size={32} color="#000" style={styles.titleIcon} />
            <Text style={styles.title}>Jamaica Issues</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={handleSearchPress}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
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



        {/* Active Filters Summary */}
        {(selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all') && (
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              Showing {filteredIssues.length} of {issues.length} issues
            </Text>
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersLink}>
              <Text style={styles.clearFiltersLinkText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Issues Feed */}
        {filteredIssues.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.feedContainer}>
            {filteredIssues.map((issue) => renderIssue(issue))}
          </View>
        )}
      </ScrollView>

      {/* Issue Detail Modal */}
      <IssueDetailScreen
        issue={selectedIssue}
        visible={showDetailModal}
        onClose={handleCloseDetail}
        onNavigateToIssue={handleNavigateToIssue}
        allIssues={issues}
      />

      {/* Filter Panel Modal */}
      {showFilterPanel && (
        <View style={styles.filterPanelOverlay}>
          <View style={styles.filterPanel}>
            <View style={styles.filterPanelHeader}>
              <Text style={styles.filterPanelTitle}>Filter Issues</Text>
              <TouchableOpacity onPress={toggleFilterPanel} style={styles.filterPanelCloseButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterPanelContent} showsVerticalScrollIndicator={false}>
              {/* Status Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterButtonsGrid}>
                  {renderStatusFilterButton('all', 'All', issues.length)}
                  {renderStatusFilterButton('pending', 'Pending', pendingCount)}
                  {renderStatusFilterButton('in_progress', 'Active', inProgressCount)}
                  {renderStatusFilterButton('resolved', 'Resolved', resolvedCount)}
                </View>
              </View>

              {/* Priority Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Priority</Text>
                <View style={styles.filterButtonsGrid}>
                  {renderPriorityFilterButton('all', 'All', issues.length)}
                  {renderPriorityFilterButton('low', 'Low', lowCount)}
                  {renderPriorityFilterButton('medium', 'Medium', mediumCount)}
                  {renderPriorityFilterButton('high', 'High', highCount)}
                  {renderPriorityFilterButton('critical', 'Critical', criticalCount)}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterPanelFooter}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={toggleFilterPanel}>
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  emptyState: {
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
  // Filter Panel Styles
  filterPanelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  filterPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterPanelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  filterPanelCloseButton: {
    padding: 8,
  },
  filterPanelContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterPanelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  filterPanelButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterPanelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterPanelButtonTextActive: {
    color: '#fff',
  },
  filterPanelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    justifyContent: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  applyFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Filter Summary Styles
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearFiltersLink: {
    paddingVertical: 4,
  },
  clearFiltersLinkText: {
    fontSize: 14,
    color: '#1DA1F2',
    fontWeight: '600',
  },
  // Instagram Feed Styles
  feedContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: 16,
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
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  postText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    color: '#1DA1F2',
    marginRight: 8,
    marginBottom: 4,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  engagementText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
});