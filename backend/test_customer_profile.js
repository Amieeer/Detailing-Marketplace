const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCustomerProfile() {
    try {
        // 1. Register a new customer
        const email = `testcustomer${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering customer: ${email}`);

        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            role: 'customer',
            phone_number: '1234567890'
        });

        const token = registerRes.data.token;
        console.log('Registered successfully. Token:', token);

        // 2. Update profile
        console.log('Updating profile...');
        const updateRes = await axios.put(
            `${API_URL}/users/profile`,
            {
                business_name: 'Test Customer Name', // Mapped to business_name in DB for now
                bio: 'I love clean cars!',
                profile_picture_url: 'http://example.com/pic.jpg'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('Update response:', updateRes.data);

        // 3. Fetch profile
        console.log('Fetching profile...');
        const meRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = meRes.data.profile;
        console.log('Fetched profile:', profile);

        if (
            profile.business_name === 'Test Customer Name' &&
            profile.profile_picture_url === 'http://example.com/pic.jpg'
        ) {
            console.log('TEST PASSED: Profile updated successfully');
        } else {
            console.error('TEST FAILED: Profile data mismatch');
        }
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testCustomerProfile();
