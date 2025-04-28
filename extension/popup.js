document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab information
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Update status indicator based on current URL
  updateStatusIndicator(tab.url);
  
  // Initialize scan results
  initializeScanResults();
  
  // Set up event listeners
  setupEventListeners();
});

function updateStatusIndicator(url) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusDetails = document.querySelector('.status-details');
  
  // TODO: Implement actual URL checking logic
  // For now, using a simple example
  if (url.includes('phishing')) {
    statusIndicator.style.backgroundColor = 'var(--danger-color)';
    statusDetails.querySelector('h3').textContent = 'Potential Phishing Site';
    statusDetails.querySelector('p').textContent = 'This site may be attempting to steal your information';
  } else {
    statusIndicator.style.backgroundColor = 'var(--success-color)';
    statusDetails.querySelector('h3').textContent = 'Safe Site';
    statusDetails.querySelector('p').textContent = 'No suspicious activity detected';
  }
}

function initializeScanResults() {
  const resultItems = document.querySelectorAll('.result-item');
  
  // TODO: Implement actual scan results
  // For now, using placeholder data
  resultItems.forEach(item => {
    const icon = item.querySelector('.result-icon');
    const text = item.querySelector('span');
    
    // Random status for demonstration
    const isSafe = Math.random() > 0.5;
    icon.style.backgroundColor = isSafe ? 'var(--success-color)' : 'var(--warning-color)';
    text.textContent = isSafe ? 'No issues found' : 'Potential risk detected';
  });
}

function setupEventListeners() {
  // Report phishing button
  document.querySelector('.action-button[data-action="report"]').addEventListener('click', () => {
    // TODO: Implement reporting functionality
    alert('Reporting feature coming soon!');
  });
  
  // Whitelist button
  document.querySelector('.action-button[data-action="whitelist"]').addEventListener('click', () => {
    // TODO: Implement whitelisting functionality
    alert('Whitelisting feature coming soon!');
  });
  
  // Settings button
  document.querySelector('.settings-button').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Update stats
function updateStats() {
  // TODO: Implement actual stats tracking
  // For now, using placeholder data
  const stats = {
    sitesScanned: Math.floor(Math.random() * 1000),
    threatsBlocked: Math.floor(Math.random() * 100)
  };
  
  document.querySelector('.stat-value[data-stat="sites"]').textContent = stats.sitesScanned;
  document.querySelector('.stat-value[data-stat="threats"]').textContent = stats.threatsBlocked;
}

// Initialize stats
updateStats(); 