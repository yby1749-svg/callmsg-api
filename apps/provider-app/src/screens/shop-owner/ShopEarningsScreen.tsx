import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '@config/theme';
import {useShopOwnerStore} from '@store/shopStore';
import {shopOwnerApi, type ShopEarning, type ShopPayout} from '@api/shops';
import {Button} from '@components/ui';
import type {ShopEarningsStackParamList} from '@types';

type NavigationProp = NativeStackNavigationProp<ShopEarningsStackParamList>;

export function ShopEarningsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {earningsSummary, payouts, isLoading, fetchEarningsSummary, fetchPayouts} =
    useShopOwnerStore();

  const [activeTab, setActiveTab] = useState<'earnings' | 'payouts'>('earnings');
  const [earnings, setEarnings] = useState<ShopEarning[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchEarningsSummary(), fetchPayouts(), loadEarnings()]);
  };

  const loadEarnings = async () => {
    setEarningsLoading(true);
    try {
      const response = await shopOwnerApi.getEarnings();
      setEarnings(response.data.data);
    } catch {
      // Handle error silently
    } finally {
      setEarningsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.success;
      case 'PROCESSING':
        return colors.primary;
      case 'PENDING':
        return colors.warning;
      case 'FAILED':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderEarning = ({item}: {item: ShopEarning}) => (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <Text style={styles.itemTitle}>{item.service?.name}</Text>
        <Text style={styles.itemSubtitle}>
          {item.provider?.displayName} • {item.customer?.firstName}{' '}
          {item.customer?.lastName}
        </Text>
        <Text style={styles.itemDate}>
          {new Date(item.completedAt).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.itemAmount}>{formatCurrency(item.shopEarning)}</Text>
    </View>
  );

  const renderPayout = ({item}: {item: ShopPayout}) => (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <Text style={styles.itemTitle}>{formatCurrency(item.netAmount)}</Text>
        <Text style={styles.itemSubtitle}>
          {item.method} • Fee: {formatCurrency(item.fee)}
        </Text>
        <Text style={styles.itemDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {backgroundColor: getPayoutStatusColor(item.status) + '20'},
        ]}>
        <Text
          style={[styles.statusText, {color: getPayoutStatusColor(item.status)}]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(earningsSummary?.balance || 0)}
          </Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(earningsSummary?.todayEarnings || 0)}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(earningsSummary?.monthEarnings || 0)}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(earningsSummary?.totalEarnings || 0)}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'earnings' && styles.activeTabText,
            ]}>
            Earnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payouts' && styles.activeTab]}
          onPress={() => setActiveTab('payouts')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'payouts' && styles.activeTabText,
            ]}>
            Payouts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'earnings' ? (
        <FlatList
          data={earnings}
          renderItem={renderEarning}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || earningsLoading}
              onRefresh={loadData}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No Earnings Yet</Text>
              <Text style={styles.emptyText}>
                Earnings from your therapists will appear here
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={payouts}
          renderItem={renderPayout}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📤</Text>
              <Text style={styles.emptyTitle}>No Payouts Yet</Text>
              <Text style={styles.emptyText}>
                Request a payout when you have earnings
              </Text>
            </View>
          }
        />
      )}

      {/* Payout Button */}
      {earningsSummary && earningsSummary.balance > 0 && (
        <View style={styles.footer}>
          <Button
            title="Request Payout"
            onPress={() => navigation.navigate('ShopPayoutRequest')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemMain: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
