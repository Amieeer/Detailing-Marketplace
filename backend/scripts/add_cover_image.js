const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function addCoverImageColumn() {
    try {
        console.log('🚀 Adding cover_image column to users table...');

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS cover_image TEXT;
        `);

        console.log('✅ cover_image column added successfully.');
    } catch (error) {
        console.error('❌ Error adding cover_image column:', error);
    } finally {
        await pool.end();
    }
}

addCoverImageColumn();
