import { StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import BottomTab from './BottomTab';
import OnBoarding from '../screens/OnBoarding';

const Stack = createStackNavigator();

export default function StackNavigation() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <SplashScreen />; 
  }
 
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Onboarding'>
        <Stack.Screen
          name="Onboarding"
          component={OnBoarding}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTab"
          component={BottomTab}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
