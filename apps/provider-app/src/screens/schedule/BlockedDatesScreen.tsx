import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import {format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay} from 'date-fns';
import Toast from 'react-native-toast-message';

import {Button, Card} from '@components';
import {blockedDatesApi, BlockedDate} from '@api';
import {colors, typography, spacing, borderRadius, shadows} from '@config/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BlockedDatesScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {data: blockedDates, isLoading} = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      const response = await blockedDatesApi.getBlockedDates();
      return response.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: {date: string; reason?: string}) => {
      await blockedDatesApi.addBlockedDate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['blocked-dates']});
      Toast.show({
        type: 'success',
        text1: 'Date Blocked',
        text2: 'The date has been added to your blocked dates',
      });
      setModalVisible(false);
      setSelectedDate(null);
      setReason('');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to block date',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (blockedDateId: string) => {
      await blockedDatesApi.removeBlockedDate(blockedDateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['blocked-dates']});
      Toast.show({
        type: 'success',
        text1: 'Date Unblocked',
        text2: 'The date has been removed from your blocked dates',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove blocked date',
      });
    },
  });

  const handleAddBlockedDate = () => {
    if (!selectedDate) return;
    addMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      reason: reason || undefined,
    });
  };

  const handleRemoveBlockedDate = (blockedDate: BlockedDate) => {
    Alert.alert(
      'Remove Blocked Date',
      `Are you sure you want to unblock ${format(new Date(blockedDate.date), 'MMM d, yyyy')}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMutation.mutate(blockedDate.id),
        },
      ],
    );
  };

  const isDateBlocked = useCallback(
    (date: Date) => {
      if (!blockedDates) return false;
      return blockedDates.some(bd =>
        isSameDay(new Date(bd.date), date),
      );
    },
    [blockedDates],
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({start, end});

    // Pad the beginning with empty days
    const firstDayOfWeek = start.getDay();
    const paddedDays: (Date | null)[] = Array(firstDayOfWeek).fill(null);
    return [...paddedDays, ...days];
  };

  const handleDayPress = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    if (isDateBlocked(date)) return;
    setSelectedDate(date);
    setModalVisible(true);
  };

  const renderDay = ({item: date}: {item: Date | null}) => {
    if (!date) {
      return <View style={styles.dayCell} />;
    }

    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isBlocked = isDateBlocked(date);
    const isPast = isBefore(date, startOfDay(new Date()));
    const isTodayDate = isToday(date);
    const isDisabled = isPast || isBlocked;

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          isTodayDate && styles.todayCell,
          isBlocked && styles.blockedCell,
          isPast && styles.pastCell,
        ]}
        onPress={() => handleDayPress(date)}
        disabled={isDisabled}>
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.otherMonthText,
            isTodayDate && styles.todayText,
            isBlocked && styles.blockedText,
            isPast && styles.pastText,
          ]}>
          {format(date, 'd')}
        </Text>
        {isBlocked && (
          <View style={styles.blockedIndicator}>
            <Icon name="close-circle" size={12} color={colors.error} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBlockedDate = ({item}: {item: BlockedDate}) => (
    <Card style={styles.blockedDateCard}>
      <View style={styles.blockedDateContent}>
        <View>
          <Text style={styles.blockedDateText}>
            {format(new Date(item.date), 'EEEE, MMM d, yyyy')}
          </Text>
          {item.reason && (
            <Text style={styles.blockedDateReason}>{item.reason}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveBlockedDate(item)}>
          <Icon name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Select a date to block</Text>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Icon name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Icon name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map(day => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <FlatList
          data={getDaysInMonth()}
          renderItem={renderDay}
          keyExtractor={(item, index) =>
            item ? format(item, 'yyyy-MM-dd') : `empty-${index}`
          }
          numColumns={7}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.blockedSection}>
        <Text style={styles.sectionTitle}>Blocked Dates</Text>
        {blockedDates && blockedDates.length > 0 ? (
          <FlatList
            data={blockedDates}
            renderItem={renderBlockedDate}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.blockedList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No blocked dates</Text>
            <Text style={styles.emptySubtext}>
              Tap on a date above to block it
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Block Date</Text>
            {selectedDate && (
              <Text style={styles.selectedDateText}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            )}

            <TextInput
              style={styles.reasonInput}
              placeholder="Reason (optional)"
              placeholderTextColor={colors.textLight}
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Block Date"
                onPress={handleAddBlockedDate}
                loading={addMutation.isPending}
                style={styles.modalButton}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarSection: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: borderRadius.md,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  blockedCell: {
    backgroundColor: colors.error + '20',
  },
  pastCell: {
    opacity: 0.4,
  },
  dayText: {
    ...typography.body,
    color: colors.text,
  },
  otherMonthText: {
    color: colors.textLight,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  blockedText: {
    color: colors.error,
    fontWeight: '600',
  },
  pastText: {
    color: colors.textLight,
  },
  blockedIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  blockedSection: {
    flex: 1,
    padding: spacing.lg,
  },
  blockedList: {
    gap: spacing.sm,
  },
  blockedDateCard: {
    marginBottom: spacing.sm,
  },
  blockedDateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockedDateText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  blockedDateReason: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  removeButton: {
    padding: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 350,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  selectedDateText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
