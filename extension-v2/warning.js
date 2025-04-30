// Get URL parameters
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get('type') || 'unknown',
        source: params.get('source') || 'unknown',
        threatLevel: params.get('threatLevel') || 'high',
        reasons: JSON.parse(decodeURIComponent(params.get('reasons') || '[]')),
        recommendations: JSON.parse(decodeURIComponent(params.get('recommendations') || '[]')),
        detectedAt: params.get('detectedAt') || new Date().toISOString()
    };
}

// Format threat information into HTML
function formatThreatInfo(threat) {
    const threatColors = {
        high: '#d32f2f',
        medium: '#f57c00',
        low: '#ffa000',
        safe: '#388e3c'
    };

    return `
        <div class="threat-container">
            <div class="threat-header" style="color: ${threatColors[threat.threatLevel]}">
                <span class="warning-icon">⚠️</span>
                <h2>Suspicious Message Detected!</h2>
            </div>
            
            <div class="threat-content">
                <div class="threat-section">
                    <h3>Why this is suspicious:</h3>
                    <ul class="threat-list">
                        ${threat.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>

                <div class="threat-section">
                    <h3>Recommendations:</h3>
                    <ul class="threat-list recommendations">
                        ${threat.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>

                <div class="threat-metadata">
                    <p>Detected at: ${new Date(threat.detectedAt).toLocaleString()}</p>
                    <p>Source: ${threat.source}</p>
                    <p>Threat Level: <span style="color: ${threatColors[threat.threatLevel]}">${threat.threatLevel.toUpperCase()}</span></p>
                </div>
            </div>

            <div class="action-buttons">
                <button id="ignoreButton" class="btn warning">Ignore (Not Recommended)</button>
                <button id="blockButton" class="btn primary">Block Content</button>
                <button id="reportButton" class="btn secondary">Report as False Positive</button>
            </div>
        </div>
    `;
}

// Add styles to the page
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }

        .threat-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .threat-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f0f0f0;
        }

        .warning-icon {
            font-size: 24px;
        }

        h2 {
            margin: 0;
            font-size: 24px;
        }

        h3 {
            margin: 0 0 12px 0;
            color: #333;
            font-size: 18px;
        }

        .threat-section {
            margin-bottom: 24px;
        }

        .threat-list {
            margin: 0;
            padding-left: 24px;
        }

        .threat-list li {
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .recommendations li {
            color: #2196f3;
        }

        .threat-metadata {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .threat-metadata p {
            margin: 8px 0;
            color: #666;
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 20px;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }

        .btn.primary {
            background: #2196f3;
            color: white;
        }

        .btn.warning {
            background: #ff9800;
            color: white;
        }

        .btn.secondary {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
        }

        .btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
}

// Display threat information
function displayThreatInfo() {
    const threatInfo = getUrlParameters();
    const container = document.getElementById('warning-container');
    if (container) {
        container.innerHTML = formatThreatInfo(threatInfo);
        
        // Add event listeners
        document.getElementById('ignoreButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to ignore this warning? This could be dangerous!')) {
                window.close();
            }
        });

        document.getElementById('blockButton').addEventListener('click', () => {
            chrome.runtime.sendMessage({
                type: 'BLOCK_CONTENT',
                data: threatInfo
            });
            window.close();
        });

        document.getElementById('reportButton').addEventListener('click', () => {
            chrome.runtime.sendMessage({
                type: 'REPORT_FALSE_POSITIVE',
                data: threatInfo
            });
            alert('Thank you for your report. We will review this content.');
            window.close();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    displayThreatInfo();
}); 