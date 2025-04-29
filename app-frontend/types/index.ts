export type ScanResult = {
  id: string;
  content: string;
  result: 'Safe' | 'Scam Detected' | 'Phishing Detected';
  confidence: number;
  timestamp: number;
  details?: string;
  isUrl?: boolean;
};

export type TipItem = {
  id: string;
  title: string;
  content: string;
  category: 'phishing' | 'scam' | 'general';
  icon: string;
};

export type ThemeType = 'light' | 'dark' | 'system';