const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const migrationPath = path.join(__dirname, '../src/db/migrations/20260106_create_refresh_tokens.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        const client = await pool.connect();

        console.log('--- Running Migration: Create Refresh Tokens ---');
        await client.query(sql);
        console.log('Successfully applied migration.');

        client.release();
    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
