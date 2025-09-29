import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final user = appState.currentUser ?? _getDefaultUser();
          
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildProfileHeader(user),
                const SizedBox(height: 24),
                _buildStatsCards(user, appState),
                const SizedBox(height: 24),
                _buildBadgesSection(user),
                const SizedBox(height: 24),
                _buildRecentActivity(appState, user),
                const SizedBox(height: 24),
                _buildRoleSelection(user),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(UserProfile user) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.grey[300],
                  child: Icon(
                    Icons.person,
                    size: 50,
                    color: Colors.grey[600],
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.black,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.camera_alt,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              user.name,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _getRoleDisplayName(user.role),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.star, color: Colors.grey[600], size: 20),
                const SizedBox(width: 4),
                Text(
                  '${user.points} points',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(UserProfile user, AppState appState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'My Impact',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Issues Reported',
                '${user.issuesReported}',
                Icons.report_outlined,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Issues Fixed',
                '${user.issuesFixed}',
                Icons.build_outlined,
                Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Issues Sponsored',
                '${user.issuesSponsored}',
                Icons.volunteer_activism_outlined,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Badges Earned',
                '${user.badges.length}',
                Icons.emoji_events_outlined,
                Colors.purple,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadgesSection(UserProfile user) {
    final allBadges = [
      'First Reporter',
      'Problem Solver',
      'Community Champion',
      'Speed Fixer',
      'Generous Sponsor',
      'Local Hero',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Badges & Achievements',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
              ),
              itemCount: allBadges.length,
              itemBuilder: (context, index) {
                final badge = allBadges[index];
                final isEarned = user.badges.contains(badge);
                return _buildBadgeItem(badge, isEarned);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBadgeItem(String badge, bool isEarned) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: isEarned ? Colors.black : Colors.grey[300],
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.emoji_events,
            color: isEarned ? Colors.white : Colors.grey[500],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          badge,
          style: TextStyle(
            fontSize: 10,
            color: isEarned ? Colors.black : Colors.grey[500],
            fontWeight: isEarned ? FontWeight.bold : FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildRecentActivity(AppState appState, UserProfile user) {
    final userIssues = appState.getIssuesByUser(user.id).take(3).toList();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (userIssues.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.history,
                      size: 48,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'No recent activity',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Start by reporting an issue in your community!',
                      style: Theme.of(context).textTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ...userIssues.map((issue) => _buildActivityItem(issue)),
      ],
    );
  }

  Widget _buildActivityItem(Issue issue) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: issue.imagePath != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    issue.imagePath!,
                    fit: BoxFit.cover,
                  ),
                )
              : Icon(
                  Icons.image_outlined,
                  color: Colors.grey[400],
                ),
        ),
        title: Text(issue.title),
        subtitle: Text(_formatDate(issue.createdAt)),
        trailing: _buildStatusIndicator(issue.status),
        onTap: () {},
      ),
    );
  }

  Widget _buildStatusIndicator(IssueStatus status) {
    Color color;
    IconData icon;
    
    switch (status) {
      case IssueStatus.reported:
        color = Colors.blue;
        icon = Icons.report_outlined;
        break;
      case IssueStatus.inProgress:
        color = Colors.orange;
        icon = Icons.build_outlined;
        break;
      case IssueStatus.resolved:
        color = Colors.green;
        icon = Icons.check_circle_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 16),
    );
  }

  Widget _buildRoleSelection(UserProfile user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Role Preferences',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'How do you want to contribute?',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                ...UserRole.values.map((role) => CheckboxListTile(
                  title: Text(_getRoleDisplayName(role)),
                  subtitle: Text(_getRoleDescription(role)),
                  value: user.role == role,
                  onChanged: (value) {
                    if (value == true) {
                      final updatedUser = user.copyWith(role: role);
                      context.read<AppState>().setCurrentUser(updatedUser);
                    }
                  },
                  contentPadding: EdgeInsets.zero,
                )),
              ],
            ),
          ),
        ),
      ],
    );
  }

  UserProfile _getDefaultUser() {
    return UserProfile(
      id: 'demo_user',
      name: 'Community Member',
      role: UserRole.reporter,
      points: 150,
      badges: ['First Reporter'],
      issuesReported: 3,
      issuesFixed: 1,
      issuesSponsored: 2,
    );
  }

  String _getRoleDisplayName(UserRole role) {
    switch (role) {
      case UserRole.reporter:
        return 'Reporter';
      case UserRole.fixer:
        return 'Fixer';
      case UserRole.sponsor:
        return 'Sponsor';
      case UserRole.organization:
        return 'Organization';
    }
  }

  String _getRoleDescription(UserRole role) {
    switch (role) {
      case UserRole.reporter:
        return 'Report issues in your community';
      case UserRole.fixer:
        return 'Help fix reported issues';
      case UserRole.sponsor:
        return 'Provide resources and funding';
      case UserRole.organization:
        return 'Manage community initiatives';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inMinutes}m ago';
    }
  }
}