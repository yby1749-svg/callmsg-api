import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useMutation} from '@tanstack/react-query';

import {userApi} from '@api';
import {Button, Input} from '@components';
import {useAuthStore, useUIStore} from '@store';
import {colors, spacing} from '@config/theme';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EditProfileScreen() {
  const {user, updateUser} = useAuthStore();
  const {showSuccess, showError} = useUIStore();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      emergencyName: user?.emergencyName || '',
      emergencyPhone: user?.emergencyPhone || '',
      emergencyRelation: user?.emergencyRelation || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await userApi.updateMe(data);
      return response.data.data;
    },
    onSuccess: data => {
      updateUser(data);
      showSuccess(
        'Profile Updated',
        'Your profile has been updated successfully',
      );
    },
    onError: () => {
      showError('Update Failed', 'Unable to update profile');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Controller
            control={control}
            name="firstName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="First Name"
                placeholder="John"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Last Name"
                placeholder="Doe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Phone Number"
                placeholder="+63 9XX XXX XXXX"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Controller
            control={control}
            name="emergencyName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Emergency Contact Name"
                placeholder="Jane Doe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.emergencyName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="emergencyPhone"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Emergency Contact Phone"
                placeholder="+63 9XX XXX XXXX"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.emergencyPhone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="emergencyRelation"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Relationship"
                placeholder="Spouse, Parent, etc."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.emergencyRelation?.message}
              />
            )}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={mutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: spacing.md,
  },
});
