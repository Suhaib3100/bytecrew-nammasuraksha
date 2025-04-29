// DOM Elements
let currentTab = null;
let analysisInProgress = false;

// Helper function to update threat status display
function updateThreatStatus(analysis) {
    const threatLevel = analysis.threatLevel || 'unknown';
    const message = analysis.message || 'Unknown status';
    
    const threatLevelElement = document.getElementById('threatLevel');
    const statusMessageElement = document.getElementById('statusMessage');
    const threatStatusCard = document.getElementById('threatStatus');
    
    // Update status card appearance
    threatStatusCard.className = 'status-card ' + threatLevel;
    threatLevelElement.textContent = analysis.type === 'EMAIL_ANALYSIS' ? 
        'Analyzing Email...' : 'Analyzing Website...';
    statusMessageElement.textContent = message;

    // Show appropriate icon based on threat level
    const statusIcon = threatStatusCard.querySelector('.status-icon');
    statusIcon.className = 'status-icon ' + threatLevel;
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
        // Update threats
        if (analysis.details.threats && analysis.details.threats.length > 0) {
            analysis.details.threats.forEach(threat => {
                const threatItem = document.createElement('div');
                threatItem.className = `threat-item ${threat.severity}`;
                threatItem.innerHTML = `
                    <span class="threat-severity">${threat.severity}</span>
                    <span class="threat-description">${threat.description}</span>
                `;
                threatsList.appendChild(threatItem);
            });
        } else {
            threatsList.innerHTML = '<p class="empty-state">No threats detected</p>';
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

        // Update recommendations
        if (analysis.details.recommendations && analysis.details.recommendations.length > 0) {
            analysis.details.recommendations.forEach(rec => {
                const recItem = document.createElement('div');
                recItem.className = 'recommendation-item';
                recItem.textContent = rec;
                recommendationsList.appendChild(recItem);
            });
        } else {
            recommendationsList.innerHTML = '<p class="empty-state">No recommendations available</p>';
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
            threatLevel: 'unknown',
            message: 'Analyzing content...'
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
    } finally {
        analysisInProgress = false;
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refresh Analysis';
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;

        if (!tab.url || tab.url.startsWith('chrome://')) {
            updateThreatStatus({
                type: 'ERROR',
                threatLevel: 'unknown',
                message: 'Cannot analyze this page'
            });
            return;
        }

        // Show initial analyzing state
        updateThreatStatus({
            type: 'ANALYZING',
            threatLevel: 'unknown',
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

// Listen for analysis updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EMAIL_ANALYSIS' || message.type === 'WEBPAGE_ANALYSIS') {
        updateThreatStatus(message.data);
        updateAnalysisDetails(message.data);
        updateStats(message.data);
        
        // Update feature statuses
        updateFeatureStatus('phishing', true);
        updateFeatureStatus('email', message.type === 'EMAIL_ANALYSIS');
        updateFeatureStatus('social', message.type === 'WEBPAGE_ANALYSIS' && 
            currentTab?.url.includes('twitter.com') || 
            currentTab?.url.includes('facebook.com'));
    }
}); 