const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool } = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
const analyzeRoutes = require('./routes/analyze');
const quickAnalysisRoutes = require('./routes/quickAnalysis');
const analyticsRoutes = require('./routes/analytics');
const phishingRoutes = require('./routes/phishing');
const reportsRoutes = require('./routes/reports');

app.use('/api/analyze', analyzeRoutes);
app.use('/api/quick', quickAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/phishing', phishingRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅Server is running on port ${PORT}`);
}); 