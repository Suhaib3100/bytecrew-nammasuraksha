document.addEventListener('DOMContentLoaded', function() {
    // Get analysis details from storage
    chrome.storage.local.get(['lastAnalysis'], function(data) {
        if (data.lastAnalysis) {
            const analysis = data.lastAnalysis;
            document.getElementById('status-message').textContent = 
                `${analysis.url} has been verified as safe by NammaSuraksha`;
        }
    });

    // Add close button functionality
    document.getElementById('close-button').addEventListener('click', function() {
        window.close();
    });
}); 