const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkProfilesSchema() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'profiles'
            ORDER BY ordinal_position
        `);

        console.log('📋 Profiles Table Schema:');
        result.rows.forEach((row) => {
            console.log(
                `  - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`
            );
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkProfilesSchema();
