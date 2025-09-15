import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, RefreshControl, ScrollView, Dimensions, Image, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { useBookmark } from '../context/BookmarkContext';
import IssueDetailScreen from './IssueDetailScreen';
import type { Issue } from '../types/database';

interface HomeScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');


// Helper functions
const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    infrastructure: 'construct-outline',
    safety: 'shield-outline',
    environment: 'leaf-outline',
    maintenance: 'hammer-outline',
    accessibility: 'accessibility-outline',
    road_maintenance: 'car-outline',
  };
  return icons[category] || 'help-outline';
};

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#22c55e',
    closed: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, profile } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Load data functions
  const loadIssues = async () => {
    try {
      setLoading(true);
      const issuesData = await DataService.getIssues();
      console.log('HomeScreen: Loaded', issuesData.length, 'issues');
      
      // Log sample issue data structure
      if (issuesData.length > 0) {
        console.log('HomeScreen: Sample issue data:', JSON.stringify(issuesData[0], null, 2));
      }
      
      setIssues(issuesData);
      
      // Load user upvotes if user is logged in
      if (user) {
        const upvotes = await DataService.getUserUpvotes(user.id);
        console.log('HomeScreen: User upvotes:', upvotes);
        setUserUpvotes(upvotes);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
      Alert.alert('Error', 'Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to upvote issues.');
      return;
    }

    const wasUpvoted = userUpvotes.includes(issueId);
    
    // Optimistic update - update UI immediately
    if (wasUpvoted) {
      setUserUpvotes(prev => prev.filter(id => id !== issueId));
      // Optimistically decrease count
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === issueId 
            ? {
                ...issue, 
                upvotes: [{ count: Math.max(0, (issue.upvotes?.[0]?.count || 0) - 1) }]
              }
            : issue
        )
      );
    } else {
      setUserUpvotes(prev => [...prev, issueId]);
      // Optimistically increase count
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === issueId 
            ? {
                ...issue, 
                upvotes: [{ count: (issue.upvotes?.[0]?.count || 0) + 1 }]
              }
            : issue
        )
      );
    }

    try {
      console.log('HomeScreen: Toggling upvote for issue:', issueId, 'by user:', user.id);
      const isUpvoted = await DataService.toggleUpvote(issueId, user.id);
      console.log('HomeScreen: Upvote result:', isUpvoted);
      
      // Verify optimistic update was correct
      if (isUpvoted !== !wasUpvoted) {
        console.log('HomeScreen: Optimistic update was wrong, reverting');
        // Revert if our optimistic update was wrong
        if (wasUpvoted) {
          setUserUpvotes(prev => [...prev, issueId]);
        } else {
          setUserUpvotes(prev => prev.filter(id => id !== issueId));
        }
        // Refresh to get accurate data
        await loadIssues();
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      
      // Revert optimistic update on error
      if (wasUpvoted) {
        setUserUpvotes(prev => [...prev, issueId]);
      } else {
        setUserUpvotes(prev => prev.filter(id => id !== issueId));
      }
      // Refresh to get accurate data
      await loadIssues();
      
      Alert.alert('Error', 'Failed to update upvote. Please try again.');
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  // Jamaica stats
  const communityStats = {
    totalIssues: issues.length,
    resolvedThisWeek: issues.filter(i => i.status === 'resolved').length,
    activeReporters: 127,
    impactScore: 342
  };


  // Filter issues based on selected filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedStatusFilter !== 'all') {
        filters.status = selectedStatusFilter;
      }
      if (selectedPriorityFilter !== 'all') {
        filters.priority = selectedPriorityFilter;
      }
      
      const filteredData = await DataService.getFilteredIssues(filters);
      setIssues(filteredData);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all') {
      applyFilters();
    } else {
      loadIssues();
    }
  }, [selectedStatusFilter, selectedPriorityFilter]);


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
    // Refresh issues to get updated comment counts
    console.log('HomeScreen: Detail modal closed, refreshing issues');
    loadIssues();
  };

  const handleNavigateToIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
    }
  };


  // Issues are already filtered on the server side
  const filteredIssues = issues;

  const handleSearchPress = () => {
    navigation.navigate('SearchResults', { searchQuery: '' });
  };

  const handleBookmarkPress = (issueId: string) => {
    toggleBookmark(issueId);
  };

  const handleMenuPress = (issueId: string) => {
    setActiveMenu(activeMenu === issueId ? null : issueId);
  };

  const handleMenuAction = async (action: string, issue: any) => {
    setActiveMenu(null);
    
    switch (action) {
      case 'share':
        Alert.alert('Share Issue', `Share "${issue.title}" with others?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: () => console.log('Share functionality would go here') }
        ]);
        break;
        
      case 'report':
        Alert.alert('Report Issue', 'Report this issue as inappropriate?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', style: 'destructive', onPress: () => console.log('Report functionality would go here') }
        ]);
        break;
        
      case 'copy_link':
        Alert.alert('Link Copied', 'Issue link copied to clipboard');
        break;
        
      case 'view_location':
        navigation.navigate('Map');
        break;
        
      case 'edit':
        if (user?.id === issue.reported_by) {
          setEditingIssue(issue);
          setEditTitle(issue.title);
          setEditDescription(issue.description);
          setShowEditModal(true);
        }
        break;
        
      case 'delete':
        if (user?.id === issue.reported_by) {
          Alert.alert('Delete Issue', 'Are you sure you want to delete this issue? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteIssue(issue.id) }
          ]);
        }
        break;
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      console.log('Attempting to delete issue:', issueId);
      console.log('Current user:', user?.id);
      
      const result = await DataService.deleteIssue(issueId);
      console.log('Delete result:', result);
      
      // Remove from local state
      setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
      
      Alert.alert('Success', 'Issue deleted successfully');
    } catch (error) {
      console.error('Error deleting issue:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to delete issue: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditIssue = async () => {
    if (!editingIssue || !editTitle.trim() || !editDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const updates = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        updated_at: new Date().toISOString()
      };

      const updatedIssue = await DataService.updateIssue(editingIssue.id, updates);
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === editingIssue.id 
            ? { ...issue, ...updates }
            : issue
        )
      );
      
      // Close modal
      setShowEditModal(false);
      setEditingIssue(null);
      setEditTitle('');
      setEditDescription('');
      
      Alert.alert('Success', 'Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      Alert.alert('Error', 'Failed to update issue. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingIssue(null);
    setEditTitle('');
    setEditDescription('');
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

  const renderIssue = (item: any) => {
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);
    
    // Debug logging only for first render
    if (item.id === issues[0]?.id) {
      console.log('HomeScreen renderIssue: Sample upvotes:', item.upvotes, 'comments:', item.comments);
    }
    
    const upvoteCount = item.upvotes?.[0]?.count || 0;
    const commentCount = item.comments?.[0]?.count || 0;
    const isUpvoted = userUpvotes.includes(item.id);
    const authorName = item.profiles?.name || 'Unknown User';
    const authorAvatar = item.profiles?.avatar;

    return (
      <View key={item.id} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarContainer}>
              {authorAvatar ? (
                <Image source={{ uri: authorAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.defaultAvatarText}>
                    {authorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{authorName}</Text>
              </View>
              <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => handleBookmarkPress(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked(item.id) ? "#FFD700" : "#000"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menu */}
        {activeMenu === item.id && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('share', item)}
            >
              <Ionicons name="share-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Share Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('copy_link', item)}
            >
              <Ionicons name="link-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>Copy Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuAction('view_location', item)}
            >
              <Ionicons name="location-outline" size={20} color="#333" />
              <Text style={styles.menuItemText}>View on Map</Text>
            </TouchableOpacity>
            
            {user?.id === item.reported_by && (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuAction('edit', item)}
                >
                  <Ionicons name="create-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Edit Issue</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuAction('delete', item)}
                >
                  <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Delete Issue</Text>
                </TouchableOpacity>
              </>
            )}
            
            {user?.id !== item.reported_by && (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuAction('report', item)}
                >
                  <Ionicons name="flag-outline" size={20} color="#dc3545" />
                  <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Report Issue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Post Content */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => handleIssuePress(item)}
        >
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postText}>{item.description}</Text>
          
          {/* Image */}
          {item.image_url && (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Status and Priority */}
          <View style={styles.metaContainer}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <View style={styles.engagementRow}>
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => handleUpvote(item.id)}
            >
              <Ionicons 
                name={isUpvoted ? "heart" : "heart-outline"} 
                size={24} 
                color={isUpvoted ? "#ef4444" : "#000"} 
              />
              <Text style={styles.engagementText}>{upvoteCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => handleIssuePress(item)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
              <Text style={styles.engagementText}>{commentCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => handleBookmarkPress(item.id)}
            >
              <Ionicons 
                name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked(item.id) ? "#000" : "#666"} 
              />
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
            {item.address}
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
      
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1}
        onPress={() => setActiveMenu(null)}
      >
        <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#000" />
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

      {/* Edit Issue Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.editModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Issue</Text>
            <TouchableOpacity onPress={handleEditIssue}>
              <Text style={styles.editModalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editModalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editFormSection}>
              <Text style={styles.editFormLabel}>Title</Text>
              <TextInput
                style={styles.editFormInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Issue title"
                maxLength={100}
                multiline
              />
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editFormLabel}>Description</Text>
              <TextInput
                style={[styles.editFormInput, styles.editFormTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Describe the issue in detail"
                maxLength={500}
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.editFormInfo}>
              <Text style={styles.editFormInfoText}>
                Note: Location, category, and priority cannot be changed after posting.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      </TouchableOpacity>
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
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 8,
    marginRight: 8,
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
    locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
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
  // Dropdown Menu Styles
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  // Edit Modal Styles
  editModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  editModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  editModalSaveText: {
    fontSize: 16,
    color: '#1DA1F2',
    fontWeight: '600',
  },
  editModalContent: {
    flex: 1,
    padding: 20,
  },
  editFormSection: {
    marginBottom: 24,
  },
  editFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  editFormInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000',
  },
  editFormTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  editFormInfo: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1DA1F2',
  },
  editFormInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
