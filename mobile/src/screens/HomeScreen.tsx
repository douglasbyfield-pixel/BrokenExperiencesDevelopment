import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Issue } from '../types';

export default function HomeScreen() {
  // Mock data - replace with actual data from Supabase
  const issues: Issue[] = [];

  const renderIssue = ({ item }: { item: Issue }) => (
    <TouchableOpacity style={styles.issueCard}>
      <Text style={styles.issueTitle}>{item.title}</Text>
      <Text style={styles.issueDescription}>{item.description}</Text>
      <Text style={styles.issueStatus}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Issues</Text>
      {issues.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No issues reported yet</Text>
          <Text style={styles.emptySubtext}>Tap the Report tab to add one</Text>
        </View>
      ) : (
        <FlatList
          data={issues}
          renderItem={renderIssue}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  list: {
    paddingHorizontal: 20,
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
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  issueStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});