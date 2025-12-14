import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import {Button, Input, Card} from '@components';
import {useEarningsStore} from '@store';
import {colors, typography, spacing, borderRadius} from '@config/theme';
import {MIN_PAYOUT_AMOUNT} from '@config/constants';

type PayoutMethod = 'bank_transfer' | 'gcash' | 'paymaya';

const payoutSchema = z.object({
  amount: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= MIN_PAYOUT_AMOUNT;
  }, `Minimum payout amount is P${MIN_PAYOUT_AMOUNT}`),
  accountNumber: z.string().min(8, 'Account number is required'),
  accountName: z.string().min(2, 'Account name is required'),
  bankName: z.string().optional(),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

export function PayoutRequestScreen() {
  const navigation = useNavigation();
  const {summary, requestPayout, isLoading} = useEarningsStore();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>('gcash');

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      amount: '',
      accountNumber: '',
      accountName: '',
      bankName: '',
    },
  });

  const paymentMethods = [
    {id: 'gcash' as const, name: 'GCash', icon: 'phone-portrait-outline'},
    {id: 'paymaya' as const, name: 'PayMaya', icon: 'phone-portrait-outline'},
    {
      id: 'bank_transfer' as const,
      name: 'Bank Transfer',
      icon: 'business-outline',
    },
  ];

  const onSubmit = async (data: PayoutFormData) => {
    try {
      await requestPayout({
        amount: parseFloat(data.amount),
        method: selectedMethod,
        accountDetails: {
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          bankName:
            selectedMethod === 'bank_transfer' ? data.bankName : undefined,
          mobileNumber:
            selectedMethod !== 'bank_transfer' ? data.accountNumber : undefined,
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Payout Requested',
        text2: 'Your payout is being processed',
      });
      navigation.goBack();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to request payout',
      });
    }
  };

  const handleMaxAmount = () => {
    setValue('amount', summary?.availableBalance?.toString() || '0');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Available Balance */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            P{summary?.availableBalance?.toLocaleString() || '0'}
          </Text>
        </Card>

        {/* Amount Input */}
        <View style={styles.section}>
          <View style={styles.amountHeader}>
            <Text style={styles.sectionTitle}>Payout Amount</Text>
            <TouchableOpacity onPress={handleMaxAmount}>
              <Text style={styles.maxButton}>Max</Text>
            </TouchableOpacity>
          </View>
          <Controller
            control={control}
            name="amount"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                placeholder="Enter amount"
                keyboardType="numeric"
                leftIcon="cash-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.amount?.message}
              />
            )}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Method</Text>
          <View style={styles.methodsContainer}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id
                    ? styles.methodSelected
                    : undefined,
                ]}
                onPress={() => setSelectedMethod(method.id)}>
                <Icon
                  name={method.icon}
                  size={24}
                  color={
                    selectedMethod === method.id
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.methodName,
                    selectedMethod === method.id
                      ? styles.methodNameSelected
                      : undefined,
                  ]}>
                  {method.name}
                </Text>
                {selectedMethod === method.id && (
                  <Icon
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          {selectedMethod === 'bank_transfer' && (
            <Controller
              control={control}
              name="bankName"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  label="Bank Name"
                  placeholder="e.g., BDO, BPI, UnionBank"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="accountNumber"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={
                  selectedMethod === 'bank_transfer'
                    ? 'Account Number'
                    : 'Mobile Number'
                }
                placeholder={
                  selectedMethod === 'bank_transfer'
                    ? 'Enter account number'
                    : '09XX XXX XXXX'
                }
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="accountName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label="Account Name"
                placeholder="Name on the account"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountName?.message}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Request Payout"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  balanceCard: {
    margin: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  maxButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  methodsContainer: {
    gap: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  methodNameSelected: {
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
