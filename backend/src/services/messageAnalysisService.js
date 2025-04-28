const { analyzeText } = require('./aiService');

async function analyzeMessageContent(content) {
  const analysis = {
    content,
    message: {
      threatLevel: 'low',
      scamType: 'unknown',
      indicators: [],
      suspiciousPatterns: []
    },
    recommendations: [],
    summary: '',
    timestamp: new Date().toISOString()
  };

  try {
    const aiAnalysis = await analyzeText(content, 'message');
    
    if (aiAnalysis.threatLevel) {
      analysis.message.threatLevel = aiAnalysis.threatLevel;
    }

    if (aiAnalysis.scamType) {
      analysis.message.scamType = aiAnalysis.scamType;
    }

    if (aiAnalysis.indicators) {
      analysis.message.indicators = aiAnalysis.indicators;
    }

    if (aiAnalysis.suspiciousPatterns) {
      analysis.message.suspiciousPatterns = aiAnalysis.suspiciousPatterns;
    }

    if (aiAnalysis.recommendations) {
      analysis.recommendations = aiAnalysis.recommendations;
    }

    if (aiAnalysis.summary) {
      analysis.summary = aiAnalysis.summary;
    }

    return analysis;
  } catch (error) {
    console.error('Error in message analysis:', error);
    throw error;
  }
}

module.exports = {
  analyzeMessageContent
}; 