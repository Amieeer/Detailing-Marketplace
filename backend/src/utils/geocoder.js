const axios = require('axios');

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim API
 * Free, no API key required
 */
async function geocodeAddress(address) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'CarDetailingApp/1.0' // Required by Nominatim
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                formatted_address: result.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

/**
 * Reverse geocode coordinates to address
 */
async function reverseGeocode(latitude, longitude) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json'
            },
            headers: {
                'User-Agent': 'CarDetailingApp/1.0'
            }
        });

        if (response.data) {
            return response.data.display_name;
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        return null;
    }
}

module.exports = {
    geocodeAddress,
    reverseGeocode
};
