import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Chrome as Home, ClipboardList, BookOpen, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const TabBarIcon = useCallback(
    (props: { name: 'home' | 'history' | 'education' | 'settings'; focused: boolean }) => {
      const { name, focused } = props;
      const color = focused ? colors.primary : colors.muted;
      const size = 24;

      switch (name) {
        case 'home':
          return <Home size={size} color={color} />;
        case 'history':
          return <ClipboardList size={size} color={color} />;
        case 'education':
          return <BookOpen size={size} color={color} />;
        case 'settings':
          return <Settings size={size} color={color} />;
        default:
          return null;
      }
    },
    [colors]
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
        },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ focused }) => TabBarIcon({ name: 'home', focused }),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => TabBarIcon({ name: 'history', focused }),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => TabBarIcon({ name: 'education', focused }),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => TabBarIcon({ name: 'settings', focused }),
        }}
      />
    </Tabs>
  );
}