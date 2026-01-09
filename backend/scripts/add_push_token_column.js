const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function addPushTokenColumn() {
    try {
        console.log('Adding push_token column to users table...');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS push_token TEXT;
        `);

        console.log('Successfully added push_token column.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await pool.end();
    }
}

addPushTokenColumn();
