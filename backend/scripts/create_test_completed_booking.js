const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createTestBooking() {
    try {
        console.log('🔄 Creating test completed booking...\n');

        // Get customer
        const customerRes = await pool.query(
            "SELECT id, email FROM users WHERE role = 'customer' LIMIT 1"
        );
        if (customerRes.rows.length === 0) {
            console.log('❌ No customer found. Please create a customer account first.');
            await pool.end();
            return;
        }
        const customer = customerRes.rows[0];

        // Get detailer
        const detailerRes = await pool.query(
            "SELECT id, email FROM users WHERE role = 'detailer' LIMIT 1"
        );
        if (detailerRes.rows.length === 0) {
            console.log('❌ No detailer found. Please create a detailer account first.');
            await pool.end();
            return;
        }
        const detailer = detailerRes.rows[0];

        // Get or create service
        let serviceRes = await pool.query('SELECT * FROM services WHERE detailer_id = $1 LIMIT 1', [
            detailer.id
        ]);
        let service;

        if (serviceRes.rows.length === 0) {
            const newServiceRes = await pool.query(
                'INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
                [detailer.id, 'Full Detail', 'Complete detailing', 150, 180]
            );
            service = newServiceRes.rows[0];
        } else {
            service = serviceRes.rows[0];
        }

        // Create completed booking - using exact same columns as bookingController
        const bookingRes = await pool.query(
            `INSERT INTO bookings 
             (customer_id, detailer_id, service_id, scheduled_time, location_address, total_price, status)
             VALUES ($1, $2, $3, NOW() - INTERVAL '1 day', $4, $5, $6) 
             RETURNING *`,
            [
                customer.id,
                detailer.id,
                service.id,
                '123 Test St, Test City',
                service.price,
                'completed'
            ]
        );

        const booking = bookingRes.rows[0];

        console.log('✅ TEST BOOKING CREATED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Booking ID:', booking.id);
        console.log('Customer:', customer.email);
        console.log('Detailer:', detailer.email);
        console.log('Service:', service.name);
        console.log('Status:', booking.status);
        console.log('Price: $' + booking.total_price);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🧪 TO TEST REVIEWS:');
        console.log('1. Reload app (press "r" in Expo terminal)');
        console.log('2. Login as customer:', customer.email);
        console.log('3. Go to "My Bookings"');
        console.log('4. Find the completed booking');
        console.log('5. Click "⭐ Write Review"');
        console.log('6. Submit a review');
        console.log('7. Check detailer profile to see the review\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

createTestBooking();
