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

export function EditShopProfileScreen() {
  const navigation = useNavigation();
  const {shop, isLoading, updateShop} = useShopOwnerStore();

  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (shop) {
      setShopData({
        name: shop.name || '',
        description: shop.description || '',
        phone: shop.phone || '',
        email: shop.email || '',
      });
    }
  }, [shop]);

  const handleSave = async () => {
    try {
      await updateShop(shopData);
      Alert.alert('Success', 'Shop profile updated successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Shop Name</Text>
          <TextInput
            style={styles.input}
            value={shopData.name}
            onChangeText={text => setShopData({...shopData, name: text})}
            placeholder="Shop Name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shopData.description}
            onChangeText={text => setShopData({...shopData, description: text})}
            placeholder="Shop Description"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={shopData.phone}
            onChangeText={text => setShopData({...shopData, phone: text})}
            placeholder="Phone Number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={shopData.email}
            onChangeText={text => setShopData({...shopData, email: text})}
            placeholder="Email Address"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});
