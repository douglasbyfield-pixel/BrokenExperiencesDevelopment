import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { mockIssues, getPriorityColor, getCategoryIcon } from '../data/mockData';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Report: undefined;
  Profile: undefined;
};

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const mapMoveAnim = new Animated.Value(0);

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the main button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Continuous rotation for the compass icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Floating map animation
    const mapAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(mapMoveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(mapMoveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    mapAnimation.start();

    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location access denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        setCurrentLocation(`${addr.city || 'Unknown'}, ${addr.region || 'Unknown'}`);
      }
    } catch (error) {
      setCurrentLocation('Unable to get location');
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.spring(scaleAnim, {
      toValue: isExpanded ? 1 : 1.1,
      useNativeDriver: true,
    }).start();
  };

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(screenName);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Interactive Map Interface */}
      <View style={styles.mapContainer}>
        <Animated.View style={[
          styles.mapBackground,
          {
            transform: [{
              translateY: mapMoveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            }],
          }
        ]}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 20 }, (_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          
          {/* Map Markers for Issues */}
          {mockIssues.map((issue, index) => {
            const markerStyle = {
              position: 'absolute' as const,
              top: 50 + (index * 60) + Math.sin(index) * 30,
              left: 30 + (index * 40) + Math.cos(index) * 50,
            };
            
            return (
              <TouchableOpacity
                key={issue.id}
                style={[styles.mapMarker, markerStyle]}
                onPress={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
              >
                <View style={[
                  styles.markerContainer,
                  { borderColor: getPriorityColor(issue.priority) },
                  selectedIssue === issue.id && styles.markerSelected
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(issue.category) as any}
                    size={16} 
                    color={getPriorityColor(issue.priority)} 
                  />
                </View>
                <Animated.View style={[
                  styles.markerPulse,
                  { 
                    backgroundColor: getPriorityColor(issue.priority),
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.3, 0.1],
                    }),
                  }
                ]} />
              </TouchableOpacity>
            );
          })}

          {/* User Location Indicator */}
          <View style={styles.userLocationContainer}>
            <Animated.View style={[
              styles.userLocation,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Ionicons name="person" size={16} color="#007AFF" />
            </Animated.View>
          </View>

          {/* Compass */}
          <Animated.View style={[styles.compass, { transform: [{ rotate: spin }] }]}>
            <Ionicons name="compass-outline" size={40} color="#000" />
          </Animated.View>
        </Animated.View>

        {/* Issue Details Overlay */}
        {selectedIssue && (
          <Animated.View style={[styles.issueOverlay, { opacity: fadeAnim }]}>
            {(() => {
              const issue = mockIssues.find(i => i.id === selectedIssue);
              if (!issue) return null;
              
              return (
                <View style={styles.issueCard}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedIssue(null)}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                  
                  <View style={styles.issueHeader}>
                    <Ionicons name={getCategoryIcon(issue.category) as any} size={24} color="#000" />
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                      <Text style={styles.priorityText}>{issue.priority.toUpperCase()}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueDescription}>{issue.description}</Text>
                  
                  <View style={styles.issueMeta}>
                    <View style={styles.issueMetaItem}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.issueMetaText}>{issue.location.address}</Text>
                    </View>
                    <View style={styles.issueMetaItem}>
                      <Ionicons name="chevron-up-outline" size={16} color="#666" />
                      <Text style={styles.issueMetaText}>{issue.upvotes} upvotes</Text>
                    </View>
                  </View>
                </View>
              );
            })()}
          </Animated.View>
        )}
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.floatingContainer}>
        {/* Main FAB */}
        <Animated.View style={[
          styles.mainFab,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ]
          }
        ]}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={toggleExpanded}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isExpanded ? "close" : "add"} 
              size={30} 
              color="#000" 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Navigation FABs */}
        <Animated.View style={[
          styles.navFab,
          styles.homeFab,
          {
            opacity: isExpanded ? 1 : 0,
            transform: [
              { translateY: isExpanded ? 0 : 20 },
              { scale: isExpanded ? 1 : 0.8 }
            ]
          }
        ]}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigateToScreen('Home')}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={24} color="#000" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.navFab,
          styles.reportFab,
          {
            opacity: isExpanded ? 1 : 0,
            transform: [
              { translateY: isExpanded ? 0 : 20 },
              { scale: isExpanded ? 1 : 0.8 }
            ]
          }
        ]}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigateToScreen('Report')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.navFab,
          styles.profileFab,
          {
            opacity: isExpanded ? 1 : 0,
            transform: [
              { translateY: isExpanded ? 0 : 20 },
              { scale: isExpanded ? 1 : 0.8 }
            ]
          }
        ]}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigateToScreen('Profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={24} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Top Info Bar */}
      <Animated.View style={[styles.infoBar, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#000" />
          <Text style={styles.infoText}>{currentLocation}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="alert-circle-outline" size={20} color="#000" />
          <Text style={styles.infoText}>{mockIssues.length} Issues Nearby</Text>
        </View>
      </Animated.View>

      {/* Bottom Legend */}
      <Animated.View style={[styles.legend, { opacity: fadeAnim }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.legendText}>Critical</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ffd93d' }]} />
          <Text style={styles.legendText}>Warning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6bcf7f' }]} />
          <Text style={styles.legendText}>Resolved</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#e9ecef',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLine: {
    width: width / 10,
    height: height / 15,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 0.5,
  },
  mapMarker: {
    position: 'absolute',
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  markerPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    zIndex: 5,
  },
  userLocationContainer: {
    position: 'absolute',
    bottom: '40%',
    left: '50%',
    marginLeft: -20,
    marginBottom: -20,
  },
  userLocation: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compass: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  issueOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  issueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 40,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    lineHeight: 24,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  issueMeta: {
    gap: 8,
  },
  issueMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueMetaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginLeft: 6,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  mainFab: {
    marginBottom: 20,
  },
  navFab: {
    marginBottom: 15,
  },
  homeFab: {
    transform: [{ translateX: -60 }],
  },
  reportFab: {
    transform: [{ translateX: -30 }],
  },
  profileFab: {
    transform: [{ translateX: 0 }],
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  infoBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
});