const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const CREDENTIALS = {
    email: 'testcustomer@test.com',
    password: 'password123'
};

async function runTest() {
    try {
        console.log('🚀 Starting Favorites API Test...\n');

        // 1. Login
        console.log('1️⃣  Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const { token } = loginRes.data;
        console.log('   ✅ Login successful!');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get Detailers to find one to favorite
        console.log('\n2️⃣  Fetching Detailers...');
        const detailersRes = await axios.get(`${API_URL}/users/detailers`, config);
        if (detailersRes.data.length === 0) {
            console.log('   ⚠️ No detailers found to test with.');
            return;
        }
        const detailerId = detailersRes.data[0].id;
        console.log(`   ✅ Found detailer: ${detailerId}`);

        // 3. Toggle Favorite (Add)
        console.log('\n3️⃣  Adding Favorite...');
        const addRes = await axios.post(`${API_URL}/favorites/toggle`, { detailerId }, config);
        console.log(
            `   ✅ Response: ${addRes.data.message} (isFavorite: ${addRes.data.isFavorite})`
        );

        // 4. Check Favorite Status
        console.log('\n4️⃣  Checking Status...');
        const checkRes = await axios.get(`${API_URL}/favorites/check/${detailerId}`, config);
        console.log(`   ✅ isFavorite: ${checkRes.data.isFavorite}`);

        // 5. Get Favorites List
        console.log('\n5️⃣  Fetching Favorites List...');
        const listRes = await axios.get(`${API_URL}/favorites`, config);
        console.log(`   ✅ Favorites count: ${listRes.data.length}`);
        const found = listRes.data.find((f) => f.id === detailerId);
        if (found) console.log('   ✅ Detailer found in list.');

        // 6. Toggle Favorite (Remove)
        console.log('\n6️⃣  Removing Favorite...');
        const removeRes = await axios.post(`${API_URL}/favorites/toggle`, { detailerId }, config);
        console.log(
            `   ✅ Response: ${removeRes.data.message} (isFavorite: ${removeRes.data.isFavorite})`
        );

        console.log('\n✨ All favorite tests passed successfully!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error.response?.data?.message || error.message);
    }
}

runTest();
