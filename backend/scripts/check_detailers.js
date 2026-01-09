const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkDetailers() {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count FROM users WHERE role = 'detailer'
        `);
        console.log('✅ Detailers in database:', result.rows[0].count);

        const detailers = await pool.query(`
            SELECT u.email, p.business_name 
            FROM users u 
            LEFT JOIN profiles p ON u.id = p.user_id 
            WHERE u.role = 'detailer'
        `);

        console.log('\n📋 Detailer accounts:');
        detailers.rows.forEach((d) => {
            console.log(`  - ${d.email} (${d.business_name || 'No business name'})`);
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDetailers();
