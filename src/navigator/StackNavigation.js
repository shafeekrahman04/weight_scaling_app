import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/SplashScreen';
import WeightScreen from '../screens/WeightScreen';
import BottomTab from './BottomTab';

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
          component={WeightScreen}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="HomeTab"
          component={BottomTab}
          options={{ headerShown: false }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
