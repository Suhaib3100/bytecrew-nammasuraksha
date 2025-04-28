const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');

// Analyze webpage content
router.post('/webpage', analyzeController.analyzeWebpage);

// Analyze URL for threats
router.post('/url', analyzeController.analyzeUrl);

// Get analysis history
router.get('/history', analyzeController.getAnalysisHistory);

// Get specific analysis result
router.get('/:id', analyzeController.getAnalysisById);

module.exports = router; 