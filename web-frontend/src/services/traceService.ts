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
  safetyAnalysis?: {
    isMalicious: boolean;
    threats: string[];
    confidence: number;
    details: string[];
  };
}

interface SafeBrowsingResult {
  malicious: boolean;
  threats: string[];
  platformTypes?: string[];
  threatTypes?: string[];
}

export async function checkUrlSafety(url: string): Promise<SafeBrowsingResult> {
  try {
    const response = await fetch('https://safebrowsing.googleapis.com/v4/threatMatches:find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: "bytecrew-nammasuraksha",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      })
    });

    const data = await response.json();
    return {
      malicious: data.matches?.length > 0,
      threats: data.matches?.map((match: any) => match.threatType) || [],
      platformTypes: data.matches?.map((match: any) => match.platformType) || [],
      threatTypes: data.matches?.map((match: any) => match.threatType) || []
    };
  } catch (error) {
    console.error('Error checking URL safety:', error);
    return {
      malicious: false,
      threats: [],
      platformTypes: [],
      threatTypes: []
    };
  }
}

export async function traceUrl(url: string, emailHeaders?: string): Promise<TraceResult> {
  try {
    const urlObj = new URL(url);
    const redirectChain = [];
    let currentUrl = url;
    let finalUrl = url;
    let isShortener = false;
    let safetyInfo = null;

    const shortenerDomains = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'rebrand.ly', 'ow.ly', 
      'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc', 'shorte.st', 'cutt.ly'
    ];

    isShortener = shortenerDomains.some(domain => urlObj.hostname.includes(domain));

    try {
      // Follow redirects with full request to catch client-side redirects
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response = await fetch(currentUrl, {
        method: 'GET',  // Use GET to catch JavaScript redirects
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      clearTimeout(timeout);

      redirectChain.push({
        url: currentUrl,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Follow redirects (both HTTP and meta refreshes)
      let redirectCount = 0;
      while (redirectCount < 5) {
        if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
          const location = response.headers.get('location');
          if (!location) break;

          currentUrl = new URL(location, currentUrl).href;
        } else if (response.status === 200) {
          // Check for meta refresh or JavaScript redirects in the HTML
          const text = await response.text();
          const metaRefresh = text.match(/<meta[^>]*?url=([^"'>]+)[^>]*?>/i);
          const jsRedirect = text.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);
          
          const redirectUrl = metaRefresh?.[1] || jsRedirect?.[1];
          if (redirectUrl) {
            currentUrl = new URL(redirectUrl, currentUrl).href;
          } else {
            break;
          }
        } else {
          break;
        }

        const nextResponse = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        redirectChain.push({
          url: currentUrl,
          statusCode: nextResponse.status,
          headers: Object.fromEntries(nextResponse.headers.entries()),
        });

        response = nextResponse;
        redirectCount++;
        finalUrl = currentUrl;

        // Check URL safety at each redirect
        const urlSafety = await checkUrlSafety(currentUrl);
        if (urlSafety.malicious) {
          safetyInfo = urlSafety;
          break;
        }
      }
    } catch (error) {
      console.warn('Error following redirects:', error);
    }

    // Final safety check if not already detected as malicious
    if (!safetyInfo) {
      safetyInfo = await checkUrlSafety(finalUrl);
    }

    const finalUrlObj = new URL(finalUrl);
    const basicTrace: TraceResult = {
      originalUrl: url,
      redirectChain,
      finalDestination: {
        url: finalUrl,
        sslInfo: {
          valid: finalUrlObj.protocol === 'https:',
          issuer: finalUrlObj.protocol === 'https:' ? 'SSL Enabled' : 'No SSL',
        }
      },
      hostingInfo: {
        provider: isShortener ? `${urlObj.hostname} (URL Shortener)` : urlObj.hostname,
        location: {
          country: 'Unknown',
        }
      },
      safetyAnalysis: {
        isMalicious: safetyInfo?.malicious || false,
        threats: safetyInfo?.threats || [],
        confidence: safetyInfo?.malicious ? 100 : 0,
        details: safetyInfo?.threatTypes || []
      }
    };

    try {
      const response = await fetch('/api/trace/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: finalUrl,
          originalUrl: url,
          redirectChain,
          emailHeaders,
          safetyInfo
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
        redirectChain: redirectChain.length > 0 ? redirectChain : basicTrace.redirectChain,
        finalDestination: {
          ...basicTrace.finalDestination,
          ...detailedTrace.finalDestination
        },
        safetyAnalysis: {
          ...basicTrace.safetyAnalysis,
          ...detailedTrace.safetyAnalysis
        }
      };
    } catch (error) {
      console.warn('Error fetching detailed trace information:', error);
      return basicTrace;
    }
  } catch (error) {
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