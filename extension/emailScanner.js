// Email scanner content script

// Configuration
const SCAN_INTERVAL = 2000; // Scan every 2 seconds for new content
const SUSPICIOUS_PATTERNS = [
    /^(?!.*@paypal\.com$).*paypal.*@/i,  // PayPal email spoofing
    /^(?!.*@amazon\.com$).*amazon.*@/i,   // Amazon email spoofing
    /^(?!.*@google\.com$).*google.*@/i,   // Google email spoofing
    // Add more patterns
];

// Style for link indicators
const INDICATOR_STYLES = `
.link-indicator {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    vertical-align: middle;
    border-radius: 50%;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    cursor: help;
    position: relative;
}

.link-indicator.safe {
    background: #4CAF50;
    color: white;
}

.link-indicator.warning {
    background: #FFC107;
    color: #333;
}

.link-indicator.danger {
    background: #F44336;
    color: white;
}

.link-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10000;
}

.link-indicator:hover .link-tooltip {
    visibility: visible;
    opacity: 1;
}

.modified-link {
    position: relative;
    display: inline-flex;
    align-items: center;
}
`;

// Track processed elements to avoid re-scanning
const processedElements = new WeakSet();

// Add styles to the page
function addStyles() {
    const style = document.createElement('style');
    style.textContent = INDICATOR_STYLES;
    document.head.appendChild(style);
}

// Start scanning
function startEmailScanning() {
    // Add styles
    addStyles();

    // Initial scan
    scanEmailContent();
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                scanEmailContent();
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic scan for dynamic content
    setInterval(scanEmailContent, SCAN_INTERVAL);
}

function scanEmailContent() {
    // Scan for links
    scanLinks();
    
    // Scan for sender addresses
    scanSenderAddresses();
}

async function checkUrl(url) {
    try {
        // Increase timeout and add retry logic
        const maxRetries = 3;
        const timeout = 10000; // 10 seconds
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error(`Request timed out after ${timeout}ms`));
                    }, timeout);

                    chrome.runtime.sendMessage(
                        { 
                            type: "checkUrl", 
                            url: url,
                            attempt: attempt 
                        },
                        (response) => {
                            clearTimeout(timeoutId);
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                resolve(response);
                            }
                        }
                    );
                });

                if (!response || typeof response !== 'object') {
                    throw new Error('Invalid response format');
                }

                return response;
            } catch (retryError) {
                if (attempt === maxRetries) {
                    throw retryError;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        console.warn('URL check failed:', error.message);
        return { 
            threatLevel: 'unknown', 
            message: 'Could not verify link safety',
            error: error.message 
        };
    }
}

function createIndicator(status, message) {
    const container = document.createElement('span');
    container.className = 'link-indicator ' + status;
    
    // Set indicator symbol
    switch (status) {
        case 'safe':
            container.textContent = '✓';
            break;
        case 'warning':
            container.textContent = '!';
            break;
        case 'danger':
            container.textContent = '⚠';
            break;
        default:
            container.textContent = '?';
    }

    // Add tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'link-tooltip';
    tooltip.textContent = message;
    container.appendChild(tooltip);

    return container;
}

async function scanLink(element) {
    if (processedElements.has(element)) return;
    
    try {
        // Mark as processed
        processedElements.add(element);
        
        // Create container for link and indicator
        const container = document.createElement('span');
        container.className = 'modified-link';
        
        // Move the link into the container
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);
        
        const url = element.href;
        if (!url) return;

        // Show analyzing state
        const loadingIndicator = createIndicator('warning', 'Analyzing link safety...');
        container.appendChild(loadingIndicator);

        // Check URL safety
        const result = await checkUrl(url);
        container.removeChild(loadingIndicator);

        // Create appropriate indicator based on result
        let status, message;
        if (result.threatLevel === 'safe') {
            status = 'safe';
            message = 'This link has been verified as safe';
        } else if (result.threatLevel === 'medium') {
            status = 'warning';
            message = result.message || 'This link may not be safe';
        } else if (result.threatLevel === 'high') {
            status = 'danger';
            message = result.message || 'Warning: This link may be dangerous';
        } else {
            status = 'warning';
            message = 'Could not verify link safety';
        }

        const indicator = createIndicator(status, message);
        container.appendChild(indicator);

        // Add click handler for dangerous links
        if (status === 'danger' || status === 'warning') {
            element.addEventListener('click', (e) => {
                if (!confirm(`Warning: ${message}\n\nDo you want to proceed?`)) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    } catch (error) {
        console.error('Error scanning link:', error);
    }
}

function scanLinks() {
    const links = document.querySelectorAll('a[href]:not([data-scanned])');
    
    links.forEach(async (link) => {
        if (processedElements.has(link)) return;
        link.setAttribute('data-scanned', 'true');
        await scanLink(link);
    });
}

function scanSenderAddresses() {
    // Different email providers have different DOM structures
    // Gmail
    const gmailSenders = document.querySelectorAll('.gD');
    // Outlook
    const outlookSenders = document.querySelectorAll('.EPt5Dd');
    // Yahoo Mail
    const yahooSenders = document.querySelectorAll('.from_name');

    const senders = [...gmailSenders, ...outlookSenders, ...yahooSenders];

    senders.forEach((sender) => {
        if (processedElements.has(sender)) return;
        processedElements.add(sender);

        const emailAddress = sender.textContent.trim();
        if (isSuspiciousEmail(emailAddress)) {
            addWarningOverlay(sender, 'Potentially spoofed sender address');
        }
    });
}

function isShortenedUrl(url) {
    const shortenerDomains = [
        'bit.ly',
        'tinyurl.com',
        't.co',
        'goo.gl',
        'ow.ly',
        'is.gd',
        'buff.ly',
        'adf.ly',
        'tiny.cc'
    ];

    try {
        const hostname = new URL(url).hostname;
        return shortenerDomains.includes(hostname);
    } catch {
        return false;
    }
}

function isSuspiciousEmail(email) {
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email));
}

function addWarningOverlay(element, message) {
    // Create warning container
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        display: inline-block;
    `;

    // Wrap element in container
    element.parentNode.insertBefore(container, element);
    container.appendChild(element);

    // Add warning icon
    const warning = document.createElement('span');
    warning.innerHTML = '⚠️';
    warning.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #fff3e0;
        border-radius: 50%;
        padding: 2px;
        cursor: help;
        z-index: 1000;
    `;

    // Add tooltip
    warning.title = message;

    // Add click handler to prevent immediate navigation
    element.addEventListener('click', (e) => {
        if (confirm('This link has been flagged as potentially dangerous. Do you want to proceed?')) {
            return true;
        }
        e.preventDefault();
        return false;
    });

    container.appendChild(warning);
}

// Initialize scanner
startEmailScanning(); 