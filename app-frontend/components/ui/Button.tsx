import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.muted : colors.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.muted : colors.secondary,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? colors.muted : colors.primary,
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? colors.muted : colors.danger,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: disabled ? colors.muted : colors.primary,
          borderColor: 'transparent',
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: disabled ? colors.muted : colors.primary };
      default:
        return { color: '#fff' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 20 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyle(),
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : '#fff'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            { fontSize: getFontSize() },
            disabled && styles.disabledText,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});