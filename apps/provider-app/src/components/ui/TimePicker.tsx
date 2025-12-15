import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '@config/theme';

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
  label?: string;
}

const HOURS = Array.from({length: 24}, (_, i) =>
  i.toString().padStart(2, '0'),
);

const MINUTES = ['00', '15', '30', '45'];

export function TimePicker({value, onChange, label}: TimePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value.split(':')[0] || '09');
  const [selectedMinute, setSelectedMinute] = useState(
    value.split(':')[1] || '00',
  );

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setSelectedHour(value.split(':')[0] || '09');
    setSelectedMinute(value.split(':')[1] || '00');
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}>
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Time</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Hour</Text>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}>
                  {HOURS.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Minute</Text>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}>
                  {MINUTES.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute &&
                            styles.pickerItemTextSelected,
                        ]}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  valueContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: 70,
  },
  valueText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 300,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  columnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  pickerItemText: {
    ...typography.body,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  separator: {
    ...typography.h2,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
