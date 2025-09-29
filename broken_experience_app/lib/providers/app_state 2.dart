import 'package:flutter/foundation.dart';
import 'dart:math' as math;

enum UserRole { reporter, fixer, sponsor, organization }
enum IssueStatus { reported, inProgress, resolved }
enum IssueSeverity { low, medium, high }
enum IssueCategory { infrastructure, safety, environmental, other }

class Issue {
  final String id;
  final String title;
  final String description;
  final double latitude;
  final double longitude;
  final String? imagePath;
  final IssueCategory category;
  final IssueSeverity severity;
  final IssueStatus status;
  final DateTime createdAt;
  final String reporterId;
  final String? fixerId;
  final bool isAnonymous;

  Issue({
    required this.id,
    required this.title,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.imagePath,
    required this.category,
    required this.severity,
    this.status = IssueStatus.reported,
    required this.createdAt,
    required this.reporterId,
    this.fixerId,
    this.isAnonymous = false,
  });

  Issue copyWith({
    String? id,
    String? title,
    String? description,
    double? latitude,
    double? longitude,
    String? imagePath,
    IssueCategory? category,
    IssueSeverity? severity,
    IssueStatus? status,
    DateTime? createdAt,
    String? reporterId,
    String? fixerId,
    bool? isAnonymous,
  }) {
    return Issue(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      imagePath: imagePath ?? this.imagePath,
      category: category ?? this.category,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      reporterId: reporterId ?? this.reporterId,
      fixerId: fixerId ?? this.fixerId,
      isAnonymous: isAnonymous ?? this.isAnonymous,
    );
  }
}

class UserProfile {
  final String id;
  final String name;
  final UserRole role;
  final int points;
  final List<String> badges;
  final int issuesReported;
  final int issuesFixed;
  final int issuesSponsored;

  UserProfile({
    required this.id,
    required this.name,
    required this.role,
    this.points = 0,
    this.badges = const [],
    this.issuesReported = 0,
    this.issuesFixed = 0,
    this.issuesSponsored = 0,
  });

  UserProfile copyWith({
    String? id,
    String? name,
    UserRole? role,
    int? points,
    List<String>? badges,
    int? issuesReported,
    int? issuesFixed,
    int? issuesSponsored,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      points: points ?? this.points,
      badges: badges ?? this.badges,
      issuesReported: issuesReported ?? this.issuesReported,
      issuesFixed: issuesFixed ?? this.issuesFixed,
      issuesSponsored: issuesSponsored ?? this.issuesSponsored,
    );
  }
}

class AppState extends ChangeNotifier {
  List<Issue> _issues = [];
  UserProfile? _currentUser;
  IssueCategory _selectedCategory = IssueCategory.infrastructure;
  IssueStatus _selectedStatus = IssueStatus.reported;

  List<Issue> get issues => List.unmodifiable(_issues);
  UserProfile? get currentUser => _currentUser;
  IssueCategory get selectedCategory => _selectedCategory;
  IssueStatus get selectedStatus => _selectedStatus;

  List<Issue> get filteredIssues {
    return _issues.where((issue) => 
      issue.category == _selectedCategory && 
      issue.status == _selectedStatus
    ).toList();
  }

  void setCurrentUser(UserProfile user) {
    _currentUser = user;
    notifyListeners();
  }

  void setSelectedCategory(IssueCategory category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSelectedStatus(IssueStatus status) {
    _selectedStatus = status;
    notifyListeners();
  }

  void addIssue(Issue issue) {
    _issues.add(issue);
    notifyListeners();
  }

  void updateIssue(Issue updatedIssue) {
    final index = _issues.indexWhere((issue) => issue.id == updatedIssue.id);
    if (index != -1) {
      _issues[index] = updatedIssue;
      notifyListeners();
    }
  }

  void removeIssue(String issueId) {
    _issues.removeWhere((issue) => issue.id == issueId);
    notifyListeners();
  }

  List<Issue> getIssuesByLocation(double lat, double lng, double radiusKm) {
    return _issues.where((issue) {
      final distance = _calculateDistance(lat, lng, issue.latitude, issue.longitude);
      return distance <= radiusKm;
    }).toList();
  }

  List<Issue> getIssuesByUser(String userId) {
    return _issues.where((issue) => 
      issue.reporterId == userId || issue.fixerId == userId
    ).toList();
  }

  double _calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    const double earthRadius = 6371;
    final double dLat = (lat2 - lat1) * (3.14159 / 180);
    final double dLng = (lng2 - lng1) * (3.14159 / 180);
    
    final double a = 0.5 - (0.5 * (dLat.cos())) + 
        lat1 * (3.14159 / 180).cos() * lat2 * (3.14159 / 180).cos() * 
        (1 - dLng.cos()) / 2;
    
    return earthRadius * 2 * (a.sqrt()).asin();
  }
}