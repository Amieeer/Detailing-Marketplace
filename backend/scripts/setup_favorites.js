const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupFavorites() {
    try {
        console.log('🚀 Setting up Favorites table...');

        // Create favorites table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                detailer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, detailer_id)
            );
        `);

        console.log('✅ Favorites table created successfully.');

        // Create index for faster lookups
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        `);
        console.log('✅ Index created.');
    } catch (error) {
        console.error('❌ Error setting up favorites:', error);
    } finally {
        await pool.end();
    }
}

setupFavorites();
