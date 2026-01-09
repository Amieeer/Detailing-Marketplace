const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updateSchema() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding created_at to services table...');

        await client.query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
        `);
        console.log('✅ Added created_at column');
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema();
