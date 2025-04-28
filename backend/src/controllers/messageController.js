const db = require('../config/database');
const { analyzeMessageContent } = require('../services/messageAnalysisService');
const { analyzeMessageWithAI } = require('../services/aiService');

exports.analyzeMessage = async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    // Basic analysis
    const basicAnalysis = await analyzeMessageContent(content);
    
    // AI analysis
    const aiAnalysis = await analyzeMessageWithAI(content);
    
    // Combine analyses
    const analysis = {
      content,
      security: {
        threatLevel: aiAnalysis.threatLevel,
        scamType: aiAnalysis.scamType,
        indicators: aiAnalysis.indicators,
        suspiciousPatterns: aiAnalysis.suspiciousPatterns
      },
      recommendations: aiAnalysis.recommendations,
      summary: aiAnalysis.summary,
      timestamp: new Date().toISOString()
    };
    
    // Check if user exists if userId is provided
    let validUserId = null;
    if (userId && !isNaN(userId)) {
      const userResult = await db.query('SELECT id FROM users WHERE id = $1', [parseInt(userId)]);
      if (userResult.rows.length > 0) {
        validUserId = parseInt(userId);
      }
    }
    
    // Save analysis to database
    await db.query(
      'INSERT INTO message_analyses (content, result, user_id, created_at) VALUES ($1, $2, $3, NOW())',
      [content, analysis, validUserId]
    );

    res.json({ 
      success: true, 
      analysis
    });
  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze message',
      details: error.message 
    });
  }
}; 