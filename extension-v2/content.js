// Add styles for the warning icon
const style = document.createElement('style');
style.textContent = `
.malicious-link-warning {
    display: inline-flex;
    align-items: center;
    margin-left: 5px;
    color: #d32f2f;
    font-size: 16px;
    cursor: help;
    position: relative;
}

.malicious-link-tooltip {
    position: absolute;
    background: #fff;
    border: 1px solid #d32f2f;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    color: #d32f2f;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 10000;
    max-width: 300px;
    display: none;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
    white-space: normal;
}

.malicious-link-warning:hover .malicious-link-tooltip {
    display: block;
}

.malicious-link {
    color: #d32f2f !important;
    text-decoration: line-through !important;
    position: relative;
}
`;
document.head.appendChild(style);

// Function to check a single URL
async function checkSingleUrl(url) {
    try {
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
        return result.analysis?.isMalicious || false;
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
    if (!link.querySelector('.malicious-link-warning')) {
        // Add malicious class to the link
        link.classList.add('malicious-link');
        
        // Create warning container
        const warningContainer = document.createElement('span');
        warningContainer.className = 'malicious-link-warning';
        
        // Add warning icon
        const warningIcon = document.createElement('span');
        warningIcon.textContent = '⚠️';
        warningIcon.title = 'This link may be dangerous';
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'malicious-link-tooltip';
        tooltip.textContent = 'Warning: This link has been identified as potentially dangerous. Click with caution.';
        
        // Assemble the warning
        warningContainer.appendChild(warningIcon);
        warningContainer.appendChild(tooltip);
        
        // Insert after the link
        link.insertAdjacentElement('afterend', warningContainer);
    }
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

// Initialize when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkPageLinks();
        observePageChanges();
    });
} else {
    // If DOM is already loaded, run immediately
    checkPageLinks();
    observePageChanges();
} 