import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItemData } from '@/components/HistoryItem';

const HISTORY_STORAGE_KEY = 'scamDetector.scanHistory';

export async function getScanHistory(): Promise<HistoryItemData[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving scan history:', error);
    return [];
  }
}

export async function addScanToHistory(historyItem: HistoryItemData): Promise<void> {
  try {
    const existingHistory = await getScanHistory();
    
    // Add new item at the beginning of the array
    const updatedHistory = [historyItem, ...existingHistory];
    
    // Limit history size to prevent excessive storage usage
    const limitedHistory = updatedHistory.slice(0, 100);
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving scan to history:', error);
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing scan history:', error);
  }
}

export async function deleteScanFromHistory(id: string): Promise<void> {
  try {
    const existingHistory = await getScanHistory();
    const updatedHistory = existingHistory.filter(item => item.id !== id);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting scan from history:', error);
  }
}