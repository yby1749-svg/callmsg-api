import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '@config/theme';
import type {
  ShopOwnerTabParamList,
  ShopDashboardStackParamList,
  ShopTherapistsStackParamList,
  ShopEarningsStackParamList,
  ShopProfileStackParamList,
} from '@types';

// Import screens
import {ShopDashboardScreen} from '../screens/shop-owner/ShopDashboardScreen';
import {ShopTherapistsScreen} from '../screens/shop-owner/ShopTherapistsScreen';
import {ShopEarningsScreen} from '../screens/shop-owner/ShopEarningsScreen';
import {ShopPayoutRequestScreen} from '../screens/shop-owner/ShopPayoutRequestScreen';
import {ShopWalletScreen} from '../screens/shop-owner/ShopWalletScreen';
import {ShopProfileScreen} from '../screens/shop-owner/ShopProfileScreen';
import {EditShopProfileScreen} from '../screens/shop-owner/EditShopProfileScreen';
import {BankInformationScreen} from '../screens/shop-owner/BankInformationScreen';
import {SendInvitationScreen} from '../screens/shop-owner/SendInvitationScreen';
import {TherapistMapScreen} from '../screens/shop-owner/TherapistMapScreen';
import {TherapistActivityScreen} from '../screens/shop-owner/TherapistActivityScreen';
import {NotificationsScreen} from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator<ShopOwnerTabParamList>();
const DashboardStack = createNativeStackNavigator<ShopDashboardStackParamList>();
const TherapistsStack = createNativeStackNavigator<ShopTherapistsStackParamList>();
const EarningsStack = createNativeStackNavigator<ShopEarningsStackParamList>();
const ProfileStack = createNativeStackNavigator<ShopProfileStackParamList>();

// Stack Navigators
function ShopDashboardNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
      }}>
      <DashboardStack.Screen
        name="ShopDashboard"
        component={ShopDashboardScreen}
        options={{headerShown: false}}
      />
      <DashboardStack.Screen
        name="TherapistMap"
        component={TherapistMapScreen}
        options={{title: 'Therapist Locations'}}
      />
      <DashboardStack.Screen
        name="TherapistActivity"
        component={TherapistActivityScreen}
        options={{title: 'Therapist Activity'}}
      />
    </DashboardStack.Navigator>
  );
}

function ShopTherapistsNavigator() {
  return (
    <TherapistsStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
      }}>
      <TherapistsStack.Screen
        name="ShopTherapists"
        component={ShopTherapistsScreen}
        options={{title: 'Therapists'}}
      />
      <TherapistsStack.Screen
        name="SendInvitation"
        component={SendInvitationScreen}
        options={{title: 'Invite Therapist'}}
      />
    </TherapistsStack.Navigator>
  );
}

function ShopEarningsNavigator() {
  return (
    <EarningsStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
      }}>
      <EarningsStack.Screen
        name="ShopEarnings"
        component={ShopEarningsScreen}
        options={{title: 'Earnings'}}
      />
      <EarningsStack.Screen
        name="ShopWallet"
        component={ShopWalletScreen}
        options={{title: 'Shop Wallet'}}
      />
      <EarningsStack.Screen
        name="ShopPayoutRequest"
        component={ShopPayoutRequestScreen}
        options={{title: 'Request Payout'}}
      />
    </EarningsStack.Navigator>
  );
}

function ShopProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
      }}>
      <ProfileStack.Screen
        name="ShopProfile"
        component={ShopProfileScreen}
        options={{title: 'Profile'}}
      />
      <ProfileStack.Screen
        name="EditShopProfile"
        component={EditShopProfileScreen}
        options={{title: 'Edit Shop Profile'}}
      />
      <ProfileStack.Screen
        name="BankInformation"
        component={BankInformationScreen}
        options={{title: 'Bank Information'}}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Notifications'}}
      />
    </ProfileStack.Navigator>
  );
}

export function ShopOwnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'ShopDashboardTab':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'ShopTherapistsTab':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'ShopEarningsTab':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'ShopProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="ShopDashboardTab"
        component={ShopDashboardNavigator}
        options={{tabBarLabel: 'Dashboard'}}
      />
      <Tab.Screen
        name="ShopTherapistsTab"
        component={ShopTherapistsNavigator}
        options={{tabBarLabel: 'Therapists'}}
      />
      <Tab.Screen
        name="ShopEarningsTab"
        component={ShopEarningsNavigator}
        options={{tabBarLabel: 'Earnings'}}
      />
      <Tab.Screen
        name="ShopProfileTab"
        component={ShopProfileNavigator}
        options={{tabBarLabel: 'Profile'}}
        listeners={({navigation}) => ({
          tabPress: () => {
            navigation.navigate('ShopProfileTab', {screen: 'ShopProfile'});
          },
        })}
      />
    </Tab.Navigator>
  );
}
