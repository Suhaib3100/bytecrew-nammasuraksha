// Social Media Scanner Content Script

// Configuration
const SCAN_INTERVAL = 1500; // Scan every 1.5 seconds for new content
const SOCIAL_MEDIA_SELECTORS = {
    'twitter.com': {
        links: 'a[href*="t.co"], a[role="link"]',
        posts: '[data-testid="tweet"]',
        messages: '[role="dialog"] a'
    },
    'facebook.com': {
        links: 'a[href*="l.facebook.com"], a[href*="lm.facebook.com"]',
        posts: '[role="article"]',
        messages: '[role="main"] a'
    },
    'instagram.com': {
        links: 'a[href*="l.instagram.com"]',
        posts: 'article',
        messages: '[role="dialog"] a'
    },
    'linkedin.com': {
        links: 'a[href*="lnkd.in"]',
        posts: '[data-id]',
        messages: '.msg-conversation-listitem__link'
    },
    'web.whatsapp.com': {
        links: '.selectable-text a',
        messages: '.message-in a, .message-out a'
    }
};

// Track processed elements
const processedElements = new WeakSet();

// Start scanning
startSocialMediaScanning();

function startSocialMediaScanning() {
    // Initial scan
    scanSocialContent();
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                scanSocialContent();
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic scan for dynamic content
    setInterval(scanSocialContent, SCAN_INTERVAL);
}

function scanSocialContent() {
    const hostname = window.location.hostname;
    const selectors = SOCIAL_MEDIA_SELECTORS[hostname];
    
    if (!selectors) return;

    // Scan all links
    const allLinks = document.querySelectorAll(selectors.links);
    scanLinks(allLinks);

    // Scan posts if selector exists
    if (selectors.posts) {
        const posts = document.querySelectorAll(selectors.posts);
        scanPosts(posts);
    }

    // Scan messages if selector exists
    if (selectors.messages) {
        const messages = document.querySelectorAll(selectors.messages);
        scanLinks(messages);
    }
}

function scanLinks(links) {
    links.forEach(async (link) => {
        if (processedElements.has(link)) return;
        processedElements.add(link);

        const url = link.href;
        if (!url) return;

        try {
            // Check for shortened URLs
            if (isShortenedUrl(url)) {
                addWarningOverlay(link, 'Shortened URL detected - Exercise caution');
                return;
            }

            // Send URL to background script for checking
            const response = await chrome.runtime.sendMessage({
                type: 'checkUrl',
                url: url
            });

            if (response.threatLevel !== 'safe') {
                addWarningOverlay(link, response.message);
            }
        } catch (error) {
            console.error('Error scanning social media link:', error);
        }
    });
}

function scanPosts(posts) {
    posts.forEach((post) => {
        if (processedElements.has(post)) return;
        processedElements.add(post);

        // Check for common scam patterns in post content
        const content = post.textContent.toLowerCase();
        if (containsScamPattern(content)) {
            addPostWarning(post);
        }
    });
}

function containsScamPattern(content) {
    const scamPatterns = [
        /free\s+bitcoin/i,
        /double\s+your\s+money/i,
        /investment\s+opportunity/i,
        /crypto\s+giveaway/i,
        /limited\s+time\s+offer/i,
        /act\s+now/i,
        /dm\s+me\s+to\s+earn/i,
        /work\s+from\s+home\s+opportunity/i
    ];

    return scamPatterns.some(pattern => pattern.test(content));
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
        'tiny.cc',
        'lnkd.in',
        'l.facebook.com',
        'l.instagram.com'
    ];

    try {
        const hostname = new URL(url).hostname;
        return shortenerDomains.includes(hostname);
    } catch {
        return false;
    }
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

function addPostWarning(post) {
    const warning = document.createElement('div');
    warning.style.cssText = `
        background: #fff3e0;
        border: 1px solid #ffb74d;
        border-radius: 8px;
        padding: 8px 12px;
        margin: 8px 0;
        font-size: 14px;
        color: #e65100;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    warning.innerHTML = `
        <span style="font-size: 20px;">⚠️</span>
        <span>This post contains potential scam indicators. Please be cautious.</span>
    `;

    // Insert warning at the top of the post
    post.insertBefore(warning, post.firstChild);
} 