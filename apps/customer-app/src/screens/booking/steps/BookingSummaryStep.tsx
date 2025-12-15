import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import {format, parseISO} from 'date-fns';

import {bookingsApi} from '@api';
import {Button} from '@components';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '@config/theme';
import {useBookingStore} from '@store/bookingStore';
import type {BookingsStackParamList} from '@navigation';

type NavigationProps = NativeStackNavigationProp<BookingsStackParamList>;

export function BookingSummaryStep() {
  const navigation = useNavigation<NavigationProps>();
  const {draft, setDraft, prevStep, clearDraft, calculatePrice} =
    useBookingStore();
  const [notes, setNotes] = useState(draft.notes || '');

  const price = calculatePrice();

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (
        !draft.provider ||
        !draft.service ||
        !draft.duration ||
        !draft.scheduledDate ||
        !draft.scheduledTime ||
        !draft.address
      ) {
        throw new Error('Missing booking information');
      }

      const response = await bookingsApi.createBooking({
        providerId: draft.provider.id,
        serviceId: draft.service.id,
        duration: draft.duration,
        scheduledDate: draft.scheduledDate,
        scheduledTime: draft.scheduledTime,
        address: draft.address.address,
        latitude: draft.address.latitude,
        longitude: draft.address.longitude,
        notes: notes.trim() || undefined,
      });

      return response.data.data;
    },
    onSuccess: booking => {
      clearDraft();
      Alert.alert(
        'Booking Confirmed!',
        'Your booking has been submitted successfully.',
        [
          {
            text: 'View Booking',
            onPress: () => {
              // Navigate to BookingDetail in the Bookings tab
              navigation.getParent()?.navigate('BookingsTab', {
                screen: 'BookingDetail',
                params: {bookingId: booking.id},
              });
            },
          },
        ],
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        'Failed to create booking. Please try again.';
      Alert.alert('Booking Failed', message);
    },
  });

  const handleConfirm = () => {
    setDraft({notes: notes.trim()});
    createBookingMutation.mutate();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (!draft.provider || !draft.service || !draft.address) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Missing booking information</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Review Your Booking</Text>

        {/* Provider Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Provider</Text>
          </View>
          <Text style={styles.cardValue}>{draft.provider.displayName}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>
              {draft.provider.rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Service Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Service</Text>
          </View>
          <Text style={styles.cardValue}>{draft.service.name}</Text>
          <Text style={styles.cardSubvalue}>{draft.duration} minutes</Text>
        </View>

        {/* Schedule Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Schedule</Text>
          </View>
          <Text style={styles.cardValue}>
            {draft.scheduledDate && formatDate(draft.scheduledDate)}
          </Text>
          <Text style={styles.cardSubvalue}>{draft.scheduledTime}</Text>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Location</Text>
          </View>
          <Text style={styles.cardValue}>{draft.address.label}</Text>
          <Text style={styles.cardSubvalue}>{draft.address.address}</Text>
        </View>

        {/* Notes Input */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes for Provider (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requests or instructions..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.notesCount}>{notes.length}/500</Text>
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Service ({draft.duration} min)
            </Text>
            <Text style={styles.priceValue}>₱{price.toLocaleString()}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{price.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            title="Back"
            variant="outline"
            onPress={prevStep}
            style={styles.backButton}
            disabled={createBookingMutation.isPending}
          />
          <Button
            title="Confirm Booking"
            onPress={handleConfirm}
            loading={createBookingMutation.isPending}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  cardValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubvalue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  notesSection: {
    marginTop: spacing.md,
  },
  notesLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesCount: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  priceCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  priceValue: {
    ...typography.body,
    color: colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});
