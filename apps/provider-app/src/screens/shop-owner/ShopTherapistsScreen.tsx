import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {Button} from '@components/ui';
import type {ShopTherapistsStackParamList} from '@types';
import type {ShopTherapist, ShopInvitation} from '@api/shops';

type NavigationProp = NativeStackNavigationProp<ShopTherapistsStackParamList>;

export function ShopTherapistsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    therapists,
    invitations,
    isLoading,
    fetchTherapists,
    fetchInvitations,
    removeTherapist,
    cancelInvitation,
  } = useShopOwnerStore();

  const [activeTab, setActiveTab] = useState<'therapists' | 'invitations'>('therapists');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchTherapists(), fetchInvitations()]);
  };

  const handleRemoveTherapist = (therapist: ShopTherapist) => {
    Alert.alert(
      'Remove Therapist',
      `Are you sure you want to remove ${therapist.user?.firstName} ${therapist.user?.lastName} from your shop?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTherapist(therapist.id);
            } catch {
              Alert.alert('Error', 'Failed to remove therapist');
            }
          },
        },
      ],
    );
  };

  const handleCancelInvitation = (invitation: ShopInvitation) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelInvitation(invitation.id);
            } catch {
              Alert.alert('Error', 'Failed to cancel invitation');
            }
          },
        },
      ],
    );
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');

  const renderTherapist = ({item}: {item: ShopTherapist}) => (
    <View style={styles.itemCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.user?.firstName?.charAt(0) || 'T'}
        </Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>
          {item.user?.firstName} {item.user?.lastName}
        </Text>
        <Text style={styles.itemSubtitle}>{item.displayName}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>⭐ {item.rating.toFixed(1)}</Text>
          <Text style={styles.stat}>📋 {item.completedBookings} jobs</Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <View
          style={[
            styles.statusBadge,
            item.onlineStatus === 'ONLINE' && styles.onlineBadge,
          ]}>
          <Text
            style={[
              styles.statusText,
              item.onlineStatus === 'ONLINE' && styles.onlineText,
            ]}>
            {item.onlineStatus}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveTherapist(item)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInvitation = ({item}: {item: ShopInvitation}) => (
    <View style={styles.itemCard}>
      <View style={[styles.avatar, styles.avatarPending]}>
        <Text style={styles.avatarText}>📧</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>
          {item.targetProvider
            ? `${item.targetProvider.user?.firstName} ${item.targetProvider.user?.lastName}`
            : item.targetEmail || 'Unknown'}
        </Text>
        <Text style={styles.itemSubtitle}>
          Code: {item.inviteCode}
        </Text>
        <Text style={styles.expiryText}>
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Text style={styles.pendingText}>{item.status}</Text>
        </View>
        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelInvitation(item)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'therapists' && styles.activeTab]}
          onPress={() => setActiveTab('therapists')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'therapists' && styles.activeTabText,
            ]}>
            Therapists ({therapists.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invitations' && styles.activeTab]}
          onPress={() => setActiveTab('invitations')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'invitations' && styles.activeTabText,
            ]}>
            Invitations ({pendingInvitations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'therapists' ? (
        <FlatList
          data={therapists}
          renderItem={renderTherapist}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Therapists Yet</Text>
              <Text style={styles.emptyText}>
                Invite therapists to join your shop
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={invitations}
          renderItem={renderInvitation}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📧</Text>
              <Text style={styles.emptyTitle}>No Invitations</Text>
              <Text style={styles.emptyText}>
                Send invitations to therapists
              </Text>
            </View>
          }
        />
      )}

      {/* Invite Button */}
      <View style={styles.footer}>
        <Button
          title="Invite Therapist"
          onPress={() => navigation.navigate('SendInvitation')}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarPending: {
    backgroundColor: colors.warning + '20',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  stat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expiryText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  onlineBadge: {
    backgroundColor: colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  onlineText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  removeText: {
    fontSize: 12,
    color: colors.error,
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 12,
    color: colors.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
