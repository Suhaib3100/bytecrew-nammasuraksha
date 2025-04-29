const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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

// New function to analyze domain using OpenAI
async function analyzeWithAI(domain, existingAnalysis) {
    try {
        const prompt = `Analyze this domain name for potential phishing or malicious intent: "${domain}"

Consider the following aspects:
1. Visual similarity to legitimate domains
2. Character substitutions (like using '0' for 'o')
3. Common phishing patterns
4. Brand impersonation attempts
5. Suspicious keywords or combinations

Context from basic analysis:
${JSON.stringify(existingAnalysis, null, 2)}

Provide a detailed analysis in JSON format with:
- threatLevel: "safe", "low", "medium", or "high"
- confidence: number between 0 and 1
- reasons: array of strings explaining the analysis
- additionalPatterns: any suspicious patterns not caught by basic analysis`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a cybersecurity expert specialized in analyzing domain names for phishing attempts. Provide analysis in JSON format only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content);
        return {
            aiThreatLevel: aiResponse.threatLevel,
            aiConfidence: aiResponse.confidence,
            aiReasons: aiResponse.reasons,
            additionalPatterns: aiResponse.additionalPatterns
        };
    } catch (error) {
        console.error('OpenAI API error:', error);
        return null;
    }
}

// Enhanced final judgment system with AI integration
async function makeFinalJudgment(domain, aiResults, similarityResults, phishingIndicators) {
    // Get AI analysis
    const basicAnalysis = {
        similarityResults,
        phishingIndicators,
        domainPatterns: DOMAIN_PATTERNS
    };
    
    const aiAnalysis = await analyzeWithAI(domain, basicAnalysis);
    
    let threatScore = 0;
    let confidence = 0;
    let reasons = [];
    
    // Weight different types of detections
    const weights = {
        ai_analysis: 0.6,
        similarity_match: 0.2,
        phishing_indicators: 0.2
    };

    // Process AI results if available
    if (aiAnalysis) {
        const aiThreatLevelScore = {
            'safe': 0,
            'low': 0.3,
            'medium': 0.6,
            'high': 0.9
        };
        
        threatScore += aiThreatLevelScore[aiAnalysis.aiThreatLevel] * weights.ai_analysis;
        confidence = Math.max(confidence, aiAnalysis.aiConfidence);
        reasons.push(...aiAnalysis.aiReasons);
        
        // Add any additional patterns found by AI
        if (aiAnalysis.additionalPatterns) {
            reasons.push(`AI detected additional suspicious patterns: ${aiAnalysis.additionalPatterns}`);
        }
    }

    // Process similarity results
    similarityResults.forEach(result => {
        threatScore += parseFloat(result.similarity) * weights.similarity_match;
        confidence = Math.max(confidence, parseFloat(result.similarity));
        reasons.push(result.reason);
    });

    // Process phishing indicators
    if (phishingIndicators.length > 0) {
        threatScore += 0.5 * weights.phishing_indicators;
        reasons.push(...phishingIndicators);
    }

    // Normalize threat score
    const normalizedScore = threatScore / (aiAnalysis ? 1 : 0.4); // Adjust if AI analysis is unavailable

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
        aiAnalysis: aiAnalysis // Include AI analysis in response
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
        
        // Get traditional analysis results
        const similarityResults = analyzeDomainSimilarity(cleanDomain);
        const phishingIndicators = checkPhishingIndicators(cleanDomain);

        // Make final judgment with AI integration
        const judgment = await makeFinalJudgment(cleanDomain, [], similarityResults, phishingIndicators);

        res.json({
            success: true,
            analysis: {
                domain: cleanDomain,
                threatLevel: judgment.threatLevel,
                confidence: judgment.confidence,
                score: judgment.score,
                reasons: judgment.reasons,
                details: {
                    aiAnalysis: judgment.aiAnalysis,
                    similarityMatches: similarityResults,
                    phishingIndicators: phishingIndicators
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