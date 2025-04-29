import ApiService from './services/api';

// Constants for API endpoints
const API_ENDPOINT = 'http://localhost:3001/api';

// Cache for analysis results
const analysisCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        threatsBlocked: 0,
        linksScanned: 0
    });
});

// Function to extract domain from URL
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return null;
    }
}

// Function to check if URL is a mail service
function isMailService(url) {
    const mailDomains = [
        'mail.google.com',
        'outlook.com',
        'outlook.office.com',
        'outlook.live.com',
        'mail.yahoo.com'
    ];
    const domain = extractDomain(url);
    return mailDomains.some(mailDomain => domain?.includes(mailDomain));
}

// Quick domain analysis
async function performQuickDomainAnalysis(url) {
    try {
        const domain = extractDomain(url);
        if (!domain) return null;

        // Update UI to show analyzing state
        sendMessage({
            type: 'ANALYSIS_STATUS',
            data: {
                type: 'DOMAIN_ANALYSIS',
                threatLevel: 'analyzing',
                message: 'Analyzing domain security...',
                details: {
                    domain: domain
                }
            }
        });

        const cached = analysisCache.get(domain);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            sendMessage({
                type: 'ANALYSIS_COMPLETE',
                data: cached.result
            });
            return cached.result;
        }

        const response = await fetch(`${API_ENDPOINT}/quick/domain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ domain })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Analysis failed');
        }

        const result = {
            type: 'DOMAIN_ANALYSIS',
            threatLevel: data.analysis.threatLevel,
            message: `Domain Analysis Complete`,
            details: {
                domain: domain,
                checks: data.analysis.checks,
                recommendations: generateRecommendations(data.analysis)
            }
        };

        // Cache the results
        analysisCache.set(domain, {
            result,
            timestamp: Date.now()
        });

        // Send results to popup
        sendMessage({
            type: 'ANALYSIS_COMPLETE',
            data: result
        });

        // Update badge and stats
        updateBadge(result, null);
        updateStats(result);

        return result;
    } catch (error) {
        console.error('Error in quick domain analysis:', error);
        const errorResult = {
            type: 'ERROR',
            threatLevel: 'error',
            message: 'Failed to analyze domain',
            details: {
                error: error.message
            }
        };

        sendMessage({
            type: 'ANALYSIS_COMPLETE',
            data: errorResult
        });

        return errorResult;
    }
}

// Generate recommendations based on analysis
function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.checks) {
        analysis.checks.forEach(check => {
            if (check.status === 'danger' || check.status === 'warning') {
                recommendations.push({
                    type: check.type,
                    message: check.message,
                    severity: check.status
                });
            }
        });
    }

    return recommendations;
}

// Function to check if URL is allowed for analysis
function isAllowedUrl(url) {
    try {
        const urlObj = new URL(url);
        return !urlObj.protocol.startsWith('chrome') && 
               !urlObj.protocol.startsWith('chrome-extension') &&
               !urlObj.protocol.startsWith('about');
    } catch {
        return false;
    }
}

// Function to analyze email content
async function analyzeEmailContent(content) {
    try {
        const response = await fetch(`${API_ENDPOINT}/analyze/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            type: 'EMAIL_ANALYSIS',
            threatLevel: data.threatLevel || 'unknown',
            message: data.message || 'Email analysis completed',
            details: {
                scamProbability: data.scamProbability || 0,
                suspiciousLinks: data.suspiciousLinks || [],
                warnings: data.warnings || []
            }
        };
    } catch (error) {
        console.error('Error analyzing email:', error);
        return {
            type: 'EMAIL_ANALYSIS',
            threatLevel: 'unknown',
            message: 'Could not analyze email content',
            details: {
                error: error.message
            }
        };
    }
}

// Function to analyze webpage content
async function analyzeWebpage(url, content) {
    try {
        const response = await fetch(`${API_ENDPOINT}/analyze/webpage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, content })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            type: 'WEBPAGE_ANALYSIS',
            threatLevel: data.threatLevel || 'unknown',
            message: data.message || 'Website analysis completed',
            details: {
                securityScore: data.securityScore || 0,
                threats: data.threats || [],
                recommendations: data.recommendations || []
            }
        };
    } catch (error) {
        console.error('Error analyzing webpage:', error);
        return {
            type: 'WEBPAGE_ANALYSIS',
            threatLevel: 'unknown',
            message: 'Could not analyze webpage content',
            details: {
                error: error.message
            }
        };
    }
}

// Function to extract email content
async function extractEmailContent(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                // Email content selectors for different email services
                const selectors = {
                    gmail: ['.a3s.aiL', '.ii.gt'],
                    outlook: ['[role="main"]', '.ReadMsgBody'],
                    yahoo: ['[data-test-id="message-view"]', '#msg-body']
                };

                // Try each selector
                for (const service in selectors) {
                    for (const selector of selectors[service]) {
                        const element = document.querySelector(selector);
                        if (element) {
                            return {
                                content: element.innerText,
                                service: service
                            };
                        }
                    }
                }
                return null;
            }
        });

        return result[0]?.result;
    } catch (error) {
        console.error('Error extracting email content:', error);
        return null;
    }
}

// Handle tab updates with quick analysis
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        try {
            // Skip chrome:// and other internal URLs
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                return;
            }

            // Check if it's a mail service
            if (isMailService(tab.url)) {
                sendMessage({
                    type: 'ANALYSIS_STATUS',
                    data: {
                        type: 'EMAIL_ANALYSIS',
                        threatLevel: 'analyzing',
                        message: 'Waiting for email content...'
                    }
                });
                return;
            }

            // For regular websites, do quick domain analysis
            const analysis = await performQuickDomainAnalysis(tab.url);
            if (analysis) {
                // Update badge immediately
                updateBadge(analysis, tabId);
            }
        } catch (error) {
            console.error('Error in tab update handler:', error);
            sendMessage({
                type: 'ANALYSIS_STATUS',
                data: {
                    type: 'ERROR',
                    threatLevel: 'error',
                    message: 'Analysis failed: ' + error.message
                }
            });
        }
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_ANALYSIS') {
        handleGetAnalysis(message.tabId);
    } else if (message.type === 'REFRESH_ANALYSIS') {
        handleRefreshAnalysis(message.tabId);
    }
    return true;
});

// Handle getting analysis
async function handleGetAnalysis(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        
        // Skip chrome:// and other internal URLs
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            sendMessage({
                type: 'ANALYSIS_STATUS',
                data: {
                    type: 'ERROR',
                    threatLevel: 'error',
                    message: 'Cannot analyze this page'
                }
            });
            return;
        }

        // Check cache first
        const cached = analysisCache.get(tab.url);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            sendMessage({
                type: 'ANALYSIS_COMPLETE',
                data: cached.result
            });
            return;
        }

        // Perform new analysis
        if (isMailService(tab.url)) {
            await performEmailAnalysis(tabId);
        } else {
            await performQuickDomainAnalysis(tab.url);
        }
    } catch (error) {
        console.error('Error getting analysis:', error);
        sendMessage({
            type: 'ANALYSIS_STATUS',
            data: {
                type: 'ERROR',
                threatLevel: 'error',
                message: 'Failed to get analysis: ' + error.message
            }
        });
    }
}

// Handle refreshing analysis
async function handleRefreshAnalysis(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        
        // Clear cache for this URL
        analysisCache.delete(tab.url);
        
        // Perform new analysis
        if (isMailService(tab.url)) {
            await performEmailAnalysis(tabId);
        } else {
            await performQuickDomainAnalysis(tab.url);
        }
    } catch (error) {
        console.error('Error refreshing analysis:', error);
        sendMessage({
            type: 'ANALYSIS_STATUS',
            data: {
                type: 'ERROR',
                threatLevel: 'error',
                message: 'Failed to refresh analysis: ' + error.message
            }
        });
    }
}

// Update badge with appropriate color and text
function updateBadge(analysis, tabId) {
    const colors = {
        low: '#4CAF50',     // Green
        medium: '#FFC107',  // Yellow
        high: '#F44336',    // Red
        analyzing: '#2196F3',// Blue
        error: '#9E9E9E',   // Grey
        unknown: '#9E9E9E'  // Grey
    };

    const text = {
        low: '✓',
        medium: '!',
        high: '⚠',
        analyzing: '...',
        error: 'X',
        unknown: '?'
    };

    const color = colors[analysis.threatLevel] || colors.unknown;
    const badgeText = text[analysis.threatLevel] || text.unknown;

    if (tabId) {
        chrome.action.setBadgeBackgroundColor({ color, tabId });
        chrome.action.setBadgeText({ text: badgeText, tabId });
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.action.setBadgeBackgroundColor({ color, tabId: tabs[0].id });
                chrome.action.setBadgeText({ text: badgeText, tabId: tabs[0].id });
            }
        });
    }
}

// Perform content analysis
async function performAnalysis(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        
        // Determine content type and get content
        const isEmail = tab.url.includes('mail.google.com') || 
                       tab.url.includes('outlook.com') ||
                       tab.url.includes('yahoo.mail');
        
        let content;
        if (isEmail) {
            content = await getEmailContent(tabId);
        } else {
            content = await getPageContent(tabId);
        }

        // Get analysis from backend
        const analysis = await ApiService.analyzeContent(content, isEmail ? 'EMAIL' : 'WEBPAGE');
        
        // Cache and send results
        analysisCache.set(tabId, analysis);
        sendAnalysisToPopup(analysis);

        // Update stats
        updateStats(analysis);

    } catch (error) {
        console.error('Error performing analysis:', error);
        sendErrorToPopup('Failed to analyze content');
    }
}

// Get email content
async function getEmailContent(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { type: 'GET_EMAIL_CONTENT' }, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response.content);
            }
        });
    });
}

// Get page content
async function getPageContent(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_CONTENT' }, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response.content);
            }
        });
    });
}

// Send analysis results to popup
function sendAnalysisToPopup(analysis) {
    chrome.runtime.sendMessage({
        type: analysis.type === 'EMAIL' ? 'EMAIL_ANALYSIS' : 'WEBPAGE_ANALYSIS',
        data: analysis
    });
}

// Send error to popup
function sendErrorToPopup(message) {
    chrome.runtime.sendMessage({
        type: 'ERROR',
        data: {
            threatLevel: 'error',
            message: message
        }
    });
}

// Update stats
async function updateStats(analysis) {
    const stats = await chrome.storage.local.get(['threatsBlocked', 'linksScanned']);
    
    const newStats = {
        threatsBlocked: (stats.threatsBlocked || 0) + (analysis.details?.threats?.length || 0),
        linksScanned: (stats.linksScanned || 0) + (analysis.details?.suspiciousLinks?.length || 0)
    };
    
    await chrome.storage.local.set(newStats);
}

// Perform email analysis
async function performEmailAnalysis(tabId) {
    try {
        // Update UI to show analyzing state
        chrome.runtime.sendMessage({
            type: 'ANALYSIS_STATUS',
            data: {
                type: 'EMAIL_ANALYSIS',
                threatLevel: 'analyzing',
                message: 'Analyzing email content...'
            }
        });

        // Get email content
        const content = await getEmailContent(tabId);
        if (!content) {
            throw new Error('Could not extract email content');
        }

        // Analyze content
        const analysis = await ApiService.analyzeContent(content, 'EMAIL');
        
        // Cache and send results
        analysisCache.set(tabId, {
            result: analysis,
            timestamp: Date.now()
        });

        // Send results to popup
        chrome.runtime.sendMessage({
            type: 'ANALYSIS_COMPLETE',
            data: analysis
        });

        // Update badge
        updateBadge(analysis, tabId);

        return analysis;
    } catch (error) {
        console.error('Error in email analysis:', error);
        const errorAnalysis = {
            type: 'EMAIL_ANALYSIS',
            threatLevel: 'error',
            message: 'Failed to analyze email',
            details: {
                error: error.message
            }
        };

        // Send error to popup
        chrome.runtime.sendMessage({
            type: 'ANALYSIS_COMPLETE',
            data: errorAnalysis
        });

        return errorAnalysis;
    }
}

// Fix message handling for long-lived connections
let port = null;

// Setup long-lived connection
chrome.runtime.onConnect.addListener(function(connectionPort) {
    port = connectionPort;
    port.onDisconnect.addListener(function() {
        port = null;
    });
});

// Helper function to safely send messages
function sendMessage(message) {
    try {
        if (port) {
            port.postMessage(message);
        } else {
            chrome.runtime.sendMessage(message);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
} 