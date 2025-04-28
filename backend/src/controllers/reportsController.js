const db = require('../config/database');
const { generateReport } = require('../services/reportService');

exports.getAllReports = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await db.query(
      'SELECT * FROM reports ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { type, parameters } = req.body;
    const report = await generateReport(type, parameters);
    
    // Save report to database
    const result = await db.query(
      'INSERT INTO reports (type, parameters, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [type, parameters, report]
    );

    res.json({ 
      success: true, 
      reportId: result.rows[0].id,
      report 
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = result.rows[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
    res.send(report.content);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
}; 