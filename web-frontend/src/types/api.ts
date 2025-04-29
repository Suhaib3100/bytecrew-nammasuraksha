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

export interface MessageAnalysis {
  threatLevel: 'low' | 'medium' | 'high';
  scamType: string;
  indicators: Array<{
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
    url?: string;
    content?: string;
    security?: SecurityAnalysis;
    message?: MessageAnalysis;
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

export interface SafeBrowsingResponse {
  success: boolean;
  analysis: {
    isMalicious: boolean;
    threatLevel: string;
    threats: string[];
    details: {
      totalThreats: number;
      threatTypes: string[];
      affectedPlatforms: string[];
    };
    timestamp: string;
    cachedResult: boolean;
    recommendations: string[];
    url: string;
  };
} 