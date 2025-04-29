import { Platform } from 'react-native';

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const shadows = Platform.select({
  ios: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 1.5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
  },
  android: {
    small: {
      elevation: 2,
    },
    medium: {
      elevation: 4,
    },
    large: {
      elevation: 8,
    },
  },
  web: {
    small: {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
    },
    medium: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    large: {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
    },
  },
  default: {
    small: {},
    medium: {},
    large: {},
  },
}) || { small: {}, medium: {}, large: {} };

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    // Status colors
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    // UI colors
    card: '#ffffff',
    border: '#e5e7eb',
    notification: '#ff3b30',
    muted: '#6b7280',
    overlay: 'rgba(0, 0, 0, 0.5)',
    // Primary brand colors
    primary: '#2563eb',
    primaryLight: '#dbeafe',
    secondary: '#6366f1',
    secondaryLight: '#e0e7ff',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    // Status colors
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    // UI colors
    card: '#1c1c1e',
    border: '#2c2c2e',
    notification: '#ff453a',
    muted: '#9ca3af',
    overlay: 'rgba(0, 0, 0, 0.7)',
    // Primary brand colors
    primary: '#3b82f6',
    primaryLight: '#1e3a8a',
    secondary: '#818cf8',
    secondaryLight: '#2e1065',
  },
  shadows,
};

export { shadows }