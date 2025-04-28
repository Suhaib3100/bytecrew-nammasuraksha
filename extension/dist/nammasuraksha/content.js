// Configuration
const API_ENDPOINT = 'http://localhost:3000/api/analyze';
const SCAN_INTERVAL = 5000; // 5 seconds between scans

// Store analyzed links to avoid duplicate API calls
const analyzedLinks = new Map();

// Function to analyze a URL
async function analyzeUrl(url) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: url,
        sourceType: 'Web'
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return null;
  }
}

// Function to highlight a phishing link
function highlightLink(link, result) {
  if (!link.classList.contains('phishing-detected')) {
    link.classList.add('phishing-detected');
    
    // Create warning icon
    const warningIcon = document.createElement('span');
    warningIcon.className = 'phishing-warning-icon';
    warningIcon.innerHTML = '⚠️';
    warningIcon.title = `❗ Phishing link – ${result.linkCategory} (${result.confidenceScore}% confidence)`;
    
    // Insert warning icon after the link
    link.parentNode.insertBefore(warningIcon, link.nextSibling);
    
    // Update badge count
    chrome.runtime.sendMessage({ type: 'updateBadge', count: 1 });
  }
}

// Function to scan all links on the page
async function scanPage() {
  const links = document.getElementsByTagName('a');
  let phishingCount = 0;

  for (const link of links) {
    const url = link.href;
    
    // Skip if already analyzed or invalid URL
    if (!url || analyzedLinks.has(url)) continue;
    
    // Get user settings
    const settings = await chrome.storage.sync.get({
      autoScan: true,
      confidenceThreshold: 80
    });

    if (!settings.autoScan) continue;

    const result = await analyzeUrl(url);
    if (result && result.isPhishingLink && result.confidenceScore >= settings.confidenceThreshold) {
      highlightLink(link, result);
      phishingCount++;
    }

    analyzedLinks.set(url, true);
  }

  // Update badge with total phishing count
  if (phishingCount > 0) {
    chrome.runtime.sendMessage({ 
      type: 'updateBadge', 
      count: phishingCount 
    });
  }
}

// Initial scan
scanPage();

// Periodic scanning
setInterval(scanPage, SCAN_INTERVAL);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scanPage') {
    scanPage();
    sendResponse({ status: 'scanning' });
  }
});

// Function to analyze text for phishing indicators
function analyzeText(text) {
  const phishingIndicators = [
    'password',
    'login',
    'account',
    'verify',
    'security',
    'urgent',
    'immediate',
    'suspicious',
    'verify your account',
    'click here',
    'unusual activity',
    'account suspended',
    'limited time offer',
    'congratulations',
    'you have won',
    'claim your prize'
  ];

  let score = 0;
  const foundIndicators = [];

  phishingIndicators.forEach(indicator => {
    if (text.toLowerCase().includes(indicator.toLowerCase())) {
      score++;
      foundIndicators.push(indicator);
    }
  });

  return {
    isPhishing: score > 2,
    score,
    indicators: foundIndicators
  };
}

// Function to analyze links
function analyzeLinks() {
  const links = document.querySelectorAll('a[href]');
  const suspiciousLinks = [];

  links.forEach(link => {
    const href = link.href;
    const text = link.textContent.trim();
    
    // Check for suspicious patterns
    if (
      href.includes('login') ||
      href.includes('password') ||
      href.includes('verify') ||
      href.includes('account') ||
      href.includes('security') ||
      href.includes('click') ||
      href.includes('claim') ||
      href.includes('prize') ||
      href.includes('offer') ||
      href.includes('win')
    ) {
      suspiciousLinks.push({
        href,
        text,
        element: link
      });
    }
  });

  return suspiciousLinks;
}

async function scanAndStoreResults() {
  // Scan for suspicious links
  const suspiciousLinks = analyzeLinks();
  // Scan for suspicious text
  const textContent = document.body.innerText;
  const textAnalysis = analyzeText(textContent);

  // Store results in chrome.storage.local
  await chrome.storage.local.set({
    nammasuraksha_scan_results: {
      url: window.location.href,
      timestamp: Date.now(),
      suspiciousLinks,
      textAnalysis
    }
  });
}

// Scan on page load and when content changes
scanAndStoreResults();
const observer = new MutationObserver(scanAndStoreResults);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

// Listen for requests from popup to get latest scan results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get_scan_results') {
    chrome.storage.local.get('nammasuraksha_scan_results', (data) => {
      sendResponse(data.nammasuraksha_scan_results || null);
    });
    return true; // async response
  }
}); 