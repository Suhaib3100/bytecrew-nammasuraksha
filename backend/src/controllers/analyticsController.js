const db = require('../config/database');

exports.getOverview = async (req, res) => {
  try {
    const [
      totalAnalyses,
      threatStats,
      userActivity,
      geographicalData
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM analyses'),
      db.query('SELECT threat_type, COUNT(*) FROM threats GROUP BY threat_type'),
      db.query('SELECT DATE(created_at) as date, COUNT(*) FROM analyses GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7'),
      db.query('SELECT country, COUNT(*) FROM analyses GROUP BY country')
    ]);

    res.json({
      totalAnalyses: totalAnalyses.rows[0].count,
      threatStats: threatStats.rows,
      userActivity: userActivity.rows,
      geographicalData: geographicalData.rows
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

exports.getThreatStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        threat_type,
        COUNT(*) as count,
        ROUND(AVG(severity)::numeric, 2) as avg_severity
      FROM threats 
      GROUP BY threat_type
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching threat statistics:', error);
    res.status(500).json({ error: 'Failed to fetch threat statistics' });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as analysis_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM analyses 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};

exports.getGeographicalData = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        country,
        COUNT(*) as threat_count,
        COUNT(DISTINCT threat_type) as unique_threat_types
      FROM analyses 
      GROUP BY country
      ORDER BY threat_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching geographical data:', error);
    res.status(500).json({ error: 'Failed to fetch geographical data' });
  }
}; 