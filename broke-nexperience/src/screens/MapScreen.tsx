import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import WebView from 'react-native-webview';
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
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const webViewRef = useRef<WebView>(null);

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
      
      // Send location to WebView map
      if (webViewRef.current) {
        const message = JSON.stringify({
          type: 'SET_USER_LOCATION',
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
        webViewRef.current.postMessage(message);
      }
      
      // Center map on user's location if they're in Jamaica
      if (location.coords.latitude > 17.5 && location.coords.latitude < 18.8 &&
          location.coords.longitude > -78.5 && location.coords.longitude < -76.0) {
        
        if (webViewRef.current) {
          const centerMessage = JSON.stringify({
            type: 'SET_CENTER',
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            zoom: 15
          });
          webViewRef.current.postMessage(centerMessage);
        }
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

  const resetToJamaica = () => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'SET_CENTER',
        lat: 18.1500,
        lng: -77.3000,
        zoom: 8
      });
      webViewRef.current.postMessage(message);
    }
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
        <Text style={styles.subtitle}>The Broken Experience - Jamaica</Text>
        {userLocation && (
          <Text style={styles.locationText}>
            📍 Your Location: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ 
              html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Issue Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { height: 100%; width: 100%; font-family: Arial, sans-serif; }
        .custom-popup {
            padding: 10px;
            max-width: 200px;
            font-family: Arial, sans-serif;
        }
        .popup-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .popup-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .popup-priority {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .popup-address {
            font-size: 11px;
            color: #999;
        }
        .leaflet-popup-content {
            margin: 8px !important;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        let map;
        let markers = [];
        let userMarker = null;

        const issues = [
            {
                id: "1",
                title: "Pothole on Main Street",
                description: "Large pothole causing traffic issues",
                priority: "high",
                location: { latitude: 18.1096, longitude: -77.2975, address: "Main Street, Kingston" },
                upvotes: 12
            },
            {
                id: "2", 
                title: "Broken Street Light",
                description: "Street light has been out for weeks",
                priority: "medium",
                location: { latitude: 18.4607, longitude: -77.8916, address: "Montego Bay, St. James" },
                upvotes: 8
            },
            {
                id: "3",
                title: "Damaged Sidewalk",
                description: "Cracked sidewalk is a safety hazard",
                priority: "low",
                location: { latitude: 17.9311, longitude: -76.7951, address: "Port Antonio, Portland" },
                upvotes: 5
            },
            {
                id: "4",
                title: "Road Flooding",
                description: "Road floods during heavy rain",
                priority: "high",
                location: { latitude: 18.5206, longitude: -77.8946, address: "Falmouth, Trelawny" },
                upvotes: 15
            },
            {
                id: "5",
                title: "Broken Water Pipe",
                description: "Water pipe burst causing road damage",
                priority: "medium",
                location: { latitude: 17.8811, longitude: -76.9527, address: "Blue Mountains, St. Andrew" },
                upvotes: 9
            },
            {
                id: "6",
                title: "Cracked Bridge",
                description: "Small cracks appearing on bridge surface",
                priority: "low",
                location: { latitude: 18.0179, longitude: -77.8803, address: "Mandeville, Manchester" },
                upvotes: 3
            }
        ];

        function getPriorityColor(priority) {
            switch (priority) {
                case 'high': return '#ef4444';
                case 'medium': return '#f59e0b';
                case 'low': return '#10b981';
                default: return '#6b7280';
            }
        }

        function createBrokenIcon(priority) {
            const color = getPriorityColor(priority);
            const size = priority === 'high' ? 40 : priority === 'medium' ? 36 : 32;
            const darkColor = adjustColor(color, -20);
            const fontSize = size > 36 ? '20px' : size > 32 ? '18px' : '16px';
            
            let icon;
            if (priority === 'high') {
                icon = '🏠'; // House for high priority
            } else if (priority === 'medium') {
                icon = '⚡'; // Lightning for medium priority  
            } else {
                icon = '⚠'; // Warning for low priority
            }
            
            return L.divIcon({
                className: 'broken-marker',
                html: '<div style="' +
                    'width: ' + size + 'px; ' +
                    'height: ' + size + 'px; ' +
                    'background: linear-gradient(135deg, ' + color + ', ' + darkColor + '); ' +
                    'border-radius: 50%; ' +
                    'border: 3px solid #ffffff; ' +
                    'box-shadow: 0 6px 16px rgba(0,0,0,0.4); ' +
                    'display: flex; ' +
                    'align-items: center; ' +
                    'justify-content: center;' +
                '"><div style="' +
                    'font-size: ' + fontSize + '; ' +
                    'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));' +
                '">' + icon + '</div></div>',
                iconSize: [size + 6, size + 6],
                iconAnchor: [(size + 6) / 2, (size + 6) / 2]
            });
        }
        
        function adjustColor(color, amount) {
            const hex = color.replace('#', '');
            const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
            const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
            const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function initMap() {
            // Initialize map centered on Jamaica (wider view)
            map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                dragging: true,
                touchZoom: true,
                doubleClickZoom: true
            }).setView([18.1500, -77.3000], 8);

            // Add CartoDB Dark Matter basemap for dramatic "broken" effect
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CartoDB',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);

            // Add issue markers
            issues.forEach(issue => {
                const color = getPriorityColor(issue.priority);
                const marker = L.marker([issue.location.latitude, issue.location.longitude], {
                    icon: createBrokenIcon(issue.priority)
                }).addTo(map);

                const popupContent = '<div class="custom-popup">' +
                    '<div class="popup-title">' + issue.title + '</div>' +
                    '<div class="popup-description">' + issue.description + '</div>' +
                    '<div class="popup-priority" style="color: ' + color + '">' + 
                    issue.priority + ' priority • ↑' + issue.upvotes + '</div>' +
                    '<div class="popup-address">' + issue.location.address + '</div>' +
                    '</div>';

                marker.bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-popup-wrapper'
                });

                markers.push(marker);
            });
        }

        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'SET_CENTER') {
                    map.setView([data.lat, data.lng], data.zoom || 14);
                } else if (data.type === 'SET_USER_LOCATION') {
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }
                    
                    userMarker = L.marker([data.lat, data.lng], {
                        icon: L.divIcon({
                            className: 'user-location-icon',
                            html: '<div style="width: 20px; height: 20px; border-radius: 50%; background: radial-gradient(circle, #00ff88, #00cc66); border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4), 0 0 15px rgba(0,255,136,0.5); animation: pulse 2s infinite;"></div><style>@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }</style>',
                            iconSize: [26, 26],
                            iconAnchor: [13, 13]
                        })
                    }).addTo(map);
                    
                    userMarker.bindPopup('Your Location');
                }
            } catch (e) {
                console.log('Message parsing error:', e);
            }
        });

        // Initialize map when page loads
        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>`
            }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            bounces={false}
            scrollEnabled={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              console.log('Map loaded successfully');
            }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
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


      {/* Map Controls - Redesigned for better visibility */}
      {showMap && (
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={resetToJamaica}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <Text style={styles.controlButtonText}>Jamaica</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={getCurrentLocation}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color="#fff" />
            <Text style={styles.controlButtonText}>My Location</Text>
          </TouchableOpacity>
        </View>
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
  mapControls: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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