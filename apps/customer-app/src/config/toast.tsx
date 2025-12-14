import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from './theme';

interface ToastProps {
  text1?: string;
  text2?: string;
}

const BaseToast: React.FC<
  ToastProps & {bgColor: string; borderColor: string}
> = ({text1, text2, bgColor, borderColor}) => (
  <View
    style={[
      styles.container,
      {backgroundColor: bgColor, borderLeftColor: borderColor},
    ]}>
    {text1 && <Text style={styles.title}>{text1}</Text>}
    {text2 && <Text style={styles.message}>{text2}</Text>}
  </View>
);

export const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast {...props} bgColor="#ECFDF5" borderColor={colors.success} />
  ),
  error: (props: ToastProps) => (
    <BaseToast {...props} bgColor="#FEF2F2" borderColor={colors.error} />
  ),
  info: (props: ToastProps) => (
    <BaseToast {...props} bgColor="#EFF6FF" borderColor={colors.info} />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
