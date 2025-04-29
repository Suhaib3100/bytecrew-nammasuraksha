import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Shield, ShieldAlert, ShieldCheck, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type ScanResult = {
  status: 'safe' | 'warning' | 'danger';
  confidenceScore: number;
  message: string;
  details?: string;
};

interface ResultCardProps {
  result: ScanResult;
  animatedValue: Animated.Value;
}

export default function ResultCard({ result, animatedValue }: ResultCardProps) {
  const getStatusColor = () => {
    switch (result.status) {
      case 'safe':
        return '#4ade80';
      case 'warning':
        return '#facc15';
      case 'danger':
        return '#ef4444';
      default:
        return '#4ade80';
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case 'safe':
        return <ShieldCheck size={36} color="#4ade80" />;
      case 'warning':
        return <ShieldAlert size={36} color="#facc15" />;
      case 'danger':
        return <ShieldAlert size={36} color="#ef4444" />;
      default:
        return <Shield size={36} color="#4ade80" />;
    }
  };

  const getStatusTitle = () => {
    switch (result.status) {
      case 'safe':
        return 'Safe Content';
      case 'warning':
        return 'Possible Scam Detected';
      case 'danger':
        return 'Dangerous Content Detected';
      default:
        return 'Scan Result';
    }
  };

  const handleShare = () => {
    // In a real app, implement sharing functionality
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ 
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1]
            }) 
          }],
          opacity: animatedValue,
        }
      ]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          {getStatusIcon()}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{getStatusTitle()}</Text>
          <View style={[styles.confidenceContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.confidenceText, { color: getStatusColor() }]}>
              {result.confidenceScore}% Confidence
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={18} color="#64748b" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{result.message}</Text>
        {result.details && <Text style={styles.details}>{result.details}</Text>}
      </View>
      
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 16,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  confidenceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  shareButton: {
    padding: 8,
  },
  messageContainer: {
    padding: 16,
    paddingTop: 0,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
});