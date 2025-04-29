const express = require('express');
const router = express.Router();
const QuickAnalysisService = require('../services/quickAnalysisService');
const { isValidDomain } = require('../utils/validators');

// Quick domain analysis endpoint
router.post('/domain', async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({
                success: false,
                error: 'Domain is required'
            });
        }

        if (!isValidDomain(domain)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid domain format'
            });
        }

        const analysis = await QuickAnalysisService.analyzeDomain(domain);
        
        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('Error in quick domain analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze domain',
            details: error.message
        });
    }
});

module.exports = router; 