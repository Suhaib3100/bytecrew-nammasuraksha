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

        const cached = analysisCache.get(domain);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
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
        const result = {
            type: 'DOMAIN_ANALYSIS',
            threatLevel: data.analysis.threatLevel,
            message: `Domain Analysis: ${domain}`,
            details: data.analysis
        };

        analysisCache.set(domain, {
            result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        console.error('Error in quick domain analysis:', error);
        return {
            type: 'ERROR',
            threatLevel: 'unknown',
            message: 'Failed to analyze domain'
        };
    }
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

// Function to update badge
function updateBadge(analysis, tabId) {
    const colors = {
        safe: '#4CAF50',    // Green
        warning: '#FFC107', // Yellow
        danger: '#F44336',  // Red
        unknown: '#9E9E9E'  // Grey
    };

    const threatLevels = {
        low: 'safe',
        medium: 'warning',
        high: 'danger',
        unknown: 'unknown'
    };

    const level = threatLevels[analysis.threatLevel] || 'unknown';
    const color = colors[level];
    const text = level.charAt(0).toUpperCase();

    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color, tabId });

    // Send analysis results to popup
    chrome.runtime.sendMessage({
        type: analysis.type,
        data: analysis
    });
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_ANALYSIS') {
        handleGetAnalysis(message.tabId);
    } else if (message.type === 'REFRESH_ANALYSIS') {
        handleRefreshAnalysis(message.tabId);
    } else if (message.type === 'GET_QUICK_ANALYSIS') {
        chrome.tabs.get(message.tabId, async (tab) => {
            const analysis = await performQuickDomainAnalysis(tab.url);
            sendResponse(analysis);
        });
        return true; // Required for async response
    }
    return true;
});

// Handle getting analysis
async function handleGetAnalysis(tabId) {
    try {
        const analysis = analysisCache.get(tabId);
        if (analysis) {
            sendAnalysisToPopup(analysis);
        } else {
            await performAnalysis(tabId);
        }
    } catch (error) {
        console.error('Error getting analysis:', error);
        sendErrorToPopup('Failed to get analysis');
    }
}

// Handle refreshing analysis
async function handleRefreshAnalysis(tabId) {
    try {
        await performAnalysis(tabId);
    } catch (error) {
        console.error('Error refreshing analysis:', error);
        sendErrorToPopup('Failed to refresh analysis');
    }
}

// Handle tab updates
async function handleTabUpdate(tabId, tab) {
    try {
        if (tab.url && !tab.url.startsWith('chrome://')) {
            await performAnalysis(tabId);
        }
    } catch (error) {
        console.error('Error handling tab update:', error);
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

// Handle tab updates with quick analysis
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        if (isMailService(tab.url)) {
            // For mail services, wait for complete load to analyze email content
            return;
        }

        // For regular websites, do quick domain analysis
        const analysis = await performQuickDomainAnalysis(tab.url);
        if (analysis) {
            updateBadge(analysis, tabId);
            chrome.runtime.sendMessage({
                type: 'QUICK_ANALYSIS',
                data: analysis
            });
        }
    } else if (changeInfo.status === 'complete') {
        if (isMailService(tab.url)) {
            // For mail services, analyze email content
            await performEmailAnalysis(tabId);
        }
    }
}); 