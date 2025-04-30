// Backend API URL
const API_URL = 'http://localhost:3001/api';

// Known test URLs that should be blocked (fallback only)
const TEST_URLS = [
  // Google Safe Browsing Test URLs
  'testsafebrowsing.appspot.com/s/phishing.html',
  'testsafebrowsing.appspot.com/s/malware.html',
  'testsafebrowsing.appspot.com/s/unwanted.html',
  'malware.testing.google.test/testing/malware/',
  'new-event.com.tr',
  
  // EICAR Test URLs
  'secure.eicar.org/eicar.com',
  'secure.eicar.org/eicar.com.txt',
  
  // Test Pattern URLs (for demonstration)
  'paypal.secure-login.tk',
  'login@fake-bank.ml',
  'bank-secure-login.cf',
  'online-banking.gq',
  
  // APWG Test URLs
  'apwg.org/phishing-test-url'
];

// Suspicious TLD patterns commonly used in phishing
const SUSPICIOUS_TLDS = [
  'tk', 'ml', 'ga', 'cf', 'gq', // Free TLDs often abused
  'xyz', 'top', 'work', 'live', // Commonly abused new TLDs
  'info', 'online', 'site', // Low-cost TLDs used in phishing
];

// Check if a URL is a known test URL (fallback mechanism)
function isTestUrl(url) {
  return TEST_URLS.some(testUrl => url.toLowerCase().includes(testUrl.toLowerCase()));
}

// Fetch WHOIS information for a domain
async function getWhoisInfo(domain) {
  try {
    console.log('Fetching WHOIS data for domain:', domain);
    const response = await fetch(`${API_URL}/whois/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://' + chrome.runtime.id
      },
      body: JSON.stringify({ domain })
    });

    if (!response.ok) {
      throw new Error(`WHOIS API returned ${response.status}`);
    }

    const result = await response.json();
    console.log('WHOIS API response:', result);
    return result.whoisData || {};
  } catch (error) {
    console.error('Error fetching WHOIS data:', error);
    // Return a structured empty object instead of an empty one
    return {
      'Domain Name': domain,
      'Registrar': 'N/A',
      'Creation Date': 'N/A',
      'Updated Date': 'N/A',
      'Expiration Date': 'N/A',
      'Name Servers': 'N/A',
      'Status': 'N/A',
      'DNSSEC': 'N/A',
      'IP Addresses': 'N/A',
      'MX Records': 'N/A',
      'TXT Records': 'N/A'
    };
  }
}

// Format threat information for warning page
function formatThreatInfo(url, result) {
  const threatLevel = result.details?.[0]?.metadata?.threatLevel || 'high';
  const recommendations = result.details?.[0]?.metadata?.recommendations || [
    'Do not enter any personal information',
    'Leave this website immediately',
    'Report this website to appropriate authorities'
  ];

  const reasons = result.details?.map(detail => {
    switch (detail.threatType) {
      case 'MALWARE':
        return 'This website has been identified as a source of malware';
      case 'PHISHING':
        return 'This website may be attempting to steal your personal information';
      case 'SUSPICIOUS_PATTERN':
        return `Suspicious URL pattern detected: ${detail.metadata?.patternType}`;
      default:
        return `Security threat detected: ${detail.threatType}`;
    }
  }) || ['This website has been identified as potentially dangerous'];

  return {
    url,
    type: result.details?.[0]?.threatType || 'SUSPICIOUS',
    source: result.source,
    threatLevel,
    reasons,
    recommendations,
    detectedAt: new Date().toISOString()
  };
}

// Get security information sources
function getSecuritySources(result) {
  const sources = [
    {
      name: 'NammaSuraksha Security Check',
      description: 'Our security system has detected potential threats on this website.',
      url: null
    }
  ];

  if (result.source === 'Google Safe Browsing') {
    sources.push({
      name: 'Google Safe Browsing',
      description: 'This website has been flagged by Google\'s Safe Browsing service.',
      url: 'https://safebrowsing.google.com/'
    });
  }

  return sources;
}

// Check if a URL is potentially dangerous using Safe Browsing API
async function checkUrl(url) {
  console.log('Checking URL:', url);

  try {
    const response = await fetch(`${API_URL}/safebrowsing/check-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://' + chrome.runtime.id
      },
      body: JSON.stringify({ 
        url,
        context: {
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      // Fallback to known bad URLs only if API fails
      if (isTestUrl(url)) {
        return createFallbackResponse(url);
      }
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    console.log('SafeBrowsing API Response:', result);

    // Handle the specific API response format
    if (result.success && result.analysis) {
      if (result.analysis.isMalicious) {
        return {
          isPhishing: true,
          source: result.analysis.threatTypes?.join(', ') || 'Malicious URL',
          details: result.analysis.threats.map(threat => ({
            threatType: threat.type,
            platformType: threat.platform,
            threatEntryType: 'URL',
            threat: { url },
            metadata: {
              threatLevel: result.analysis.threatLevel,
              recommendations: result.analysis.recommendations,
              timestamp: result.analysis.timestamp
            }
          }))
        };
      }
    }

    // Check for suspicious patterns
    const urlObj = new URL(url);
    const suspiciousPatterns = [
      { pattern: /^[0-9.]+$/, type: 'IP_ADDRESS' },
      { pattern: /@/, type: 'URL_WITH_AT_SYMBOL' },
      { pattern: /\.(tk|ml|ga|cf|gq)$/, type: 'SUSPICIOUS_TLD' },
      { pattern: /^data:/, type: 'DATA_URL' }
    ];

    const suspiciousMatches = suspiciousPatterns
      .filter(p => p.pattern.test(urlObj.hostname) || p.pattern.test(url))
      .map(p => ({
        threatType: 'SUSPICIOUS_PATTERN',
        platformType: 'ANY_PLATFORM',
        threatEntryType: 'URL',
        threat: { url },
        metadata: { patternType: p.type }
      }));

    if (suspiciousMatches.length > 0) {
      return {
        isPhishing: true,
        source: 'Suspicious URL Pattern',
        details: suspiciousMatches
      };
    }

    return {
      isPhishing: false,
      source: null,
      details: null
    };
  } catch (error) {
    console.error('Error checking URL:', error);
    if (isTestUrl(url)) {
      return createFallbackResponse(url);
    }
    throw error;
  }
}

function createFallbackResponse(url) {
  return {
    isPhishing: true,
    source: 'Known Malicious URL',
    details: [{
      threatType: 'MALWARE',
      platformType: 'ANY_PLATFORM',
      threatEntryType: 'URL',
      threat: { url },
      metadata: {
        threatLevel: 'high',
        recommendations: [
          'This is a known malicious URL',
          'Access has been blocked for your safety',
          'Do not proceed to this website'
        ]
      }
    }]
  };
}

// Listen for navigation events to catch URLs early
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0) {
    try {
      const result = await checkUrl(details.url);
      
      if (result.isPhishing) {
        console.log('Malicious URL detected:', details.url, result);
        
        // Get domain from URL
        const domain = new URL(details.url).hostname;
        console.log('Fetching WHOIS for domain:', domain);
        
        // Fetch WHOIS information
        const whoisInfo = await getWhoisInfo(domain);
        console.log('WHOIS data received:', whoisInfo);
        
        // Format threat information
        const threatInfo = formatThreatInfo(details.url, result);
        
        // Get security sources
        const sources = getSecuritySources(result);

        // Create warning URL with all parameters
        const params = new URLSearchParams();
        params.append('url', details.url);
        params.append('type', threatInfo.type);
        params.append('source', threatInfo.source);
        params.append('threatLevel', threatInfo.threatLevel);
        params.append('reasons', JSON.stringify(threatInfo.reasons));
        params.append('recommendations', JSON.stringify(threatInfo.recommendations));
        params.append('detectedAt', threatInfo.detectedAt);
        params.append('whoisInfo', JSON.stringify(whoisInfo));
        params.append('sources', JSON.stringify(sources));
        params.append('details', JSON.stringify(result.details));

        const warningUrl = chrome.runtime.getURL('warning.html') + '?' + params.toString();
        console.log('Opening warning page with URL:', warningUrl);
        
        // Update the tab with the warning page
        await chrome.tabs.update(details.tabId, { url: warningUrl });
      }
    } catch (error) {
      console.error('Error in navigation listener:', error);
    }
  }
});

// Also check when tabs are updated (backup check)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('warning.html')) {
    try {
      const result = await checkUrl(tab.url);
      
      if (result.isPhishing) {
        console.log('Malicious URL detected:', tab.url, result);
        
        // Get domain from URL
        const domain = new URL(tab.url).hostname;
        console.log('Fetching WHOIS for domain:', domain);
        
        // Fetch WHOIS information
        const whoisInfo = await getWhoisInfo(domain);
        console.log('WHOIS data received:', whoisInfo);
        
        // Format threat information
        const threatInfo = formatThreatInfo(tab.url, result);
        
        // Get security sources
        const sources = getSecuritySources(result);
        
        // Only try to send message if we're not on the warning page
        if (!tab.url.includes('warning.html')) {
          try {
            await chrome.tabs.sendMessage(tabId, {
              type: 'PHISHING_DETECTED',
              url: tab.url,
              details: result.details
            });
          } catch (error) {
            console.log('Could not send message to content script:', error);
          }
        }
        
        // Create warning URL with all parameters
        const params = new URLSearchParams();
        params.append('url', tab.url);
        params.append('type', threatInfo.type);
        params.append('source', threatInfo.source);
        params.append('threatLevel', threatInfo.threatLevel);
        params.append('reasons', JSON.stringify(threatInfo.reasons));
        params.append('recommendations', JSON.stringify(threatInfo.recommendations));
        params.append('detectedAt', threatInfo.detectedAt);
        params.append('whoisInfo', JSON.stringify(whoisInfo));
        params.append('sources', JSON.stringify(sources));
        params.append('details', JSON.stringify(result.details));

        const warningUrl = chrome.runtime.getURL('warning.html') + '?' + params.toString();
        console.log('Opening warning page with URL:', warningUrl);
        
        // Update the tab with the warning page
        await chrome.tabs.update(tabId, { url: warningUrl });
      }
    } catch (error) {
      console.error('Error in tab update listener:', error);
    }
  }
}); 