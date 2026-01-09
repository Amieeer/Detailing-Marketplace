import * as Location from 'expo-location';

class LocationService {
    constructor() {
        this.currentLocation = null;
        this.permissionGranted = false;
    }

    /**
     * Request location permissions
     */
    async requestPermissions() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            this.permissionGranted = status === 'granted';
            return this.permissionGranted;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    }

    /**
     * Get current location
     */
    async getCurrentLocation() {
        try {
            if (!this.permissionGranted) {
                const granted = await this.requestPermissions();
                if (!granted) {
                    return null;
                }
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            this.currentLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            return this.currentLocation;
        } catch (error) {
            console.error('Error getting current location:', error);
            return null;
        }
    }

    /**
     * Get cached location (doesn't request new location)
     */
    getCachedLocation() {
        return this.currentLocation;
    }

    /**
     * Check if location permissions are granted
     */
    async checkPermissions() {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            this.permissionGranted = status === 'granted';
            return this.permissionGranted;
        } catch (error) {
            console.error('Error checking location permissions:', error);
            return false;
        }
    }

    /**
     * Calculate distance between two coordinates in miles
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const R = 3959; // Radius of Earth in miles
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Format distance for display
     */
    formatDistance(distance) {
        if (distance === null || distance === undefined) {
            return '';
        }

        if (distance < 0.1) {
            return 'Less than 0.1 mi';
        }

        if (distance < 1) {
            return `${distance.toFixed(1)} mi`;
        }

        return `${distance.toFixed(1)} mi away`;
    }
    /**
     * Geocode an address string to coordinates
     */
    async geocodeAddress(address) {
        try {
            if (!this.permissionGranted) {
                const granted = await this.requestPermissions();
                if (!granted) {
                    return null;
                }
            }

            const result = await Location.geocodeAsync(address);
            if (result && result.length > 0) {
                return {
                    latitude: result[0].latitude,
                    longitude: result[0].longitude,
                };
            }
            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    }
}

// Export singleton instance
export default new LocationService();
