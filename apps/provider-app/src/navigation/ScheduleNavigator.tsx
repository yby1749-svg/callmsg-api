import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CalendarScreen} from '@screens/schedule/CalendarScreen';
import {AvailabilityScreen} from '@screens/schedule/AvailabilityScreen';
import type {ScheduleStackParamList} from '@types';
import {colors} from '@config/theme';

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export function ScheduleNavigator() {
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
        name="Calendar"
        component={CalendarScreen}
        options={{title: 'My Schedule'}}
      />
      <Stack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{title: 'Set Availability'}}
      />
    </Stack.Navigator>
  );
}
