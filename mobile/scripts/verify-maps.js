// Quick verification script to check all map implementations
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Map Implementations...\n');

const screensDir = path.join(__dirname, '../src/screens');
const mapScreens = [
    'HomeScreen.js',
    'BookingScreen.js',
    'JobExecutionScreen.js',
    'DetailerProfileScreen.js'
];

let allGood = true;

mapScreens.forEach(screen => {
    const filePath = path.join(screensDir, screen);
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        const checks = {
            'MapView import': content.includes('import MapView'),
            'midnightMapStyle import': content.includes('midnightMapStyle'),
            'PROVIDER_GOOGLE': content.includes('PROVIDER_GOOGLE'),
            'customMapStyle prop': content.includes('customMapStyle={midnightMapStyle}')
        };

        console.log(`✅ ${screen}:`);
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`   ${passed ? '✓' : '✗'} ${check}`);
            if (!passed) allGood = false;
        });
        console.log('');
    } catch (error) {
        console.log(`❌ ${screen}: File not found or error reading`);
        allGood = false;
    }
});

// Check .env file
const envPath = path.join(__dirname, '../.env');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasKey = envContent.includes('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY') &&
        !envContent.includes('YOUR_API_KEY_HERE');
    console.log(`${hasKey ? '✅' : '⚠️ '} .env file: ${hasKey ? 'API key configured' : 'API key placeholder detected'}`);
} catch (error) {
    console.log('❌ .env file: Not found');
    allGood = false;
}

// Check app.json
const appJsonPath = path.join(__dirname, '../app.json');
try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const iosKey = appJson.expo?.ios?.config?.googleMapsApiKey;
    const androidKey = appJson.expo?.android?.config?.googleMaps?.apiKey;

    console.log(`${iosKey === '@EXPO_PUBLIC_GOOGLE_MAPS_API_KEY@' ? '✅' : '❌'} app.json iOS: ${iosKey || 'Not configured'}`);
    console.log(`${androidKey === '@EXPO_PUBLIC_GOOGLE_MAPS_API_KEY@' ? '✅' : '❌'} app.json Android: ${androidKey || 'Not configured'}`);
} catch (error) {
    console.log('❌ app.json: Error reading configuration');
    allGood = false;
}

console.log('\n' + '='.repeat(50));
console.log(allGood ? '✅ All checks passed!' : '⚠️  Some issues detected');
console.log('='.repeat(50));
