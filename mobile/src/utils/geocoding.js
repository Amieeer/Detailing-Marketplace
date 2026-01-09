

/**
 * Geocode an address to coordinates
 * Uses the backend geocoding service
 */
export const geocodeAddress = async (address) => {
    try {
        // For now, we'll use a simple approach
        // In production, you might want to add a backend endpoint for this
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'CarDetailingApp/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                formatted_address: data[0].display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude, longitude) => {
    if (!latitude || !longitude) return '';
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};
