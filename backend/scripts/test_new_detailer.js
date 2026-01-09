const axios = require('axios');

async function testNewDetailerRegistration() {
    try {
        console.log('🧪 Testing New Detailer Registration...\n');

        const testEmail = `newdetailer${Date.now()}@test.com`;
        const testPassword = 'password123';

        // Register new detailer
        console.log('1️⃣ Registering new detailer:', testEmail);
        const registerRes = await axios.post('http://10.0.0.166:3000/api/auth/register', {
            email: testEmail,
            password: testPassword,
            role: 'detailer',
            phone_number: '555-0123'
        });

        console.log('✅ Registration successful!');
        console.log('User ID:', registerRes.data.id);

        // Login to get token
        const loginRes = await axios.post('http://10.0.0.166:3000/api/auth/login', {
            email: testEmail,
            password: testPassword
        });

        const token = loginRes.data.token;

        // Get user profile
        console.log('\n2️⃣ Fetching user profile...');
        const profileRes = await axios.get('http://10.0.0.166:3000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = profileRes.data.profile;

        console.log('\n✅ Profile Created:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Rating:', profile.rating || 0);
        console.log('Jobs Completed:', profile.jobs_completed || 0);
        console.log('Business Name:', profile.business_name || '(not set)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (profile.rating === 0 && profile.jobs_completed === 0) {
            console.log('\n✅ SUCCESS: New detailer starts with 0 rating and 0 jobs!');
        } else {
            console.log('\n⚠️  WARNING: Default values not set correctly');
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testNewDetailerRegistration();
