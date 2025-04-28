import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface SecurityAnalysis {
  threatLevel: 'low' | 'medium' | 'high';
  threats: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suspiciousPatterns: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  isSecure: boolean;
}

export interface MessageAnalysis {
  threatLevel: 'low' | 'medium' | 'high';
  scamType: string;
  indicators: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suspiciousPatterns: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface BasicAnalysis {
  length: number;
  hasLinks: boolean;
  hasPhoneNumbers: boolean;
  hasEmails: boolean;
  hasUrgencyWords: boolean;
  hasThreateningWords: boolean;
  hasSuspiciousKeywords: boolean;
}

export interface AIAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'unknown';
  scamType?: string;
  indicators: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suspiciousPatterns: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  summary: string;
}

export interface AnalysisResult {
  content: string;
  basicAnalysis: BasicAnalysis;
  aiAnalysis: AIAnalysis;
  timestamp: string;
  error?: string;
  recommendations: string[];
  summary: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface AnalysisResponse extends ApiResponse<AnalysisResult> {
  analysis: AnalysisResult;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

const createErrorResponse = (error: any, defaultMessage: string): AnalysisResponse => ({
  success: false,
  analysis: {
    content: '',
    basicAnalysis: {
      length: 0,
      hasLinks: false,
      hasPhoneNumbers: false,
      hasEmails: false,
      hasUrgencyWords: false,
      hasThreateningWords: false,
      hasSuspiciousKeywords: false
    },
    aiAnalysis: {
      threatLevel: 'unknown',
      indicators: [],
      suspiciousPatterns: [],
      recommendations: ['Unable to complete analysis due to an error'],
      summary: 'Analysis could not be completed due to an error'
    },
    timestamp: new Date().toISOString(),
    error: error?.message || defaultMessage,
    recommendations: ['Unable to complete analysis due to an error'],
    summary: 'Analysis could not be completed due to an error'
  },
  error: error?.response?.data?.error || defaultMessage,
  details: error?.response?.data?.details
});

export const analyzeWebpage = async (url: string, userId?: string): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze/webpage`, {
      url,
      userId
    });
    return response.data;
  } catch (error: any) {
    return {
      ...createErrorResponse(error, 'Failed to analyze webpage'),
      analysis: {
        content: '',
        basicAnalysis: {
          length: 0,
          hasLinks: false,
          hasPhoneNumbers: false,
          hasEmails: false,
          hasUrgencyWords: false,
          hasThreateningWords: false,
          hasSuspiciousKeywords: false
        },
        aiAnalysis: {
          threatLevel: 'unknown',
          indicators: [],
          suspiciousPatterns: [],
          recommendations: ['Unable to complete analysis due to an error'],
          summary: 'Analysis could not be completed due to an error'
        },
        timestamp: new Date().toISOString(),
        error: error?.message || 'Failed to analyze webpage',
        recommendations: ['Unable to complete analysis due to an error'],
        summary: 'Analysis failed'
      }
    };
  }
};

export const analyzeMessage = async (content: string, userId?: string): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze/message`, {
      content,
      userId
    });
    return response.data;
  } catch (error) {
    return createErrorResponse(error, 'Failed to analyze message');
  }
};

export const getAnalysisHistory = async (userId?: number): Promise<AnalysisResponse[]> => {
  try {
    const response = await axios.get<AnalysisResponse[]>(`${API_URL}/analyze/history`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return [];
  }
}; 