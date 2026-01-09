const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createTestCustomer() {
    try {
        const email = 'testcustomer@test.com';
        const password = 'password123';

        // Check if customer already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            console.log('✅ Customer already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Now create a completed booking for this customer
            await createCompletedBooking(existingUser.rows[0].id);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create customer
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role) 
             VALUES ($1, $2, 'customer') 
             RETURNING *`,
            [email, hashedPassword]
        );

        const customer = result.rows[0];

        console.log('✅ Test customer created!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Create a completed booking for this customer
        await createCompletedBooking(customer.id);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

async function createCompletedBooking(customerId) {
    try {
        // Get detailer
        const detailerRes = await pool.query(
            "SELECT id FROM users WHERE role = 'detailer' LIMIT 1"
        );
        if (detailerRes.rows.length === 0) {
            console.log('⚠️  No detailer found - skipping booking creation');
            return;
        }
        const detailerId = detailerRes.rows[0].id;

        // Get service
        const serviceRes = await pool.query(
            'SELECT * FROM services WHERE detailer_id = $1 LIMIT 1',
            [detailerId]
        );
        if (serviceRes.rows.length === 0) {
            console.log('⚠️  No service found - skipping booking creation');
            return;
        }
        const service = serviceRes.rows[0];

        // Create completed booking
        const bookingRes = await pool.query(
            `INSERT INTO bookings 
             (customer_id, detailer_id, service_id, scheduled_time, location_address, total_price, status)
             VALUES ($1, $2, $3, NOW() - INTERVAL '1 day', $4, $5, 'completed') 
             RETURNING *`,
            [customerId, detailerId, service.id, '123 Test St, Test City', service.price]
        );

        console.log('\n✅ Completed booking created!');
        console.log('Service:', service.name);
        console.log('Price: $' + bookingRes.rows[0].total_price);
        console.log('\n📱 NOW YOU CAN:');
        console.log('1. Login as: testcustomer@test.com');
        console.log('2. Password: password123');
        console.log('3. Go to "My Bookings"');
        console.log('4. Click "⭐ Write Review" on the completed booking\n');
    } catch (error) {
        console.error('Error creating booking:', error.message);
    }
}

createTestCustomer();
