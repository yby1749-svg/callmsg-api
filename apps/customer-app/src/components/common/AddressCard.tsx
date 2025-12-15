import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '@config/theme';
import type {Address} from '@types';

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}

export function AddressCard({address, selected, onSelect}: AddressCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon
          name={address.label.toLowerCase() === 'home' ? 'home' : 'location'}
          size={24}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.label}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.address} numberOfLines={2}>
          {address.address}
        </Text>
        {address.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {address.notes}
          </Text>
        )}
      </View>
      <View style={styles.checkContainer}>
        {selected && (
          <Icon name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notes: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  checkContainer: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
});
