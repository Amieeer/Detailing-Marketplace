const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupVehiclesTable() {
    const client = await pool.connect();

    try {
        console.log('🔄 Creating vehicles table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                make VARCHAR(50) NOT NULL,
                model VARCHAR(50) NOT NULL,
                year INTEGER,
                color VARCHAR(30),
                license_plate VARCHAR(20),
                type VARCHAR(20) DEFAULT 'sedan',
                photo_url TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Vehicles table created');

        // Create index for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
        `);
        console.log('✅ Index created on user_id');
    } catch (error) {
        console.error('❌ Error creating vehicles table:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

setupVehiclesTable();
