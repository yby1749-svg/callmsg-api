import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import {format} from 'date-fns';
import Toast from 'react-native-toast-message';

import {Button, Card} from '@components';
import {bookingsApi} from '@api';
import {useJobStore} from '@store';
import {colors, typography, spacing, borderRadius} from '@config/theme';
import type {DashboardStackParamList, BookingStatus} from '@types';

type RouteProps = RouteProp<DashboardStackParamList, 'JobDetail'>;

const STATUS_FLOW: BookingStatus[] = [
  'CONFIRMED',
  'PROVIDER_EN_ROUTE',
  'PROVIDER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

export function JobDetailScreen() {
  const route = useRoute<RouteProps>();
  const {bookingId} = route.params;
  const {updateJobStatus, isLoading: isUpdating} = useJobStore();
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const {data: booking, refetch} = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await bookingsApi.getBooking(bookingId);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (booking) {
      const index = STATUS_FLOW.indexOf(booking.status);
      if (index >= 0) {
        setCurrentStatusIndex(index);
      }
    }
  }, [booking]);

  const getNextStatus = (): BookingStatus | null => {
    if (currentStatusIndex < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[currentStatusIndex + 1];
    }
    return null;
  };

  const getNextStatusLabel = (): string => {
    const nextStatus = getNextStatus();
    switch (nextStatus) {
      case 'PROVIDER_EN_ROUTE':
        return 'Start Navigation';
      case 'PROVIDER_ARRIVED':
        return 'I Have Arrived';
      case 'IN_PROGRESS':
        return 'Start Service';
      case 'COMPLETED':
        return 'Complete Service';
      default:
        return '';
    }
  };

  const handleUpdateStatus = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) {
      return;
    }

    if (nextStatus === 'COMPLETED') {
      Alert.alert(
        'Complete Service',
        'Are you sure you want to mark this service as completed?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Complete',
            onPress: async () => {
              try {
                await updateJobStatus(bookingId, nextStatus);
                refetch();
                Toast.show({
                  type: 'success',
                  text1: 'Service Completed',
                  text2: 'Great job!',
                });
              } catch {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to update status',
                });
              }
            },
          },
        ],
      );
    } else {
      try {
        await updateJobStatus(bookingId, nextStatus);
        refetch();
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update status',
        });
      }
    }
  };

  const openMaps = () => {
    if (!booking?.address) {
      return;
    }
    const {latitude, longitude} = booking.address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const callCustomer = () => {
    if (booking?.customer?.phone) {
      Linking.openURL(`tel:${booking.customer.phone}`);
    }
  };

  if (!booking) {
    return null;
  }

  const isCompleted = booking.status === 'COMPLETED';

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : undefined,
            ]}>
            <Text
              style={[
                styles.statusText,
                isCompleted ? styles.completedText : undefined,
              ]}>
              {booking.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {/* Service Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{booking.service?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{booking.duration} minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Scheduled</Text>
            <Text style={styles.value}>
              {format(new Date(booking.scheduledAt), 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Price</Text>
            <Text style={[styles.value, styles.price]}>P{booking.price}</Text>
          </View>
          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.notes}>{booking.notes}</Text>
            </View>
          )}
        </Card>

        {/* Customer Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color={colors.textLight} />
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>
                {booking.customer?.firstName} {booking.customer?.lastName}
              </Text>
              {booking.customer?.phone && booking.status !== 'PENDING' && (
                <Text style={styles.customerPhone}>
                  {booking.customer.phone}
                </Text>
              )}
            </View>
            {booking.customer?.phone && booking.status !== 'PENDING' && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={callCustomer}>
                <Icon name="call" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.section}>
          <View style={styles.addressHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity onPress={openMaps}>
              <Text style={styles.navigateText}>Navigate</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressContent}>
            <Icon name="location" size={20} color={colors.primary} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressStreet}>
                {booking.address?.street}
              </Text>
              <Text style={styles.addressCity}>
                {booking.address?.city}, {booking.address?.province}
              </Text>
              {booking.address?.notes && (
                <Text style={styles.addressNotes}>
                  Note: {booking.address.notes}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Status Progress */}
        {!isCompleted && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressContainer}>
              {STATUS_FLOW.slice(1).map((status, index) => {
                const isActive = index <= currentStatusIndex - 1;
                const isCurrent = index === currentStatusIndex - 1;
                return (
                  <View key={status} style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        isActive ? styles.progressDotActive : undefined,
                        isCurrent ? styles.progressDotCurrent : undefined,
                      ]}
                    />
                    <Text
                      style={[
                        styles.progressLabel,
                        isActive ? styles.progressLabelActive : undefined,
                      ]}>
                      {status.replace(/PROVIDER_|_/g, ' ').trim()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Action Button */}
      {!isCompleted && getNextStatus() && (
        <View style={styles.footer}>
          <Button
            title={getNextStatusLabel()}
            onPress={handleUpdateStatus}
            loading={isUpdating}
            variant={getNextStatus() === 'COMPLETED' ? 'success' : 'primary'}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  completedText: {
    color: colors.success,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  price: {
    color: colors.success,
    fontWeight: '700',
  },
  notesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  notes: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  customerPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navigateText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  addressContent: {
    flexDirection: 'row',
  },
  addressDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  addressStreet: {
    ...typography.body,
    color: colors.text,
  },
  addressCity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addressNotes: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  progressDotActive: {
    backgroundColor: colors.success,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
