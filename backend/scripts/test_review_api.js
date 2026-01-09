const axios = require('axios');

async function testReviewAPI() {
    try {
        console.log('🧪 Testing Review API...\n');

        // First, login as the test customer to get a token
        console.log('1️⃣ Logging in as testcustomer@test.com...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'testcustomer@test.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful! Token received.\n');

        // Get the customer's bookings
        console.log('2️⃣ Fetching bookings...');
        const bookingsRes = await axios.get('http://localhost:3000/api/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const completedBookings = bookingsRes.data.filter((b) => b.status === 'completed');
        console.log(`✅ Found ${completedBookings.length} completed booking(s)\n`);

        if (completedBookings.length === 0) {
            console.log('❌ No completed bookings found');
            return;
        }

        const booking = completedBookings[0];
        console.log('Booking ID:', booking.id);
        console.log('Service:', booking.service_name);
        console.log('Has Review:', booking.has_review);
        console.log('');

        if (booking.has_review) {
            console.log('⚠️  This booking already has a review');
            return;
        }

        // Try to create a review
        console.log('3️⃣ Submitting review...');
        const reviewRes = await axios.post(
            'http://localhost:3000/api/reviews',
            {
                booking_id: booking.id,
                rating: 5,
                comment: 'Test review - excellent service!',
                is_anonymous: false
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('✅ Review submitted successfully!');
        console.log('Review ID:', reviewRes.data.id);
        console.log('Rating:', reviewRes.data.rating);
        console.log('Comment:', reviewRes.data.comment);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testReviewAPI();
