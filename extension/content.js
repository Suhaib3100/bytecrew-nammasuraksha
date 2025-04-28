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