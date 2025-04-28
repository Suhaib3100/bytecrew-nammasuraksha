const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get overall analytics
router.get('/overview', analyticsController.getOverview);

// Get threat statistics
router.get('/threats', analyticsController.getThreatStats);

// Get user activity analytics
router.get('/activity', analyticsController.getUserActivity);

// Get geographical threat distribution
router.get('/geography', analyticsController.getGeographicalData);

module.exports = router; 