import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {providersApi} from '@api';
import {Button} from '@components';
import {DateSelector} from '@components/common/DateSelector';
import {TimeSlotGrid} from '@components/common/TimeSlotGrid';
import {colors, spacing, typography} from '@config/theme';
import {useBookingStore} from '@store/bookingStore';

interface DateTimeSelectionStepProps {
  providerId: string;
}

export function DateTimeSelectionStep({
  providerId,
}: DateTimeSelectionStepProps) {
  const {draft, setDraft, nextStep, prevStep} = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    draft.scheduledDate || null,
  );

  const {data: availability, isLoading} = useQuery({
    queryKey: ['providerAvailability', providerId, selectedDate],
    queryFn: async () => {
      const response = await providersApi.getProviderAvailability(
        providerId,
        selectedDate!,
      );
      return response.data.data;
    },
    enabled: !!selectedDate,
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setDraft({scheduledDate: date, scheduledTime: undefined});
  };

  const handleTimeSelect = (time: string) => {
    setDraft({scheduledTime: time});
  };

  const canContinue = draft.scheduledDate && draft.scheduledTime;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Select a Date</Text>
        <DateSelector
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          daysToShow={14}
        />

        {/* Time Selection */}
        {selectedDate && (
          <>
            <Text style={[styles.sectionTitle, styles.sectionMargin]}>
              Select a Time
            </Text>
            <TimeSlotGrid
              slots={availability?.slots || []}
              selectedTime={draft.scheduledTime || null}
              onTimeSelect={handleTimeSelect}
              loading={isLoading}
            />
          </>
        )}

        {!selectedDate && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Please select a date to see available times
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            title="Back"
            variant="outline"
            onPress={prevStep}
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={nextStep}
            disabled={!canContinue}
            style={styles.continueButton}
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
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionMargin: {
    marginTop: spacing.xl,
  },
  hintContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  hintText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  continueButton: {
    flex: 2,
  },
});
