import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {format} from 'date-fns';
import {colors, typography, spacing, borderRadius, shadows} from '@config/theme';
import {shopOwnerApi, type TherapistActivity} from '@api/shops';

type RouteParams = {
  TherapistActivity: {
    therapistId: string;
    therapistName: string;
  };
};

export function TherapistActivityScreen() {
  const route = useRoute<RouteProp<RouteParams, 'TherapistActivity'>>();
  const {therapistId, therapistName} = route.params;
  const [therapist, setTherapist] = useState<TherapistActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTherapistActivity = async () => {
    try {
      setIsLoading(true);
      const response = await shopOwnerApi.getTherapistActivity(therapistId);
      setTherapist(response.data.data);
    } catch (error) {
      console.error('Failed to fetch therapist activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapistActivity();
  }, [therapistId]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {label: 'Job Accepted', color: colors.info, icon: 'checkmark-circle'};
      case 'PROVIDER_EN_ROUTE':
        return {label: 'On The Way', color: colors.warning, icon: 'car'};
      case 'PROVIDER_ARRIVED':
        return {label: 'Arrived', color: colors.info, icon: 'location'};
      case 'IN_PROGRESS':
        return {label: 'In Service', color: colors.success, icon: 'fitness'};
      case 'COMPLETED':
        return {label: 'Completed', color: colors.textSecondary, icon: 'checkmark-done'};
      default:
        return {label: status, color: colors.textSecondary, icon: 'ellipse'};
    }
  };

  const getOnlineStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return colors.success;
      case 'BUSY':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTherapistActivity} />
        }>
        {/* Therapist Info Card */}
        <View style={styles.card}>
          <View style={styles.therapistHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {therapistName.charAt(0)}
              </Text>
            </View>
            <View style={styles.therapistInfo}>
              <Text style={styles.therapistName}>{therapistName}</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: getOnlineStatusColor(therapist?.onlineStatus || '')},
                  ]}
                />
                <Text style={styles.statusText}>
                  {therapist?.onlineStatus || 'Offline'}
                </Text>
              </View>
            </View>
            <View style={styles.statsBox}>
              <Text style={styles.statsValue}>{therapist?.completedBookings || 0}</Text>
              <Text style={styles.statsLabel}>Jobs</Text>
            </View>
          </View>
        </View>

        {/* Current Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Activity</Text>
        </View>

        {therapist?.activeBooking ? (
          <View style={[styles.card, styles.activeCard]}>
            <View style={styles.activeHeader}>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusInfo(therapist.activeBooking.status).color + '20'},
                ]}>
                <Icon
                  name={getStatusInfo(therapist.activeBooking.status).icon}
                  size={16}
                  color={getStatusInfo(therapist.activeBooking.status).color}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {color: getStatusInfo(therapist.activeBooking.status).color},
                  ]}>
                  {getStatusInfo(therapist.activeBooking.status).label}
                </Text>
              </View>
              <Text style={styles.bookingNumber}>
                #{therapist.activeBooking.bookingNumber}
              </Text>
            </View>

            <View style={styles.bookingDetails}>
              <Text style={styles.serviceName}>
                {therapist.activeBooking.service.name}
              </Text>
              <Text style={styles.customerName}>
                {therapist.activeBooking.customer.firstName}{' '}
                {therapist.activeBooking.customer.lastName}
              </Text>
            </View>

            <View style={styles.bookingMeta}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {format(new Date(therapist.activeBooking.scheduledAt), 'h:mm a')} •{' '}
                  {therapist.activeBooking.duration}min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText} numberOfLines={2}>
                  {therapist.activeBooking.addressText}
                </Text>
              </View>
            </View>

            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Booking Amount</Text>
              <Text style={styles.earningsValue}>
                ₱{therapist.activeBooking.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="cafe-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No Active Job</Text>
            <Text style={styles.emptySubtext}>
              {therapist?.onlineStatus === 'ONLINE'
                ? 'Waiting for booking requests'
                : 'Currently offline'}
            </Text>
          </View>
        )}

        {/* Today's Schedule */}
        {therapist?.todayBookings && therapist.todayBookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <Text style={styles.sectionCount}>{therapist.todayBookings.length} bookings</Text>
            </View>

            {therapist.todayBookings.map(booking => (
              <View key={booking.id} style={styles.scheduleCard}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>
                    {format(new Date(booking.scheduledAt), 'h:mm a')}
                  </Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleService}>{booking.service.name}</Text>
                  <Text style={styles.scheduleCustomer}>
                    {booking.customer.firstName} • {booking.duration}min
                  </Text>
                </View>
                <View
                  style={[
                    styles.scheduleStatus,
                    {backgroundColor: getStatusInfo(booking.status).color + '20'},
                  ]}>
                  <Text
                    style={[
                      styles.scheduleStatusText,
                      {color: getStatusInfo(booking.status).color},
                    ]}>
                    {getStatusInfo(booking.status).label}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: '#fff',
    fontWeight: '600',
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    ...typography.h3,
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
  },
  statsValue: {
    ...typography.h3,
    color: colors.primary,
  },
  statsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusBadgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  bookingNumber: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookingDetails: {
    marginBottom: spacing.md,
  },
  serviceName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  customerName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bookingMeta: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  earningsLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  earningsValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.success,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  scheduleTime: {
    marginRight: spacing.md,
  },
  timeText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleService: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  scheduleCustomer: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scheduleStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  scheduleStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
