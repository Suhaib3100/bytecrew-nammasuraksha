# Namma Suraksha Chrome Extension

A Chrome extension for detecting phishing links and protecting users from malicious websites.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Chrome browser

## Installation

1. Clone the repository
2. Navigate to the extension directory:
   ```bash
   cd extension
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Building the Extension

To build the extension, run:
```bash
npm run build
```

This will create a `dist` directory containing `nammasuraksha.zip`.

## Testing the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be installed and visible in your Chrome toolbar

## Development

- `manifest.json` - Extension configuration
- `background.js` - Background service worker
- `content.js` - Content script for webpage interaction
- `popup.html` - Extension popup UI
- `popup.js` - Popup functionality
- `options.html` - Extension options page
- `options.js` - Options page functionality
- `styles.css` - Common styles
- `build.js` - Build script for packaging the extension

## Testing Checklist

1. Install the extension
2. Verify the extension icon appears in the toolbar
3. Click the extension icon to verify the popup UI
4. Visit a test website to verify content script functionality
5. Check the extension options page
6. Test the background service worker
7. Verify the extension works across different websites
8. Test the extension with different types of links
9. Verify error handling and edge cases
10. Test the extension's performance

## Troubleshooting

If you encounter any issues:
1. Check the Chrome DevTools console for errors
2. Verify all files are present in the correct locations
3. Ensure the manifest.json is properly formatted
4. Check that all required permissions are specified
5. Verify the extension is properly loaded in chrome://extensions/

