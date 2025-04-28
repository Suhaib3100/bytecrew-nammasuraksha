export interface SecurityAnalysis {
  threatLevel: 'low' | 'medium' | 'high';
  isSecure: boolean;
  threats: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suspiciousPatterns: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: {
    url: string;
    security: SecurityAnalysis;
    recommendations: string[];
    summary: string;
    timestamp: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
} 