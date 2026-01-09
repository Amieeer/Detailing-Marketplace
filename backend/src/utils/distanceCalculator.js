/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Validate inputs
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return null;
    }

    const R = 3959; // Earth's radius in miles (use 6371 for kilometers)

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
function formatDistance(distance) {
    if (distance === null || distance === undefined) {
        return 'Distance unavailable';
    }

    if (distance < 0.1) {
        return 'Less than 0.1 mi';
    }

    if (distance < 1) {
        return `${distance.toFixed(1)} mi`;
    }

    return `${distance.toFixed(1)} mi`;
}

/**
 * Convert miles to kilometers
 */
function milesToKm(miles) {
    return miles * 1.60934;
}

module.exports = {
    calculateDistance,
    formatDistance,
    milesToKm
};
