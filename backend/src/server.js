require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool } = require('./config/database');

// Import routes
const analyzeRoutes = require('./routes/analyze');
const quickAnalysisRoutes = require('./routes/quickAnalysis');
const analyticsRoutes = require('./routes/analytics');
const phishingRoutes = require('./routes/phishing');
const reportsRoutes = require('./routes/reports');
const domainAnalysisRoutes = require('./routes/domainAnalysis');
const virusTotalRoutes = require('./routes/virusTotalAnalysis');
const safeBrowsingRoutes = require('./routes/safeBrowsing');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/quick', quickAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/phishing', phishingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/quick/domain', domainAnalysisRoutes);
app.use('/api/virustotal', virusTotalRoutes);
app.use('/api/safebrowsing', safeBrowsingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/quick/domain/analyze - Domain analysis endpoint');
    console.log('- POST /api/virustotal/analyze-url - VirusTotal URL analysis');
    console.log('- POST /api/safebrowsing/check-url - Google Safe Browsing check');
    console.log('- GET /health - Health check endpoint');
}); 