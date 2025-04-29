// DOM Elements
let currentTab = null;
let analysisInProgress = false;
let port = null;

// Establish connection with background script
function connectToBackground() {
    port = chrome.runtime.connect({ name: 'popup' });
    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(() => {
        port = null;
        setTimeout(connectToBackground, 1000); // Reconnect after 1 second
    });
}

// Handle messages from background script
function handleMessage(message) {
    if (message.type === 'ANALYSIS_STATUS') {
        updateThreatStatus(message.data);
    } else if (message.type === 'ANALYSIS_COMPLETE') {
        updateThreatStatus(message.data);
        updateAnalysisDetails(message.data);
        updateStats(message.data);
        
        // Enable refresh button
        const refreshButton = document.getElementById('refreshAnalysis');
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refresh Analysis';
        analysisInProgress = false;
    }
}

// Helper function to update threat status display
function updateThreatStatus(analysis) {
    const threatLevel = analysis.threatLevel || 'unknown';
    const message = analysis.message || 'Unknown status';
    
    const threatLevelElement = document.getElementById('threatLevel');
    const statusMessageElement = document.getElementById('statusMessage');
    const threatStatusCard = document.getElementById('threatStatus');
    
    // Update status card appearance
    threatStatusCard.className = `status-card ${threatLevel}`;
    threatLevelElement.textContent = analysis.type === 'EMAIL_ANALYSIS' ? 
        'Email Analysis' : 'Website Security';
    statusMessageElement.textContent = message;

    // Show appropriate icon based on threat level
    const statusIcon = threatStatusCard.querySelector('.status-icon');
    statusIcon.className = `status-icon ${threatLevel}`;

    // Show analyzing state if needed
    if (threatLevel === 'analyzing') {
        statusIcon.classList.add('analyzing');
    }
}

// Helper function to update the analysis details
function updateAnalysisDetails(analysis) {
    const detailsSection = document.getElementById('analysisDetails');
    const threatsList = document.getElementById('threatsList');
    const patternsList = document.getElementById('patternsList');
    const recommendationsList = document.getElementById('recommendationsList');

    // Clear existing content
    threatsList.innerHTML = '';
    patternsList.innerHTML = '';
    recommendationsList.innerHTML = '';

    if (analysis.details) {
        // Update domain info for website analysis
        if (analysis.type === 'DOMAIN_ANALYSIS' && analysis.details.domain) {
            const domainInfo = document.createElement('div');
            domainInfo.className = 'domain-info';
            domainInfo.innerHTML = `<strong>Domain:</strong> ${analysis.details.domain}`;
            threatsList.appendChild(domainInfo);

            // Display security checks
            if (analysis.details.checks) {
                analysis.details.checks.forEach(check => {
                    const checkItem = document.createElement('div');
                    checkItem.className = `check-item ${check.status}`;
                    checkItem.innerHTML = `
                        <span class="check-type">${check.type}</span>
                        <span class="check-message">${check.message}</span>
                    `;
                    threatsList.appendChild(checkItem);
                });
            }
        } else if (analysis.type === 'ERROR') {
            const errorItem = document.createElement('div');
            errorItem.className = 'check-item error';
            errorItem.innerHTML = `
                <span class="check-type">Error</span>
                <span class="check-message">${analysis.details.error || 'Unknown error occurred'}</span>
            `;
            threatsList.appendChild(errorItem);
        }

        // Update recommendations
        if (analysis.details.recommendations && analysis.details.recommendations.length > 0) {
            analysis.details.recommendations.forEach(rec => {
                const recItem = document.createElement('div');
                recItem.className = `recommendation-item ${rec.severity}`;
                recItem.textContent = rec.message;
                recommendationsList.appendChild(recItem);
            });
        } else {
            recommendationsList.innerHTML = '<p class="empty-state">No recommendations needed</p>';
        }

        // Update suspicious patterns
        if (analysis.details.suspiciousLinks && analysis.details.suspiciousLinks.length > 0) {
            analysis.details.suspiciousLinks.forEach(pattern => {
                const patternItem = document.createElement('div');
                patternItem.className = 'pattern-item';
                patternItem.textContent = pattern;
                patternsList.appendChild(patternItem);
            });
        } else {
            patternsList.innerHTML = '<p class="empty-state">No suspicious patterns detected</p>';
        }
    }

    // Update timestamp
    const timestamp = document.getElementById('lastUpdated');
    timestamp.textContent = new Date().toLocaleTimeString();
}

// Helper function to update feature status
function updateFeatureStatus(feature, isActive) {
    const featureCard = document.querySelector(`[data-feature="${feature}"]`);
    if (featureCard) {
        const statusElement = featureCard.querySelector('.feature-status');
        statusElement.className = `feature-status ${isActive ? 'active' : 'inactive'}`;
        statusElement.textContent = isActive ? 'Active' : 'Inactive';
    }
}

// Helper function to update stats
function updateStats(analysis) {
    if (analysis.details) {
        const threatsBlocked = document.getElementById('threats-blocked');
        const linksScanned = document.getElementById('links-scanned');
        
        chrome.storage.local.get(['threatsBlocked', 'linksScanned'], (result) => {
            threatsBlocked.textContent = result.threatsBlocked || 0;
            linksScanned.textContent = result.linksScanned || 0;
        });
    }
}

// Function to refresh analysis
async function refreshAnalysis() {
    if (analysisInProgress || !currentTab) return;
    
    analysisInProgress = true;
    const refreshButton = document.getElementById('refreshAnalysis');
    refreshButton.disabled = true;
    refreshButton.textContent = 'Analyzing...';

    try {
        // Show analyzing state
        updateThreatStatus({
            type: 'ANALYZING',
            threatLevel: 'analyzing',
            message: 'Refreshing analysis...'
        });

        // Request new analysis
        chrome.runtime.sendMessage({ 
            type: 'REFRESH_ANALYSIS',
            tabId: currentTab.id 
        });

    } catch (error) {
        console.error('Error refreshing analysis:', error);
        updateThreatStatus({
            type: 'ERROR',
            threatLevel: 'error',
            message: 'Failed to refresh analysis'
        });
        
        // Reset button state
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refresh Analysis';
        analysisInProgress = false;
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Connect to background script
        connectToBackground();

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;

        if (!tab.url || tab.url.startsWith('chrome://')) {
            updateThreatStatus({
                type: 'ERROR',
                threatLevel: 'error',
                message: 'Cannot analyze this page'
            });
            return;
        }

        // Show initial analyzing state
        updateThreatStatus({
            type: 'ANALYZING',
            threatLevel: 'analyzing',
            message: 'Fetching analysis...'
        });

        // Request current analysis
        chrome.runtime.sendMessage({ 
            type: 'GET_ANALYSIS',
            tabId: tab.id 
        });

        // Setup refresh button
        const refreshButton = document.getElementById('refreshAnalysis');
        refreshButton.addEventListener('click', refreshAnalysis);

        // Setup settings button
        const settingsButton = document.getElementById('settings-btn');
        settingsButton.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

    } catch (error) {
        console.error('Error initializing popup:', error);
        updateThreatStatus({
            type: 'ERROR',
            threatLevel: 'error',
            message: 'Failed to initialize'
        });
    }
}); 