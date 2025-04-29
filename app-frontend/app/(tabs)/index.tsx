import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from 'react-native';
import ScannerInput from '@/components/ScannerInput';
import ResultCard, { ScanResult } from '@/components/ResultCard';
import { analyzeContent } from '@/services/scannerService';
import { addScanToHistory } from '@/services/storageService';
import { HistoryItemData } from '@/components/HistoryItem';

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (scanResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [scanResult]);
  
  const handleScan = async (text: string) => {
    setIsScanning(true);
    setScanResult(null);
    fadeAnim.setValue(0);
    
    try {
      const result = await analyzeContent(text);
      setScanResult(result);
      
      // Save to history
      const historyItem: HistoryItemData = {
        id: Date.now().toString(),
        text,
        result,
        timestamp: Date.now(),
      };
      
      await addScanToHistory(historyItem);
    } catch (error) {
      console.error('Error scanning content:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Scam Scanner</Text>
          <Text style={styles.subtitle}>
            Check suspicious messages or links for potential scams and phishing attempts
          </Text>
        </View>
        
        <ScannerInput onScan={handleScan} isScanning={isScanning} />
        
        {scanResult && (
          <ResultCard result={scanResult} animatedValue={fadeAnim} />
        )}
        
        {!scanResult && !isScanning && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to use</Text>
            <Text style={styles.instructionsText}>
              1. Paste a suspicious message or URL{'\n'}
              2. Tap "Analyze" to check for potential threats{'\n'}
              3. Review the detailed analysis results{'\n'}
              4. Check the "Awareness" tab for more tips
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginTop: Platform.OS === 'web' ? 40 : 60,
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
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  instructionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  instructionsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
});