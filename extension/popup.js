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
        updateGuaranteeStatus(message.data);
    } else if (message.type === 'ANALYSIS_COMPLETE') {
        updateThreatStatus(message.data);
        updateGuaranteeStatus(message.data);
        updateAnalysisDetails(message.data);
        updateStats(message.data);
        
        // Show notification popup
        showNotificationPopup(message.data);
        
        // Enable refresh button
        const refreshButton = document.getElementById('refreshAnalysis');
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refresh Analysis';
        analysisInProgress = false;
    } else if (message.type === 'ANALYSIS_STARTED') {
        updateLoadingState(true, message.data?.message || 'Analyzing...');
        const refreshButton = document.getElementById('refreshAnalysis');
        refreshButton.disabled = true;
    } else if (message.type === 'ANALYSIS_ERROR') {
        showError(message.error || 'An error occurred during analysis');
        const refreshButton = document.getElementById('refreshAnalysis');
        refreshButton.disabled = false;
    } else if (message.type === 'FEATURE_STATUS') {
        updateFeatureStatus(message.featureId, message.isActive);
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

function updateLoadingState(isLoading, message = 'Analyzing...') {
    const statusCard = document.querySelector('.status-card');
    const statusIcon = document.querySelector('.status-icon');
    
    if (isLoading) {
        statusCard.classList.add('analyzing');
        statusIcon.classList.add('analyzing');
        statusCard.querySelector('.status-message').textContent = message;
    } else {
        statusCard.classList.remove('analyzing');
        statusIcon.classList.remove('analyzing');
    }
}

function showError(message) {
    const statusCard = document.querySelector('.status-card');
    statusCard.classList.remove('analyzing');
    statusCard.classList.add('error');
    statusCard.querySelector('.status-message').textContent = message;
}

function updateAnalysisResults(results) {
    const analysisSection = document.querySelector('.analysis-section');
    
    if (!results || Object.keys(results).length === 0) {
        analysisSection.innerHTML = `
            <div class="empty-state">
                No analysis results available yet.
                Click refresh to analyze again.
            </div>
        `;
        return;
    }

    // Update security checks
    if (results.securityChecks) {
        const securityList = document.querySelector('.security-checks');
        securityList.innerHTML = results.securityChecks.map(check => `
            <div class="check-item ${check.status === 'error' ? 'error' : ''}">
                <div class="check-type">${check.type}</div>
                <div class="check-message">${check.message}</div>
            </div>
        `).join('');
    }

    // Update stats if available
    if (results.stats) {
        Object.entries(results.stats).forEach(([key, value]) => {
            const statElement = document.querySelector(`#${key}Stat`);
            if (statElement) {
                const valueElement = statElement.querySelector('.stat-value');
                if (valueElement) {
                    valueElement.textContent = value;
                }
            }
        });
    }
}

function updateGuaranteeStatus(analysis) {
    const guaranteeStatus = document.querySelector('.guarantee-status');
    const guaranteeMessage = guaranteeStatus.querySelector('.guarantee-message');
    const verifyItems = guaranteeStatus.querySelectorAll('.verify-item');
    
    // Remove all states first
    guaranteeStatus.classList.remove('analyzing', 'not-genuine');
    
    if (analysis.type === 'ANALYZING') {
        guaranteeStatus.classList.add('analyzing');
        guaranteeMessage.textContent = 'Analyzing Website...';
        verifyItems.forEach(item => {
            const icon = item.querySelector('.verify-icon');
            icon.textContent = '↻';
        });
        return;
    }
    
    const isGenuine = analysis.threatLevel === 'low' && 
                      analysis.details?.checks?.every(check => check.status !== 'danger');
    
    if (isGenuine) {
        guaranteeMessage.textContent = 'Guaranteed Genuine';
        verifyItems.forEach(item => {
            const icon = item.querySelector('.verify-icon');
            icon.textContent = '✓';
        });
    } else {
        guaranteeStatus.classList.add('not-genuine');
        guaranteeMessage.textContent = 'Not Verified';
        verifyItems.forEach(item => {
            const icon = item.querySelector('.verify-icon');
            icon.textContent = '×';
        });
    }
    
    // Update verification details
    const [domainVerify, sslVerify, threatVerify] = verifyItems;
    
    if (analysis.details?.checks) {
        const domainCheck = analysis.details.checks.find(c => c.type.includes('domain'));
        const sslCheck = analysis.details.checks.find(c => c.type.includes('ssl'));
        
        domainVerify.querySelector('.verify-text').textContent = 
            domainCheck?.status === 'safe' ? 'Domain Verified' : 'Domain Not Verified';
        
        sslVerify.querySelector('.verify-text').textContent = 
            sslCheck?.status === 'safe' ? 'SSL Secure' : 'SSL Not Secure';
        
        threatVerify.querySelector('.verify-text').textContent = 
            isGenuine ? 'No Threats Detected' : 'Threats Detected';
    }
}

function showNotificationPopup(analysis) {
    const isGenuine = analysis.threatLevel === 'low' && 
                     analysis.details?.checks?.every(check => check.status !== 'danger');
    
    const popupUrl = isGenuine ? 'safe.html' : 'warning.html';
    
    // Store the analysis details for the popup
    chrome.storage.local.set({
        'lastAnalysis': {
            url: currentTab.url,
            result: analysis,
            timestamp: Date.now()
        }
    }, () => {
        // Create the popup window
        chrome.windows.create({
            url: chrome.runtime.getURL(popupUrl),
            type: 'popup',
            width: 400,
            height: 300,
            focused: true
        }).catch(error => {
            console.error('Error showing notification popup:', error);
        });
    });
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