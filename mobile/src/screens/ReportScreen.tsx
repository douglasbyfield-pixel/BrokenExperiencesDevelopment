import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, StatusBar, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Issue } from '../data/mockData';

const { width } = Dimensions.get('window');

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Category = 'infrastructure' | 'safety' | 'environment' | 'maintenance' | 'accessibility';

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#16a34a' },
  { value: 'medium', label: 'Medium', color: '#ca8a04' },
  { value: 'high', label: 'High', color: '#ea580c' },
  { value: 'critical', label: 'Critical', color: '#dc2626' },
];

const categoryOptions: { value: Category; label: string; icon: string }[] = [
  { value: 'infrastructure', label: 'Infrastructure', icon: 'construct-outline' },
  { value: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
  { value: 'environment', label: 'Environment', icon: 'leaf-outline' },
  { value: 'maintenance', label: 'Maintenance', icon: 'build-outline' },
  { value: 'accessibility', label: 'Accessibility', icon: 'accessibility-outline' },
];

export default function ReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('infrastructure');
  const [priority, setPriority] = useState<Priority>('medium');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location permission denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        setLocation(`${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`);
      }

      return currentLocation;
    } catch (error) {
      setLocation('Unable to get location');
      return null;
    }
  };

  const animateProgress = (value: number) => {
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const calculateProgress = () => {
    let progress = 0;
    if (title.trim()) progress += 0.25;
    if (description.trim()) progress += 0.25;
    if (category) progress += 0.25;
    if (priority) progress += 0.25;
    return progress;
  };

  useEffect(() => {
    const progress = calculateProgress();
    animateProgress(progress);
  }, [title, description, category, priority]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description');
      return;
    }

    setLoading(true);
    
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        Alert.alert('Location Required', 'Location access is required to report issues');
        setLoading(false);
        return;
      }

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert('Success!', 'Issue reported successfully! Thank you for helping improve your community.', [
        {
          text: 'Report Another',
          onPress: () => {
            setTitle('');
            setDescription('');
            setCategory('infrastructure');
            setPriority('medium');
          }
        },
        { text: 'Done', style: 'default' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOption = (option: typeof categoryOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[styles.optionButton, category === option.value && styles.optionButtonActive]}
      onPress={() => setCategory(option.value)}
    >
      <Ionicons 
        name={option.icon as any} 
        size={20} 
        color={category === option.value ? '#fff' : '#000'} 
      />
      <Text style={[styles.optionText, category === option.value && styles.optionTextActive]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderPriorityOption = (option: typeof priorityOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.priorityButton, 
        priority === option.value && [styles.priorityButtonActive, { borderColor: option.color }]
      ]}
      onPress={() => setPriority(option.value)}
    >
      <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
      <Text style={[styles.priorityText, priority === option.value && styles.priorityTextActive]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim, 
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.titleContainer}>
          <Ionicons name="add-circle" size={32} color="#000" style={styles.titleIcon} />
          <Text style={styles.title}>Report Issue</Text>
        </View>
        <Text style={styles.subtitle}>Help improve your community</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}% complete</Text>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Issue Details</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="create-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="What's the issue? (e.g., Pothole on Main Street)"
                value={title}
                onChangeText={setTitle}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.optionsContainer}>
              {categoryOptions.map(renderCategoryOption)}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map(renderPriorityOption)}
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#666" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Location</Text>
                <Text style={styles.locationText}>{location || 'Getting location...'}</Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.submitContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Animated.View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </Animated.View>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    paddingLeft: 44,
    marginBottom: 16,
  },
  progressContainer: {
    paddingLeft: 44,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    padding: 0,
    minHeight: 24,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  optionButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  optionTextActive: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  priorityButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 3,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});