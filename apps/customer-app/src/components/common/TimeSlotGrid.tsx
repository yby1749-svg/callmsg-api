import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {colors, spacing, typography, borderRadius} from '@config/theme';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  loading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onTimeSelect,
  loading = false,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading available times...</Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No available times for this date</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {slots.map(slot => {
        const isSelected = selectedTime === slot.time;
        const isDisabled = !slot.available;

        return (
          <TouchableOpacity
            key={slot.time}
            style={[
              styles.slot,
              isSelected && styles.slotSelected,
              isDisabled && styles.slotDisabled,
            ]}
            onPress={() => !isDisabled && onTimeSelect(slot.time)}
            disabled={isDisabled}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.slotText,
                isSelected && styles.slotTextSelected,
                isDisabled && styles.slotTextDisabled,
              ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  slot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  slotDisabled: {
    backgroundColor: colors.divider,
    borderColor: colors.divider,
  },
  slotText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  slotTextSelected: {
    color: colors.textInverse,
  },
  slotTextDisabled: {
    color: colors.textLight,
  },
});
