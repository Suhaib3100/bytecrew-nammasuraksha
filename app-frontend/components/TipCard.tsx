import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { TipItem } from '@/types';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TriangleAlert as AlertTriangle, BookOpen, ShieldAlert } from 'lucide-react-native';

interface TipCardProps {
  tip: TipItem;
  onPress: (tip: TipItem) => void;
}

export default function TipCard({ tip, onPress }: TipCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const getCategoryColor = () => {
    switch (tip.category) {
      case 'phishing':
        return colors.warning;
      case 'scam':
        return colors.danger;
      case 'general':
        return colors.primary;
      default:
        return colors.muted;
    }
  };

  const getCategoryName = () => {
    switch (tip.category) {
      case 'phishing':
        return 'Phishing';
      case 'scam':
        return 'Scam';
      case 'general':
        return 'General';
      default:
        return 'Tip';
    }
  };

  const CategoryIcon = () => {
    switch (tip.category) {
      case 'phishing':
        return <AlertTriangle size={22} color={colors.warning} />;
      case 'scam':
        return <ShieldAlert size={22} color={colors.danger} />;
      case 'general':
        return <BookOpen size={22} color={colors.primary} />;
      default:
        return null;
    }
  };

  const shadowStyle = Platform.select({
    ios: Colors.shadows.small,
    android: Colors.shadows.small,
    web: Colors.shadows.small,
    default: {},
  });

  return (
    <Animated.View entering={FadeIn.duration(300).delay(200)}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderLeftColor: getCategoryColor(),
            ...shadowStyle,
          },
        ]}
        onPress={() => onPress(tip)}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <CategoryIcon />
            <Text style={[styles.title, { color: colors.text }]}>
              {tip.title}
            </Text>
          </View>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor() },
            ]}>
            <Text style={styles.categoryText}>{getCategoryName()}</Text>
          </View>
        </View>
        <Text
          style={[styles.content, { color: colors.text }]}
          numberOfLines={2}>
          {tip.content}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.md,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  categoryBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.radius.round,
    marginLeft: Layout.spacing.sm,
  },
  categoryText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});