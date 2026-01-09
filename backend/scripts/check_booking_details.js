const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkBookingDetails() {
    try {
        const result = await pool.query(`
            SELECT 
                b.id as booking_id,
                b.status,
                b.total_price,
                b.scheduled_time,
                c.email as customer_email,
                d.email as detailer_email,
                p.business_name as detailer_business_name,
                s.name as service_name
            FROM bookings b
            JOIN users c ON b.customer_id = c.id
            JOIN users d ON b.detailer_id = d.id
            LEFT JOIN profiles p ON d.id = p.user_id
            JOIN services s ON b.service_id = s.id
            WHERE c.email = 'testcustomer@test.com'
            ORDER BY b.created_at DESC
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const booking = result.rows[0];
            console.log('✅ Booking Details:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Booking ID:', booking.booking_id);
            console.log('Status:', booking.status);
            console.log('Service:', booking.service_name);
            console.log('Price: $' + parseFloat(booking.total_price).toFixed(2));
            console.log('Scheduled:', new Date(booking.scheduled_time).toLocaleString());
            console.log('\nCustomer:', booking.customer_email);
            console.log('\nDetailer:', booking.detailer_business_name || booking.detailer_email);
            console.log('Detailer Email:', booking.detailer_email);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n✅ YES - The booking is connected to an existing detailer!');
            console.log('\n📝 After you submit a review:');
            console.log("   - The review will appear on this detailer's profile");
            console.log("   - The detailer's average rating will be recalculated");
            console.log('   - You can view it by browsing detailers and selecting this one\n');
        } else {
            console.log('❌ No booking found for testcustomer@test.com');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkBookingDetails();
