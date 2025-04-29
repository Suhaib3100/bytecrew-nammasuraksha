import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/ui/Card';
import { TriangleAlert as AlertTriangle, Bell, ExternalLink, Info, Lock, Moon, Shield, Sun } from 'lucide-react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [notifications, setNotifications] = useState(true);
  const [smsAnalysis, setSmsAnalysis] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const SettingItem = ({
    icon,
    title,
    description,
    action,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action: React.ReactNode;
  }) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingIconContainer}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: colors.muted }]}>
          {description}
        </Text>
      </View>
      {action}
    </View>
  );

  const ThemeSelector = () => (
    <View style={styles.themeSelector}>
      <TouchableOpacity
        style={[
          styles.themeOption,
          theme === 'light' && {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
          },
        ]}
        onPress={() => setTheme('light')}>
        <Sun
          size={20}
          color={theme === 'light' ? colors.primary : colors.muted}
        />
        <Text
          style={[
            styles.themeText,
            {
              color: theme === 'light' ? colors.primary : colors.muted,
            },
          ]}>
          Light
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.themeOption,
          theme === 'dark' && {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
          },
        ]}
        onPress={() => setTheme('dark')}>
        <Moon
          size={20}
          color={theme === 'dark' ? colors.primary : colors.muted}
        />
        <Text
          style={[
            styles.themeText,
            {
              color: theme === 'dark' ? colors.primary : colors.muted,
            },
          ]}>
          Dark
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.themeOption,
          theme === 'system' && {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
          },
        ]}
        onPress={() => setTheme('system')}>
        <Info
          size={20}
          color={theme === 'system' ? colors.primary : colors.muted}
        />
        <Text
          style={[
            styles.themeText,
            {
              color: theme === 'system' ? colors.primary : colors.muted,
            },
          ]}>
          System
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            General
          </Text>

          <SettingItem
            icon={<Bell size={22} color={colors.primary} />}
            title="Notifications"
            description="Receive alerts about scams and phishing attempts"
            action={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: colors.muted,
                  true: colors.primary,
                }}
                thumbColor="#fff"
                ios_backgroundColor={colors.muted}
              />
            }
          />

          <SettingItem
            icon={<Shield size={22} color={colors.primary} />}
            title="Auto-scan URLs"
            description="Automatically scan links when opened"
            action={
              <Switch
                value={autoScan}
                onValueChange={setAutoScan}
                trackColor={{
                  false: colors.muted,
                  true: colors.primary,
                }}
                thumbColor="#fff"
                ios_backgroundColor={colors.muted}
              />
            }
          />

          <SettingItem
            icon={<Lock size={22} color={colors.primary} />}
            title="SMS Analysis"
            description="Allow access to analyze incoming messages"
            action={
              <Switch
                value={smsAnalysis}
                onValueChange={setSmsAnalysis}
                trackColor={{
                  false: colors.muted,
                  true: colors.primary,
                }}
                thumbColor="#fff"
                ios_backgroundColor={colors.muted}
              />
            }
          />
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>

          <SettingItem
            icon={<Sun size={22} color={colors.primary} />}
            title="Theme"
            description="Change how the app looks"
            action={<ThemeSelector />}
          />
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>

          <SettingItem
            icon={<Info size={22} color={colors.primary} />}
            title="App version"
            description="1.0.0"
            action={null}
          />

          <SettingItem
            icon={<ExternalLink size={22} color={colors.primary} />}
            title="Privacy Policy"
            description="Read how we protect your data"
            action={
              <TouchableOpacity>
                <ExternalLink size={18} color={colors.primary} />
              </TouchableOpacity>
            }
          />

          <SettingItem
            icon={<AlertTriangle size={22} color={colors.primary} />}
            title="Report an issue"
            description="Help us improve the app"
            action={
              <TouchableOpacity>
                <ExternalLink size={18} color={colors.primary} />
              </TouchableOpacity>
            }
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.md,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    marginBottom: Layout.spacing.lg,
  },
  card: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: Layout.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    marginRight: Layout.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.xs,
    borderRadius: Layout.radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  themeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});