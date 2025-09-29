import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Feed'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final sortedIssues = List<Issue>.from(appState.issues)
            ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

          if (sortedIssues.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.feed_outlined,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No issues in the feed yet',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Be the first to report an issue!',
                    style: TextStyle(
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _onRefresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: sortedIssues.length,
              itemBuilder: (context, index) {
                final issue = sortedIssues[index];
                return _buildFeedItem(issue);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeedItem(Issue issue) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFeedHeader(issue),
          if (issue.imagePath != null) _buildFeedImage(issue.imagePath!),
          _buildFeedContent(issue),
          _buildFeedActions(issue),
        ],
      ),
    );
  }

  Widget _buildFeedHeader(Issue issue) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.grey[300],
            child: Icon(
              issue.isAnonymous ? Icons.person_outline : Icons.person,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  issue.isAnonymous ? 'Anonymous Reporter' : 'Community Member',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  _formatDate(issue.createdAt),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          _buildSeverityBadge(issue.severity),
        ],
      ),
    );
  }

  Widget _buildFeedImage(String imagePath) {
    return Container(
      width: double.infinity,
      height: 250,
      color: Colors.grey[200],
      child: Image.asset(
        imagePath,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: Colors.grey[200],
            child: Icon(
              Icons.image_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeedContent(Issue issue) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            issue.title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            issue.description,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              _buildContentChip(
                Icons.category_outlined,
                _getCategoryDisplayName(issue.category),
              ),
              _buildContentChip(
                Icons.location_on_outlined,
                'Location Pin',
              ),
              _buildStatusChip(issue.status),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeedActions(Issue issue) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.thumb_up_outlined),
            label: const Text('Like'),
          ),
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.comment_outlined),
            label: const Text('Comment'),
          ),
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.share_outlined),
            label: const Text('Share'),
          ),
          if (issue.status == IssueStatus.reported)
            TextButton.icon(
              onPressed: () => _showActionDialog(issue),
              icon: const Icon(Icons.volunteer_activism_outlined),
              label: const Text('Help'),
            ),
        ],
      ),
    );
  }

  Widget _buildSeverityBadge(IssueSeverity severity) {
    Color color;
    switch (severity) {
      case IssueSeverity.low:
        color = Colors.green;
        break;
      case IssueSeverity.medium:
        color = Colors.orange;
        break;
      case IssueSeverity.high:
        color = Colors.red;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        severity.name.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildContentChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[700],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(IssueStatus status) {
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            status.name.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  void _showActionDialog(Issue issue) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('How would you like to help?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.build_outlined),
              title: const Text('Fix This Issue'),
              subtitle: const Text('Take responsibility for resolving this issue'),
              onTap: () {
                Navigator.of(context).pop();
                _claimIssue(issue);
              },
            ),
            ListTile(
              leading: const Icon(Icons.volunteer_activism_outlined),
              title: const Text('Sponsor This Fix'),
              subtitle: const Text('Provide resources or funding'),
              onTap: () {
                Navigator.of(context).pop();
                _sponsorIssue(issue);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _claimIssue(Issue issue) {
    final updatedIssue = issue.copyWith(
      status: IssueStatus.inProgress,
      fixerId: 'current_user_id', // This would be the actual user ID
    );
    context.read<AppState>().updateIssue(updatedIssue);
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Issue claimed! Good luck with the fix.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _sponsorIssue(Issue issue) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sponsorship feature coming soon!'),
      ),
    );
  }

  String _getCategoryDisplayName(IssueCategory category) {
    switch (category) {
      case IssueCategory.infrastructure:
        return 'Infrastructure';
      case IssueCategory.safety:
        return 'Safety';
      case IssueCategory.environmental:
        return 'Environmental';
      case IssueCategory.other:
        return 'Other';
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

  Future<void> _onRefresh() async {
    await Future.delayed(const Duration(seconds: 1));
    setState(() {});
  }
}