const PDFDocument = require('pdfkit');
const db = require('../config/database');

exports.generateReport = async (type, parameters) => {
  try {
    let reportContent;
    
    switch (type) {
      case 'analysis':
        reportContent = await generateAnalysisReport(parameters);
        break;
      case 'phishing':
        reportContent = await generatePhishingReport(parameters);
        break;
      case 'threat':
        reportContent = await generateThreatReport(parameters);
        break;
      default:
        throw new Error('Invalid report type');
    }
    
    return reportContent;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

async function generateAnalysisReport(parameters) {
  const { analysisId } = parameters;
  
  // Get analysis data from database
  const analysis = await db.query('SELECT * FROM analyses WHERE id = $1', [analysisId]);
  if (analysis.rows.length === 0) {
    throw new Error('Analysis not found');
  }
  
  const doc = new PDFDocument();
  const chunks = [];
  
  doc.on('data', chunk => chunks.push(chunk));
  
  // Add report header
  doc.fontSize(20).text('Security Analysis Report', { align: 'center' });
  doc.moveDown();
  
  // Add analysis details
  doc.fontSize(14).text('Analysis Details');
  doc.fontSize(12).text(`URL: ${analysis.rows[0].url}`);
  doc.text(`Date: ${new Date(analysis.rows[0].created_at).toLocaleString()}`);
  doc.moveDown();
  
  // Add threat analysis
  doc.fontSize(14).text('Threat Analysis');
  const threats = JSON.parse(analysis.rows[0].result).threats;
  threats.forEach(threat => {
    doc.fontSize(12).text(`- ${threat.type}: ${threat.description}`);
  });
  doc.moveDown();
  
  // Add recommendations
  doc.fontSize(14).text('Recommendations');
  doc.fontSize(12).text('Based on the analysis, we recommend:');
  doc.text('- Keep your security software up to date');
  doc.text('- Be cautious when clicking on links');
  doc.text('- Report any suspicious activity');
  
  doc.end();
  
  return Buffer.concat(chunks);
}

async function generatePhishingReport(parameters) {
  const { url, analysis } = parameters;
  
  const doc = new PDFDocument();
  const chunks = [];
  
  doc.on('data', chunk => chunks.push(chunk));
  
  // Add report header
  doc.fontSize(20).text('Phishing Analysis Report', { align: 'center' });
  doc.moveDown();
  
  // Add URL details
  doc.fontSize(14).text('URL Analysis');
  doc.fontSize(12).text(`URL: ${url}`);
  doc.text(`Analysis Date: ${new Date().toLocaleString()}`);
  doc.moveDown();
  
  // Add phishing indicators
  doc.fontSize(14).text('Phishing Indicators');
  const indicators = analysis.indicators;
  Object.entries(indicators).forEach(([key, value]) => {
    doc.fontSize(12).text(`- ${formatIndicatorKey(key)}: ${value ? 'Yes' : 'No'}`);
  });
  doc.moveDown();
  
  // Add confidence score
  doc.fontSize(14).text('Confidence Score');
  doc.fontSize(12).text(`The URL has a phishing confidence score of ${(analysis.confidence * 100).toFixed(2)}%`);
  doc.text(`Conclusion: ${analysis.isPhishing ? 'Likely Phishing' : 'Not Likely Phishing'}`);
  doc.moveDown();
  
  // Add recommendations
  doc.fontSize(14).text('Recommendations');
  doc.fontSize(12).text('Based on the analysis, we recommend:');
  doc.text('- Do not enter any personal information');
  doc.text('- Report this URL to your security team');
  doc.text('- Update your phishing awareness training');
  
  doc.end();
  
  return Buffer.concat(chunks);
}

async function generateThreatReport(parameters) {
  const { threatId } = parameters;
  
  // Get threat data from database
  const threat = await db.query('SELECT * FROM threats WHERE id = $1', [threatId]);
  if (threat.rows.length === 0) {
    throw new Error('Threat not found');
  }
  
  const doc = new PDFDocument();
  const chunks = [];
  
  doc.on('data', chunk => chunks.push(chunk));
  
  // Add report header
  doc.fontSize(20).text('Threat Analysis Report', { align: 'center' });
  doc.moveDown();
  
  // Add threat details
  doc.fontSize(14).text('Threat Details');
  doc.fontSize(12).text(`Type: ${threat.rows[0].threat_type}`);
  doc.text(`Severity: ${threat.rows[0].severity}`);
  doc.text(`Date Detected: ${new Date(threat.rows[0].created_at).toLocaleString()}`);
  doc.moveDown();
  
  // Add impact analysis
  doc.fontSize(14).text('Impact Analysis');
  doc.fontSize(12).text(threat.rows[0].impact_analysis);
  doc.moveDown();
  
  // Add mitigation steps
  doc.fontSize(14).text('Mitigation Steps');
  const steps = JSON.parse(threat.rows[0].mitigation_steps);
  steps.forEach(step => {
    doc.fontSize(12).text(`- ${step}`);
  });
  
  doc.end();
  
  return Buffer.concat(chunks);
}

function formatIndicatorKey(key) {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 