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

export interface AnalysisResult {
  url?: string;
  content: string;
  security?: SecurityAnalysis;
  message?: MessageAnalysis;
  recommendations: string[];
  summary: string;
  timestamp: string;
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
    recommendations: [],
    summary: 'Analysis failed',
    timestamp: new Date().toISOString()
  },
  error: error?.response?.data?.error || defaultMessage,
  details: error?.response?.data?.details
});

export const analyzeWebpage = async (url: string, content: string, userId?: string): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze/webpage`, {
      url,
      content,
      userId
    });
    return response.data;
  } catch (error) {
    return {
      ...createErrorResponse(error, 'Failed to analyze webpage'),
      analysis: {
        url,
        content,
        security: {
          threatLevel: 'low',
          threats: [],
          suspiciousPatterns: [],
          isSecure: true
        },
        recommendations: [],
        summary: 'Analysis failed',
        timestamp: new Date().toISOString()
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
    return {
      ...createErrorResponse(error, 'Failed to analyze message'),
      analysis: {
        content,
        message: {
          threatLevel: 'low',
          scamType: 'unknown',
          indicators: [],
          suspiciousPatterns: []
        },
        recommendations: [],
        summary: 'Analysis failed',
        timestamp: new Date().toISOString()
      }
    };
  }
};

export const getAnalysisHistory = async (userId?: number): Promise<AnalysisResponse[]> => {
  try {
    const response = await axios.get<AnalysisResponse[]>(`${API_URL}/analyses${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  } catch (error) {
    return [];
  }
}; 