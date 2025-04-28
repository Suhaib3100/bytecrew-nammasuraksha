const axios = require('axios');
const { URL } = require('url');

exports.checkPhishingUrl = async (url) => {
  try {
    // Validate URL format
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }
    
    // Check URL against known phishing databases
    const phishingCheck = await checkAgainstPhishingDatabases(url);
    
    // Analyze URL for phishing indicators
    const indicators = analyzePhishingIndicators(url);
    
    // Check domain age and registration
    const domainInfo = await getDomainInfo(url);
    
    // Calculate confidence score
    const confidence = calculateConfidenceScore(phishingCheck, indicators, domainInfo);
    
    return {
      isPhishing: confidence > 0.7,
      confidence,
      details: {
        phishingCheck,
        indicators,
        domainInfo
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking URL for phishing:', error);
    throw error;
  }
};

async function checkAgainstPhishingDatabases(url) {
  try {
    // Check URL against multiple phishing databases
    const results = await Promise.all([
      checkGoogleSafeBrowsing(url),
      checkPhishTank(url),
      checkOpenPhish(url)
    ]);
    
    return {
      isListed: results.some(result => result.isListed),
      sources: results.map(result => result.source),
      details: results
    };
  } catch (error) {
    console.error('Error checking against phishing databases:', error);
    return { isListed: false, sources: [], details: [] };
  }
}

function analyzePhishingIndicators(url) {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  
  // Common phishing indicators
  const indicators = {
    suspiciousCharacters: /[^\w.-]/g.test(domain),
    longDomain: domain.length > 30,
    multipleSubdomains: domain.split('.').length > 3,
    ipAddress: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain),
    https: parsedUrl.protocol === 'https:',
    suspiciousKeywords: checkSuspiciousKeywords(domain)
  };
  
  return indicators;
}

async function getDomainInfo(url) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Get domain registration information
    const response = await axios.get(`https://api.example.com/domain-info?domain=${domain}`);
    return {
      age: response.data.age,
      registrar: response.data.registrar,
      creationDate: response.data.creationDate,
      expirationDate: response.data.expirationDate
    };
  } catch (error) {
    console.error('Error getting domain info:', error);
    return null;
  }
}

function calculateConfidenceScore(phishingCheck, indicators, domainInfo) {
  let score = 0;
  
  // Weight for each indicator
  const weights = {
    databaseMatch: 0.4,
    suspiciousCharacters: 0.1,
    longDomain: 0.05,
    multipleSubdomains: 0.05,
    ipAddress: 0.2,
    https: -0.1,
    suspiciousKeywords: 0.1,
    domainAge: 0.1
  };
  
  // Calculate score based on indicators
  if (phishingCheck.isListed) score += weights.databaseMatch;
  if (indicators.suspiciousCharacters) score += weights.suspiciousCharacters;
  if (indicators.longDomain) score += weights.longDomain;
  if (indicators.multipleSubdomains) score += weights.multipleSubdomains;
  if (indicators.ipAddress) score += weights.ipAddress;
  if (indicators.https) score += weights.https;
  if (indicators.suspiciousKeywords) score += weights.suspiciousKeywords;
  
  // Consider domain age
  if (domainInfo && domainInfo.age < 30) {
    score += weights.domainAge;
  }
  
  return Math.min(Math.max(score, 0), 1);
}

function checkSuspiciousKeywords(domain) {
  const suspiciousKeywords = [
    'login',
    'secure',
    'account',
    'verify',
    'update',
    'confirm',
    'bank',
    'paypal',
    'amazon',
    'apple'
  ];
  
  return suspiciousKeywords.some(keyword => 
    domain.toLowerCase().includes(keyword)
  );
}

async function checkGoogleSafeBrowsing(url) {
  try {
    const response = await axios.post('https://safebrowsing.googleapis.com/v4/threatMatches:find', {
      client: {
        clientId: 'your-client-id',
        clientVersion: '1.0.0'
      },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }]
      }
    });
    
    return {
      source: 'Google Safe Browsing',
      isListed: response.data.matches && response.data.matches.length > 0,
      details: response.data
    };
  } catch (error) {
    console.error('Error checking Google Safe Browsing:', error);
    return { source: 'Google Safe Browsing', isListed: false, details: null };
  }
}

async function checkPhishTank(url) {
  try {
    const response = await axios.get(`https://checkurl.phishtank.com/checkurl/?url=${url}&format=json`);
    return {
      source: 'PhishTank',
      isListed: response.data.results.valid,
      details: response.data
    };
  } catch (error) {
    console.error('Error checking PhishTank:', error);
    return { source: 'PhishTank', isListed: false, details: null };
  }
}

async function checkOpenPhish(url) {
  try {
    const response = await axios.get(`https://api.openphish.com/v1/url/${url}`);
    return {
      source: 'OpenPhish',
      isListed: response.data.status === 'phishing',
      details: response.data
    };
  } catch (error) {
    console.error('Error checking OpenPhish:', error);
    return { source: 'OpenPhish', isListed: false, details: null };
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 