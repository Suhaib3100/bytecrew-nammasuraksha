// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'scanLink',
    title: 'Scan this link for phishing',
    contexts: ['link']
  });

  // Set default settings
  chrome.storage.sync.set({
    autoScan: true,
    confidenceThreshold: 80
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'scanLink') {
    const url = info.linkUrl;
    
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: url,
          sourceType: 'Web'
        })
      });

      const result = await response.json();
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: result.isPhishingLink ? '⚠️ Phishing Link Detected' : '✅ Link Appears Safe',
        message: `Category: ${result.linkCategory}\nConfidence: ${result.confidenceScore}%`
      });

    } catch (error) {
      console.error('Error analyzing link:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Error',
        message: 'Failed to analyze the link'
      });
    }
  }
});

// Handle badge updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    chrome.action.setBadgeText({
      text: message.count > 0 ? message.count.toString() : '',
      tabId: sender.tab.id
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#FF0000',
      tabId: sender.tab.id
    });
  }
}); 