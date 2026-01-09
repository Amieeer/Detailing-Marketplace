const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const CREDENTIALS = {
    email: 'premium.detailing@example.com',
    password: 'detailer123'
};

async function runTest() {
    try {
        console.log('🚀 Starting Detailer Flow Test...\n');

        // 1. Login
        console.log('1️⃣  Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const { token, role } = loginRes.data;
        console.log(`   ✅ Login successful! Token received. Role: ${role}`);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get Dashboard Stats
        console.log('\n2️⃣  Fetching Dashboard Stats...');
        const statsRes = await axios.get(`${API_URL}/detailer/stats`, config);
        console.log('   ✅ Stats received:', JSON.stringify(statsRes.data, null, 2));

        // 3. Get My Services
        console.log('\n3️⃣  Fetching My Services...');
        const servicesRes = await axios.get(`${API_URL}/services/my-services`, config);
        console.log(`   ✅ Services received: ${servicesRes.data.length} services found.`);

        // 4. Add New Service
        console.log('\n4️⃣  Adding New Service...');
        const newService = {
            name: 'Test Service ' + Date.now(),
            description: 'This is a test service created by the verification script.',
            price: 99.99,
            duration_minutes: 120
        };
        const addServiceRes = await axios.post(`${API_URL}/services`, newService, config);
        console.log('   ✅ Service added:', addServiceRes.data.name);
        const newServiceId = addServiceRes.data.id;

        // 5. Update Profile
        console.log('\n5️⃣  Updating Profile...');
        const updateProfileRes = await axios.put(
            `${API_URL}/users/profile`,
            {
                bio: 'Updated bio from test script at ' + new Date().toISOString()
            },
            config
        );
        console.log('   ✅ Profile updated. New bio:', updateProfileRes.data.bio);

        // 6. Cleanup (Delete the test service)
        console.log('\n6️⃣  Cleaning up (Deleting test service)...');
        await axios.delete(`${API_URL}/services/${newServiceId}`, config);
        console.log('   ✅ Test service deleted.');

        console.log('\n✨ All tests passed successfully!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('   Details:', error.response.data);
        }
    }
}

runTest();
