import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { CircleAlert as AlertCircle, History, Chrome as Home, Settings, MessageSquareWarning } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live Monitor',
          tabBarIcon: ({ color, size }) => (
            <MessageSquareWarning size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="awareness"
        options={{
          title: 'Awareness',
          tabBarIcon: ({ color, size }) => (
            <AlertCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 10,
    paddingBottom: 10,
    height: 60,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 4,
  },
});