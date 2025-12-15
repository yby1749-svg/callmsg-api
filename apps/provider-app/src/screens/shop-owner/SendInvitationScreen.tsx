import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {colors} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {Button} from '@components/ui';

type InviteMethod = 'email' | 'provider_id';

export function SendInvitationScreen() {
  const navigation = useNavigation();
  const {isLoading, sendInvitation} = useShopOwnerStore();

  const [method, setMethod] = useState<InviteMethod>('email');
  const [email, setEmail] = useState('');
  const [providerId, setProviderId] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (method === 'email' && !email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (method === 'provider_id' && !providerId.trim()) {
      Alert.alert('Error', 'Please enter a provider ID');
      return;
    }

    try {
      await sendInvitation({
        targetEmail: method === 'email' ? email.trim() : undefined,
        targetProviderId: method === 'provider_id' ? providerId.trim() : undefined,
        message: message.trim() || undefined,
      });

      Alert.alert('Success', 'Invitation sent successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch {
      Alert.alert('Error', 'Failed to send invitation');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Invite Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite By</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[styles.methodButton, method === 'email' && styles.methodActive]}
              onPress={() => setMethod('email')}>
              <Text
                style={[
                  styles.methodText,
                  method === 'email' && styles.methodTextActive,
                ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'provider_id' && styles.methodActive,
              ]}
              onPress={() => setMethod('provider_id')}>
              <Text
                style={[
                  styles.methodText,
                  method === 'provider_id' && styles.methodTextActive,
                ]}>
                Provider ID
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email or Provider ID Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {method === 'email' ? 'Email Address' : 'Provider ID'}
          </Text>
          {method === 'email' ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="therapist@example.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <TextInput
              style={styles.input}
              value={providerId}
              onChangeText={setProviderId}
              placeholder="Enter provider ID"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          <Text style={styles.hint}>
            {method === 'email'
              ? 'The therapist will receive an invitation email with a code to join your shop.'
              : 'Enter the unique provider ID of the therapist you want to invite.'}
          </Text>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a personal message to the invitation..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Invitations Work</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>
              You send an invitation to a therapist
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>
              The therapist receives a notification with your invitation
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>
              Once accepted, the therapist joins your shop and their earnings go
              to your shop balance
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>
              Invitations expire after 7 days if not accepted
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <Button
          title="Send Invitation"
          onPress={handleSend}
          loading={isLoading}
          disabled={
            (method === 'email' && !email.trim()) ||
            (method === 'provider_id' && !providerId.trim())
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  methodTextActive: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 13,
    color: colors.primary,
    width: 20,
    fontWeight: '600',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
