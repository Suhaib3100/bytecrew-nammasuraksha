import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react-native';

export interface TipData {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'email' | 'social' | 'shopping' | 'banking' | 'general';
}

interface TipCardProps {
  tip: TipData;
  onPress: (tip: TipData) => void;
}

export default function TipCard({ tip, onPress }: TipCardProps) {
  const getCategoryColor = () => {
    switch (tip.category) {
      case 'email':
        return '#3b82f6'; // blue
      case 'social':
        return '#8b5cf6'; // purple
      case 'shopping':
        return '#10b981'; // emerald
      case 'banking':
        return '#ef4444'; // red
      case 'general':
      default:
        return '#f59e0b'; // amber
    }
  };

  const getCategoryName = () => {
    switch (tip.category) {
      case 'email':
        return 'Email';
      case 'social':
        return 'Social Media';
      case 'shopping':
        return 'Shopping';
      case 'banking':
        return 'Banking';
      case 'general':
      default:
        return 'General';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(tip)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() + '20' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
            {getCategoryName()}
          </Text>
        </View>
        <AlertTriangle size={18} color={getCategoryColor()} />
      </View>
      
      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.summary}>{tip.summary}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.readMore}>Read more</Text>
        <ChevronRight size={16} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  summary: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 4,
  },
});