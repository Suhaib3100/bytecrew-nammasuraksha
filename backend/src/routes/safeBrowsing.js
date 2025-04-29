const express = require('express');
const router = express.Router();
const axios = require('axios');

const SAFE_BROWSING_API_KEY = 'AIzaSyAXDavrpKp8U9V6o10FuqCzXcS_OTmW1F8';
const SAFE_BROWSING_LOOKUP_API = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

// Helper function to normalize URL for checking
function normalizeUrl(url) {
    try {
        if (!url.match(/^https?:\/\//i)) {
            url = 'http://' + url;
        }
        const urlObj = new URL(url);
        return urlObj.href;
    } catch (error) {
        throw new Error('Invalid URL format');
    }
}

// Helper function to check URL with Google Safe Browsing
async function checkUrlWithSafeBrowsing(url) {
    try {
        const normalizedUrl = normalizeUrl(url);
        
        const response = await axios.post(
            `${SAFE_BROWSING_LOOKUP_API}?key=${SAFE_BROWSING_API_KEY}`,
            {
                client: {
                    clientId: "bytecrew-nammasuraksha",
                    clientVersion: "1.0.0"
                },
                threatInfo: {
                    threatTypes: [
                        "MALWARE",
                        "SOCIAL_ENGINEERING",
                        "UNWANTED_SOFTWARE"
                    ],
                    platformTypes: [
                        "WINDOWS",
                        "LINUX",
                        "ANDROID",
                        "IOS",
                        "ANY_PLATFORM"
                    ],
                    threatEntryTypes: [
                        "URL"
                    ],
                    threatEntries: [
                        { "url": normalizedUrl }
                    ]
                }
            }
        );

        // If no matches are found, response.data will be empty
        const matches = response.data.matches || [];
        
        // Enhanced threat analysis
        const threatAnalysis = {
            isMalicious: matches.length > 0,
            threatLevel: 'safe',
            threats: matches.map(match => ({
                type: match.threatType,
                platform: match.platformType,
                metadata: match.threatEntryMetadata?.entries || []
            })),
            details: {
                totalThreats: matches.length,
                threatTypes: [...new Set(matches.map(m => m.threatType))],
                affectedPlatforms: [...new Set(matches.map(m => m.platformType))]
            }
        };

        // Determine threat level
        if (matches.length > 0) {
            const hasCriticalThreats = matches.some(m => 
                m.threatType === 'MALWARE' || 
                m.threatType === 'SOCIAL_ENGINEERING'
            );
            const hasModerateThreats = matches.some(m => 
                m.threatType === 'UNWANTED_SOFTWARE'
            );

            if (hasCriticalThreats) {
                threatAnalysis.threatLevel = 'high';
            } else if (hasModerateThreats) {
                threatAnalysis.threatLevel = 'medium';
            } else {
                threatAnalysis.threatLevel = 'low';
            }
        }

        // Add cache timestamp
        threatAnalysis.timestamp = new Date().toISOString();
        threatAnalysis.cachedResult = false;

        return threatAnalysis;

    } catch (error) {
        console.error('Google Safe Browsing API error:', error.response?.data || error.message);
        throw error;
    }
}

// Endpoint to check URL using Google Safe Browsing
router.post('/check-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        const result = await checkUrlWithSafeBrowsing(url);

        // Add recommendations based on threat analysis
        const recommendations = [];
        if (result.isMalicious) {
            if (result.threatLevel === 'high') {
                recommendations.push(
                    'This site has been identified as potentially dangerous',
                    'Do not proceed to this website',
                    'Your personal information may be at risk'
                );
            } else if (result.threatLevel === 'medium') {
                recommendations.push(
                    'Exercise caution when visiting this site',
                    'Avoid downloading files or entering personal information',
                    'Consider using a secure browser extension'
                );
            }
        }

        res.json({
            success: true,
            analysis: {
                ...result,
                recommendations,
                url: url
            }
        });

    } catch (error) {
        console.error('Error in Safe Browsing check:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to check URL',
            details: error.message
        });
    }
});

module.exports = router; 