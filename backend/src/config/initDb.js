const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function initializeDatabase() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Connect to the database and execute the SQL
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sqlContent);
            await client.query('COMMIT');
            console.log('Database schema initialized successfully!');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the initialization
initializeDatabase(); 