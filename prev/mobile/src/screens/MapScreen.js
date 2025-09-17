import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [issues, setIssues] = useState([]);

  const mockIssues = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      latitude: 18.0179,
      longitude: -76.8099,
      priority: 'High',
    },
    {
      id: 2,
      title: 'Broken Streetlight',
      latitude: 17.9909,
      longitude: -76.8700,
      priority: 'Medium',
    },
  ];

  useEffect(() => {
    setIssues(mockIssues);
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location error:', error);
          Alert.alert('Location Error', 'Unable to get your location');
        }
      );
    } else {
      Alert.alert('Error', 'Geolocation is not supported by this browser');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Issue Map</Text>
        <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
          <Text style={styles.locationButtonText}>📍 My Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>🗺️</Text>
          <Text style={styles.mapLabel}>Interactive Map</Text>
          <Text style={styles.mapSubtitle}>
            {userLocation 
              ? `Your location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
              : 'Enable location to see your position'
            }
          </Text>
        </View>
      </View>

      <View style={styles.issuesList}>
        <Text style={styles.issuesTitle}>Nearby Issues</Text>
        {issues.map((issue) => (
          <TouchableOpacity key={issue.id} style={styles.issueItem}>
            <View style={styles.issueInfo}>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <Text style={styles.issueCoords}>
                📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
              </Text>
            </View>
            <View style={[
              styles.priorityIndicator, 
              { backgroundColor: issue.priority === 'High' ? '#ff4444' : '#ffaa00' }
            ]} />
          </TouchableOpacity>
        ))}
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  locationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
  },
  mapText: {
    fontSize: 48,
    marginBottom: 10,
  },
  mapLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  issuesList: {
    backgroundColor: 'white',
    padding: 20,
    maxHeight: 200,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  issueCoords: {
    fontSize: 12,
    color: '#666',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});