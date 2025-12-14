import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {format} from 'date-fns';

import {Button, Card} from '@components';
import {useEarningsStore} from '@store';
import {colors, typography, spacing} from '@config/theme';
import {MIN_PAYOUT_AMOUNT} from '@config/constants';
import type {EarningsStackParamList, Earning} from '@types';

type NavigationProp = NativeStackNavigationProp<
  EarningsStackParamList,
  'Earnings'
>;

export function EarningsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {summary, earnings, isLoading, fetchSummary, fetchEarnings} =
    useEarningsStore();

  useEffect(() => {
    fetchSummary();
    fetchEarnings();
  }, [fetchSummary, fetchEarnings]);

  const onRefresh = async () => {
    await Promise.all([fetchSummary(), fetchEarnings()]);
  };

  const canRequestPayout =
    summary && summary.availableBalance >= MIN_PAYOUT_AMOUNT;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Today</Text>
              <Text style={styles.summaryValue}>
                P{summary?.today?.toLocaleString() || '0'}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryValue}>
                P{summary?.thisWeek?.toLocaleString() || '0'}
              </Text>
            </Card>
          </View>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>
                P{summary?.thisMonth?.toLocaleString() || '0'}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryValue}>
                P{summary?.totalEarned?.toLocaleString() || '0'}
              </Text>
            </Card>
          </View>
        </View>

        {/* Available Balance */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>
                P{summary?.availableBalance?.toLocaleString() || '0'}
              </Text>
            </View>
            <Button
              title="Request Payout"
              size="sm"
              disabled={!canRequestPayout}
              onPress={() => navigation.navigate('PayoutRequest')}
            />
          </View>
          {!canRequestPayout && (
            <Text style={styles.minPayoutNote}>
              Minimum payout amount: P{MIN_PAYOUT_AMOUNT}
            </Text>
          )}
        </Card>

        {/* Pending Balance */}
        {summary?.pendingBalance !== undefined &&
          summary.pendingBalance > 0 && (
            <Card style={styles.pendingCard}>
              <Icon name="time-outline" size={20} color={colors.warning} />
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingLabel}>Pending Balance</Text>
                <Text style={styles.pendingValue}>
                  P{summary.pendingBalance.toLocaleString()}
                </Text>
              </View>
            </Card>
          )}

        {/* Earnings History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>

          {earnings.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="wallet-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No earnings yet</Text>
            </View>
          ) : (
            earnings.map((earning: Earning) => (
              <Card key={earning.id} style={styles.earningCard}>
                <View style={styles.earningInfo}>
                  <Text style={styles.earningService}>
                    {earning.booking?.service?.name || 'Service'}
                  </Text>
                  <Text style={styles.earningDate}>
                    {format(new Date(earning.createdAt), 'MMM d, yyyy')}
                  </Text>
                </View>
                <View style={styles.earningAmounts}>
                  <Text style={styles.earningGross}>P{earning.amount}</Text>
                  <Text style={styles.earningNet}>
                    Net: P{earning.netAmount}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.8,
  },
  balanceValue: {
    ...typography.h1,
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  minPayoutNote: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.7,
    marginTop: spacing.sm,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.warning + '10',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  pendingInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  pendingLabel: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  pendingValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  historySection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  earningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  earningInfo: {
    flex: 1,
  },
  earningService: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  earningDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  earningAmounts: {
    alignItems: 'flex-end',
  },
  earningGross: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  earningNet: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
