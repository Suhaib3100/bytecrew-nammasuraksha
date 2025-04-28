const db = require('../config/database');
const { checkPhishingUrl } = require('../services/phishingService');

exports.checkUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const result = await checkPhishingUrl(url);
    
    // Save check result to database
    await db.query(
      'INSERT INTO phishing_checks (url, is_phishing, confidence, created_at) VALUES ($1, $2, $3, NOW())',
      [url, result.isPhishing, result.confidence]
    );

    res.json(result);
  } catch (error) {
    console.error('Error checking URL for phishing:', error);
    res.status(500).json({ error: 'Failed to check URL for phishing' });
  }
};

exports.reportPhishing = async (req, res) => {
  try {
    const { url, description, evidence } = req.body;
    
    await db.query(
      'INSERT INTO phishing_reports (url, description, evidence, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [url, description, evidence, 'pending']
    );

    res.json({ success: true, message: 'Phishing site reported successfully' });
  } catch (error) {
    console.error('Error reporting phishing site:', error);
    res.status(500).json({ error: 'Failed to report phishing site' });
  }
};

exports.getPhishingStats = async (req, res) => {
  try {
    const [
      totalReports,
      verifiedPhishing,
      recentReports
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM phishing_reports'),
      db.query('SELECT COUNT(*) FROM phishing_reports WHERE status = \'verified\''),
      db.query('SELECT COUNT(*) FROM phishing_reports WHERE created_at >= NOW() - INTERVAL \'7 days\'')
    ]);

    res.json({
      totalReports: totalReports.rows[0].count,
      verifiedPhishing: verifiedPhishing.rows[0].count,
      recentReports: recentReports.rows[0].count
    });
  } catch (error) {
    console.error('Error fetching phishing statistics:', error);
    res.status(500).json({ error: 'Failed to fetch phishing statistics' });
  }
};

exports.getReportedSites = async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    let query = 'SELECT * FROM phishing_reports';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reported sites:', error);
    res.status(500).json({ error: 'Failed to fetch reported sites' });
  }
}; 