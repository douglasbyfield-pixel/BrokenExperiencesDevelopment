import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#f0f8ff',
          padding: 20 
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 24, marginBottom: 10 }}>🇯🇲</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              BrokenExp PWA
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              Something went wrong. Please refresh the page.
            </Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 10 }}>
              Error: {this.state.error?.message}
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}