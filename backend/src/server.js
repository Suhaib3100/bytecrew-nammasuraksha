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
const whoisRoutes = require('./routes/whois');

const app = express();

// CORS configuration with more permissive settings
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-Extension-ID',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Extension-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(morgan('dev'));
app.use(express.json());

// Pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Content analysis endpoint
app.post('/api/content/analyze', async (req, res) => {
  try {
    const { content, context, type = 'email' } = req.body;
    
    // Ensure we have complete content to analyze
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'No content provided for analysis'
      });
    }

    const analysis = {
      isSuspicious: false,
      threatLevel: 'safe', // safe, low, medium, high
      reasons: [],
      recommendations: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        contentType: type,
        contentLength: content.length
      }
    };

    // Only analyze complete content, not partial messages
    if (type === 'email') {
      // Email-specific analysis patterns
      const emailThreatPatterns = [
        {
          pattern: /(urgent|immediate)\s+(action|attention|response)\s+required/i,
          level: 'medium',
          reason: "Uses urgency tactics to pressure recipient",
          recommendation: "Legitimate organizations rarely use extreme urgency in emails"
        },
        {
          pattern: /verify.{0,20}(account|identity|password|login)/i,
          level: 'high',
          reason: "Requests account verification or login credentials",
          recommendation: "Never click on links asking to verify your account - go directly to the website"
        },
        {
          pattern: /(bank|paypal|credit.?card).{0,30}(verify|confirm|update)/i,
          level: 'high',
          reason: "Requests financial account verification",
          recommendation: "Financial institutions never ask for sensitive information via email"
        },
        {
          pattern: /suspicious.{0,20}(activity|login|access)/i,
          level: 'medium',
          reason: "Claims suspicious account activity",
          recommendation: "Contact your service provider directly through official channels"
        },
        {
          pattern: /(won|winner|lottery|prize|inheritance).{0,30}(claim|collect)/i,
          level: 'high',
          reason: "Promises unexpected financial rewards",
          recommendation: "Be extremely cautious of unexpected prizes or money offers"
        },
        {
          pattern: /password.{0,20}(expired|reset|change)/i,
          level: 'medium',
          reason: "Password-related request",
          recommendation: "Only reset passwords through the official website"
        }
      ];

      // Analyze complete email content
      let highestThreatLevel = 'safe';
      emailThreatPatterns.forEach(({ pattern, level, reason, recommendation }) => {
        if (pattern.test(content)) {
          analysis.isSuspicious = true;
          if (!analysis.reasons.includes(reason)) {
            analysis.reasons.push(reason);
          }
          if (!analysis.recommendations.includes(recommendation)) {
            analysis.recommendations.push(recommendation);
          }
          
          // Update threat level to highest detected
          if (level === 'high' || (level === 'medium' && highestThreatLevel === 'safe')) {
            highestThreatLevel = level;
          }
        }
      });

      analysis.threatLevel = highestThreatLevel;

      // Check for suspicious URLs
      const urlPattern = /https?:\/\/[^\s<>"]+/g;
      const urls = content.match(urlPattern);
      if (urls) {
        analysis.metadata.urls = urls;
        
        // Check for URL manipulation tactics
        const suspiciousUrlPatterns = [
          {
            pattern: /\.(tk|ml|ga|cf|gq|pw)$/i,
            reason: "Contains URL with suspicious top-level domain",
            recommendation: "Be cautious of links using uncommon domain extensions"
          },
          {
            pattern: /bit\.ly|tinyurl|goo\.gl|t\.co/i,
            reason: "Contains shortened URLs which may hide malicious links",
            recommendation: "Avoid clicking shortened URLs in unexpected emails"
          }
        ];

        urls.forEach(url => {
          suspiciousUrlPatterns.forEach(({ pattern, reason, recommendation }) => {
            if (pattern.test(url)) {
              analysis.isSuspicious = true;
              if (!analysis.reasons.includes(reason)) {
                analysis.reasons.push(reason);
                analysis.recommendations.push(recommendation);
              }
            }
          });
        });
      }

      // Add general safety recommendations if suspicious
      if (analysis.isSuspicious) {
        analysis.recommendations.push(
          "Verify the sender's email address carefully",
          "Do not download unexpected attachments",
          "When in doubt, contact the supposed sender through a known, verified channel"
        );
      }
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({
      success: false,
      error: 'Error analyzing content',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/quick', quickAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/phishing', phishingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/quick/domain', domainAnalysisRoutes);
app.use('/api/virustotal', virusTotalRoutes);
app.use('/api/safebrowsing', safeBrowsingRoutes);
app.use('/api/whois', whoisRoutes);

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
    console.log('- POST /api/content/analyze - Analyze message content');
    console.log('- POST /api/quick/domain/analyze - Domain analysis endpoint');
    console.log('- POST /api/virustotal/analyze-url - VirusTotal URL analysis');
    console.log('- POST /api/safebrowsing/check-url - Google Safe Browsing check');
    console.log('- GET /health - Health check endpoint');
}); 