import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  useColorScheme,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Button from './ui/Button';
import { Clipboard, Link as LinkIcon, X } from 'lucide-react-native';

interface ScanInputProps {
  onSubmit: (text: string, isUrl: boolean) => void;
  isLoading: boolean;
}

export default function ScanInput({ onSubmit, isLoading }: ScanInputProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [text, setText] = useState('');
  const [isUrl, setIsUrl] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), isUrl);
    }
  };

  const clearText = () => {
    setText('');
  };

  const toggleInputType = () => {
    setIsUrl(!isUrl);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        const content = await navigator.clipboard.readText();
        setText(content);
      } else {
        console.warn('Clipboard API not available in this environment');
      }
    } catch (error) {
      console.error('Failed to read from clipboard: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {isUrl ? 'Enter suspicious URL' : 'Enter suspicious message'}
      </Text>
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}>
          {isUrl && (
            <LinkIcon
              size={20}
              color={colors.muted}
              style={styles.inputIcon}
            />
          )}
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: isUrl ? 14 : 16,
              },
            ]}
            placeholder={
              isUrl
                ? 'https://suspicious-website.com'
                : 'Paste suspicious message here...'
            }
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline={!isUrl}
            numberOfLines={isUrl ? 1 : 4}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {text.length > 0 && (
            <TouchableOpacity onPress={clearText} style={styles.clearButton}>
              <X size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.actions}>
          <Button
            title={isUrl ? 'Check URL' : 'Analyze Text'}
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
            isLoading={isLoading}
            style={styles.submitButton}
          />
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.primaryLight },
              ]}
              onPress={toggleInputType}>
              <LinkIcon size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.primaryLight },
              ]}
              onPress={handlePasteFromClipboard}>
              <Clipboard size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: Layout.spacing.xs,
  },
  inputContainer: {
    gap: Layout.spacing.sm,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
  },
  inputIcon: {
    marginRight: Layout.spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  submitButton: {
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
  },
  iconButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});