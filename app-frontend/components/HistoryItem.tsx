import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ScanResult } from '@/types';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, ShieldAlert } from 'lucide-react-native';

interface HistoryItemProps {
  item: ScanResult;
  onPress: (item: ScanResult) => void;
}

export default function HistoryItem({ item, onPress }: HistoryItemProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const getStatusColor = () => {
    switch (item.result) {
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
    switch (item.result) {
      case 'Safe':
        return <CheckCircle size={20} color={colors.safe} />;
      case 'Scam Detected':
        return <ShieldAlert size={20} color={colors.danger} />;
      case 'Phishing Detected':
        return <AlertTriangle size={20} color={colors.warning} />;
      default:
        return null;
    }
  };

  const formattedDate = new Date(item.timestamp).toLocaleDateString();
  const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const truncateContent = (content: string, maxLength = 50) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => onPress(item)}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <StatusIcon />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.resultType, { color: getStatusColor() }]}>
            {item.result}
          </Text>
          <Text style={[styles.content, { color: colors.text }]}>
            {truncateContent(item.content)}
          </Text>
        </View>
      </View>
      <View style={styles.timeContainer}>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.time, { color: colors.muted }]}>
          {formattedTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.sm,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  iconContainer: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  resultType: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: Layout.spacing.sm,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
});