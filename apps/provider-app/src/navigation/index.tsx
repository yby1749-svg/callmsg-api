import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {useAuthStore} from '@store';
import {getTokens} from '@api';
import {colors} from '@config/theme';

const RootStack = createNativeStackNavigator();

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function RootNavigator() {
  const {isAuthenticated, loadProfile} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = await getTokens();
        if (tokens?.accessToken) {
          await loadProfile();
        }
      } catch {
        // Token expired or invalid
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadProfile]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export type {
  AuthStackParamList,
  DashboardStackParamList,
  ScheduleStackParamList,
  EarningsStackParamList,
  ProfileStackParamList,
  MainTabParamList,
} from '@types';
