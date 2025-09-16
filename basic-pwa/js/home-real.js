// Real Supabase Home page functionality for BrokenExp PWA
import { DataService } from './dataService.js';
import { authService } from './authService.js';
import { getCurrentUser } from './supabase.js';

class HomeManager {
    constructor() {
        // Check authentication first
        this.checkAuthentication();
        
        this.issues = [];
        this.filters = {
            status: 'all',
            priority: 'all'
        };
        this.currentMenuIssue = null;
        this.bookmarks = [];
        this.userUpvotes = [];
        this.user = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
    }

    async checkAuthentication() {
        try {
            const user = await getCurrentUser();
            if (!user) {
                console.log('No user found, redirecting to login');
                window.location.replace('index.html'); // Use replace to prevent back button loops
                return;
            }
            this.user = user;
            console.log('User authenticated:', user.email);
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.replace('index.html'); // Use replace to prevent back button loops
        }
    }

    initializeElements() {
        // Header elements
        this.searchButton = document.getElementById('searchButton');
        this.profileButton = document.getElementById('profileButton');
        
        // Stats elements
        this.impactScore = document.getElementById('impactScore');
        this.activeMembers = document.getElementById('activeMembers');
        this.resolvedThisWeek = document.getElementById('resolvedThisWeek');
        
        // Filter elements
        this.filterButton = document.getElementById('filterButton');
        this.filterSummary = document.getElementById('filterSummary');
        this.filterSummaryText = document.getElementById('filterSummaryText');
        this.clearFiltersButton = document.getElementById('clearFiltersButton');
        
        // Content elements
        this.issuesContainer = document.getElementById('issuesContainer');
        this.loadingContainer = document.getElementById('loadingContainer');
        this.emptyState = document.getElementById('emptyState');
        
        // FAB
        this.reportButton = document.getElementById('reportButton');
        
        // Modal elements
        this.filterModal = document.getElementById('filterModal');
        this.closeFilterModal = document.getElementById('closeFilterModal');
        this.clearAllFilters = document.getElementById('clearAllFilters');
        this.applyFilters = document.getElementById('applyFilters');
        
        // Context menu
        this.contextMenu = document.getElementById('contextMenu');
        
        // Debug: Log missing elements
        const requiredElements = [
            'searchButton', 'profileButton', 'impactScore', 'activeMembers', 
            'resolvedThisWeek', 'filterButton', 'issuesContainer', 'loadingContainer'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.warn('Missing DOM elements:', missingElements);
        }
    }

    attachEventListeners() {
        // Header actions
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => this.handleSearch());
        }
        if (this.profileButton) {
            this.profileButton.addEventListener('click', () => this.handleProfile());
        }
        
        // Filter actions
        if (this.filterButton) {
            this.filterButton.addEventListener('click', () => this.showFilterModal());
        }
        if (this.clearFiltersButton) {
            this.clearFiltersButton.addEventListener('click', () => this.clearAllFiltersAction());
        }
        
        // Modal actions
        if (this.closeFilterModal) {
            this.closeFilterModal.addEventListener('click', () => this.hideFilterModal());
        }
        if (this.clearAllFilters) {
            this.clearAllFilters.addEventListener('click', () => this.clearAllFiltersAction());
        }
        if (this.applyFilters) {
            this.applyFilters.addEventListener('click', () => this.applyFiltersAction());
        }
        
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                this.handleFilterButtonClick(e.target);
            }
        });
        
        // FAB
        if (this.reportButton) {
            this.reportButton.addEventListener('click', () => this.handleReport());
        }
        
        // Context menu
        document.addEventListener('click', (e) => {
            if (e.target.matches('.menu-item')) {
                this.handleMenuAction(e.target.dataset.action);
            }
        });
        
        // Close modals and menus on outside click
        document.addEventListener('click', (e) => {
            if (this.filterModal && e.target === this.filterModal) {
                this.hideFilterModal();
            }
            
            if (this.contextMenu && !this.contextMenu.contains(e.target) && !e.target.closest('.action-btn[data-action="menu"]')) {
                this.hideContextMenu();
            }
        });
        
        // Issue card interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                this.handleIssueAction(e.target.closest('.action-btn'));
            }
            
            if (e.target.closest('.issue-card') && !e.target.closest('.action-btn')) {
                this.handleIssueClick(e.target.closest('.issue-card'));
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideFilterModal();
                this.hideContextMenu();
            }
            
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.handleSearch();
            }
        });
    }

    async loadData() {
        try {
            this.showLoading();
            
            // Load real data from Supabase
            await Promise.all([
                this.loadIssues(),
                this.loadCommunityStats(),
                this.loadUserData()
            ]);
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async loadIssues() {
        try {
            console.log('HomeManager: Starting to load issues...');
            this.issues = await DataService.getIssues();
            console.log('HomeManager: Loaded', this.issues.length, 'issues from Supabase');
            this.renderIssues();
        } catch (error) {
            console.error('HomeManager: Error loading issues:', error);
            console.error('HomeManager: Full error details:', JSON.stringify(error, null, 2));
            this.issues = [];
            this.showError(`Failed to load community issues: ${error.message}`);
        }
    }

    async loadCommunityStats() {
        try {
            const stats = await DataService.getCommunityStats();
            console.log('Community stats:', stats);
            
            this.animateCounter(this.impactScore, stats.impactScore);
            this.animateCounter(this.activeMembers, stats.activeMembers);
            this.animateCounter(this.resolvedThisWeek, stats.resolvedThisWeek);
        } catch (error) {
            console.error('Error loading community stats:', error);
        }
    }

    async loadUserData() {
        if (!this.user) return;
        
        try {
            // Load user's upvotes and bookmarks
            const [upvotes, bookmarks] = await Promise.all([
                DataService.getUserUpvotes(this.user.id),
                DataService.getUserBookmarks(this.user.id)
            ]);
            
            this.userUpvotes = upvotes;
            this.bookmarks = bookmarks;
            
            console.log('User upvotes:', upvotes.length);
            console.log('User bookmarks:', bookmarks.length);
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    animateCounter(element, target) {
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (target - start) * this.easeOutQuad(progress));
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }

    renderIssues() {
        const filteredIssues = this.getFilteredIssues();
        
        if (filteredIssues.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        this.updateFilterSummary(filteredIssues.length);

        this.issuesContainer.innerHTML = filteredIssues.map(issue => this.createIssueCard(issue)).join('');
    }

    getFilteredIssues() {
        return this.issues.filter(issue => {
            const statusMatch = this.filters.status === 'all' || issue.status === this.filters.status;
            const priorityMatch = this.filters.priority === 'all' || issue.priority === this.filters.priority;
            return statusMatch && priorityMatch;
        });
    }

    createIssueCard(issue) {
        const timeAgo = DataService.formatTimeAgo(issue.created_at);
        const isUpvoted = this.userUpvotes.includes(issue.id);
        const isBookmarked = this.bookmarks.includes(issue.id);
        const upvoteCount = issue.upvotes?.[0]?.count || 0;
        const commentCount = issue.comments?.[0]?.count || 0;
        const authorName = issue.profiles?.name || 'Anonymous';

        return `
            <article class="issue-card" data-issue-id="${issue.id}">
                <header class="issue-header">
                    <div class="issue-author">
                        <div class="author-avatar">${authorName.charAt(0).toUpperCase()}</div>
                        <div class="author-info">
                            <div class="author-name">${authorName}</div>
                            <div class="issue-time">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="issue-actions">
                        <button class="action-btn ${isBookmarked ? 'active' : ''}" data-action="bookmark" title="Bookmark">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                        <button class="action-btn" data-action="menu" title="More options">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="12" cy="5" r="1"/>
                                <circle cx="12" cy="19" r="1"/>
                            </svg>
                        </button>
                    </div>
                </header>

                <div class="issue-content">
                    <h3 class="issue-title">${issue.title}</h3>
                    <p class="issue-description">${issue.description}</p>
                    
                    ${issue.image_url ? `<img src="${issue.image_url}" alt="Issue photo" class="issue-image" loading="lazy">` : ''}
                    
                    <div class="issue-badges">
                        <span class="badge status-badge ${issue.status}">
                            <span class="badge-indicator" style="background-color: ${this.getStatusColor(issue.status)}"></span>
                            ${issue.status.replace('_', ' ')}
                        </span>
                        <span class="badge priority-badge ${issue.priority}">
                            <span class="badge-indicator" style="background-color: ${this.getPriorityColor(issue.priority)}"></span>
                            ${issue.priority}
                        </span>
                        <span class="badge category-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ${this.getCategoryIcon(issue.category)}
                            </svg>
                            ${issue.category.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <footer class="issue-footer">
                    <div class="engagement-row">
                        <button class="engagement-btn ${isUpvoted ? 'active' : ''}" data-action="upvote">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isUpvoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M7 10v12"/>
                                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                            </svg>
                            <span>${upvoteCount}</span>
                        </button>
                        
                        <button class="engagement-btn" data-action="comment">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>${commentCount}</span>
                        </button>
                        
                        <button class="engagement-btn" data-action="share">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="location-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${issue.address}</span>
                    </div>
                </footer>
            </article>
        `;
    }

    handleIssueAction(button) {
        const action = button.dataset.action;
        const issueCard = button.closest('.issue-card');
        const issueId = issueCard.dataset.issueId;
        const issue = this.issues.find(i => i.id === issueId);

        switch (action) {
            case 'upvote':
                this.toggleUpvote(issueId, button);
                break;
            case 'bookmark':
                this.toggleBookmark(issueId, button);
                break;
            case 'comment':
                this.handleComment(issue);
                break;
            case 'share':
                this.handleShare(issue);
                break;
            case 'menu':
                this.showContextMenu(button, issue);
                break;
        }
    }

    async toggleUpvote(issueId, button) {
        if (!this.user) {
            this.showToast('Please sign in to upvote issues', 'error');
            return;
        }

        const issue = this.issues.find(i => i.id === issueId);
        const isUpvoted = this.userUpvotes.includes(issueId);
        
        // Optimistic update
        if (isUpvoted) {
            this.userUpvotes = this.userUpvotes.filter(id => id !== issueId);
            issue.upvotes[0].count--;
            button.classList.remove('active');
        } else {
            this.userUpvotes.push(issueId);
            issue.upvotes[0].count++;
            button.classList.add('active');
            this.showToast('Issue upvoted!', 'success');
        }
        
        // Update UI immediately
        const svg = button.querySelector('svg');
        svg.setAttribute('fill', isUpvoted ? 'none' : 'currentColor');
        button.querySelector('span').textContent = issue.upvotes[0].count;
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        try {
            // Update database
            const result = await DataService.toggleUpvote(issueId, this.user.id);
            console.log('Upvote toggle result:', result);
        } catch (error) {
            console.error('Error toggling upvote:', error);
            
            // Revert optimistic update on error
            if (isUpvoted) {
                this.userUpvotes.push(issueId);
                issue.upvotes[0].count++;
                button.classList.add('active');
            } else {
                this.userUpvotes = this.userUpvotes.filter(id => id !== issueId);
                issue.upvotes[0].count--;
                button.classList.remove('active');
            }
            
            // Revert UI
            svg.setAttribute('fill', !isUpvoted ? 'none' : 'currentColor');
            button.querySelector('span').textContent = issue.upvotes[0].count;
            
            this.showToast('Failed to update upvote. Please try again.', 'error');
        }
    }

    async toggleBookmark(issueId, button) {
        if (!this.user) {
            this.showToast('Please sign in to bookmark issues', 'error');
            return;
        }

        const isBookmarked = this.bookmarks.includes(issueId);
        
        // Optimistic update
        if (isBookmarked) {
            this.bookmarks = this.bookmarks.filter(id => id !== issueId);
            button.classList.remove('active');
            this.showToast('Removed from bookmarks', 'info');
        } else {
            this.bookmarks.push(issueId);
            button.classList.add('active');
            this.showToast('Added to bookmarks!', 'success');
        }
        
        // Update UI
        const svg = button.querySelector('svg');
        svg.setAttribute('fill', isBookmarked ? 'none' : 'currentColor');

        try {
            // Update database
            const result = await DataService.toggleBookmark(issueId, this.user.id);
            console.log('Bookmark toggle result:', result);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            
            // Revert optimistic update on error
            if (isBookmarked) {
                this.bookmarks.push(issueId);
                button.classList.add('active');
            } else {
                this.bookmarks = this.bookmarks.filter(id => id !== issueId);
                button.classList.remove('active');
            }
            
            // Revert UI
            svg.setAttribute('fill', !isBookmarked ? 'none' : 'currentColor');
            
            this.showToast('Failed to update bookmark. Please try again.', 'error');
        }
    }

    handleComment(issue) {
        this.showToast('Comments feature coming soon!', 'info');
    }

    async handleShare(issue) {
        const shareData = {
            title: 'Jamaica Issue Report',
            text: `Check out this issue: "${issue.title}"`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.fallbackShare(issue);
                }
            }
        } else {
            this.fallbackShare(issue);
        }
    }

    fallbackShare(issue) {
        const shareText = `Check out this issue in Jamaica: "${issue.title}" - ${window.location.href}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            this.showToast('Link copied to clipboard!', 'success');
        } else {
            this.showToast('Sharing not supported on this device', 'error');
        }
    }

    showContextMenu(button, issue) {
        const rect = button.getBoundingClientRect();
        
        this.currentMenuIssue = issue;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.top = `${rect.bottom + 8}px`;
        this.contextMenu.style.right = `${window.innerWidth - rect.right}px`;
        
        // Ensure menu doesn't go off screen
        const menuRect = this.contextMenu.getBoundingClientRect();
        if (menuRect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${rect.top - menuRect.height - 8}px`;
        }
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none';
        this.currentMenuIssue = null;
    }

    handleMenuAction(action) {
        if (!this.currentMenuIssue) return;
        
        const issue = this.currentMenuIssue;
        this.hideContextMenu();

        switch (action) {
            case 'share':
                this.handleShare(issue);
                break;
            case 'copy_link':
                this.copyIssueLink(issue);
                break;
            case 'view_location':
                this.viewOnMap(issue);
                break;
            case 'report':
                this.reportIssue(issue);
                break;
        }
    }

    copyIssueLink(issue) {
        const link = `${window.location.origin}/issue/${issue.id}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link);
            this.showToast('Issue link copied!', 'success');
        } else {
            this.showToast('Copy not supported on this device', 'error');
        }
    }

    viewOnMap(issue) {
        this.showToast('Map view coming soon!', 'info');
    }

    reportIssue(issue) {
        this.showToast('Report functionality coming soon!', 'info');
    }

    handleIssueClick(issueCard) {
        const issueId = issueCard.dataset.issueId;
        const issue = this.issues.find(i => i.id === issueId);
        
        this.showToast(`Opening issue: ${issue.title}`, 'info');
    }

    // Filter functionality (same as before)
    showFilterModal() {
        this.filterModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideFilterModal() {
        this.filterModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    handleFilterButtonClick(button) {
        const filterType = button.dataset.filter;
        const filterValue = button.dataset.value;
        
        // Update active state
        button.parentElement.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.remove('active')
        );
        button.classList.add('active');
        
        // Update filter
        this.filters[filterType] = filterValue;
    }

    async applyFiltersAction() {
        this.hideFilterModal();
        
        // If using filtered view, fetch filtered data from Supabase
        if (this.filters.status !== 'all' || this.filters.priority !== 'all') {
            try {
                this.showLoading();
                const filteredIssues = await DataService.getFilteredIssues(this.filters);
                this.issues = filteredIssues;
                this.renderIssues();
            } catch (error) {
                console.error('Error applying filters:', error);
                this.showToast('Error applying filters', 'error');
            } finally {
                this.hideLoading();
            }
        } else {
            // No filters, reload all issues
            await this.loadIssues();
        }
        
        this.showToast('Filters applied!', 'success');
    }

    async clearAllFiltersAction() {
        this.filters = { status: 'all', priority: 'all' };
        
        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Reload all issues
        await this.loadIssues();
        this.showToast('Filters cleared!', 'info');
    }

    updateFilterSummary(count) {
        const hasActiveFilters = this.filters.status !== 'all' || this.filters.priority !== 'all';
        
        if (hasActiveFilters) {
            this.filterSummary.style.display = 'flex';
            this.filterSummaryText.textContent = `Showing ${count} issues`;
        } else {
            this.filterSummary.style.display = 'none';
        }
    }

    // Navigation handlers
    handleSearch() {
        this.showToast('Search functionality coming soon!', 'info');
    }

    handleProfile() {
        // Show profile options
        const options = [
            { text: 'View Profile', action: () => this.showToast('Profile coming soon!', 'info') },
            { text: 'Settings', action: () => this.showToast('Settings coming soon!', 'info') },
            { text: 'Sign Out', action: () => this.handleSignOut() }
        ];
        
        this.showOptionsMenu(options);
    }

    showOptionsMenu(options) {
        // Create and show options menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: #ffffff;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #f0f0f0;
            z-index: 1000;
            min-width: 160px;
            animation: fadeIn 0.2s ease-out;
        `;

        options.forEach(option => {
            const item = document.createElement('button');
            item.className = 'menu-item';
            item.textContent = option.text;
            item.onclick = () => {
                menu.remove();
                option.action();
            };
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // Close on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    async handleSignOut() {
        try {
            const result = await authService.signOut();
            if (result.success) {
                this.showToast('Signed out successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Sign out error:', error);
            this.showToast('Error signing out', 'error');
        }
    }

    handleReport() {
        this.showToast('Report functionality coming soon!', 'info');
    }

    // UI state management (same as before)
    showLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'flex';
        }
        if (this.issuesContainer) {
            this.issuesContainer.style.display = 'none';
        }
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'none';
        }
        if (this.issuesContainer) {
            this.issuesContainer.style.display = 'block';
        }
    }

    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'flex';
        }
        if (this.issuesContainer) {
            this.issuesContainer.style.display = 'none';
        }
    }

    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        if (this.issuesContainer) {
            this.issuesContainer.style.display = 'block';
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: 'calc(100vw - 40px)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: type === 'error' ? '#FEF2F2' : type === 'success' ? '#F0FDF4' : '#F8FAFC',
            color: type === 'error' ? '#DC2626' : type === 'success' ? '#16A34A' : '#475569',
            border: `1px solid ${type === 'error' ? '#FECACA' : type === 'success' ? '#BBF7D0' : '#E2E8F0'}`,
            animation: 'slideInUp 0.3s ease-out'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInUp 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }

    // Utility functions (same as before)
    getStatusColor(status) {
        const colors = {
            pending: '#f59e0b',
            in_progress: '#3b82f6',
            resolved: '#22c55e'
        };
        return colors[status] || '#6b7280';
    }

    getPriorityColor(priority) {
        const colors = {
            low: '#22c55e',
            medium: '#f59e0b',
            high: '#ef4444',
            critical: '#dc2626'
        };
        return colors[priority] || '#6b7280';
    }

    getCategoryIcon(category) {
        const icons = {
            infrastructure: '<path d="M12 2L2 7h10l10-5z"/><path d="M2 17h20v2H2z"/><path d="M6 19v-2l6-1 6 1v2"/>',
            safety: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
            environment: '<path d="M7 13c0 6 4 10 4 10s4-4 4-10a4 4 0 0 0-8 0z"/><path d="M9.69 7.69L12 5.38l2.31 2.31A4 4 0 0 1 12 13a4 4 0 0 1-2.31-5.31z"/>',
            maintenance: '<path d="M9.7 14.4L6.7 7.1C6.6 6.9 6.5 6.8 6.3 6.8c-.2 0-.4.1-.5.3L2.9 12c-.1.2-.1.4.1.6l2.9 2.9c.2.2.4.2.6.1l4.9-2.9c.2-.1.3-.3.2-.5z"/>',
            accessibility: '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2c0-1.1-.9-2-2-2h-4l-2-2-2 2H5c-1.1 0-2 .9-2 2v2"/>',
            road_maintenance: '<path d="M7 15h2l1-1 1 1h2"/><path d="M7 9h10v6H7z"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>'
        };
        return icons[category] || '<circle cx="12" cy="12" r="2"/>';
    }
}

// Prevent multiple initializations
if (window.homeManagerInitialized) {
    console.log('HomeManager already initialized, skipping...');
} else {
    window.homeManagerInitialized = true;
    
    // Initialize home manager when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, checking DOM elements...');
        console.log('Current document:', document.location.href);
        console.log('Document readyState:', document.readyState);
        
        // Wait for DOM to be fully ready and Supabase to initialize
        const initializeHome = () => {
            // Check if all required elements exist
            const requiredElements = [
                'searchButton', 'profileButton', 'impactScore', 'activeMembers', 
                'resolvedThisWeek', 'filterButton', 'issuesContainer', 'loadingContainer'
            ];
            
            console.log('Checking for elements in document:', document.title);
            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                console.log(`Element ${id}:`, element ? 'FOUND' : 'MISSING');
            });
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('Still missing DOM elements:', missingElements);
                
                // Stop retrying after too many attempts
                initializeHome.attempts = (initializeHome.attempts || 0) + 1;
                if (initializeHome.attempts > 50) {
                    console.error('Giving up after 50 attempts. Elements not found.');
                    return;
                }
                
                setTimeout(initializeHome, 100);
                return;
            }
            
            console.log('All DOM elements found, initializing HomeManager');
            new HomeManager();
        };
        
        // Start initialization with delay for Supabase auth
        setTimeout(initializeHome, 200);
    });
}

console.log('Real Supabase Home Manager loaded');