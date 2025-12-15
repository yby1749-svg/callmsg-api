import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    notes: '',
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
      setShowAddForm(false);
      setNewAddress({label: '', address: '', notes: ''});
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    },
  });

  const handleAddressSelect = (address: Address) => {
    setDraft({address});
  };

  const handleAddAddress = () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      Alert.alert('Error', 'Please fill in the label and address');
      return;
    }

    addAddressMutation.mutate({
      label: newAddress.label.trim(),
      address: newAddress.address.trim(),
      notes: newAddress.notes.trim() || undefined,
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
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select Address</Text>
        <Text style={styles.sectionSubtitle}>
          Choose where you'd like the service
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Saved Addresses */}
            {addresses?.map(address => (
              <AddressCard
                key={address.id}
                address={address}
                selected={draft.address?.id === address.id}
                onSelect={() => handleAddressSelect(address)}
              />
            ))}

            {addresses?.length === 0 && !showAddForm && (
              <View style={styles.emptyContainer}>
                <Icon
                  name="location-outline"
                  size={48}
                  color={colors.textLight}
                />
                <Text style={styles.emptyText}>No saved addresses</Text>
                <Text style={styles.emptySubtext}>
                  Add an address to continue with your booking
                </Text>
              </View>
            )}

            {/* Add New Address */}
            {!showAddForm ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.7}>
                <Icon
                  name="add-circle-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>New Address</Text>

                <Text style={styles.inputLabel}>Label</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Office, Hotel"
                  placeholderTextColor={colors.textLight}
                  value={newAddress.label}
                  onChangeText={text =>
                    setNewAddress({...newAddress, label: text})
                  }
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Full address"
                  placeholderTextColor={colors.textLight}
                  value={newAddress.address}
                  onChangeText={text =>
                    setNewAddress({...newAddress, address: text})
                  }
                  multiline
                  numberOfLines={2}
                />

                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Gate code, unit number"
                  placeholderTextColor={colors.textLight}
                  value={newAddress.notes}
                  onChangeText={text =>
                    setNewAddress({...newAddress, notes: text})
                  }
                />

                <View style={styles.formButtons}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      setShowAddForm(false);
                      setNewAddress({label: '', address: '', notes: ''});
                    }}
                    style={styles.formButton}
                  />
                  <Button
                    title="Save"
                    onPress={handleAddAddress}
                    loading={addAddressMutation.isPending}
                    style={styles.formButton}
                  />
                </View>
              </View>
            )}
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  addForm: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  formTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formButton: {
    flex: 1,
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
