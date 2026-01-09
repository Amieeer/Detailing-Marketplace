const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createCustomerReviewsTable() {
    const client = await pool.connect();

    try {
        console.log('🔄 Creating customer_reviews table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_reviews (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
                detailer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(booking_id)
            );
        `);
        console.log('✅ customer_reviews table created');

        // Create indexes for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer ON customer_reviews(customer_id);
        `);
        console.log('✅ Index created on customer_id');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_reviews_detailer ON customer_reviews(detailer_id);
        `);
        console.log('✅ Index created on detailer_id');

        // Add customer_rating column to users table
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_rating NUMERIC(3,2) DEFAULT 0;
        `);
        console.log('✅ customer_rating column added to users table');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

createCustomerReviewsTable();
