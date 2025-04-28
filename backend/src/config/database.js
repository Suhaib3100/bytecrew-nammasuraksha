const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DB_LINK) {
  console.error('Error: DB_LINK environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DB_LINK,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  } else {
    console.log('Successfully connected to the database');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
