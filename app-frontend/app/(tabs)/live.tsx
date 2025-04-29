import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Switch, FlatList, TouchableOpacity } from 'react-native';
import { Shield, Bell, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { analyzeContent } from '@/services/scannerService';
import { addScanToHistory } from '@/services/storageService';

interface DetectedMessage {
  id: string;
  text: string;
  timestamp: number;
  threatLevel: 'safe' | 'warning' | 'danger';
  confidence: number;
}

async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
  }
  return true;
}

export default function LiveMonitorScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [detectedMessages, setDetectedMessages] = useState<DetectedMessage[]>([]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
  };

  // Simulated message detection for demo purposes
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        const mockMessages = [
          "Urgent: Your account needs verification now!",
          "Congratulations! You've won a prize. Click here to claim.",
          "Your package delivery failed. Update details here.",
          "Security alert: Unusual login detected.",
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        
        analyzeContent(randomMessage).then(result => {
          const newMessage: DetectedMessage = {
            id: Date.now().toString(),
            text: randomMessage,
            timestamp: Date.now(),
            threatLevel: result.status,
            confidence: result.confidenceScore,
          };

          setDetectedMessages(prev => [newMessage, ...prev].slice(0, 50));
          
          if (result.status === 'danger') {
            showNotification(randomMessage);
          }

          // Add to history
          addScanToHistory({
            id: newMessage.id,
            text: randomMessage,
            result: result,
            timestamp: newMessage.timestamp,
          });
        });
      }, 10000); // Simulate new messages every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const showNotification = async (message: string) => {
    if (hasPermission) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Potential Scam Detected",
          body: message,
        },
        trigger: null,
      });
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#facc15';
      case 'safe':
        return '#4ade80';
      default:
        return '#64748b';
    }
  };

  const renderMessage = ({ item }: { item: DetectedMessage }) => (
    <TouchableOpacity 
      style={[
        styles.messageCard,
        { borderLeftColor: getThreatColor(item.threatLevel) }
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={styles.threatIndicator}>
          <AlertTriangle size={16} color={getThreatColor(item.threatLevel)} />
          <Text style={[styles.threatText, { color: getThreatColor(item.threatLevel) }]}>
            {item.threatLevel.charAt(0).toUpperCase() + item.threatLevel.slice(1)}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.confidenceText}>
        Confidence: {item.confidence}%
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Live Message Monitor</Text>
        <Text style={styles.subtitle}>
          Monitor incoming messages for potential threats in real-time
        </Text>
      </View>

      <View style={styles.monitoringCard}>
        <View style={styles.monitoringHeader}>
          <View style={styles.monitoringStatus}>
            <Shield size={24} color={isMonitoring ? '#4ade80' : '#94a3b8'} />
            <Text style={[
              styles.monitoringText,
              { color: isMonitoring ? '#4ade80' : '#94a3b8' }
            ]}>
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </Text>
          </View>
          <Switch
            value={isMonitoring}
            onValueChange={setIsMonitoring}
            trackColor={{ false: '#cbd5e1', true: '#86efac' }}
            thumbColor={isMonitoring ? '#4ade80' : '#f1f5f9'}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Bell size={20} color="#64748b" />
            <Text style={styles.statCount}>{detectedMessages.length}</Text>
            <Text style={styles.statLabel}>Messages Analyzed</Text>
          </View>
          <View style={styles.statItem}>
            <AlertTriangle size={20} color="#ef4444" />
            <Text style={styles.statCount}>
              {detectedMessages.filter(m => m.threatLevel === 'danger').length}
            </Text>
            <Text style={styles.statLabel}>Threats Detected</Text>
          </View>
        </View>
      </View>

      <View style={styles.messagesContainer}>
        <Text style={styles.sectionTitle}>Recent Detections</Text>
        <FlatList
          data={detectedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
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
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  monitoringCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monitoringStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monitoringText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  confidenceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
  },
});