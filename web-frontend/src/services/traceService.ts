export interface EmailHeaders {
  received: string[];
  returnPath?: string;
  originatingIP?: string;
  messageID?: string;
  authResults?: {
    spf?: {
      result: 'pass' | 'fail' | 'neutral' | 'none';
      domain?: string;
    };
    dkim?: {
      result: 'pass' | 'fail' | 'neutral' | 'none';
      domain?: string;
    };
    dmarc?: {
      result: 'pass' | 'fail' | 'neutral' | 'none';
      policy?: string;
    };
  };
}

export interface DomainReputation {
  score: number; // 0-100
  category?: string;
  blacklisted: boolean;
  blacklistSources?: string[];
  lastReported?: string;
  recentThreats?: {
    type: string;
    date: string;
    description: string;
  }[];
}

export interface TraceResult {
  originalUrl: string;
  redirectChain: {
    url: string;
    statusCode?: number;
    headers?: Record<string, string>;
    ip?: string;
    server?: string;
    location?: string;
  }[];
  finalDestination: {
    url: string;
    ip?: string;
    server?: string;
    sslInfo?: {
      valid: boolean;
      issuer?: string;
      validFrom?: string;
      validTo?: string;
    };
  };
  emailInfo?: {
    headers: EmailHeaders;
    senderDomain: string;
    domainReputation: DomainReputation;
  };
  hostingInfo?: {
    provider?: string;
    datacenter?: string;
    location?: {
      country?: string;
      city?: string;
    };
  };
}

export async function traceUrl(url: string, emailHeaders?: string): Promise<TraceResult> {
  try {
    // First try to get basic URL information without relying on the backend
    const urlObj = new URL(url);
    const basicTrace: TraceResult = {
      originalUrl: url,
      redirectChain: [{
        url: url,
        statusCode: 200,
      }],
      finalDestination: {
        url: url,
        sslInfo: {
          valid: urlObj.protocol === 'https:',
          issuer: urlObj.protocol === 'https:' ? 'SSL Enabled' : 'No SSL',
        }
      },
      hostingInfo: {
        provider: 'Unknown',
        location: {
          country: 'Unknown',
        }
      }
    };

    try {
      // Try to get detailed trace information from backend
      const response = await fetch('/api/trace/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          emailHeaders
        }),
      });

      if (!response.ok) {
        console.warn('Backend trace service unavailable, using basic information');
        return basicTrace;
      }

      const detailedTrace = await response.json();
      return {
        ...basicTrace,
        ...detailedTrace,
        // Ensure we always have at least the basic information
        redirectChain: detailedTrace.redirectChain || basicTrace.redirectChain,
        finalDestination: {
          ...basicTrace.finalDestination,
          ...detailedTrace.finalDestination
        }
      };
    } catch (error) {
      console.warn('Error fetching detailed trace information:', error);
      return basicTrace;
    }
  } catch (error) {
    // If even basic URL parsing fails
    console.error('Error parsing URL:', error);
    throw new Error('Invalid URL format');
  }
}

export function parseEmailHeaders(rawHeaders: string): EmailHeaders {
  const headers: EmailHeaders = {
    received: [],
  };

  // Split headers into lines
  const lines = rawHeaders.split('\n');
  let currentHeader = '';
  let currentValue = '';

  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous header
      currentValue += ' ' + line.trim();
    } else {
      // Save previous header if exists
      if (currentHeader) {
        processHeader(currentHeader, currentValue, headers);
      }
      // Start new header
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentHeader = line.slice(0, colonIndex).toLowerCase().trim();
        currentValue = line.slice(colonIndex + 1).trim();
      }
    }
  }
  // Process last header
  if (currentHeader) {
    processHeader(currentHeader, currentValue, headers);
  }

  return headers;
}

function processHeader(name: string, value: string, headers: EmailHeaders) {
  switch (name) {
    case 'received':
      headers.received.push(value);
      break;
    case 'return-path':
      headers.returnPath = value;
      break;
    case 'x-originating-ip':
      headers.originatingIP = value.replace(/[\[\]]/g, '');
      break;
    case 'message-id':
      headers.messageID = value;
      break;
    case 'authentication-results':
      headers.authResults = parseAuthResults(value);
      break;
  }
}

function parseAuthResults(value: string) {
  const results: EmailHeaders['authResults'] = {};
  
  if (value.includes('spf=')) {
    results.spf = {
      result: extractAuthResult(value, 'spf=') as any,
      domain: extractDomain(value, 'spf=')
    };
  }
  
  if (value.includes('dkim=')) {
    results.dkim = {
      result: extractAuthResult(value, 'dkim=') as any,
      domain: extractDomain(value, 'dkim=')
    };
  }
  
  if (value.includes('dmarc=')) {
    results.dmarc = {
      result: extractAuthResult(value, 'dmarc=') as any,
      policy: extractPolicy(value)
    };
  }

  return results;
}

function extractAuthResult(value: string, prefix: string): string {
  const match = value.match(new RegExp(prefix + '(\\w+)'));
  return match ? match[1] : 'none';
}

function extractDomain(value: string, prefix: string): string | undefined {
  const match = value.match(new RegExp(prefix + '\\w+\\s+domain=(\\S+)'));
  return match ? match[1] : undefined;
}

function extractPolicy(value: string): string | undefined {
  const match = value.match(/policy=(\\S+)/);
  return match ? match[1] : undefined;
} 