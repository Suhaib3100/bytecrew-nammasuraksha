const db = require('../config/database');
const { analyzeWebpageContent, analyzeUrl } = require('../services/analysisService');

exports.analyzeWebpage = async (req, res) => {
  try {
    const { content, url } = req.body;
    const analysis = await analyzeWebpageContent(content, url);
    
    // Save analysis to database
    await db.query(
      'INSERT INTO analyses (url, content, result, created_at) VALUES ($1, $2, $3, NOW())',
      [url, content, analysis]
    );

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing webpage:', error);
    res.status(500).json({ error: 'Failed to analyze webpage' });
  }
};

exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const analysis = await analyzeUrl(url);
    
    // Save analysis to database
    await db.query(
      'INSERT INTO url_analyses (url, result, created_at) VALUES ($1, $2, NOW())',
      [url, analysis]
    );

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ error: 'Failed to analyze URL' });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await db.query(
      'SELECT * FROM analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM analyses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
}; 