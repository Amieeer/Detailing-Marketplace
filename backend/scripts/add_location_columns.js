const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function addLocationColumns() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding location columns...\n');

        // Add latitude and longitude to profiles table
        console.log('1️⃣ Adding location columns to profiles table...');
        await client.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
            ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
        `);
        console.log('✅ Profiles table updated\n');

        // Add latitude and longitude to bookings table
        console.log('2️⃣ Adding location columns to bookings table...');
        await client.query(`
            ALTER TABLE bookings
            ADD COLUMN IF NOT EXISTS location_latitude NUMERIC(10, 8),
            ADD COLUMN IF NOT EXISTS location_longitude NUMERIC(11, 8);
        `);
        console.log('✅ Bookings table updated\n');

        console.log('✅ All location columns added successfully!');
        console.log('\nColumns added:');
        console.log('  - profiles.latitude');
        console.log('  - profiles.longitude');
        console.log('  - bookings.location_latitude');
        console.log('  - bookings.location_longitude');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

addLocationColumns();
