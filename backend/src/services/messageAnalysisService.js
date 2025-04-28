const { analyzeMessageWithAI } = require('./aiService');

/**
 * Analyzes message content for potential scams and threats
 * @param {string} content - The message content to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeMessageContent(content) {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid message content');
    }

    // Basic content analysis
    const basicAnalysis = {
      length: content.length,
      hasLinks: /https?:\/\/[^\s]+/.test(content),
      hasPhoneNumbers: /\b\d{10}\b/.test(content),
      hasEmails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(content),
      hasUrgencyWords: /urgent|immediately|quick|hurry|limited time|act now/i.test(content),
      hasThreateningWords: /threat|danger|risk|warning|alert/i.test(content),
      hasSuspiciousKeywords: /password|login|account|verify|confirm|update|security/i.test(content)
    };

    // AI-based content analysis
    const aiAnalysis = await analyzeMessageWithAI(content);

    // Combine analyses
    return {
      content,
      basicAnalysis,
      aiAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in message analysis:', error);
    // Return a default analysis with error information
    return {
      content,
      basicAnalysis: {
        length: content.length,
        hasLinks: false,
        hasPhoneNumbers: false,
        hasEmails: false,
        hasUrgencyWords: false,
        hasThreateningWords: false,
        hasSuspiciousKeywords: false
      },
      aiAnalysis: {
        threatLevel: 'unknown',
        scamType: 'unknown',
        indicators: [],
        suspiciousPatterns: [],
        recommendations: ['Unable to complete full analysis due to an error'],
        summary: 'Analysis could not be completed due to an error'
      },
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  analyzeMessageContent
}; 