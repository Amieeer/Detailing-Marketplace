const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// User location from logs: 42.601388, -72.612073
const BASE_LAT = 42.601388;
const BASE_LNG = -72.612073;

async function seedMockDetailers() {
    try {
        const client = await pool.connect();
        console.log('🌱 Seeding 5 mock detailers near user location...');

        const passwordHash = await bcrypt.hash('password123', 10);

        for (let i = 1; i <= 5; i++) {
            const userId = uuidv4();
            const email = `detailer${i}_ma@example.com`;

            // 1. Create User
            await client.query(
                `INSERT INTO users (id, email, password, role, is_verified, phone_number) 
                 VALUES ($1, $2, $3, 'detailer', true, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [userId, email, passwordHash, `555-010${i}`]
            );

            // Get user id if it already existed (in case of conflict)
            const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            const finalUserId = userRes.rows[0].id;

            // 2. Create Profile with location
            // Random offset within ~10km (0.1 deg is roughly 11km)
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;

            const coords = {
                lat: BASE_LAT + latOffset,
                lng: BASE_LNG + lngOffset
            };

            await client.query(
                `INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates, profile_picture_url)
                 VALUES ($1, $2, $3, $4, $5, 30, $6, $7)
                 ON CONFLICT (user_id) DO UPDATE 
                 SET location_coordinates = $6`,
                [
                    finalUserId,
                    `MA Detailer ${i}`,
                    `Expert detailing in Massachusetts area. Service #${i}`,
                    (4 + Math.random()).toFixed(1), // Rating 4.0 - 5.0
                    Math.floor(Math.random() * 100),
                    JSON.stringify(coords),
                    `https://api.dicebear.com/7.x/avataaars/png?seed=${finalUserId}` // Random avatar
                ]
            );

            console.log(
                `✅ Created/Updated ${email} at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
            );
        }

        console.log('🎉 Done seeding!');
        client.release();
    } catch (err) {
        console.error('❌ Error seeding:', err);
    } finally {
        await pool.end();
    }
}

seedMockDetailers();
