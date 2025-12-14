import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {JobDashboardScreen} from '@screens/dashboard/JobDashboardScreen';
import {JobDetailScreen} from '@screens/dashboard/JobDetailScreen';
import type {DashboardStackParamList} from '@types';
import {colors} from '@config/theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="JobDashboard"
        component={JobDashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{title: 'Job Details'}}
      />
    </Stack.Navigator>
  );
}
