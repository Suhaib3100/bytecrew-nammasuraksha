import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Platform
} from 'react-native';
import TipCard, { TipData } from '@/components/TipCard';
import { scamAwarenessTips } from '@/data/scamAwarenessTips';
import { X, ArrowLeft } from 'lucide-react-native';

export default function AwarenessScreen() {
  const [selectedTip, setSelectedTip] = useState<TipData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  
  const filters = [
    { id: 'all', label: 'All Tips' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social Media' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'banking', label: 'Banking' },
    { id: 'general', label: 'General' },
  ];
  
  const handleTipPress = (tip: TipData) => {
    setSelectedTip(tip);
    setModalVisible(true);
  };
  
  const handleFilterPress = (filterId: string) => {
    setFilter(filterId === 'all' ? null : filterId);
  };
  
  const filteredTips = filter 
    ? scamAwarenessTips.filter(tip => tip.category === filter)
    : scamAwarenessTips;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
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
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Scam Awareness</Text>
        <Text style={styles.subtitle}>
          Learn how to protect yourself from common scams and phishing attempts
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.filterButton,
              filter === item.id || (item.id === 'all' && filter === null)
                ? { backgroundColor: '#3b82f6' }
                : { backgroundColor: '#e2e8f0' }
            ]}
            onPress={() => handleFilterPress(item.id)}
          >
            <Text 
              style={[
                styles.filterText,
                filter === item.id || (item.id === 'all' && filter === null)
                  ? { color: '#fff' }
                  : { color: '#475569' }
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={filteredTips}
        renderItem={({ item }) => (
          <TipCard tip={item} onPress={handleTipPress} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setModalVisible(false)}
              >
                {Platform.OS === 'web' 
                  ? <X size={24} color="#64748b" />
                  : <ArrowLeft size={24} color="#64748b" />
                }
              </TouchableOpacity>
              
              {selectedTip && (
                <View style={[
                  styles.categoryBadge, 
                  { backgroundColor: getCategoryColor(selectedTip.category) + '20' }
                ]}>
                  <Text style={[
                    styles.categoryText, 
                    { color: getCategoryColor(selectedTip.category) }
                  ]}>
                    {selectedTip.category.charAt(0).toUpperCase() + selectedTip.category.slice(1)}
                  </Text>
                </View>
              )}
            </View>
            
            <ScrollView style={styles.modalContent}>
              {selectedTip && (
                <>
                  <Text style={styles.tipTitle}>{selectedTip.title}</Text>
                  <Text style={styles.tipSummary}>{selectedTip.summary}</Text>
                  <Text style={styles.tipContent}>{selectedTip.content}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: Platform.OS === 'web' ? 0 : 20,
    borderTopRightRadius: Platform.OS === 'web' ? 0 : 20,
    marginTop: Platform.OS === 'web' ? 0 : 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  modalContent: {
    padding: 20,
  },
  tipTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 12,
  },
  tipSummary: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#475569',
    marginBottom: 24,
    lineHeight: 26,
  },
  tipContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
});