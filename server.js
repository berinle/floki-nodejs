// server.js
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Create a new pool instance
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch PostgreSQL version
async function fetchPostgresVersion() {
  let client;
  try {
    // Acquire a client from the pool
    client = await pool.connect();
    
    // Execute a query to get the PostgreSQL version
    const res = await client.query('SELECT version()');
    return res.rows[0].version;
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
    throw err;
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

// API endpoint to fetch PostgreSQL version
app.get('/api/version', async (req, res) => {
  try {
    const version = await fetchPostgresVersion();
    res.json({ version });
  } catch (err) {
    console.error('Error fetching PostgreSQL version:', err);
    res.status(500).json({ error: 'Failed to fetch PostgreSQL version' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
