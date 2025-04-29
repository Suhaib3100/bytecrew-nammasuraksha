// Get URL parameters
function getUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    dangerousUrl: urlParams.get('url'),
    sourceType: urlParams.get('source'),
    threatDetails: JSON.parse(decodeURIComponent(urlParams.get('details') || '[]'))
  };
}

// Format threat information
function formatThreatInfo(threat) {
  let html = '<div class="threat-item">';
  
  // Add threat type
  html += `<p><span class="threat-type">Threat Type:</span> ${threat.threatType}</p>`;
  
  // Add platform information if available
  if (threat.platformType) {
    html += `<p><span class="threat-type">Platform:</span> ${threat.platformType}</p>`;
  }

  // Add metadata information if available
  if (threat.metadata) {
    if (threat.metadata.threatLevel) {
      html += `<p><span class="threat-type">Threat Level:</span> ${threat.metadata.threatLevel.toUpperCase()}</p>`;
    }
    
    if (threat.metadata.recommendations && threat.metadata.recommendations.length > 0) {
      html += '<div class="recommendations">';
      html += '<p><span class="threat-type">Recommendations:</span></p>';
      html += '<ul>';
      threat.metadata.recommendations.forEach(rec => {
        html += `<li>${rec}</li>`;
      });
      html += '</ul>';
      html += '</div>';
    }

    if (threat.metadata.timestamp) {
      html += `<p><span class="threat-type">Detection Time:</span> ${new Date(threat.metadata.timestamp).toLocaleString()}</p>`;
    }
  }

  html += '</div>';
  return html;
}

// Display threat information
function displayThreatInfo() {
  const { dangerousUrl, sourceType, threatDetails } = getUrlParameters();

  // Display the dangerous URL
  document.getElementById('dangerous-url').textContent = dangerousUrl || 'Unknown URL';

  // Display threat details
  const threatDetailsElement = document.getElementById('threat-details');
  if (threatDetails && threatDetails.length > 0) {
    const threatHtml = threatDetails.map(formatThreatInfo).join('');
    threatDetailsElement.innerHTML = threatHtml;
  } else {
    threatDetailsElement.innerHTML = '<p>No detailed threat information available.</p>';
  }
}

// Handle go back button
function setupGoBackButton() {
  document.getElementById('go-back').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back();
  });
}

// Handle false positive report
function setupReportButton() {
  document.getElementById('report-false-positive').addEventListener('click', async (e) => {
    e.preventDefault();
    const { dangerousUrl, threatDetails } = getUrlParameters();
    
    try {
      const response = await fetch('http://localhost:3001/api/phishing/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: dangerousUrl,
          isFalsePositive: true,
          threatDetails: threatDetails
        }),
      });
      alert('Thank you for your report. We will review this URL.');
    } catch (error) {
      console.error('Error reporting false positive:', error);
      alert('Failed to submit report. Please try again later.');
    }
  });
}

// Add CSS styles dynamically
function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .recommendations {
      margin-top: 10px;
      padding: 10px;
      background-color: #fff8e1;
      border-radius: 4px;
    }
    .recommendations ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .recommendations li {
      margin: 5px 0;
      color: #d32f2f;
    }
    .threat-type {
      font-weight: bold;
      color: #e65100;
      margin-right: 5px;
    }
  `;
  document.head.appendChild(style);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addStyles();
  displayThreatInfo();
  setupGoBackButton();
  setupReportButton();
}); 