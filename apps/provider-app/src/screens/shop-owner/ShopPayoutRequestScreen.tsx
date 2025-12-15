import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {colors} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {Button} from '@components/ui';

type PayoutMethod = 'BANK_TRANSFER' | 'GCASH' | 'PAYMAYA';

export function ShopPayoutRequestScreen() {
  const navigation = useNavigation();
  const {shop, earningsSummary, isLoading, fetchShop, requestPayout} =
    useShopOwnerStore();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>('BANK_TRANSFER');

  useEffect(() => {
    fetchShop();
  }, []);

  const availableBalance = earningsSummary?.balance || 0;

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const handleSetMax = () => {
    setAmount(availableBalance.toString());
  };

  const getMethodLabel = (m: PayoutMethod) => {
    switch (m) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'GCASH':
        return 'GCash';
      case 'PAYMAYA':
        return 'PayMaya';
    }
  };

  const getAccountInfo = (): string => {
    if (!shop) return 'Not configured';

    switch (method) {
      case 'BANK_TRANSFER':
        return shop.bankAccountNumber
          ? `${shop.bankName || 'Bank'} - ****${shop.bankAccountNumber.slice(-4)}`
          : 'Not configured';
      case 'GCASH':
        return shop.gcashNumber || 'Not configured';
      case 'PAYMAYA':
        return shop.paymayaNumber || 'Not configured';
      default:
        return 'Not configured';
    }
  };

  const isMethodConfigured = (): boolean => {
    if (!shop) return false;

    switch (method) {
      case 'BANK_TRANSFER':
        return !!shop.bankAccountNumber;
      case 'GCASH':
        return !!shop.gcashNumber;
      case 'PAYMAYA':
        return !!shop.paymayaNumber;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    const payoutAmount = parseFloat(amount);

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (payoutAmount > availableBalance) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }

    if (!isMethodConfigured()) {
      Alert.alert('Error', 'Please configure your payout method first');
      return;
    }

    try {
      await requestPayout({amount: payoutAmount, method});
      Alert.alert('Success', 'Payout request submitted successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit payout request');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.maxButton} onPress={handleSetMax}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payout Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Method</Text>
          {(['BANK_TRANSFER', 'GCASH', 'PAYMAYA'] as PayoutMethod[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.methodOption, method === m && styles.methodSelected]}
              onPress={() => setMethod(m)}>
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodLabel,
                    method === m && styles.methodLabelSelected,
                  ]}>
                  {getMethodLabel(m)}
                </Text>
              </View>
              <View
                style={[styles.radio, method === m && styles.radioSelected]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>{getMethodLabel(method)}</Text>
            <Text
              style={[
                styles.accountValue,
                !isMethodConfigured() && styles.accountNotConfigured,
              ]}>
              {getAccountInfo()}
            </Text>
          </View>
        </View>

        {/* Fee Notice */}
        <View style={styles.feeNotice}>
          <Text style={styles.feeText}>
            Note: A processing fee may apply depending on the payout method.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Request Payout"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > availableBalance ||
            !isMethodConfigured()
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 16,
  },
  maxButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  methodLabelSelected: {
    color: colors.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  accountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  accountNotConfigured: {
    color: colors.error,
  },
  feeNotice: {
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: 12,
  },
  feeText: {
    fontSize: 13,
    color: colors.warning,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
