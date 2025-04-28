const db = require('../config/database');
const { analyzeWebpageContent, analyzeUrl } = require('../services/analysisService');
const { analyzeContentWithAI } = require('../services/aiService');

exports.analyzeWebpage = async (req, res) => {
  try {
    const { content, url, userId } = req.body;
    
    // Basic analysis
    const basicAnalysis = await analyzeWebpageContent(content, url);
    
    // AI analysis
    const aiAnalysis = await analyzeContentWithAI(content, url);
    
    // Combine analyses
    const analysis = {
      ...basicAnalysis,
      aiAnalysis: {
        threatLevel: aiAnalysis.analysis.threatLevel,
        securityRecommendations: aiAnalysis.analysis.recommendations,
        detailedAnalysis: aiAnalysis.analysis.detailedAnalysis
      },
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
      'INSERT INTO analyses (url, content, result, user_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [url, content, analysis, validUserId]
    );

    res.json({ 
      success: true, 
      analysis: {
        url,
        basicAnalysis,
        aiAnalysis: aiAnalysis.analysis,
        timestamp: analysis.timestamp
      }
    });
  } catch (error) {
    console.error('Error analyzing webpage:', error);
    res.status(500).json({ error: 'Failed to analyze webpage' });
  }
};

exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const analysis = await analyzeUrl(url);
    
    // Save analysis to database
    await db.query(
      'INSERT INTO url_analyses (url, result, created_at) VALUES ($1, $2, NOW())',
      [url, analysis]
    );

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ error: 'Failed to analyze URL' });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await db.query(
      'SELECT * FROM analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM analyses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
}; 