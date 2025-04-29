import React from 'react';
import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native';
import Colors, { shadows } from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  variant = 'default',
  padding = 'medium',
  style,
  children,
  ...props
}: CardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.card,
          borderColor: 'transparent',
          ...shadows.small,
        };
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderColor: 'transparent',
          ...shadows.medium,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: 'transparent',
        };
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: Layout.spacing.sm };
      case 'medium':
        return { padding: Layout.spacing.md };
      case 'large':
        return { padding: Layout.spacing.lg };
      default:
        return { padding: Layout.spacing.md };
    }
  };

  return (
    <View
      style={[styles.card, getCardStyle(), getPaddingStyle(), style]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
});