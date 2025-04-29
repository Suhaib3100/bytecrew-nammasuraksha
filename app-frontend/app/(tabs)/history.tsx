import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  Animated
} from 'react-native';
import { getScanHistory, clearScanHistory, deleteScanFromHistory } from '@/services/storageService';
import HistoryItem, { HistoryItemData } from '@/components/HistoryItem';
import ResultCard from '@/components/ResultCard';
import { Trash2, X } from 'lucide-react-native';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItemData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const animatedValue = useRef(new Animated.Value(1)).current;

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await getScanHistory();
    setHistory(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleItemPress = (item: HistoryItemData) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleClearHistory = async () => {
    // Platform-specific confirmation
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to clear all history?')) {
        await clearScanHistory();
        loadHistory();
      }
    } else {
      Alert.alert(
        'Clear History',
        'Are you sure you want to delete all scan history?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              await clearScanHistory();
              loadHistory();
            },
          },
        ]
      );
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteScanFromHistory(id);
    loadHistory();
    if (selectedItem?.id === id) {
      setModalVisible(false);
    }
  };

  const renderEmptyHistory = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyText}>
        Your scan history will appear here after you analyze suspicious content.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Scan History</Text>
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearHistory}
          >
            <Trash2 size={18} color="#64748b" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={({ item }) => (
          <HistoryItem 
            item={item} 
            onPress={handleItemPress} 
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!isLoading ? renderEmptyHistory : null}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Result</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <View style={styles.modalContent}>
                <Text style={styles.scannedText}>{selectedItem.text}</Text>
                
                <ResultCard 
                  result={selectedItem.result} 
                  animatedValue={animatedValue}
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(selectedItem.id)}
                  >
                    <Trash2 size={18} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete from History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 40 : 60,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1e293b',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? '80%' : '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  scannedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  modalActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
  },
});