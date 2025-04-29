import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Scan, Clipboard as ClipboardIcon, X } from 'lucide-react-native';

interface ScannerInputProps {
  onScan: (text: string) => void;
  isScanning: boolean;
}

export default function ScannerInput({ onScan, isScanning }: ScannerInputProps) {
  const [inputText, setInputText] = useState('');

  const handleClearInput = () => {
    setInputText('');
  };

  const handlePaste = async () => {
    if (Platform.OS === 'web') {
      try {
        const text = await Clipboard.getStringAsync();
        setInputText(text);
      } catch (error) {
        console.error('Failed to paste text:', error);
      }
    } else {
      const text = await Clipboard.getStringAsync();
      setInputText(text);
    }
  };

  const handleScan = () => {
    if (inputText.trim() && !isScanning) {
      onScan(inputText.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Paste suspicious text or URL here..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#94a3b8"
        />
        {inputText ? (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearInput}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.pasteButton} 
          onPress={handlePaste}
        >
          <ClipboardIcon size={18} color="#fff" />
          <Text style={styles.buttonText}>Paste</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.scanButton, 
            (!inputText.trim() || isScanning) && styles.scanButtonDisabled
          ]} 
          onPress={handleScan}
          disabled={!inputText.trim() || isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Scan size={18} color="#fff" />
              <Text style={styles.buttonText}>Analyze</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  clearButton: {
    padding: 10,
    marginRight: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 2,
  },
  scanButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
});