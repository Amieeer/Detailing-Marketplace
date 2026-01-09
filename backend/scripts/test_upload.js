const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const IMAGE_PATH = path.join(__dirname, 'test_image.png');

// 1x1 PNG Base64
const PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';

async function runTest() {
    try {
        // 1. Create dummy image
        fs.writeFileSync(IMAGE_PATH, Buffer.from(PNG_BASE64, 'base64'));
        console.log('Created test_image.png');

        // 2. Register/Login User
        const email = `uploader_${Date.now()}@test.com`;
        const password = 'password123';

        console.log(`Registering user: ${email}`);
        let token;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Upload Tester',
                email,
                password,
                role: 'customer'
            });
            token = regRes.data.token;
        } catch (e) {
            console.log('Registration failed, trying login...');
            // In case user exists (unlikely with timestamp)
        }

        if (!token) {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            token = loginRes.data.token;
        }
        console.log('Got Auth Token');

        // 3. Upload Image
        const formData = new FormData();
        formData.append('image', fs.createReadStream(IMAGE_PATH));

        console.log('Uploading image...');
        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload Success!');
        console.log('Image URL:', uploadRes.data.url);
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    } finally {
        // Cleanup
        if (fs.existsSync(IMAGE_PATH)) {
            fs.unlinkSync(IMAGE_PATH);
            console.log('Cleaned up test_image.png');
        }
    }
}

runTest();
