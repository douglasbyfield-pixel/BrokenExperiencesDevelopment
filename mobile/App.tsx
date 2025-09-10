import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import PoppinsRegular from './assets/fonts/Poppins-Regular.ttf';
import PoppinsMedium from './assets/fonts/Poppins-Medium.ttf';
import PoppinsBold from './assets/fonts/Poppins-Bold.ttf';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': PoppinsRegular,
    'Poppins-Medium': PoppinsMedium,
    'Poppins-Bold': PoppinsBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
