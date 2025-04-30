// Add styles for the warning icon
const style = document.createElement('style');
style.textContent = `
.malicious-link-warning {
    display: inline-flex !important;
    align-items: center !important;
    margin-left: 5px !important;
    color: #d32f2f !important;
    font-size: 16px !important;
    cursor: help !important;
    position: relative !important;
    z-index: 9999 !important;
    vertical-align: middle !important;
}

.malicious-link-tooltip {
    position: absolute !important;
    background: #fff !important;
    border: 1px solid #d32f2f !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 14px !important;
    color: #d32f2f !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    z-index: 10000 !important;
    max-width: 300px !important;
    display: none !important;
    left: 100% !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-left: 8px !important;
    white-space: normal !important;
    pointer-events: none !important;
}

.malicious-link-warning:hover .malicious-link-tooltip {
    display: block !important;
}

.malicious-link {
    color: #d32f2f !important;
    text-decoration: line-through !important;
    position: relative !important;
}

.suspicious-message-warning {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #fff3e0;
    border: 1px solid #ffb74d;
    border-radius: 4px;
    margin: 8px 0;
    font-size: 14px;
    color: #e65100;
    gap: 8px;
}

.suspicious-message {
    border-left: 4px solid #ff9800;
    padding-left: 12px;
    background-color: #fff8e1;
}

.message-warning-icon {
    font-size: 16px;
    color: #ff9800;
}

.message-warning-details {
    display: none;
    background: #fff;
    border: 1px solid #ff9800;
    border-radius: 4px;
    padding: 12px;
    margin-top: 8px;
    font-size: 13px;
    color: #333;
}

.suspicious-message-warning:hover .message-warning-details {
    display: block;
}
`;
document.head.appendChild(style);

// Function to check a single URL
async function checkSingleUrl(url) {
    try {
        console.log('Checking URL:', url);
        const response = await fetch('http://localhost:3001/api/safebrowsing/check-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url,
                context: {
                    timestamp: new Date().toISOString()
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        // Check if the response indicates a malicious URL
        if (result.success && result.analysis) {
            return result.analysis.isMalicious || false;
        }
        
        // Fallback to pattern checking if API response is unclear
        return isKnownBadPattern(url);
    } catch (error) {
        console.error('Error checking URL:', error);
        // Check against known bad patterns as fallback
        return isKnownBadPattern(url);
    }
}

// Function to check known bad patterns
function isKnownBadPattern(url) {
    const badPatterns = [
        /testsafebrowsing\.appspot\.com/i,
        /malware\.testing\.google\.test/i,
        /\.tk$/i,
        /\.ml$/i,
        /\.cf$/i,
        /\.gq$/i,
        /@.*\./i,
        /^data:/i,
        /^[0-9.]+$/i
    ];
    
    return badPatterns.some(pattern => pattern.test(url));
}

// Function to add warning icon next to a link
function addWarningToLink(link) {
    console.log('Adding warning to link:', link.href);
    
    // Check if warning already exists
    if (link.querySelector('.malicious-link-warning')) {
        console.log('Warning already exists for:', link.href);
        return;
    }
    
    // Add malicious class to the link
    link.classList.add('malicious-link');
    
    // Create warning container
    const warningContainer = document.createElement('span');
    warningContainer.className = 'malicious-link-warning';
    warningContainer.style.cssText = 'display: inline-flex !important; margin-left: 5px !important;';
    
    // Add warning icon
    const warningIcon = document.createElement('span');
    warningIcon.textContent = '⚠️';
    warningIcon.title = 'This link may be dangerous';
    warningIcon.style.cssText = 'font-size: 16px !important; color: #d32f2f !important;';
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'malicious-link-tooltip';
    tooltip.textContent = 'Warning: This link has been identified as potentially dangerous. Click with caution.';
    
    // Assemble the warning
    warningContainer.appendChild(warningIcon);
    warningContainer.appendChild(tooltip);
    
    // Insert after the link
    link.insertAdjacentElement('afterend', warningContainer);
    
    console.log('Warning added successfully to:', link.href);
}

// Function to check all links on the page
async function checkPageLinks() {
    const links = document.querySelectorAll('a[href]');
    
    for (const link of links) {
        const url = link.href;
        if (url.startsWith('http')) {
            const isMalicious = await checkSingleUrl(url);
            if (isMalicious) {
                addWarningToLink(link);
            }
        }
    }
}

// Function to handle dynamically added content
function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    // Check the node itself if it's a link
                    if (node.tagName === 'A' && node.href) {
                        checkSingleUrl(node.href).then(isMalicious => {
                            if (isMalicious) {
                                addWarningToLink(node);
                            }
                        });
                    }
                    
                    // Check any links within the node
                    const links = node.querySelectorAll('a[href]');
                    links.forEach(link => {
                        if (link.href.startsWith('http')) {
                            checkSingleUrl(link.href).then(isMalicious => {
                                if (isMalicious) {
                                    addWarningToLink(link);
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PHISHING_DETECTED') {
        const links = document.querySelectorAll(`a[href="${message.url}"]`);
        links.forEach(link => addWarningToLink(link));
    }
});

// Function to check message content
async function analyzeSuspiciousMessage(message) {
    try {
        const response = await fetch('http://localhost:3001/api/content/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                content: message,
                context: {
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error analyzing message:', error);
        return null;
    }
}

// Function to add warning to suspicious message
function addMessageWarning(element, analysis) {
    if (!element.querySelector('.suspicious-message-warning')) {
        element.classList.add('suspicious-message');
        
        const warningDiv = document.createElement('div');
        warningDiv.className = 'suspicious-message-warning';
        
        const warningIcon = document.createElement('span');
        warningIcon.className = 'message-warning-icon';
        warningIcon.textContent = '⚠️';
        
        const warningText = document.createElement('span');
        warningText.textContent = 'This message appears suspicious';
        
        const warningDetails = document.createElement('div');
        warningDetails.className = 'message-warning-details';
        warningDetails.innerHTML = `
            <strong>Why this is suspicious:</strong>
            <ul style="margin-top: 8px; margin-left: 20px; list-style-type: disc;">
                ${analysis.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
            ${analysis.recommendations ? `
                <strong style="display: block; margin-top: 12px;">Recommendations:</strong>
                <ul style="margin-top: 8px; margin-left: 20px; list-style-type: disc;">
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            ` : ''}
        `;
        
        warningDiv.appendChild(warningIcon);
        warningDiv.appendChild(warningText);
        warningDiv.appendChild(warningDetails);
        
        element.insertAdjacentElement('beforebegin', warningDiv);
    }
}

// Function to scan messages in common platforms
async function scanMessages() {
    // Gmail
    if (window.location.hostname.includes('mail.google.com')) {
        const emails = document.querySelectorAll('.a3s.aiL');
        for (const email of emails) {
            const result = await analyzeSuspiciousMessage(email.textContent);
            if (result?.isSuspicious) {
                addMessageWarning(email, result);
            }
        }
    }
    
    // Outlook
    else if (window.location.hostname.includes('outlook.live.com') || 
             window.location.hostname.includes('outlook.office.com')) {
        const messages = document.querySelectorAll('[role="main"] .contentPane');
        for (const message of messages) {
            const result = await analyzeSuspiciousMessage(message.textContent);
            if (result?.isSuspicious) {
                addMessageWarning(message, result);
            }
        }
    }
    
    // Facebook Messenger
    else if (window.location.hostname.includes('facebook.com') || 
             window.location.hostname.includes('messenger.com')) {
        const messages = document.querySelectorAll('[role="main"] [data-content-type="message"]');
        for (const message of messages) {
            const result = await analyzeSuspiciousMessage(message.textContent);
            if (result?.isSuspicious) {
                addMessageWarning(message, result);
            }
        }
    }
    
    // WhatsApp Web
    else if (window.location.hostname.includes('web.whatsapp.com')) {
        const messages = document.querySelectorAll('.message-in, .message-out');
        for (const message of messages) {
            const result = await analyzeSuspiciousMessage(message.textContent);
            if (result?.isSuspicious) {
                addMessageWarning(message, result);
            }
        }
    }
    
    // LinkedIn
    else if (window.location.hostname.includes('linkedin.com')) {
        const messages = document.querySelectorAll('.msg-s-event-listitem__body');
        for (const message of messages) {
            const result = await analyzeSuspiciousMessage(message.textContent);
            if (result?.isSuspicious) {
                addMessageWarning(message, result);
            }
        }
    }
}

// Function to observe DOM changes for new messages
function observeMessageChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    // Check if the new node is a message
                    const isMessage = 
                        node.classList?.contains('a3s') || // Gmail
                        node.getAttribute('role') === 'main' || // Outlook
                        node.getAttribute('data-content-type') === 'message' || // Facebook
                        node.classList?.contains('message-in') || // WhatsApp
                        node.classList?.contains('message-out') || // WhatsApp
                        node.classList?.contains('msg-s-event-listitem__body'); // LinkedIn
                    
                    if (isMessage) {
                        analyzeSuspiciousMessage(node.textContent).then(result => {
                            if (result?.isSuspicious) {
                                addMessageWarning(node, result);
                            }
                        });
                    }
                    
                    // Also check for messages within the new node
                    scanMessages();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize everything
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkPageLinks();
        scanMessages();
        observePageChanges();
        observeMessageChanges();
    });
} else {
    checkPageLinks();
    scanMessages();
    observePageChanges();
    observeMessageChanges();
} 