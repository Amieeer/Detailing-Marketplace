const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Adding profile_picture_url column to profiles table...');
        await db.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT');
        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
