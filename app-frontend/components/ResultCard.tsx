import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ScanResult } from '@/types';
import Card from './ui/Card';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, ShieldAlert } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ResultCardProps {
  result: ScanResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const getStatusColor = () => {
    switch (result.result) {
      case 'Safe':
        return colors.safe;
      case 'Scam Detected':
        return colors.danger;
      case 'Phishing Detected':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const StatusIcon = () => {
    switch (result.result) {
      case 'Safe':
        return <CheckCircle size={24} color={colors.safe} />;
      case 'Scam Detected':
        return <ShieldAlert size={24} color={colors.danger} />;
      case 'Phishing Detected':
        return <AlertTriangle size={24} color={colors.warning} />;
      default:
        return null;
    }
  };

  const formattedTimestamp = new Date(result.timestamp).toLocaleString();

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <StatusIcon />
            <Text
              style={[styles.status, { color: getStatusColor() }]}>
              {result.result}
            </Text>
          </View>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: getStatusColor() },
            ]}>
            <Text style={styles.confidenceText}>
              {Math.round(result.confidence * 100)}% Confidence
            </Text>
          </View>
        </View>

        <View style={[styles.contentContainer, { borderColor: colors.border }]}>
          <Text style={[styles.contentLabel, { color: colors.muted }]}>
            {result.isUrl ? 'URL Analyzed:' : 'Message Content:'}
          </Text>
          <Text style={[styles.content, { color: colors.text }]}>
            {result.content}
          </Text>
        </View>

        {result.details && (
          <View style={styles.detailsContainer}>
            <Text style={[styles.detailsLabel, { color: colors.muted }]}>
              Analysis Details:
            </Text>
            <Text style={[styles.details, { color: colors.text }]}>
              {result.details}
            </Text>
          </View>
        )}

        <Text style={[styles.timestamp, { color: colors.muted }]}>
          Analyzed on {formattedTimestamp}
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  status: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  confidenceBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.round,
  },
  confidenceText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  contentContainer: {
    borderWidth: 1,
    borderRadius: Layout.radius.sm,
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  contentLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: Layout.spacing.md,
  },
  detailsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});