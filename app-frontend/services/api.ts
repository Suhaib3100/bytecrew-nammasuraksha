import { ScanResult } from '@/types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the development server URL for mobile devices
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3001';
  }
  
  // Get the local IP address from Expo development server
  const debuggerHost = Constants.expoConfig?.hostUri || 'localhost:3001';
  const localhost = debuggerHost.split(':')[0];
  
  return `http://${localhost}:3001`;
};

const API_BASE_URL = getBaseUrl();

// Helper function to convert threat level to confidence score
const getThreatConfidence = (threatLevel: string): number => {
  switch (threatLevel.toLowerCase()) {
    case 'high':
      return 0.9;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.4;
    default:
      return 0.5;
  }
};

// Helper function to determine result type from analysis
const getResultType = (analysis: any): 'Safe' | 'Scam Detected' | 'Phishing Detected' => {
  const threatLevel = analysis.threatLevel?.toLowerCase();
  const scamType = analysis.scamType?.toLowerCase();
  
  if (threatLevel === 'high') {
    return scamType?.includes('phish') ? 'Phishing Detected' : 'Scam Detected';
  } else if (threatLevel === 'medium') {
    return 'Scam Detected';
  }
  return 'Safe';
};

export const analyzeText = async (
  text: string,
  isUrl: boolean
): Promise<ScanResult> => {
  try {
    if (isUrl) {
      // URL scanning endpoint using Google Safe Browsing
      const response = await fetch(`${API_BASE_URL}/api/safebrowsing/check-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url: text }),
      });

      if (!response.ok) {
        throw new Error('URL scan failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'URL scan failed');
      }

      const analysis = data.analysis;
      return {
        id: Math.random().toString(36).substring(2, 9),
        content: text,
        result: analysis.isMalicious ? 
          (analysis.threatLevel === 'high' ? 'Phishing Detected' : 'Scam Detected') : 
          'Safe',
        confidence: getThreatConfidence(analysis.threatLevel),
        timestamp: Date.now(),
        details: analysis.recommendations?.join('\n') || 
                (analysis.isMalicious ? 'Threats detected in this URL' : 'This URL appears to be safe'),
        isUrl: true,
      };
    } else {
      // Message analysis endpoint
      const response = await fetch(`${API_BASE_URL}/api/analyze/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error('Message analysis failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Message analysis failed');
      }

      const analysis = data.analysis;
      const aiAnalysis = analysis.aiAnalysis;
      const basicAnalysis = analysis.basicAnalysis;
      
      // Combine AI and basic analysis for a comprehensive result
      const hasSuspiciousPatterns = basicAnalysis.hasUrgencyWords || 
                                   basicAnalysis.hasThreateningWords || 
                                   basicAnalysis.hasSuspiciousKeywords;
                                   
      const details = [
        aiAnalysis.summary,
        ...(aiAnalysis.recommendations || []),
        hasSuspiciousPatterns ? '\nSuspicious patterns detected:' : '',
        basicAnalysis.hasUrgencyWords ? '- Contains urgency words' : '',
        basicAnalysis.hasThreateningWords ? '- Contains threatening words' : '',
        basicAnalysis.hasSuspiciousKeywords ? '- Contains suspicious keywords' : '',
        basicAnalysis.hasLinks ? '- Contains links' : '',
        basicAnalysis.hasPhoneNumbers ? '- Contains phone numbers' : '',
        basicAnalysis.hasEmails ? '- Contains email addresses' : '',
      ].filter(Boolean).join('\n');

      return {
        id: Math.random().toString(36).substring(2, 9),
        content: text,
        result: getResultType(aiAnalysis),
        confidence: getThreatConfidence(aiAnalysis.threatLevel),
        timestamp: Date.now(),
        details,
        isUrl: false,
      };
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};