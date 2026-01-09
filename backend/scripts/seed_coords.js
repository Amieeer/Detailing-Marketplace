const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedCoords() {
    try {
        const client = await pool.connect();

        console.log('--- Seeding Coordinates ---');

        // Get all profiles
        const profiles = await client.query('SELECT user_id FROM profiles');

        // Base location (Boston, MA)
        const baseLat = 42.3601;
        const baseLng = -71.0589;

        for (const profile of profiles.rows) {
            // Generate random offset
            const latOffset = (Math.random() - 0.5) * 0.1; // +/- ~5km
            const lngOffset = (Math.random() - 0.5) * 0.1;

            const coords = {
                lat: baseLat + latOffset,
                lng: baseLng + lngOffset
            };

            await client.query('UPDATE profiles SET location_coordinates = $1 WHERE user_id = $2', [
                JSON.stringify(coords),
                profile.user_id
            ]);
            console.log(`Updated profile ${profile.user_id} with coords:`, coords);
        }

        console.log('--- Done ---');
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

seedCoords();
