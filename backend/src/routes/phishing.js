const express = require('express');
const router = express.Router();
const phishingController = require('../controllers/phishingController');

// Check URL for phishing
router.post('/check', phishingController.checkUrl);

// Report phishing site
router.post('/report', phishingController.reportPhishing);

// Get phishing statistics
router.get('/stats', phishingController.getPhishingStats);

// Get reported phishing sites
router.get('/reported', phishingController.getReportedSites);

module.exports = router; 