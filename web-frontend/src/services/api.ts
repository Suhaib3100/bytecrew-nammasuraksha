import { AnalysisResponse, ErrorResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const analyzeWebpage = async (url: string, content: string, userId?: number): Promise<AnalysisResponse | ErrorResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze/webpage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, content, userId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to analyze webpage',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getAnalysisHistory = async (userId?: number): Promise<AnalysisResponse[] | ErrorResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyses${userId ? `?userId=${userId}` : ''}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch analysis history',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; 