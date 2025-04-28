const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function initializeDatabase() {
    try {
        // Read the SQL initialization file
        const sqlFile = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL commands
        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase(); 