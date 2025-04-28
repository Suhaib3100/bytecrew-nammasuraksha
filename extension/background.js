// Constants for API endpoints
const API_ENDPOINT = 'http://localhost:3001/api';  // We'll update this with actual endpoint

// Initialize counters in storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        threatsBlocked: 0,
        linksScanned: 0
    });
});

// Listen for URL changes
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only check main frame navigation
    if (details.frameId !== 0) return;

    try {
        const url = new URL(details.url);
        
        // Skip checking for known safe domains
        if (isWhitelisted(url.hostname)) return;

        // Increment links scanned counter
        incrementCounter('linksScanned');

        // Check for phishing
        const securityCheck = await checkUrlSecurity(url.href);

        if (securityCheck.threatLevel === 'danger') {
            // Block navigation and show warning
            incrementCounter('threatsBlocked');
            chrome.tabs.update(details.tabId, {
                url: chrome.runtime.getURL('warning.html') + '?url=' + encodeURIComponent(url.href)
            });
        }
    } catch (error) {
        console.error('Error in URL check:', error);
    }
});

// Listen for email content scanning (Gmail, Outlook Web, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isEmailProvider(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['emailScanner.js']
        });
    }
});

// Listen for social media content scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isSocialMedia(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['socialMediaScanner.js']
        });
    }
});

async function checkUrlSecurity(url) {
    try {
        const response = await fetch(`${API_ENDPOINT}/check-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        return {
            threatLevel: data.threatLevel,
            message: data.message
        };
    } catch (error) {
        console.error('Security check failed:', error);
        return {
            threatLevel: 'warning',
            message: 'Could not verify security status'
        };
    }
}

async function incrementCounter(counterName) {
    const stats = await chrome.storage.local.get(counterName);
    await chrome.storage.local.set({
        [counterName]: (stats[counterName] || 0) + 1
    });
}

function isWhitelisted(hostname) {
    const whitelist = [
        'google.com',
        'microsoft.com',
        'github.com',
        // Add more trusted domains
    ];
    return whitelist.some(domain => hostname.endsWith(domain));
}

function isEmailProvider(url) {
    const emailProviders = [
        'mail.google.com',
        'outlook.live.com',
        'outlook.office365.com',
        'mail.yahoo.com'
    ];
    try {
        const hostname = new URL(url).hostname;
        return emailProviders.includes(hostname);
    } catch {
        return false;
    }
}

function isSocialMedia(url) {
    const socialPlatforms = [
        'twitter.com',
        'facebook.com',
        'instagram.com',
        'linkedin.com',
        'web.whatsapp.com'
    ];
    try {
        const hostname = new URL(url).hostname;
        return socialPlatforms.includes(hostname);
    } catch {
        return false;
    }
} 