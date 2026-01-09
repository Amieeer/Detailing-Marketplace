const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updateSchema() {
    const client = await pool.connect();

    try {
        console.log('🔄 Updating database schema...\n');

        // Add new columns to bookings table
        console.log('Adding columns to bookings table...');

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS notes TEXT
        `);
        console.log('✅ Added notes column');

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS declined_reason TEXT
        `);
        console.log('✅ Added declined_reason column');

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS started_at TIMESTAMP
        `);
        console.log('✅ Added started_at column');

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
        `);
        console.log('✅ Added completed_at column');

        console.log('\n🎉 Database schema updated successfully!');
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
