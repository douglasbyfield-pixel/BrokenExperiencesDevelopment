import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../providers/app_state.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(18.0179, -76.8099), // Kingston, Jamaica
    zoom: 12.0,
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Issue Map'),
        actions: [
          PopupMenuButton<IssueStatus>(
            icon: const Icon(Icons.filter_list),
            onSelected: (status) {
              context.read<AppState>().setSelectedStatus(status);
              _updateMarkers();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: IssueStatus.reported,
                child: Text('Reported'),
              ),
              const PopupMenuItem(
                value: IssueStatus.inProgress,
                child: Text('In Progress'),
              ),
              const PopupMenuItem(
                value: IssueStatus.resolved,
                child: Text('Resolved'),
              ),
            ],
          ),
        ],
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          return Stack(
            children: [
              GoogleMap(
                initialCameraPosition: _initialPosition,
                onMapCreated: (GoogleMapController controller) {
                  _mapController = controller;
                  _updateMarkers();
                },
                markers: _markers,
                myLocationEnabled: false, // Temporarily disabled to prevent crashes
                myLocationButtonEnabled: false, // Temporarily disabled to prevent crashes
                compassEnabled: true,
                mapToolbarEnabled: false,
              ),
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: _buildCategoryFilter(appState),
              ),
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: _buildMapLegend(),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCategoryFilter(AppState appState) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: IssueCategory.values.map((category) {
              final isSelected = appState.selectedCategory == category;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: FilterChip(
                  label: Text(_getCategoryDisplayName(category)),
                  selected: isSelected,
                  onSelected: (selected) {
                    appState.setSelectedCategory(category);
                    _updateMarkers();
                  },
                  backgroundColor: Colors.white,
                  selectedColor: Colors.black,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.black,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildMapLegend() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Legend',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegendItem(Colors.red, 'High Priority'),
                _buildLegendItem(Colors.orange, 'Medium Priority'),
                _buildLegendItem(Colors.green, 'Low Priority'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  void _updateMarkers() {
    final appState = context.read<AppState>();
    final filteredIssues = appState.filteredIssues;
    
    setState(() {
      _markers = filteredIssues.map((issue) {
        return Marker(
          markerId: MarkerId(issue.id),
          position: LatLng(issue.latitude, issue.longitude),
          infoWindow: InfoWindow(
            title: issue.title,
            snippet: issue.description,
          ),
          icon: _getMarkerIcon(issue.severity),
          onTap: () => _showIssueBottomSheet(issue),
        );
      }).toSet();
    });
  }

  BitmapDescriptor _getMarkerIcon(IssueSeverity severity) {
    switch (severity) {
      case IssueSeverity.high:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
      case IssueSeverity.medium:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
      case IssueSeverity.low:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
    }
  }

  void _showIssueBottomSheet(Issue issue) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _buildIssueDetails(issue),
    );
  }

  Widget _buildIssueDetails(Issue issue) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  issue.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (issue.imagePath != null)
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[200],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  issue.imagePath!,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          const SizedBox(height: 12),
          Text(
            issue.description,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildDetailChip(
                'Category',
                _getCategoryDisplayName(issue.category),
                Icons.category_outlined,
              ),
              const SizedBox(width: 8),
              _buildDetailChip(
                'Severity',
                issue.severity.name,
                Icons.priority_high_outlined,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildDetailChip(
                'Status',
                issue.status.name,
                Icons.info_outlined,
              ),
              const SizedBox(width: 8),
              _buildDetailChip(
                'Reported',
                _formatDate(issue.createdAt),
                Icons.access_time,
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.volunteer_activism),
              label: const Text('Sponsor This Fix'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.build),
              label: const Text('Claim This Issue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailChip(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(
            '$label: $value',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
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
}