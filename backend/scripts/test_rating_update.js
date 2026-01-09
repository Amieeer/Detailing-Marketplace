const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testRatingUpdate() {
    try {
        console.log('🧪 Testing Rating Update System...\n');

        // Get a detailer
        const detailerRes = await pool.query(
            "SELECT id, email FROM users WHERE role = 'detailer' LIMIT 1"
        );
        if (detailerRes.rows.length === 0) {
            console.log('❌ No detailer found');
            await pool.end();
            return;
        }
        const detailer = detailerRes.rows[0];

        console.log('📋 Detailer:', detailer.email);

        // Check current rating in profiles table
        const profileRes = await pool.query('SELECT rating FROM profiles WHERE user_id = $1', [
            detailer.id
        ]);
        console.log(
            'Current rating in profiles:',
            profileRes.rows[0]?.rating || 'No profile found'
        );

        // Check reviews for this detailer
        const reviewsRes = await pool.query('SELECT rating FROM reviews WHERE detailer_id = $1', [
            detailer.id
        ]);
        console.log('Number of reviews:', reviewsRes.rows.length);

        if (reviewsRes.rows.length > 0) {
            const ratings = reviewsRes.rows.map((r) => parseFloat(r.rating));
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            console.log('Individual ratings:', ratings);
            console.log('Calculated average:', avgRating.toFixed(2));
        }

        // Check what the API returns
        const detailersRes = await pool.query(`
            SELECT u.id, u.email, p.business_name, p.rating
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'detailer'
            LIMIT 5
        `);

        console.log('\n📊 Detailers with ratings:');
        detailersRes.rows.forEach((d) => {
            console.log(
                `  - ${d.business_name || d.email}: ${d.rating ? parseFloat(d.rating).toFixed(2) : 'No rating'}`
            );
        });

        console.log('\n✅ Rating system is working if:');
        console.log('   1. Reviews exist for the detailer');
        console.log('   2. Profile rating matches calculated average');
        console.log('   3. Rating appears in the detailers list');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

testRatingUpdate();
