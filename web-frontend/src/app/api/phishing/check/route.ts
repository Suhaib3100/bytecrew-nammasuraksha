import { NextResponse } from 'next/server';
import type { SafeBrowsingResponse } from '@/types/api';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Analyzing URL:', body.url);
    
    // Call Safe Browsing endpoint
    console.log('Calling Safe Browsing API...');
    const safeBrowsingResponse = await fetch(`${BACKEND_URL}/api/safebrowsing/check-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: body.url }),
    });

    // Log Safe Browsing response status
    console.log('Safe Browsing API response status:', safeBrowsingResponse.status);
    
    if (!safeBrowsingResponse.ok) {
      const errorText = await safeBrowsingResponse.text();
      console.error('Safe Browsing API error:', errorText);
      throw new Error(`Safe Browsing API error: ${safeBrowsingResponse.status} ${errorText}`);
    }

    const safeBrowsingData = await safeBrowsingResponse.json() as SafeBrowsingResponse;
    console.log('Safe Browsing API response:', safeBrowsingData);

    // Prepare the combined result with just Safe Browsing data
    const combinedResult = {
      isPhishing: safeBrowsingData.analysis.isMalicious,
      confidence: safeBrowsingData.analysis.isMalicious ? 1 : 0,
      details: {
        safeBrowsing: {
          threatLevel: safeBrowsingData.analysis.threatLevel,
          threats: safeBrowsingData.analysis.threats,
          totalThreats: safeBrowsingData.analysis.details.totalThreats,
          threatTypes: safeBrowsingData.analysis.details.threatTypes,
          timestamp: safeBrowsingData.analysis.timestamp
        },
        indicators: {},
        phishingCheck: {},
        domainInfo: {}
      },
      recommendations: safeBrowsingData.analysis.recommendations || []
    };

    return NextResponse.json(combinedResult);
  } catch (error) {
    console.error('Error in phishing check API route:', error);
    const errorResponse = {
      error: 'Failed to check URL for phishing',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      isPhishing: false,
      confidence: 0,
      details: {
        safeBrowsing: {
          threatLevel: 'unknown',
          threats: [],
          totalThreats: 0,
          threatTypes: [],
          timestamp: new Date().toISOString()
        }
      },
      recommendations: ['Unable to complete analysis. Please try again later.']
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 