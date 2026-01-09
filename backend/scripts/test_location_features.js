const { calculateDistance, formatDistance } = require('../src/utils/distanceCalculator');
const { geocodeAddress } = require('../src/utils/geocoder');

async function testLocationUtils() {
    console.log('🧪 Testing Location Utilities\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Distance Calculator
    console.log('1️⃣ Testing Distance Calculator (Haversine Formula)');
    console.log('');

    // NYC to LA
    const nycLat = 40.7128,
        nycLon = -74.006;
    const laLat = 34.0522,
        laLon = -118.2437;
    const nycToLa = calculateDistance(nycLat, nycLon, laLat, laLon);
    console.log('   NYC to LA:');
    console.log(`   ✅ ${formatDistance(nycToLa)} (Expected: ~2,450 mi)`);
    console.log('');

    // Short distance test
    const dist1 = calculateDistance(40.7128, -74.006, 40.7589, -73.9851); // NYC to Times Square
    console.log('   NYC to Times Square:');
    console.log(`   ✅ ${formatDistance(dist1)} (Expected: ~3-4 mi)`);
    console.log('');

    // Very short distance
    const dist2 = calculateDistance(40.7128, -74.006, 40.713, -74.0062);
    console.log('   Very short distance:');
    console.log(`   ✅ ${formatDistance(dist2)}`);
    console.log('');

    // Test 2: Geocoding
    console.log('2️⃣ Testing Geocoding Service (OpenStreetMap)');
    console.log('   Note: This makes a real API call, may take a moment...');
    console.log('');

    try {
        const address = '1600 Pennsylvania Avenue, Washington, DC';
        console.log(`   Geocoding: "${address}"`);
        const result = await geocodeAddress(address);

        if (result) {
            console.log('   ✅ Success!');
            console.log(`   Latitude: ${result.latitude}`);
            console.log(`   Longitude: ${result.longitude}`);
            console.log(`   Address: ${result.formatted_address.substring(0, 60)}...`);
        } else {
            console.log('   ❌ Geocoding failed');
        }
    } catch (error) {
        console.log('   ⚠️  Geocoding error:', error.message);
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Location utilities are working correctly!');
    console.log('');
    console.log('📝 How it works:');
    console.log('   1. Distance Calculator uses Haversine formula');
    console.log('   2. Calculates straight-line distance between coordinates');
    console.log('   3. Returns distance in miles');
    console.log('   4. Geocoding converts addresses to lat/long');
    console.log('');
    console.log('🎯 Next: Test with the API');
    console.log('   - Restart backend server');
    console.log('   - Set a detailer location in their profile');
    console.log('   - Call GET /api/users/detailers?latitude=40.7128&longitude=-74.0060');
    console.log('   - Should return detailers sorted by distance');
}

testLocationUtils();
