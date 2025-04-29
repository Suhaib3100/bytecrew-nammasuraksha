import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { Shield, ExternalLink, Moon, Sun, Info, Bell, Lock } from 'lucide-react-native';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  const toggleDarkMode = () => {
    // In a real app, this would implement dark mode
    setDarkMode(!darkMode);
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const toggleSaveHistory = () => {
    setSaveHistory(!saveHistory);
  };

  const handleOpenLink = (url: string) => {
    // In a real app, implement proper URL handling
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About Scam Scanner',
      'Scam Scanner v1.0.0\n\nThis app helps protect users from phishing and scam attempts by analyzing suspicious text and URLs. Stay safe online!'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            {darkMode ? (
              <Moon size={20} color="#64748b" />
            ) : (
              <Sun size={20} color="#64748b" />
            )}
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={darkMode ? '#3b82f6' : '#f1f5f9'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Bell size={20} color="#64748b" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={notifications ? '#3b82f6' : '#f1f5f9'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Lock size={20} color="#64748b" />
            <Text style={styles.settingLabel}>Save Scan History</Text>
          </View>
          <Switch
            value={saveHistory}
            onValueChange={toggleSaveHistory}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={saveHistory ? '#3b82f6' : '#f1f5f9'}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Resources</Text>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => handleOpenLink('https://www.ftc.gov/scams')}
        >
          <View style={styles.settingLabelContainer}>
            <Shield size={20} color="#64748b" />
            <Text style={styles.settingLabel}>FTC Scam Resources</Text>
          </View>
          <ExternalLink size={18} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => handleOpenLink('https://www.consumer.ftc.gov/features/scam-alerts')}
        >
          <View style={styles.settingLabelContainer}>
            <Shield size={20} color="#64748b" />
            <Text style={styles.settingLabel}>Latest Scam Alerts</Text>
          </View>
          <ExternalLink size={18} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => handleOpenLink('https://reportfraud.ftc.gov/')}
        >
          <View style={styles.settingLabelContainer}>
            <Shield size={20} color="#64748b" />
            <Text style={styles.settingLabel}>Report a Scam</Text>
          </View>
          <ExternalLink size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={showAbout}
        >
          <View style={styles.settingLabelContainer}>
            <Info size={20} color="#64748b" />
            <Text style={styles.settingLabel}>About Scam Scanner</Text>
          </View>
          <Text style={styles.versionText}>v1.0.0</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    marginTop: Platform.OS === 'web' ? 40 : 60,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1e293b',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    marginLeft: 12,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94a3b8',
  },
});