import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Issue } from '../data/mockData';


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

  useEffect(() => {
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

  const calculateProgress = () => {
    let progress = 0;
    if (title.trim()) progress += 0.25;
    if (description.trim()) progress += 0.25;
    if (category) progress += 0.25;
    if (priority) progress += 0.25;
    return progress;
  };

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
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="add-circle" size={24} color="#000" style={styles.titleIcon} />
          <Text style={styles.title}>Report Issue</Text>
        </View>
        <Text style={styles.subtitle}>Help improve your community</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.round(progress * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}% complete</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
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

          <View style={styles.submitContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    paddingLeft: 36,
    marginBottom: 16,
  },
  progressContainer: {
    paddingLeft: 36,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionButtonActive: {
    backgroundColor: '#000',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priorityButtonActive: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000',
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
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
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
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});