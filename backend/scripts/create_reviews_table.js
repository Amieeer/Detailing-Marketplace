const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createReviewsTable() {
    const client = await pool.connect();

    try {
        console.log('🔄 Creating reviews table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
                customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                detailer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(booking_id)
            );
        `);
        console.log('✅ Reviews table created');

        // Create index for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_reviews_detailer ON reviews(detailer_id);
        `);
        console.log('✅ Index created on detailer_id');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
        `);
        console.log('✅ Index created on customer_id');
    } catch (error) {
        console.error('❌ Error creating reviews table:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

createReviewsTable();
