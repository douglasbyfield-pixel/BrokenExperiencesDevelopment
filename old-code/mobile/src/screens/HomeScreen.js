import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [issues, setIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockIssues = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      description: 'Large pothole causing damage to vehicles',
      category: 'Roads',
      priority: 'High',
      status: 'Open',
      location: 'Kingston',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Broken Streetlight',
      description: 'Streetlight not working for weeks',
      category: 'Utilities',
      priority: 'Medium',
      status: 'In Progress',
      location: 'Spanish Town',
      date: '2024-01-14',
    },
    {
      id: 3,
      title: 'Water Leak',
      description: 'Constant water leak on the sidewalk',
      category: 'Water',
      priority: 'High',
      status: 'Open',
      location: 'Montego Bay',
      date: '2024-01-13',
    },
  ];

  useEffect(() => {
    setIssues(mockIssues);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIssues([...mockIssues]);
      setRefreshing(false);
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#00aa00';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#ff4444';
      case 'In Progress': return '#ffaa00';
      case 'Resolved': return '#00aa00';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Recent Issues</Text>
        
        {issues.map((issue) => (
          <TouchableOpacity key={issue.id} style={styles.issueCard}>
            <View style={styles.issueHeader}>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                <Text style={styles.priorityText}>{issue.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.issueDescription}>{issue.description}</Text>
            
            <View style={styles.issueFooter}>
              <Text style={styles.issueLocation}>📍 {issue.location}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                <Text style={styles.statusText}>{issue.status}</Text>
              </View>
            </View>
            
            <Text style={styles.issueDate}>{issue.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  issueCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  issueLocation: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  issueDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});