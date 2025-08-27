import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { mockIssues, getPriorityColor, getCategoryIcon, Issue } from '../data/mockData';


type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Report: undefined;
  Profile: undefined;
};

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [region, setRegion] = useState({
    latitude: 18.1096, // Center of Jamaica
    longitude: -77.2975,
    latitudeDelta: 1.2, // Show full country
    longitudeDelta: 1.5,
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location access is needed to show your position on the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Center map on user's location if they're in Jamaica
      if (location.coords.latitude > 17.5 && location.coords.latitude < 18.8 &&
          location.coords.longitude > -78.5 && location.coords.longitude < -76.0) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  const handleMarkerPress = (issueId: string) => {
    setSelectedIssue(selectedIssue === issueId ? null : issueId);
  };

  const handleMapMarkerPress = (issue: Issue) => {
    setSelectedIssue(issue.id);
  };

  const zoomIn = () => {
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta * 0.5,
      longitudeDelta: prevRegion.longitudeDelta * 0.5,
    }));
  };

  const zoomOut = () => {
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: Math.min(prevRegion.latitudeDelta * 2, 2.0),
      longitudeDelta: Math.min(prevRegion.longitudeDelta * 2, 2.5),
    }));
  };

  const resetToJamaica = () => {
    setRegion({
      latitude: 18.1096,
      longitude: -77.2975,
      latitudeDelta: 1.2,
      longitudeDelta: 1.5,
    });
  };

  const toggleView = () => {
    setShowMap(!showMap);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="map" size={32} color="#000" style={styles.titleIcon} />
          <Text style={styles.title}>Issue Locations</Text>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
            <Ionicons 
              name={showMap ? "list-outline" : "map-outline"} 
              size={24} 
              color="#000" 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Issues near Kingston, Jamaica</Text>
        {userLocation && (
          <Text style={styles.locationText}>
            📍 Your Location: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChange={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            mapType="standard"
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {mockIssues.map((issue) => (
              <Marker
                key={issue.id}
                coordinate={{
                  latitude: issue.location.latitude,
                  longitude: issue.location.longitude,
                }}
                onPress={() => handleMapMarkerPress(issue)}
                title={issue.title}
                description={issue.description}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.markerPin,
                    { backgroundColor: getPriorityColor(issue.priority) }
                  ]}>
                    <Ionicons 
                      name={getCategoryIcon(issue.category) as any}
                      size={14} 
                      color="white"
                    />
                  </View>
                  <View style={[
                    styles.markerTail,
                    { borderTopColor: getPriorityColor(issue.priority) }
                  ]} />
                </View>
              </Marker>
            ))}
            
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                }}
                title="Your Location"
                pinColor="blue"
              />
            )}
          </MapView>
        </View>
      )}

      {/* Issues List */}
      <ScrollView 
        style={[styles.issuesList, showMap && styles.issuesListHidden]} 
        showsVerticalScrollIndicator={false}
      >
        {mockIssues.map((issue) => (
          <TouchableOpacity
            key={issue.id}
            style={[
              styles.issueCard,
              selectedIssue === issue.id && styles.selectedCard
            ]}
            onPress={() => handleMarkerPress(issue.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.categoryContainer}>
                <View style={[
                  styles.customMarker,
                  { backgroundColor: getPriorityColor(issue.priority) }
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(issue.category) as any}
                    size={16} 
                    color="white"
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.priorityLabel}>{issue.priority}</Text>
                  <Text style={styles.categoryLabel}>{issue.category}</Text>
                </View>
              </View>
              <Text style={styles.upvotesText}>↑ {issue.upvotes}</Text>
            </View>
            
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <Text style={styles.issueDescription}>{issue.description}</Text>
            
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.addressText}>{issue.location.address}</Text>
            </View>
            
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                📍 {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>


      {/* Map Controls */}
      {showMap && (
        <>
          <View style={styles.zoomControls}>
            <TouchableOpacity 
              style={styles.zoomButton} 
              onPress={zoomIn}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.zoomButton, styles.zoomButtonBottom]} 
              onPress={zoomOut}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.jamaicaButton} 
            onPress={resetToJamaica}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={18} color="#000" />
            <Text style={styles.jamaicaButtonText}>JA</Text>
          </TouchableOpacity>

          {userLocation && (
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={getCurrentLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Minimalistic FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigateToScreen('Report')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    paddingLeft: 44,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    paddingLeft: 44,
  },
  issuesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  issuesListHidden: {
    display: 'none',
  },
  mapContainer: {
    flex: 1,
    height: 400,
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 12,
  },
  issueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedCard: {
    borderColor: '#000',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderText: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 4,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLocationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  upvotesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  coordinatesContainer: {
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  zoomControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    flexDirection: 'column',
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  zoomButtonBottom: {
    marginTop: 2,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  jamaicaButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
  },
  jamaicaButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 2,
  },
  locationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});