document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Update security status
    updateSecurityStatus(url);

    // Load stats
    loadStats();

    // Add settings button listener
    document.getElementById('settings-btn').addEventListener('click', openSettings);
});

async function updateSecurityStatus(url) {
    const statusElement = document.getElementById('security-status');
    const response = await checkUrlSecurity(url);
    
    // Remove all existing status classes
    statusElement.classList.remove('safe', 'warning', 'danger');
    
    // Update status based on threat level
    switch(response.threatLevel) {
        case 'danger':
            statusElement.classList.add('danger');
            statusElement.innerHTML = `
                <div class="status-icon">🔴</div>
                <div class="status-text">
                    <h3>Danger</h3>
                    <p>${response.message}</p>
                </div>
            `;
            break;
        case 'warning':
            statusElement.classList.add('warning');
            statusElement.innerHTML = `
                <div class="status-icon">🟡</div>
                <div class="status-text">
                    <h3>Warning</h3>
                    <p>${response.message}</p>
                </div>
            `;
            break;
        default:
            statusElement.classList.add('safe');
            statusElement.innerHTML = `
                <div class="status-icon">🟢</div>
                <div class="status-text">
                    <h3>Safe</h3>
                    <p>This website is secure</p>
                </div>
            `;
    }
}

async function checkUrlSecurity(url) {
    try {
        // Here we'll make API call to our backend for security check
        // For now, returning mock data
        return {
            threatLevel: 'safe',
            message: 'This website is secure'
        };
    } catch (error) {
        console.error('Error checking URL security:', error);
        return {
            threatLevel: 'warning',
            message: 'Could not verify security status'
        };
    }
}

async function loadStats() {
    try {
        const stats = await chrome.storage.local.get(['threatsBlocked', 'linksScanned']);
        
        document.getElementById('threats-blocked').textContent = 
            stats.threatsBlocked || 0;
        document.getElementById('links-scanned').textContent = 
            stats.linksScanned || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function openSettings() {
    chrome.runtime.openOptionsPage();
} 