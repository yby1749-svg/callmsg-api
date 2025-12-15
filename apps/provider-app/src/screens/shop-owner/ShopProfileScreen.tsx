import React, {useEffect, useState} from 'react';
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
import {colors} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {useAuthStore} from '@store';
import {Button} from '@components/ui';

export function ShopProfileScreen() {
  const {shop, isLoading, fetchShop, updateShop, updateBankAccount} =
    useShopOwnerStore();
  const {logout} = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
  });
  const [bankData, setBankData] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    gcashNumber: '',
    paymayaNumber: '',
  });

  useEffect(() => {
    fetchShop();
  }, []);

  useEffect(() => {
    if (shop) {
      setShopData({
        name: shop.name || '',
        description: shop.description || '',
        phone: shop.phone || '',
        email: shop.email || '',
      });
      setBankData({
        bankName: shop.bankName || '',
        bankAccountNumber: shop.bankAccountNumber || '',
        bankAccountName: shop.bankAccountName || '',
        gcashNumber: shop.gcashNumber || '',
        paymayaNumber: shop.paymayaNumber || '',
      });
    }
  }, [shop]);

  const handleSaveProfile = async () => {
    try {
      await updateShop(shopData);
      setIsEditing(false);
      Alert.alert('Success', 'Shop profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSaveBankInfo = async () => {
    try {
      await updateBankAccount(bankData);
      setIsBankEditing(false);
      Alert.alert('Success', 'Bank information updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update bank information');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'SUSPENDED':
      case 'REJECTED':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Shop Status */}
        <View style={styles.statusCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopLogo}>
              <Text style={styles.shopLogoText}>
                {shop?.name?.charAt(0) || 'S'}
              </Text>
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{shop?.name || 'My Shop'}</Text>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: getStatusColor(shop?.status || '')},
                  ]}
                />
                <Text style={styles.statusText}>{shop?.status || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editButton}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Shop Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={shopData.name}
                  onChangeText={text => setShopData({...shopData, name: text})}
                  placeholder="Shop Name"
                />
              ) : (
                <Text style={styles.fieldValue}>{shopData.name || '-'}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={shopData.description}
                  onChangeText={text =>
                    setShopData({...shopData, description: text})
                  }
                  placeholder="Shop Description"
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {shopData.description || '-'}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={shopData.phone}
                  onChangeText={text => setShopData({...shopData, phone: text})}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{shopData.phone || '-'}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={shopData.email}
                  onChangeText={text => setShopData({...shopData, email: text})}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValue}>{shopData.email || '-'}</Text>
              )}
            </View>

            {isEditing && (
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                loading={isLoading}
              />
            )}
          </View>
        </View>

        {/* Bank Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Information</Text>
            <TouchableOpacity onPress={() => setIsBankEditing(!isBankEditing)}>
              <Text style={styles.editButton}>
                {isBankEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bank Name</Text>
              {isBankEditing ? (
                <TextInput
                  style={styles.input}
                  value={bankData.bankName}
                  onChangeText={text =>
                    setBankData({...bankData, bankName: text})
                  }
                  placeholder="Bank Name"
                />
              ) : (
                <Text style={styles.fieldValue}>{bankData.bankName || '-'}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              {isBankEditing ? (
                <TextInput
                  style={styles.input}
                  value={bankData.bankAccountNumber}
                  onChangeText={text =>
                    setBankData({...bankData, bankAccountNumber: text})
                  }
                  placeholder="Account Number"
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {bankData.bankAccountNumber
                    ? `****${bankData.bankAccountNumber.slice(-4)}`
                    : '-'}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Account Name</Text>
              {isBankEditing ? (
                <TextInput
                  style={styles.input}
                  value={bankData.bankAccountName}
                  onChangeText={text =>
                    setBankData({...bankData, bankAccountName: text})
                  }
                  placeholder="Account Holder Name"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {bankData.bankAccountName || '-'}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>GCash Number</Text>
              {isBankEditing ? (
                <TextInput
                  style={styles.input}
                  value={bankData.gcashNumber}
                  onChangeText={text =>
                    setBankData({...bankData, gcashNumber: text})
                  }
                  placeholder="GCash Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {bankData.gcashNumber || '-'}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PayMaya Number</Text>
              {isBankEditing ? (
                <TextInput
                  style={styles.input}
                  value={bankData.paymayaNumber}
                  onChangeText={text =>
                    setBankData({...bankData, paymayaNumber: text})
                  }
                  placeholder="PayMaya Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {bankData.paymayaNumber || '-'}
                </Text>
              )}
            </View>

            {isBankEditing && (
              <Button
                title="Save Bank Info"
                onPress={handleSaveBankInfo}
                loading={isLoading}
              />
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shopLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  logoutButton: {
    backgroundColor: colors.error + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
