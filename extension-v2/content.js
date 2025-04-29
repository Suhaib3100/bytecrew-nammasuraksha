// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PHISHING_DETECTED') {
    // You can add additional UI elements or warnings here if needed
    console.warn('Phishing site detected:', message.url);
  }
}); 