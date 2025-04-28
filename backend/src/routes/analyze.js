const express = require('express');
const router = express.Router();
const { analyzeMessageContent } = require('../services/messageAnalysisService');
const { saveAnalysis } = require('../services/analysisService');

// Analyze message for threats
router.post('/message', async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    const analysis = await analyzeMessageContent(content);
    await saveAnalysis(analysis, userId);

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
});

// Get analysis history
router.get('/history', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await db.query(
      'SELECT * FROM message_analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// Get specific analysis result
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM message_analyses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

module.exports = router; 