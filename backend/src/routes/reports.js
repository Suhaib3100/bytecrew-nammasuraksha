const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Get all reports
router.get('/', reportsController.getAllReports);

// Get specific report
router.get('/:id', reportsController.getReportById);

// Generate new report
router.post('/generate', reportsController.generateReport);

// Download report
router.get('/:id/download', reportsController.downloadReport);

module.exports = router; 