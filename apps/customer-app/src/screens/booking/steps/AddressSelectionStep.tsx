import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';

import {userApi} from '@api';
import {Button} from '@components';
import {AddressCard} from '@components/common/AddressCard';
import {colors, spacing, typography, borderRadius} from '@config/theme';
import {useBookingStore} from '@store/bookingStore';
import {useLocationStore} from '@store/locationStore';
import type {Address} from '@types';

export function AddressSelectionStep() {
  const queryClient = useQueryClient();
  const {draft, setDraft, nextStep, prevStep} = useBookingStore();
  const {latitude, longitude} = useLocationStore();

  const [newAddress, setNewAddress] = useState({
    location: '',
    details: '',
  });

  const {data: addresses, isLoading} = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await userApi.getAddresses();
      return response.data.data;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: Omit<Address, 'id' | 'userId' | 'createdAt'>) => {
      const response = await userApi.addAddress(data);
      return response.data.data;
    },
    onSuccess: newAddr => {
      queryClient.invalidateQueries({queryKey: ['addresses']});
      setDraft({address: newAddr});
      setNewAddress({location: '', details: ''});
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    },
  });

  const handleAddressSelect = (address: Address) => {
    setDraft({address});
  };

  const handleAddAddress = () => {
    if (!newAddress.location.trim()) {
      Alert.alert('Error', 'Please enter the location');
      return;
    }

    addAddressMutation.mutate({
      label: newAddress.location.trim(),
      address: newAddress.location.trim(),
      notes: newAddress.details.trim() || undefined,
      latitude: latitude || 14.5995, // Default to Manila if no location
      longitude: longitude || 120.9842,
      isDefault: !addresses || addresses.length === 0,
    });
  };

  const canContinue = !!draft.address;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Where should we come?</Text>
        <Text style={styles.sectionSubtitle}>
          Enter your hotel, condo, or home location
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Saved Addresses */}
            {addresses && addresses.length > 0 && (
              <View style={styles.savedSection}>
                <Text style={styles.savedTitle}>Recent Locations</Text>
                {addresses.map(address => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    selected={draft.address?.id === address.id}
                    onSelect={() => handleAddressSelect(address)}
                  />
                ))}
              </View>
            )}

            {/* Add New Address - Always visible */}
            <View style={styles.addForm}>
              <View style={styles.formHeader}>
                <Icon name="location" size={20} color={colors.primary} />
                <Text style={styles.formTitle}>New Location</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Hotel/Building name (e.g., City of Dreams, Makati Shangri-La)"
                placeholderTextColor={colors.textLight}
                value={newAddress.location}
                onChangeText={text =>
                  setNewAddress({...newAddress, location: text})
                }
              />

              <TextInput
                style={[styles.input, styles.inputDetails]}
                placeholder="Room number, registered name, landmarks (optional)"
                placeholderTextColor={colors.textLight}
                value={newAddress.details}
                onChangeText={text =>
                  setNewAddress({...newAddress, details: text})
                }
                multiline
                numberOfLines={2}
              />

              <Text style={styles.hint}>
                Provider will message you if they need more details
              </Text>

              <Button
                title="Use This Location"
                onPress={handleAddAddress}
                loading={addAddressMutation.isPending}
                disabled={!newAddress.location.trim()}
                style={styles.saveButton}
              />
            </View>
          </>
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
  scrollContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  savedSection: {
    marginBottom: spacing.lg,
  },
  savedTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  addForm: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputDetails: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.xs,
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
