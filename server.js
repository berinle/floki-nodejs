// server.js
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Parse the VCAP_SERVICES environment variable
const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');

// Extract PostgreSQL credentials from user-provided service
const pgCredentials = vcapServices['user-provided']?.find(service => service.name === 'mypg')?.credentials;

// Create a new pool instance using credentials from Cloud Foundry
const pool = new Pool({
  user: pgCredentials?.username || process.env.PGUSER,
  host: pgCredentials?.host || process.env.PGHOST,
  database: pgCredentials?.database || process.env.PGDATABASE,
  password: pgCredentials?.password || process.env.PGPASSWORD,
  port: pgCredentials?.port || process.env.PGPORT,
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
