import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import {format, startOfWeek, addDays, isSameDay} from 'date-fns';

import {Card} from '@components';
import {bookingsApi} from '@api';
import {colors, typography, spacing, borderRadius} from '@config/theme';
import type {ScheduleStackParamList, Booking, BookingStatus} from '@types';

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'Calendar'
>;

const getStatusStyle = (status: BookingStatus) => {
  const statusStyles: Record<BookingStatus, {backgroundColor: string}> = {
    PENDING: {backgroundColor: colors.warning + '20'},
    CONFIRMED: {backgroundColor: colors.info + '20'},
    PROVIDER_ASSIGNED: {backgroundColor: colors.primary + '20'},
    PROVIDER_EN_ROUTE: {backgroundColor: colors.primary + '20'},
    PROVIDER_ARRIVED: {backgroundColor: colors.primary + '20'},
    IN_PROGRESS: {backgroundColor: colors.success + '20'},
    COMPLETED: {backgroundColor: colors.success + '20'},
    CANCELLED: {backgroundColor: colors.error + '20'},
  };
  return statusStyles[status] || {backgroundColor: colors.surface};
};

export function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['providerBookings'],
    queryFn: async () => {
      const response = await bookingsApi.getBookings({limit: 50});
      return response.data.data;
    },
  });

  const weekStart = startOfWeek(new Date(), {weekStartsOn: 1});
  const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));

  const selectedDayBookings =
    bookings?.filter((booking: Booking) =>
      isSameDay(new Date(booking.scheduledAt), selectedDate),
    ) || [];

  const getBookingsForDay = (date: Date) => {
    return (
      bookings?.filter((booking: Booking) =>
        isSameDay(new Date(booking.scheduledAt), date),
      ).length || 0
    );
  };

  return (
    <View style={styles.container}>
      {/* Week Calendar */}
      <View style={styles.weekCalendar}>
        {weekDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const bookingCount = getBookingsForDay(day);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayButton,
                isSelected ? styles.selectedDay : undefined,
              ]}
              onPress={() => setSelectedDate(day)}>
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.selectedDayText : undefined,
                ]}>
                {format(day, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.selectedDayText : undefined,
                ]}>
                {format(day, 'd')}
              </Text>
              {bookingCount > 0 && (
                <View style={styles.bookingDot}>
                  <Text style={styles.bookingDotText}>{bookingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Availability Button */}
      <TouchableOpacity
        style={styles.availabilityButton}
        onPress={() => navigation.navigate('Availability')}>
        <Icon name="settings-outline" size={20} color={colors.primary} />
        <Text style={styles.availabilityText}>Set Availability</Text>
        <Icon name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }>
        <Text style={styles.dateTitle}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </Text>

        {selectedDayBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No bookings on this day</Text>
          </View>
        ) : (
          selectedDayBookings.map((booking: Booking) => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.timeContainer}>
                <Text style={styles.time}>
                  {format(new Date(booking.scheduledAt), 'h:mm a')}
                </Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{booking.duration}min</Text>
                </View>
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.serviceName}>{booking.service?.name}</Text>
                <Text style={styles.customerName}>
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </Text>
                <Text style={styles.address}>{booking.address?.city}</Text>
              </View>
              <View
                style={[styles.statusBadge, getStatusStyle(booking.status)]}>
                <Text style={styles.statusText}>
                  {booking.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dayButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 44,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayNumber: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  selectedDayText: {
    color: colors.textInverse,
  },
  bookingDot: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  bookingDotText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  availabilityText: {
    ...typography.body,
    color: colors.primary,
    flex: 1,
  },
  bookingsList: {
    flex: 1,
    padding: spacing.md,
  },
  dateTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  time: {
    ...typography.h3,
    color: colors.primary,
  },
  durationBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookingInfo: {
    marginBottom: spacing.sm,
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
  address: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
