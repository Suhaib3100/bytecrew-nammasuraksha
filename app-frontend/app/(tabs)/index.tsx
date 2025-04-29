import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScanInput from '@/components/ScanInput';
import ResultCard from '@/components/ResultCard';
import { ScanResult } from '@/types';
import { analyzeText } from '@/services/api';
import useHistory from '@/hooks/useHistory';
import Card from '@/components/ui/Card';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, MessageCircle, ShieldAlert } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function HomeScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const { addToHistory, getHistoryStats } = useHistory();

  const handleSubmit = async (text: string, isUrl: boolean) => {
    setLoading(true);
    try {
      const result = await analyzeText(text, isUrl);
      setCurrentResult(result);
      addToHistory(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = getHistoryStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Scam Detection
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Analyze messages & links for potential threats
          </Text>
        </View>

        <ScanInput onSubmit={handleSubmit} isLoading={loading} />

        {currentResult ? (
          <ResultCard result={currentResult} />
        ) : (
          <Card variant="outlined" style={styles.emptyState}>
            <MessageCircle size={40} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>
              Enter a message or URL to analyze
            </Text>
          </Card>
        )}

        {stats.total > 0 && (
          <Animated.View 
            style={styles.statsContainer}
            entering={FadeIn.duration(400).delay(300)}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Your Protection Summary
            </Text>
            <View style={styles.statsCards}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.primaryLight },
                ]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.primary }]}>
                  Total Scans
                </Text>
              </View>

              <View style={styles.miniStats}>
                <View
                  style={[
                    styles.miniStatCard,
                    { backgroundColor: colors.safe + '20' },
                  ]}>
                  <CheckCircle size={16} color={colors.safe} />
                  <Text style={[styles.miniStatNumber, { color: colors.safe }]}>
                    {stats.safe}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.safe }]}>
                    Safe
                  </Text>
                </View>

                <View
                  style={[
                    styles.miniStatCard,
                    { backgroundColor: colors.danger + '20' },
                  ]}>
                  <ShieldAlert size={16} color={colors.danger} />
                  <Text style={[styles.miniStatNumber, { color: colors.danger }]}>
                    {stats.scams}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.danger }]}>
                    Scams
                  </Text>
                </View>

                <View
                  style={[
                    styles.miniStatCard,
                    { backgroundColor: colors.warning + '20' },
                  ]}>
                  <AlertTriangle size={16} color={colors.warning} />
                  <Text style={[styles.miniStatNumber, { color: colors.warning }]}>
                    {stats.phishing}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.warning }]}>
                    Phishing
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
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
  header: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
    marginBottom: Layout.spacing.lg,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: Layout.spacing.lg,
  },
  statsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: Layout.spacing.sm,
  },
  statsCards: {
    gap: Layout.spacing.md,
  },
  statCard: {
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  miniStatNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginVertical: 4,
  },
  miniStatLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});