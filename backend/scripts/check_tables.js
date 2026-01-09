const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkTables() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public' 
            ORDER BY table_name
        `);
        console.log('📋 Database Tables:');
        result.rows.forEach((row) => console.log('  -', row.table_name));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();
