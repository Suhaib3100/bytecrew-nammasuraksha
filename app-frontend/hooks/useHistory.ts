import { useState, useEffect } from 'react';
import { ScanResult } from '@/types';

// This would typically use AsyncStorage or another storage mechanism
// For simplicity, we're using in-memory storage for this demo
const useHistory = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);

  // In a real app, you would load history from storage on init
  useEffect(() => {
    // Simulate loading from storage
    const mockHistory: ScanResult[] = [
      {
        id: '1',
        content: 'Congratulations! You\'ve won a free iPhone. Click here to claim your prize now!',
        result: 'Scam Detected',
        confidence: 0.92,
        timestamp: Date.now() - 86400000, // 1 day ago
        details: 'This message shows classic signs of a scam. It offers an unlikely prize to entice you to click a link.',
        isUrl: false,
      },
      {
        id: '2',
        content: 'https://amaz0n-secure.com/verify-account',
        result: 'Phishing Detected',
        confidence: 0.95,
        timestamp: Date.now() - 172800000, // 2 days ago
        details: 'This URL is a phishing attempt. It mimics a legitimate site but uses a slightly altered domain name.',
        isUrl: true,
      },
      {
        id: '3',
        content: 'Your meeting is scheduled for tomorrow at 2 PM. Please confirm your attendance.',
        result: 'Safe',
        confidence: 0.88,
        timestamp: Date.now() - 259200000, // 3 days ago
        details: 'This message appears to be a legitimate meeting confirmation without suspicious elements.',
        isUrl: false,
      },
    ];
    
    setHistory(mockHistory);
  }, []);

  const addToHistory = (result: ScanResult) => {
    setHistory((prev) => [result, ...prev]);
    // In a real app, you would also save to storage here
  };

  const clearHistory = () => {
    setHistory([]);
    // In a real app, you would also clear storage here
  };

  const getHistoryByResult = (resultType: 'Safe' | 'Scam Detected' | 'Phishing Detected') => {
    return history.filter((item) => item.result === resultType);
  };

  const getHistoryStats = () => {
    const safe = history.filter((item) => item.result === 'Safe').length;
    const scams = history.filter((item) => item.result === 'Scam Detected').length;
    const phishing = history.filter((item) => item.result === 'Phishing Detected').length;
    const total = history.length;
    
    return { safe, scams, phishing, total };
  };

  return {
    history,
    addToHistory,
    clearHistory,
    getHistoryByResult,
    getHistoryStats,
  };
};

export default useHistory;