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

// Handle phishing detection and redirection
async function handlePhishingDetection(tab, analysis) {
    if (analysis.isPhishing && analysis.legitimateSource) {
        // Check if we should show test URL notification
        const notificationMessage = analysis.isTestUrl
            ? `Test phishing page detected! This is a safe test URL from Google.`
            : `Phishing site detected! Redirecting to: ${analysis.legitimateSource}`;

        // Store the original URL for reference
        await chrome.storage.local.set({
            'lastPhishingRedirect': {
                originalUrl: tab.url,
                legitimateSource: analysis.legitimateSource,
                timestamp: Date.now(),
                isTestUrl: analysis.isTestUrl
            }
        });

        // Show warning notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/warning-48.png',
            title: analysis.isTestUrl ? 'Test Phishing Site Detected!' : 'Phishing Site Detected!',
            message: notificationMessage
        });

        // For test URLs, show a confirmation dialog before redirecting
        if (analysis.isTestUrl) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'SHOW_PHISHING_DIALOG',
                data: {
                    message: 'This is a test phishing page. Would you like to be redirected to the legitimate site?',
                    legitimateUrl: analysis.legitimateSource
                }
            });
        } else {
            // For real phishing sites, redirect immediately
            await chrome.tabs.update(tab.id, { url: analysis.legitimateSource });
        }

        // Update stats
        const stats = await chrome.storage.local.get(['phishingRedirects']);
        await chrome.storage.local.set({
            'phishingRedirects': (stats.phishingRedirects || 0) + 1
        });

        // Update badge with warning
        chrome.action.setBadgeText({ 
            text: '⚠️',
            tabId: tab.id 
        });
        chrome.action.setBadgeBackgroundColor({ 
            color: '#FF0000',
            tabId: tab.id 
        });
    }
}

// Handle tab updates with quick analysis
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        try {
            // Skip chrome:// and other internal URLs
            if (tab.url.startsWith('chrome://') || 
                tab.url.startsWith('chrome-extension://') ||
                tab.url.startsWith('about:')) {
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

            // For regular websites, check with VirusTotal first
            const vtResponse = await fetch('http://localhost:3001/api/virustotal/analyze-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: tab.url })
            });

            if (!vtResponse.ok) {
                throw new Error('VirusTotal analysis failed');
            }

            const vtData = await vtResponse.json();
            
            if (vtData.success) {
                // Handle phishing detection and redirection
                await handlePhishingDetection(tab, vtData.analysis);
                
                // Update badge
                updateBadge(vtData.analysis, tabId);
                
                // Send analysis to popup
                sendMessage({
                    type: 'ANALYSIS_COMPLETE',
                    data: vtData.analysis
                });
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

// Function to check URL with both VirusTotal and Safe Browsing
async function checkUrl(url) {
    try {
        // Check with Google Safe Browsing first (faster response)
        const safeBrowsingResponse = await fetch('http://localhost:3001/api/safebrowsing/check-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!safeBrowsingResponse.ok) {
            throw new Error('Safe Browsing check failed');
        }

        const safeBrowsingData = await safeBrowsingResponse.json();
        
        // If Google Safe Browsing detects a threat, prepare detailed response
        if (safeBrowsingData.success && safeBrowsingData.analysis.isMalicious) {
            const threatDetails = {
                threatLevel: safeBrowsingData.analysis.threatLevel || 'high',
                confidence: 0.9,
                message: `Google Safe Browsing Warning: ${safeBrowsingData.analysis.details.threatTypes.join(', ')}`,
                details: {
                    source: 'Google Safe Browsing',
                    threats: safeBrowsingData.analysis.threats,
                    affectedPlatforms: safeBrowsingData.analysis.details.affectedPlatforms,
                    totalThreats: safeBrowsingData.analysis.details.totalThreats,
                    recommendations: safeBrowsingData.analysis.recommendations || [],
                    checks: [{
                        type: 'safebrowsing',
                        status: 'danger',
                        message: 'Site flagged as malicious by Google Safe Browsing'
                    }]
                }
            };

            // Show immediate warning notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/warning-48.png',
                title: 'Security Alert!',
                message: threatDetails.message
            });

            return threatDetails;
        }

        // Then check with VirusTotal for additional context
        const vtResponse = await fetch('http://localhost:3001/api/virustotal/analyze-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!vtResponse.ok) {
            throw new Error('VirusTotal analysis failed');
        }

        const vtData = await vtResponse.json();

        // Combine the results
        const analysis = vtData.analysis;
        analysis.details.safeBrowsing = {
            checked: true,
            result: safeBrowsingData.analysis,
            timestamp: safeBrowsingData.analysis.timestamp
        };

        // Update threat level based on combined results
        if (safeBrowsingData.analysis.isMalicious) {
            analysis.threatLevel = Math.max(
                getThreatLevelValue(analysis.threatLevel),
                getThreatLevelValue(safeBrowsingData.analysis.threatLevel)
            );
            analysis.confidence = Math.max(analysis.confidence, 0.9);
        }

        // Add combined recommendations
        analysis.recommendations = [
            ...(analysis.recommendations || []),
            ...(safeBrowsingData.analysis.recommendations || [])
        ];

        return analysis;

    } catch (error) {
        console.error('URL check error:', error);
        return {
            threatLevel: 'unknown',
            message: 'Could not complete security check',
            error: error.message
        };
    }
}

// Helper function to convert threat level to numeric value
function getThreatLevelValue(level) {
    const levels = {
        'safe': 0,
        'low': 1,
        'medium': 2,
        'high': 3
    };
    return levels[level] || 0;
}

// Update badge based on combined analysis
function updateBadge(analysis, tabId) {
    const colors = {
        safe: '#4CAF50',    // Green
        low: '#8BC34A',     // Light Green
        medium: '#FFC107',  // Yellow
        high: '#F44336',    // Red
        analyzing: '#2196F3',// Blue
        error: '#9E9E9E',   // Grey
        unknown: '#9E9E9E'  // Grey
    };

    const icons = {
        safe: '✓',
        low: 'ℹ',
        medium: '⚠',
        high: '⛔',
        analyzing: '...',
        error: '✗',
        unknown: '?'
    };

    // Determine badge color and text
    let badgeColor = colors[analysis.threatLevel] || colors.unknown;
    let badgeText = icons[analysis.threatLevel] || icons.unknown;

    // If Google Safe Browsing detected a threat, override with red
    if (analysis.details?.safeBrowsing?.result?.isMalicious) {
        badgeColor = colors.high;
        badgeText = '⛔';
    }

    chrome.action.setBadgeText({ 
        text: badgeText,
        tabId 
    });
    
    chrome.action.setBadgeBackgroundColor({ 
        color: badgeColor,
        tabId 
    });

    // Show notification for high threats
    if (analysis.threatLevel === 'high' || analysis.details?.safeBrowsing?.result?.isMalicious) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/warning-48.png',
            title: 'Security Warning!',
            message: analysis.message || 'This site has been flagged as dangerous'
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

async function analyzeDomain(domain) {
    try {
        const response = await fetch('http://localhost:3001/api/quick/domain/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain })
        });

        if (!response.ok) {
            throw new Error('Domain analysis failed');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Analysis failed');
        }

        // Calculate final threat assessment
        const analysis = data.analysis;
        let finalThreatLevel = analysis.threatLevel;
        let finalMessage = '';
        let actionRequired = false;

        // Determine severity and required action based on analysis
        if (analysis.confidence >= 0.8) {
            // High confidence in the analysis
            switch (analysis.threatLevel) {
                case 'high':
                    finalMessage = 'High-risk phishing attempt detected! DO NOT proceed.';
                    actionRequired = true;
                    break;
                case 'medium':
                    if (analysis.reasons.some(r => r.includes('suspicious pattern'))) {
                        finalMessage = 'Warning: This appears to be impersonating ' + 
                            (analysis.details.similarityMatches[0]?.brand || 'a legitimate service');
                        actionRequired = true;
                    } else {
                        finalMessage = 'Caution: Suspicious domain detected';
                    }
                    break;
                case 'low':
                    finalMessage = 'Minor security concerns detected';
                    break;
                case 'safe':
                    finalMessage = 'Domain appears to be legitimate';
                    break;
            }
        } else {
            // Lower confidence - be more cautious
            finalMessage = 'Potential security risk - proceed with caution';
            if (analysis.threatLevel !== 'safe') {
                actionRequired = true;
            }
        }

        // Include AI insights if available
        if (analysis.details.aiAnalysis) {
            finalMessage += `\nAI Analysis: ${analysis.details.aiAnalysis.aiReasons[0] || ''}`;
        }

        return {
            threatLevel: finalThreatLevel,
            confidence: analysis.confidence,
            message: finalMessage,
            actionRequired: actionRequired,
            details: {
                domain: analysis.domain,
                checks: [{
                    type: 'domain',
                    status: actionRequired ? 'danger' : 'warning',
                    message: finalMessage
                }],
                reasons: analysis.reasons,
                matchDetails: analysis.details.similarityMatches,
                indicators: analysis.details.phishingIndicators
            }
        };
    } catch (error) {
        console.error('Domain analysis error:', error);
        return {
            threatLevel: 'error',
            message: 'Failed to analyze domain',
            error: error.message,
            actionRequired: false
        };
    }
}

async function checkUrl(url) {
    try {
        // First, check with our domain analysis
        const domainResponse = await fetch('http://localhost:3001/api/quick/domain/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain: new URL(url).hostname })
        });

        if (!domainResponse.ok) {
            throw new Error('Domain analysis failed');
        }

        const domainData = await domainResponse.json();
        
        // Then, check with VirusTotal
        const vtResponse = await fetch('http://localhost:3001/api/virustotal/analyze-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!vtResponse.ok) {
            throw new Error('VirusTotal analysis failed');
        }

        const vtData = await vtResponse.json();

        // Combine the results for final decision
        const finalThreatLevel = combineThreatLevels(
            domainData.analysis.threatLevel,
            vtData.analysis.threatLevel
        );

        const reasons = [
            ...(domainData.analysis.reasons || []),
            ...(vtData.analysis.recommendations || [])
        ];

        return {
            threatLevel: finalThreatLevel,
            confidence: Math.max(
                parseFloat(domainData.analysis.confidence || 0),
                parseFloat(vtData.analysis.confidence || 0)
            ),
            message: reasons.join('. '),
            details: {
                domain: new URL(url).hostname,
                checks: [
                    {
                        type: 'domain',
                        status: domainData.analysis.threatLevel === 'safe' ? 'safe' : 'danger',
                        message: domainData.analysis.reasons[0] || 'Domain analysis complete'
                    },
                    {
                        type: 'virustotal',
                        status: vtData.analysis.threatLevel === 'safe' ? 'safe' : 'danger',
                        message: `VirusTotal: ${vtData.analysis.positiveEngines || 0}/${vtData.analysis.details.totalEngines || 0} security vendors flagged this URL`
                    }
                ],
                virusTotal: {
                    scanDate: vtData.analysis.scanDate,
                    positiveEngines: vtData.analysis.details.positiveEngines,
                    totalEngines: vtData.analysis.details.totalEngines,
                    categories: vtData.analysis.details.categories
                }
            }
        };
    } catch (error) {
        console.error('URL check error:', error);
        return {
            threatLevel: 'unknown',
            message: 'Could not complete security check',
            error: error.message
        };
    }
}

// Helper function to combine threat levels
function combineThreatLevels(domainThreat, vtThreat) {
    const threatLevels = ['safe', 'low', 'medium', 'high'];
    const domainIndex = threatLevels.indexOf(domainThreat);
    const vtIndex = threatLevels.indexOf(vtThreat);
    
    // Return the highest threat level
    return threatLevels[Math.max(domainIndex, vtIndex)];
} 