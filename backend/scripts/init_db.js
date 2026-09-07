const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../src/config/db');

async function init() {
  try {
    // enable gen_random_uuid()
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('Database schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema:', err);
    process.exit(1);
  }
}

init();
