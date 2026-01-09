const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function addImageColumns() {
    try {
        console.log('Adding image columns to tables...');

        // Profiles: profile_picture_url
        await pool.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
        `);
        console.log('Added profile_picture_url to profiles.');

        // Services: image_url
        await pool.query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);
        console.log('Added image_url to services.');

        // Bookings: before_photos, after_photos
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS before_photos TEXT[],
            ADD COLUMN IF NOT EXISTS after_photos TEXT[];
        `);
        console.log('Added photo columns to bookings.');
    } catch (error) {
        console.error('Error adding columns:', error);
    } finally {
        await pool.end();
    }
}

addImageColumns();
