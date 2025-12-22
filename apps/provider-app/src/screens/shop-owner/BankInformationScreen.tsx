import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {Button} from '@components/ui';

export function BankInformationScreen() {
  const navigation = useNavigation();
  const {shop, isLoading, updateBankAccount} = useShopOwnerStore();

  const [bankData, setBankData] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    gcashNumber: '',
    paymayaNumber: '',
  });

  useEffect(() => {
    if (shop) {
      setBankData({
        bankName: shop.bankName || '',
        bankAccountNumber: shop.bankAccountNumber || '',
        bankAccountName: shop.bankAccountName || '',
        gcashNumber: shop.gcashNumber || '',
        paymayaNumber: shop.paymayaNumber || '',
      });
    }
  }, [shop]);

  const handleSave = async () => {
    try {
      await updateBankAccount(bankData);
      Alert.alert('Success', 'Bank information updated successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update bank information');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Bank Account</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={bankData.bankName}
            onChangeText={text => setBankData({...bankData, bankName: text})}
            placeholder="e.g. BDO, BPI, Metrobank"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Account Number</Text>
          <TextInput
            style={styles.input}
            value={bankData.bankAccountNumber}
            onChangeText={text => setBankData({...bankData, bankAccountNumber: text})}
            placeholder="Account Number"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.input}
            value={bankData.bankAccountName}
            onChangeText={text => setBankData({...bankData, bankAccountName: text})}
            placeholder="Account Holder Name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>E-Wallets</Text>

        <View style={styles.field}>
          <Text style={styles.label}>GCash Number</Text>
          <TextInput
            style={styles.input}
            value={bankData.gcashNumber}
            onChangeText={text => setBankData({...bankData, gcashNumber: text})}
            placeholder="GCash Number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PayMaya Number</Text>
          <TextInput
            style={styles.input}
            value={bankData.paymayaNumber}
            onChangeText={text => setBankData({...bankData, paymayaNumber: text})}
            placeholder="PayMaya Number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});
