import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/SplashScreen';
import BottomTab from './BottomTab';
import LoginScreen from '../screens/LoginScreen';
import DriverType from '../screens/DriverType';
import WeightScaleScreen from '../screens/WeightScaleScreen';

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
          name="DriverType"
          component={DriverType}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTab"
          component={BottomTab}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Weight"
          component={WeightScaleScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
