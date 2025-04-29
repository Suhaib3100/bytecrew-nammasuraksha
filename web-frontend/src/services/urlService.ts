// Common URL shortener domains
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'tiny.cc',
  'shorte.st',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
  'rebrand.ly'
];

export interface DomainInfo {
  registrar?: string;
  creationDate?: string;
  organization?: string;
  country?: string;
  lastUpdated?: string;
  expiryDate?: string;
  isWhoisPrivacyEnabled?: boolean;
  nameservers?: string[];
}

export interface UrlInfo {
  originalUrl: string;
  finalUrl: string | null;
  isShortened: boolean;
  shortenerService: string | null;
  redirectChain: string[];
  domainInfo?: DomainInfo;
  error?: string;
}

export async function analyzeUrl(url: string): Promise<UrlInfo> {
  try {
    const urlObj = new URL(url);
    const isShortened = URL_SHORTENERS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );

    // Get domain information regardless of whether it's shortened
    const domainResponse = await fetch('/api/domain/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain: urlObj.hostname }),
    });

    let domainInfo: DomainInfo | undefined;
    if (domainResponse.ok) {
      domainInfo = await domainResponse.json();
    }

    if (!isShortened) {
      return {
        originalUrl: url,
        finalUrl: null,
        isShortened: false,
        shortenerService: null,
        redirectChain: [url],
        domainInfo
      };
    }

    const shortenerService = URL_SHORTENERS.find(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    ) || null;

    // Use our backend service to follow redirects safely
    const response = await fetch('/api/url/unshorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to unshorten URL');
    }

    const data = await response.json();

    // If it's a shortened URL, get domain info for the final URL as well
    let finalDomainInfo: DomainInfo | undefined;
    if (data.finalUrl) {
      const finalUrlObj = new URL(data.finalUrl);
      const finalDomainResponse = await fetch('/api/domain/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: finalUrlObj.hostname }),
      });

      if (finalDomainResponse.ok) {
        finalDomainInfo = await finalDomainResponse.json();
      }
    }
    
    return {
      originalUrl: url,
      finalUrl: data.finalUrl,
      isShortened: true,
      shortenerService,
      redirectChain: data.redirectChain || [url, data.finalUrl],
      domainInfo: finalDomainInfo || domainInfo
    };
  } catch (error) {
    return {
      originalUrl: url,
      finalUrl: null,
      isShortened: false,
      shortenerService: null,
      redirectChain: [url],
      error: error instanceof Error ? error.message : 'Failed to analyze URL'
    };
  }
} 