const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setTestLocations() {
    try {
        console.log('🔄 Setting test locations for detailers...\n');

        // Set location for first detailer (NYC)
        const result1 = await pool.query(`
            UPDATE profiles 
            SET latitude = 40.7128, longitude = -74.0060 
            WHERE user_id = (
                SELECT id FROM users WHERE role = 'detailer' AND email = 'detailer123@test.com'
            )
            RETURNING user_id
        `);

        if (result1.rows.length > 0) {
            console.log('✅ Set detailer123@test.com location:');
            console.log('   📍 New York City (40.7128, -74.0060)');
        }

        // If there are more detailers, set different locations
        const allDetailers = await pool.query(`
            SELECT u.id, u.email 
            FROM users u 
            WHERE u.role = 'detailer' 
            AND u.email != 'detailer123@test.com'
            LIMIT 2
        `);

        if (allDetailers.rows.length > 0) {
            // Set second detailer to LA
            await pool.query(
                `
                UPDATE profiles 
                SET latitude = 34.0522, longitude = -118.2437 
                WHERE user_id = $1
            `,
                [allDetailers.rows[0].id]
            );
            console.log(`✅ Set ${allDetailers.rows[0].email} location:`);
            console.log('   📍 Los Angeles (34.0522, -118.2437)');
        }

        if (allDetailers.rows.length > 1) {
            // Set third detailer to Chicago
            await pool.query(
                `
                UPDATE profiles 
                SET latitude = 41.8781, longitude = -87.6298 
                WHERE user_id = $1
            `,
                [allDetailers.rows[1].id]
            );
            console.log(`✅ Set ${allDetailers.rows[1].email} location:`);
            console.log('   📍 Chicago (41.8781, -87.6298)');
        }

        console.log('\n🎯 Test the API:');
        console.log('   GET /api/users/detailers?latitude=40.7128&longitude=-74.0060');
        console.log('   (Should show NYC detailer first with 0.0 mi distance)');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

setTestLocations();
