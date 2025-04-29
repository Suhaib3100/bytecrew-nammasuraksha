// Email scanner content script

// Configuration
const SCAN_INTERVAL = 2000; // Scan every 2 seconds for new content
const SUSPICIOUS_PATTERNS = [
    /^(?!.*@paypal\.com$).*paypal.*@/i,  // PayPal email spoofing
    /^(?!.*@amazon\.com$).*amazon.*@/i,   // Amazon email spoofing
    /^(?!.*@google\.com$).*google.*@/i,   // Google email spoofing
    // Add more patterns
];

// Track processed elements to avoid re-scanning
const processedElements = new WeakSet();

// Start scanning
startEmailScanning();

function startEmailScanning() {
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
                // Wait before retrying
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

async function scanLink(element) {
    if (processedElements.has(element)) return;
    
    processedElements.add(element);
    element.setAttribute('data-scanned', 'true');
    
    const url = element.href;
    if (!url) return;
    
    try {
        if (isShortenedUrl(url)) {
            addWarningOverlay(element, 'Shortened URL detected. Click to verify destination.');
            return;
        }

        const result = await checkUrl(url);
        if (result.threatLevel !== 'safe') {
            addWarningOverlay(element, result.message);
        }
    } catch (error) {
        console.warn('Error scanning link:', error);
    }
}

async function scanPage() {
    const links = document.querySelectorAll('a[href]:not([data-scanned])');
    const senderElements = [
        ...document.querySelectorAll('.gD'),
        ...document.querySelectorAll('.EPt5Dd'),
        ...document.querySelectorAll('.from_name')
    ];

    // Scan links
    for (const link of links) {
        await scanLink(link);
    }

    // Check senders
    senderElements.forEach(element => {
        if (!processedElements.has(element)) {
            processedElements.add(element);
            const address = element.textContent.trim();
            if (isSuspiciousEmail(address)) {
                addWarningOverlay(element, 'Potentially spoofed sender address');
            }
        }
    });
}

function initializeScanner() {
    try {
        scanPage();
        
        // Set up mutation observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    scanPage();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Periodic scan with proper interval handling
        setInterval(scanPage, 2000);
    } catch (error) {
        console.error('Error initializing scanner:', error);
    }
}

function scanLinks() {
    const links = document.querySelectorAll('a[href]:not([data-scanned])');
    
    links.forEach(async (link) => {
        if (processedElements.has(link)) return;
        
        processedElements.add(link);
        link.setAttribute('data-scanned', 'true');
        
        const url = link.href;
        if (!url) return;

        try {
            // Check if it's a shortened URL
            if (isShortenedUrl(url)) {
                addWarningOverlay(link, 'Shortened URL detected. Click to verify destination.');
                return;
            }

            // Send URL to background script for checking
            const response = await checkUrl(url);

            if (response.threatLevel !== 'safe') {
                addWarningOverlay(link, response.message);
            }
        } catch (error) {
            console.error('Error scanning link:', error);
        }
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