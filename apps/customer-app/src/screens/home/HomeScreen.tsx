import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';

import {servicesApi, providersApi} from '@api';
import {useAuthStore, useLocationStore} from '@store';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '@config/theme';
import type {HomeStackParamList} from '@navigation';
import type {Service, Provider} from '@types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {user} = useAuthStore();
  const {requestPermission, getCurrentLocation, latitude, longitude} =
    useLocationStore();

  useEffect(() => {
    const initLocation = async () => {
      await requestPermission();
      await getCurrentLocation();
    };
    initLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: services,
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await servicesApi.getServices();
      return response.data.data;
    },
  });

  const {
    data: featuredProviders,
    isLoading: providersLoading,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ['featuredProviders', latitude, longitude],
    queryFn: async () => {
      const response = await providersApi.getProviders({
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        limit: 5,
      });
      return response.data.data;
    },
    enabled: true,
  });

  const isLoading = servicesLoading || providersLoading;

  const onRefresh = async () => {
    await Promise.all([refetchServices(), refetchProviders()]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.firstName || 'there'}!
            </Text>
            <Text style={styles.subtitle}>Book a massage today</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ProviderList', {})}>
          <Icon name="search-outline" size={20} color={colors.textLight} />
          <Text style={styles.searchPlaceholder}>Search providers...</Text>
        </TouchableOpacity>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {services?.map((service: Service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() =>
                  navigation.navigate('ProviderList', {serviceId: service.id})
                }>
                <View style={styles.serviceIcon}>
                  <Icon
                    name="hand-left-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  From ₱{service.basePrice60}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Providers</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProviderList', {})}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredProviders?.map((provider: Provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() =>
                navigation.navigate('ProviderDetail', {providerId: provider.id})
              }>
              <View style={styles.providerAvatar}>
                <Icon name="person" size={32} color={colors.textLight} />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.displayName}</Text>
                <View style={styles.providerMeta}>
                  <Icon name="star" size={14} color={colors.warning} />
                  <Text style={styles.providerRating}>
                    {provider.rating.toFixed(1)}
                  </Text>
                  <Text style={styles.providerReviews}>
                    ({provider.totalReviews} reviews)
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textLight,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  serviceCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    width: 120,
    ...shadows.sm,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  servicePrice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  providerName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  providerRating: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  providerReviews: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
