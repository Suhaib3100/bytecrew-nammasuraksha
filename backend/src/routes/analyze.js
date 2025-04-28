const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { analyzeWebpage } = require('../services/webpageAnalysisService');
const { analyzeMessageContent } = require('../services/messageAnalysisService');
const { saveAnalysis } = require('../services/analysisService');

// Analyze webpage content
router.post('/webpage', async (req, res) => {
  try {
    const { url, content, userId } = req.body;

    if (!url || !content) {
      return res.status(400).json({
        success: false,
        error: 'URL and content are required'
      });
    }

    const analysis = await analyzeWebpage(url, content);
    await saveAnalysis(analysis, userId);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing webpage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze webpage',
      details: error.message
    });
  }
});

// Analyze URL for threats
router.post('/url', analyzeController.analyzeUrl);

// Get analysis history
router.get('/history', analyzeController.getAnalysisHistory);

// Get specific analysis result
router.get('/:id', analyzeController.getAnalysisById);

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

module.exports = router; 