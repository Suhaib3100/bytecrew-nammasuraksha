import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from '@/utils/dateFormatter';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Shield } from 'lucide-react-native';
import { ScanResult } from './ResultCard';

export interface HistoryItemData {
  id: string;
  text: string;
  result: ScanResult;
  timestamp: number;
}

interface HistoryItemProps {
  item: HistoryItemData;
  onPress: (item: HistoryItemData) => void;
}

export default function HistoryItem({ item, onPress }: HistoryItemProps) {
  const getStatusIcon = () => {
    switch (item.result.status) {
      case 'safe':
        return <CheckCircle size={20} color="#4ade80" />;
      case 'warning':
        return <AlertCircle size={20} color="#facc15" />;
      case 'danger':
        return <Shield size={20} color="#ef4444" />;
      default:
        return <CheckCircle size={20} color="#4ade80" />;
    }
  };

  const getFormattedText = () => {
    if (item.text.length > 50) {
      return item.text.substring(0, 50) + '...';
    }
    return item.text;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconTextContainer}>
            {getStatusIcon()}
            <Text style={styles.scanText}>{getFormattedText()}</Text>
          </View>
          <Text style={styles.timestamp}>{format(item.timestamp)}</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text 
            style={[
              styles.resultText, 
              { 
                color: 
                  item.result.status === 'safe' ? '#4ade80' : 
                  item.result.status === 'warning' ? '#facc15' : '#ef4444'
              }
            ]}
          >
            {item.result.status === 'safe' ? 'Safe' : 
             item.result.status === 'warning' ? 'Warning' : 'Danger'}
            <Text style={styles.confidenceText}> • {item.result.confidenceScore}% confidence</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  scanText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  confidenceText: {
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
});