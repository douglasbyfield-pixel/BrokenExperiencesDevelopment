import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withTabBar?: boolean;
}

export default function ScreenWrapper({ 
  children, 
  style, 
  withTabBar = true 
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  
  // Calculate padding for tab bar
  const tabBarHeight = withTabBar ? 60 + Math.max(insets.bottom - 5, 0) : 0;
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View 
        style={[
          { 
            flex: 1,
            paddingBottom: withTabBar ? tabBarHeight : 0
          }, 
          style
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}