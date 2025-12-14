import React from 'react';
import {View, Text, StyleSheet, ScrollView, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {Card} from '@components';
import {colors, typography, spacing} from '@config/theme';

export function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [vibration, setVibration] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{false: colors.border, true: colors.primary + '80'}}
              thumbColor={notifications ? colors.primary : colors.textLight}
            />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="volume-high-outline" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>Sounds</Text>
            </View>
            <Switch
              value={sounds}
              onValueChange={setSounds}
              trackColor={{false: colors.border, true: colors.primary + '80'}}
              thumbColor={sounds ? colors.primary : colors.textLight}
            />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon
                name="phone-portrait-outline"
                size={24}
                color={colors.text}
              />
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{false: colors.border, true: colors.primary + '80'}}
              thumbColor={vibration ? colors.primary : colors.textLight}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon
                name="information-circle-outline"
                size={24}
                color={colors.text}
              />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon
                name="document-text-outline"
                size={24}
                color={colors.text}
              />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="shield-outline" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="help-circle-outline" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingCard: {
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
