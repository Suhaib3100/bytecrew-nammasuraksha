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

// Check if a URL is potentially dangerous using Safe Browsing API
async function checkUrl(url) {
  console.log('Checking URL:', url);

  try {
    // Always try the SafeBrowsing API first
    const response = await fetch(`${API_URL}/safebrowsing/check-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://' + chrome.runtime.id
      },
      body: JSON.stringify({ 
        url,
        context: {
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        }
      }),
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
    
    // Check for suspicious patterns if API doesn't detect threats
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
    console.log('Navigation detected:', details.url);
    try {
      const result = await checkUrl(details.url);
      
      if (result.isPhishing) {
        console.log('Malicious URL detected:', details.url, result);
        // Redirect to warning page with detailed information
        chrome.tabs.update(details.tabId, {
          url: `warning.html?url=${encodeURIComponent(details.url)}&source=${encodeURIComponent(result.source)}&details=${encodeURIComponent(JSON.stringify(result.details))}`
        });
      }
    } catch (error) {
      console.error('Error in navigation listener:', error);
    }
  }
});

// Also check when tabs are updated (backup check)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    try {
      const result = await checkUrl(tab.url);
      
      if (result.isPhishing) {
        console.log('Malicious URL detected:', tab.url, result);
        chrome.tabs.sendMessage(tabId, {
          type: 'PHISHING_DETECTED',
          url: tab.url,
          details: result.details
        });
        
        chrome.tabs.update(tabId, {
          url: `warning.html?url=${encodeURIComponent(tab.url)}&source=${encodeURIComponent(result.source)}&details=${encodeURIComponent(JSON.stringify(result.details))}`
        });
      }
    } catch (error) {
      console.error('Error in tab update listener:', error);
    }
  }
}); 