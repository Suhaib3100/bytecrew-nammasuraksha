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

// CORS configuration for Expo development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006', // Expo web
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Local network IPs
      /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Local network IPs
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Local network IPs
    ];

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/quick/domain/analyze - Domain analysis endpoint');
    console.log('- POST /api/virustotal/analyze-url - VirusTotal URL analysis');
    console.log('- POST /api/safebrowsing/check-url - Google Safe Browsing check');
    console.log('- GET /health - Health check endpoint');
}); 