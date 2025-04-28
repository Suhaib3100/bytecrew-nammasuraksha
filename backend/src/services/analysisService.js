const { URL } = require('url');

exports.analyzeWebpageContent = async (content, url) => {
  try {
    // Analyze content for threats
    const threats = await detectThreats(content);
    
    // Analyze URL structure
    const urlAnalysis = analyzeUrlStructure(url);
    
    // Check for suspicious patterns
    const patterns = checkSuspiciousPatterns(content);
    
    return {
      threats,
      urlAnalysis,
      suspiciousPatterns: patterns,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing webpage content:', error);
    throw error;
  }
};

exports.analyzeUrl = async (url) => {
  try {
    // Validate URL format
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }
    
    // Analyze URL structure
    const urlAnalysis = analyzeUrlStructure(url);
    
    // Check for suspicious patterns in URL
    const patterns = checkSuspiciousPatterns(url);
    
    return {
      urlAnalysis,
      suspiciousPatterns: patterns,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error;
  }
};

async function detectThreats(content) {
  const threats = [];
  
  // Check for common malware patterns
  if (content.includes('eval(') || content.includes('document.write(')) {
    threats.push({
      type: 'suspicious_script',
      description: 'Potential malicious script execution detected',
      severity: 'medium'
    });
  }
  
  // Check for iframe injections
  if (content.includes('<iframe') && !content.includes('sandbox')) {
    threats.push({
      type: 'iframe_injection',
      description: 'Unsecured iframe detected',
      severity: 'high'
    });
  }
  
  return threats;
}

function analyzeUrlStructure(url) {
  const parsedUrl = new URL(url);
  return {
    domain: parsedUrl.hostname,
    path: parsedUrl.pathname,
    parameters: parsedUrl.searchParams.toString(),
    protocol: parsedUrl.protocol,
    isSecure: parsedUrl.protocol === 'https:'
  };
}

function checkSuspiciousPatterns(content) {
  const patterns = [];
  
  // Check for suspicious keywords
  const suspiciousKeywords = [
    'password', 'login', 'account', 'verify', 'confirm',
    'update', 'security', 'alert', 'warning', 'error'
  ];
  
  suspiciousKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      patterns.push({
        type: 'suspicious_keyword',
        keyword: keyword,
        severity: 'low'
      });
    }
  });
  
  // Check for suspicious URL patterns
  if (content.includes('http://') && !content.includes('https://')) {
    patterns.push({
      type: 'insecure_protocol',
      description: 'Insecure HTTP protocol detected',
      severity: 'high'
    });
  }
  
  return patterns;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 