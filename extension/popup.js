document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Request scan results from content script
  chrome.tabs.sendMessage(tab.id, { type: 'get_scan_results' }, (results) => {
    renderScanResults(results);
  });

  // Set up event listeners
  setupEventListeners();
  updateStats();
});

function renderScanResults(results) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusTitle = document.getElementById('statusTitle');
  const statusDescription = document.getElementById('statusDescription');
  const resultsGrid = document.querySelector('.results-grid');

  if (!results) {
    statusIndicator.style.backgroundColor = 'var(--warning-color)';
    statusTitle.textContent = 'No Data';
    statusDescription.textContent = 'No scan results available for this page.';
    resultsGrid.innerHTML = '<div style="grid-column: span 2; text-align:center; color:#888;">No threats detected or scan not run yet.</div>';
    return;
  }

  // Show summary
  if (results.textAnalysis.isPhishing || (results.suspiciousLinks && results.suspiciousLinks.length > 0)) {
    statusIndicator.style.backgroundColor = 'var(--danger-color)';
    statusTitle.textContent = 'Threats Detected!';
    statusDescription.textContent = 'Suspicious content or links found on this page.';
  } else {
    statusIndicator.style.backgroundColor = 'var(--success-color)';
    statusTitle.textContent = 'Safe Site';
    statusDescription.textContent = 'No suspicious activity detected.';
  }

  // Show details in results grid
  let html = '';
  if (results.textAnalysis.isPhishing) {
    html += `<div class="result-item" style="grid-column: span 2; background:var(--danger-color);color:white;">
      <div class="result-icon" style="background:var(--danger-color);"></div>
      <span>Phishing keywords: ${results.textAnalysis.indicators.join(', ')}</span>
    </div>`;
  }
  if (results.suspiciousLinks && results.suspiciousLinks.length > 0) {
    results.suspiciousLinks.forEach(link => {
      html += `<div class="result-item" style="background:var(--warning-color);color:#222;">
        <div class="result-icon" style="background:var(--warning-color);"></div>
        <span>Suspicious link: <a href="${link.href}" target="_blank" style="color:#1d4ed8;">${link.text || link.href}</a></span>
      </div>`;
    });
  }
  if (!html) {
    html = '<div style="grid-column: span 2; text-align:center; color:#888;">No threats detected.</div>';
  }
  resultsGrid.innerHTML = html;
}

function setupEventListeners() {
  document.getElementById('reportButton').addEventListener('click', () => {
    alert('Reporting feature coming soon!');
  });
  document.getElementById('whitelistButton').addEventListener('click', () => {
    alert('Whitelisting feature coming soon!');
  });
  document.getElementById('settingsButton').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

function updateStats() {
  // Placeholder stats
  document.getElementById('sitesScanned').textContent = Math.floor(Math.random() * 1000);
  document.getElementById('threatsBlocked').textContent = Math.floor(Math.random() * 100);
} 