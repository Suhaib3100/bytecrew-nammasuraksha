const express = require('express');
const router = express.Router();

// Enhanced patterns database with more sophisticated rules
const DOMAIN_PATTERNS = {
    'steam': {
        legitimate: ['steampowered.com', 'steamcommunity.com'],
        suspicious: [
            'steamcummunity', 'steamcomunnity', 'steam-community', 'steampower',
            'steam-powered', 'steamunlocked', 'steamgifts', 'steam-wallet',
            'steam-trade', 'steamstore', 'steam-store', 'steamprofile'
        ],
        keywords: ['trade', 'skin', 'csgo', 'gift', 'wallet', 'free']
    },
    'whatsapp': {
        legitimate: ['whatsapp.com', 'wa.me'],
        suspicious: [
            'whattsapp', 'whatsap', 'whatsfap', 'whazzap', 'whatsapp-update',
            'whatsapp-invite', 'whatsapp-group', 'whatsappweb', 'whatsapp-web'
        ],
        keywords: ['group', 'invite', 'join', 'video', 'call']
    },
    'facebook': {
        legitimate: ['facebook.com', 'fb.com', 'messenger.com'],
        suspicious: [
            'faceboook', 'facbook', 'facebook-security', 'facebook-login',
            'fb-login', 'fb-messenger', 'facebook-messenger', 'fblogin'
        ],
        keywords: ['login', 'security', 'verify', 'account', 'messenger']
    },
    'microsoft': {
        legitimate: ['microsoft.com', 'live.com', 'outlook.com', 'office.com'],
        suspicious: [
            'microsft', 'micros0ft', 'microsoft-support', 'microsoft-help',
            'microsoft-security', 'microsoft-update', 'microsoft365', 'office365'
        ],
        keywords: ['office', 'windows', 'update', 'support', 'security']
    },
    'paypal': {
        legitimate: ['paypal.com', 'paypal.me'],
        suspicious: [
            'paypaI', 'pay-pal', 'paypal-secure', 'paypal-support',
            'paypal-service', 'paypal-account', 'paypal-login'
        ],
        keywords: ['account', 'login', 'secure', 'payment', 'verify']
    },
    'google': {
        legitimate: ['google.com', 'gmail.com', 'googleapis.com'],
        suspicious: [
            'google', 'g00gle', 'google-login', 'google-account',
            'gmail-login', 'google-security', 'google-verify'
        ],
        keywords: ['account', 'login', 'security', 'gmail', 'drive']
    },
    'amazon': {
        legitimate: ['amazon.com', 'amazon.co.uk', 'amazon.in'],
        suspicious: [
            'amaz0n', 'amazonn', 'amazon-account', 'amazon-prime',
            'amazon-security', 'amazon-login', 'amazon-verify'
        ],
        keywords: ['prime', 'account', 'order', 'delivery', 'payment']
    }
};

// Levenshtein distance to measure string similarity
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1,
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1
                );
            }
        }
    }
    return dp[m][n];
}

// Check if a domain is suspiciously similar to legitimate domains
function analyzeDomainSimilarity(domain) {
    const results = [];
    const domainLower = domain.toLowerCase();

    for (const [brand, patterns] of Object.entries(DOMAIN_PATTERNS)) {
        // Check against legitimate domains
        for (const legitimate of patterns.legitimate) {
            const distance = levenshteinDistance(domainLower, legitimate);
            const similarity = 1 - (distance / Math.max(domainLower.length, legitimate.length));
            
            // If very similar but not exact match, it's suspicious
            if (similarity > 0.8 && similarity < 1) {
                results.push({
                    brand,
                    legitimate,
                    similarity: similarity.toFixed(2),
                    reason: `Suspiciously similar to ${legitimate}`
                });
            }
        }

        // Check against known suspicious patterns
        for (const pattern of patterns.suspicious) {
            if (domainLower.includes(pattern)) {
                results.push({
                    brand,
                    pattern,
                    similarity: 1,
                    reason: `Contains known suspicious pattern: ${pattern}`
                });
            }
        }
    }

    return results;
}

// Additional checks for common phishing indicators
function checkPhishingIndicators(domain) {
    const indicators = [];
    
    // Check for excessive hyphens
    if ((domain.match(/-/g) || []).length > 2) {
        indicators.push('Excessive use of hyphens');
    }

    // Check for number substitution (e.g., 0 for o)
    if (/\d/.test(domain)) {
        indicators.push('Contains numbers in suspicious positions');
    }

    // Check for common security-related keywords
    const securityKeywords = ['secure', 'login', 'signin', 'account', 'verify', 'support'];
    for (const keyword of securityKeywords) {
        if (domain.includes(keyword)) {
            indicators.push(`Contains security-related keyword: ${keyword}`);
        }
    }

    return indicators;
}

// AI-based pattern recognition
function analyzePatternWithAI(domain, patterns) {
    const results = [];
    const domainLower = domain.toLowerCase();
    
    // Advanced pattern matching using character substitution detection
    const substitutions = {
        '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
        '6': 'b', '7': 't', '8': 'b', '9': 'g', '@': 'a'
    };

    // Normalize domain by replacing common substitutions
    let normalizedDomain = domainLower;
    Object.entries(substitutions).forEach(([num, letter]) => {
        normalizedDomain = normalizedDomain.replace(new RegExp(num, 'g'), letter);
    });

    // Check for homograph attacks (similar-looking characters)
    const homographs = {
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c',
        'у': 'y', 'х': 'x', 'ѕ': 's', 'і': 'i', 'ј': 'j'
    };

    let containsHomographs = false;
    Object.entries(homographs).forEach(([cyrillic, latin]) => {
        if (domainLower.includes(cyrillic)) {
            containsHomographs = true;
            results.push({
                type: 'homograph_attack',
                confidence: 0.95,
                reason: `Contains deceptive character: ${cyrillic} (looks like ${latin})`
            });
        }
    });

    // Advanced brand impersonation detection
    for (const [brand, brandPatterns] of Object.entries(DOMAIN_PATTERNS)) {
        // Check for exact matches of legitimate domains
        if (brandPatterns.legitimate.includes(domainLower)) {
            continue;
        }

        // Check for suspicious patterns with context
        for (const pattern of brandPatterns.suspicious) {
            if (normalizedDomain.includes(pattern.toLowerCase())) {
                results.push({
                    type: 'suspicious_pattern',
                    brand,
                    confidence: 0.85,
                    reason: `Contains known suspicious pattern for ${brand}: ${pattern}`
                });
            }
        }

        // Check for keyword combinations that might indicate phishing
        let keywordCount = 0;
        for (const keyword of brandPatterns.keywords) {
            if (normalizedDomain.includes(keyword.toLowerCase())) {
                keywordCount++;
            }
        }

        if (keywordCount >= 2) {
            results.push({
                type: 'keyword_combination',
                brand,
                confidence: 0.75,
                reason: `Multiple suspicious keywords for ${brand} brand`
            });
        }
    }

    // Check for excessive use of security terms
    const securityTerms = ['secure', 'security', 'login', 'verify', 'account', 'support', 'help'];
    const securityTermCount = securityTerms.filter(term => normalizedDomain.includes(term)).length;
    
    if (securityTermCount >= 2) {
        results.push({
            type: 'security_term_abuse',
            confidence: 0.8,
            reason: 'Excessive use of security-related terms'
        });
    }

    return results;
}

// Enhanced final judgment system
function makeFinalJudgment(domain, aiResults, similarityResults) {
    let threatScore = 0;
    let confidence = 0;
    let reasons = [];
    
    // Weight different types of detections
    const weights = {
        homograph_attack: 0.9,
        suspicious_pattern: 0.8,
        keyword_combination: 0.6,
        security_term_abuse: 0.7,
        similarity_match: 0.75
    };

    // Process AI results
    aiResults.forEach(result => {
        const weight = weights[result.type] || 0.5;
        threatScore += result.confidence * weight;
        confidence = Math.max(confidence, result.confidence);
        reasons.push(result.reason);
    });

    // Process similarity results
    similarityResults.forEach(result => {
        threatScore += parseFloat(result.similarity) * weights.similarity_match;
        confidence = Math.max(confidence, parseFloat(result.similarity));
        reasons.push(result.reason);
    });

    // Normalize threat score
    const normalizedScore = threatScore / Math.max(aiResults.length + similarityResults.length, 1);

    // Determine final threat level
    let threatLevel;
    if (normalizedScore >= 0.8) {
        threatLevel = 'high';
    } else if (normalizedScore >= 0.5) {
        threatLevel = 'medium';
    } else if (normalizedScore > 0.2) {
        threatLevel = 'low';
    } else {
        threatLevel = 'safe';
    }

    return {
        threatLevel,
        confidence: confidence.toFixed(2),
        score: normalizedScore.toFixed(2),
        reasons: [...new Set(reasons)], // Remove duplicates
    };
}

router.post('/analyze', async (req, res) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({
                success: false,
                error: 'Domain is required'
            });
        }

        // Remove protocol and get domain
        const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // Get AI-based analysis results
        const aiResults = analyzePatternWithAI(cleanDomain, DOMAIN_PATTERNS);
        
        // Get traditional similarity analysis results
        const similarityResults = analyzeDomainSimilarity(cleanDomain);

        // Make final judgment
        const judgment = makeFinalJudgment(cleanDomain, aiResults, similarityResults);

        res.json({
            success: true,
            analysis: {
                domain: cleanDomain,
                threatLevel: judgment.threatLevel,
                confidence: judgment.confidence,
                score: judgment.score,
                reasons: judgment.reasons,
                details: {
                    aiDetections: aiResults,
                    similarityMatches: similarityResults
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Domain analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router; 