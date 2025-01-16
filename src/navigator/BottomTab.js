import {StyleSheet} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WeightScaleScreen from '../screens/WeightScaleScreen';
import DriverType from '../screens/DriverType';

export default function BottomTab() {
  const TabNav = createBottomTabNavigator();
  return (
    <TabNav.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0163d2',
        tabBarInactiveTintColor: 'grey',
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 16,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <TabNav.Screen
        name="Home"
        component={DriverType}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={21}
              color={focused ? '#0163d2' : 'grey'}
            />
          ),
        }}
      />
      <TabNav.Screen
        name="Connect"
        component={WeightScaleScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={21}
              color={focused ? '#0163d2' : 'grey'}
            />
          ),
        }}
      />
    </TabNav.Navigator>
  );
}

const styles = StyleSheet.create({});
